// ============================================================
// BlackBelt v2 — Store Types
// Products, cart items, orders
// ============================================================

export type ProductCategory = 'quimono' | 'faixa' | 'equipamento' | 'acessorio' | 'vestuario' | 'suplemento';
export type ProductStatus = 'active' | 'draft' | 'out_of_stock';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface Product {
  id: string;
  academy_id: string;
  name: string;
  description: string;
  images: string[];
  category: ProductCategory;
  price: number;
  compare_at_price?: number;
  variants: ProductVariant[];
  stock_total: number;
  low_stock_alert: number;
  status: ProductStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  variant_id: string;
  variant_name: string;
  unit_price: number;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  academy_id: string;
  student_id: string;
  student_name: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment_method: 'PIX' | 'cartao' | 'boleto';
  created_at: string;
  updated_at: string;
}
