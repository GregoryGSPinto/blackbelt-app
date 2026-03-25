-- ============================================================
-- BlackBelt v2 — Migration 053: Auth trigger default role → aluno_adulto
-- ============================================================
-- Previously defaulted to 'admin' which only makes sense for academy owners.
-- General users (OAuth, invite-less) should default to 'aluno_adulto'.
-- Academy owners get their role set explicitly in the onboarding wizard.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, role, display_name, created_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    'aluno_adulto',
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
