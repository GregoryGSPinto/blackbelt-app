-- ============================================================
-- BlackBelt v2 — Migration 005: Pedagogic (Progressions, Evaluations)
-- ============================================================

CREATE TABLE public.progressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  evaluated_by uuid NOT NULL REFERENCES public.profiles(id),
  from_belt text NOT NULL,
  to_belt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_progressions_student ON public.progressions(student_id);
CREATE INDEX idx_progressions_evaluated_by ON public.progressions(evaluated_by);

CREATE TRIGGER progressions_updated_at
  BEFORE UPDATE ON public.progressions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  criteria text NOT NULL CHECK (criteria IN ('technique', 'discipline', 'attendance', 'evolution')),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_evaluations_student ON public.evaluations(student_id);
CREATE INDEX idx_evaluations_class ON public.evaluations(class_id);

CREATE TRIGGER evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY progressions_select ON public.progressions
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE public.is_member_of(academy_id))
  );

CREATE POLICY progressions_insert ON public.progressions
  FOR INSERT WITH CHECK (
    evaluated_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = progressions.evaluated_by AND role = 'professor')
  );

CREATE POLICY evaluations_select ON public.evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.units u ON u.id = c.unit_id
      WHERE c.id = evaluations.class_id AND public.is_member_of(u.academy_id)
    )
  );

CREATE POLICY evaluations_insert ON public.evaluations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c WHERE c.id = evaluations.class_id
      AND c.professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );
