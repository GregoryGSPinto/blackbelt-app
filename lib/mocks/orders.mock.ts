import type { Order, CreateOrderData } from '@/lib/api/orders.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const ORDERS: Order[] = [
  {
    id: 'ord-1', user_id: 'user-1', user_name: 'João Silva',
    items: [
      { product_id: 'prod-1', product_name: 'Quimono Branco Competição A1', product_image: '/img/store/quimono-branco-1.jpg', variant_id: 'v-1b', variant_name: 'A1', quantity: 1, unit_price: 389.90, total: 389.90 },
      { product_id: 'prod-9', product_name: 'Protetor Bucal Duplo', product_image: '/img/store/protetor-bucal-1.jpg', variant_id: 'v-9a', variant_name: 'Único', quantity: 2, unit_price: 49.90, total: 99.80 },
    ],
    subtotal: 489.70, shipping_cost: 0, total: 489.70,
    shipping_address: { name: 'João Silva', cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: 'Apto 42', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    delivery_option: 'pickup', payment_method: 'pix', status: 'delivered', tracking_code: undefined,
    created_at: '2026-02-10T14:30:00Z', updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'ord-2', user_id: 'user-1', user_name: 'João Silva',
    items: [
      { product_id: 'prod-5', product_name: 'Rashguard Preta Manga Longa', product_image: '/img/store/rashguard-preta-1.jpg', variant_id: 'v-5b', variant_name: 'M', quantity: 1, unit_price: 149.90, total: 149.90 },
    ],
    subtotal: 149.90, shipping_cost: 25.90, total: 175.80,
    shipping_address: { name: 'João Silva', cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: 'Apto 42', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    delivery_option: 'shipping', payment_method: 'credit_card', status: 'shipped', tracking_code: 'BR123456789SP',
    created_at: '2026-03-01T09:00:00Z', updated_at: '2026-03-05T16:00:00Z',
  },
  {
    id: 'ord-3', user_id: 'user-2', user_name: 'Maria Santos',
    items: [
      { product_id: 'prod-8', product_name: 'Luva de MMA Profissional', product_image: '/img/store/luva-mma-1.jpg', variant_id: 'v-8a', variant_name: 'P', quantity: 1, unit_price: 219.90, total: 219.90 },
      { product_id: 'prod-7', product_name: 'Caneleira Gel Pro', product_image: '/img/store/caneleira-1.jpg', variant_id: 'v-7a', variant_name: 'P', quantity: 1, unit_price: 189.90, total: 189.90 },
    ],
    subtotal: 409.80, shipping_cost: 32.50, total: 442.30,
    shipping_address: { name: 'Maria Santos', cep: '20040-020', street: 'Rua da Assembléia', number: '100', neighborhood: 'Centro', city: 'Rio de Janeiro', state: 'RJ' },
    delivery_option: 'shipping', payment_method: 'boleto', status: 'paid',
    created_at: '2026-03-10T11:00:00Z', updated_at: '2026-03-11T08:00:00Z',
  },
  {
    id: 'ord-4', user_id: 'user-3', user_name: 'Pedro Costa',
    items: [
      { product_id: 'prod-11', product_name: 'Whey Protein Isolado 900g', product_image: '/img/store/whey-1.jpg', variant_id: 'v-11a', variant_name: 'Chocolate', quantity: 2, unit_price: 189.90, total: 379.80 },
      { product_id: 'prod-12', product_name: 'Creatina Monohidratada 300g', product_image: '/img/store/creatina-1.jpg', variant_id: 'v-12a', variant_name: '300g', quantity: 1, unit_price: 89.90, total: 89.90 },
    ],
    subtotal: 469.70, shipping_cost: 0, total: 469.70,
    shipping_address: { name: 'Pedro Costa', cep: '30130-000', street: 'Av. Afonso Pena', number: '500', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG' },
    delivery_option: 'pickup', payment_method: 'pix', status: 'pending',
    created_at: '2026-03-14T16:00:00Z', updated_at: '2026-03-14T16:00:00Z',
  },
  {
    id: 'ord-5', user_id: 'user-1', user_name: 'João Silva',
    items: [
      { product_id: 'prod-3', product_name: 'Faixa Azul Premium', product_image: '/img/store/faixa-azul-1.jpg', variant_id: 'v-3b', variant_name: 'M3', quantity: 1, unit_price: 79.90, total: 79.90 },
    ],
    subtotal: 79.90, shipping_cost: 0, total: 79.90,
    shipping_address: { name: 'João Silva', cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: 'Apto 42', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    delivery_option: 'pickup', payment_method: 'pix', status: 'cancelled',
    created_at: '2026-01-20T10:00:00Z', updated_at: '2026-01-21T08:00:00Z',
  },
];

export async function mockCreateOrder(userId: string, data: CreateOrderData): Promise<Order> {
  await delay();
  const now = new Date().toISOString();
  const order: Order = {
    id: `ord-${Date.now()}`,
    user_id: userId,
    user_name: 'Aluno Atual',
    items: data.items.map((item) => ({
      product_id: item.product_id,
      product_name: 'Produto',
      product_image: '/img/store/placeholder.jpg',
      variant_id: item.variant_id,
      variant_name: 'Variante',
      quantity: item.quantity,
      unit_price: 0,
      total: 0,
    })),
    subtotal: 0,
    shipping_cost: data.shipping_cost,
    total: data.shipping_cost,
    shipping_address: data.shipping_address,
    delivery_option: data.delivery_option,
    payment_method: data.payment_method,
    status: 'pending',
    created_at: now,
    updated_at: now,
  };
  ORDERS.push(order);
  return { ...order };
}

export async function mockGetMyOrders(_userId: string): Promise<Order[]> {
  await delay();
  return ORDERS.filter((o) => o.user_id === 'user-1').map((o) => ({ ...o }));
}

export async function mockGetOrderById(id: string): Promise<Order> {
  await delay();
  const order = ORDERS.find((o) => o.id === id);
  if (!order) throw new Error('Order not found');
  return { ...order };
}

export async function mockCancelOrder(id: string): Promise<Order> {
  await delay();
  const order = ORDERS.find((o) => o.id === id);
  if (!order) throw new Error('Order not found');
  order.status = 'cancelled';
  order.updated_at = new Date().toISOString();
  return { ...order };
}
