-- ═══════════════════════════════════════════════════════
-- BLACKBELT v2 — TABELAS EXTRAS + RLS
-- account_deletion_log, audit_log, webhook_log,
-- payment_customers, support_tickets, invoices columns
-- ═══════════════════════════════════════════════════════

-- ═══ 1. ACCOUNT_DELETION_LOG ═══
CREATE TABLE IF NOT EXISTS account_deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_hash VARCHAR(64) NOT NULL,
  profiles_archived UUID[] DEFAULT '{}',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address VARCHAR(45),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '5 years'
);

-- ═══ 2. AUDIT_LOG ═══
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  user_id UUID REFERENCES auth.users(id),
  profile_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_academy ON audit_log(academy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- ═══ 3. WEBHOOK_LOG ═══
CREATE TABLE IF NOT EXISTS webhook_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(30) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  external_id VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_log_source ON webhook_log(source, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_log_external ON webhook_log(external_id);

-- ═══ 4. PAYMENT_CUSTOMERS ═══
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  academy_id UUID NOT NULL REFERENCES academies(id),
  external_customer_id VARCHAR(255) NOT NULL,
  provider VARCHAR(30) DEFAULT 'asaas',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id, academy_id, provider)
);

-- ═══ 5. SUPPORT_TICKETS ═══
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  academy_id UUID REFERENCES academies(id),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ 6. INVOICES — colunas de pagamento ═══
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_payment_id VARCHAR(255);
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS net_value DECIMAL(10,2);
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link TEXT;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_payload TEXT;
  END IF;
END $$;

-- ═══ 7. PROFILES — needs_password_change ═══
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS needs_password_change BOOLEAN DEFAULT false;

-- ═══════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════

ALTER TABLE account_deletion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Audit log: admin vê da sua academia, qualquer um pode inserir
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_log_admin') THEN
    CREATE POLICY "audit_log_admin" ON audit_log FOR SELECT USING (
      academy_id IN (SELECT public.get_my_academy_ids())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_log_insert') THEN
    CREATE POLICY "audit_log_insert" ON audit_log FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Webhook log: superadmin only
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'webhook_log_super') THEN
    CREATE POLICY "webhook_log_super" ON webhook_log FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
    );
  END IF;
END $$;

-- Account deletion log: superadmin only
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'deletion_log_super') THEN
    CREATE POLICY "deletion_log_super" ON account_deletion_log FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
    );
  END IF;
END $$;

-- Payment customers: admin
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'payment_customers_admin') THEN
    CREATE POLICY "payment_customers_admin" ON payment_customers FOR ALL USING (
      academy_id IN (SELECT public.get_my_academy_ids())
    );
  END IF;
END $$;

-- Support tickets: anyone can insert, admin can read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_insert') THEN
    CREATE POLICY "support_tickets_insert" ON support_tickets FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_admin') THEN
    CREATE POLICY "support_tickets_admin" ON support_tickets FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
    );
  END IF;
END $$;
