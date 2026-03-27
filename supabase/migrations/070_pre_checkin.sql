-- ================================================================
-- 070 — Pre-Check-in (Intencao de Presenca)
-- ================================================================

CREATE TABLE IF NOT EXISTS pre_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id uuid NOT NULL,
  class_date date NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, class_date)
);

CREATE INDEX idx_pre_checkins_academy ON pre_checkins(academy_id);
CREATE INDEX idx_pre_checkins_class ON pre_checkins(class_id, class_date);
CREATE INDEX idx_pre_checkins_student ON pre_checkins(student_id);

ALTER TABLE pre_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pre_checkin_academy" ON pre_checkins
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));
