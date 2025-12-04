import React from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onAddToCart(product);
    // Optional: Close modal on add, or keep open. Keeping open is usually better for UX.
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black transition-colors backdrop-blur-md"
        >
          <span className="material-symbols-outlined text-slate-800 dark:text-white">close</span>
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 dark:bg-slate-800 relative group">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="mb-auto">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-primary bg-primary/10 rounded-full uppercase">
              {product.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {product.name}
            </h2>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              ${product.price.toFixed(2)}
            </p>
            
            <div className="prose dark:prose-invert">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-2">Descripción</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                {product.description}
                <br /><br />
                Este producto ha sido seleccionado cuidadosamente por su calidad y diseño. Ideal para renovar tus espacios con un toque moderno y elegante.
              </p>
            </div>
            
            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg text-green-500">check_circle</span>
                <span>En Stock</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg text-blue-500">local_shipping</span>
                <span>Envío a todo el país</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleAddToCart}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};