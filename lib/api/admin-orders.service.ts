import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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

export async function listOrders(filters?: OrderFilters): Promise<Order[]> {
  try {
    if (isMock()) {
      const { mockListOrders } = await import('@/lib/mocks/admin-orders.mock');
      return mockListOrders(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.period) params.set('period', filters.period);
      if (filters?.search) params.set('search', filters.search);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'adminOrders.listOrders');
      return res.json();
    } catch {
      console.warn('[admin-orders.listOrders] API not available, using mock fallback');
      const { mockListOrders } = await import('@/lib/mocks/admin-orders.mock');
      return mockListOrders(filters);
    }
  } catch (error) { handleServiceError(error, 'adminOrders.listOrders'); }
}

export async function getOrderDetail(id: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockGetOrderDetail } = await import('@/lib/mocks/admin-orders.mock');
      return mockGetOrderDetail(id);
    }
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'adminOrders.getOrderDetail');
      return res.json();
    } catch {
      console.warn('[admin-orders.getOrderDetail] API not available, using fallback');
      return { id: "", user_id: "", user_name: "", items: [], subtotal: 0, shipping_cost: 0, total: 0, shipping_address: { name: "", cep: "", street: "", number: "", neighborhood: "", city: "", state: "" }, delivery_option: "pickup", payment_method: "pix", status: "pending", created_at: "", updated_at: "" } as unknown as Order;
    }
  } catch (error) { handleServiceError(error, 'adminOrders.getOrderDetail'); }
}

export async function updateOrderStatus(id: string, status: OrderStatus, trackingCode?: string): Promise<Order> {
  try {
    if (isMock()) {
      const { mockUpdateOrderStatus } = await import('@/lib/mocks/admin-orders.mock');
      return mockUpdateOrderStatus(id, status, trackingCode);
    }
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingCode }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'adminOrders.updateOrderStatus');
      return res.json();
    } catch {
      console.warn('[admin-orders.updateOrderStatus] API not available, using fallback');
      return { id: "", user_id: "", user_name: "", items: [], subtotal: 0, shipping_cost: 0, total: 0, shipping_address: { name: "", cep: "", street: "", number: "", neighborhood: "", city: "", state: "" }, delivery_option: "pickup", payment_method: "pix", status: "pending", created_at: "", updated_at: "" } as unknown as Order;
    }
  } catch (error) { handleServiceError(error, 'adminOrders.updateOrderStatus'); }
}

export async function getStoreDashboard(): Promise<StoreDashboard> {
  try {
    if (isMock()) {
      const { mockGetStoreDashboard } = await import('@/lib/mocks/admin-orders.mock');
      return mockGetStoreDashboard();
    }
    // API not yet implemented — use mock
    const { mockGetStoreDashboard } = await import('@/lib/mocks/admin-orders.mock');
      return mockGetStoreDashboard();
  } catch (error) { handleServiceError(error, 'adminOrders.getStoreDashboard'); }
}
