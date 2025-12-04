import React, { useState, useEffect } from 'react';
import { Product, Category, CATEGORIES } from '../types';

interface HomeViewProps {
  products: Product[];
  onCategorySelect: (category: Category) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ products, onCategorySelect }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slider
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(products.length, 5)); // Limit to first 5 items
    }, 4000);
    return () => clearInterval(interval);
  }, [products]);

  const featuredProducts = products.slice(0, 5);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-24 w-full">
      
      {/* Hero Slider */}
      {featuredProducts.length > 0 && (
        <div className="relative w-full h-64 md:h-[400px] overflow-hidden group">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-full h-full relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <div className="max-w-7xl mx-auto">
                    <span className="inline-block px-2 py-1 bg-primary text-background-dark text-xs font-bold rounded mb-2">
                      Destacado
                    </span>
                    <h2 className="text-2xl md:text-4xl font-bold">{product.name}</h2>
                    <p className="opacity-90 text-sm md:text-base mt-1 max-w-lg">{product.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Slider Indicators */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            {featuredProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Explorar Categorías</h3>
          <button 
            onClick={() => onCategorySelect('Todo')}
            className="text-primary text-sm font-medium hover:underline"
          >
            Ver todo
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {CATEGORIES.filter(c => c !== 'Todo').map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className="relative overflow-hidden rounded-xl h-24 group hover:shadow-lg transition-all"
            >
              <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors" />
              {/* Decorative circle */}
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/20 rounded-full group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative h-full flex flex-col justify-center pl-4 items-start z-10">
                <span className="material-symbols-outlined text-3xl mb-1 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                  {getCategoryIcon(category)}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{category}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Company Info Footer */}
      <section className="mt-auto bg-slate-900 text-slate-300 py-10 px-6 rounded-t-3xl shadow-inner w-full">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-white text-xl font-bold mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">storefront</span>
            Catálogo Estilo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">location_on</span>
              <div>
                <p className="font-semibold text-white text-base mb-1">Dirección Principal</p>
                <p>Av. Reforma 123, Torre Empresarial</p>
                <p>Ciudad de México, México</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">call</span>
              <div>
                <p className="font-semibold text-white text-base mb-1">Atención al Cliente</p>
                <p>+52 55 1234 5678</p>
                <p className="text-slate-500 text-xs mt-1">Lun-Vie, 9am - 6pm</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">chat</span>
              <div>
                <p className="font-semibold text-white text-base mb-1">WhatsApp</p>
                <p>+52 55 9876 5432</p>
                <p className="text-slate-500 text-xs mt-1">Respuesta rápida</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">mail</span>
              <div>
                <p className="font-semibold text-white text-base mb-1">Correo Electrónico</p>
                <p>contacto@catalogoestilo.com</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-700 text-center text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} Catálogo Estilo. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
              <a href="#" className="hover:text-primary transition-colors">Términos</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper for category icons
function getCategoryIcon(category: string): string {
  switch (category) {
    case 'Cocina': return 'skillet';
    case 'Decoración': return 'local_florist';
    case 'Jardín': return 'deck';
    case 'Textil': return 'checkroom';
    case 'Baño': return 'bathtub';
    default: return 'category';
  }
}