-- ============================================================
-- BlackBelt v2 — Migration 002: Tenants (Academies, Units, Memberships)
-- ============================================================

CREATE TABLE public.academies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  plan_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_academies_slug ON public.academies(slug);
CREATE INDEX idx_academies_owner ON public.academies(owner_id);

CREATE TRIGGER academies_updated_at
  BEFORE UPDATE ON public.academies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_units_academy ON public.units(academy_id);

CREATE TRIGGER units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'professor', 'aluno_adulto', 'aluno_teen', 'aluno_kids', 'responsavel')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, academy_id, role)
);

CREATE INDEX idx_memberships_profile ON public.memberships(profile_id);
CREATE INDEX idx_memberships_academy ON public.memberships(academy_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);

CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Academies: members can read, admin can write
CREATE POLICY academies_select ON public.academies
  FOR SELECT USING (public.is_member_of(id));

CREATE POLICY academies_insert ON public.academies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY academies_update ON public.academies
  FOR UPDATE USING (owner_id = auth.uid());

-- Units: members can read, admin can write
CREATE POLICY units_select ON public.units
  FOR SELECT USING (public.is_member_of(academy_id));

CREATE POLICY units_insert ON public.units
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = units.academy_id AND role = 'admin')
  );

CREATE POLICY units_update ON public.units
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = units.academy_id AND role = 'admin')
  );

-- Memberships: members can read own academy, admin can write
CREATE POLICY memberships_select ON public.memberships
  FOR SELECT USING (public.is_member_of(academy_id));

CREATE POLICY memberships_insert ON public.memberships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.memberships m WHERE m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND m.academy_id = memberships.academy_id AND m.role = 'admin')
  );

CREATE POLICY memberships_update ON public.memberships
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.memberships m WHERE m.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND m.academy_id = memberships.academy_id AND m.role = 'admin')
  );
