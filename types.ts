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

export type Category = 'Todo' | 'Cocina' | 'Decoración' | 'Jardín' | 'Textil' | 'Baño';

export const CATEGORIES: Category[] = ['Todo', 'Cocina', 'Decoración', 'Jardín', 'Textil', 'Baño'];