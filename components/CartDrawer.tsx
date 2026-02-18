import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = async () => {
    setIsProcessing(true);
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onCheckout();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tu Carrito</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
                <span className="material-symbols-outlined text-6xl">shopping_cart_off</span>
                <p className="font-medium">El carrito está vacío</p>
                <button
                  onClick={onClose}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  Seguir comprando
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl animate-in slide-in-from-right-4 duration-300">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{item.name}</h3>
                      <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="text-sm font-semibold w-4 text-center dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 z-10">
              {/* Discount Progress Banner */}
              {total < 100 ? (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <span className="material-symbols-outlined text-base mt-0.5">local_offer</span>
                  <div>
                    <p className="font-bold mb-0.5">¡10% de Descuento!</p>
                    <p className="opacity-90">Agregá <strong>${(100 - total).toFixed(2)}</strong> más para aplicar un descuento del 10% en tu total.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <span className="material-symbols-outlined text-base mt-0.5">celebration</span>
                  <div>
                    <p className="font-bold mb-0.5">¡Descuento Aplicado!</p>
                    <p className="opacity-90">Tu compra supera los $100. Se te aplicará un <strong>10% de descuento</strong> al finalizar.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 dark:text-slate-400">Total</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckoutClick}
                disabled={isProcessing}
                className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Proceder al Pago</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};