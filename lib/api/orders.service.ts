import { isMock } from '@/lib/env';

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

const emptyOrder: Order = { id: '', user_id: '', user_name: '', items: [], subtotal: 0, shipping_cost: 0, total: 0, shipping_address: { name: '', cep: '', street: '', number: '', neighborhood: '', city: '', state: '' }, delivery_option: 'pickup', payment_method: 'pix', status: 'pending', created_at: '', updated_at: '' };

export async function createOrder(userId: string, data: CreateOrderData): Promise<Order> {
  try {
    if (isMock()) {
      const { mockCreateOrder } = await import('@/lib/mocks/orders.mock');
      return mockCreateOrder(userId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('orders')
      .insert({ user_id: userId, ...data, status: 'pending' })
      .select()
      .single();
    if (error || !row) {
      console.error('[createOrder] Supabase error:', error?.message);
      return emptyOrder;
    }
    return row as unknown as Order;
  } catch (error) {
    console.error('[createOrder] Fallback:', error);
    return emptyOrder;
  }
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  try {
    if (isMock()) {
      const { mockGetMyOrders } = await import('@/lib/mocks/orders.mock');
      return mockGetMyOrders(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) {
      console.error('[getMyOrders] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as Order[];
  } catch (error) {
    console.error('[getMyOrders] Fallback:', error);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockGetOrderById } = await import('@/lib/mocks/orders.mock');
      return mockGetOrderById(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.error('[getOrderById] Supabase error:', error?.message);
      return emptyOrder;
    }
    return data as unknown as Order;
  } catch (error) {
    console.error('[getOrderById] Fallback:', error);
    return emptyOrder;
  }
}

export async function cancelOrder(id: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockCancelOrder } = await import('@/lib/mocks/orders.mock');
      return mockCancelOrder(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) {
      console.error('[cancelOrder] Supabase error:', error?.message);
      return emptyOrder;
    }
    return data as unknown as Order;
  } catch (error) {
    console.error('[cancelOrder] Fallback:', error);
    return emptyOrder;
  }
}
