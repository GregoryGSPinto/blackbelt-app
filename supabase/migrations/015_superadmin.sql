-- ============================================================
-- BlackBelt v2 — Migration 015: Super Admin + Planos SaaS
-- ============================================================

-- Tabela de planos SaaS
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(30) UNIQUE NOT NULL,
  max_students INTEGER NOT NULL,
  max_professors INTEGER NOT NULL,
  max_classes INTEGER NOT NULL DEFAULT 10,
  has_streaming BOOLEAN DEFAULT false,
  has_store BOOLEAN DEFAULT false,
  has_events BOOLEAN DEFAULT false,
  has_financeiro BOOLEAN DEFAULT false,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expandir tabela academies com campos SaaS
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
  CHECK (status IN ('active', 'suspended', 'trial', 'cancelled', 'pending'));
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS owner_profile_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 50;
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS max_professors INTEGER DEFAULT 5;

-- Tabela de tokens de onboarding (Super Admin gera para donos de academia)
CREATE TABLE IF NOT EXISTS public.academy_onboard_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  academy_name VARCHAR(200) NOT NULL,
  plan_id UUID REFERENCES public.plans(id),
  trial_days INTEGER DEFAULT 30,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Registro de uso do onboarding
CREATE TABLE IF NOT EXISTS public.academy_onboard_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.academy_onboard_tokens(id),
  academy_id UUID NOT NULL REFERENCES public.academies(id),
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  used_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_onboard_tokens_token ON public.academy_onboard_tokens(token);
CREATE INDEX IF NOT EXISTS idx_onboard_uses_token ON public.academy_onboard_uses(token_id);

-- Seed de planos
INSERT INTO public.plans (name, slug, max_students, max_professors, max_classes, has_streaming, has_store, has_events, has_financeiro, price_monthly, price_yearly)
VALUES
  ('Starter', 'starter', 30, 3, 5, false, false, false, false, 99.90, 999.00),
  ('Pro', 'pro', 100, 10, 20, true, true, false, true, 199.90, 1999.00),
  ('Enterprise', 'enterprise', 500, 50, 100, true, true, true, true, 499.90, 4999.00)
ON CONFLICT (slug) DO NOTHING;

-- RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_onboard_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_onboard_uses ENABLE ROW LEVEL SECURITY;

-- Planos sao publicos para leitura
CREATE POLICY "Plans are readable by all" ON public.plans FOR SELECT USING (true);

-- Onboard tokens: leitura publica para validacao, gestao via service_role
CREATE POLICY "Anyone can validate onboard token" ON public.academy_onboard_tokens FOR SELECT USING (true);

-- Onboard uses: insert para autenticados
CREATE POLICY "Authenticated can register onboard use" ON public.academy_onboard_uses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
