-- ============================================================
-- BlackBelt v2 — Migration 008: Financial (Plans, Subscriptions, Invoices)
-- ============================================================

CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price > 0),
  interval text NOT NULL CHECK (interval IN ('monthly', 'quarterly', 'yearly')),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_plans_academy ON public.plans(academy_id);

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_student ON public.subscriptions(student_id);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  due_date date NOT NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_subscription ON public.invoices(subscription_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Plans: all members can read, admin can write
CREATE POLICY plans_select ON public.plans
  FOR SELECT USING (public.is_member_of(academy_id));

CREATE POLICY plans_insert ON public.plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = plans.academy_id AND role = 'admin')
  );

CREATE POLICY plans_update ON public.plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = plans.academy_id AND role = 'admin')
  );

-- Subscriptions: student reads own, admin reads all
CREATE POLICY subscriptions_select ON public.subscriptions
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.memberships m ON m.academy_id = s.academy_id
      WHERE s.id = subscriptions.student_id
      AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND m.role = 'admin'
    )
  );

-- Invoices: student reads own, admin reads all
CREATE POLICY invoices_select ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions sub
      WHERE sub.id = invoices.subscription_id
      AND (
        sub.student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
        OR EXISTS (
          SELECT 1 FROM public.students s
          JOIN public.memberships m ON m.academy_id = s.academy_id
          WHERE s.id = sub.student_id
          AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
          AND m.role = 'admin'
        )
      )
    )
  );

CREATE POLICY invoices_update ON public.invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions sub
      JOIN public.students s ON s.id = sub.student_id
      JOIN public.memberships m ON m.academy_id = s.academy_id
      WHERE sub.id = invoices.subscription_id
      AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND m.role = 'admin'
    )
  );
