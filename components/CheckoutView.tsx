import React, { useState } from 'react';
import { CartItem } from '../types';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onPlaceOrder: (shippingData: any) => void;
  onBack: () => void;
}

const PARAGUAY_LOCATIONS: Record<string, string[]> = {
  "Asunción": ["Asunción"],
  "Concepción": ["Concepción", "Belén", "Horqueta", "Loreto", "San Carlos del Apa", "San Lázaro", "Yby Yaú", "Azotey", "Sargento José Félix López", "San Alfredo", "Paso Barreto"],
  "San Pedro": ["San Pedro del Ycuamandiyú", "Antequera", "Choré", "General Elizardo Aquino", "Itacurubí del Rosario", "Lima", "Nueva Germania", "San Estanislao", "San Pablo", "Tacuatí", "Unión", "25 de Diciembre", "General Isidoro Resquín", "Yataity del Norte", "Guayaibí", "Capiibary", "Santa Rosa del Aguaray", "Yrybucuá", "Liberación", "San Vicente Pancholo", "San José del Rosario"],
  "Cordillera": ["Caacupé", "Altos", "Arroyos y Esteros", "Atyrá", "Caraguatay", "Emboscada", "Eusebio Ayala", "Isla Pucú", "Itacurubí de la Cordillera", "Juan de Mena", "Loma Grande", "Mbocayaty del Yhaguy", "Nueva Colombia", "Piribebuy", "Primero de Marzo", "San Bernardino", "Santa Elena", "Tobatí", "Valenzuela", "San José Obrero"],
  "Guairá": ["Villarrica", "Borja", "Capitán Mauricio José Troche", "Coronel Martínez", "Dr. Bottrell", "Félix Pérez Cardozo", "General Eugenio A. Garay", "Independencia", "Itapé", "Iturbe", "José Fassardi", "Mbocayaty", "Natalicio Talavera", "Ñumí", "Paso Yobái", "San Salvador", "Tebicuary", "Yataity"],
  "Caaguazú": ["Coronel Oviedo", "Caaguazú", "Carayaó", "Dr. Cecilio Báez", "Santa Rosa del Mbutuy", "Dr. Juan Manuel Frutos", "Repatriación", "Nueva Londres", "San Joaquín", "San José de los Arroyos", "Yhú", "Dr. J. Eulogio Estigarribia", "R.I. 3 Corrales", "Raúl Arsenio Oviedo", "José Domingo Ocampos", "Mariscal Francisco Solano López", "La Pastora", "3 de Febrero", "Simón Bolívar", "Vaquería", "Tembiaporá", "Nueva Toledo"],
  "Caazapá": ["Caazapá", "Abaí", "Buena Vista", "Dr. Moisés S. Bertoni", "Gral. Higinio Morínigo", "Maciel", "San Juan Nepomuceno", "Tavaí", "Yuty", "3 de Mayo", "Fulgencio Yegros"],
  "Itapúa": ["Encarnación", "Bella Vista", "Cambyretá", "Capitán Meza", "Capitán Miranda", "Nueva Alborada", "Trinidad", "San Miguel", "Hohenau", "Jesús", "General Artigas", "San Pedro del Paraná", "Coronel Bogado", "Carmen del Paraná", "General Delgado", "Mayor Otaño", "San Cosme y Damián", "San Juan del Paraná", "San Rafael del Paraná", "Tomás Romero Pereira", "Yatytay", "Alto Verá", "La Paz", "Obligado", "Pirapó", "Edelira", "Itapúa Poty", "José Leandro Oviedo", "Carlos Antonio López", "Natalio"],
  "Misiones": ["San Juan Bautista", "Ayolas", "San Ignacio", "Santa Maria", "Santa Rosa", "Santiago", "Villa Florida", "Yabebyry", "San Patricio", "San Miguel"],
  "Paraguarí": ["Paraguarí", "Acahay", "Caapucú", "Carapeguá", "Escobar", "Gral. Bernardino Caballero", "La Colmena", "Mbyay", "Pirayú", "Quiindy", "Quyquyhó", "San Roque González de Santa Cruz", "Sapucai", "Tebicuarymí", "Yaguarón", "Ybycuí", "Ybytymí"],
  "Alto Paraná": ["Ciudad del Este", "Presidente Franco", "Domingo Martínez de Irala", "Dr. Juan León Mallorquín", "Hernandarias", "Itakyry", "Juan E. O'Leary", "Ñacunday", "Yguazú", "Los Cedrales", "Minga Guazú", "San Cristóbal", "Santa Rita", "Naranjal", "Santa Rosa del Monday", "Minga Porá", "Mbaracayú", "San Alberto", "Iruña", "Santa Fe del Paraná", "Tavapy", "Dr. Raúl Peña"],
  "Central": ["Areguá", "Capiatá", "Fernando de la Mora", "Guarambaré", "Itá", "Itauguá", "Lambaré", "Limpio", "Luque", "Mariano Roque Alonso", "Nemby", "Nueva Italia", "San Antonio", "San Lorenzo", "Villa Elisa", "Villeta", "Ypacaraí", "Ypané", "J. Augusto Saldívar"],
  "Ñeembucú": ["Pilar", "Alberdi", "Cerrito", "Desmochados", "Gral. José Eduvigis Díaz", "Guazú Cuá", "Humaitá", "Isla Umbú", "Laureles", "Mayor José J. Martínez", "Paso de Patria", "San Juan Bautista del Ñeembucú", "Tacuaras", "Villa Franca", "Villalbín", "Villa Oliva"],
  "Amambay": ["Pedro Juan Caballero", "Bella Vista", "Capitán Bado", "Zanja Pytá", "Karapaí"],
  "Canindeyú": ["Salto del Guairá", "Corpus Christi", "Curuguaty", "Itanará", "La Paloma", "Nueva Esperanza", "Ygatimí", "Ypejhú", "General Francisco Caballero Álvarez", "Katueté", "Maracaná", "Yasy Cañy", "Yby Pytá", "Ybyrarobaná"],
  "Presidente Hayes": ["Villa Hayes", "Benjamín Aceval", "Puerto Pinasco", "Nanawa", "José Falcón", "Teniente Irala Fernández", "Teniente Esteban Martínez", "General José María Bruguez"],
  "Boquerón": ["Filadelfia", "Loma Plata", "Mariscal Estigarribia"],
  "Alto Paraguay": ["Fuerte Olimpo", "Puerto Casado", "Bahía Negra", "Carmelo Peralta"]
};

export const CheckoutView: React.FC<CheckoutViewProps> = ({ cartItems, onPlaceOrder, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',

    city: '',
    documentNumber: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "El nombre es obligatorio.";
        if (/\d/.test(value)) return "El nombre no debe contener números.";
        if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
        break;
      case 'documentNumber':
        if (!value.trim()) return "El CI o RUC es obligatorio.";
        if (value.trim().length < 5) return "El documento debe tener al menos 5 caracteres.";
        break;
      case 'email':
        if (!value.trim()) return "El correo es obligatorio.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Introduce un correo electrónico válido.";
        break;
      case 'phone':
        if (!value.trim()) return "El celular es obligatorio.";
        const digits = value.replace(/\D/g, '');
        if (digits.length < 9) return "El número debe tener al menos 9 dígitos.";
        break;
      case 'address':
        if (!value.trim()) return "La dirección es obligatoria.";
        break;
      case 'department':
        if (!value) return "Selecciona un departamento.";
        break;
      case 'city':
        if (!value) return "Selecciona una ciudad.";
        break;
      default:
        break;
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error if needed, or just let the user see the red fields
      return;
    }

    setLoading(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    onPlaceOrder(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'department') {
      // Reset city when department changes
      setFormData(prev => ({ ...prev, department: value, city: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const availableCities = formData.department ? PARAGUAY_LOCATIONS[formData.department] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
        <button onClick={onBack} className="md:hidden p-1 -ml-1 text-slate-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        Finalizar Compra
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Datos de Envío
            </h3>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  type="text"
                  className={`w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary dark:text-white transition-all ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  placeholder="Ej. Juan Pérez"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CI o RUC</label>
                <input
                  required
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  type="text"
                  className={`w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary dark:text-white transition-all ${errors.documentNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  placeholder="Ej. 1234567 o 80012345-6"
                />
                {errors.documentNumber && (
                  <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.documentNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                  <input
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    type="email"
                    className={`w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary dark:text-white transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    placeholder="juan@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Celular</label>
                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    type="tel"
                    className={`w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary dark:text-white transition-all ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    placeholder="09XX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
                <input
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  type="text"
                  className={`w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary dark:text-white transition-all ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  placeholder="Calle y número de casa/edificio"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departamento</label>
                  <select
                    required
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary dark:text-white transition-all ${errors.department ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                  >
                    <option value="">Selecciona un departamento</option>
                    {Object.keys(PARAGUAY_LOCATIONS).sort().map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.department}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ciudad</label>
                  <select
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={!formData.department}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                  >
                    <option value="">{formData.department ? 'Selecciona una ciudad' : 'Elige departamento primero'}</option>
                    {availableCities.sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </section>

          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
              <span className="material-symbols-outlined text-primary">account_balance</span>
              Información Bancaria
            </h3>

            <div className="space-y-4">
              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">Transferencia SIPAP / Bancaria</p>
                    <p className="text-xs text-slate-500">Sin comisiones adicionales</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 border-dashed">
                    <span className="text-xs uppercase font-bold text-slate-400">Banco</span>
                    <span className="font-semibold">Banco Itaú Paraguay</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 border-dashed">
                    <span className="text-xs uppercase font-bold text-slate-400">Beneficiario</span>
                    <span className="font-semibold text-right">Catálogo Estilo S.A.</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 border-dashed">
                    <span className="text-xs uppercase font-bold text-slate-400">Cuenta</span>
                    <span className="font-mono font-bold select-all bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">720 1234567</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 border-dashed">
                    <span className="text-xs uppercase font-bold text-slate-400">RUC</span>
                    <span className="font-mono font-bold select-all bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">80012345-6</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs uppercase font-bold text-slate-400">Ref / Concepto</span>
                    <span className="font-semibold text-primary">{formData.name ? formData.name.split(' ')[0] : 'Tu Nombre'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-xl border border-blue-100 dark:border-blue-800/30">
                <span className="material-symbols-outlined text-lg mt-0.5">info</span>
                <p>
                  Una vez realizada la transferencia, por favor envía tu comprobante de pago al correo
                  <span className="font-bold mx-1">pagos@catalogoestilo.com.py</span>
                  para procesar el envío.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Resumen del Pedido</h3>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 dark:text-white">{item.name}</p>
                    <p className="text-slate-500">Cant: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Envío</span>
                <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-primary text-background-dark py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Pedido</span>
                  <span className="material-symbols-outlined">check</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              Tus datos están protegidos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};