-- ============================================================
-- BlackBelt v2 — Migration 017: Go Live Fixes
-- Role constraint expansion + profiles RLS + superadmin policies
-- ============================================================

-- 1. Expand profiles role constraint to include all roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'superadmin', 'admin', 'gestor', 'professor', 'recepcao',
    'aluno_adulto', 'aluno_teen', 'aluno_kids', 'responsavel', 'franqueador'
  ));

-- 2. Expand memberships role constraint
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_role_check;
ALTER TABLE public.memberships ADD CONSTRAINT memberships_role_check
  CHECK (role IN (
    'superadmin', 'admin', 'gestor', 'professor', 'recepcao',
    'aluno_adulto', 'aluno_teen', 'aluno_kids', 'responsavel', 'franqueador'
  ));

-- 3. Fix profiles RLS: allow same-academy members to see each other
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (
  user_id = auth.uid()
  OR id IN (
    SELECT m2.profile_id FROM public.memberships m1
    JOIN public.memberships m2 ON m1.academy_id = m2.academy_id
    WHERE m1.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND m1.status = 'active'
    AND m2.status = 'active'
  )
);

-- 4. Superadmin can read ALL profiles
CREATE POLICY profiles_superadmin_select ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'superadmin'
  )
);

-- 5. Fix academies: superadmin can read all + members can read theirs
DROP POLICY IF EXISTS academies_select ON public.academies;
CREATE POLICY academies_select ON public.academies FOR SELECT USING (
  is_member_of(id)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'superadmin'
  )
);

-- 6. Superadmin can manage academies
CREATE POLICY academies_superadmin_all ON public.academies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'superadmin'
  )
);

-- 7. Fix memberships RLS: self-read + same-academy members
DROP POLICY IF EXISTS memberships_select ON public.memberships;
CREATE POLICY memberships_select ON public.memberships FOR SELECT USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR academy_id IN (
    SELECT m.academy_id FROM public.memberships m
    JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.status = 'active'
  )
);

-- 8. Fix students RLS: academy members can see students
DROP POLICY IF EXISTS students_select ON public.students;
DROP POLICY IF EXISTS students_sel_member_select ON public.students;
CREATE POLICY students_academy_select ON public.students FOR SELECT USING (
  academy_id IN (
    SELECT m.academy_id FROM public.memberships m
    JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.status = 'active'
  )
);

-- 9. Fix classes RLS: via unit_id → units → academy_id
DROP POLICY IF EXISTS classes_select ON public.classes;
DROP POLICY IF EXISTS classes_sel_member_select ON public.classes;
CREATE POLICY classes_academy_select ON public.classes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.units u
    WHERE u.id = classes.unit_id
    AND public.is_member_of(u.academy_id)
  )
);

-- 10. Fix class_enrollments RLS: via class_id → classes → unit_id → units
DROP POLICY IF EXISTS class_enrollments_select ON public.class_enrollments;
DROP POLICY IF EXISTS class_enrollments_sel_member_select ON public.class_enrollments;
CREATE POLICY class_enrollments_select ON public.class_enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.units u ON u.id = c.unit_id
    WHERE c.id = class_enrollments.class_id
    AND public.is_member_of(u.academy_id)
  )
);

-- 11. Attendance already has a good select policy from migration 004.
-- Just ensure it's named correctly and exists.
DROP POLICY IF EXISTS attendance_sel_member_select ON public.attendance;
-- Keep the existing attendance_select from 004 if present.

-- 12. Fix modalities RLS
DROP POLICY IF EXISTS modalities_select ON public.modalities;
DROP POLICY IF EXISTS modalities_sel_member_select ON public.modalities;
CREATE POLICY modalities_academy_select ON public.modalities FOR SELECT USING (
  public.is_member_of(academy_id)
);

-- 13. Fix units RLS
DROP POLICY IF EXISTS units_select ON public.units;
DROP POLICY IF EXISTS units_sel_member_select ON public.units;
CREATE POLICY units_academy_select ON public.units FOR SELECT USING (
  public.is_member_of(academy_id)
);

-- 14. Fix subscriptions RLS: via student_id → students → academy_id
DROP POLICY IF EXISTS subscriptions_select ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_sel_member_select ON public.subscriptions;
CREATE POLICY subscriptions_academy_select ON public.subscriptions FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE st.academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
    )
  )
);

-- 15. Fix invoices RLS: via subscription_id → subscriptions → students → academy_id
DROP POLICY IF EXISTS invoices_select ON public.invoices;
DROP POLICY IF EXISTS invoices_sel_member_select ON public.invoices;
CREATE POLICY invoices_academy_select ON public.invoices FOR SELECT USING (
  subscription_id IN (
    SELECT sub.id FROM public.subscriptions sub
    JOIN public.students st ON st.id = sub.student_id
    WHERE st.academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
    )
  )
);

-- 16. Fix messages RLS: from_id or to_id matches user's profile
DROP POLICY IF EXISTS messages_select ON public.messages;
DROP POLICY IF EXISTS messages_sel_member_select ON public.messages;
CREATE POLICY messages_user_select ON public.messages FOR SELECT USING (
  from_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR to_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY messages_user_insert ON public.messages FOR INSERT WITH CHECK (
  from_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- 17. Fix evaluations RLS: via student_id → students → academy_id
DROP POLICY IF EXISTS evaluations_select ON public.evaluations;
DROP POLICY IF EXISTS evaluations_sel_member_select ON public.evaluations;
CREATE POLICY evaluations_academy_select ON public.evaluations FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE st.academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
    )
  )
);

-- 18. Fix progressions RLS
DROP POLICY IF EXISTS progressions_select ON public.progressions;
DROP POLICY IF EXISTS progressions_sel_member_select ON public.progressions;
CREATE POLICY progressions_academy_select ON public.progressions FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE st.academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
    )
  )
);

-- 19. Fix achievements RLS
DROP POLICY IF EXISTS achievements_select ON public.achievements;
DROP POLICY IF EXISTS achievements_sel_member_select ON public.achievements;
CREATE POLICY achievements_academy_select ON public.achievements FOR SELECT USING (
  student_id IN (
    SELECT st.id FROM public.students st
    WHERE st.academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
    )
  )
);

-- 20. Add name and capacity columns to classes (services expect them)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 30;
-- Backfill name from modality name if null
UPDATE public.classes c SET name = m.name
FROM public.modalities m WHERE c.modality_id = m.id AND c.name IS NULL;
