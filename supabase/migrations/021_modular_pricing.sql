-- ============================================================
-- BlackBelt v2 — Migration 021: Modular Pricing (SaaS)
--
-- Tables: pricing_tiers, pricing_modules, pricing_packages,
--         academy_subscriptions, module_usage_tracking, billing_history
-- ============================================================

-- Faixas de base
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  min_students INTEGER NOT NULL,
  max_students INTEGER NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  professors_included INTEGER NOT NULL DEFAULT 1,
  classes_included INTEGER NOT NULL DEFAULT 5,
  units_included INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]',
  category VARCHAR(30) NOT NULL CHECK (category IN ('operacao','ensino','engajamento','comercial','avancado')),
  depends_on TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  module_slugs TEXT[] NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 20,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES pricing_tiers(id),
  paid_modules TEXT[] DEFAULT '{}',
  additional_professors INTEGER DEFAULT 0,
  additional_units INTEGER DEFAULT 0,
  billing_cycle VARCHAR(10) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  package_id UUID REFERENCES pricing_packages(id),
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'trial' CHECK (status IN ('trial','discovery','full','suspended','cancelled','past_due')),
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ,
  discovery_ends_at TIMESTAMPTZ,
  plan_started_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

CREATE TABLE IF NOT EXISTS module_usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id),
  module_slug VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  page_path VARCHAR(200),
  tracked_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id),
  subscription_id UUID REFERENCES academy_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  payment_method VARCHAR(30),
  paid_at TIMESTAMPTZ,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_academy ON academy_subscriptions(academy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON academy_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_academy ON billing_history(academy_id);
CREATE INDEX IF NOT EXISTS idx_usage_academy_module ON module_usage_tracking(academy_id, module_slug);
CREATE INDEX IF NOT EXISTS idx_usage_tracked_at ON module_usage_tracking(tracked_at);

-- RLS
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Public: everyone reads pricing
CREATE POLICY "tiers_public" ON pricing_tiers FOR SELECT USING (true);
CREATE POLICY "modules_public" ON pricing_modules FOR SELECT USING (true);
CREATE POLICY "packages_public" ON pricing_packages FOR SELECT USING (true);

-- Subscription: academy members
CREATE POLICY "sub_member" ON academy_subscriptions FOR SELECT USING (public.is_member_of(academy_id));
CREATE POLICY "billing_member" ON billing_history FOR SELECT USING (public.is_member_of(academy_id));
CREATE POLICY "usage_member" ON module_usage_tracking FOR SELECT USING (public.is_member_of(academy_id));
CREATE POLICY "usage_insert" ON module_usage_tracking FOR INSERT WITH CHECK (public.is_member_of(academy_id));

-- Superadmin policies
CREATE POLICY "tiers_superadmin" ON pricing_tiers FOR ALL USING (public.is_superadmin());
CREATE POLICY "modules_superadmin" ON pricing_modules FOR ALL USING (public.is_superadmin());
CREATE POLICY "packages_superadmin" ON pricing_packages FOR ALL USING (public.is_superadmin());
CREATE POLICY "sub_superadmin" ON academy_subscriptions FOR ALL USING (public.is_superadmin());
CREATE POLICY "billing_superadmin" ON billing_history FOR ALL USING (public.is_superadmin());
CREATE POLICY "usage_superadmin" ON module_usage_tracking FOR ALL USING (public.is_superadmin());

-- ============================================================
-- SEED DATA
-- ============================================================

-- 6 Faixas de base
INSERT INTO pricing_tiers (name, slug, min_students, max_students, price_monthly, price_yearly, professors_included, classes_included, units_included, sort_order) VALUES
  ('Solo',       'solo',       1,   30,   97.00,   77.60, 1, 5,  1, 1),
  ('Starter',    'starter',   31,   60,  147.00,  117.60, 2, 10, 1, 2),
  ('Growth',     'growth',    61,  120,  197.00,  157.60, 3, 20, 1, 3),
  ('Pro',        'pro',      121,  200,  297.00,  237.60, 5, 40, 2, 4),
  ('Scale',      'scale',    201,  400,  397.00,  317.60, 8, 80, 3, 5),
  ('Enterprise', 'enterprise',401, 9999, 497.00,  397.60,15,999, 5, 6)
ON CONFLICT (slug) DO NOTHING;

-- 16 Modulos
INSERT INTO pricing_modules (name, slug, description, icon, price_monthly, price_yearly, features, category, depends_on, is_popular, sort_order) VALUES
  ('Financeiro',          'financeiro',     'Mensalidades, cobranças, inadimplência, relatórios financeiros', '💰', 49.00, 39.20,
   '["Mensalidades automáticas","Cobranças recorrentes","Controle de inadimplência","Relatórios financeiros","Integração gateway"]'::jsonb,
   'operacao', '{}', true, 1),

  ('Check-in QR',         'qr_checkin',     'Presença por QR code, lista de presença digital, relatórios', '📱', 29.00, 23.20,
   '["QR code por aluno","Lista de presença digital","Relatório de frequência","Check-in por turma","Histórico completo"]'::jsonb,
   'operacao', '{}', false, 2),

  ('Pedagógico',          'pedagogico',     'Planos de aula, avaliações, currículo, progressão de faixa', '📚', 39.00, 31.20,
   '["Planos de aula","Avaliações de faixa","Currículo por modalidade","Progressão automática","Diário de classe"]'::jsonb,
   'ensino', '{}', true, 3),

  ('Streaming de Aulas',  'streaming',      'Transmissão ao vivo, gravação, biblioteca de vídeos', '🎥', 59.00, 47.20,
   '["Transmissão ao vivo","Gravação automática","Biblioteca de vídeos","Player integrado","Controle de acesso"]'::jsonb,
   'ensino', '{"pedagogico"}', false, 4),

  ('Gamificação',         'gamificacao',    'XP, conquistas, ranking, desafios, battle pass', '🏆', 39.00, 31.20,
   '["Sistema de XP","Conquistas e badges","Ranking global","Desafios semanais","Battle Pass sazonal"]'::jsonb,
   'engajamento', '{}', true, 5),

  ('Analytics Avançado',  'analytics',      'Dashboards, métricas, previsões, health score', '📊', 49.00, 39.20,
   '["Dashboards customizáveis","Métricas de retenção","Previsão de churn","Health Score por aluno","Relatórios exportáveis"]'::jsonb,
   'operacao', '{}', false, 6),

  ('Eventos & Campeonatos','eventos',       'Gestão de campeonatos, inscrições, chaves, resultados', '🥋', 39.00, 31.20,
   '["Criar campeonatos","Inscrições online","Chaves automáticas","Resultados em tempo real","Certificados"]'::jsonb,
   'engajamento', '{}', false, 7),

  ('Comunicação',         'comunicacao',    'Push, email, SMS, grupos, murais', '💬', 29.00, 23.20,
   '["Push notifications","Email marketing","Grupos de conversa","Mural da academia","Comunicados segmentados"]'::jsonb,
   'engajamento', '{}', false, 8),

  ('Contratos Digitais',  'contratos',      'Contratos, assinatura digital, termos, renovação automática', '📝', 29.00, 23.20,
   '["Contratos personalizáveis","Assinatura digital","Termos de uso","Renovação automática","Histórico completo"]'::jsonb,
   'comercial', '{}', false, 9),

  ('Loja Integrada',      'loja',           'Venda de produtos, estoque, pedidos, entrega', '🛒', 39.00, 31.20,
   '["Catálogo de produtos","Controle de estoque","Pedidos online","Pagamento integrado","Relatório de vendas"]'::jsonb,
   'comercial', '{}', false, 10),

  ('Kids & Teens',        'kids_teens',     'Experiência lúdica, responsáveis, progresso visual', '👶', 39.00, 31.20,
   '["Interface lúdica kids","Modo teen gamificado","Portal do responsável","Progresso visual","Alertas para pais"]'::jsonb,
   'ensino', '{}', false, 11),

  ('Portal do Responsável','responsavel',   'Acompanhamento, pagamentos, comunicação, autorizações', '👨‍👩‍👧', 19.00, 15.20,
   '["Dashboard do filho","Pagamentos centralizados","Chat com professor","Autorizações digitais","Boletim de progresso"]'::jsonb,
   'engajamento', '{"kids_teens"}', false, 12),

  ('Multi-unidade',       'multi_unidade',  'Gestão de filiais, consolidação, transferências', '🏢', 79.00, 63.20,
   '["Painel consolidado","Gestão por unidade","Transferência de alunos","Relatórios comparativos","Estoque unificado"]'::jsonb,
   'avancado', '{}', false, 13),

  ('Franquia',            'franquia',       'Royalties, padronização, expansão, benchmarking', '🌐', 149.00, 119.20,
   '["Gestão de royalties","Padronização de processos","Expansão assistida","Benchmarking entre unidades","Portal do franqueado"]'::jsonb,
   'avancado', '{"multi_unidade"}', false, 14),

  ('Recepção',            'recepcao',       'Painel de recepção, agenda, visitantes, trial classes', '🖥️', 29.00, 23.20,
   '["Painel do recepcionista","Agenda visual","Controle de visitantes","Aulas experimentais","Check-in assistido"]'::jsonb,
   'operacao', '{}', false, 15),

  ('IA Coach',            'ia_coach',       'Assistente IA, análise de vídeo, recomendações personalizadas', '🤖', 69.00, 55.20,
   '["Assistente virtual IA","Análise de vídeo por IA","Recomendações personalizadas","Chatbot para alunos","Insights automáticos"]'::jsonb,
   'avancado', '{}', false, 16)
ON CONFLICT (slug) DO NOTHING;

-- 3 Pacotes sugeridos (+ Rede sob consulta, sem INSERT)
INSERT INTO pricing_packages (name, slug, description, icon, module_slugs, discount_percent, is_popular, sort_order) VALUES
  ('Essencial',    'essencial',    'O básico para funcionar bem', '⚡',
   ARRAY['financeiro','qr_checkin','comunicacao','contratos'],
   20, false, 1),

  ('Profissional', 'profissional', 'Tudo que uma academia profissional precisa', '🚀',
   ARRAY['financeiro','qr_checkin','pedagogico','streaming','gamificacao','analytics','eventos','comunicacao','contratos'],
   20, true, 2),

  ('Completo',     'completo',     'Todos os módulos com o melhor desconto', '👑',
   ARRAY['financeiro','qr_checkin','pedagogico','streaming','gamificacao','analytics','eventos','comunicacao','contratos','loja','kids_teens','responsavel','recepcao','ia_coach'],
   25, false, 3)
ON CONFLICT (slug) DO NOTHING;
