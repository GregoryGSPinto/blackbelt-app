-- ============================================================
-- BlackBelt v2 — Migration 004: Attendance
-- ============================================================

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  checked_at timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL DEFAULT 'manual' CHECK (method IN ('qr_code', 'manual', 'system')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helper: immutable date extraction (timestamptz::date is only STABLE)
CREATE OR REPLACE FUNCTION public.date_utc(ts timestamptz)
RETURNS date AS $$
  SELECT (ts AT TIME ZONE 'UTC')::date
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

-- Unique: 1 check-in per student per class per day
CREATE UNIQUE INDEX idx_attendance_unique_daily
  ON public.attendance(student_id, class_id, public.date_utc(checked_at));

CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_attendance_class ON public.attendance(class_id);
CREATE INDEX idx_attendance_date ON public.attendance(checked_at);

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY attendance_select ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.units u ON u.id = c.unit_id
      WHERE c.id = attendance.class_id AND public.is_member_of(u.academy_id)
    )
  );

CREATE POLICY attendance_insert ON public.attendance
  FOR INSERT WITH CHECK (
    -- Professor of the class or student themselves
    EXISTS (
      SELECT 1 FROM public.classes c WHERE c.id = attendance.class_id
      AND (
        c.professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR attendance.student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
      )
    )
  );
