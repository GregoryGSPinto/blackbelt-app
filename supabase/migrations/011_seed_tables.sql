-- ============================================================
-- BlackBelt v2 — Migration 011: Additional tables for full seed
-- leads, events, event_registrations, xp, challenges, challenge_progress,
-- feed_posts, feed_likes, feed_comments, class_notes, nps_responses
-- ============================================================

-- Leads / CRM
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  modality text,
  origin text NOT NULL CHECK (origin IN ('instagram','facebook','google','indicacao','passou_na_frente','linkedin','outro')),
  referred_by uuid REFERENCES public.students(id),
  status text NOT NULL DEFAULT 'lead' CHECK (status IN ('lead','contatado','experimental_marcada','compareceu','matriculou','descartado','ex_aluno')),
  notes text,
  experimental_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_academy ON public.leads(academy_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_select ON public.leads FOR SELECT USING (public.is_member_of(academy_id));
CREATE POLICY leads_insert ON public.leads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = leads.academy_id AND role = 'admin')
);
CREATE POLICY leads_update ON public.leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = leads.academy_id AND role = 'admin')
);

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('graduacao','campeonato','seminario','workshop','social','open_mat')),
  date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  max_slots integer,
  price numeric(10,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_academy ON public.events(academy_id);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_select ON public.events FOR SELECT USING (public.is_member_of(academy_id));
CREATE POLICY events_insert ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = events.academy_id AND role = 'admin')
);

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Event registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inscrito' CHECK (status IN ('inscrito','confirmado','cancelado','compareceu')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, student_id)
);
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY event_reg_select ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY event_reg_insert ON public.event_registrations FOR INSERT WITH CHECK (true);

-- XP / Ranking
CREATE TABLE IF NOT EXISTS public.student_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  title text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id)
);
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY xp_select ON public.student_xp FOR SELECT USING (true);
CREATE POLICY xp_upsert ON public.student_xp FOR INSERT WITH CHECK (true);
CREATE POLICY xp_update ON public.student_xp FOR UPDATE USING (true);

-- Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  xp_reward integer NOT NULL DEFAULT 0,
  target integer NOT NULL,
  metric text NOT NULL CHECK (metric IN ('presencas','streak','videos','avaliacoes')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY challenges_select ON public.challenges FOR SELECT USING (public.is_member_of(academy_id));

-- Challenge progress
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  current integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE (challenge_id, student_id)
);
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY cp_select ON public.challenge_progress FOR SELECT USING (true);

-- Feed posts
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id),
  type text NOT NULL CHECK (type IN ('manual','promocao','conquista','milestone','comunicado','sistema')),
  content text NOT NULL,
  image_url text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feed_posts_academy ON public.feed_posts(academy_id);
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY feed_select ON public.feed_posts FOR SELECT USING (public.is_member_of(academy_id));
CREATE POLICY feed_insert ON public.feed_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = feed_posts.academy_id AND role IN ('admin','professor'))
);

-- Feed likes
CREATE TABLE IF NOT EXISTS public.feed_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, profile_id)
);
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY likes_select ON public.feed_likes FOR SELECT USING (true);

-- Feed comments
CREATE TABLE IF NOT EXISTS public.feed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_select ON public.feed_comments FOR SELECT USING (true);

-- Class notes (professor observations)
CREATE TABLE IF NOT EXISTS public.class_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL REFERENCES public.profiles(id),
  student_id uuid REFERENCES public.students(id),
  content text NOT NULL,
  note_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_class_notes_class ON public.class_notes(class_id);
CREATE INDEX IF NOT EXISTS idx_class_notes_student ON public.class_notes(student_id);
ALTER TABLE public.class_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY notes_select ON public.class_notes FOR SELECT USING (true);
CREATE POLICY notes_insert ON public.class_notes FOR INSERT WITH CHECK (
  professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY notes_update ON public.class_notes FOR UPDATE USING (
  professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE TRIGGER class_notes_updated_at BEFORE UPDATE ON public.class_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- NPS responses
CREATE TABLE IF NOT EXISTS public.nps_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY nps_select ON public.nps_responses FOR SELECT USING (public.is_member_of(academy_id));

-- Also add missing columns to achievements for richer data
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_type_check;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS rarity text DEFAULT 'common';
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS xp_reward integer DEFAULT 0;
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_student_id_type_key;

-- Add observation column to evaluations
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS observation text;
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS consistency integer CHECK (consistency >= 0 AND consistency <= 100);
