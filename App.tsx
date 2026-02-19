
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Category, Order, Address } from './types';
import { productService } from './services/productService';
import { emailService } from './services/emailService';
import { authService } from './services/authService';
import { ProductCard } from './components/ProductCard';
import { CategoryFilter } from './components/CategoryFilter';
import { CartDrawer } from './components/CartDrawer';
import { HomeView } from './components/HomeView';
import { ProfileView } from './components/ProfileView';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessView } from './components/OrderSuccessView';
import { ProductDetailModal } from './components/ProductDetailModal';

// Helper to load initial state safely
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// Helper for accent-insensitive search
const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

type ViewState = 'home' | 'catalog' | 'profile' | 'checkout' | 'success';

const App: React.FC = () => {
  // --- Data State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Persisted States
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('cart', []));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders', []));
  const [addresses, setAddresses] = useState<Address[]>(() => loadFromStorage('addresses', [
    { id: 1, label: 'Casa', line1: 'Av. Reforma 123, Depto 4B', line2: 'Ciudad de México, CDMX 06600' }
  ]));

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todo');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [lastRecommendations, setLastRecommendations] = useState<Product[]>([]);
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);

  // --- Effects ---

  // Initialize App (Auto-login guest & fetch products)
  useEffect(() => {
    // 1. Listen for Auth Changes
    const unsubscribeAuth = authService.onAuthChange((authUser) => {
      setUser(authUser);
      if (!authUser) {
        // Entrar como invitado si no hay sesión
        authService.loginAsGuest();
      }
    });

    // 2. Fetch Products
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => unsubscribeAuth();
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('addresses', JSON.stringify(addresses));
  }, [addresses]);

  // --- Logic / Handlers ---

  const handleLogout = () => {
    // In a non-login app, "Logout" just clears local data
    authService.logout();
    setCart([]);
    setOrders([]);
    setAddresses([]); // Clear addresses
    // Re-initialize guest immediately
    authService.loginAsGuest();
    setCurrentView('home');
    alert("Se han borrado tus datos locales.");
  };

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      // Verificar stock disponible
      if (currentQty >= product.stock) {
        // No agregar si ya se alcanzó el stock máximo
        return prevCart;
      }
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (shippingData: any) => {
    // 1. Calculate Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const baseShipping = subtotal > 50 ? 0 : 9.99;
    // Descuento por volumen del 10% si el subtotal supera $100
    const discount = subtotal >= 100 ? parseFloat((subtotal * 0.10).toFixed(2)) : 0;
    // Cupón aplicado desde el checkout
    const appliedCoupon = shippingData.appliedCoupon ?? null;
    const couponDiscount = appliedCoupon?.type !== 'shipping' ? (appliedCoupon?.discountAmount ?? 0) : 0;
    const shipping = appliedCoupon?.shippingFree ? 0 : baseShipping;
    const total = parseFloat((subtotal - discount - couponDiscount + shipping).toFixed(2));
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. Create Order Object
    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString(),
      total: total,
      subtotal,
      discount,
      couponCode: appliedCoupon?.code,
      couponDiscount,
      status: 'pending',
      items: [...cart],
      paymentMethod: 'Transferencia Bancaria'
    };

    // Add extra customer data for backend
    const fullOrderPayload = {
      ...newOrder,
      shippingCost: shipping,
      customerName: shippingData.name,
      customerEmail: shippingData.email,
      customerPhone: shippingData.phone,
      documentNumber: shippingData.documentNumber,
      shippingAddress: shippingData
    };

    // 3. Send to Backend
    await productService.submitOrder(fullOrderPayload);

    // 4. Save Order Locally (for Profile view)
    setOrders(prev => [newOrder, ...prev]);

    // 5. Actualizar stock local de productos
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      return p;
    }));

    // 6. Recommendation Logic: Find products NOT in the cart
    const candidates = products.filter(p => !cart.some(c => c.id === p.id));
    const recommendations = candidates
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    setLastRecommendations(recommendations);

    // 7. Clear and Redirect
    setCart([]);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelectFromHome = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Computed Data ---

  const displayedProducts = useMemo(() => {
    let filtered = products;

    return filtered.filter((product) => {
      // 1. Prepare search terms
      const normSearch = normalizeText(searchQuery);
      const normName = normalizeText(product.name);

      const matchesSearch = normName.includes(normSearch);

      // 2. Filter Logic
      if (!searchQuery) {
        // If no search, strict category filtering
        const matchesCategory = selectedCategory === 'Todo' || product.category === selectedCategory;
        return matchesCategory;
      } else {
        // If searching, ignore category filter to allow global search, 
        // we will warn the user in the UI if results are from other categories
        return matchesSearch;
      }
    });
  }, [products, selectedCategory, searchQuery]);

  // Check if we are showing products from other categories during a search
  const hasCrossCategoryResults = useMemo(() => {
    if (!searchQuery || selectedCategory === 'Todo' || currentView !== 'catalog') return false;

    return displayedProducts.some(p => p.category !== selectedCategory);
  }, [displayedProducts, searchQuery, selectedCategory, currentView]);

  const totalCartItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // --- App Render ---

  // Main Content Renderer
  const renderContent = () => {
    if (currentView === 'home') {
      return (
        <HomeView
          products={products}
          onCategorySelect={handleCategorySelectFromHome}
        />
      );
    }

    if (currentView === 'checkout') {
      return (
        <CheckoutView
          cartItems={cart}
          onPlaceOrder={handlePlaceOrder}
          onBack={() => setCurrentView('catalog')}
        />
      );
    }

    if (currentView === 'success') {
      return (
        <OrderSuccessView
          onContinueShopping={() => setCurrentView('home')}
          recommendedProducts={lastRecommendations}
          onAddToCart={handleAddToCart}
        />
      );
    }

    if (currentView === 'profile') {
      return (
        <div className="max-w-3xl mx-auto w-full">
          <ProfileView
            orders={orders}
            onLogout={handleLogout}
            addresses={addresses}
            onUpdateAddresses={setAddresses}
          />
        </div>
      );
    }

    // Catalog View
    return (
      <main className="px-4 pb-24 flex-grow max-w-7xl mx-auto w-full">
        {/* Cross Category Warning Banner */}
        {hasCrossCategoryResults && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">info</span>
            <div>
              <p className="font-bold text-yellow-800 dark:text-yellow-300 text-sm">
                Resultados de otras categorías
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400/80">
                Aunque estás en <span className="font-bold">"{selectedCategory}"</span>, hemos encontrado productos en otras secciones que coinciden con tu búsqueda "{searchQuery}".
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={setViewedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
            <span className="material-symbols-outlined text-4xl mb-2">
              search_off
            </span>
            <p>
              No se encontraron productos
            </p>
          </div>
        )}
      </main>
    );
  };

  const showHeader = currentView !== 'success';
  const showBottomNav = currentView !== 'checkout' && currentView !== 'success';

  return (
    <div className="w-full bg-background-light dark:bg-background-dark min-h-screen flex flex-col shadow-2xl overflow-hidden relative">

      {/* Cart Drawer Overlay */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleProceedToCheckout}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={viewedProduct}
        isOpen={!!viewedProduct}
        onClose={() => setViewedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm transition-all duration-300 border-b border-transparent dark:border-slate-800">
          <div className="max-w-7xl mx-auto w-full px-4 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              {currentView !== 'home' && (
                <button
                  onClick={() => setCurrentView('home')}
                  className="p-1.5 -ml-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                  aria-label="Volver al inicio"
                >
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
              )}
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span className="bg-primary text-background-dark px-1.5 py-0.5 rounded-md text-sm">CM</span>
                CASA MARQUITO
              </h1>
            </div>

            {currentView !== 'checkout' && (
              <button
                id="cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">shopping_bag</span>
                {totalCartItems > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 animate-in zoom-in duration-300">
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary shadow-sm shadow-primary/50">
                      <span className="absolute inline-flex justify-center items-center h-full w-full rounded-full text-[10px] font-bold text-background-dark">
                        {totalCartItems}
                      </span>
                    </span>
                  </span>
                )}
              </button>
            )}
          </div>
        </header>
      )}

      {/* Filters (Only show on Catalog view) */}
      {currentView === 'catalog' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="max-w-7xl mx-auto w-full">
            {/* Search Bar */}
            <div className="sticky top-[72px] z-10 bg-background-light dark:bg-background-dark px-4 pb-4 pt-2">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg group-focus-within:text-primary transition-colors">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-200 transition-all outline-none"
                  placeholder="Buscar productos..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {renderContent()}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30">
          <div className="flex justify-around items-center h-16 px-4 max-w-lg mx-auto">
            <NavItem
              icon="home"
              label="Inicio"
              active={currentView === 'home'}
              onClick={() => setCurrentView('home')}
            />
            <NavItem
              icon="storefront"
              label="Catálogo"
              active={currentView === 'catalog'}
              onClick={() => setCurrentView('catalog')}
            />
            <NavItem
              icon="person"
              label="Perfil"
              active={currentView === 'profile'}
              onClick={() => setCurrentView('profile')}
            />
          </div>
        </nav>
      )}
    </div>
  );
};

// Helper component for Navigation Items
const NavItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 w-16 ${active ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
      }`}
    onClick={onClick}
  >
    <span className={`material-symbols-outlined transition-transform duration-200 ${active ? 'font-semibold -translate-y-0.5' : ''}`}>{icon}</span>
    <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

export default App;