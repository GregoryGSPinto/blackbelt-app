-- ============================================================
-- BlackBelt v2 — Migration 007: Social (Achievements, Messages, Notifications)
-- ============================================================

CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('attendance_streak', 'belt_promotion', 'class_milestone', 'custom')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, type)
);

CREATE INDEX idx_achievements_student ON public.achievements(student_id);

CREATE TRIGGER achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid NOT NULL REFERENCES public.profiles(id),
  to_id uuid NOT NULL REFERENCES public.profiles(id),
  channel text NOT NULL DEFAULT 'direct' CHECK (channel IN ('direct', 'class_group')),
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_from ON public.messages(from_id);
CREATE INDEX idx_messages_to ON public.messages(to_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY achievements_select ON public.achievements
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE public.is_member_of(academy_id))
  );

CREATE POLICY achievements_insert ON public.achievements
  FOR INSERT WITH CHECK (
    granted_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY messages_select ON public.messages
  FOR SELECT USING (
    from_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR to_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY messages_insert ON public.messages
  FOR INSERT WITH CHECK (
    from_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY messages_update ON public.messages
  FOR UPDATE USING (
    to_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
