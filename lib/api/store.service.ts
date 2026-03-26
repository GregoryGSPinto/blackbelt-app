import { isMock } from '@/lib/env';

// ===========================================================================
// 1. TYPES
// ===========================================================================

/** Backward-compatible product category slug */
export type ProductCategory =
  | 'quimono'
  | 'faixa'
  | 'equipamento'
  | 'acessorio'
  | 'vestuario'
  | 'suplemento';

/** Backward-compatible product status */
export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

/** Backward-compatible simple variant (kept for existing pages) */
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price?: number;
}

/** Product — backward-compatible with new optional marketplace fields */
export interface Product {
  id: string;
  academy_id: string;
  name: string;
  description: string;
  images: string[];
  category: ProductCategory;
  price: number;
  compare_at_price?: number;
  variants: ProductVariant[];
  stock_total: number;
  low_stock_alert: number;
  status: ProductStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  /* New marketplace fields (all optional for backward compat) */
  category_id?: string;
  size_guide_id?: string;
  modality?: string;
  brand?: string;
  material?: string;
  weight_grams?: number;
  is_featured?: boolean;
  sold_count?: number;
  rating_avg?: number;
  rating_count?: number;
}

/** Backward-compatible product filters with new marketplace additions */
export interface ProductFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  search?: string;
  featured?: boolean;
  low_stock?: boolean;
  /* New marketplace filters */
  modality?: string;
  price_min?: number;
  price_max?: number;
}

/** Backward-compatible create-product payload */
export interface CreateProductData {
  name: string;
  description: string;
  images: string[];
  category: ProductCategory;
  price: number;
  compare_at_price?: number;
  variants: Omit<ProductVariant, 'id'>[];
  low_stock_alert: number;
  status: ProductStatus;
  featured: boolean;
}

// ---- New DTOs ----

/** Category row returned from `product_categories` */
export interface CategoryDTO {
  id: string;
  academy_id: string;
  name: string;
  slug: string;
  icon?: string;
  sort_order: number;
  created_at: string;
  product_count?: number;
}

/** Single size entry inside a size guide */
export interface SizeEntry {
  label: string;
  chest_cm?: number;
  height_cm?: number;
  weight_kg?: number;
  length_cm?: number;
}

/** Size guide row returned from `size_guides` */
export interface SizeGuideDTO {
  id: string;
  academy_id: string;
  category_id?: string;
  name: string;
  sizes: SizeEntry[];
  tips?: string;
  created_at: string;
}

/** Structured variant row from `product_variants` (new schema) */
export interface StructuredVariant {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  color_hex?: string;
  sku?: string;
  price_cents: number;
  compare_at_price_cents?: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
}

/** Review row from `product_reviews` */
export interface ReviewDTO {
  id: string;
  product_id: string;
  profile_id: string;
  academy_id: string;
  rating: number;
  title?: string;
  body?: string;
  size_purchased?: string;
  size_feedback?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  author_name?: string;
}

// ===========================================================================
// Helper — empty product used as fallback
// ===========================================================================

function emptyProduct(id: string): Product {
  return {
    id,
    academy_id: '',
    name: '',
    description: '',
    images: [],
    category: 'acessorio',
    price: 0,
    variants: [],
    stock_total: 0,
    low_stock_alert: 0,
    status: 'draft',
    featured: false,
    created_at: '',
    updated_at: '',
  };
}

// ===========================================================================
// 2. CATEGORY FUNCTIONS
// ===========================================================================

export async function listCategories(academyId: string): Promise<CategoryDTO[]> {
  try {
    if (isMock()) {
      const { mockListCategories } = await import('@/lib/mocks/store.mock');
      return mockListCategories(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('academy_id', academyId)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.error('[listCategories] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as CategoryDTO[];
  } catch (error) {
    console.error('[listCategories] Fallback:', error);
    return [];
  }
}

export async function createCategory(
  academyId: string,
  data: { name: string; slug: string; icon?: string; sort_order?: number },
): Promise<CategoryDTO> {
  try {
    if (isMock()) {
      const { mockCreateCategory } = await import('@/lib/mocks/store.mock');
      return mockCreateCategory(academyId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('product_categories')
      .insert({ academy_id: academyId, ...data })
      .select()
      .single();

    if (error || !row) {
      console.error('[createCategory] Supabase error:', error?.message);
      return {
        id: '',
        academy_id: academyId,
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        sort_order: data.sort_order ?? 0,
        created_at: '',
      };
    }

    return row as unknown as CategoryDTO;
  } catch (error) {
    console.error('[createCategory] Fallback:', error);
    return {
      id: '',
      academy_id: academyId,
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      sort_order: data.sort_order ?? 0,
      created_at: '',
    };
  }
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; icon: string; sort_order: number }>,
): Promise<CategoryDTO> {
  try {
    if (isMock()) {
      const { mockUpdateCategory } = await import('@/lib/mocks/store.mock');
      return mockUpdateCategory(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('product_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      console.error('[updateCategory] Supabase error:', error?.message);
      return { id, academy_id: '', name: '', slug: '', sort_order: 0, created_at: '' };
    }

    return row as unknown as CategoryDTO;
  } catch (error) {
    console.error('[updateCategory] Fallback:', error);
    return { id, academy_id: '', name: '', slug: '', sort_order: 0, created_at: '' };
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteCategory } = await import('@/lib/mocks/store.mock');
      return mockDeleteCategory(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteCategory] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[deleteCategory] Fallback:', error);
  }
}

const DEFAULT_CATEGORIES: { name: string; slug: string; icon: string; sort_order: number }[] = [
  { name: 'Kimonos', slug: 'kimonos', icon: '\u{1F94B}', sort_order: 1 },
  { name: 'Faixas', slug: 'faixas', icon: '\u{1F397}\uFE0F', sort_order: 2 },
  { name: 'Rashguards', slug: 'rashguards', icon: '\u{1F455}', sort_order: 3 },
  { name: 'Shorts/Calcas', slug: 'shorts-calcas', icon: '\u{1FA73}', sort_order: 4 },
  { name: 'Luvas/Protetores', slug: 'luvas-protetores', icon: '\u{1F94A}', sort_order: 5 },
  { name: 'Equipamentos', slug: 'equipamentos', icon: '\u{1F3CB}\uFE0F', sort_order: 6 },
  { name: 'Acessorios', slug: 'acessorios', icon: '\u{1F392}', sort_order: 7 },
  { name: 'Suplementos', slug: 'suplementos', icon: '\u{1F48A}', sort_order: 8 },
];

export async function seedDefaultCategories(academyId: string): Promise<CategoryDTO[]> {
  try {
    if (isMock()) {
      const { mockSeedDefaultCategories } = await import('@/lib/mocks/store.mock');
      return mockSeedDefaultCategories(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const rows = DEFAULT_CATEGORIES.map((c) => ({ academy_id: academyId, ...c }));

    const { data, error } = await supabase
      .from('product_categories')
      .upsert(rows, { onConflict: 'academy_id,slug' })
      .select();

    if (error || !data) {
      console.error('[seedDefaultCategories] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as CategoryDTO[];
  } catch (error) {
    console.error('[seedDefaultCategories] Fallback:', error);
    return [];
  }
}

// ===========================================================================
// 3. SIZE GUIDE FUNCTIONS
// ===========================================================================

export async function listSizeGuides(academyId: string): Promise<SizeGuideDTO[]> {
  try {
    if (isMock()) {
      const { mockListSizeGuides } = await import('@/lib/mocks/store.mock');
      return mockListSizeGuides(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('size_guides')
      .select('*')
      .eq('academy_id', academyId)
      .order('name', { ascending: true });

    if (error || !data) {
      console.error('[listSizeGuides] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as SizeGuideDTO[];
  } catch (error) {
    console.error('[listSizeGuides] Fallback:', error);
    return [];
  }
}

export async function getSizeGuide(id: string): Promise<SizeGuideDTO> {
  try {
    if (isMock()) {
      const { mockGetSizeGuide } = await import('@/lib/mocks/store.mock');
      return mockGetSizeGuide(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('size_guides')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[getSizeGuide] Supabase error:', error?.message);
      return { id, academy_id: '', name: '', sizes: [], created_at: '' };
    }

    return data as unknown as SizeGuideDTO;
  } catch (error) {
    console.error('[getSizeGuide] Fallback:', error);
    return { id, academy_id: '', name: '', sizes: [], created_at: '' };
  }
}

export async function createSizeGuide(
  academyId: string,
  data: { name: string; category_id?: string; sizes: SizeEntry[]; tips?: string },
): Promise<SizeGuideDTO> {
  try {
    if (isMock()) {
      const { mockCreateSizeGuide } = await import('@/lib/mocks/store.mock');
      return mockCreateSizeGuide(academyId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('size_guides')
      .insert({ academy_id: academyId, ...data })
      .select()
      .single();

    if (error || !row) {
      console.error('[createSizeGuide] Supabase error:', error?.message);
      return {
        id: '',
        academy_id: academyId,
        name: data.name,
        category_id: data.category_id,
        sizes: data.sizes,
        tips: data.tips,
        created_at: '',
      };
    }

    return row as unknown as SizeGuideDTO;
  } catch (error) {
    console.error('[createSizeGuide] Fallback:', error);
    return {
      id: '',
      academy_id: academyId,
      name: data.name,
      category_id: data.category_id,
      sizes: data.sizes,
      tips: data.tips,
      created_at: '',
    };
  }
}

export async function updateSizeGuide(
  id: string,
  data: Partial<{ name: string; category_id: string; sizes: SizeEntry[]; tips: string }>,
): Promise<SizeGuideDTO> {
  try {
    if (isMock()) {
      const { mockUpdateSizeGuide } = await import('@/lib/mocks/store.mock');
      return mockUpdateSizeGuide(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('size_guides')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      console.error('[updateSizeGuide] Supabase error:', error?.message);
      return { id, academy_id: '', name: '', sizes: [], created_at: '' };
    }

    return row as unknown as SizeGuideDTO;
  } catch (error) {
    console.error('[updateSizeGuide] Fallback:', error);
    return { id, academy_id: '', name: '', sizes: [], created_at: '' };
  }
}

export async function deleteSizeGuide(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteSizeGuide } = await import('@/lib/mocks/store.mock');
      return mockDeleteSizeGuide(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('size_guides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteSizeGuide] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[deleteSizeGuide] Fallback:', error);
  }
}

/** Returns sensible default size guides for KIMONOS BJJ, RASHGUARDS, and FAIXAS */
export function getDefaultSizeGuides(): SizeGuideDTO[] {
  if (isMock()) {
    // Synchronous — static data, no dynamic import needed.
  }

  const now = new Date().toISOString();

  return [
    {
      id: 'default-kimono-bjj',
      academy_id: '',
      category_id: undefined,
      name: 'Kimonos BJJ',
      tips: 'Meca com o kimono seco. Considere que o tecido pode encolher 3-5% na primeira lavagem.',
      created_at: now,
      sizes: [
        { label: 'A0', height_cm: 155, weight_kg: 50 },
        { label: 'A1', height_cm: 165, weight_kg: 64 },
        { label: 'A2', height_cm: 175, weight_kg: 80 },
        { label: 'A3', height_cm: 183, weight_kg: 95 },
        { label: 'A4', height_cm: 190, weight_kg: 110 },
        { label: 'A5', height_cm: 198, weight_kg: 130 },
      ],
    },
    {
      id: 'default-rashguard',
      academy_id: '',
      category_id: undefined,
      name: 'Rashguards',
      tips: 'Rashguards devem ficar bem ajustados ao corpo. Na duvida entre dois tamanhos, escolha o menor.',
      created_at: now,
      sizes: [
        { label: 'P', chest_cm: 86, height_cm: 165, weight_kg: 60 },
        { label: 'M', chest_cm: 94, height_cm: 173, weight_kg: 75 },
        { label: 'G', chest_cm: 102, height_cm: 180, weight_kg: 90 },
        { label: 'GG', chest_cm: 110, height_cm: 188, weight_kg: 105 },
        { label: 'XG', chest_cm: 118, height_cm: 195, weight_kg: 120 },
      ],
    },
    {
      id: 'default-faixas',
      academy_id: '',
      category_id: undefined,
      name: 'Faixas',
      tips: 'O comprimento da faixa deve permitir dar duas voltas na cintura e ainda sobrar para o no.',
      created_at: now,
      sizes: [
        { label: 'A0', length_cm: 235 },
        { label: 'A1', length_cm: 255 },
        { label: 'A2', length_cm: 275 },
        { label: 'A3', length_cm: 295 },
        { label: 'A4', length_cm: 315 },
      ],
    },
  ];
}

// ===========================================================================
// 4. PRODUCT FUNCTIONS (enhanced existing)
// ===========================================================================

export async function listProducts(academyId: string, filters?: ProductFilters): Promise<Product[]> {
  try {
    if (isMock()) {
      const { mockListProducts } = await import('@/lib/mocks/store.mock');
      return mockListProducts(academyId, filters);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase.from('products').select('*').eq('academy_id', academyId);

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.featured !== undefined) query = query.eq('featured', filters.featured);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters?.modality) query = query.eq('modality', filters.modality);
    if (filters?.price_min !== undefined) query = query.gte('price', filters.price_min);
    if (filters?.price_max !== undefined) query = query.lte('price', filters.price_max);

    const { data, error } = await query;

    if (error || !data) {
      console.error('[listProducts] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as Product[];
  } catch (error) {
    console.error('[listProducts] Fallback:', error);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    if (isMock()) {
      const { mockGetProduct } = await import('@/lib/mocks/store.mock');
      return mockGetProduct(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch the product row
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[getProduct] Supabase error:', error?.message);
      return emptyProduct(id);
    }

    // Also fetch structured variants and reviews in parallel
    const [variantsRes, reviewsRes] = await Promise.all([
      supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false }),
    ]);

    const product = data as unknown as Product;

    // Attach structured variants as the legacy `variants` array when legacy variants are empty
    if (
      (!product.variants || product.variants.length === 0) &&
      variantsRes.data &&
      variantsRes.data.length > 0
    ) {
      product.variants = (variantsRes.data as unknown as StructuredVariant[]).map((sv) => ({
        id: sv.id,
        name: [sv.size, sv.color].filter(Boolean).join(' / ') || 'Default',
        sku: sv.sku || '',
        stock: sv.stock,
        price: sv.price_cents / 100,
      }));
    }

    // Compute rating from reviews if not already present on the row
    if (reviewsRes.data && reviewsRes.data.length > 0) {
      const reviews = reviewsRes.data as unknown as ReviewDTO[];
      product.rating_count = reviews.length;
      product.rating_avg =
        Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
    }

    return product;
  } catch (error) {
    console.error('[getProduct] Fallback:', error);
    return emptyProduct(id);
  }
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  try {
    if (isMock()) {
      const { mockCreateProduct } = await import('@/lib/mocks/store.mock');
      return mockCreateProduct(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();

    if (error || !row) {
      console.error('[createProduct] Supabase error:', error?.message);
      return {
        id: '',
        academy_id: '',
        ...data,
        stock_total: 0,
        variants: [],
        created_at: '',
        updated_at: '',
      } as unknown as Product;
    }

    return row as unknown as Product;
  } catch (error) {
    console.error('[createProduct] Fallback:', error);
    return {
      id: '',
      academy_id: '',
      ...data,
      stock_total: 0,
      variants: [],
      created_at: '',
      updated_at: '',
    } as unknown as Product;
  }
}

export async function updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
  try {
    if (isMock()) {
      const { mockUpdateProduct } = await import('@/lib/mocks/store.mock');
      return mockUpdateProduct(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      console.error('[updateProduct] Supabase error:', error?.message);
      return emptyProduct(id);
    }

    return row as unknown as Product;
  } catch (error) {
    console.error('[updateProduct] Fallback:', error);
    return emptyProduct(id);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteProduct } = await import('@/lib/mocks/store.mock');
      return mockDeleteProduct(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteProduct] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[deleteProduct] Fallback:', error);
  }
}

/** Toggle the `is_featured` flag on a product. Returns the new value. */
export async function toggleFeatured(productId: string): Promise<boolean> {
  try {
    if (isMock()) {
      const { mockToggleFeatured } = await import('@/lib/mocks/store.mock');
      return mockToggleFeatured(productId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch current state
    const { data: current, error: fetchError } = await supabase
      .from('products')
      .select('is_featured')
      .eq('id', productId)
      .single();

    if (fetchError || !current) {
      console.error('[toggleFeatured] Supabase fetch error:', fetchError?.message);
      return false;
    }

    const newValue = !current.is_featured;

    const { error: updateError } = await supabase
      .from('products')
      .update({ is_featured: newValue })
      .eq('id', productId);

    if (updateError) {
      console.error('[toggleFeatured] Supabase update error:', updateError.message);
      return false;
    }

    return newValue;
  } catch (error) {
    console.error('[toggleFeatured] Fallback:', error);
    return false;
  }
}

/** Adjust stock of a variant by a signed delta (positive = add, negative = remove). */
export async function updateStock(variantId: string, delta: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdateStock } = await import('@/lib/mocks/store.mock');
      return mockUpdateStock(variantId, delta);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch current stock
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', variantId)
      .single();

    if (fetchError || !variant) {
      console.error('[updateStock] Supabase fetch error:', fetchError?.message);
      return;
    }

    const newStock = Math.max(0, (variant.stock as number) + delta);

    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);

    if (updateError) {
      console.error('[updateStock] Supabase update error:', updateError.message);
    }
  } catch (error) {
    console.error('[updateStock] Fallback:', error);
  }
}

// ===========================================================================
// 5. VARIANT FUNCTIONS
// ===========================================================================

export async function listVariants(productId: string): Promise<StructuredVariant[]> {
  try {
    if (isMock()) {
      const { mockListVariants } = await import('@/lib/mocks/store.mock');
      return mockListVariants(productId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.error('[listVariants] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as StructuredVariant[];
  } catch (error) {
    console.error('[listVariants] Fallback:', error);
    return [];
  }
}

export async function createVariant(
  productId: string,
  data: Omit<StructuredVariant, 'id' | 'product_id'>,
): Promise<StructuredVariant> {
  try {
    if (isMock()) {
      const { mockCreateVariant } = await import('@/lib/mocks/store.mock');
      return mockCreateVariant(productId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('product_variants')
      .insert({ product_id: productId, ...data })
      .select()
      .single();

    if (error || !row) {
      console.error('[createVariant] Supabase error:', error?.message);
      return { id: '', product_id: productId, ...data };
    }

    return row as unknown as StructuredVariant;
  } catch (error) {
    console.error('[createVariant] Fallback:', error);
    return { id: '', product_id: productId, ...data };
  }
}

export async function updateVariant(
  variantId: string,
  data: Partial<Omit<StructuredVariant, 'id' | 'product_id'>>,
): Promise<StructuredVariant> {
  try {
    if (isMock()) {
      const { mockUpdateVariant } = await import('@/lib/mocks/store.mock');
      return mockUpdateVariant(variantId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('product_variants')
      .update(data)
      .eq('id', variantId)
      .select()
      .single();

    if (error || !row) {
      console.error('[updateVariant] Supabase error:', error?.message);
      return {
        id: variantId,
        product_id: '',
        price_cents: 0,
        stock: 0,
        is_active: true,
        sort_order: 0,
        ...data,
      } as StructuredVariant;
    }

    return row as unknown as StructuredVariant;
  } catch (error) {
    console.error('[updateVariant] Fallback:', error);
    return {
      id: variantId,
      product_id: '',
      price_cents: 0,
      stock: 0,
      is_active: true,
      sort_order: 0,
      ...data,
    } as StructuredVariant;
  }
}

export async function deleteVariant(variantId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteVariant } = await import('@/lib/mocks/store.mock');
      return mockDeleteVariant(variantId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) {
      console.error('[deleteVariant] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[deleteVariant] Fallback:', error);
  }
}

// ===========================================================================
// 6. REVIEW FUNCTIONS
// ===========================================================================

export async function listReviews(productId: string): Promise<ReviewDTO[]> {
  try {
    if (isMock()) {
      const { mockListReviews } = await import('@/lib/mocks/store.mock');
      return mockListReviews(productId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[listReviews] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as ReviewDTO[];
  } catch (error) {
    console.error('[listReviews] Fallback:', error);
    return [];
  }
}

export async function createReview(
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
  try {
    if (isMock()) {
      const { mockCreateReview } = await import('@/lib/mocks/store.mock');
      return mockCreateReview(productId, profileId, academyId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        profile_id: profileId,
        academy_id: academyId,
        ...data,
      })
      .select()
      .single();

    if (error || !row) {
      console.error('[createReview] Supabase error:', error?.message);
      return {
        id: '',
        product_id: productId,
        profile_id: profileId,
        academy_id: academyId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        size_purchased: data.size_purchased,
        size_feedback: data.size_feedback,
        verified_purchase: false,
        helpful_count: 0,
        created_at: '',
      };
    }

    return row as unknown as ReviewDTO;
  } catch (error) {
    console.error('[createReview] Fallback:', error);
    return {
      id: '',
      product_id: productId,
      profile_id: profileId,
      academy_id: academyId,
      rating: data.rating,
      title: data.title,
      body: data.body,
      size_purchased: data.size_purchased,
      size_feedback: data.size_feedback,
      verified_purchase: false,
      helpful_count: 0,
      created_at: '',
    };
  }
}

/** Returns the aggregate average and count for a product's reviews. */
export async function getProductRating(
  productId: string,
): Promise<{ avg: number; count: number }> {
  try {
    if (isMock()) {
      const { mockGetProductRating } = await import('@/lib/mocks/store.mock');
      return mockGetProductRating(productId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error || !data || data.length === 0) {
      if (error) console.error('[getProductRating] Supabase error:', error.message);
      return { avg: 0, count: 0 };
    }

    const ratings = data as unknown as { rating: number }[];
    const count = ratings.length;
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / count;

    return { avg: Math.round(avg * 10) / 10, count };
  } catch (error) {
    console.error('[getProductRating] Fallback:', error);
    return { avg: 0, count: 0 };
  }
}
