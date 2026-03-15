-- ============================================================
-- BlackBelt v2 — Migration 003: Classes (Modalities, Classes, Enrollments)
-- ============================================================

CREATE TABLE public.modalities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  belt_required text NOT NULL DEFAULT 'white',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academy_id, name)
);

CREATE INDEX idx_modalities_academy ON public.modalities(academy_id);

CREATE TRIGGER modalities_updated_at
  BEFORE UPDATE ON public.modalities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  belt text NOT NULL DEFAULT 'white',
  started_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, academy_id)
);

CREATE INDEX idx_students_profile ON public.students(profile_id);
CREATE INDEX idx_students_academy ON public.students(academy_id);
CREATE INDEX idx_students_belt ON public.students(belt);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relation text NOT NULL CHECK (relation IN ('pai', 'mae', 'tutor', 'outro')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guardian_profile_id, student_id)
);

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modality_id uuid NOT NULL REFERENCES public.modalities(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL REFERENCES public.profiles(id),
  schedule jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_modality ON public.classes(modality_id);
CREATE INDEX idx_classes_unit ON public.classes(unit_id);
CREATE INDEX idx_classes_professor ON public.classes(professor_id);
CREATE INDEX idx_classes_schedule ON public.classes USING gin(schedule);

CREATE TRIGGER classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, class_id)
);

CREATE INDEX idx_class_enrollments_student ON public.class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class ON public.class_enrollments(class_id);

CREATE TRIGGER class_enrollments_updated_at
  BEFORE UPDATE ON public.class_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY modalities_select ON public.modalities
  FOR SELECT USING (public.is_member_of(academy_id));

CREATE POLICY students_select ON public.students
  FOR SELECT USING (public.is_member_of(academy_id));

CREATE POLICY classes_select ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.units u WHERE u.id = classes.unit_id AND public.is_member_of(u.academy_id)
    )
  );

CREATE POLICY class_enrollments_select ON public.class_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.units u ON u.id = c.unit_id
      WHERE c.id = class_enrollments.class_id AND public.is_member_of(u.academy_id)
    )
  );

CREATE POLICY guardians_select ON public.guardians
  FOR SELECT USING (
    guardian_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR student_id IN (SELECT id FROM public.students WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );
