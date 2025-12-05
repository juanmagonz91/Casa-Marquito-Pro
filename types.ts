export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  items: CartItem[];
  paymentMethod: string;
  documentNumber: string;
}

export interface Address {
  id: number;
  label: string;
  line1: string;
  line2: string;
}

export type Category = 'Todo' | 'Cocina' | 'Decoración' | 'Jardín' | 'Textil' | 'Baño';

export const CATEGORIES: Category[] = ['Todo', 'Cocina', 'Decoración', 'Jardín', 'Textil', 'Baño'];