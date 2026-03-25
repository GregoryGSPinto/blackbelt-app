-- ============================================================
-- BlackBelt v2 — Migration 057: Training, Classes, Professors
-- ============================================================

-- ── professors ──
CREATE TABLE IF NOT EXISTS public.professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  specialties jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS professors_read ON public.professors FOR SELECT USING (true);

-- ── agenda_slots ──
CREATE TABLE IF NOT EXISTS public.agenda_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text DEFAULT 'class',
  title text NOT NULL,
  day integer DEFAULT 0,
  start_time text NOT NULL,
  end_time text NOT NULL,
  student_name text,
  status text DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agenda_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS agenda_slots_own ON public.agenda_slots FOR ALL USING (professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── class_schedule ──
CREATE TABLE IF NOT EXISTS public.class_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name text DEFAULT '',
  modality text DEFAULT '',
  professor_name text DEFAULT '',
  room text DEFAULT '',
  day_of_week integer DEFAULT 0,
  start_time text NOT NULL,
  end_time text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS class_schedule_isolation ON public.class_schedule FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── class_students ──
CREATE TABLE IF NOT EXISTS public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name text DEFAULT '',
  belt text DEFAULT '',
  enrolled_at timestamptz DEFAULT now(),
  attendance_rate numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS class_students_read ON public.class_students FOR SELECT USING (true);

-- ── curricula ──
CREATE TABLE IF NOT EXISTS public.curricula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  modality text NOT NULL,
  target_belt text NOT NULL,
  requirements jsonb DEFAULT '[]'::jsonb,
  min_time_months integer DEFAULT 0,
  min_attendance integer DEFAULT 0,
  min_evaluation_score integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS curricula_isolation ON public.curricula FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── curriculum_requirements ──
CREATE TABLE IF NOT EXISTS public.curriculum_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id uuid REFERENCES public.curricula(id) ON DELETE CASCADE,
  category text DEFAULT 'tecnicas_obrigatorias',
  name text NOT NULL,
  description text DEFAULT '',
  video_ref_id text,
  required boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.curriculum_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS curriculum_requirements_read ON public.curriculum_requirements FOR SELECT USING (true);

-- ── diarios_aula ──
CREATE TABLE IF NOT EXISTS public.diarios_aula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  turma_nome text,
  data date NOT NULL,
  professor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professor_nome text,
  tecnicas_ensinadas jsonb DEFAULT '[]'::jsonb,
  tema_geral text,
  observacoes_gerais text,
  alunos_destaque jsonb DEFAULT '[]'::jsonb,
  alunos_dificuldade jsonb DEFAULT '[]'::jsonb,
  total_presentes integer DEFAULT 0,
  total_matriculados integer DEFAULT 0,
  duracao_minutos integer DEFAULT 0,
  intensidade text DEFAULT 'leve',
  tipo text DEFAULT 'tecnica',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diarios_aula ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS diarios_aula_own ON public.diarios_aula FOR ALL USING (professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── exercise_logs ──
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.training_plans(id) ON DELETE CASCADE,
  exercise_id uuid,
  session_id uuid,
  week_number integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS exercise_logs_read ON public.exercise_logs FOR SELECT USING (true);

-- ── experimentais ──
CREATE TABLE IF NOT EXISTS public.experimentais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  telefone text,
  email text,
  idade integer DEFAULT 0,
  modalidade text,
  turma text,
  horario text,
  data date,
  origem text,
  observacoes text,
  status text DEFAULT 'agendada',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.experimentais ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS experimentais_read ON public.experimentais FOR SELECT USING (true);

-- ── lesson_requests ──
CREATE TABLE IF NOT EXISTS public.lesson_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid,
  student_name text,
  requested_date date,
  requested_time text,
  status text DEFAULT 'pending',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS lesson_requests_own ON public.lesson_requests FOR ALL USING (professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── notas_aluno ──
CREATE TABLE IF NOT EXISTS public.notas_aluno (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid,
  professor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  professor_nome text,
  texto text,
  tipo text DEFAULT 'observacao',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notas_aluno ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS notas_aluno_read ON public.notas_aluno FOR SELECT USING (true);

-- ── professor_alerts ──
CREATE TABLE IF NOT EXISTS public.professor_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo text,
  titulo text,
  mensagem text,
  aluno_id uuid,
  aluno_nome text,
  turma_id uuid,
  turma_nome text,
  urgencia text DEFAULT 'info',
  acao jsonb DEFAULT '{}'::jsonb,
  lido boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.professor_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS professor_alerts_own ON public.professor_alerts FOR ALL USING (professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── professor_reports ──
CREATE TABLE IF NOT EXISTS public.professor_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  nome text,
  avatar text,
  periodo text,
  total_aulas_no_mes integer DEFAULT 0,
  media_alunos_por_aula numeric(12,2),
  taxa_presenca_media numeric(12,2),
  avaliacao_media numeric(12,2),
  turmas jsonb DEFAULT '[]'::jsonb,
  horas_totais numeric(12,2),
  aulas_detalhadas jsonb DEFAULT '[]'::jsonb,
  evolucao_mensal jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.professor_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS professor_reports_isolation ON public.professor_reports FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── promotion_candidates ──
CREATE TABLE IF NOT EXISTS public.promotion_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  display_name text,
  avatar text,
  current_belt text,
  next_belt text,
  total_classes integer DEFAULT 0,
  months_at_current_belt integer DEFAULT 0,
  attendance_streak integer DEFAULT 0,
  last_evaluation_score numeric(12,2),
  achievements_count integer DEFAULT 0,
  xp_total integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promotion_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS promotion_candidates_isolation ON public.promotion_candidates FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── relatorios_aula ──
CREATE TABLE IF NOT EXISTS public.relatorios_aula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  turma_nome text,
  modalidade text,
  professor_nome text,
  data date NOT NULL,
  horario text,
  total_matriculados integer DEFAULT 0,
  total_presentes integer DEFAULT 0,
  taxa_presenca numeric(12,2) DEFAULT 0,
  alunos_presentes jsonb DEFAULT '[]'::jsonb,
  alunos_ausentes jsonb DEFAULT '[]'::jsonb,
  tema_aula text,
  tecnicas_ensinadas jsonb DEFAULT '[]'::jsonb,
  tipo_aula text,
  intensidade text,
  observacoes text,
  destaques jsonb DEFAULT '[]'::jsonb,
  dificuldades jsonb DEFAULT '[]'::jsonb,
  presenca_vs_media_turma numeric(12,2) DEFAULT 0,
  presenca_vs_aula_anterior numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.relatorios_aula ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS relatorios_aula_own ON public.relatorios_aula FOR ALL USING (professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── substitutions ──
CREATE TABLE IF NOT EXISTS public.substitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_slot text,
  original_teacher_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  substitute_teacher_id uuid REFERENCES public.profiles(id),
  reason text,
  class_name text,
  original_teacher_name text,
  substitute_teacher_name text,
  notified_students integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS substitutions_isolation ON public.substitutions FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── techniques ──
CREATE TABLE IF NOT EXISTS public.techniques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  modality text,
  belt_level text,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  description text,
  video_url text,
  thumbnail_url text,
  key_points jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.techniques ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS techniques_read ON public.techniques FOR SELECT USING (true);

-- ── tecnicas ──
CREATE TABLE IF NOT EXISTS public.tecnicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  posicao text,
  categoria text,
  modalidade text,
  faixa_minima text,
  descricao text,
  passos jsonb DEFAULT '[]'::jsonb,
  dicas jsonb DEFAULT '[]'::jsonb,
  variacoes jsonb DEFAULT '[]'::jsonb,
  video_url text,
  criado_por text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tecnicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS tecnicas_read ON public.tecnicas FOR SELECT USING (true);

-- ── trial_classes ──
CREATE TABLE IF NOT EXISTS public.trial_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  lead_nome text,
  lead_email text,
  lead_telefone text,
  lead_origem text DEFAULT 'site',
  turma_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  turma_nome text,
  data_agendada date,
  status text DEFAULT 'agendada',
  professor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  professor_nome text,
  observacoes text,
  follow_up_enviado boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trial_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS trial_classes_isolation ON public.trial_classes FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── belt_history ──
CREATE TABLE IF NOT EXISTS public.belt_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_belt text NOT NULL,
  to_belt text NOT NULL,
  date date NOT NULL,
  evaluated_by_name text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.belt_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS belt_history_own ON public.belt_history FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── belt_requirements ──
CREATE TABLE IF NOT EXISTS public.belt_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proxima_faixa text NOT NULL,
  presenca jsonb DEFAULT '{}'::jsonb,
  avaliacao jsonb DEFAULT '{}'::jsonb,
  tempo_minimo_meses integer DEFAULT 0,
  tempo_atual_meses integer DEFAULT 0,
  completo boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.belt_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS belt_requirements_own ON public.belt_requirements FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── student_curriculum_progress ──
CREATE TABLE IF NOT EXISTS public.student_curriculum_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  modality text,
  target_belt text,
  curriculum jsonb DEFAULT '{}'::jsonb,
  completed jsonb DEFAULT '[]'::jsonb,
  total integer DEFAULT 0,
  completed_count integer DEFAULT 0,
  percentage numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_curriculum_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS student_curriculum_progress_own ON public.student_curriculum_progress FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── student_journeys ──
CREATE TABLE IF NOT EXISTS public.student_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text,
  belt text,
  belt_label text,
  started_at timestamptz DEFAULT now(),
  total_classes integer DEFAULT 0,
  total_days integer DEFAULT 0,
  milestones jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS student_journeys_own ON public.student_journeys FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── student_progress ──
CREATE TABLE IF NOT EXISTS public.student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text,
  belt text,
  faixa_atual text,
  data_promocao date,
  tempo_na_faixa_dias integer DEFAULT 0,
  total_aulas integer DEFAULT 0,
  media_avaliacoes numeric(12,2) DEFAULT 0,
  avaliacoes jsonb DEFAULT '[]'::jsonb,
  historico_faixas jsonb DEFAULT '[]'::jsonb,
  avatar text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS student_progress_own ON public.student_progress FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── match_analyses ──
CREATE TABLE IF NOT EXISTS public.match_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  duration_sec integer DEFAULT 0,
  rounds integer DEFAULT 0,
  timeline jsonb DEFAULT '[]'::jsonb,
  positions jsonb DEFAULT '[]'::jsonb,
  submission_attempts jsonb DEFAULT '[]'::jsonb,
  takedowns jsonb DEFAULT '[]'::jsonb,
  points_breakdown jsonb DEFAULT '{}'::jsonb,
  tactical_summary text,
  improvement_areas jsonb DEFAULT '[]'::jsonb,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.match_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS match_analyses_read ON public.match_analyses FOR SELECT USING (true);

-- ── match_analysis_shares ──
CREATE TABLE IF NOT EXISTS public.match_analysis_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  student_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.match_analysis_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS match_analysis_shares_read ON public.match_analysis_shares FOR SELECT USING (true);

-- ── match_annotations ──
CREATE TABLE IF NOT EXISTS public.match_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  timestamp_sec integer DEFAULT 0,
  text text,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.match_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS match_annotations_read ON public.match_annotations FOR SELECT USING (true);
