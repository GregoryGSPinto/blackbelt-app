import { isMock } from '@/lib/env';
import type { Order, OrderStatus } from '@/lib/api/orders.service';

export interface OrderFilters {
  status?: OrderStatus;
  period?: 'today' | 'week' | 'month' | 'all';
  search?: string;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface StoreDashboard {
  orders_month: number;
  revenue: number;
  avg_ticket: number;
  top_products: TopProduct[];
}

const EMPTY_ORDER = { id: '', user_id: '', user_name: '', items: [], subtotal: 0, shipping_cost: 0, total: 0, shipping_address: { name: '', cep: '', street: '', number: '', neighborhood: '', city: '', state: '' }, delivery_option: 'pickup', payment_method: 'pix', status: 'pending', created_at: '', updated_at: '' } as unknown as Order;

export async function listOrders(filters?: OrderFilters): Promise<Order[]> {
  try {
    if (isMock()) {
      const { mockListOrders } = await import('@/lib/mocks/admin-orders.mock');
      return mockListOrders(filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('user_name', `%${filters.search}%`);

    const { data, error } = await query;

    if (error || !data) {
      console.error('[listOrders] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as Order[];
  } catch (error) {
    console.error('[listOrders] Fallback:', error);
    return [];
  }
}

export async function getOrderDetail(id: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockGetOrderDetail } = await import('@/lib/mocks/admin-orders.mock');
      return mockGetOrderDetail(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[getOrderDetail] Supabase error:', error?.message);
      return { ...EMPTY_ORDER, id };
    }

    return data as unknown as Order;
  } catch (error) {
    console.error('[getOrderDetail] Fallback:', error);
    return { ...EMPTY_ORDER, id };
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus, trackingCode?: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockUpdateOrderStatus } = await import('@/lib/mocks/admin-orders.mock');
      return mockUpdateOrderStatus(id, status, trackingCode);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = { status };
    if (trackingCode) updatePayload.tracking_code = trackingCode;

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('[updateOrderStatus] Supabase error:', error?.message);
      return { ...EMPTY_ORDER, id, status };
    }

    return data as unknown as Order;
  } catch (error) {
    console.error('[updateOrderStatus] Fallback:', error);
    return { ...EMPTY_ORDER, id, status };
  }
}

export async function getStoreDashboard(): Promise<StoreDashboard> {
  try {
    if (isMock()) {
      const { mockGetStoreDashboard } = await import('@/lib/mocks/admin-orders.mock');
      return mockGetStoreDashboard();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', monthStart);

    if (error || !data) {
      console.error('[getStoreDashboard] Supabase error:', error?.message);
      return { orders_month: 0, revenue: 0, avg_ticket: 0, top_products: [] };
    }

    const orders = data as Record<string, unknown>[];
    const revenue = orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const count = orders.length;

    return {
      orders_month: count,
      revenue,
      avg_ticket: count > 0 ? Math.round(revenue / count) : 0,
      top_products: [],
    };
  } catch (error) {
    console.error('[getStoreDashboard] Fallback:', error);
    return { orders_month: 0, revenue: 0, avg_ticket: 0, top_products: [] };
  }
}
