import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep, items }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'shipping.calculateShipping');
      return res.json();
    } catch {
      console.warn('[shipping.calculateShipping] API not available, using mock fallback');
      const { mockCalculateShipping } = await import('@/lib/mocks/shipping.mock');
      return mockCalculateShipping(cep, items);
    }
  } catch (error) { handleServiceError(error, 'shipping.calculateShipping'); }
}

export async function createShipment(orderId: string, carrier: string): Promise<Shipment> {
  try {
    if (isMock()) {
      const { mockCreateShipment } = await import('@/lib/mocks/shipping.mock');
      return mockCreateShipment(orderId, carrier);
    }
    try {
      const res = await fetch('/api/shipping/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, carrier }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'shipping.createShipment');
      return res.json();
    } catch {
      console.warn('[shipping.createShipment] API not available, using mock fallback');
      const { mockCreateShipment } = await import('@/lib/mocks/shipping.mock');
      return mockCreateShipment(orderId, carrier);
    }
  } catch (error) { handleServiceError(error, 'shipping.createShipment'); }
}

export async function trackShipment(trackingCode: string): Promise<Shipment> {
  try {
    if (isMock()) {
      const { mockTrackShipment } = await import('@/lib/mocks/shipping.mock');
      return mockTrackShipment(trackingCode);
    }
    try {
      const res = await fetch(`/api/shipping/track/${trackingCode}`);
      if (!res.ok) throw new ServiceError(res.status, 'shipping.trackShipment');
      return res.json();
    } catch {
      console.warn('[shipping.trackShipment] API not available, using mock fallback');
      const { mockTrackShipment } = await import('@/lib/mocks/shipping.mock');
      return mockTrackShipment(trackingCode);
    }
  } catch (error) { handleServiceError(error, 'shipping.trackShipment'); }
}

export async function getShipmentStatus(orderId: string): Promise<Shipment> {
  try {
    if (isMock()) {
      const { mockGetShipmentStatus } = await import('@/lib/mocks/shipping.mock');
      return mockGetShipmentStatus(orderId);
    }
    try {
      const res = await fetch(`/api/shipping/orders/${orderId}/shipment`);
      if (!res.ok) throw new ServiceError(res.status, 'shipping.getShipmentStatus');
      return res.json();
    } catch {
      console.warn('[shipping.getShipmentStatus] API not available, using mock fallback');
      const { mockGetShipmentStatus } = await import('@/lib/mocks/shipping.mock');
      return mockGetShipmentStatus(orderId);
    }
  } catch (error) { handleServiceError(error, 'shipping.getShipmentStatus'); }
}
