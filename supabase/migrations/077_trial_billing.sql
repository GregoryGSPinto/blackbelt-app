-- ═══════════════════════════════════════════════════════════════
-- TRIAL + BILLING AUTOMÁTICO
-- ═══════════════════════════════════════════════════════════════

-- Coluna de trial na academia
ALTER TABLE academies ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE academies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT now() + interval '7 days';
ALTER TABLE academies ADD COLUMN IF NOT EXISTS trial_converted BOOLEAN DEFAULT false;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trial'
  CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'suspended'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS plan_id VARCHAR(30) DEFAULT 'starter';
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subscription_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_type VARCHAR(20) DEFAULT 'pix'
  CHECK (billing_type IN ('pix', 'boleto', 'credit_card'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_name VARCHAR(200);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_cpf_cnpj VARCHAR(18);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_phone VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_cep VARCHAR(10);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_street VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_number VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_complement VARCHAR(100);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_neighborhood VARCHAR(100);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_city VARCHAR(100);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS billing_address_state VARCHAR(2);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS academy_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  plan_id VARCHAR(30) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  price_cents INTEGER NOT NULL,
  billing_type VARCHAR(20) NOT NULL DEFAULT 'pix',
  asaas_subscription_id VARCHAR(255),
  asaas_customer_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'past_due', 'cancelled', 'suspended')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

-- Ensure columns exist on academy_subscriptions (may already exist with different schema)
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS plan_id VARCHAR(30);
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100);
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS price_cents INTEGER;
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS billing_type VARCHAR(20) DEFAULT 'pix';
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS asaas_subscription_id VARCHAR(255);
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(255);
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE academy_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_subscriptions_academy ON academy_subscriptions(academy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON academy_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas ON academy_subscriptions(asaas_subscription_id) WHERE asaas_subscription_id IS NOT NULL;

-- RLS
ALTER TABLE academy_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sub_admin') THEN
    CREATE POLICY "sub_admin" ON academy_subscriptions FOR ALL USING (
      academy_id IN (SELECT public.get_my_academy_ids())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sub_insert') THEN
    CREATE POLICY "sub_insert" ON academy_subscriptions FOR INSERT WITH CHECK (true);
  END IF;
END $$;
