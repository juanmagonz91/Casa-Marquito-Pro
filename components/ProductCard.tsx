import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

interface FlyingImageProps {
  src: string;
  startRect: DOMRect;
  targetRect: DOMRect;
  onAnimationEnd: () => void;
}

const FlyingImage: React.FC<FlyingImageProps> = ({ src, startRect, targetRect, onAnimationEnd }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: startRect.top,
    left: startRect.left,
    width: 64,
    height: 64,
    borderRadius: '8px',
    objectFit: 'cover',
    zIndex: 9999,
    pointerEvents: 'none',
    opacity: 1,
    transform: 'scale(1)',
    transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  });

  React.useEffect(() => {
    requestAnimationFrame(() => {
      setStyle(prev => ({
        ...prev,
        top: targetRect.top + (targetRect.height / 2) - 10,
        left: targetRect.left + (targetRect.width / 2) - 10,
        width: 20,
        height: 20,
        opacity: 0.5,
        borderRadius: '50%',
        transform: 'scale(0.5)'
      }));
    });
    const timer = setTimeout(onAnimationEnd, 600);
    return () => clearTimeout(timer);
  }, [targetRect, onAnimationEnd]);

  return createPortal(
    <img src={src} style={style} alt="" className="flying-product" />,
    document.body
  );
};

// Badge de stock
const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0) {
    return (
      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        Sin stock
      </span>
    );
  }
  if (stock <= 3) {
    return (
      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
        ¡Últimas {stock}!
      </span>
    );
  }
  return null;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails
}) => {
  const [flyingAnim, setFlyingAnim] = useState<{ start: DOMRect; target: DOMRect } | null>(null);
  const outOfStock = product.stock === 0;

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (outOfStock) return;

    const btnRect = e.currentTarget.getBoundingClientRect();
    const cartBtn = document.getElementById('cart-btn');
    const targetRect = cartBtn?.getBoundingClientRect();

    if (targetRect) {
      setFlyingAnim({ start: btnRect, target: targetRect });
    }
    onAddToCart(product);
  };

  return (
    <>
      <div className={`bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden group transition-all hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-none ${outOfStock ? 'opacity-70' : ''}`}>
        <div className="relative cursor-pointer" onClick={() => onViewDetails(product)}>
          <img
            alt={product.description}
            className={`w-full h-40 object-cover transform transition-transform duration-500 ${outOfStock ? '' : 'group-hover:scale-110'}`}
            src={product.imageUrl}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Stock Badge */}
          <StockBadge stock={product.stock} />

          {/* Overlay Hint */}
          {!outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                Ver detalles
              </span>
            </div>
          )}
        </div>

        <div className="p-3 relative z-10 bg-white dark:bg-slate-800">
          <h3
            className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onViewDetails(product)}
          >
            {product.name}
          </h3>
          <div className="flex justify-between items-center mt-2">
            <p className="font-bold text-slate-900 dark:text-white">
              ${product.price.toFixed(2)}
            </p>
            <button
              onClick={handleAddToCartClick}
              disabled={outOfStock}
              title={outOfStock ? 'Sin stock disponible' : 'Añadir al carrito'}
              className={`p-1.5 rounded-lg transition-colors active:scale-95 ${outOfStock
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-primary/20 dark:bg-primary/30 text-primary hover:bg-primary hover:text-background-dark'
                }`}
              aria-label={outOfStock ? 'Sin stock' : 'Añadir al carrito'}
            >
              <span className="material-symbols-outlined text-lg">
                {outOfStock ? 'remove_shopping_cart' : 'add'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {flyingAnim && (
        <FlyingImage
          src={product.imageUrl}
          startRect={flyingAnim.start}
          targetRect={flyingAnim.target}
          onAnimationEnd={() => setFlyingAnim(null)}
        />
      )}
    </>
  );
};