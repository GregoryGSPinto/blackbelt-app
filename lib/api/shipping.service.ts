import { isMock } from '@/lib/env';

export interface ShippingItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  weight_kg?: number;
}

export interface ShippingOption {
  carrier: string;
  service: string;
  price: number;
  delivery_days: number;
}

export type ShipmentStatus = 'created' | 'posted' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';

export interface ShipmentEvent {
  status: ShipmentStatus;
  description: string;
  location: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  carrier: string;
  service: string;
  tracking_code: string;
  status: ShipmentStatus;
  estimated_delivery: string;
  events: ShipmentEvent[];
  created_at: string;
}

export async function calculateShipping(cep: string, items: ShippingItem[]): Promise<ShippingOption[]> {
  try {
    if (isMock()) {
      const { mockCalculateShipping } = await import('@/lib/mocks/shipping.mock');
      return mockCalculateShipping(cep, items);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.functions.invoke('calculate-shipping', {
      body: { cep, items },
    });
    if (error || !data) {
      console.error('[calculateShipping] Supabase error:', error?.message);
      const { mockCalculateShipping } = await import('@/lib/mocks/shipping.mock');
      return mockCalculateShipping(cep, items);
    }
    return data as ShippingOption[];
  } catch (error) {
    console.error('[calculateShipping] Fallback:', error);
    const { mockCalculateShipping } = await import('@/lib/mocks/shipping.mock');
    return mockCalculateShipping(cep, items);
  }
}

export async function createShipment(orderId: string, carrier: string): Promise<Shipment> {
  try {
    if (isMock()) {
      const { mockCreateShipment } = await import('@/lib/mocks/shipping.mock');
      return mockCreateShipment(orderId, carrier);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('shipments')
      .insert({ order_id: orderId, carrier, status: 'created' })
      .select()
      .single();
    if (error || !data) {
      console.error('[createShipment] Supabase error:', error?.message);
      const { mockCreateShipment } = await import('@/lib/mocks/shipping.mock');
      return mockCreateShipment(orderId, carrier);
    }
    return data as Shipment;
  } catch (error) {
    console.error('[createShipment] Fallback:', error);
    const { mockCreateShipment } = await import('@/lib/mocks/shipping.mock');
    return mockCreateShipment(orderId, carrier);
  }
}

export async function trackShipment(trackingCode: string): Promise<Shipment> {
  try {
    if (isMock()) {
      const { mockTrackShipment } = await import('@/lib/mocks/shipping.mock');
      return mockTrackShipment(trackingCode);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_code', trackingCode)
      .single();
    if (error || !data) {
      console.error('[trackShipment] Supabase error:', error?.message);
      const { mockTrackShipment } = await import('@/lib/mocks/shipping.mock');
      return mockTrackShipment(trackingCode);
    }
    return data as Shipment;
  } catch (error) {
    console.error('[trackShipment] Fallback:', error);
    const { mockTrackShipment } = await import('@/lib/mocks/shipping.mock');
    return mockTrackShipment(trackingCode);
  }
}

export async function getShipmentStatus(orderId: string): Promise<Shipment> {
  try {
    if (isMock()) {
      const { mockGetShipmentStatus } = await import('@/lib/mocks/shipping.mock');
      return mockGetShipmentStatus(orderId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) {
      console.error('[getShipmentStatus] Supabase error:', error?.message);
      const { mockGetShipmentStatus } = await import('@/lib/mocks/shipping.mock');
      return mockGetShipmentStatus(orderId);
    }
    return data as Shipment;
  } catch (error) {
    console.error('[getShipmentStatus] Fallback:', error);
    const { mockGetShipmentStatus } = await import('@/lib/mocks/shipping.mock');
    return mockGetShipmentStatus(orderId);
  }
}
