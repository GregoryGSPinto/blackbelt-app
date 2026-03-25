-- ============================================================
-- BlackBelt v2 — Migration 060: Content, Streaming, Kids
-- ============================================================

-- ── courses ──
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  description text,
  modality text,
  belt_level text,
  price numeric(12,2) DEFAULT 0,
  thumbnail_url text,
  preview_video_url text,
  status text DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS courses_read ON public.courses FOR SELECT USING (true);

-- ── course_modules ──
CREATE TABLE IF NOT EXISTS public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS course_modules_read ON public.course_modules FOR SELECT USING (true);

-- ── course_lessons ──
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text,
  video_url text,
  duration integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS course_lessons_read ON public.course_lessons FOR SELECT USING (true);

-- ── course_analytics ──
CREATE TABLE IF NOT EXISTS public.course_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  course_title text,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  sales integer DEFAULT 0,
  revenue numeric(12,2) DEFAULT 0,
  reviews integer DEFAULT 0,
  monthly_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS course_analytics_own ON public.course_analytics FOR ALL USING (creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── streaming_trails ──
CREATE TABLE IF NOT EXISTS public.streaming_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  description text,
  gradient_css text,
  total_videos integer DEFAULT 0,
  total_duration text,
  min_belt text,
  belt_level text,
  certificate_available boolean DEFAULT false,
  series jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS streaming_trails_read ON public.streaming_trails FOR SELECT USING (true);

-- ── streaming_series ──
CREATE TABLE IF NOT EXISTS public.streaming_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  thumbnail_url text,
  gradient_css text,
  professor_id uuid,
  professor_name text,
  modality text,
  min_belt text,
  total_duration text,
  category text DEFAULT 'fundamentos',
  tags jsonb DEFAULT '[]'::jsonb,
  recommended boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS streaming_series_read ON public.streaming_series FOR SELECT USING (true);

-- ── streaming_episodes ──
CREATE TABLE IF NOT EXISTS public.streaming_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES public.streaming_series(id) ON DELETE CASCADE,
  title text,
  description text,
  duration_seconds integer DEFAULT 0,
  thumbnail_url text,
  video_url text,
  gradient_css text,
  professor_id uuid,
  professor_name text,
  modality text,
  min_belt text,
  sort_order integer DEFAULT 0,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS streaming_episodes_read ON public.streaming_episodes FOR SELECT USING (true);

-- ── streaming_library ──
CREATE TABLE IF NOT EXISTS public.streaming_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  featured jsonb,
  continue_watching jsonb DEFAULT '[]'::jsonb,
  recommended jsonb DEFAULT '[]'::jsonb,
  trails jsonb DEFAULT '[]'::jsonb,
  all_series jsonb DEFAULT '[]'::jsonb,
  recent jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS streaming_library_own ON public.streaming_library FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── streaming_certificates ──
CREATE TABLE IF NOT EXISTS public.streaming_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  trail_id uuid REFERENCES public.streaming_trails(id) ON DELETE CASCADE,
  student_name text,
  trail_name text,
  professor_name text,
  academy_name text,
  total_videos integer DEFAULT 0,
  total_duration text,
  score numeric(5,2) DEFAULT 0,
  issued_at timestamptz DEFAULT now(),
  verification_code text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS streaming_certificates_own ON public.streaming_certificates FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── streaming_trail_progress ──
CREATE TABLE IF NOT EXISTS public.streaming_trail_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  trail_id uuid REFERENCES public.streaming_trails(id) ON DELETE CASCADE,
  completed_videos integer DEFAULT 0,
  total_videos integer DEFAULT 0,
  completed_series jsonb DEFAULT '[]'::jsonb,
  average_quiz_score numeric(5,2) DEFAULT 0,
  certificate jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_trail_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS streaming_trail_progress_own ON public.streaming_trail_progress FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── streaming_watch_progress ──
CREATE TABLE IF NOT EXISTS public.streaming_watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id uuid REFERENCES public.streaming_episodes(id) ON DELETE CASCADE,
  progress_seconds integer DEFAULT 0,
  progress_pct numeric(5,2) DEFAULT 0,
  total_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_watch_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS streaming_watch_progress_own ON public.streaming_watch_progress FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── video_series ──
CREATE TABLE IF NOT EXISTS public.video_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  title text,
  video_count integer DEFAULT 0,
  belt_level text,
  thumbnail_color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.video_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS video_series_isolation ON public.video_series FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── kids_profiles ──
CREATE TABLE IF NOT EXISTS public.kids_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome text,
  avatar text,
  mascote text,
  cor_favorita text,
  faixa_atual text,
  faixa_cor text,
  idade_anos integer DEFAULT 0,
  estrelas_total integer DEFAULT 0,
  estrelas_esta_semana integer DEFAULT 0,
  estrelas_este_mes integer DEFAULT 0,
  nivel integer DEFAULT 1,
  nome_nivel text,
  estrelas_para_proximo_nivel integer DEFAULT 0,
  estrelas_atual_no_nivel integer DEFAULT 0,
  dias_seguidos integer DEFAULT 0,
  recorde_dias_seguidos integer DEFAULT 0,
  figurinhas_coletadas integer DEFAULT 0,
  figurinhas_total integer DEFAULT 0,
  titulo_atual text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kids_profiles_own ON public.kids_profiles FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── kids_albums ──
CREATE TABLE IF NOT EXISTS public.kids_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_figurinhas integer DEFAULT 0,
  coletadas integer DEFAULT 0,
  temas jsonb DEFAULT '[]'::jsonb,
  proxima_figurinha jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kids_albums_own ON public.kids_albums FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── kids_estrelas_historico ──
CREATE TABLE IF NOT EXISTS public.kids_estrelas_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  data timestamptz DEFAULT now(),
  estrelas integer DEFAULT 0,
  motivo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_estrelas_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kids_estrelas_historico_own ON public.kids_estrelas_historico FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── kids_faixas ──
CREATE TABLE IF NOT EXISTS public.kids_faixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  faixa_atual jsonb DEFAULT '{}'::jsonb,
  proxima_faixa jsonb DEFAULT '{}'::jsonb,
  historico_faixas jsonb DEFAULT '[]'::jsonb,
  coisas_boas jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_faixas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kids_faixas_own ON public.kids_faixas FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── kids_personalizacao ──
CREATE TABLE IF NOT EXISTS public.kids_personalizacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  mascotes_disponiveis jsonb DEFAULT '[]'::jsonb,
  mascote_atual text,
  molduras jsonb DEFAULT '[]'::jsonb,
  moldura_atual text,
  cores jsonb DEFAULT '[]'::jsonb,
  cor_atual text,
  titulos_disponiveis jsonb DEFAULT '[]'::jsonb,
  titulo_atual text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_personalizacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kids_personalizacao_own ON public.kids_personalizacao FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── kids_recompensas ──
CREATE TABLE IF NOT EXISTS public.kids_recompensas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome text,
  descricao text,
  emoji text,
  custo_estrelas integer DEFAULT 0,
  tipo text DEFAULT 'titulo',
  disponivel boolean DEFAULT true,
  ja_resgatada boolean DEFAULT false,
  entregue boolean DEFAULT false,
  estoque integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_recompensas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kids_recompensas_own ON public.kids_recompensas FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── kids_resgates ──
CREATE TABLE IF NOT EXISTS public.kids_resgates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  recompensa text,
  emoji text,
  custo_estrelas integer DEFAULT 0,
  data timestamptz DEFAULT now(),
  tipo text,
  entregue boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_resgates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kids_resgates_own ON public.kids_resgates FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── wishlist ──
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS wishlist_own ON public.wishlist FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
