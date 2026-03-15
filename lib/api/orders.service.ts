import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'boleto' | 'credit_card';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  variant_id: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ShippingAddress {
  name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  delivery_option: 'pickup' | 'shipping';
  payment_method: PaymentMethod;
  status: OrderStatus;
  tracking_code?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  items: { product_id: string; variant_id: string; quantity: number }[];
  shipping_address: ShippingAddress;
  delivery_option: 'pickup' | 'shipping';
  payment_method: PaymentMethod;
  shipping_cost: number;
}

export async function createOrder(userId: string, data: CreateOrderData): Promise<Order> {
  try {
    if (isMock()) {
      const { mockCreateOrder } = await import('@/lib/mocks/orders.mock');
      return mockCreateOrder(userId, data);
    }
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'orders.createOrder');
    return res.json();
  } catch (error) { handleServiceError(error, 'orders.createOrder'); }
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  try {
    if (isMock()) {
      const { mockGetMyOrders } = await import('@/lib/mocks/orders.mock');
      return mockGetMyOrders(userId);
    }
    const res = await fetch(`/api/orders?userId=${userId}`);
    if (!res.ok) throw new ServiceError(res.status, 'orders.getMyOrders');
    return res.json();
  } catch (error) { handleServiceError(error, 'orders.getMyOrders'); }
}

export async function getOrderById(id: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockGetOrderById } = await import('@/lib/mocks/orders.mock');
      return mockGetOrderById(id);
    }
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new ServiceError(res.status, 'orders.getOrderById');
    return res.json();
  } catch (error) { handleServiceError(error, 'orders.getOrderById'); }
}

export async function cancelOrder(id: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockCancelOrder } = await import('@/lib/mocks/orders.mock');
      return mockCancelOrder(id);
    }
    const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new ServiceError(res.status, 'orders.cancelOrder');
    return res.json();
  } catch (error) { handleServiceError(error, 'orders.cancelOrder'); }
}
