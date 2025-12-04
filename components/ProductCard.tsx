import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
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
    width: 64, // Approximate thumbnail size
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
    // Trigger animation next frame
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

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart,
  onViewDetails
}) => {
  const [flyingAnim, setFlyingAnim] = useState<{ start: DOMRect; target: DOMRect } | null>(null);

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent opening modal when clicking add button
    
    // 1. Get button position (start)
    const btnRect = e.currentTarget.getBoundingClientRect();
    
    // 2. Get cart icon position (target)
    const cartBtn = document.getElementById('cart-btn');
    const targetRect = cartBtn?.getBoundingClientRect();

    if (targetRect) {
      // 3. Trigger animation
      setFlyingAnim({ start: btnRect, target: targetRect });
    }

    // 4. Actual Action
    onAddToCart(product);
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden group transition-all hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-none"
      >
        <div className="relative cursor-pointer" onClick={() => onViewDetails(product)}>
          <img 
            alt={product.description} 
            className="w-full h-40 object-cover transform transition-transform duration-500 group-hover:scale-110" 
            src={product.imageUrl} 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className={`absolute top-2 right-2 p-1.5 backdrop-blur-sm rounded-full transition-colors z-10 ${
              isFavorite 
                ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
            }`}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <span className={`material-symbols-outlined text-lg ${isFavorite ? 'font-variation-settings-fill' : ''}`} style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}>
              favorite{isFavorite ? '' : '_border'}
            </span>
          </button>
          
          {/* Overlay Hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
              Ver detalles
            </span>
          </div>
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
              className="p-1.5 bg-primary/20 dark:bg-primary/30 text-primary rounded-lg hover:bg-primary hover:text-background-dark transition-colors active:scale-95"
              aria-label="Añadir al carrito"
            >
              <span className="material-symbols-outlined text-lg">add</span>
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