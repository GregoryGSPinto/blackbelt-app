-- ============================================================
-- BlackBelt v2 — Migration 041: Real Flows — Check-in & Visitantes
-- ============================================================

-- ── 1. RLS policies for checkins table ────────────────────────
-- Members of the academy can SELECT
CREATE POLICY IF NOT EXISTS checkins_select ON public.checkins
  FOR SELECT USING (
    academy_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.academy_id = checkins.academy_id
      AND m.status = 'active'
    )
  );

-- Admin, professor, recepcao can INSERT
CREATE POLICY IF NOT EXISTS checkins_insert ON public.checkins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.academy_id = checkins.academy_id
      AND m.role IN ('admin', 'professor')
      AND m.status = 'active'
    )
    -- Allow students to check themselves in
    OR checkins.profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Admin can UPDATE (for check_out_at)
CREATE POLICY IF NOT EXISTS checkins_update ON public.checkins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.academy_id = checkins.academy_id
      AND m.role IN ('admin', 'professor')
      AND m.status = 'active'
    )
  );

-- ── 2. Visitantes table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.visitantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  nome text NOT NULL,
  motivo text,
  telefone text,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visitantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS visitantes_select ON public.visitantes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.academy_id = visitantes.academy_id
      AND m.status = 'active'
    )
  );

CREATE POLICY IF NOT EXISTS visitantes_insert ON public.visitantes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.academy_id = visitantes.academy_id
      AND m.status = 'active'
    )
  );

-- ── 3. RLS policy for attendance INSERT by recepcao ───────────
-- Allow academy admin/recepcao roles to insert attendance
CREATE POLICY IF NOT EXISTS attendance_insert_admin ON public.attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.units u ON u.id = c.unit_id
      JOIN public.memberships m ON m.academy_id = u.academy_id
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE c.id = attendance.class_id
      AND p.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.status = 'active'
    )
  );

-- ── 4. INSERT policies for students/enrollments (admin use) ───
CREATE POLICY IF NOT EXISTS students_insert ON public.students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.academy_id = students.academy_id
      AND m.role = 'admin'
      AND m.status = 'active'
    )
  );

CREATE POLICY IF NOT EXISTS class_enrollments_insert ON public.class_enrollments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.units u ON u.id = c.unit_id
      JOIN public.memberships m ON m.academy_id = u.academy_id
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE c.id = class_enrollments.class_id
      AND p.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.status = 'active'
    )
  );
