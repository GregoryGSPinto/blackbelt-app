-- ============================================================
-- BlackBelt v2 — Migration 006: Content (Videos, Series)
-- ============================================================

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  belt_level text NOT NULL DEFAULT 'white',
  duration integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_videos_academy ON public.videos(academy_id);
CREATE INDEX idx_videos_belt ON public.videos(belt_level);

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_series_academy ON public.series(academy_id);

CREATE TRIGGER series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.series_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (series_id, video_id)
);

CREATE INDEX idx_series_videos_series ON public.series_videos(series_id);

-- Video progress tracking
CREATE TABLE public.video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_watched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, video_id)
);

CREATE INDEX idx_video_progress_student ON public.video_progress(student_id);

-- RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY videos_select ON public.videos
  FOR SELECT USING (public.is_member_of(academy_id));

CREATE POLICY videos_insert ON public.videos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = videos.academy_id AND role = 'admin')
  );

CREATE POLICY videos_update ON public.videos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = videos.academy_id AND role = 'admin')
  );

CREATE POLICY videos_delete ON public.videos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.memberships WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND academy_id = videos.academy_id AND role = 'admin')
  );

CREATE POLICY series_select ON public.series
  FOR SELECT USING (public.is_member_of(academy_id));

CREATE POLICY series_videos_select ON public.series_videos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_videos.series_id AND public.is_member_of(s.academy_id))
  );

CREATE POLICY video_progress_select ON public.video_progress
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY video_progress_upsert ON public.video_progress
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );
