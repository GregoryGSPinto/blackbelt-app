-- 031: Sales features — WhatsApp integration, payment gateway, landing pages, churn prediction

-- 1. whatsapp_configs (per-academy WhatsApp configuration)
CREATE TABLE IF NOT EXISTS whatsapp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'mock' CHECK (provider IN ('twilio', 'zapi', 'evolution', 'mock')),
  api_key TEXT,
  instance_id TEXT,
  phone_number TEXT,
  allowed_hours_start INTEGER DEFAULT 8,
  allowed_hours_end INTEGER DEFAULT 21,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

-- 2. whatsapp_templates (custom templates per academy)
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'geral' CHECK (category IN ('cobranca','aula','experimental','graduacao','aniversario','boas_vindas','evento','geral')),
  is_system BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_academy ON whatsapp_templates(academy_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_templates_slug ON whatsapp_templates(academy_id, slug);

-- 3. whatsapp_messages (message history)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  to_phone TEXT NOT NULL,
  to_name TEXT,
  template_slug TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_academy ON whatsapp_messages(academy_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- 4. whatsapp_automations (automation config per academy)
CREATE TABLE IF NOT EXISTS whatsapp_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  trigger_name TEXT NOT NULL,
  template_slug TEXT NOT NULL,
  description TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  delay_hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_automations_academy ON whatsapp_automations(academy_id);

-- 5. payment_customers (gateway customer records)
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  student_id UUID,
  external_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  cpf_cnpj TEXT,
  phone TEXT,
  provider TEXT NOT NULL DEFAULT 'mock' CHECK (provider IN ('asaas', 'stripe', 'mock')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_customers_academy ON payment_customers(academy_id);
CREATE INDEX IF NOT EXISTS idx_payment_customers_external ON payment_customers(external_id);

-- 6. payment_charges (individual charges)
CREATE TABLE IF NOT EXISTS payment_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  external_id TEXT,
  description TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  net_value NUMERIC(10,2),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','received','confirmed','overdue','refunded','cancelled')),
  billing_type TEXT NOT NULL DEFAULT 'PIX' CHECK (billing_type IN ('PIX','BOLETO','CREDIT_CARD')),
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  boleto_url TEXT,
  boleto_barcode TEXT,
  credit_card_token TEXT,
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_charges_academy ON payment_charges(academy_id);
CREATE INDEX IF NOT EXISTS idx_payment_charges_customer ON payment_charges(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_charges_status ON payment_charges(status);
CREATE INDEX IF NOT EXISTS idx_payment_charges_due ON payment_charges(due_date);

-- 7. payment_subscriptions (recurring subscriptions)
CREATE TABLE IF NOT EXISTS payment_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  external_id TEXT,
  description TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  cycle TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (cycle IN ('MONTHLY','QUARTERLY','SEMIANNUALLY','YEARLY')),
  billing_type TEXT NOT NULL DEFAULT 'PIX' CHECK (billing_type IN ('PIX','BOLETO','CREDIT_CARD')),
  next_due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_academy ON payment_subscriptions(academy_id);
CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_customer ON payment_subscriptions(customer_id);

-- 8. landing_page_configs (per-academy landing page settings)
CREATE TABLE IF NOT EXISTS landing_page_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  hero_banner_url TEXT,
  endereco TEXT,
  cidade TEXT,
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  fotos JSONB DEFAULT '[]',
  modalidades JSONB DEFAULT '[]',
  grade JSONB DEFAULT '[]',
  planos JSONB DEFAULT '[]',
  depoimentos JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{}',
  cor_primaria TEXT DEFAULT '#C62828',
  cor_secundaria TEXT DEFAULT '#1A1A2E',
  tema TEXT DEFAULT 'escuro' CHECK (tema IN ('claro', 'escuro')),
  experimental_ativa BOOLEAN DEFAULT true,
  turmas_experimental TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_landing_page_slug ON landing_page_configs(slug);

-- 9. landing_page_leads (form submissions)
CREATE TABLE IF NOT EXISTS landing_page_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  modalidade TEXT,
  turma TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','contactado','agendado','matriculado','desistiu')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_landing_leads_academy ON landing_page_leads(academy_id);
CREATE INDEX IF NOT EXISTS idx_landing_leads_status ON landing_page_leads(status);

-- 10. churn_predictions (calculated churn scores)
CREATE TABLE IF NOT EXISTS churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'baixo' CHECK (risk_level IN ('alto','medio','baixo')),
  motivos TEXT[] DEFAULT '{}',
  dados JSONB DEFAULT '{}',
  acoes_sugeridas JSONB DEFAULT '[]',
  status_acao TEXT NOT NULL DEFAULT 'pendente' CHECK (status_acao IN ('pendente','acao_tomada','recuperado','cancelou')),
  ultimo_contato TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_churn_academy ON churn_predictions(academy_id);
CREATE INDEX IF NOT EXISTS idx_churn_risk ON churn_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_churn_student ON churn_predictions(student_id);

-- 11. churn_actions (actions taken on at-risk students)
CREATE TABLE IF NOT EXISTS churn_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES churn_predictions(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID,
  performed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_churn_actions_prediction ON churn_actions(prediction_id);
