-- ============================================================
-- BlackBelt v2 — Migration 020: Fix memberships RLS recursion
--
-- Problem: memberships_select policy queries memberships itself
-- in the OR branch → infinite recursion.
--
-- Fix: SECURITY DEFINER function get_my_academy_ids() to bypass RLS.
-- Also fix memberships INSERT/UPDATE policies that self-reference.
-- ============================================================

-- 1. Helper: get current user's academy IDs (bypasses RLS on both profiles and memberships)
CREATE OR REPLACE FUNCTION public.get_my_academy_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT m.academy_id
  FROM public.memberships m
  JOIN public.profiles p ON p.id = m.profile_id
  WHERE p.user_id = auth.uid()
  AND m.status = 'active';
$$;

-- 2. Fix memberships_select: use helper functions, no self-reference
DROP POLICY IF EXISTS memberships_select ON public.memberships;
CREATE POLICY memberships_select ON public.memberships FOR SELECT USING (
  profile_id IN (SELECT public.get_my_profile_ids())
  OR academy_id IN (SELECT public.get_my_academy_ids())
);

-- 3. Fix memberships_insert: was self-referencing from migration 002
DROP POLICY IF EXISTS memberships_insert ON public.memberships;
CREATE POLICY memberships_insert ON public.memberships FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.get_my_profile_ids() pid
    JOIN public.memberships m ON m.profile_id = pid
    WHERE m.academy_id = memberships.academy_id
    AND m.role = 'admin'
    AND m.status = 'active'
  )
);

-- 4. Fix memberships_update: was self-referencing from migration 002
DROP POLICY IF EXISTS memberships_update ON public.memberships;
CREATE POLICY memberships_update ON public.memberships FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.get_my_profile_ids() pid
    JOIN public.memberships m ON m.profile_id = pid
    WHERE m.academy_id = memberships.academy_id
    AND m.role = 'admin'
    AND m.status = 'active'
  )
);
