-- 061_onboarding_rls.sql
-- RLS policies to allow onboarding INSERT operations.
-- During self-service registration, a newly authenticated user needs to create
-- their first academy, unit, and membership before any academy-scoped policy
-- can match.

-- Allow authenticated users to create an academy (self-service onboarding)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_can_create_academy' AND tablename = 'academies'
  ) THEN
    CREATE POLICY "users_can_create_academy"
      ON public.academies
      FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Allow authenticated users to create their own membership
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_can_create_own_membership' AND tablename = 'memberships'
  ) THEN
    CREATE POLICY "users_can_create_own_membership"
      ON public.memberships
      FOR INSERT
      WITH CHECK (
        profile_id IN (
          SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow authenticated users to create a unit for their academy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_can_create_unit_for_own_academy' AND tablename = 'units'
  ) THEN
    CREATE POLICY "users_can_create_unit_for_own_academy"
      ON public.units
      FOR INSERT
      WITH CHECK (
        academy_id IN (
          SELECT academy_id FROM public.memberships
          WHERE profile_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
          )
          AND role = 'admin'
        )
        OR
        -- Also allow if the academy owner_id matches (before membership exists)
        academy_id IN (
          SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
      );
  END IF;
END $$;
