import type { Product, ProductFilters, CreateProductData } from '@/lib/api/store.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const PRODUCTS: Product[] = [
  {
    id: 'prod-1', academy_id: 'academy-1', name: 'Quimono Branco Competição A1',
    description: 'Quimono de competição em tecido trançado premium. Gramatura 550g/m². Aprovado pela IBJJF para campeonatos oficiais. Reforço triplo nas mangas e gola de borracha.',
    images: ['/img/store/quimono-branco-1.jpg', '/img/store/quimono-branco-2.jpg'],
    category: 'quimono', price: 389.90, compare_at_price: 449.90,
    variants: [
      { id: 'v-1a', name: 'A0', sku: 'QBC-A0', stock: 5, price: undefined },
      { id: 'v-1b', name: 'A1', sku: 'QBC-A1', stock: 8, price: undefined },
      { id: 'v-1c', name: 'A2', sku: 'QBC-A2', stock: 12, price: undefined },
      { id: 'v-1d', name: 'A3', sku: 'QBC-A3', stock: 6, price: undefined },
      { id: 'v-1e', name: 'A4', sku: 'QBC-A4', stock: 3, price: undefined },
    ],
    stock_total: 34, low_stock_alert: 5, status: 'active', featured: true,
    created_at: '2025-11-01T10:00:00Z', updated_at: '2026-03-01T14:00:00Z',
  },
  {
    id: 'prod-2', academy_id: 'academy-1', name: 'Quimono Azul Treino',
    description: 'Quimono azul royal para treinos diários. Tecido leve e resistente com gramatura 450g/m². Costuras reforçadas e caimento confortável.',
    images: ['/img/store/quimono-azul-1.jpg'],
    category: 'quimono', price: 289.90,
    variants: [
      { id: 'v-2a', name: 'A1', sku: 'QAT-A1', stock: 10, price: undefined },
      { id: 'v-2b', name: 'A2', sku: 'QAT-A2', stock: 15, price: undefined },
      { id: 'v-2c', name: 'A3', sku: 'QAT-A3', stock: 7, price: undefined },
    ],
    stock_total: 32, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2025-11-15T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'prod-3', academy_id: 'academy-1', name: 'Faixa Azul Premium',
    description: 'Faixa de jiu-jitsu azul em algodão premium com 8 costuras. Ponteira bordada com o logo da academia. Comprimento padrão IBJJF.',
    images: ['/img/store/faixa-azul-1.jpg'],
    category: 'faixa', price: 79.90,
    variants: [
      { id: 'v-3a', name: 'M2', sku: 'FAP-M2', stock: 20, price: undefined },
      { id: 'v-3b', name: 'M3', sku: 'FAP-M3', stock: 25, price: undefined },
      { id: 'v-3c', name: 'M4', sku: 'FAP-M4', stock: 18, price: undefined },
    ],
    stock_total: 63, low_stock_alert: 10, status: 'active', featured: false,
    created_at: '2025-12-01T10:00:00Z', updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'prod-4', academy_id: 'academy-1', name: 'Faixa Roxa Premium',
    description: 'Faixa de jiu-jitsu roxa em algodão premium com 8 costuras. Ponteira bordada com o logo da academia.',
    images: ['/img/store/faixa-roxa-1.jpg'],
    category: 'faixa', price: 79.90,
    variants: [
      { id: 'v-4a', name: 'M2', sku: 'FRP-M2', stock: 12, price: undefined },
      { id: 'v-4b', name: 'M3', sku: 'FRP-M3', stock: 15, price: undefined },
      { id: 'v-4c', name: 'M4', sku: 'FRP-M4', stock: 8, price: undefined },
    ],
    stock_total: 35, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2025-12-01T10:00:00Z', updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'prod-5', academy_id: 'academy-1', name: 'Rashguard Preta Manga Longa',
    description: 'Rashguard de compressão preta com logo da academia sublimado. Tecido UV50+ com costuras flatlock para máximo conforto no treino.',
    images: ['/img/store/rashguard-preta-1.jpg', '/img/store/rashguard-preta-2.jpg'],
    category: 'vestuario', price: 149.90, compare_at_price: 179.90,
    variants: [
      { id: 'v-5a', name: 'P', sku: 'RPM-P', stock: 6, price: undefined },
      { id: 'v-5b', name: 'M', sku: 'RPM-M', stock: 10, price: undefined },
      { id: 'v-5c', name: 'G', sku: 'RPM-G', stock: 8, price: undefined },
      { id: 'v-5d', name: 'GG', sku: 'RPM-GG', stock: 4, price: undefined },
    ],
    stock_total: 28, low_stock_alert: 5, status: 'active', featured: true,
    created_at: '2026-01-10T10:00:00Z', updated_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'prod-6', academy_id: 'academy-1', name: 'Rashguard Branca Manga Curta',
    description: 'Rashguard de compressão branca com detalhes em vermelho. Ideal para treinos no-gi e MMA. Secagem rápida.',
    images: ['/img/store/rashguard-branca-1.jpg'],
    category: 'vestuario', price: 129.90,
    variants: [
      { id: 'v-6a', name: 'P', sku: 'RBC-P', stock: 4, price: undefined },
      { id: 'v-6b', name: 'M', sku: 'RBC-M', stock: 7, price: undefined },
      { id: 'v-6c', name: 'G', sku: 'RBC-G', stock: 5, price: undefined },
    ],
    stock_total: 16, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-15T10:00:00Z', updated_at: '2026-02-28T10:00:00Z',
  },
  {
    id: 'prod-7', academy_id: 'academy-1', name: 'Caneleira Gel Pro',
    description: 'Caneleira em gel com proteção anatômica para canela e peito do pé. Fechamento em velcro ajustável. Ideal para Muay Thai e MMA.',
    images: ['/img/store/caneleira-1.jpg'],
    category: 'equipamento', price: 189.90,
    variants: [
      { id: 'v-7a', name: 'P', sku: 'CGP-P', stock: 8, price: undefined },
      { id: 'v-7b', name: 'M', sku: 'CGP-M', stock: 12, price: undefined },
      { id: 'v-7c', name: 'G', sku: 'CGP-G', stock: 6, price: undefined },
    ],
    stock_total: 26, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-20T10:00:00Z', updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'prod-8', academy_id: 'academy-1', name: 'Luva de MMA Profissional',
    description: 'Luva aberta de MMA em couro sintético premium. Proteção de punho com velcro duplo. Espuma de alta densidade multi-camada.',
    images: ['/img/store/luva-mma-1.jpg', '/img/store/luva-mma-2.jpg'],
    category: 'equipamento', price: 219.90, compare_at_price: 259.90,
    variants: [
      { id: 'v-8a', name: 'P', sku: 'LMP-P', stock: 5, price: undefined },
      { id: 'v-8b', name: 'M', sku: 'LMP-M', stock: 9, price: undefined },
      { id: 'v-8c', name: 'G', sku: 'LMP-G', stock: 7, price: undefined },
    ],
    stock_total: 21, low_stock_alert: 5, status: 'active', featured: true,
    created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'prod-9', academy_id: 'academy-1', name: 'Protetor Bucal Duplo',
    description: 'Protetor bucal termoformável duplo com estojo higiênico. Moldagem em água quente para perfeito encaixe. Obrigatório para sparring.',
    images: ['/img/store/protetor-bucal-1.jpg'],
    category: 'acessorio', price: 49.90,
    variants: [
      { id: 'v-9a', name: 'Único', sku: 'PBD-U', stock: 30, price: undefined },
    ],
    stock_total: 30, low_stock_alert: 10, status: 'active', featured: false,
    created_at: '2025-10-01T10:00:00Z', updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-10', academy_id: 'academy-1', name: 'Bolsa de Treino Esportiva',
    description: 'Bolsa esportiva com compartimento para quimono molhado, bolso para chinelo e porta-garrafa lateral. Alça ajustável e reforçada.',
    images: ['/img/store/bolsa-treino-1.jpg'],
    category: 'acessorio', price: 159.90,
    variants: [
      { id: 'v-10a', name: 'Único', sku: 'BTE-U', stock: 14, price: undefined },
    ],
    stock_total: 14, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-05T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'prod-11', academy_id: 'academy-1', name: 'Whey Protein Isolado 900g',
    description: 'Whey protein isolado sabor chocolate com 27g de proteína por dose. Zero lactose e zero açúcar. Ideal para recuperação pós-treino.',
    images: ['/img/store/whey-1.jpg'],
    category: 'suplemento', price: 189.90,
    variants: [
      { id: 'v-11a', name: 'Chocolate', sku: 'WPI-CHOC', stock: 20, price: undefined },
      { id: 'v-11b', name: 'Baunilha', sku: 'WPI-BAUN', stock: 15, price: undefined },
      { id: 'v-11c', name: 'Morango', sku: 'WPI-MOR', stock: 10, price: undefined },
    ],
    stock_total: 45, low_stock_alert: 10, status: 'active', featured: false,
    created_at: '2026-02-10T10:00:00Z', updated_at: '2026-03-12T10:00:00Z',
  },
  {
    id: 'prod-12', academy_id: 'academy-1', name: 'Creatina Monohidratada 300g',
    description: 'Creatina monohidratada pura micronizada. 3g por dose. Auxilia no ganho de força e desempenho em treinos de alta intensidade.',
    images: ['/img/store/creatina-1.jpg'],
    category: 'suplemento', price: 89.90,
    variants: [
      { id: 'v-12a', name: '300g', sku: 'CRM-300', stock: 25, price: undefined },
    ],
    stock_total: 25, low_stock_alert: 8, status: 'active', featured: false,
    created_at: '2026-02-15T10:00:00Z', updated_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'prod-13', academy_id: 'academy-1', name: 'Quimono Infantil Branco',
    description: 'Quimono infantil para jiu-jitsu em tecido leve e resistente. Tamanhos especiais para crianças de 4 a 14 anos.',
    images: ['/img/store/quimono-infantil-1.jpg'],
    category: 'quimono', price: 229.90,
    variants: [
      { id: 'v-13a', name: 'M0 (4-5 anos)', sku: 'QIB-M0', stock: 6, price: undefined },
      { id: 'v-13b', name: 'M1 (6-7 anos)', sku: 'QIB-M1', stock: 8, price: undefined },
      { id: 'v-13c', name: 'M2 (8-10 anos)', sku: 'QIB-M2', stock: 10, price: undefined },
      { id: 'v-13d', name: 'M3 (11-14 anos)', sku: 'QIB-M3', stock: 4, price: undefined },
    ],
    stock_total: 28, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-25T10:00:00Z', updated_at: '2026-03-08T10:00:00Z',
  },
  {
    id: 'prod-14', academy_id: 'academy-1', name: 'Short de Luta No-Gi',
    description: 'Short de luta para treinos sem quimono. Tecido stretch com abertura lateral para máxima mobilidade. Cordão interno ajustável.',
    images: ['/img/store/short-nogi-1.jpg'],
    category: 'vestuario', price: 119.90, compare_at_price: 139.90,
    variants: [
      { id: 'v-14a', name: 'P', sku: 'SNG-P', stock: 0, price: undefined },
      { id: 'v-14b', name: 'M', sku: 'SNG-M', stock: 0, price: undefined },
      { id: 'v-14c', name: 'G', sku: 'SNG-G', stock: 0, price: undefined },
    ],
    stock_total: 0, low_stock_alert: 5, status: 'out_of_stock', featured: false,
    created_at: '2026-02-05T10:00:00Z', updated_at: '2026-03-14T10:00:00Z',
  },
  {
    id: 'prod-15', academy_id: 'academy-1', name: 'Camiseta Dry-Fit da Academia',
    description: 'Camiseta dry-fit com logo da academia estampado. Tecido leve, antibacteriano e com proteção UV. Perfeita para treinos e dia a dia.',
    images: ['/img/store/camiseta-dryfit-1.jpg'],
    category: 'vestuario', price: 89.90,
    variants: [
      { id: 'v-15a', name: 'P', sku: 'CDF-P', stock: 2, price: undefined },
      { id: 'v-15b', name: 'M', sku: 'CDF-M', stock: 3, price: undefined },
      { id: 'v-15c', name: 'G', sku: 'CDF-G', stock: 1, price: undefined },
      { id: 'v-15d', name: 'GG', sku: 'CDF-GG', stock: 2, price: undefined },
    ],
    stock_total: 8, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-02-20T10:00:00Z', updated_at: '2026-03-13T10:00:00Z',
  },
];

export async function mockListProducts(_academyId: string, filters?: ProductFilters): Promise<Product[]> {
  await delay();
  let result = [...PRODUCTS];
  if (filters?.category) result = result.filter((p) => p.category === filters.category);
  if (filters?.status) result = result.filter((p) => p.status === filters.status);
  if (filters?.featured) result = result.filter((p) => p.featured);
  if (filters?.low_stock) result = result.filter((p) => p.stock_total <= p.low_stock_alert);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  return result.map((p) => ({ ...p }));
}

export async function mockGetProduct(id: string): Promise<Product> {
  await delay();
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error('Product not found');
  return { ...product };
}

export async function mockCreateProduct(data: CreateProductData): Promise<Product> {
  await delay();
  const now = new Date().toISOString();
  const product: Product = {
    id: `prod-${Date.now()}`,
    academy_id: 'academy-1',
    name: data.name,
    description: data.description,
    images: data.images,
    category: data.category,
    price: data.price,
    compare_at_price: data.compare_at_price,
    variants: data.variants.map((v, i) => ({ ...v, id: `v-new-${i}` })),
    stock_total: data.variants.reduce((sum, v) => sum + v.stock, 0),
    low_stock_alert: data.low_stock_alert,
    status: data.status,
    featured: data.featured,
    created_at: now,
    updated_at: now,
  };
  PRODUCTS.push(product);
  return { ...product };
}

export async function mockUpdateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
  await delay();
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  const updated = { ...PRODUCTS[idx], ...data, updated_at: new Date().toISOString() };
  if (data.variants) {
    updated.variants = data.variants.map((v, i) => ({ ...v, id: `v-upd-${i}` }));
    updated.stock_total = data.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  PRODUCTS[idx] = updated as Product;
  return { ...PRODUCTS[idx] };
}

export async function mockDeleteProduct(id: string): Promise<void> {
  await delay();
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  PRODUCTS.splice(idx, 1);
}
