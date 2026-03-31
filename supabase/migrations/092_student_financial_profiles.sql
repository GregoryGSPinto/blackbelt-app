-- ============================================================
-- 092 — Student Financial Profiles
-- Configuracao financeira senior por aluno com RLS dedicado
-- ============================================================

CREATE OR REPLACE FUNCTION public.can_manage_student_financial(p_academy_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.academies a
    WHERE a.id = p_academy_id
      AND a.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.memberships m
    JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid()
      AND m.academy_id = p_academy_id
      AND m.status = 'active'
      AND m.role IN ('admin', 'recepcao')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_student_financial(
  p_academy_id uuid,
  p_profile_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.can_manage_student_financial(p_academy_id)
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_profile_id
      AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.guardian_links gl
    JOIN public.profiles guardian ON guardian.id = gl.guardian_id
    WHERE gl.child_id = p_profile_id
      AND COALESCE(gl.can_manage_payments, true)
      AND guardian.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.count_student_month_checkins(
  p_profile_id uuid,
  p_reference_date date DEFAULT CURRENT_DATE
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('month', p_reference_date)::date AS month_start,
      (date_trunc('month', p_reference_date) + interval '1 month - 1 day')::date AS month_end
  ),
  attendance_count AS (
    SELECT COUNT(*)::integer AS total
    FROM public.attendance a
    JOIN public.students s ON s.id = a.student_id
    JOIN bounds b ON true
    WHERE s.profile_id = p_profile_id
      AND a.checked_at::date BETWEEN b.month_start AND LEAST(b.month_end, p_reference_date)
  ),
  checkin_count AS (
    SELECT COUNT(*)::integer AS total
    FROM public.checkins c
    JOIN bounds b ON true
    WHERE c.profile_id = p_profile_id
      AND c.check_in_at::date BETWEEN b.month_start AND LEAST(b.month_end, p_reference_date)
  )
  SELECT GREATEST(
    COALESCE((SELECT total FROM attendance_count), 0),
    COALESCE((SELECT total FROM checkin_count), 0)
  );
$$;

CREATE OR REPLACE FUNCTION public.compute_student_financial_status(
  p_financial_model text,
  p_next_due_date date,
  p_amount_cents integer,
  p_period_end_date date DEFAULT NULL,
  p_reference_date date DEFAULT CURRENT_DATE
)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF p_period_end_date IS NOT NULL AND p_period_end_date < p_reference_date THEN
    RETURN 'cancelado';
  END IF;

  IF p_financial_model IN ('bolsista', 'cortesia', 'funcionario')
     AND COALESCE(p_amount_cents, 0) <= 0 THEN
    RETURN 'isento';
  END IF;

  IF p_next_due_date IS NULL THEN
    RETURN 'em_dia';
  END IF;

  IF p_next_due_date < p_reference_date THEN
    RETURN 'atrasado';
  END IF;

  IF p_next_due_date = p_reference_date THEN
    RETURN 'vence_hoje';
  END IF;

  IF p_next_due_date <= p_reference_date + 3 THEN
    RETURN 'vence_em_breve';
  END IF;

  RETURN 'em_dia';
END;
$$;

CREATE OR REPLACE FUNCTION public.compute_checkin_goal_status(
  p_financial_model text,
  p_current_month_checkins integer,
  p_monthly_checkin_minimum integer,
  p_reference_date date DEFAULT CURRENT_DATE
)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  month_end date;
  days_left integer;
  missing_checkins integer;
BEGIN
  IF p_financial_model NOT IN ('gympass', 'totalpass') THEN
    RETURN 'ok';
  END IF;

  IF COALESCE(p_monthly_checkin_minimum, 0) <= 0 THEN
    RETURN 'ok';
  END IF;

  missing_checkins := GREATEST(
    COALESCE(p_monthly_checkin_minimum, 0) - COALESCE(p_current_month_checkins, 0),
    0
  );

  IF missing_checkins = 0 THEN
    RETURN 'ok';
  END IF;

  month_end := (date_trunc('month', p_reference_date) + interval '1 month - 1 day')::date;
  days_left := GREATEST(month_end - p_reference_date, 0);

  IF days_left <= 3 OR missing_checkins > GREATEST(days_left, 1) THEN
    RETURN 'risk';
  END IF;

  RETURN 'attention';
END;
$$;

CREATE TABLE IF NOT EXISTS public.student_financial_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  membership_id uuid NOT NULL UNIQUE REFERENCES public.memberships(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  financial_model text NOT NULL DEFAULT 'particular'
    CHECK (financial_model IN ('particular', 'gympass', 'totalpass', 'bolsista', 'cortesia', 'funcionario', 'convenio', 'avulso')),
  charge_mode text NOT NULL DEFAULT 'manual'
    CHECK (charge_mode IN ('manual', 'automatic', 'hybrid')),
  payment_method_default text NOT NULL DEFAULT 'none'
    CHECK (payment_method_default IN ('pix', 'credit_card', 'debit_card', 'boleto', 'cash', 'bank_transfer', 'external_platform', 'none')),
  recurrence text NOT NULL DEFAULT 'monthly'
    CHECK (recurrence IN ('monthly', 'quarterly', 'semiannual', 'annual', 'per_class', 'none')),
  amount_cents integer NOT NULL DEFAULT 0,
  discount_amount_cents integer NOT NULL DEFAULT 0,
  scholarship_percent numeric(5,2) NOT NULL DEFAULT 0,
  due_day smallint CHECK (due_day BETWEEN 1 AND 31),
  next_due_date date,
  financial_status text NOT NULL DEFAULT 'em_dia'
    CHECK (financial_status IN ('em_dia', 'vence_hoje', 'vence_em_breve', 'atrasado', 'isento', 'cancelado')),
  notes text,
  monthly_checkin_minimum integer NOT NULL DEFAULT 0,
  current_month_checkins integer NOT NULL DEFAULT 0,
  alert_days_before_month_end integer NOT NULL DEFAULT 5,
  last_alert_sent_at timestamptz,
  last_alert_sent_to_student boolean NOT NULL DEFAULT false,
  last_alert_sent_to_guardian boolean NOT NULL DEFAULT false,
  last_alert_sent_to_owner boolean NOT NULL DEFAULT false,
  checkin_goal_status text NOT NULL DEFAULT 'ok'
    CHECK (checkin_goal_status IN ('ok', 'attention', 'risk')),
  partnership_name text,
  partnership_transfer_mode text,
  exemption_reason text,
  period_start_date date,
  period_end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academy_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_student_financial_profiles_academy
  ON public.student_financial_profiles(academy_id, financial_model, financial_status);
CREATE INDEX IF NOT EXISTS idx_student_financial_profiles_due
  ON public.student_financial_profiles(academy_id, next_due_date);
CREATE INDEX IF NOT EXISTS idx_student_financial_profiles_checkins
  ON public.student_financial_profiles(academy_id, checkin_goal_status);

CREATE TRIGGER student_financial_profiles_updated_at
  BEFORE UPDATE ON public.student_financial_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

INSERT INTO public.student_financial_profiles (
  academy_id,
  membership_id,
  profile_id,
  financial_model,
  charge_mode,
  payment_method_default,
  recurrence,
  amount_cents,
  discount_amount_cents,
  scholarship_percent,
  due_day,
  next_due_date,
  financial_status,
  notes,
  monthly_checkin_minimum,
  current_month_checkins,
  alert_days_before_month_end,
  checkin_goal_status,
  partnership_name,
  partnership_transfer_mode,
  exemption_reason,
  period_start_date,
  period_end_date
)
SELECT
  m.academy_id,
  m.id,
  m.profile_id,
  CASE COALESCE(m.billing_type, 'particular')
    WHEN 'smartfit' THEN 'convenio'
    ELSE COALESCE(m.billing_type, 'particular')
  END,
  CASE
    WHEN m.payment_method = 'asaas' THEN 'automatic'
    ELSE 'manual'
  END,
  CASE COALESCE(m.payment_method, 'none')
    WHEN 'pix' THEN 'pix'
    WHEN 'credito' THEN 'credit_card'
    WHEN 'debito' THEN 'debit_card'
    WHEN 'boleto' THEN 'boleto'
    WHEN 'dinheiro' THEN 'cash'
    WHEN 'transferencia' THEN 'bank_transfer'
    WHEN 'asaas' THEN 'external_platform'
    ELSE 'none'
  END,
  CASE COALESCE(m.recurrence, 'mensal')
    WHEN 'mensal' THEN 'monthly'
    WHEN 'trimestral' THEN 'quarterly'
    WHEN 'semestral' THEN 'semiannual'
    WHEN 'anual' THEN 'annual'
    WHEN 'avulso' THEN 'per_class'
    ELSE 'monthly'
  END,
  COALESCE(m.monthly_amount, 0),
  0,
  COALESCE(m.discount_percent, 0),
  CASE WHEN m.billing_day BETWEEN 1 AND 31 THEN m.billing_day ELSE NULL END,
  CASE
    WHEN m.billing_day BETWEEN 1 AND 31 THEN
      make_date(
        EXTRACT(YEAR FROM CURRENT_DATE)::integer,
        EXTRACT(MONTH FROM CURRENT_DATE)::integer,
        LEAST(
          m.billing_day,
          EXTRACT(DAY FROM (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'))::integer
        )
      )
    ELSE NULL
  END,
  CASE COALESCE(m.billing_status, 'em_dia')
    WHEN 'pendente' THEN 'vence_em_breve'
    WHEN 'cortesia' THEN 'isento'
    WHEN 'cancelado' THEN 'cancelado'
    WHEN 'atrasado' THEN 'atrasado'
    ELSE 'em_dia'
  END,
  m.billing_notes,
  0,
  public.count_student_month_checkins(m.profile_id, CURRENT_DATE),
  5,
  CASE
    WHEN COALESCE(m.billing_type, 'particular') IN ('gympass', 'totalpass') THEN 'attention'
    ELSE 'ok'
  END,
  NULL,
  NULL,
  m.discount_reason,
  m.contract_start,
  m.contract_end
FROM public.memberships m
WHERE m.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids')
ON CONFLICT (membership_id) DO NOTHING;

UPDATE public.student_financial_profiles sfp
SET
  current_month_checkins = public.count_student_month_checkins(sfp.profile_id, CURRENT_DATE),
  financial_status = public.compute_student_financial_status(
    sfp.financial_model,
    sfp.next_due_date,
    sfp.amount_cents - sfp.discount_amount_cents,
    sfp.period_end_date,
    CURRENT_DATE
  ),
  checkin_goal_status = public.compute_checkin_goal_status(
    sfp.financial_model,
    public.count_student_month_checkins(sfp.profile_id, CURRENT_DATE),
    sfp.monthly_checkin_minimum,
    CURRENT_DATE
  );

ALTER TABLE public.student_payments
  ADD COLUMN IF NOT EXISTS membership_id uuid REFERENCES public.memberships(id) ON DELETE SET NULL;
ALTER TABLE public.student_payments
  ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.student_payments
  ADD COLUMN IF NOT EXISTS payment_notes text;
ALTER TABLE public.student_payments
  ADD COLUMN IF NOT EXISTS paid_amount_cents integer;
ALTER TABLE public.student_payments
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual_charge'
    CHECK (source IN ('manual_charge', 'recurring_charge', 'external_platform', 'migration'));

CREATE INDEX IF NOT EXISTS idx_student_payments_membership
  ON public.student_payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_reference_month
  ON public.student_payments(academy_id, reference_month);

UPDATE public.student_payments sp
SET membership_id = m.id
FROM public.memberships m
WHERE sp.membership_id IS NULL
  AND m.academy_id = sp.academy_id
  AND m.profile_id = sp.student_profile_id
  AND m.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids');

CREATE TABLE IF NOT EXISTS public.student_financial_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  membership_id uuid NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('student', 'guardian', 'owner')),
  alert_kind text NOT NULL CHECK (alert_kind IN ('checkin_goal', 'financial_status')),
  channel text NOT NULL DEFAULT 'internal'
    CHECK (channel IN ('internal', 'email', 'whatsapp', 'push', 'dashboard')),
  status text NOT NULL DEFAULT 'sent'
    CHECK (status IN ('pending', 'sent', 'skipped', 'failed')),
  alert_reference_date date NOT NULL DEFAULT CURRENT_DATE,
  remaining_checkins integer,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_financial_alerts_academy
  ON public.student_financial_alerts(academy_id, alert_reference_date DESC);
CREATE INDEX IF NOT EXISTS idx_student_financial_alerts_membership
  ON public.student_financial_alerts(membership_id, alert_kind, recipient_type, alert_reference_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_financial_alerts_daily
  ON public.student_financial_alerts(membership_id, alert_kind, recipient_type, alert_reference_date);

ALTER TABLE public.student_financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_financial_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_financial_profiles'
      AND policyname = 'student_financial_profiles_manage'
  ) THEN
    CREATE POLICY student_financial_profiles_manage
      ON public.student_financial_profiles
      FOR ALL
      USING (public.can_manage_student_financial(academy_id))
      WITH CHECK (public.can_manage_student_financial(academy_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_financial_profiles'
      AND policyname = 'student_financial_profiles_view_core'
  ) THEN
    CREATE POLICY student_financial_profiles_view_core
      ON public.student_financial_profiles
      FOR SELECT
      USING (public.can_view_student_financial(academy_id, profile_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_financial_alerts'
      AND policyname = 'student_financial_alerts_manage'
  ) THEN
    CREATE POLICY student_financial_alerts_manage
      ON public.student_financial_alerts
      FOR ALL
      USING (public.can_manage_student_financial(academy_id))
      WITH CHECK (public.can_manage_student_financial(academy_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_financial_alerts'
      AND policyname = 'student_financial_alerts_view'
  ) THEN
    CREATE POLICY student_financial_alerts_view
      ON public.student_financial_alerts
      FOR SELECT
      USING (public.can_view_student_financial(academy_id, profile_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invoices'
      AND policyname = 'invoices_financial_staff'
  ) THEN
    CREATE POLICY invoices_financial_staff
      ON public.invoices
      FOR ALL
      USING (academy_id IS NOT NULL AND public.can_manage_student_financial(academy_id))
      WITH CHECK (academy_id IS NOT NULL AND public.can_manage_student_financial(academy_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invoices'
      AND policyname = 'invoices_financial_view_core'
  ) THEN
    CREATE POLICY invoices_financial_view_core
      ON public.invoices
      FOR SELECT
      USING (academy_id IS NOT NULL AND profile_id IS NOT NULL AND public.can_view_student_financial(academy_id, profile_id));
  END IF;
END $$;
