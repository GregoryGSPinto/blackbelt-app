import type { ShippingOption, ShippingItem, Shipment } from '@/lib/api/shipping.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

function getRegionDays(cep: string): number {
  const prefix = cep.replace(/\D/g, '').slice(0, 2);
  const num = parseInt(prefix, 10);
  // SP: 01-19, RJ: 20-28, MG: 30-39
  if (num >= 1 && num <= 19) return 3;
  if (num >= 20 && num <= 28) return 3;
  if (num >= 30 && num <= 39) return 3;
  return 7;
}

export async function mockCalculateShipping(cep: string, _items: ShippingItem[]): Promise<ShippingOption[]> {
  await delay();
  const baseDays = getRegionDays(cep);
  return [
    { carrier: 'Correios', service: 'PAC', price: baseDays === 3 ? 18.90 : 28.90, delivery_days: baseDays + 2 },
    { carrier: 'Correios', service: 'SEDEX', price: baseDays === 3 ? 32.50 : 45.90, delivery_days: baseDays },
    { carrier: 'Jadlog', service: '.Package', price: baseDays === 3 ? 22.50 : 35.00, delivery_days: baseDays + 1 },
  ];
}

export async function mockCreateShipment(orderId: string, carrier: string): Promise<Shipment> {
  await delay();
  const now = new Date();
  const estimated = new Date(now);
  estimated.setDate(estimated.getDate() + 5);
  return {
    id: `ship-${Date.now()}`,
    order_id: orderId,
    carrier,
    service: carrier === 'Correios' ? 'SEDEX' : '.Package',
    tracking_code: `BR${Math.random().toString(36).substring(2, 11).toUpperCase()}SP`,
    status: 'created',
    estimated_delivery: estimated.toISOString(),
    events: [
      { status: 'created', description: 'Etiqueta de envio criada', location: 'São Paulo, SP', timestamp: now.toISOString() },
    ],
    created_at: now.toISOString(),
  };
}

const MOCK_SHIPMENTS: Record<string, Shipment> = {
  'BR123456789SP': {
    id: 'ship-1', order_id: 'ord-2', carrier: 'Correios', service: 'SEDEX',
    tracking_code: 'BR123456789SP', status: 'in_transit',
    estimated_delivery: '2026-03-18T23:59:59Z',
    events: [
      { status: 'in_transit', description: 'Objeto em trânsito - por favor aguarde', location: 'Curitiba, PR', timestamp: '2026-03-13T14:00:00Z' },
      { status: 'in_transit', description: 'Objeto encaminhado de unidade de tratamento', location: 'São Paulo, SP', timestamp: '2026-03-12T08:00:00Z' },
      { status: 'posted', description: 'Objeto postado', location: 'São Paulo, SP', timestamp: '2026-03-11T10:30:00Z' },
      { status: 'created', description: 'Etiqueta de envio criada', location: 'São Paulo, SP', timestamp: '2026-03-10T16:00:00Z' },
    ],
    created_at: '2026-03-10T16:00:00Z',
  },
  'BR987654321RJ': {
    id: 'ship-2', order_id: 'ord-a2', carrier: 'Correios', service: 'PAC',
    tracking_code: 'BR987654321RJ', status: 'out_for_delivery',
    estimated_delivery: '2026-03-16T23:59:59Z',
    events: [
      { status: 'out_for_delivery', description: 'Objeto saiu para entrega ao destinatário', location: 'Rio de Janeiro, RJ', timestamp: '2026-03-15T06:00:00Z' },
      { status: 'in_transit', description: 'Objeto em trânsito - por favor aguarde', location: 'São Paulo, SP', timestamp: '2026-03-12T10:00:00Z' },
      { status: 'posted', description: 'Objeto postado', location: 'São Paulo, SP', timestamp: '2026-03-10T09:00:00Z' },
      { status: 'created', description: 'Etiqueta de envio criada', location: 'São Paulo, SP', timestamp: '2026-03-09T14:00:00Z' },
    ],
    created_at: '2026-03-09T14:00:00Z',
  },
  'BR555666777PR': {
    id: 'ship-3', order_id: 'ord-a5', carrier: 'Jadlog', service: '.Package',
    tracking_code: 'BR555666777PR', status: 'delivered',
    estimated_delivery: '2026-03-15T23:59:59Z',
    events: [
      { status: 'delivered', description: 'Objeto entregue ao destinatário', location: 'Curitiba, PR', timestamp: '2026-03-14T11:00:00Z' },
      { status: 'out_for_delivery', description: 'Objeto saiu para entrega', location: 'Curitiba, PR', timestamp: '2026-03-14T07:00:00Z' },
      { status: 'in_transit', description: 'Objeto em trânsito', location: 'São Paulo, SP', timestamp: '2026-03-12T15:00:00Z' },
      { status: 'posted', description: 'Objeto coletado', location: 'São Paulo, SP', timestamp: '2026-03-11T10:00:00Z' },
      { status: 'created', description: 'Etiqueta criada', location: 'São Paulo, SP', timestamp: '2026-03-10T14:00:00Z' },
    ],
    created_at: '2026-03-10T14:00:00Z',
  },
};

export async function mockTrackShipment(trackingCode: string): Promise<Shipment> {
  await delay();
  const shipment = MOCK_SHIPMENTS[trackingCode];
  if (!shipment) throw new Error('Shipment not found');
  return { ...shipment, events: shipment.events.map((e) => ({ ...e })) };
}

export async function mockGetShipmentStatus(orderId: string): Promise<Shipment> {
  await delay();
  const shipment = Object.values(MOCK_SHIPMENTS).find((s) => s.order_id === orderId);
  if (!shipment) throw new Error('Shipment not found for this order');
  return { ...shipment, events: shipment.events.map((e) => ({ ...e })) };
}
