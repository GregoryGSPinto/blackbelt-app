-- ════════════════════════════════════════════════════
-- BLACKBELT v2 — Sistema Financeiro do Aluno
-- Tipo de vínculo, forma de pagamento, recorrência
-- ════════════════════════════════════════════════════

-- Campos financeiros na membership
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'particular'
  CHECK (billing_type IN ('particular', 'gympass', 'totalpass', 'smartfit', 'cortesia', 'funcionario', 'bolsista', 'avulso'));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS payment_method TEXT
  CHECK (payment_method IN ('pix', 'credito', 'debito', 'boleto', 'dinheiro', 'transferencia', 'asaas'));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'mensal'
  CHECK (recurrence IN ('mensal', 'trimestral', 'semestral', 'anual', 'avulso'));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS monthly_amount INTEGER DEFAULT 0; -- centavos
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS discount_reason TEXT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_day INTEGER DEFAULT 10;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'em_dia'
  CHECK (billing_status IN ('em_dia', 'pendente', 'atrasado', 'cortesia', 'gympass', 'cancelado'));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS contract_start DATE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS contract_end DATE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_notes TEXT;

-- Colunas extras na invoices (se não existem)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS net_amount INTEGER;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_type TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reference_month TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_amount INTEGER;

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_academy ON invoices(academy_id);
CREATE INDEX IF NOT EXISTS idx_invoices_profile ON invoices(profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_memberships_billing ON memberships(billing_type, billing_status);

-- RLS para invoices (idempotente com DO blocks)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invoices_staff' AND tablename = 'invoices') THEN
    CREATE POLICY invoices_staff ON invoices FOR ALL USING (
      academy_id IN (
        SELECT m.academy_id FROM memberships m
        JOIN profiles p ON p.id = m.profile_id
        WHERE p.user_id = auth.uid()
        AND m.role IN ('admin', 'owner', 'recepcao')
        AND m.status = 'active'
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invoices_own' AND tablename = 'invoices') THEN
    CREATE POLICY invoices_own ON invoices FOR SELECT USING (
      profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invoices_guardian' AND tablename = 'invoices') THEN
    CREATE POLICY invoices_guardian ON invoices FOR SELECT USING (
      profile_id IN (
        SELECT child_id FROM guardian_links
        WHERE guardian_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    );
  END IF;
END $$;
