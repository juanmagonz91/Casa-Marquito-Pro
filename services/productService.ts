
import { Product } from '../types';

// En producción, cambia esto por tu URL de Render
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.warn("Backend not accessible. Check your Render URL or local server.", error);
      return [];
    }
  },

  submitOrder: async (orderData: any): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to submit order');
      return await response.json();
    } catch (error) {
      console.error("Error submitting order", error);
      throw error;
    }
  },

  validateCoupon: async (code: string, subtotal: number): Promise<any> => {
    // Cupones fallback para desarrollo u offline
    const FALLBACK_COUPONS: Record<string, any> = {
      'MARQUITO10': { type: 'percent', value: 10, description: '10% de descuento' },
      'BIENVENIDO15': { type: 'percent', value: 15, description: '15% de descuento de bienvenida' },
      'ENVIOGRATIS': { type: 'shipping', value: 0, description: 'Envío gratuito' },
      'MARQUITO20': { type: 'percent', value: 20, description: '20% de descuento especial' },
    };

    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) throw new Error(data.message || 'Cupón no válido.');
      return data;
    } catch (error: any) {
      const coupon = FALLBACK_COUPONS[code.toUpperCase()];
      if (!coupon) throw new Error('Cupón no válido o expirado.');
      const discountAmount = coupon.type === 'percent' ? parseFloat((subtotal * coupon.value / 100).toFixed(2)) : 0;
      return {
        valid: true,
        code: code.toUpperCase(),
        ...coupon,
        discountAmount,
        shippingFree: coupon.type === 'shipping',
        message: `¡Cupón aplicado! ${coupon.description}`
      };
    }
  },
};
