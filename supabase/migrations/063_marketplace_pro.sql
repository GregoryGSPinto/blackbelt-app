-- ============================================================
-- BlackBelt v2 — Migration 063: Marketplace Pro
-- Categories, size guides, structured variants, reviews, orders
-- ============================================================

-- ── product_categories ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academy_categories ON public.product_categories;
CREATE POLICY academy_categories ON public.product_categories FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));

-- ── size_guides ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.size_guides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sizes jsonb NOT NULL DEFAULT '[]',
  tips text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.size_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academy_size_guides ON public.size_guides;
CREATE POLICY academy_size_guides ON public.size_guides FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));

-- ── Enhance products table ──────────────────────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.product_categories(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_guide_id uuid REFERENCES public.size_guides(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS modality text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_grams int;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_count int DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating_avg numeric(2,1) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating_count int DEFAULT 0;

-- ── product_variants (structured) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size text,
  color text,
  color_hex text,
  sku text,
  price_cents int NOT NULL,
  compare_at_price_cents int,
  stock int DEFAULT 0,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS variants_via_product ON public.product_variants;
CREATE POLICY variants_via_product ON public.product_variants FOR ALL
  USING (product_id IN (SELECT id FROM public.products WHERE academy_id IN (SELECT public.get_my_academy_ids())));

-- ── product_reviews ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  academy_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  size_purchased text,
  size_feedback text CHECK (size_feedback IN ('small', 'perfect', 'large')),
  verified_purchase boolean DEFAULT false,
  helpful_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, profile_id)
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reviews_read ON public.product_reviews;
CREATE POLICY reviews_read ON public.product_reviews FOR SELECT
  USING (academy_id IN (SELECT public.get_my_academy_ids()));
DROP POLICY IF EXISTS reviews_write ON public.product_reviews;
CREATE POLICY reviews_write ON public.product_reviews FOR INSERT
  WITH CHECK (
    profile_id IN (SELECT public.get_my_profile_ids())
    AND academy_id IN (SELECT public.get_my_academy_ids())
  );

-- ── Enhance orders table ────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_payment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes text;

-- Update orders RLS to include academy access
DROP POLICY IF EXISTS orders_own ON public.orders;
CREATE POLICY orders_own ON public.orders FOR ALL
  USING (
    user_id = auth.uid()
    OR academy_id IN (SELECT public.get_my_academy_ids())
  );

-- ── Indices ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_modality ON public.products(modality);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_academy ON public.orders(academy_id);
CREATE INDEX IF NOT EXISTS idx_orders_profile ON public.orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_academy ON public.product_categories(academy_id);
