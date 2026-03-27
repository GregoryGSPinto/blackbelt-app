-- ═══════════════════════════════════════════════════════════════
-- SUBCONTA ASAAS — ACADEMIA RECEBE DOS ALUNOS
-- ═══════════════════════════════════════════════════════════════

-- Dados bancarios da academia
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account_configured BOOLEAN DEFAULT false;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_name VARCHAR(200);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_cpf_cnpj VARCHAR(18);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_email VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_phone VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_owner_birth_date DATE;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_company_type VARCHAR(20)
  CHECK (bank_company_type IS NULL OR bank_company_type IN ('MEI', 'LIMITED', 'INDIVIDUAL', 'ASSOCIATION'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_agency VARCHAR(10);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account VARCHAR(20);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account_digit VARCHAR(2);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(20) DEFAULT 'CONTA_CORRENTE'
  CHECK (bank_account_type IN ('CONTA_CORRENTE', 'CONTA_POUPANCA'));
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_api_key TEXT;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_wallet_id VARCHAR(255);
ALTER TABLE academies ADD COLUMN IF NOT EXISTS asaas_subaccount_status VARCHAR(20) DEFAULT 'pending'
  CHECK (asaas_subaccount_status IN ('pending', 'active', 'suspended', 'rejected'));

-- Tabela de cobrancas de alunos (geradas pela academia)
CREATE TABLE IF NOT EXISTS student_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES profiles(id),
  guardian_person_id UUID REFERENCES people(id),
  description VARCHAR(255) NOT NULL,
  amount_cents INTEGER NOT NULL,
  billing_type VARCHAR(20) NOT NULL DEFAULT 'PIX'
    CHECK (billing_type IN ('PIX', 'BOLETO', 'CREDIT_CARD')),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'CONFIRMED', 'RECEIVED', 'OVERDUE', 'REFUNDED', 'CANCELLED')),
  asaas_payment_id VARCHAR(255),
  asaas_customer_id VARCHAR(255),
  invoice_url TEXT,
  pix_qr_code TEXT,
  pix_payload TEXT,
  paid_at TIMESTAMPTZ,
  reference_month VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_payments_academy ON student_payments(academy_id, status);
CREATE INDEX IF NOT EXISTS idx_student_payments_student ON student_payments(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_due ON student_payments(due_date, status);
CREATE INDEX IF NOT EXISTS idx_student_payments_asaas ON student_payments(asaas_payment_id);

ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;

-- Admin da academia ve todas as cobrancas da academia
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sp_admin') THEN
    CREATE POLICY "sp_admin" ON student_payments FOR ALL USING (
      academy_id IN (SELECT public.get_my_academy_ids())
    );
  END IF;
END $$;

-- Aluno ve so as proprias cobrancas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sp_student') THEN
    CREATE POLICY "sp_student" ON student_payments FOR SELECT USING (
      student_profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Responsavel ve cobrancas dos dependentes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sp_guardian') THEN
    CREATE POLICY "sp_guardian" ON student_payments FOR SELECT USING (
      guardian_person_id IN (
        SELECT id FROM people WHERE account_id = auth.uid()
      )
    );
  END IF;
END $$;
