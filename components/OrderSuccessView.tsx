import React from 'react';
import { Product } from '../types';

interface OrderSuccessViewProps {
  onContinueShopping: () => void;
  recommendedProducts?: Product[];
  onAddToCart?: (product: Product) => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ 
  onContinueShopping, 
  recommendedProducts = [],
  onAddToCart 
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 animate-in zoom-in-95 duration-500">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-6xl text-primary animate-bounce">check_circle</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">¡Gracias por tu compra!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Tu pedido ha sido confirmado. Te hemos enviado un correo electrónico con los detalles y la información para el pago.
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl w-full mb-8 border border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Número de Pedido</p>
          <p className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200">#ORD-{Math.floor(100000 + Math.random() * 900000)}</p>
        </div>

        <button 
          onClick={onContinueShopping}
          className="w-full px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all active:scale-95"
        >
          Seguir Comprando
        </button>
      </div>

      {/* Recommendations Section - Visual Ad */}
      {recommendedProducts.length > 0 && (
        <div className="mt-16 w-full animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">También te podría interesar</h3>
            <p className="text-sm text-slate-500">Basado en tu última compra</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendedProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700">
                <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-primary text-background-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sugerido
                  </div>
                </div>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{product.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-bold text-slate-900 dark:text-white">${product.price.toFixed(2)}</p>
                  {onAddToCart && (
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="text-primary text-xs font-bold hover:underline"
                    >
                      Añadir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};