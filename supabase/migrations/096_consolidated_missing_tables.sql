-- ============================================================
-- BlackBelt v2 — Migration 096: Consolidated Missing Tables
-- ============================================================
-- This migration consolidates ALL 143 tables that were defined
-- in previous migration files (042–063, 20240320*) but never
-- applied to the Supabase database.
--
-- Rules applied:
--   • CREATE TABLE IF NOT EXISTS for every table
--   • REFERENCES kept for tables known to exist in Supabase:
--       academies, profiles, students, classes, units, videos,
--       platform_plans, leads, messages, notifications, events,
--       tournaments, plans, checkins, memberships
--   • REFERENCES between missing tables preserved with proper
--     ordering (dependency-first)
--   • ALTER TABLE … ENABLE ROW LEVEL SECURITY for every table
--   • NO RLS policies, NO seed data
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TIER 0 — Standalone tables (no FK to other missing tables)
-- ────────────────────────────────────────────────────────────

-- 1. academy_branding
CREATE TABLE IF NOT EXISTS public.academy_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text NOT NULL DEFAULT '#C62828',
  accent_color text NOT NULL DEFAULT '#1565C0',
  academy_name text NOT NULL DEFAULT '',
  custom_domain text,
  favicon_url text,
  login_background text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_branding ENABLE ROW LEVEL SECURITY;

-- 2. academy_events
CREATE TABLE IF NOT EXISTS public.academy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  location text DEFAULT '',
  type text DEFAULT 'seminar',
  max_participants integer DEFAULT 0,
  enrolled integer DEFAULT 0,
  modalities jsonb DEFAULT '[]'::jsonb,
  min_belt text DEFAULT 'white',
  fee numeric(12,2) DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_events ENABLE ROW LEVEL SECURITY;

-- 3. academy_plans
CREATE TABLE IF NOT EXISTS public.academy_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan_tier text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_plans ENABLE ROW LEVEL SECURITY;

-- 4. academy_platform_plans
CREATE TABLE IF NOT EXISTS public.academy_platform_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  platform_plan_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_platform_plans ENABLE ROW LEVEL SECURITY;

-- 5. academy_settings
CREATE TABLE IF NOT EXISTS public.academy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(academy_id)
);
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;

-- 6. academy_usage
CREATE TABLE IF NOT EXISTS public.academy_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan text DEFAULT 'free',
  students_active integer DEFAULT 0,
  units integer DEFAULT 0,
  classes integer DEFAULT 0,
  usage_percent numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_usage ENABLE ROW LEVEL SECURITY;

-- 7. agenda_slots
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

-- 8. announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_roles text[] DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 9. announcement_reads (FK → announcements)
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, profile_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- 10. api_keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid NOT NULL,
  key_hash text NOT NULL,
  role varchar(30) DEFAULT 'viewer',
  profile_id uuid,
  label text,
  revoked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 11. belt_criteria
CREATE TABLE IF NOT EXISTS public.belt_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_belt text NOT NULL,
  to_belt text NOT NULL,
  min_attendance integer NOT NULL DEFAULT 30,
  min_months integer NOT NULL DEFAULT 6,
  min_quiz_avg numeric NOT NULL DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_belt, to_belt)
);
ALTER TABLE public.belt_criteria ENABLE ROW LEVEL SECURITY;

-- 12. belt_history
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

-- 13. belt_promotions
CREATE TABLE IF NOT EXISTS public.belt_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  from_belt text NOT NULL,
  to_belt text NOT NULL,
  proposed_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  criteria_met jsonb DEFAULT '{}',
  proposed_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.belt_promotions ENABLE ROW LEVEL SECURITY;

-- 14. belt_requirements
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

-- 15. billing_config
CREATE TABLE IF NOT EXISTS public.billing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  auto_charge boolean DEFAULT false,
  due_day_of_month integer DEFAULT 5,
  reminder_days_before integer DEFAULT 3,
  block_after_days integer DEFAULT 10,
  gateway text DEFAULT 'mock',
  gateway_api_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_config ENABLE ROW LEVEL SECURITY;

-- 16. billing_downgrade_requests
CREATE TABLE IF NOT EXISTS public.billing_downgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan_slug text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_downgrade_requests ENABLE ROW LEVEL SECURITY;

-- 17. billing_invoices
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  period text NOT NULL,
  base_cost_cents integer DEFAULT 0,
  overage_details jsonb DEFAULT '[]'::jsonb,
  overage_total_cents integer DEFAULT 0,
  total_cents integer DEFAULT 0,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

-- 18. billing_overage_projections
CREATE TABLE IF NOT EXISTS public.billing_overage_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  base_cost_cents integer DEFAULT 0,
  overage_students jsonb DEFAULT '{}'::jsonb,
  overage_professors jsonb DEFAULT '{}'::jsonb,
  overage_classes jsonb DEFAULT '{}'::jsonb,
  overage_storage jsonb DEFAULT '{}'::jsonb,
  total_overage_cents integer DEFAULT 0,
  total_cents integer DEFAULT 0,
  upgrade_suggestion jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_overage_projections ENABLE ROW LEVEL SECURITY;

-- 19. billing_plans
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  price_monthly integer DEFAULT 0,
  price_yearly integer DEFAULT 0,
  limits jsonb DEFAULT '{}'::jsonb,
  overage jsonb DEFAULT '{}'::jsonb,
  modules jsonb DEFAULT '{}'::jsonb,
  support_level text DEFAULT 'email',
  is_popular boolean DEFAULT false,
  badge_color text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;

-- 20. billing_previews
CREATE TABLE IF NOT EXISTS public.billing_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  total_invoices integer DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  next_due_date date,
  subscriptions_affected integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_previews ENABLE ROW LEVEL SECURITY;

-- 21. billing_summaries
CREATE TABLE IF NOT EXISTS public.billing_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan jsonb DEFAULT '{}'::jsonb,
  billing_cycle text DEFAULT 'monthly',
  cycle_start date NOT NULL DEFAULT CURRENT_DATE,
  cycle_end date NOT NULL DEFAULT CURRENT_DATE,
  base_cost_cents integer DEFAULT 0,
  overage_cost_cents integer DEFAULT 0,
  total_cost_cents integer DEFAULT 0,
  usage jsonb DEFAULT '[]'::jsonb,
  trial jsonb DEFAULT '{}'::jsonb,
  next_invoice_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_summaries ENABLE ROW LEVEL SECURITY;

-- 22. billing_upgrade_requests
CREATE TABLE IF NOT EXISTS public.billing_upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan_slug text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- 23. billing_usage_metrics
CREATE TABLE IF NOT EXISTS public.billing_usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  resource text NOT NULL,
  label text DEFAULT '',
  icon text DEFAULT '',
  current_val numeric(12,2) DEFAULT 0,
  limit_val numeric(12,2) DEFAULT 0,
  percent numeric(12,2) DEFAULT 0,
  status text DEFAULT 'normal',
  overage_count integer DEFAULT 0,
  overage_cost_cents integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_usage_metrics ENABLE ROW LEVEL SECURITY;

-- 24. calendar_events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  all_day boolean DEFAULT false,
  type text DEFAULT 'event',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 25. campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'email',
  status text DEFAULT 'draft',
  target_audience jsonb DEFAULT '{}',
  content jsonb DEFAULT '{}',
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 26. campaign_metrics (FK → campaigns)
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  sent integer DEFAULT 0,
  opened integer DEFAULT 0,
  open_rate numeric(12,2) DEFAULT 0,
  converted integer DEFAULT 0,
  conversion_rate numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

-- 27. certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'graduation',
  title text NOT NULL,
  description text,
  belt_rank text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 28. championships
CREATE TABLE IF NOT EXISTS public.championships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  location text,
  start_date date,
  end_date date,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;

-- 29. championship_registrations (FK → championships)
CREATE TABLE IF NOT EXISTS public.championship_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id uuid NOT NULL REFERENCES public.championships(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text,
  weight_class text,
  status text DEFAULT 'registered',
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(championship_id, profile_id)
);
ALTER TABLE public.championship_registrations ENABLE ROW LEVEL SECURITY;

-- 30. brackets (FK → championships)
CREATE TABLE IF NOT EXISTS public.brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id uuid REFERENCES public.championships(id) ON DELETE CASCADE,
  tournament_id uuid,
  category text,
  size integer DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;

-- 31. bracket_matches (FK → brackets)
CREATE TABLE IF NOT EXISTS public.bracket_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id uuid NOT NULL REFERENCES public.brackets(id) ON DELETE CASCADE,
  round integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 0,
  athlete_a uuid REFERENCES public.profiles(id),
  athlete_b uuid REFERENCES public.profiles(id),
  winner_id uuid REFERENCES public.profiles(id),
  score_a text,
  score_b text,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bracket_matches ENABLE ROW LEVEL SECURITY;

-- 32. class_schedule
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

-- 33. class_students
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

-- 34. contrato_templates
CREATE TABLE IF NOT EXISTS public.contrato_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text DEFAULT 'matricula',
  conteudo_html text DEFAULT '',
  variaveis jsonb DEFAULT '[]'::jsonb,
  ativo boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contrato_templates ENABLE ROW LEVEL SECURITY;

-- 36. contratos (FK → contrato_templates)
CREATE TABLE IF NOT EXISTS public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.contrato_templates(id) ON DELETE CASCADE,
  aluno_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  dados jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'rascunho',
  enviado_por text,
  assinatura_base64 text,
  assinado_em timestamptz,
  conteudo_final text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

-- 37. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  participant_a uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_b uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  last_message_text text,
  last_message_at timestamptz,
  last_message_by uuid REFERENCES public.profiles(id),
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_unique_pair
    UNIQUE (academy_id, participant_a, participant_b),
  CONSTRAINT conversations_ordered_participants
    CHECK (participant_a < participant_b)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 38. courses
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

-- 39. course_modules (FK → courses)
CREATE TABLE IF NOT EXISTS public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- 40. course_lessons (FK → courses, course_modules)
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

-- 41. course_analytics (FK → courses)
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

-- 42. curricula
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

-- 43. curriculum_requirements (FK → curricula)
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

-- 44. devedores
CREATE TABLE IF NOT EXISTS public.devedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  aluno_id uuid,
  aluno_nome text,
  aluno_avatar text,
  aluno_telefone text,
  aluno_email text,
  valor_devido numeric(12,2) DEFAULT 0,
  dias_atraso integer DEFAULT 0,
  ultimo_pagamento timestamptz,
  plano text,
  ultimo_contato jsonb DEFAULT '{}'::jsonb,
  status_cobranca text DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;

-- 45. contatos_cobranca (FK → devedores)
CREATE TABLE IF NOT EXISTS public.contatos_cobranca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devedor_id uuid REFERENCES public.devedores(id) ON DELETE CASCADE,
  tipo text DEFAULT 'whatsapp',
  resultado text DEFAULT 'sem_resposta',
  observacao text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contatos_cobranca ENABLE ROW LEVEL SECURITY;

-- 46. diarios_aula
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

-- 47. diary_entries
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  content text,
  techniques text[],
  observations text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- 48. estoque
CREATE TABLE IF NOT EXISTS public.estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  nome text,
  categoria text DEFAULT 'outro',
  tamanho text,
  cor text,
  quantidade_atual integer DEFAULT 0,
  estoque_minimo integer DEFAULT 0,
  preco_venda numeric(12,2) DEFAULT 0,
  preco_custo numeric(12,2) DEFAULT 0,
  ultima_movimentacao timestamptz,
  status text DEFAULT 'ok',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

-- 49. event_enrollments
CREATE TABLE IF NOT EXISTS public.event_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_enrollments ENABLE ROW LEVEL SECURITY;

-- 50. experimentais
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

-- 51. family_calendar
CREATE TABLE IF NOT EXISTS public.family_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date,
  week_end date,
  events jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_calendar ENABLE ROW LEVEL SECURITY;

-- 52. family_monthly_reports
CREATE TABLE IF NOT EXISTS public.family_monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month text NOT NULL,
  month_label text,
  children jsonb DEFAULT '[]'::jsonb,
  payments jsonb DEFAULT '[]'::jsonb,
  total_paid numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_monthly_reports ENABLE ROW LEVEL SECURITY;

-- 53. franchise_networks
CREATE TABLE IF NOT EXISTS public.franchise_networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_profile_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.franchise_networks ENABLE ROW LEVEL SECURITY;

-- 54. goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  deadline date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- 55. guardian_dashboards
CREATE TABLE IF NOT EXISTS public.guardian_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guardian_name text,
  children jsonb DEFAULT '[]'::jsonb,
  consolidated jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guardian_dashboards ENABLE ROW LEVEL SECURITY;

-- 56. guardian_notifications
CREATE TABLE IF NOT EXISTS public.guardian_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text DEFAULT 'mensagem',
  title text,
  body text,
  student_name text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guardian_notifications ENABLE ROW LEVEL SECURITY;

-- 57. hall_of_fame
CREATE TABLE IF NOT EXISTS public.hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  category text,
  title text,
  holder_name text,
  holder_avatar text,
  value text,
  description text,
  achieved_at timestamptz DEFAULT now(),
  modality text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;

-- 58. inadimplentes_view
CREATE TABLE IF NOT EXISTS public.inadimplentes_view (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  avatar text,
  valor numeric(12,2) DEFAULT 0,
  dias_atraso integer DEFAULT 0,
  telefone text,
  email text,
  turma text,
  faixa text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inadimplentes_view ENABLE ROW LEVEL SECURITY;

-- 59. insights
CREATE TABLE IF NOT EXISTS public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  type text,
  severity text DEFAULT 'info',
  title text,
  description text,
  action_url text,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- 60. inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  category text DEFAULT 'material',
  quantity integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  price numeric(12,2) DEFAULT 0,
  size text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- 61. stock_movements (FK → inventory_items)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type text NOT NULL,
  quantity integer DEFAULT 0,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- 62. kids_profiles
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

-- 63. kids_albums
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

-- 64. kids_estrelas_historico
CREATE TABLE IF NOT EXISTS public.kids_estrelas_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  data timestamptz DEFAULT now(),
  estrelas integer DEFAULT 0,
  motivo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_estrelas_historico ENABLE ROW LEVEL SECURITY;

-- 65. kids_faixas
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

-- 66. kids_personalizacao
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

-- 67. kids_recompensas
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

-- 68. kids_resgates
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

-- 69. leagues
CREATE TABLE IF NOT EXISTS public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  season_id text,
  rules text,
  start_date timestamptz,
  end_date timestamptz,
  prizes jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- 70. league_standings (FK → leagues)
CREATE TABLE IF NOT EXISTS public.league_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  league_id uuid REFERENCES public.leagues(id) ON DELETE CASCADE,
  name text,
  logo text,
  total_points integer DEFAULT 0,
  student_count integer DEFAULT 0,
  per_capita_avg numeric(12,2),
  rank integer DEFAULT 0,
  opted_in boolean DEFAULT false,
  top_contributors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;

-- 71. lesson_requests
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

-- 72. macrocycles
CREATE TABLE IF NOT EXISTS public.macrocycles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  competition_name text NOT NULL,
  competition_date date NOT NULL,
  phases jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.macrocycles ENABLE ROW LEVEL SECURITY;

-- 73. match_analyses
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

-- 74. match_analysis_shares
CREATE TABLE IF NOT EXISTS public.match_analysis_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  student_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.match_analysis_shares ENABLE ROW LEVEL SECURITY;

-- 75. match_annotations
CREATE TABLE IF NOT EXISTS public.match_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  timestamp_sec integer DEFAULT 0,
  text text,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.match_annotations ENABLE ROW LEVEL SECURITY;

-- 76. movimentacoes_estoque
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid,
  tipo text,
  quantidade integer DEFAULT 0,
  motivo text,
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- 77. notas_aluno
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

-- 78. notification_logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text,
  recipient text,
  subject text,
  template_name text,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  user_id uuid,
  status text DEFAULT 'pending',
  provider_message_id text,
  error_message text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 79. notification_preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'push',
  category text NOT NULL DEFAULT 'general',
  enabled boolean NOT NULL DEFAULT true,
  UNIQUE(profile_id, channel, category)
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 80. notification_prefs
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  push_enabled boolean DEFAULT false,
  email_enabled boolean DEFAULT false,
  types jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;

-- 81. orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text,
  items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric(12,2),
  shipping_cost numeric(12,2),
  total numeric(12,2),
  shipping_address jsonb DEFAULT '{}'::jsonb,
  delivery_option text DEFAULT 'pickup',
  payment_method text DEFAULT 'pix',
  status text DEFAULT 'pending',
  tracking_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 82. shipments (FK → orders)
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier text,
  service text,
  tracking_code text,
  status text DEFAULT 'created',
  estimated_delivery date,
  events jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 83. pagamentos
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid,
  valor numeric(12,2),
  forma text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- 84. physical_assessments
CREATE TABLE IF NOT EXISTS public.physical_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessed_by uuid REFERENCES public.profiles(id),
  weight_kg numeric,
  height_cm numeric,
  body_fat_pct numeric,
  flexibility_score numeric,
  endurance_score numeric,
  strength_score numeric,
  notes text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physical_assessments ENABLE ROW LEVEL SECURITY;

-- 85. platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key varchar(100) UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 86. products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  description text,
  images jsonb DEFAULT '[]'::jsonb,
  category text,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  variants jsonb DEFAULT '[]'::jsonb,
  stock_total integer DEFAULT 0,
  low_stock_alert integer DEFAULT 0,
  status text DEFAULT 'active',
  featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 87. product_categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- 88. product_reviews (FK → products)
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  academy_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  size_purchased text,
  size_feedback text CHECK (size_feedback IN ('small', 'perfect', 'large')),
  verified_purchase boolean DEFAULT false,
  helpful_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, profile_id)
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 89. product_variants (FK → products)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size text,
  color text,
  color_hex text,
  sku text,
  price_cents int NOT NULL,
  compare_at_price_cents int,
  stock int DEFAULT 0,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 90. professor_alerts
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

-- 91. professor_reports
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

-- 92. professors
CREATE TABLE IF NOT EXISTS public.professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  specialties jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;

-- 93. promotion_candidates
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

-- 94. referral_clicks
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  clicked_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

-- 95. referral_stats
CREATE TABLE IF NOT EXISTS public.referral_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  code text,
  total_referrals integer DEFAULT 0,
  converted_referrals integer DEFAULT 0,
  credits_earned numeric(12,2) DEFAULT 0,
  credits_used numeric(12,2) DEFAULT 0,
  referrals jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;

-- 96. relatorios_aula
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

-- 97. reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name text,
  user_belt text,
  rating integer DEFAULT 0,
  text text,
  creator_response text,
  helpful_count integer DEFAULT 0,
  reported boolean DEFAULT false,
  report_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 98. royalty_calculations
CREATE TABLE IF NOT EXISTS public.royalty_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  franchise_id uuid,
  academy_name text,
  month text NOT NULL,
  gross_revenue numeric(12,2) DEFAULT 0,
  royalty_percentage numeric(12,2) DEFAULT 0,
  royalty_amount numeric(12,2) DEFAULT 0,
  marketing_fund_pct numeric(12,2) DEFAULT 0,
  marketing_fund_amount numeric(12,2) DEFAULT 0,
  total_due numeric(12,2) DEFAULT 0,
  status text DEFAULT 'pendente',
  due_date date,
  paid_date timestamptz,
  model text DEFAULT 'percentual_fixo',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.royalty_calculations ENABLE ROW LEVEL SECURITY;

-- 99. royalty_invoices
CREATE TABLE IF NOT EXISTS public.royalty_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  academy_name text,
  month text NOT NULL,
  royalty_amount numeric(12,2) DEFAULT 0,
  marketing_fund_amount numeric(12,2) DEFAULT 0,
  total_due numeric(12,2) DEFAULT 0,
  status text DEFAULT 'pendente',
  due_date date,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.royalty_invoices ENABLE ROW LEVEL SECURITY;

-- 100. seasons
CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  start_date date,
  end_date date,
  status text DEFAULT 'upcoming',
  theme text,
  rewards jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- 101. season_leaderboard (FK → seasons)
CREATE TABLE IF NOT EXISTS public.season_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name text,
  avatar_url text,
  points integer DEFAULT 0,
  rank integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.season_leaderboard ENABLE ROW LEVEL SECURITY;

-- 102. season_progress (FK → seasons)
CREATE TABLE IF NOT EXISTS public.season_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  season_points integer DEFAULT 0,
  rank integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  achievements_this_season jsonb DEFAULT '[]'::jsonb,
  streak_this_season integer DEFAULT 0,
  classes_attended_this_season integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.season_progress ENABLE ROW LEVEL SECURITY;

-- 103. sentiment_trends
CREATE TABLE IF NOT EXISTS public.sentiment_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  month text NOT NULL,
  positive integer DEFAULT 0,
  neutral integer DEFAULT 0,
  negative integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sentiment_trends ENABLE ROW LEVEL SECURITY;

-- 104. size_guides (FK → product_categories)
CREATE TABLE IF NOT EXISTS public.size_guides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sizes jsonb NOT NULL DEFAULT '[]',
  tips text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.size_guides ENABLE ROW LEVEL SECURITY;

-- 105. spaces
CREATE TABLE IF NOT EXISTS public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  name text,
  capacity integer DEFAULT 0,
  equipment jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

-- 106. space_schedules (FK → spaces)
CREATE TABLE IF NOT EXISTS public.space_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  space_name text,
  day integer DEFAULT 0,
  start_time text,
  end_time text,
  class_name text,
  professor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.space_schedules ENABLE ROW LEVEL SECURITY;

-- 107. storage_stats
CREATE TABLE IF NOT EXISTS public.storage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  total_videos integer DEFAULT 0,
  total_size_gb numeric(12,2) DEFAULT 0,
  limit_gb numeric(12,2) DEFAULT 50,
  usage_percent numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.storage_stats ENABLE ROW LEVEL SECURITY;

-- 108. streaming_trails
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

-- 109. streaming_series
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

-- 110. streaming_episodes (FK → streaming_series)
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

-- 111. streaming_library
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

-- 112. streaming_certificates (FK → streaming_trails)
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

-- 113. streaming_trail_progress (FK → streaming_trails)
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

-- 114. streaming_watch_progress (FK → streaming_episodes)
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

-- 115. student_curriculum_progress
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

-- 116. student_journeys
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

-- 117. student_progress
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

-- 118. substitutions
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

-- 119. suggestions
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  role text,
  category text,
  priority text DEFAULT 'medium',
  title text,
  description text,
  action_label text,
  action_url text,
  icon text,
  dismissed_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- 120. techniques
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

-- 121. tecnicas
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

-- 122. teen_desafios
CREATE TABLE IF NOT EXISTS public.teen_desafios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  description text,
  emoji text,
  type text DEFAULT 'diario',
  xp_reward integer DEFAULT 0,
  progress integer DEFAULT 0,
  target integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  expires_at timestamptz,
  claimed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teen_desafios ENABLE ROW LEVEL SECURITY;

-- 123. titles
CREATE TABLE IF NOT EXISTS public.titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  rarity text DEFAULT 'common',
  requirement text,
  icon_url text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;

-- 124. user_titles (FK → titles)
CREATE TABLE IF NOT EXISTS public.user_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_id uuid REFERENCES public.titles(id) ON DELETE CASCADE,
  is_equipped boolean DEFAULT false,
  is_unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

-- 125. tournament_enrollments
CREATE TABLE IF NOT EXISTS public.tournament_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_enrollments ENABLE ROW LEVEL SECURITY;

-- 126. training_plans
CREATE TABLE IF NOT EXISTS public.training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id),
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  plan_data jsonb DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

-- 127. exercise_logs (FK → training_plans)
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

-- 128. trial_activities
CREATE TABLE IF NOT EXISTS public.trial_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trial_student_id uuid,
  academy_id uuid,
  activity_type varchar(50) NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.trial_activities ENABLE ROW LEVEL SECURITY;

-- 129. trial_classes
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

-- 130. user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id)
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 131. video_annotations
CREATE TABLE IF NOT EXISTS public.video_annotations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  author_name text,
  timestamp_sec numeric(10,2) DEFAULT 0,
  type varchar(20) DEFAULT 'text' CHECK (type IN ('circle','arrow','text')),
  color varchar(20) DEFAULT 'green' CHECK (color IN ('green','red','yellow')),
  content text,
  x numeric(10,4) DEFAULT 0,
  y numeric(10,4) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.video_annotations ENABLE ROW LEVEL SECURITY;

-- 132. visitantes
CREATE TABLE IF NOT EXISTS public.visitantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  nome text NOT NULL,
  motivo text,
  telefone text,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visitantes ENABLE ROW LEVEL SECURITY;

-- 133. webhook_logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  error text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 134. wishlist (FK → products)
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 135. wizard_progress
CREATE TABLE IF NOT EXISTS public.wizard_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  steps_data jsonb DEFAULT '{}'::jsonb,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wizard_progress ENABLE ROW LEVEL SECURITY;

-- 136. xp_ledger
CREATE TABLE IF NOT EXISTS public.xp_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

-- 137. battle_pass_seasons
CREATE TABLE IF NOT EXISTS public.battle_pass_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_premium boolean DEFAULT false,
  premium_price numeric(12,2) DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.battle_pass_seasons ENABLE ROW LEVEL SECURITY;

-- 138. battle_pass_progress (FK → battle_pass_seasons)
CREATE TABLE IF NOT EXISTS public.battle_pass_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  current_level integer DEFAULT 0,
  current_xp integer DEFAULT 0,
  xp_to_next_level integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  total_rewards_claimed integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.battle_pass_progress ENABLE ROW LEVEL SECURITY;

-- 139. store_rewards
CREATE TABLE IF NOT EXISTS public.store_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  description text,
  image_url text,
  cost_points integer DEFAULT 0,
  category text DEFAULT 'produto',
  stock integer DEFAULT 0,
  status text DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.store_rewards ENABLE ROW LEVEL SECURITY;

-- 140. reward_balances
CREATE TABLE IF NOT EXISTS public.reward_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  value_brl numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_balances ENABLE ROW LEVEL SECURITY;

-- 141. reward_redemptions (FK → store_rewards)
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES public.store_rewards(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  reward_name text,
  cost_points integer DEFAULT 0,
  status text DEFAULT 'pending',
  user_name text,
  redeemed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- 142. reward_transactions
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  points integer DEFAULT 0,
  description text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

-- 143. broadcast_messages
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  target text NOT NULL CHECK (target IN ('all', 'all_students', 'all_professors', 'all_parents', 'class', 'belt', 'custom')),
  target_class_id uuid REFERENCES public.classes(id),
  target_belt text,
  target_profile_ids uuid[],
  subject text,
  text text NOT NULL,
  total_recipients integer NOT NULL DEFAULT 0,
  read_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- (broadcast_recipients depends on broadcast_messages)
CREATE TABLE IF NOT EXISTS public.broadcast_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid NOT NULL REFERENCES public.broadcast_messages(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamptz,
  CONSTRAINT broadcast_recipients_unique
    UNIQUE (broadcast_id, recipient_id)
);
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- END — 143 tables created
-- ============================================================
