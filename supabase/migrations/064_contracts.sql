-- ============================================================
-- BlackBelt v2 — Migration 064: Contracts System
-- Software contracts (BlackBelt → Academy) + Academy contracts (Academy → Student)
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- CONTRATO A: SOFTWARE (BlackBelt → Academia)
-- ══════════════════════════════════════════════════════════════

-- Template base do contrato do software (editavel pelo SuperAdmin)
CREATE TABLE IF NOT EXISTS public.software_contract_template (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  version int DEFAULT 1,
  title text DEFAULT 'Contrato de Licenca de Uso do Software BlackBelt',
  body_html text NOT NULL DEFAULT '',
  plan_clauses jsonb DEFAULT '{}',
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
-- No RLS — managed by SuperAdmin via service role

-- Contratos de software assinados pelas academias
CREATE TABLE IF NOT EXISTS public.software_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  template_version int NOT NULL DEFAULT 1,
  academy_name text NOT NULL,
  academy_cnpj text,
  academy_owner_name text NOT NULL,
  academy_owner_cpf text,
  academy_owner_email text NOT NULL,
  academy_phone text,
  academy_address text,
  plan_slug text NOT NULL,
  plan_name text NOT NULL,
  monthly_value_cents int NOT NULL,
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','quarterly','semiannual','annual')),
  discount_percent numeric(5,2) DEFAULT 0,
  trial_started_at timestamptz,
  trial_ended_at timestamptz,
  contract_start_date date NOT NULL DEFAULT CURRENT_DATE,
  contract_duration_months int DEFAULT 12,
  auto_renew boolean DEFAULT true,
  signed_at timestamptz,
  signature_ip text,
  signature_ua text,
  digital_hash text,
  status text DEFAULT 'trial' CHECK (status IN ('trial','pending_signature','active','suspended','cancelled','expired')),
  contract_body_html text,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.software_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS own_software_contract ON public.software_contracts;
CREATE POLICY own_software_contract ON public.software_contracts FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));

-- ══════════════════════════════════════════════════════════════
-- CONTRATO B: ACADEMIA → ALUNO
-- ══════════════════════════════════════════════════════════════

-- Template de contrato da academia
CREATE TABLE IF NOT EXISTS public.academy_contract_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Contrato Padrao',
  version int DEFAULT 1,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  source text DEFAULT 'system' CHECK (source IN ('system','custom','upload')),
  body_html text,
  uploaded_file_url text,
  uploaded_file_name text,
  uploaded_at timestamptz,
  academy_legal_name text,
  academy_cnpj text,
  academy_address text,
  academy_phone text,
  academy_email text,
  default_plan_name text DEFAULT 'Mensal',
  default_monthly_value_cents int DEFAULT 14900,
  default_enrollment_fee_cents int DEFAULT 0,
  default_payment_day int DEFAULT 10,
  default_duration_months int DEFAULT 12,
  default_auto_renew boolean DEFAULT true,
  late_fee_percent numeric(5,2) DEFAULT 2.0 CHECK (late_fee_percent <= 2.0),
  late_interest_monthly numeric(5,2) DEFAULT 1.0 CHECK (late_interest_monthly <= 1.0),
  grace_period_days int DEFAULT 5,
  cancellation_notice_days int DEFAULT 30,
  require_injury_waiver boolean DEFAULT true,
  require_medical_clearance boolean DEFAULT true,
  require_image_consent boolean DEFAULT false,
  require_lgpd_consent boolean DEFAULT true,
  minor_clauses_enabled boolean DEFAULT false,
  jurisdiction_city text,
  jurisdiction_state text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.academy_contract_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academy_templates ON public.academy_contract_templates;
CREATE POLICY academy_templates ON public.academy_contract_templates FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));

-- Contratos assinados entre academia e aluno
CREATE TABLE IF NOT EXISTS public.student_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES public.academy_contract_templates(id),
  template_version int,
  source text DEFAULT 'system' CHECK (source IN ('system','custom','upload')),
  student_profile_id uuid REFERENCES public.profiles(id) NOT NULL,
  student_name text NOT NULL,
  student_cpf text,
  student_email text NOT NULL,
  student_phone text,
  student_birth_date date,
  student_address text,
  guardian_profile_id uuid REFERENCES public.profiles(id),
  guardian_name text,
  guardian_cpf text,
  guardian_email text,
  guardian_relationship text,
  plan_name text NOT NULL,
  monthly_value_cents int NOT NULL,
  enrollment_fee_cents int DEFAULT 0,
  payment_day int NOT NULL DEFAULT 10,
  duration_months int NOT NULL DEFAULT 12,
  modalities text[] DEFAULT '{}',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + interval '12 months')::date,
  auto_renew boolean DEFAULT true,
  contract_body_html text,
  uploaded_file_url text,
  signed_at timestamptz,
  student_signature_ip text,
  student_signature_ua text,
  guardian_signature_ip text,
  guardian_signature_ua text,
  digital_hash text,
  injury_waiver_accepted boolean DEFAULT false,
  medical_clearance_accepted boolean DEFAULT false,
  image_consent_accepted boolean DEFAULT false,
  lgpd_consent_accepted boolean DEFAULT false,
  status text DEFAULT 'draft' CHECK (status IN ('draft','pending_signature','active','suspended','cancelled','expired','renewed')),
  cancellation_date date,
  cancellation_reason text,
  membership_id uuid REFERENCES public.memberships(id),
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.student_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contracts_academy ON public.student_contracts;
CREATE POLICY contracts_academy ON public.student_contracts FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));
DROP POLICY IF EXISTS contracts_student ON public.student_contracts;
CREATE POLICY contracts_student ON public.student_contracts FOR SELECT
  USING (student_profile_id IN (SELECT public.get_my_profile_ids()));

-- Historico de acoes no contrato
CREATE TABLE IF NOT EXISTS public.contract_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_type text NOT NULL CHECK (contract_type IN ('software','student')),
  contract_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('created','edited','sent','viewed','signed','renewed','suspended','cancelled','uploaded','template_changed')),
  actor_id uuid REFERENCES public.profiles(id),
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- INDICES
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_software_contracts_academy ON public.software_contracts(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_templates_academy ON public.academy_contract_templates(academy_id);
CREATE INDEX IF NOT EXISTS idx_student_contracts_academy ON public.student_contracts(academy_id);
CREATE INDEX IF NOT EXISTS idx_student_contracts_student ON public.student_contracts(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_contracts_status ON public.student_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_history_contract ON public.contract_history(contract_id);
