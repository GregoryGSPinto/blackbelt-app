import type { Order } from '@/lib/api/orders.service';
import type { OrderFilters, StoreDashboard } from '@/lib/api/admin-orders.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const ADMIN_ORDERS: Order[] = [
  {
    id: 'ord-a1', user_id: 'user-1', user_name: 'João Silva',
    items: [
      { product_id: 'prod-1', product_name: 'Quimono Branco Competição A1', product_image: '/img/store/quimono-branco-1.jpg', variant_id: 'v-1b', variant_name: 'A1', quantity: 1, unit_price: 389.90, total: 389.90 },
    ],
    subtotal: 389.90, shipping_cost: 0, total: 389.90,
    shipping_address: { name: 'João Silva', cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: 'Apto 42', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    delivery_option: 'pickup', payment_method: 'pix', status: 'delivered',
    created_at: '2026-02-10T14:30:00Z', updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'ord-a2', user_id: 'user-2', user_name: 'Maria Santos',
    items: [
      { product_id: 'prod-5', product_name: 'Rashguard Preta Manga Longa', product_image: '/img/store/rashguard-preta-1.jpg', variant_id: 'v-5b', variant_name: 'M', quantity: 2, unit_price: 149.90, total: 299.80 },
      { product_id: 'prod-9', product_name: 'Protetor Bucal Duplo', product_image: '/img/store/protetor-bucal-1.jpg', variant_id: 'v-9a', variant_name: 'Único', quantity: 1, unit_price: 49.90, total: 49.90 },
    ],
    subtotal: 349.70, shipping_cost: 25.90, total: 375.60,
    shipping_address: { name: 'Maria Santos', cep: '20040-020', street: 'Rua da Assembléia', number: '100', neighborhood: 'Centro', city: 'Rio de Janeiro', state: 'RJ' },
    delivery_option: 'shipping', payment_method: 'credit_card', status: 'shipped', tracking_code: 'BR987654321RJ',
    created_at: '2026-03-01T09:00:00Z', updated_at: '2026-03-05T16:00:00Z',
  },
  {
    id: 'ord-a3', user_id: 'user-3', user_name: 'Pedro Costa',
    items: [
      { product_id: 'prod-8', product_name: 'Luva de MMA Profissional', product_image: '/img/store/luva-mma-1.jpg', variant_id: 'v-8b', variant_name: 'M', quantity: 1, unit_price: 219.90, total: 219.90 },
    ],
    subtotal: 219.90, shipping_cost: 32.50, total: 252.40,
    shipping_address: { name: 'Pedro Costa', cep: '30130-000', street: 'Av. Afonso Pena', number: '500', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG' },
    delivery_option: 'shipping', payment_method: 'pix', status: 'paid',
    created_at: '2026-03-10T11:00:00Z', updated_at: '2026-03-11T08:00:00Z',
  },
  {
    id: 'ord-a4', user_id: 'user-4', user_name: 'Ana Oliveira',
    items: [
      { product_id: 'prod-11', product_name: 'Whey Protein Isolado 900g', product_image: '/img/store/whey-1.jpg', variant_id: 'v-11a', variant_name: 'Chocolate', quantity: 1, unit_price: 189.90, total: 189.90 },
      { product_id: 'prod-12', product_name: 'Creatina Monohidratada 300g', product_image: '/img/store/creatina-1.jpg', variant_id: 'v-12a', variant_name: '300g', quantity: 2, unit_price: 89.90, total: 179.80 },
    ],
    subtotal: 369.70, shipping_cost: 0, total: 369.70,
    shipping_address: { name: 'Ana Oliveira', cep: '01310-100', street: 'Rua Augusta', number: '200', neighborhood: 'Consolação', city: 'São Paulo', state: 'SP' },
    delivery_option: 'pickup', payment_method: 'boleto', status: 'pending',
    created_at: '2026-03-14T16:00:00Z', updated_at: '2026-03-14T16:00:00Z',
  },
  {
    id: 'ord-a5', user_id: 'user-5', user_name: 'Carlos Mendes',
    items: [
      { product_id: 'prod-2', product_name: 'Quimono Azul Treino', product_image: '/img/store/quimono-azul-1.jpg', variant_id: 'v-2a', variant_name: 'A1', quantity: 1, unit_price: 289.90, total: 289.90 },
      { product_id: 'prod-3', product_name: 'Faixa Azul Premium', product_image: '/img/store/faixa-azul-1.jpg', variant_id: 'v-3b', variant_name: 'M3', quantity: 1, unit_price: 79.90, total: 79.90 },
    ],
    subtotal: 369.80, shipping_cost: 18.90, total: 388.70,
    shipping_address: { name: 'Carlos Mendes', cep: '80010-000', street: 'Rua XV de Novembro', number: '300', neighborhood: 'Centro', city: 'Curitiba', state: 'PR' },
    delivery_option: 'shipping', payment_method: 'credit_card', status: 'shipped', tracking_code: 'BR555666777PR',
    created_at: '2026-03-08T10:00:00Z', updated_at: '2026-03-12T14:00:00Z',
  },
  {
    id: 'ord-a6', user_id: 'user-6', user_name: 'Fernanda Lima',
    items: [
      { product_id: 'prod-7', product_name: 'Caneleira Gel Pro', product_image: '/img/store/caneleira-1.jpg', variant_id: 'v-7b', variant_name: 'M', quantity: 1, unit_price: 189.90, total: 189.90 },
    ],
    subtotal: 189.90, shipping_cost: 0, total: 189.90,
    shipping_address: { name: 'Fernanda Lima', cep: '01310-100', street: 'Rua Oscar Freire', number: '150', neighborhood: 'Jardins', city: 'São Paulo', state: 'SP' },
    delivery_option: 'pickup', payment_method: 'pix', status: 'delivered',
    created_at: '2026-02-25T13:00:00Z', updated_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'ord-a7', user_id: 'user-7', user_name: 'Ricardo Almeida',
    items: [
      { product_id: 'prod-10', product_name: 'Bolsa de Treino Esportiva', product_image: '/img/store/bolsa-treino-1.jpg', variant_id: 'v-10a', variant_name: 'Único', quantity: 1, unit_price: 159.90, total: 159.90 },
      { product_id: 'prod-6', product_name: 'Rashguard Branca Manga Curta', product_image: '/img/store/rashguard-branca-1.jpg', variant_id: 'v-6c', variant_name: 'G', quantity: 1, unit_price: 129.90, total: 129.90 },
    ],
    subtotal: 289.80, shipping_cost: 28.00, total: 317.80,
    shipping_address: { name: 'Ricardo Almeida', cep: '40020-000', street: 'Av. Sete de Setembro', number: '600', neighborhood: 'Centro', city: 'Salvador', state: 'BA' },
    delivery_option: 'shipping', payment_method: 'pix', status: 'paid',
    created_at: '2026-03-13T15:00:00Z', updated_at: '2026-03-13T15:30:00Z',
  },
  {
    id: 'ord-a8', user_id: 'user-1', user_name: 'João Silva',
    items: [
      { product_id: 'prod-13', product_name: 'Quimono Infantil Branco', product_image: '/img/store/quimono-infantil-1.jpg', variant_id: 'v-13b', variant_name: 'M1 (6-7 anos)', quantity: 1, unit_price: 229.90, total: 229.90 },
    ],
    subtotal: 229.90, shipping_cost: 0, total: 229.90,
    shipping_address: { name: 'João Silva', cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: 'Apto 42', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    delivery_option: 'pickup', payment_method: 'credit_card', status: 'cancelled',
    created_at: '2026-01-20T10:00:00Z', updated_at: '2026-01-21T08:00:00Z',
  },
];

const DASHBOARD: StoreDashboard = {
  orders_month: 14,
  revenue: 4589.70,
  avg_ticket: 327.84,
  top_products: [
    { product_id: 'prod-1', product_name: 'Quimono Branco Competição A1', quantity_sold: 12, revenue: 4678.80 },
    { product_id: 'prod-5', product_name: 'Rashguard Preta Manga Longa', quantity_sold: 9, revenue: 1349.10 },
    { product_id: 'prod-8', product_name: 'Luva de MMA Profissional', quantity_sold: 7, revenue: 1539.30 },
    { product_id: 'prod-11', product_name: 'Whey Protein Isolado 900g', quantity_sold: 6, revenue: 1139.40 },
    { product_id: 'prod-9', product_name: 'Protetor Bucal Duplo', quantity_sold: 18, revenue: 898.20 },
  ],
};

export async function mockListOrders(filters?: OrderFilters): Promise<Order[]> {
  await delay();
  let result = [...ADMIN_ORDERS];
  if (filters?.status) result = result.filter((o) => o.status === filters.status);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((o) =>
      o.user_name.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.items.some((i) => i.product_name.toLowerCase().includes(q))
    );
  }
  if (filters?.period && filters.period !== 'all') {
    const now = new Date();
    const cutoff = new Date();
    if (filters.period === 'today') cutoff.setDate(now.getDate() - 1);
    if (filters.period === 'week') cutoff.setDate(now.getDate() - 7);
    if (filters.period === 'month') cutoff.setMonth(now.getMonth() - 1);
    result = result.filter((o) => new Date(o.created_at) >= cutoff);
  }
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function mockGetOrderDetail(id: string): Promise<Order> {
  await delay();
  const order = ADMIN_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error('Order not found');
  return { ...order };
}

export async function mockUpdateOrderStatus(id: string, status: Order['status'], trackingCode?: string): Promise<Order> {
  await delay();
  const order = ADMIN_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error('Order not found');
  order.status = status;
  if (trackingCode) order.tracking_code = trackingCode;
  order.updated_at = new Date().toISOString();
  return { ...order };
}

export async function mockGetStoreDashboard(): Promise<StoreDashboard> {
  await delay();
  return { ...DASHBOARD, top_products: DASHBOARD.top_products.map((p) => ({ ...p })) };
}
