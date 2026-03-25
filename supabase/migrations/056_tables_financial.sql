-- ============================================================
-- BlackBelt v2 — Migration 056: Financial, Payments, Contracts
-- ============================================================

-- ── devedores ──
CREATE TABLE IF NOT EXISTS public.devedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  aluno_id uuid,
  aluno_nome text,
  aluno_avatar text,
  aluno_telefone text,
  aluno_email text,
  valor_devido numeric(12,2) DEFAULT 0,
  dias_atraso integer DEFAULT 0,
  ultimo_pagamento timestamptz,
  plano text,
  ultimo_contato jsonb DEFAULT '{}'::jsonb,
  status_cobranca text DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS devedores_isolation ON public.devedores FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── contatos_cobranca ──
CREATE TABLE IF NOT EXISTS public.contatos_cobranca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devedor_id uuid REFERENCES public.devedores(id) ON DELETE CASCADE,
  tipo text DEFAULT 'whatsapp',
  resultado text DEFAULT 'sem_resposta',
  observacao text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contatos_cobranca ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS contatos_cobranca_read ON public.contatos_cobranca FOR SELECT USING (true);

-- ── contrato_templates ──
CREATE TABLE IF NOT EXISTS public.contrato_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text DEFAULT 'matricula',
  conteudo_html text DEFAULT '',
  variaveis jsonb DEFAULT '[]'::jsonb,
  ativo boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contrato_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS contrato_templates_isolation ON public.contrato_templates FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── contratos ──
CREATE TABLE IF NOT EXISTS public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.contrato_templates(id) ON DELETE CASCADE,
  aluno_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  dados jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'rascunho',
  enviado_por text,
  assinatura_base64 text,
  assinado_em timestamptz,
  conteudo_final text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS contratos_isolation ON public.contratos FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── inadimplentes_view ──
CREATE TABLE IF NOT EXISTS public.inadimplentes_view (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  avatar text,
  valor numeric(12,2) DEFAULT 0,
  dias_atraso integer DEFAULT 0,
  telefone text,
  email text,
  turma text,
  faixa text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inadimplentes_view ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS inadimplentes_view_read ON public.inadimplentes_view FOR SELECT USING (true);

-- ── mensalidades ──
CREATE TABLE IF NOT EXISTS public.mensalidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid,
  student_name text,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  amount numeric(12,2),
  due_date date,
  status text DEFAULT 'pendente',
  paid_at timestamptz,
  payment_method text,
  reference_month text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS mensalidades_isolation ON public.mensalidades FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── pagamentos ──
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid,
  valor numeric(12,2),
  forma text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS pagamentos_read ON public.pagamentos FOR SELECT USING (true);

-- ── products ──
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  description text,
  images jsonb DEFAULT '[]'::jsonb,
  category text,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  variants jsonb DEFAULT '[]'::jsonb,
  stock_total integer DEFAULT 0,
  low_stock_alert integer DEFAULT 0,
  status text DEFAULT 'active',
  featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS products_isolation ON public.products FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── orders ──
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text,
  items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric(12,2),
  shipping_cost numeric(12,2),
  total numeric(12,2),
  shipping_address jsonb DEFAULT '{}'::jsonb,
  delivery_option text DEFAULT 'pickup',
  payment_method text DEFAULT 'pix',
  status text DEFAULT 'pending',
  tracking_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS orders_own ON public.orders FOR ALL USING (user_id = auth.uid());

-- ── shipments ──
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier text,
  service text,
  tracking_code text,
  status text DEFAULT 'created',
  estimated_delivery date,
  events jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS shipments_read ON public.shipments FOR SELECT USING (true);

-- ── royalty_calculations ──
CREATE TABLE IF NOT EXISTS public.royalty_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  franchise_id uuid,
  academy_name text,
  month text NOT NULL,
  gross_revenue numeric(12,2) DEFAULT 0,
  royalty_percentage numeric(12,2) DEFAULT 0,
  royalty_amount numeric(12,2) DEFAULT 0,
  marketing_fund_pct numeric(12,2) DEFAULT 0,
  marketing_fund_amount numeric(12,2) DEFAULT 0,
  total_due numeric(12,2) DEFAULT 0,
  status text DEFAULT 'pendente',
  due_date date,
  paid_date timestamptz,
  model text DEFAULT 'percentual_fixo',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.royalty_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS royalty_calculations_read ON public.royalty_calculations FOR SELECT USING (true);

-- ── royalty_invoices ──
CREATE TABLE IF NOT EXISTS public.royalty_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  academy_name text,
  month text NOT NULL,
  royalty_amount numeric(12,2) DEFAULT 0,
  marketing_fund_amount numeric(12,2) DEFAULT 0,
  total_due numeric(12,2) DEFAULT 0,
  status text DEFAULT 'pendente',
  due_date date,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.royalty_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS royalty_invoices_read ON public.royalty_invoices FOR SELECT USING (true);

-- ── referral_clicks ──
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  clicked_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS referral_clicks_read ON public.referral_clicks FOR SELECT USING (true);

-- ── referral_stats ──
CREATE TABLE IF NOT EXISTS public.referral_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  code text,
  total_referrals integer DEFAULT 0,
  converted_referrals integer DEFAULT 0,
  credits_earned numeric(12,2) DEFAULT 0,
  credits_used numeric(12,2) DEFAULT 0,
  referrals jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS referral_stats_isolation ON public.referral_stats FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── estoque ──
CREATE TABLE IF NOT EXISTS public.estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  nome text,
  categoria text DEFAULT 'outro',
  tamanho text,
  cor text,
  quantidade_atual integer DEFAULT 0,
  estoque_minimo integer DEFAULT 0,
  preco_venda numeric(12,2) DEFAULT 0,
  preco_custo numeric(12,2) DEFAULT 0,
  ultima_movimentacao timestamptz,
  status text DEFAULT 'ok',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS estoque_isolation ON public.estoque FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── movimentacoes_estoque ──
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid,
  tipo text,
  quantidade integer DEFAULT 0,
  motivo text,
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS movimentacoes_estoque_read ON public.movimentacoes_estoque FOR SELECT USING (true);

-- ── inventory_items ──
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  category text DEFAULT 'material',
  quantity integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  price numeric(12,2) DEFAULT 0,
  size text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS inventory_items_isolation ON public.inventory_items FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── stock_movements ──
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type text NOT NULL,
  quantity integer DEFAULT 0,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS stock_movements_read ON public.stock_movements FOR SELECT USING (true);
