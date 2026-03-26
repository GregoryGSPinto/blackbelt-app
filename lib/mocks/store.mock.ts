import type {
  Product,
  ProductFilters,
  CreateProductData,
  CategoryDTO,
  SizeGuideDTO,
  SizeEntry,
  StructuredVariant,
  ReviewDTO,
} from '@/lib/api/store.service';

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

function uuid() {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ────────────────────────────────────────────────────────────── */
/*  CATEGORIES                                                    */
/* ────────────────────────────────────────────────────────────── */

const CATEGORIES: CategoryDTO[] = [
  { id: 'cat-kimonos', academy_id: 'academy-1', name: 'Kimonos', slug: 'kimonos', icon: '\u{1F94B}', sort_order: 0, created_at: '2025-10-01T10:00:00Z' },
  { id: 'cat-faixas', academy_id: 'academy-1', name: 'Faixas', slug: 'faixas', icon: '\u{1F397}\uFE0F', sort_order: 1, created_at: '2025-10-01T10:00:00Z' },
  { id: 'cat-rashguards', academy_id: 'academy-1', name: 'Rashguards', slug: 'rashguards', icon: '\u{1F455}', sort_order: 2, created_at: '2025-10-01T10:00:00Z' },
  { id: 'cat-shorts', academy_id: 'academy-1', name: 'Shorts/Calcas', slug: 'shorts-calcas', icon: '\u{1FA73}', sort_order: 3, created_at: '2025-10-01T10:00:00Z' },
  { id: 'cat-luvas', academy_id: 'academy-1', name: 'Luvas/Protetores', slug: 'luvas-protetores', icon: '\u{1F94A}', sort_order: 4, created_at: '2025-10-01T10:00:00Z' },
  { id: 'cat-equipamentos', academy_id: 'academy-1', name: 'Equipamentos', slug: 'equipamentos', icon: '\u{1F3CB}\uFE0F', sort_order: 5, created_at: '2025-10-01T10:00:00Z' },
  { id: 'cat-acessorios', academy_id: 'academy-1', name: 'Acessorios', slug: 'acessorios', icon: '\u{1F392}', sort_order: 6, created_at: '2025-10-01T10:00:00Z' },
  { id: 'cat-suplementos', academy_id: 'academy-1', name: 'Suplementos', slug: 'suplementos', icon: '\u{1F48A}', sort_order: 7, created_at: '2025-10-01T10:00:00Z' },
];

/* ────────────────────────────────────────────────────────────── */
/*  SIZE GUIDES                                                   */
/* ────────────────────────────────────────────────────────────── */

const SIZE_GUIDES: SizeGuideDTO[] = [
  {
    id: 'sg-kimonos-bjj',
    academy_id: 'academy-1',
    name: 'Kimonos BJJ',
    category_id: 'cat-kimonos',
    tips: 'Meca com o kimono seco. Considere que o tecido pode encolher 3-5% na primeira lavagem.',
    sizes: [
      { label: 'A0', height_cm: 155, weight_kg: 50 },
      { label: 'A1', height_cm: 165, weight_kg: 64 },
      { label: 'A2', height_cm: 175, weight_kg: 80 },
      { label: 'A3', height_cm: 183, weight_kg: 95 },
      { label: 'A4', height_cm: 190, weight_kg: 110 },
      { label: 'A5', height_cm: 198, weight_kg: 130 },
    ],
    created_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 'sg-rashguards',
    academy_id: 'academy-1',
    name: 'Rashguards',
    category_id: 'cat-rashguards',
    tips: 'Rashguards devem ficar bem ajustados ao corpo. Na duvida entre dois tamanhos, escolha o menor.',
    sizes: [
      { label: 'P', height_cm: 165, weight_kg: 60, chest_cm: 86 },
      { label: 'M', height_cm: 173, weight_kg: 75, chest_cm: 94 },
      { label: 'G', height_cm: 180, weight_kg: 90, chest_cm: 102 },
      { label: 'GG', height_cm: 188, weight_kg: 105, chest_cm: 110 },
      { label: 'XG', height_cm: 195, weight_kg: 120, chest_cm: 118 },
    ],
    created_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 'sg-faixas',
    academy_id: 'academy-1',
    name: 'Faixas',
    category_id: 'cat-faixas',
    tips: 'O comprimento da faixa deve permitir dar duas voltas na cintura e ainda sobrar para o no.',
    sizes: [
      { label: 'A0', length_cm: 230 },
      { label: 'A1', length_cm: 260 },
      { label: 'A2', length_cm: 280 },
      { label: 'A3', length_cm: 300 },
      { label: 'A4', length_cm: 320 },
    ],
    created_at: '2025-10-01T10:00:00Z',
  },
];

/* ────────────────────────────────────────────────────────────── */
/*  PRODUCTS  (15 existing + enriched marketplace fields)         */
/* ────────────────────────────────────────────────────────────── */

const PRODUCTS: Product[] = [
  {
    id: 'prod-1', academy_id: 'academy-1', name: 'Quimono Branco Competicao A1',
    description: 'Quimono de competicao em tecido trancado premium. Gramatura 550g/m2. Aprovado pela IBJJF para campeonatos oficiais. Reforco triplo nas mangas e gola de borracha.',
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
    category_id: 'cat-kimonos', modality: 'bjj', brand: 'Koral',
    material: 'Algodao trancado 550g/m2', is_featured: true,
    sold_count: 128, rating_avg: 4.7, rating_count: 42,
  },
  {
    id: 'prod-2', academy_id: 'academy-1', name: 'Quimono Azul Treino',
    description: 'Quimono azul royal para treinos diarios. Tecido leve e resistente com gramatura 450g/m2. Costuras reforcadas e caimento confortavel.',
    images: ['/img/store/quimono-azul-1.jpg'],
    category: 'quimono', price: 289.90,
    variants: [
      { id: 'v-2a', name: 'A1', sku: 'QAT-A1', stock: 10, price: undefined },
      { id: 'v-2b', name: 'A2', sku: 'QAT-A2', stock: 15, price: undefined },
      { id: 'v-2c', name: 'A3', sku: 'QAT-A3', stock: 7, price: undefined },
    ],
    stock_total: 32, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2025-11-15T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
    category_id: 'cat-kimonos', modality: 'bjj', brand: 'Vouk',
    material: 'Algodao trancado 450g/m2', is_featured: false,
    sold_count: 95, rating_avg: 4.4, rating_count: 31,
  },
  {
    id: 'prod-3', academy_id: 'academy-1', name: 'Faixa Azul Premium',
    description: 'Faixa de jiu-jitsu azul em algodao premium com 8 costuras. Ponteira bordada com o logo da academia. Comprimento padrao IBJJF.',
    images: ['/img/store/faixa-azul-1.jpg'],
    category: 'faixa', price: 79.90,
    variants: [
      { id: 'v-3a', name: 'M2', sku: 'FAP-M2', stock: 20, price: undefined },
      { id: 'v-3b', name: 'M3', sku: 'FAP-M3', stock: 25, price: undefined },
      { id: 'v-3c', name: 'M4', sku: 'FAP-M4', stock: 18, price: undefined },
    ],
    stock_total: 63, low_stock_alert: 10, status: 'active', featured: false,
    created_at: '2025-12-01T10:00:00Z', updated_at: '2026-01-15T10:00:00Z',
    category_id: 'cat-faixas', modality: 'bjj', brand: 'Storm',
    material: 'Algodao premium 8 costuras', is_featured: false,
    sold_count: 210, rating_avg: 4.8, rating_count: 67,
  },
  {
    id: 'prod-4', academy_id: 'academy-1', name: 'Faixa Roxa Premium',
    description: 'Faixa de jiu-jitsu roxa em algodao premium com 8 costuras. Ponteira bordada com o logo da academia.',
    images: ['/img/store/faixa-roxa-1.jpg'],
    category: 'faixa', price: 79.90,
    variants: [
      { id: 'v-4a', name: 'M2', sku: 'FRP-M2', stock: 12, price: undefined },
      { id: 'v-4b', name: 'M3', sku: 'FRP-M3', stock: 15, price: undefined },
      { id: 'v-4c', name: 'M4', sku: 'FRP-M4', stock: 8, price: undefined },
    ],
    stock_total: 35, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2025-12-01T10:00:00Z', updated_at: '2026-01-15T10:00:00Z',
    category_id: 'cat-faixas', modality: 'bjj', brand: 'Storm',
    material: 'Algodao premium 8 costuras', is_featured: false,
    sold_count: 87, rating_avg: 4.6, rating_count: 28,
  },
  {
    id: 'prod-5', academy_id: 'academy-1', name: 'Rashguard Preta Manga Longa',
    description: 'Rashguard de compressao preta com logo da academia sublimado. Tecido UV50+ com costuras flatlock para maximo conforto no treino.',
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
    category_id: 'cat-rashguards', modality: 'bjj', brand: 'Venum',
    material: 'Poliester/Elastano UV50+', is_featured: true,
    sold_count: 76, rating_avg: 4.5, rating_count: 24,
  },
  {
    id: 'prod-6', academy_id: 'academy-1', name: 'Rashguard Branca Manga Curta',
    description: 'Rashguard de compressao branca com detalhes em vermelho. Ideal para treinos no-gi e MMA. Secagem rapida.',
    images: ['/img/store/rashguard-branca-1.jpg'],
    category: 'vestuario', price: 129.90,
    variants: [
      { id: 'v-6a', name: 'P', sku: 'RBC-P', stock: 4, price: undefined },
      { id: 'v-6b', name: 'M', sku: 'RBC-M', stock: 7, price: undefined },
      { id: 'v-6c', name: 'G', sku: 'RBC-G', stock: 5, price: undefined },
    ],
    stock_total: 16, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-15T10:00:00Z', updated_at: '2026-02-28T10:00:00Z',
    category_id: 'cat-rashguards', modality: 'mma', brand: 'Venum',
    material: 'Poliester/Elastano secagem rapida', is_featured: false,
    sold_count: 54, rating_avg: 4.3, rating_count: 18,
  },
  {
    id: 'prod-7', academy_id: 'academy-1', name: 'Caneleira Gel Pro',
    description: 'Caneleira em gel com protecao anatomica para canela e peito do pe. Fechamento em velcro ajustavel. Ideal para Muay Thai e MMA.',
    images: ['/img/store/caneleira-1.jpg'],
    category: 'equipamento', price: 189.90,
    variants: [
      { id: 'v-7a', name: 'P', sku: 'CGP-P', stock: 8, price: undefined },
      { id: 'v-7b', name: 'M', sku: 'CGP-M', stock: 12, price: undefined },
      { id: 'v-7c', name: 'G', sku: 'CGP-G', stock: 6, price: undefined },
    ],
    stock_total: 26, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-20T10:00:00Z', updated_at: '2026-02-15T10:00:00Z',
    category_id: 'cat-equipamentos', modality: 'muay_thai', brand: 'Pretorian',
    material: 'Gel/Couro sintetico', is_featured: false,
    sold_count: 62, rating_avg: 4.2, rating_count: 20,
  },
  {
    id: 'prod-8', academy_id: 'academy-1', name: 'Luva de MMA Profissional',
    description: 'Luva aberta de MMA em couro sintetico premium. Protecao de punho com velcro duplo. Espuma de alta densidade multi-camada.',
    images: ['/img/store/luva-mma-1.jpg', '/img/store/luva-mma-2.jpg'],
    category: 'equipamento', price: 219.90, compare_at_price: 259.90,
    variants: [
      { id: 'v-8a', name: 'P', sku: 'LMP-P', stock: 5, price: undefined },
      { id: 'v-8b', name: 'M', sku: 'LMP-M', stock: 9, price: undefined },
      { id: 'v-8c', name: 'G', sku: 'LMP-G', stock: 7, price: undefined },
    ],
    stock_total: 21, low_stock_alert: 5, status: 'active', featured: true,
    created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-10T10:00:00Z',
    category_id: 'cat-luvas', modality: 'mma', brand: 'Pretorian',
    material: 'Couro sintetico premium/Espuma multi-camada', is_featured: true,
    sold_count: 89, rating_avg: 4.6, rating_count: 33,
  },
  {
    id: 'prod-9', academy_id: 'academy-1', name: 'Protetor Bucal Duplo',
    description: 'Protetor bucal termoformavel duplo com estojo higienico. Moldagem em agua quente para perfeito encaixe. Obrigatorio para sparring.',
    images: ['/img/store/protetor-bucal-1.jpg'],
    category: 'acessorio', price: 49.90,
    variants: [
      { id: 'v-9a', name: 'Unico', sku: 'PBD-U', stock: 30, price: undefined },
    ],
    stock_total: 30, low_stock_alert: 10, status: 'active', featured: false,
    created_at: '2025-10-01T10:00:00Z', updated_at: '2026-01-10T10:00:00Z',
    category_id: 'cat-acessorios', modality: 'geral', brand: 'Vollo',
    material: 'Silicone termoformavel', is_featured: false,
    sold_count: 312, rating_avg: 4.1, rating_count: 85,
  },
  {
    id: 'prod-10', academy_id: 'academy-1', name: 'Bolsa de Treino Esportiva',
    description: 'Bolsa esportiva com compartimento para quimono molhado, bolso para chinelo e porta-garrafa lateral. Alca ajustavel e reforcada.',
    images: ['/img/store/bolsa-treino-1.jpg'],
    category: 'acessorio', price: 159.90,
    variants: [
      { id: 'v-10a', name: 'Unico', sku: 'BTE-U', stock: 14, price: undefined },
    ],
    stock_total: 14, low_stock_alert: 5, status: 'active', featured: false,
    created_at: '2026-01-05T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
    category_id: 'cat-acessorios', modality: 'geral', brand: 'Black Belt',
    material: 'Nylon 600D impermeavel', is_featured: false,
    sold_count: 47, rating_avg: 4.4, rating_count: 15,
  },
  {
    id: 'prod-11', academy_id: 'academy-1', name: 'Whey Protein Isolado 900g',
    description: 'Whey protein isolado sabor chocolate com 27g de proteina por dose. Zero lactose e zero acucar. Ideal para recuperacao pos-treino.',
    images: ['/img/store/whey-1.jpg'],
    category: 'suplemento', price: 189.90,
    variants: [
      { id: 'v-11a', name: 'Chocolate', sku: 'WPI-CHOC', stock: 20, price: undefined },
      { id: 'v-11b', name: 'Baunilha', sku: 'WPI-BAUN', stock: 15, price: undefined },
      { id: 'v-11c', name: 'Morango', sku: 'WPI-MOR', stock: 10, price: undefined },
    ],
    stock_total: 45, low_stock_alert: 10, status: 'active', featured: false,
    created_at: '2026-02-10T10:00:00Z', updated_at: '2026-03-12T10:00:00Z',
    category_id: 'cat-suplementos', modality: 'geral', brand: 'Growth',
    is_featured: false,
    sold_count: 156, rating_avg: 4.5, rating_count: 52,
  },
  {
    id: 'prod-12', academy_id: 'academy-1', name: 'Creatina Monohidratada 300g',
    description: 'Creatina monohidratada pura micronizada. 3g por dose. Auxilia no ganho de forca e desempenho em treinos de alta intensidade.',
    images: ['/img/store/creatina-1.jpg'],
    category: 'suplemento', price: 89.90,
    variants: [
      { id: 'v-12a', name: '300g', sku: 'CRM-300', stock: 25, price: undefined },
    ],
    stock_total: 25, low_stock_alert: 8, status: 'active', featured: false,
    created_at: '2026-02-15T10:00:00Z', updated_at: '2026-03-10T10:00:00Z',
    category_id: 'cat-suplementos', modality: 'geral', brand: 'Max Titanium',
    is_featured: false,
    sold_count: 198, rating_avg: 4.7, rating_count: 64,
  },
  {
    id: 'prod-13', academy_id: 'academy-1', name: 'Quimono Infantil Branco',
    description: 'Quimono infantil para jiu-jitsu em tecido leve e resistente. Tamanhos especiais para criancas de 4 a 14 anos.',
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
    category_id: 'cat-kimonos', modality: 'bjj', brand: 'Dragao',
    material: 'Algodao leve infantil 350g/m2', is_featured: false,
    sold_count: 73, rating_avg: 4.3, rating_count: 22,
  },
  {
    id: 'prod-14', academy_id: 'academy-1', name: 'Short de Luta No-Gi',
    description: 'Short de luta para treinos sem quimono. Tecido stretch com abertura lateral para maxima mobilidade. Cordao interno ajustavel.',
    images: ['/img/store/short-nogi-1.jpg'],
    category: 'vestuario', price: 119.90, compare_at_price: 139.90,
    variants: [
      { id: 'v-14a', name: 'P', sku: 'SNG-P', stock: 0, price: undefined },
      { id: 'v-14b', name: 'M', sku: 'SNG-M', stock: 0, price: undefined },
      { id: 'v-14c', name: 'G', sku: 'SNG-G', stock: 0, price: undefined },
    ],
    stock_total: 0, low_stock_alert: 5, status: 'out_of_stock', featured: false,
    created_at: '2026-02-05T10:00:00Z', updated_at: '2026-03-14T10:00:00Z',
    category_id: 'cat-shorts', modality: 'bjj', brand: 'Venum',
    material: 'Poliester/Elastano stretch', is_featured: false,
    sold_count: 41, rating_avg: 4.0, rating_count: 14,
  },
  {
    id: 'prod-15', academy_id: 'academy-1', name: 'Camiseta Dry-Fit da Academia',
    description: 'Camiseta dry-fit com logo da academia estampado. Tecido leve, antibacteriano e com protecao UV. Perfeita para treinos e dia a dia.',
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
    category_id: 'cat-rashguards', modality: 'geral', brand: 'Black Belt',
    material: 'Poliester dry-fit antibacteriano UV', is_featured: false,
    sold_count: 34, rating_avg: 4.2, rating_count: 11,
  },
];

/* ────────────────────────────────────────────────────────────── */
/*  STRUCTURED VARIANTS                                           */
/* ────────────────────────────────────────────────────────────── */

function productColor(p: Product): { color: string; color_hex: string } {
  const n = p.name.toLowerCase();
  if (n.includes('branc')) return { color: 'Branco', color_hex: '#FFFFFF' };
  if (n.includes('azul')) return { color: 'Azul', color_hex: '#003DA5' };
  if (n.includes('pret')) return { color: 'Preto', color_hex: '#1A1A1A' };
  if (n.includes('rox')) return { color: 'Roxo', color_hex: '#6B21A8' };
  return { color: 'Preto', color_hex: '#1A1A1A' };
}

const STRUCTURED_VARIANTS: StructuredVariant[] = PRODUCTS.flatMap((p) => {
  const { color, color_hex } = productColor(p);
  return p.variants.map((v, idx) => ({
    id: v.id,
    product_id: p.id,
    size: v.name,
    color,
    color_hex,
    sku: v.sku,
    price_cents: Math.round(p.price * 100),
    stock: v.stock,
    is_active: !(v.stock === 0 && p.status === 'out_of_stock'),
    sort_order: idx,
  }));
});

/* ────────────────────────────────────────────────────────────── */
/*  REVIEWS  (50 total, 3-5 per product)                          */
/* ────────────────────────────────────────────────────────────── */

const REVIEWS: ReviewDTO[] = [
  // ── prod-1 Quimono Branco Competicao (5 reviews) ──
  {
    id: 'rev-1a', product_id: 'prod-1', profile_id: 'profile-101', academy_id: 'academy-1',
    author_name: 'Joao Silva', rating: 5,
    title: 'Excelente para competicao',
    body: 'Quimono excelente! Tecido muito resistente e o caimento e perfeito para competicao. Ja usei em 3 campeonatos e continua novo.',
    size_purchased: 'A2', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 12, created_at: '2026-01-15T14:30:00Z',
  },
  {
    id: 'rev-1b', product_id: 'prod-1', profile_id: 'profile-102', academy_id: 'academy-1',
    author_name: 'Maria Santos', rating: 5,
    title: 'Melhor quimono que ja tive',
    body: 'A gola de borracha faz toda a diferenca na hora da pegada. Recomendo demais!',
    size_purchased: 'A1', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 8, created_at: '2026-01-20T09:15:00Z',
  },
  {
    id: 'rev-1c', product_id: 'prod-1', profile_id: 'profile-103', academy_id: 'academy-1',
    author_name: 'Pedro Oliveira', rating: 4,
    title: 'Otimo mas encolheu um pouco',
    body: 'Otimo quimono, so achei que encolheu um pouco apos a primeira lavagem. Comprei A2 e ficou mais justo que o esperado.',
    size_purchased: 'A2', size_feedback: 'small',
    verified_purchase: true, helpful_count: 15, created_at: '2026-02-03T16:45:00Z',
  },
  {
    id: 'rev-1d', product_id: 'prod-1', profile_id: 'profile-104', academy_id: 'academy-1',
    author_name: 'Ana Costa', rating: 5,
    title: 'Presente perfeito',
    body: 'Comprei para meu marido e ele adorou. Qualidade impecavel, acabamento perfeito. Vale cada centavo.',
    size_purchased: 'A3',
    verified_purchase: true, helpful_count: 4, created_at: '2026-02-10T11:20:00Z',
  },
  {
    id: 'rev-1e', product_id: 'prod-1', profile_id: 'profile-105', academy_id: 'academy-1',
    author_name: 'Carlos Ferreira', rating: 4,
    title: 'Bom custo-beneficio',
    body: 'Quimono muito bom para o preco. O reforco nas mangas e realmente diferenciado. Tirando meia estrela porque a calca poderia ser mais grossa.',
    size_purchased: 'A2', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 6, created_at: '2026-02-18T08:00:00Z',
  },

  // ── prod-2 Quimono Azul Treino (4 reviews) ──
  {
    id: 'rev-2a', product_id: 'prod-2', profile_id: 'profile-106', academy_id: 'academy-1',
    author_name: 'Lucas Mendes', rating: 5,
    title: 'Imbativel para treino diario',
    body: 'Para treino no dia a dia e imbativel. Leve, confortavel e seca rapido. Uso quase todo dia e esta segurando bem.',
    size_purchased: 'A2', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 9, created_at: '2026-01-08T10:30:00Z',
  },
  {
    id: 'rev-2b', product_id: 'prod-2', profile_id: 'profile-107', academy_id: 'academy-1',
    author_name: 'Fernanda Lima', rating: 4,
    title: 'Bom custo-beneficio',
    body: 'O azul e muito bonito e nao desbotou. So acho que a gramatura poderia ser um pouco maior.',
    size_purchased: 'A1', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 5, created_at: '2026-01-22T13:00:00Z',
  },
  {
    id: 'rev-2c', product_id: 'prod-2', profile_id: 'profile-108', academy_id: 'academy-1',
    author_name: 'Rafael Souza', rating: 4,
    title: 'Ficou folgado',
    body: 'Comprei A2 e ficou um pouco folgado. Recomendo pedir um tamanho menor se voce esta entre dois tamanhos.',
    size_purchased: 'A2', size_feedback: 'large',
    verified_purchase: true, helpful_count: 11, created_at: '2026-02-05T17:30:00Z',
  },
  {
    id: 'rev-2d', product_id: 'prod-2', profile_id: 'profile-109', academy_id: 'academy-1',
    author_name: 'Tatiana Rocha', rating: 5,
    title: 'Ja tenho 3!',
    body: 'Perfeito para treinos! Ja tenho 2 e estou comprando o terceiro. O tecido e muito gostoso no corpo.',
    size_purchased: 'A1', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 7, created_at: '2026-02-14T09:45:00Z',
  },

  // ── prod-3 Faixa Azul Premium (4 reviews) ──
  {
    id: 'rev-3a', product_id: 'prod-3', profile_id: 'profile-110', academy_id: 'academy-1',
    author_name: 'Gustavo Almeida', rating: 5,
    title: 'Faixa linda',
    body: 'O bordado da academia ficou muito bonito. O algodao e macio mas firme, nao desata facil.',
    size_purchased: 'M3',
    verified_purchase: true, helpful_count: 6, created_at: '2026-01-10T14:00:00Z',
  },
  {
    id: 'rev-3b', product_id: 'prod-3', profile_id: 'profile-111', academy_id: 'academy-1',
    author_name: 'Camila Nascimento', rating: 5,
    title: 'Presente de graduacao',
    body: 'Presente de graduacao para mim mesma! Qualidade superior as faixas que eu tinha antes. Muito orgulho de usar.',
    size_purchased: 'M2',
    verified_purchase: true, helpful_count: 10, created_at: '2026-01-18T10:00:00Z',
  },
  {
    id: 'rev-3c', product_id: 'prod-3', profile_id: 'profile-112', academy_id: 'academy-1',
    author_name: 'Bruno Barbosa', rating: 4,
    title: 'Boa faixa, tamanho certinho',
    body: 'Boa faixa, bonita e resistente. O tamanho M3 ficou certinho pra mim (1,78m).',
    size_purchased: 'M3',
    verified_purchase: true, helpful_count: 3, created_at: '2026-02-01T16:15:00Z',
  },
  {
    id: 'rev-3d', product_id: 'prod-3', profile_id: 'profile-113', academy_id: 'academy-1',
    author_name: 'Juliana Martins', rating: 5,
    title: '8 costuras fazem diferenca',
    body: 'A melhor faixa que ja comprei. As 8 costuras fazem diferenca na durabilidade. Depois de meses de uso continua firme.',
    size_purchased: 'M4',
    verified_purchase: true, helpful_count: 14, created_at: '2026-02-22T08:30:00Z',
  },

  // ── prod-4 Faixa Roxa Premium (3 reviews) ──
  {
    id: 'rev-4a', product_id: 'prod-4', profile_id: 'profile-114', academy_id: 'academy-1',
    author_name: 'Marcos Pereira', rating: 5,
    title: 'A altura da graduacao',
    body: 'Cheguei na roxa e merecia uma faixa a altura! Excelente qualidade, cor vibrante que nao desbota.',
    size_purchased: 'M3',
    verified_purchase: true, helpful_count: 8, created_at: '2026-01-25T11:00:00Z',
  },
  {
    id: 'rev-4b', product_id: 'prod-4', profile_id: 'profile-115', academy_id: 'academy-1',
    author_name: 'Patricia Gomes', rating: 4,
    title: 'Cor um pouco mais escura',
    body: 'Boa faixa, so achei a cor um pouco mais escura do que esperava na foto. Mas a qualidade e otima.',
    size_purchased: 'M2',
    verified_purchase: true, helpful_count: 5, created_at: '2026-02-08T14:30:00Z',
  },
  {
    id: 'rev-4c', product_id: 'prod-4', profile_id: 'profile-116', academy_id: 'academy-1',
    author_name: 'Diego Cardoso', rating: 5,
    title: 'Presente para aluno',
    body: 'Comprei pra graduacao do meu aluno, ficou muito satisfeito. O acabamento e impecavel.',
    size_purchased: 'M3',
    verified_purchase: true, helpful_count: 3, created_at: '2026-03-01T09:00:00Z',
  },

  // ── prod-5 Rashguard Preta Manga Longa (4 reviews) ──
  {
    id: 'rev-5a', product_id: 'prod-5', profile_id: 'profile-117', academy_id: 'academy-1',
    author_name: 'Felipe Araujo', rating: 5,
    title: 'Compressao perfeita',
    body: 'Rashguard top! A compressao e perfeita, nao fica escorregando. O logo sublimado ficou muito profissional.',
    size_purchased: 'M', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 11, created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'rev-5b', product_id: 'prod-5', profile_id: 'profile-118', academy_id: 'academy-1',
    author_name: 'Amanda Ribeiro', rating: 4,
    title: 'P ficou apertado nos bracos',
    body: 'Gostei bastante, o tecido e de qualidade. Achei que o tamanho P ficou um pouco apertado nos bracos.',
    size_purchased: 'P', size_feedback: 'small',
    verified_purchase: true, helpful_count: 9, created_at: '2026-02-10T15:30:00Z',
  },
  {
    id: 'rev-5c', product_id: 'prod-5', profile_id: 'profile-119', academy_id: 'academy-1',
    author_name: 'Rodrigo Nunes', rating: 5,
    title: 'Aguenta tudo',
    body: 'Uso no jiu sem kimono e no MMA. Aguenta puxada, raspagem, tudo. Ja lavei mais de 30 vezes e esta intacta.',
    size_purchased: 'G', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 18, created_at: '2026-02-20T08:45:00Z',
  },
  {
    id: 'rev-5d', product_id: 'prod-5', profile_id: 'profile-120', academy_id: 'academy-1',
    author_name: 'Isabela Freitas', rating: 4,
    title: 'Protecao UV e diferencial',
    body: 'Muito boa, a protecao UV e um diferencial para quem treina ao ar livre. Comprei M e ficou perfeito.',
    size_purchased: 'M', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 6, created_at: '2026-03-02T12:00:00Z',
  },

  // ── prod-6 Rashguard Branca Manga Curta (3 reviews) ──
  {
    id: 'rev-6a', product_id: 'prod-6', profile_id: 'profile-121', academy_id: 'academy-1',
    author_name: 'Thiago Moreira', rating: 4,
    title: 'Bonita e funcional',
    body: 'Boa rashguard para treino. O detalhe vermelho fica muito bonito. Secagem realmente rapida.',
    size_purchased: 'M', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 4, created_at: '2026-02-05T11:00:00Z',
  },
  {
    id: 'rev-6b', product_id: 'prod-6', profile_id: 'profile-122', academy_id: 'academy-1',
    author_name: 'Larissa Cunha', rating: 5,
    title: 'Ideal para o verao',
    body: 'Adorei! Leve e confortavel, ideal para os treinos de verao. O branco nao fica transparente com suor.',
    size_purchased: 'P', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 7, created_at: '2026-02-15T14:00:00Z',
  },
  {
    id: 'rev-6c', product_id: 'prod-6', profile_id: 'profile-123', academy_id: 'academy-1',
    author_name: 'Henrique Dias', rating: 4,
    title: 'G ficou grande',
    body: 'Comprei G e ficou um pouco grande. Recomendo pedir um numero menor. No mais, qualidade excelente.',
    size_purchased: 'G', size_feedback: 'large',
    verified_purchase: true, helpful_count: 10, created_at: '2026-02-28T09:30:00Z',
  },

  // ── prod-7 Caneleira Gel Pro (3 reviews) ──
  {
    id: 'rev-7a', product_id: 'prod-7', profile_id: 'profile-124', academy_id: 'academy-1',
    author_name: 'Leandro Teixeira', rating: 4,
    title: 'Absorve bem os impactos',
    body: 'Protecao muito boa, absorve bem os impactos. O velcro segura firme durante todo o treino de Muay Thai.',
    verified_purchase: true, helpful_count: 5, created_at: '2026-01-28T16:00:00Z',
  },
  {
    id: 'rev-7b', product_id: 'prod-7', profile_id: 'profile-125', academy_id: 'academy-1',
    author_name: 'Mariana Lopes', rating: 5,
    title: 'Melhor caneleira',
    body: 'Melhor caneleira que ja usei! O gel distribui o impacto muito bem. Vale o investimento.',
    verified_purchase: true, helpful_count: 9, created_at: '2026-02-12T10:30:00Z',
  },
  {
    id: 'rev-7c', product_id: 'prod-7', profile_id: 'profile-126', academy_id: 'academy-1',
    author_name: 'Vinicius Castro', rating: 3,
    title: 'Velcro perdeu aderencia',
    body: 'Boa caneleira, mas o velcro comecou a perder aderencia apos 2 meses de uso intenso. A protecao em si e otima.',
    verified_purchase: true, helpful_count: 13, created_at: '2026-03-05T08:00:00Z',
  },

  // ── prod-8 Luva de MMA Profissional (4 reviews) ──
  {
    id: 'rev-8a', product_id: 'prod-8', profile_id: 'profile-127', academy_id: 'academy-1',
    author_name: 'Gabriel Santos', rating: 5,
    title: 'Profissional de verdade',
    body: 'Luva profissional de verdade! A protecao do punho e sensacional. Uso para sparring e bag work.',
    verified_purchase: true, helpful_count: 14, created_at: '2026-02-05T09:00:00Z',
  },
  {
    id: 'rev-8b', product_id: 'prod-8', profile_id: 'profile-128', academy_id: 'academy-1',
    author_name: 'Renata Vieira', rating: 4,
    title: 'Velcro duplo e otimo',
    body: 'Boa luva, couro sintetico de qualidade. O velcro duplo da muita seguranca. Um pouco quente no verao.',
    verified_purchase: true, helpful_count: 6, created_at: '2026-02-18T14:00:00Z',
  },
  {
    id: 'rev-8c', product_id: 'prod-8', profile_id: 'profile-129', academy_id: 'academy-1',
    author_name: 'Eduardo Lima', rating: 5,
    title: 'Custo-beneficio incrivel',
    body: 'Excelente custo-beneficio! Ja tive luvas de R$400 que nao tinham essa qualidade. A espuma multi-camada faz diferenca.',
    verified_purchase: true, helpful_count: 20, created_at: '2026-02-25T11:30:00Z',
  },
  {
    id: 'rev-8d', product_id: 'prod-8', profile_id: 'profile-130', academy_id: 'academy-1',
    author_name: 'Aline Carvalho', rating: 4,
    title: 'Boa para treinar MMA',
    body: 'Comprei para treinar MMA e estou satisfeita. Boa protecao e encaixe confortavel.',
    verified_purchase: true, helpful_count: 3, created_at: '2026-03-08T16:45:00Z',
  },

  // ── prod-9 Protetor Bucal Duplo (3 reviews) ──
  {
    id: 'rev-9a', product_id: 'prod-9', profile_id: 'profile-131', academy_id: 'academy-1',
    author_name: 'Mateus Campos', rating: 4,
    title: 'Facil de moldar',
    body: 'Facil de moldar e fica bem firme. Protecao dupla da muita seguranca no sparring. Preco justo.',
    verified_purchase: true, helpful_count: 7, created_at: '2025-11-10T10:00:00Z',
  },
  {
    id: 'rev-9b', product_id: 'prod-9', profile_id: 'profile-132', academy_id: 'academy-1',
    author_name: 'Priscila Duarte', rating: 4,
    title: 'Estojo higienico e um plus',
    body: 'Bom protetor, moldou certinho. O estojo higienico e um diferencial. Consigo falar e respirar normalmente.',
    verified_purchase: true, helpful_count: 5, created_at: '2025-12-05T13:30:00Z',
  },
  {
    id: 'rev-9c', product_id: 'prod-9', profile_id: 'profile-133', academy_id: 'academy-1',
    author_name: 'Alexandre Pinto', rating: 3,
    title: 'Perdeu formato depois de 3 meses',
    body: 'Funciona bem, mas depois de uns 3 meses comecou a perder o formato. Tive que remoldar. Pelo preco, e aceitavel.',
    verified_purchase: true, helpful_count: 11, created_at: '2026-01-15T08:00:00Z',
  },

  // ── prod-10 Bolsa de Treino Esportiva (3 reviews) ──
  {
    id: 'rev-10a', product_id: 'prod-10', profile_id: 'profile-134', academy_id: 'academy-1',
    author_name: 'Daniel Azevedo', rating: 5,
    title: 'Compartimento para quimono molhado e genial',
    body: 'Bolsa muito bem pensada! O compartimento para quimono molhado e genial. Cabe tudo que preciso.',
    verified_purchase: true, helpful_count: 16, created_at: '2026-01-20T11:00:00Z',
  },
  {
    id: 'rev-10b', product_id: 'prod-10', profile_id: 'profile-135', academy_id: 'academy-1',
    author_name: 'Beatriz Monteiro', rating: 4,
    title: 'Otima mas sem rodinhas',
    body: 'Otima bolsa, bastante espacosa. A alca e bem confortavel. Seria perfeita se tivesse rodinhas.',
    verified_purchase: true, helpful_count: 4, created_at: '2026-02-08T15:00:00Z',
  },
  {
    id: 'rev-10c', product_id: 'prod-10', profile_id: 'profile-136', academy_id: 'academy-1',
    author_name: 'Roberto Fonseca', rating: 4,
    title: 'Material resistente',
    body: 'Uso todo dia para ir ao treino. Material resistente e os zippers sao de boa qualidade. Recomendo.',
    verified_purchase: true, helpful_count: 5, created_at: '2026-03-01T09:30:00Z',
  },

  // ── prod-11 Whey Protein Isolado (4 reviews) ──
  {
    id: 'rev-11a', product_id: 'prod-11', profile_id: 'profile-137', academy_id: 'academy-1',
    author_name: 'Andre Machado', rating: 5,
    title: 'Chocolate muito bom',
    body: 'Sabor chocolate muito bom, dissolve facil e nao fica com gosto artificial. Senti diferenca na recuperacao dos treinos.',
    verified_purchase: true, helpful_count: 8, created_at: '2026-02-15T08:30:00Z',
  },
  {
    id: 'rev-11b', product_id: 'prod-11', profile_id: 'profile-138', academy_id: 'academy-1',
    author_name: 'Simone Barros', rating: 4,
    title: 'Zero lactose como prometido',
    body: 'Bom whey isolado, zero lactose como prometido. Tomo pos-treino de jiu-jitsu e sinto menos dor muscular.',
    verified_purchase: true, helpful_count: 6, created_at: '2026-02-22T14:00:00Z',
  },
  {
    id: 'rev-11c', product_id: 'prod-11', profile_id: 'profile-139', academy_id: 'academy-1',
    author_name: 'Ricardo Nogueira', rating: 5,
    title: 'Baunilha e o melhor sabor',
    body: 'Melhor custo-beneficio de whey isolado. 27g de proteina por dose e excelente. Sabor baunilha e o melhor!',
    verified_purchase: true, helpful_count: 12, created_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'rev-11d', product_id: 'prod-11', profile_id: 'profile-140', academy_id: 'academy-1',
    author_name: 'Vanessa Reis', rating: 4,
    title: 'Morango gostoso',
    body: 'Sabor morango e gostoso, textura boa. Preco justo para um isolado de qualidade.',
    verified_purchase: true, helpful_count: 3, created_at: '2026-03-12T16:30:00Z',
  },

  // ── prod-12 Creatina Monohidratada (3 reviews) ──
  {
    id: 'rev-12a', product_id: 'prod-12', profile_id: 'profile-141', academy_id: 'academy-1',
    author_name: 'Hugo Fernandes', rating: 5,
    title: 'Senti aumento de forca em 2 semanas',
    body: 'Creatina pura, sem sabor. Dissolve facil na agua. Senti aumento de forca nos treinos de jiu-jitsu em 2 semanas.',
    verified_purchase: true, helpful_count: 15, created_at: '2026-02-20T09:00:00Z',
  },
  {
    id: 'rev-12b', product_id: 'prod-12', profile_id: 'profile-142', academy_id: 'academy-1',
    author_name: 'Debora Correia', rating: 5,
    title: 'Nao causa desconforto',
    body: 'Excelente creatina micronizada. Nao causa desconforto estomacal. Uso 3g por dia como recomendado e sinto muita diferenca.',
    verified_purchase: true, helpful_count: 10, created_at: '2026-03-01T11:30:00Z',
  },
  {
    id: 'rev-12c', product_id: 'prod-12', profile_id: 'profile-143', academy_id: 'academy-1',
    author_name: 'Fabio Melo', rating: 4,
    title: 'Boa creatina, preco honesto',
    body: 'Boa creatina, preco honesto. Rende bastante com 3g por dia. Embalagem pratica.',
    verified_purchase: true, helpful_count: 4, created_at: '2026-03-10T14:00:00Z',
  },

  // ── prod-13 Quimono Infantil Branco (3 reviews) ──
  {
    id: 'rev-13a', product_id: 'prod-13', profile_id: 'profile-144', academy_id: 'academy-1',
    author_name: 'Sandra Oliveira', rating: 5,
    title: 'Meu filho amou',
    body: 'Comprei para meu filho de 8 anos e ficou perfeito! Tecido leve para as criancas e muito resistente. Ele ama!',
    size_purchased: 'M2 (8-10 anos)', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 9, created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'rev-13b', product_id: 'prod-13', profile_id: 'profile-145', academy_id: 'academy-1',
    author_name: 'Marcelo Prado', rating: 4,
    title: 'Um pouco grande mas vai servir',
    body: 'Bom quimono infantil. Minha filha de 6 anos usa o M1 e ficou um pouco grande, mas ela vai crescer. Qualidade boa.',
    size_purchased: 'M1 (6-7 anos)', size_feedback: 'large',
    verified_purchase: true, helpful_count: 7, created_at: '2026-02-15T13:30:00Z',
  },
  {
    id: 'rev-13c', product_id: 'prod-13', profile_id: 'profile-146', academy_id: 'academy-1',
    author_name: 'Claudia Ramos', rating: 4,
    title: 'Bom custo-beneficio infantil',
    body: 'Otimo custo-beneficio para quimono infantil. As criancas crescem rapido, entao nao compensa gastar muito. Este e perfeito.',
    size_purchased: 'M2 (8-10 anos)', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 5, created_at: '2026-03-05T09:00:00Z',
  },

  // ── prod-14 Short de Luta No-Gi (3 reviews) ──
  {
    id: 'rev-14a', product_id: 'prod-14', profile_id: 'profile-147', academy_id: 'academy-1',
    author_name: 'Paulo Henrique', rating: 4,
    title: 'Liberdade total de movimento',
    body: 'Short muito bom para no-gi. A abertura lateral da liberdade total de movimento. Tecido resistente.',
    size_purchased: 'M', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 6, created_at: '2026-02-10T11:00:00Z',
  },
  {
    id: 'rev-14b', product_id: 'prod-14', profile_id: 'profile-148', academy_id: 'academy-1',
    author_name: 'Michele Souza', rating: 4,
    title: 'Confortavel e bonito',
    body: 'Gostei do short, e confortavel e bonito. O cordao interno segura bem. Pena que esgotou rapido!',
    size_purchased: 'P', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 4, created_at: '2026-02-20T14:30:00Z',
  },
  {
    id: 'rev-14c', product_id: 'prod-14', profile_id: 'profile-149', academy_id: 'academy-1',
    author_name: 'Wagner Costa', rating: 3,
    title: 'Acabamento poderia ser melhor',
    body: 'Short razoavel. O stretch e bom mas senti que o acabamento poderia ser melhor nas costuras laterais.',
    size_purchased: 'G', size_feedback: 'perfect',
    verified_purchase: false, helpful_count: 2, created_at: '2026-03-01T10:00:00Z',
  },

  // ── prod-15 Camiseta Dry-Fit da Academia (3 reviews) ──
  {
    id: 'rev-15a', product_id: 'prod-15', profile_id: 'profile-150', academy_id: 'academy-1',
    author_name: 'Luciana Matos', rating: 5,
    title: 'Uso no treino e no dia a dia',
    body: 'Camiseta muito bonita com o logo da academia! Uso tanto no treino quanto no dia a dia. Tecido leve e confortavel.',
    size_purchased: 'M', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 8, created_at: '2026-02-25T09:00:00Z',
  },
  {
    id: 'rev-15b', product_id: 'prod-15', profile_id: 'profile-151', academy_id: 'academy-1',
    author_name: 'Sergio Andrade', rating: 4,
    title: 'Seca rapido sem cheiro',
    body: 'Boa camiseta dry-fit, seca rapido e nao fica com cheiro. O logo estampado e de qualidade.',
    size_purchased: 'G', size_feedback: 'perfect',
    verified_purchase: true, helpful_count: 5, created_at: '2026-03-05T14:00:00Z',
  },
  {
    id: 'rev-15c', product_id: 'prod-15', profile_id: 'profile-152', academy_id: 'academy-1',
    author_name: 'Natalia Farias', rating: 3,
    title: 'G ficou apertado',
    body: 'Camiseta ok, mas achei que o tamanho G ficou um pouco apertado comparado com outras marcas. Qualidade do tecido e boa.',
    size_purchased: 'G', size_feedback: 'small',
    verified_purchase: true, helpful_count: 11, created_at: '2026-03-13T11:30:00Z',
  },
];

/* ════════════════════════════════════════════════════════════════ */
/*  MOCK FUNCTIONS -- Products (EXISTING)                         */
/* ════════════════════════════════════════════════════════════════ */

export async function mockListProducts(_academyId: string, filters?: ProductFilters): Promise<Product[]> {
  await delay();
  let result = [...PRODUCTS];
  if (filters?.category) result = result.filter((p) => p.category === filters.category);
  if (filters?.status) result = result.filter((p) => p.status === filters.status);
  if (filters?.featured) result = result.filter((p) => p.featured);
  if (filters?.low_stock) result = result.filter((p) => p.stock_total <= p.low_stock_alert);
  if (filters?.modality) result = result.filter((p) => p.modality === filters.modality);
  if (filters?.price_min !== undefined) result = result.filter((p) => p.price >= filters.price_min!);
  if (filters?.price_max !== undefined) result = result.filter((p) => p.price <= filters.price_max!);
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
    is_featured: data.featured,
    sold_count: 0,
    rating_avg: 0,
    rating_count: 0,
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

/* ════════════════════════════════════════════════════════════════ */
/*  MOCK FUNCTIONS -- Categories                                  */
/* ════════════════════════════════════════════════════════════════ */

export async function mockListCategories(_academyId: string): Promise<CategoryDTO[]> {
  await delay();
  return CATEGORIES.map((c) => ({ ...c }));
}

export async function mockCreateCategory(
  academyId: string,
  data: { name: string; slug: string; icon?: string; sort_order?: number },
): Promise<CategoryDTO> {
  await delay();
  const cat: CategoryDTO = {
    id: uuid(),
    academy_id: academyId,
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    sort_order: data.sort_order ?? CATEGORIES.length,
    created_at: new Date().toISOString(),
  };
  CATEGORIES.push(cat);
  return { ...cat };
}

export async function mockUpdateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; icon: string; sort_order: number }>,
): Promise<CategoryDTO> {
  await delay();
  const idx = CATEGORIES.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  CATEGORIES[idx] = { ...CATEGORIES[idx], ...data };
  return { ...CATEGORIES[idx] };
}

export async function mockDeleteCategory(id: string): Promise<void> {
  await delay();
  const idx = CATEGORIES.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  CATEGORIES.splice(idx, 1);
}

export async function mockSeedDefaultCategories(academyId: string): Promise<CategoryDTO[]> {
  await delay();
  const defaults: { name: string; slug: string; icon: string; sort_order: number }[] = [
    { name: 'Kimonos', slug: 'kimonos', icon: '\u{1F94B}', sort_order: 0 },
    { name: 'Faixas', slug: 'faixas', icon: '\u{1F397}\uFE0F', sort_order: 1 },
    { name: 'Rashguards', slug: 'rashguards', icon: '\u{1F455}', sort_order: 2 },
    { name: 'Shorts/Calcas', slug: 'shorts-calcas', icon: '\u{1FA73}', sort_order: 3 },
    { name: 'Luvas/Protetores', slug: 'luvas-protetores', icon: '\u{1F94A}', sort_order: 4 },
    { name: 'Equipamentos', slug: 'equipamentos', icon: '\u{1F3CB}\uFE0F', sort_order: 5 },
    { name: 'Acessorios', slug: 'acessorios', icon: '\u{1F392}', sort_order: 6 },
    { name: 'Suplementos', slug: 'suplementos', icon: '\u{1F48A}', sort_order: 7 },
  ];
  const now = new Date().toISOString();
  const seeded: CategoryDTO[] = defaults.map((d) => ({
    ...d,
    id: `cat-${d.slug}`,
    academy_id: academyId,
    created_at: now,
  }));
  // Replace existing categories for this academy
  const existingIds = new Set(CATEGORIES.filter((c) => c.academy_id === academyId).map((c) => c.id));
  for (let i = CATEGORIES.length - 1; i >= 0; i--) {
    if (existingIds.has(CATEGORIES[i].id)) CATEGORIES.splice(i, 1);
  }
  CATEGORIES.push(...seeded);
  return seeded.map((c) => ({ ...c }));
}

/* ════════════════════════════════════════════════════════════════ */
/*  MOCK FUNCTIONS -- Size Guides                                 */
/* ════════════════════════════════════════════════════════════════ */

export async function mockListSizeGuides(_academyId: string): Promise<SizeGuideDTO[]> {
  await delay();
  return SIZE_GUIDES.map((g) => ({ ...g, sizes: [...g.sizes] }));
}

export async function mockGetSizeGuide(id: string): Promise<SizeGuideDTO> {
  await delay();
  const guide = SIZE_GUIDES.find((g) => g.id === id);
  if (!guide) throw new Error('Size guide not found');
  return { ...guide, sizes: [...guide.sizes] };
}

export async function mockCreateSizeGuide(
  academyId: string,
  data: { name: string; category_id?: string; sizes: SizeEntry[]; tips?: string },
): Promise<SizeGuideDTO> {
  await delay();
  const guide: SizeGuideDTO = {
    id: uuid(),
    academy_id: academyId,
    name: data.name,
    category_id: data.category_id,
    sizes: [...data.sizes],
    tips: data.tips,
    created_at: new Date().toISOString(),
  };
  SIZE_GUIDES.push(guide);
  return { ...guide, sizes: [...guide.sizes] };
}

export async function mockUpdateSizeGuide(
  id: string,
  data: Partial<{ name: string; category_id: string; sizes: SizeEntry[]; tips: string }>,
): Promise<SizeGuideDTO> {
  await delay();
  const idx = SIZE_GUIDES.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error('Size guide not found');
  if (data.name !== undefined) SIZE_GUIDES[idx].name = data.name;
  if (data.category_id !== undefined) SIZE_GUIDES[idx].category_id = data.category_id;
  if (data.sizes !== undefined) SIZE_GUIDES[idx].sizes = [...data.sizes];
  if (data.tips !== undefined) SIZE_GUIDES[idx].tips = data.tips;
  return { ...SIZE_GUIDES[idx], sizes: [...SIZE_GUIDES[idx].sizes] };
}

export async function mockDeleteSizeGuide(id: string): Promise<void> {
  await delay();
  const idx = SIZE_GUIDES.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error('Size guide not found');
  SIZE_GUIDES.splice(idx, 1);
}

export function mockGetDefaultSizeGuides(): SizeGuideDTO[] {
  return [
    {
      id: 'default-kimono-bjj', academy_id: '', name: 'Kimonos BJJ',
      tips: 'Meca com o kimono seco. Considere que o tecido pode encolher 3-5% na primeira lavagem.',
      sizes: [
        { label: 'A0', height_cm: 155, weight_kg: 50 },
        { label: 'A1', height_cm: 165, weight_kg: 64 },
        { label: 'A2', height_cm: 175, weight_kg: 80 },
        { label: 'A3', height_cm: 183, weight_kg: 95 },
        { label: 'A4', height_cm: 190, weight_kg: 110 },
        { label: 'A5', height_cm: 198, weight_kg: 130 },
      ],
      created_at: '',
    },
    {
      id: 'default-rashguard', academy_id: '', name: 'Rashguards',
      tips: 'Rashguards devem ficar bem ajustados ao corpo. Na duvida entre dois tamanhos, escolha o menor.',
      sizes: [
        { label: 'P', chest_cm: 86, height_cm: 165, weight_kg: 60 },
        { label: 'M', chest_cm: 94, height_cm: 173, weight_kg: 75 },
        { label: 'G', chest_cm: 102, height_cm: 180, weight_kg: 90 },
        { label: 'GG', chest_cm: 110, height_cm: 188, weight_kg: 105 },
        { label: 'XG', chest_cm: 118, height_cm: 195, weight_kg: 120 },
      ],
      created_at: '',
    },
    {
      id: 'default-faixas', academy_id: '', name: 'Faixas',
      tips: 'O comprimento da faixa deve permitir dar duas voltas na cintura e ainda sobrar para o no.',
      sizes: [
        { label: 'A0', length_cm: 230 },
        { label: 'A1', length_cm: 260 },
        { label: 'A2', length_cm: 280 },
        { label: 'A3', length_cm: 300 },
        { label: 'A4', length_cm: 320 },
      ],
      created_at: '',
    },
  ];
}

/* ════════════════════════════════════════════════════════════════ */
/*  MOCK FUNCTIONS -- Structured Variants                         */
/* ════════════════════════════════════════════════════════════════ */

export async function mockListVariants(productId: string): Promise<StructuredVariant[]> {
  await delay();
  return STRUCTURED_VARIANTS
    .filter((v) => v.product_id === productId)
    .map((v) => ({ ...v }));
}

export async function mockCreateVariant(
  productId: string,
  data: Omit<StructuredVariant, 'id' | 'product_id'>,
): Promise<StructuredVariant> {
  await delay();
  const variant: StructuredVariant = {
    id: uuid(),
    product_id: productId,
    ...data,
  };
  STRUCTURED_VARIANTS.push(variant);
  // Keep PRODUCTS array in sync
  const product = PRODUCTS.find((p) => p.id === productId);
  if (product) {
    product.variants.push({
      id: variant.id,
      name: [variant.size, variant.color].filter(Boolean).join(' / ') || 'Default',
      sku: variant.sku || '',
      stock: variant.stock,
      price: variant.price_cents / 100,
    });
    product.stock_total = product.variants.reduce((s, v) => s + v.stock, 0);
  }
  return { ...variant };
}

export async function mockUpdateVariant(
  variantId: string,
  data: Partial<Omit<StructuredVariant, 'id' | 'product_id'>>,
): Promise<StructuredVariant> {
  await delay();
  const idx = STRUCTURED_VARIANTS.findIndex((v) => v.id === variantId);
  if (idx === -1) throw new Error('Variant not found');
  STRUCTURED_VARIANTS[idx] = { ...STRUCTURED_VARIANTS[idx], ...data };
  // Sync back to PRODUCTS
  const pv = PRODUCTS.flatMap((p) => p.variants).find((v) => v.id === variantId);
  if (pv) {
    if (data.size !== undefined) pv.name = data.size;
    if (data.sku !== undefined) pv.sku = data.sku;
    if (data.stock !== undefined) pv.stock = data.stock;
    if (data.price_cents !== undefined) pv.price = data.price_cents / 100;
    const product = PRODUCTS.find((p) => p.variants.some((v) => v.id === variantId));
    if (product) product.stock_total = product.variants.reduce((s, v) => s + v.stock, 0);
  }
  return { ...STRUCTURED_VARIANTS[idx] };
}

export async function mockDeleteVariant(variantId: string): Promise<void> {
  await delay();
  const idx = STRUCTURED_VARIANTS.findIndex((v) => v.id === variantId);
  if (idx === -1) throw new Error('Variant not found');
  const productId = STRUCTURED_VARIANTS[idx].product_id;
  STRUCTURED_VARIANTS.splice(idx, 1);
  const product = PRODUCTS.find((p) => p.id === productId);
  if (product) {
    const pvIdx = product.variants.findIndex((v) => v.id === variantId);
    if (pvIdx !== -1) product.variants.splice(pvIdx, 1);
    product.stock_total = product.variants.reduce((s, v) => s + v.stock, 0);
  }
}

/* ════════════════════════════════════════════════════════════════ */
/*  MOCK FUNCTIONS -- Reviews                                     */
/* ════════════════════════════════════════════════════════════════ */

export async function mockListReviews(productId: string): Promise<ReviewDTO[]> {
  await delay();
  return REVIEWS
    .filter((r) => r.product_id === productId)
    .map((r) => ({ ...r }));
}

export async function mockCreateReview(
  productId: string,
  profileId: string,
  academyId: string,
  data: {
    rating: number;
    title?: string;
    body?: string;
    size_purchased?: string;
    size_feedback?: string;
  },
): Promise<ReviewDTO> {
  await delay();
  const review: ReviewDTO = {
    id: uuid(),
    product_id: productId,
    profile_id: profileId,
    academy_id: academyId,
    rating: data.rating,
    title: data.title,
    body: data.body,
    size_purchased: data.size_purchased,
    size_feedback: data.size_feedback,
    verified_purchase: true,
    helpful_count: 0,
    created_at: new Date().toISOString(),
  };
  REVIEWS.push(review);
  // Update product rating
  const productReviews = REVIEWS.filter((r) => r.product_id === productId);
  const product = PRODUCTS.find((p) => p.id === productId);
  if (product) {
    product.rating_count = productReviews.length;
    product.rating_avg = Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10) / 10;
  }
  return { ...review };
}

export async function mockGetProductRating(productId: string): Promise<{ avg: number; count: number }> {
  await delay();
  const productReviews = REVIEWS.filter((r) => r.product_id === productId);
  if (productReviews.length === 0) return { avg: 0, count: 0 };
  const avg = Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length) * 10) / 10;
  return { avg, count: productReviews.length };
}

/* ════════════════════════════════════════════════════════════════ */
/*  MOCK FUNCTIONS -- Utility                                     */
/* ════════════════════════════════════════════════════════════════ */

export async function mockToggleFeatured(productId: string): Promise<boolean> {
  await delay();
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) throw new Error('Product not found');
  product.featured = !product.featured;
  product.is_featured = product.featured;
  product.updated_at = new Date().toISOString();
  return product.featured;
}

export async function mockUpdateStock(variantId: string, delta: number): Promise<void> {
  await delay();
  // Update structured variant
  const sv = STRUCTURED_VARIANTS.find((v) => v.id === variantId);
  if (!sv) throw new Error('Variant not found');
  sv.stock = Math.max(0, sv.stock + delta);
  sv.is_active = sv.stock > 0;
  // Sync to product variants
  const product = PRODUCTS.find((p) => p.id === sv.product_id);
  if (product) {
    const pv = product.variants.find((v) => v.id === variantId);
    if (pv) pv.stock = sv.stock;
    product.stock_total = product.variants.reduce((s, v) => s + v.stock, 0);
    product.status = product.stock_total === 0 ? 'out_of_stock' : 'active';
    product.updated_at = new Date().toISOString();
  }
}
