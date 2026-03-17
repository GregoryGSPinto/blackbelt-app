-- ============================================================
-- BlackBelt v2 — Migration 019: Fix profiles RLS infinite recursion
--
-- Problem: Migration 017 created policies on "profiles" that
-- sub-query the "profiles" table itself, causing infinite recursion.
-- Similarly, memberships_select queries profiles which triggers
-- profiles_select which queries memberships → indirect recursion.
--
-- Fix: SECURITY DEFINER helper functions that bypass RLS.
-- ============================================================

-- 1. Helper: get current user's profile IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_profile_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 2. Helper: check if current user is superadmin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  );
$$;

-- 3. Fix profiles_select: use helper to avoid self-referencing recursion
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (
  user_id = auth.uid()
  OR id IN (
    SELECT m2.profile_id FROM public.memberships m1
    JOIN public.memberships m2 ON m1.academy_id = m2.academy_id
    WHERE m1.profile_id IN (SELECT public.get_my_profile_ids())
    AND m1.status = 'active'
    AND m2.status = 'active'
  )
);

-- 4. Fix profiles_superadmin_select: use helper
DROP POLICY IF EXISTS profiles_superadmin_select ON public.profiles;
CREATE POLICY profiles_superadmin_select ON public.profiles FOR SELECT USING (
  public.is_superadmin()
);

-- 5. Fix memberships_select: it queries profiles → triggers profiles_select
--    → queries memberships → indirect recursion. Use helper.
DROP POLICY IF EXISTS memberships_select ON public.memberships;
CREATE POLICY memberships_select ON public.memberships FOR SELECT USING (
  profile_id IN (SELECT public.get_my_profile_ids())
  OR academy_id IN (
    SELECT m.academy_id FROM public.memberships m
    WHERE m.profile_id IN (SELECT public.get_my_profile_ids())
    AND m.status = 'active'
  )
);

-- 6. Fix academies_select: also referenced profiles directly
DROP POLICY IF EXISTS academies_select ON public.academies;
CREATE POLICY academies_select ON public.academies FOR SELECT USING (
  public.is_member_of(id)
  OR public.is_superadmin()
);

-- 7. Fix academies_superadmin_all: referenced profiles directly
DROP POLICY IF EXISTS academies_superadmin_all ON public.academies;
CREATE POLICY academies_superadmin_all ON public.academies FOR ALL USING (
  public.is_superadmin()
);

-- 8. Fix messages_user_select and messages_user_insert: referenced profiles
DROP POLICY IF EXISTS messages_user_select ON public.messages;
CREATE POLICY messages_user_select ON public.messages FOR SELECT USING (
  from_id IN (SELECT public.get_my_profile_ids())
  OR to_id IN (SELECT public.get_my_profile_ids())
);

DROP POLICY IF EXISTS messages_user_insert ON public.messages;
CREATE POLICY messages_user_insert ON public.messages FOR INSERT WITH CHECK (
  from_id IN (SELECT public.get_my_profile_ids())
);

-- 9. Fix students_academy_select: used profiles in subquery
DROP POLICY IF EXISTS students_academy_select ON public.students;
CREATE POLICY students_academy_select ON public.students FOR SELECT USING (
  public.is_member_of(academy_id)
);

-- 10. Fix subscriptions_academy_select: chained through profiles
DROP POLICY IF EXISTS subscriptions_academy_select ON public.subscriptions;
CREATE POLICY subscriptions_academy_select ON public.subscriptions FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE public.is_member_of(st.academy_id)
  )
);

-- 11. Fix invoices_academy_select: chained through profiles
DROP POLICY IF EXISTS invoices_academy_select ON public.invoices;
CREATE POLICY invoices_academy_select ON public.invoices FOR SELECT USING (
  subscription_id IN (
    SELECT sub.id FROM public.subscriptions sub
    JOIN public.students st ON st.id = sub.student_id
    WHERE public.is_member_of(st.academy_id)
  )
);

-- 12. Fix evaluations_academy_select: chained through profiles
DROP POLICY IF EXISTS evaluations_academy_select ON public.evaluations;
CREATE POLICY evaluations_academy_select ON public.evaluations FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE public.is_member_of(st.academy_id)
  )
);

-- 13. Fix progressions_academy_select: chained through profiles
DROP POLICY IF EXISTS progressions_academy_select ON public.progressions;
CREATE POLICY progressions_academy_select ON public.progressions FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE public.is_member_of(st.academy_id)
  )
);

-- 14. Fix achievements_academy_select: chained through profiles
DROP POLICY IF EXISTS achievements_academy_select ON public.achievements;
CREATE POLICY achievements_academy_select ON public.achievements FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE public.is_member_of(st.academy_id)
  )
);
