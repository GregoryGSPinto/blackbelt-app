-- ============================================================
-- BlackBelt v2 — Migration 010: Auth Trigger + Missing Policies
-- ============================================================

-- 1. Auto-create profile when user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, role, display_name)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    'admin',
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add academy_id to classes for simpler multi-tenant queries
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS academy_id uuid REFERENCES public.academies(id);
CREATE INDEX IF NOT EXISTS idx_classes_academy ON public.classes(academy_id);

-- 3. Add name/capacity columns to classes if not present
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 30;

-- 4. Allow service_role to bypass RLS (needed for admin operations)
-- Profiles: allow insert via trigger (SECURITY DEFINER handles this)

-- 5. Missing write policies for modalities
CREATE POLICY modalities_insert ON public.modalities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND academy_id = modalities.academy_id
      AND role = 'admin'
    )
  );

CREATE POLICY modalities_update ON public.modalities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND academy_id = modalities.academy_id
      AND role = 'admin'
    )
  );

CREATE POLICY modalities_delete ON public.modalities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND academy_id = modalities.academy_id
      AND role = 'admin'
    )
  );

-- 6. Missing write policies for students
CREATE POLICY students_insert ON public.students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND academy_id = students.academy_id
      AND role IN ('admin', 'professor')
    )
  );

CREATE POLICY students_update ON public.students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND academy_id = students.academy_id
      AND role IN ('admin', 'professor')
    )
  );

-- 7. Missing write policies for classes
CREATE POLICY classes_insert ON public.classes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.memberships m ON m.academy_id = u.academy_id
      WHERE u.id = classes.unit_id
      AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND m.role = 'admin'
    )
  );

CREATE POLICY classes_update ON public.classes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.memberships m ON m.academy_id = u.academy_id
      WHERE u.id = classes.unit_id
      AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND m.role IN ('admin', 'professor')
    )
  );

CREATE POLICY classes_delete ON public.classes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.memberships m ON m.academy_id = u.academy_id
      WHERE u.id = classes.unit_id
      AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND m.role = 'admin'
    )
  );

-- 8. Missing write policies for class_enrollments
CREATE POLICY class_enrollments_insert ON public.class_enrollments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.units u ON u.id = c.unit_id
      JOIN public.memberships m ON m.academy_id = u.academy_id
      WHERE c.id = class_enrollments.class_id
      AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND m.role IN ('admin', 'professor')
    )
  );

CREATE POLICY class_enrollments_update ON public.class_enrollments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.units u ON u.id = c.unit_id
      JOIN public.memberships m ON m.academy_id = u.academy_id
      WHERE c.id = class_enrollments.class_id
      AND m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND m.role IN ('admin', 'professor')
    )
  );

-- 9. Add push_tokens table for push notifications
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_tokens_select ON public.push_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY push_tokens_insert ON public.push_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY push_tokens_delete ON public.push_tokens
  FOR DELETE USING (user_id = auth.uid());
