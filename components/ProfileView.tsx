import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Order, Address } from '../types';

interface ProfileViewProps {
  onLogout: () => void;
  orders: Order[];
  addresses: Address[];
  onUpdateAddresses: (addresses: Address[]) => void;
}

type ProfileSection = 'menu' | 'orders' | 'addresses';

export const ProfileView: React.FC<ProfileViewProps> = ({
  onLogout,
  orders,
  addresses,
  onUpdateAddresses
}) => {
  const [currentSection, setCurrentSection] = useState<ProfileSection>('menu');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const user = authService.getCurrentUser();

  // Handler for mock interactions
  const handleFeatureNotReady = (feature: string) => {
    alert(`La función "${feature}" estará disponible próximamente.`);
  };

  const handleAddAddress = () => {
    const newId = addresses.length + 1;
    const newAddress: Address = {
      id: newId,
      label: 'Trabajo',
      line1: `Calle Nueva ${newId}, Oficina ${newId}0`,
      line2: 'Ciudad de México, CDMX 11000'
    };
    onUpdateAddresses([...addresses, newAddress]);
    alert('Nueva dirección añadida correctamente.');
  };

  // --- Sub-components for specific sections ---

  const OrdersView = () => {
    const STATUS_MAP: Record<string, { label: string; icon: string; color: string }> = {
      pending: { label: 'Pendiente Pago', icon: 'schedule', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
      paid: { label: 'Pago Confirmado', icon: 'check_circle', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
      shipped: { label: 'En Camino', icon: 'local_shipping', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
      delivered: { label: 'Entregado', icon: 'inventory_2', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    };

    return (
      <div className="space-y-4 animate-in slide-in-from-right duration-300">
        <h3 className="text-lg font-bold mb-4 px-4">Historial de Pedidos</h3>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
            <p>Aún no has realizado pedidos.</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP['pending'];
            return (
              <div key={order.id} className="bg-white dark:bg-slate-800 p-4 mx-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Pedido #{order.id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${statusInfo.color}`}>
                    <span className="material-symbols-outlined text-xs" style={{ fontSize: '13px' }}>{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  {new Date(order.date).toLocaleDateString()} • {order.items.length} Artículos
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                  <span className="font-bold text-slate-900 dark:text-white">${order.total.toFixed(2)}</span>
                  <button
                    onClick={() => handleFeatureNotReady('Detalles del Pedido')}
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            )
          }))
        }
      </div>
    );
  };


  const AddressView = () => (
    <div className="space-y-4 animate-in slide-in-from-right duration-300">
      <h3 className="text-lg font-bold mb-4 px-4">Mis Direcciones</h3>
      {addresses.map((addr) => (
        <div key={addr.id} className="bg-white dark:bg-slate-800 p-4 mx-4 rounded-xl shadow-sm border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{addr.label}</span>
              <p className="font-medium text-slate-800 dark:text-white mt-1">{addr.line1}</p>
              <p className="text-sm text-slate-500">{addr.line2}</p>
            </div>
            <button
              onClick={() => handleFeatureNotReady('Editar Dirección')}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={handleAddAddress}
        className="mx-4 w-[calc(100%-2rem)] py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 active:scale-95"
      >
        <span className="material-symbols-outlined">add</span>
        Agregar Nueva Dirección
      </button>
    </div>
  );

  // --- Main Render Logic ---

  if (currentSection !== 'menu') {
    return (
      <div className="pb-24">
        {/* Sub-header */}
        <div className="px-4 py-4 flex items-center gap-2 mb-2">
          <button
            onClick={() => setCurrentSection('menu')}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-semibold text-slate-500 dark:text-slate-400">Volver a Perfil</span>
        </div>

        {/* Content Switcher */}
        {currentSection === 'orders' && <OrdersView />}
        {currentSection === 'addresses' && <AddressView />}
      </div>
    );
  }

  // --- Menu View ---

  const menuItems: { icon: string; label: string; subtitle: string; section: ProfileSection }[] = [
    {
      icon: 'shopping_bag',
      label: 'Mis Pedidos',
      subtitle: 'Ver historial de compras',
      section: 'orders'
    },
    {
      icon: 'location_on',
      label: 'Direcciones',
      subtitle: 'Gestionar direcciones de envío',
      section: 'addresses'
    }
  ];

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 relative min-h-[calc(100vh-140px)]">

      {/* Header Profile */}
      <div className="bg-white dark:bg-slate-800 p-6 shadow-sm mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">
              {user?.isGuest ? 'sentiment_satisfied' : 'person'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.name || 'Usuario'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {user?.isGuest ? 'Cuenta de invitado' : (user?.email || 'Sin correo')}
            </p>
            {!user?.isGuest && (
              <button
                onClick={() => handleFeatureNotReady('Editar Perfil')}
                className="text-primary text-xs font-bold mt-1 hover:underline text-left"
              >
                Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-4 space-y-3">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(item.section)}
            className="w-full flex items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div className="ml-4 text-left flex-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{item.label}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-8">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">Versión 1.0.1</p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
              ¿Cerrar Sesión?
            </h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              Se borrarán los datos temporales de tu carrito y favoritos.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};