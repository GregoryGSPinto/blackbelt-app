-- ═══════════════════════════════════════════════════════════════════════
-- Migration 038: Missing Tables
-- Creates all tables referenced by lib/api/ services but not yet in
-- previous migrations.  Every statement uses IF NOT EXISTS for safety.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- 1. academy_members — membership/role in an academy
-- Ref: pedagogico.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL DEFAULT 'student',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id, profile_id)
);
ALTER TABLE academy_members ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 2. access_events — physical access log
-- Ref: access-control.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS access_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  direction VARCHAR(10) DEFAULT 'entry' CHECK (direction IN ('entry','exit')),
  method VARCHAR(20) DEFAULT 'manual' CHECK (method IN ('qr_code','proximity','manual')),
  allowed BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE access_events ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 3. access_rules — access control rules per unit
-- Ref: access-control.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS access_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'allowed_hours' CHECK (type IN ('allowed_hours','max_daily_access','block_overdue')),
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE access_rules ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 4. achievement_definitions — templates for achievements
-- Ref: conquistas.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category VARCHAR(30),
  requirement INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 5. achievements_v2 — student achievements v2
-- Ref: conquistas-v2.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(30) DEFAULT 'JORNADA',
  rarity VARCHAR(20) DEFAULT 'common',
  icon TEXT,
  is_earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMPTZ,
  progress_percent INTEGER,
  progress_label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE achievements_v2 ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 6. active_sessions — real-time session tracking
-- Ref: suporte.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  user_role VARCHAR(30),
  device_type VARCHAR(20),
  ip TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  current_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 7. audit_logs — system audit trail
-- Ref: audit.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 8. audit_entries — detailed audit entries
-- Ref: audit.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE audit_entries ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 9. authorizations — parental authorizations for students
-- Ref: responsavel-autorizacoes.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS authorizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('evento','viagem','foto','saida_sozinho','contato_emergencia')),
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','autorizado','negado')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 10. bills — billing/charges for students
-- Ref: recepcao-caixa.service.ts, parent-payment.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  plan TEXT,
  reference_month VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 11. broadcasts — broadcast messages
-- Ref: mensagens.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name TEXT,
  target VARCHAR(30) DEFAULT 'all',
  target_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  target_belt VARCHAR(30),
  target_profile_ids UUID[],
  subject TEXT,
  text TEXT NOT NULL,
  total_recipients INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 12. calendar_integrations — external calendar sync
-- Ref: calendar-sync.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connected BOOLEAN DEFAULT false,
  email TEXT,
  last_sync TIMESTAMPTZ,
  synced_classes INTEGER DEFAULT 0,
  provider VARCHAR(30) DEFAULT 'google',
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 13. checkins — physical check-in/out records
-- Ref: recepcao-acesso.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  profile_name TEXT,
  person_type VARCHAR(20) DEFAULT 'aluno' CHECK (person_type IN ('aluno','professor','visitante')),
  belt VARCHAR(30),
  class_name TEXT,
  check_in_at TIMESTAMPTZ DEFAULT now(),
  check_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 14. churn_trend — monthly churn trend data
-- Ref: churn-prediction.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS churn_trend (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  mes VARCHAR(10) NOT NULL,
  risco INTEGER DEFAULT 0,
  cancelados INTEGER DEFAULT 0,
  recuperados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE churn_trend ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 15. class_occupancy — class occupancy metrics
-- Ref: analytics.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_occupancy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  class_name TEXT,
  modality TEXT,
  capacity INTEGER DEFAULT 0,
  enrolled INTEGER DEFAULT 0,
  occupancy_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE class_occupancy ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 16. communications — general communications log
-- Ref: bulk.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  type VARCHAR(30),
  subject TEXT,
  body TEXT,
  channel VARCHAR(20),
  recipients JSONB DEFAULT '[]'::JSONB,
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 17. competitions — internal academy competitions
-- Ref: competition.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE,
  location TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','open','in_progress','finished','cancelled')),
  total_participants INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 18. consent_records — LGPD consent tracking
-- Ref: lgpd.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('terms','privacy','marketing','data_processing')),
  accepted BOOLEAN NOT NULL,
  version VARCHAR(20),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 19. content_materials — supplementary materials for content
-- Ref: content-management.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(30),
  file_size BIGINT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE content_materials ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 20. content_quiz_questions — quiz questions for videos
-- Ref: content-management.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]'::JSONB,
  correct_index INTEGER DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE content_quiz_questions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 21. content_series — video series/playlists
-- Ref: content-management.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE content_series ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 22. content_trails — learning trails
-- Ref: content-management.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_trails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE content_trails ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 23. content_videos — managed video content
-- Ref: content-management.service.ts, recommendation.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  modality VARCHAR(50),
  belt_level VARCHAR(30),
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE content_videos ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 24. course_purchases — marketplace course purchases
-- Ref: marketplace.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 25. curriculos — academy curricula (Portuguese naming)
-- Ref: pedagogico.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  modalidade VARCHAR(50),
  nome TEXT NOT NULL,
  descricao TEXT,
  modulos JSONB DEFAULT '[]'::JSONB,
  progresso_turmas JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE curriculos ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 26. data_export_requests — LGPD data export requests
-- Ref: lgpd.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  format VARCHAR(10) DEFAULT 'json' CHECK (format IN ('json','pdf')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','expired')),
  download_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 27. data_deletion_requests — LGPD data deletion requests
-- Ref: lgpd.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 28. evaluation_criteria — configurable evaluation criteria
-- Ref: avaliacao-tecnica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(50) NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  peso_promocao INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 29. eventos — academy events
-- Ref: eventos.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'social' CHECK (type IN ('graduacao','campeonato','seminario','workshop','social','open_mat')),
  date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  capacity INTEGER DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  description TEXT,
  enrollment_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 30. franchise_academies — academies in a franchise network
-- Ref: franchise.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_academies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  students_count INTEGER DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  attendance_rate NUMERIC(5,2) DEFAULT 0,
  nps NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa','inadimplente','suspensa','em_setup')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_academies ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 31. franchise_alerts — network alerts
-- Ref: franchise.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  academy_id UUID,
  academy_name TEXT,
  type VARCHAR(30) CHECK (type IN ('high_churn','overdue','attendance_drop','low_nps')),
  message TEXT,
  severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('warning','critical')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_alerts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 32. franchise_broadcast_receipts — receipt tracking for broadcasts
-- Ref: franchise-communication.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_broadcast_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id UUID NOT NULL,
  academy_id UUID,
  academy_name TEXT,
  status VARCHAR(20) DEFAULT 'enviado' CHECK (status IN ('enviado','entregue','lido','falha')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_broadcast_receipts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 33. franchise_broadcasts — franchise-wide communications
-- Ref: franchise-communication.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  type VARCHAR(30) DEFAULT 'comunicado',
  subject TEXT,
  body TEXT,
  channels JSONB DEFAULT '[]'::JSONB,
  recipient_ids UUID[],
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_broadcasts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 34. franchise_compliance_checks — compliance audit results
-- Ref: franchise-standards.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_compliance_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  academy_name TEXT,
  overall_score NUMERIC(5,2) DEFAULT 0,
  results JSONB DEFAULT '[]'::JSONB,
  checked_at TIMESTAMPTZ DEFAULT now(),
  checked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_compliance_checks ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 35. franchise_curriculos — franchise-level curriculum standards
-- Ref: franqueador-curriculo.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_curriculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  modalidade VARCHAR(50),
  nome TEXT NOT NULL,
  descricao TEXT,
  modulos JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_curriculos ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 36. franchise_financials — franchise monthly financials
-- Ref: franchise.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_financials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  academy_id UUID,
  month VARCHAR(10),
  revenue NUMERIC(12,2) DEFAULT 0,
  royalties NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_financials ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 37. franchise_leads — prospective franchisees
-- Ref: franchise-expansion.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  state VARCHAR(5),
  investment_capacity NUMERIC(12,2) DEFAULT 0,
  experience TEXT,
  stage VARCHAR(20) DEFAULT 'lead' CHECK (stage IN ('lead','analise','aprovado','setup','operando')),
  viability_score NUMERIC(5,2),
  onboarding_step VARCHAR(30),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_leads ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 38. franchise_messages — franchise network messages
-- Ref: franchise.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  subject TEXT,
  body TEXT,
  recipients UUID[],
  channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('email','push','sms')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_messages ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 39. franchise_standards — franchise quality standards
-- Ref: franchise-standards.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  category VARCHAR(30) CHECK (category IN ('visual','operacional','pedagogico','financeiro','qualidade')),
  name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT false,
  checklist_items JSONB DEFAULT '[]'::JSONB,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_standards ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 40. franchise_trainings — network training events
-- Ref: franchise-communication.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  duration_minutes INTEGER DEFAULT 60,
  format VARCHAR(20) DEFAULT 'online' CHECK (format IN ('presencial','online','hibrido')),
  instructor TEXT,
  max_participants INTEGER DEFAULT 50,
  enrolled INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado','em_andamento','concluido','cancelado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_trainings ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 41. franchise_units — franchise unit details
-- Ref: franqueador-unidades.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS franchise_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  city TEXT,
  state VARCHAR(5),
  address TEXT,
  phone TEXT,
  status VARCHAR(20) DEFAULT 'ativa',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE franchise_units ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 42. gamification_xp — player XP and progress
-- Ref: gamification.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamification_xp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  name TEXT,
  role VARCHAR(20) DEFAULT 'student',
  total_xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  badge_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE gamification_xp ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 43. gamification_badges — earned badges per user
-- Ref: gamification.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamification_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category VARCHAR(30) DEFAULT 'achievement',
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  requirement INTEGER DEFAULT 1,
  current INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE gamification_badges ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 44. gamification_badge_definitions — badge templates
-- Ref: gamification.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamification_badge_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category VARCHAR(30) DEFAULT 'achievement',
  requirement INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE gamification_badge_definitions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 45. group_messages — group chat messages
-- Ref: group-chat.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 46. guardian_students — guardian-student relationships
-- Ref: parent.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guardian_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship VARCHAR(30) DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_id, student_id)
);
ALTER TABLE guardian_students ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 47. invites — invitation records
-- Ref: invites.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  role VARCHAR(30) DEFAULT 'student',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','cancelled')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 48. lesson_plans — class lesson plans
-- Ref: plano-aula.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE,
  theme TEXT,
  warmup TEXT,
  technique_1 JSONB,
  technique_2 JSONB,
  drilling TEXT,
  sparring TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 49. lesson_plan_templates — reusable lesson plan templates
-- Ref: plano-aula.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_plan_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT,
  warmup TEXT,
  technique_1 JSONB,
  technique_2 JSONB,
  drilling TEXT,
  sparring TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lesson_plan_templates ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 50. marketplace_courses — marketplace course catalog
-- Ref: marketplace.service.ts, marketplace-payment.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  creator_name TEXT,
  creator_academy TEXT,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  modality VARCHAR(30),
  belt_level VARCHAR(30) DEFAULT 'todas',
  duration_total INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  modules JSONB DEFAULT '[]'::JSONB,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','suspended','pending_approval')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE marketplace_courses ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 51. marketplace_balances — creator balances
-- Ref: marketplace-payment.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  available NUMERIC(12,2) DEFAULT 0,
  pending NUMERIC(12,2) DEFAULT 0,
  total_earned NUMERIC(12,2) DEFAULT 0,
  total_withdrawn NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id)
);
ALTER TABLE marketplace_balances ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 52. marketplace_creators — creator profiles for marketplace
-- Ref: marketplace-payment.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_name TEXT,
  academy TEXT,
  courses_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE marketplace_creators ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 53. marketplace_transactions — marketplace payment transactions
-- Ref: marketplace-payment.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) DEFAULT 0,
  commission NUMERIC(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 54. marketplace_withdrawals — creator withdrawal requests
-- Ref: marketplace-payment.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  bank_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE marketplace_withdrawals ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 55. martial_arts_terms — glossary of martial arts terms
-- Ref: academia-teorica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS martial_arts_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  definition TEXT,
  modality VARCHAR(50),
  language VARCHAR(10) DEFAULT 'pt',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE martial_arts_terms ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 56. message_templates — reusable message templates
-- Ref: recepcao-mensagens.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category VARCHAR(30) DEFAULT 'lembrete',
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 57. message_sends — message delivery log
-- Ref: recepcao-mensagens.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  student_name TEXT,
  channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('whatsapp','sms','email')),
  status VARCHAR(20) DEFAULT 'enviado' CHECK (status IN ('enviado','entregue','lido','erro')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE message_sends ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 58. nfe_records — NF-e fiscal documents
-- Ref: nfe.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nfe_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  payment_id TEXT,
  student_name TEXT,
  number TEXT,
  value NUMERIC(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','emitted','cancelled','error')),
  pdf_url TEXT,
  emitted_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE nfe_records ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 59. ocorrencias — pedagogical incidents (PT naming)
-- Ref: pedagogico.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  turma_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tipo VARCHAR(30) DEFAULT 'observacao',
  gravidade VARCHAR(20) DEFAULT 'leve',
  descricao TEXT,
  acao_tomada TEXT DEFAULT '',
  responsavel_notificado BOOLEAN DEFAULT false,
  data TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 60. onboard_tokens — academy onboarding tokens
-- Ref: superadmin.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboard_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  token TEXT NOT NULL,
  email TEXT,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE onboard_tokens ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 61. parental_permissions — per-student parental permission settings
-- Ref: responsavel-autorizacoes.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parental_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  label TEXT,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, key)
);
ALTER TABLE parental_permissions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 62. payments — payment records
-- Ref: parent-payment.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) DEFAULT 0,
  method VARCHAR(20) CHECK (method IN ('pix','boleto','card')),
  status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated','pending','paid','failed','refunded')),
  payment_url TEXT,
  pix_code TEXT,
  boleto_code TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 63. platform_alerts — platform-wide alerts
-- Ref: superadmin-dashboard.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(30),
  message TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE platform_alerts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 64. platform_plans — platform subscription plans
-- Ref: superadmin.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE platform_plans ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 65. planos_aula — lesson plans (PT naming, pedagogico)
-- Ref: plano-aula.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planos_aula (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  turma_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  data DATE,
  aquecimento TEXT,
  tecnica_principal JSONB,
  pratica TEXT,
  encerramento TEXT,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'rascunho',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE planos_aula ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 66. professor_metrics — professor performance metrics
-- Ref: analytics.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS professor_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professor_name TEXT,
  avg_attendance NUMERIC(5,2) DEFAULT 0,
  retention_rate NUMERIC(5,2) DEFAULT 0,
  avg_evaluation NUMERIC(5,2) DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE professor_metrics ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 67. prospect_contatos — prospect contact history (PT naming)
-- Ref: prospeccao.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prospect_contatos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  tipo VARCHAR(30),
  descricao TEXT,
  data TIMESTAMPTZ DEFAULT now(),
  responsavel TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE prospect_contatos ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 68. prospect_observacoes — prospect notes (PT naming)
-- Ref: prospeccao.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prospect_observacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  texto TEXT,
  autor TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE prospect_observacoes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 69. receipts — cash register receipts
-- Ref: recepcao-caixa.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  student_name TEXT,
  type VARCHAR(30),
  description TEXT,
  amount NUMERIC(10,2) DEFAULT 0,
  method VARCHAR(30) DEFAULT 'dinheiro',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 70. recommendation_views — tracking recommendation interactions
-- Ref: recommendation.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendation_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  video_id UUID,
  source VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE recommendation_views ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 71. referral_codes — academy referral codes
-- Ref: referral.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referrer_name TEXT,
  code TEXT NOT NULL UNIQUE,
  discount_pct INTEGER DEFAULT 0,
  reward_months INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 72. referrals — individual referral records
-- Ref: referral.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  referral_code TEXT,
  referred_academy_name TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','trial','converted','expired')),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 73. relatorios_pedagogicos — monthly pedagogical reports
-- Ref: pedagogico.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relatorios_pedagogicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  mes VARCHAR(10) NOT NULL,
  resumo_executivo TEXT,
  metricas JSONB DEFAULT '{}'::JSONB,
  por_professor JSONB DEFAULT '[]'::JSONB,
  alunos_destaque JSONB DEFAULT '[]'::JSONB,
  alunos_atencao JSONB DEFAULT '[]'::JSONB,
  meta_proximo_mes JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE relatorios_pedagogicos ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 74. report_sends — weekly report delivery log
-- Ref: weekly-report.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  report_type VARCHAR(30) DEFAULT 'weekly',
  sent_at TIMESTAMPTZ DEFAULT now(),
  recipient_email TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE report_sends ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 75. reunioes_pedagogicas — pedagogical meetings (PT naming)
-- Ref: pedagogico.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reunioes_pedagogicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'agendada',
  participantes JSONB DEFAULT '[]'::JSONB,
  pauta JSONB DEFAULT '[]'::JSONB,
  ata TEXT DEFAULT '',
  decisoes JSONB DEFAULT '[]'::JSONB,
  acoes_definidas JSONB DEFAULT '[]'::JSONB,
  criado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE reunioes_pedagogicas ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 76. session_history — user session history for analytics
-- Ref: suporte.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role VARCHAR(30),
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  academy_name TEXT,
  device_type VARCHAR(20),
  device_model TEXT,
  os TEXT,
  browser TEXT,
  ip TEXT,
  city TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  screen_resolution TEXT,
  connection_type TEXT,
  page_history JSONB DEFAULT '[]'::JSONB,
  errors JSONB DEFAULT '[]'::JSONB,
  performance_metrics JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 77. student_evaluations — professor student evaluations
-- Ref: evaluation.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  student_name TEXT,
  technique INTEGER DEFAULT 0,
  posture INTEGER DEFAULT 0,
  evolution INTEGER DEFAULT 0,
  behavior INTEGER DEFAULT 0,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE student_evaluations ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 78. technical_evaluations — detailed technical evaluations
-- Ref: avaliacao-tecnica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS technical_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  criteria JSONB DEFAULT '[]'::JSONB,
  average_score NUMERIC(5,2) DEFAULT 0,
  observations TEXT,
  recommendation VARCHAR(30) DEFAULT 'manter_faixa',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE technical_evaluations ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 79. theoretical_certificates — certificates for theory completion
-- Ref: academia-teorica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theoretical_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID,
  title TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE theoretical_certificates ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 80. theoretical_lesson_progress — progress per lesson
-- Ref: academia-teorica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theoretical_lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE theoretical_lesson_progress ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 81. theoretical_lessons — individual theory lessons
-- Ref: academia-teorica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theoretical_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE theoretical_lessons ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 82. theoretical_modules — theory course modules
-- Ref: academia-teorica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theoretical_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  modality VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE theoretical_modules ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 83. theoretical_quiz_attempts — quiz attempt records
-- Ref: academia-teorica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theoretical_quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL,
  score NUMERIC(5,2) DEFAULT 0,
  answers JSONB DEFAULT '[]'::JSONB,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE theoretical_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 84. theoretical_quizzes — theory quizzes
-- Ref: academia-teorica.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theoretical_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]'::JSONB,
  passing_score NUMERIC(5,2) DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE theoretical_quizzes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 85. ticket_messages — support ticket conversation messages
-- Ref: suporte.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name TEXT,
  text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 86. turmas — classes (PT naming for pedagogico)
-- Ref: pedagogico.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS turmas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  modalidade VARCHAR(50),
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  schedule JSONB DEFAULT '[]'::JSONB,
  capacity INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 87. video_saved — saved/bookmarked videos
-- Ref: video-experience.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_saved (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);
ALTER TABLE video_saved ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 88. video_shares — video share tracking
-- Ref: video-experience.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  video_id UUID NOT NULL,
  platform VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 89. video_watch_history — user video watch history
-- Ref: perfil.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  watched_at TIMESTAMPTZ DEFAULT now(),
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 90. webhook_configs — webhook endpoint configurations
-- Ref: webhook.service.ts, webhooks-outgoing.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────
-- 91. webhook_deliveries — webhook delivery log
-- Ref: webhook.service.ts, webhooks-outgoing.service.ts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event TEXT,
  payload JSONB DEFAULT '{}'::JSONB,
  status_code INTEGER,
  response_body TEXT,
  success BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════
-- Analytics / observability tables (suporte.service.ts)
-- These are read-only aggregated tables populated by background jobs
-- or server-side logic. Creating as tables for Supabase compatibility.
-- ═══════════════════════════════════════════════════════════════════════

-- 92. error_logs
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT,
  message TEXT,
  stack TEXT,
  page TEXT,
  user_id UUID,
  count INTEGER DEFAULT 1,
  first_seen TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- 93. error_logs_by_page
CREATE TABLE IF NOT EXISTS error_logs_by_page (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT,
  total_errors INTEGER DEFAULT 0,
  unique_errors INTEGER DEFAULT 0,
  last_error TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE error_logs_by_page ENABLE ROW LEVEL SECURITY;

-- 94. error_trend
CREATE TABLE IF NOT EXISTS error_trend (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hour TIMESTAMPTZ,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE error_trend ENABLE ROW LEVEL SECURITY;

-- 95. performance_overview
CREATE TABLE IF NOT EXISTS performance_overview (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  avg_lcp NUMERIC DEFAULT 0,
  avg_fcp NUMERIC DEFAULT 0,
  avg_cls NUMERIC DEFAULT 0,
  avg_ttfb NUMERIC DEFAULT 0,
  avg_fid NUMERIC DEFAULT 0,
  p75_lcp NUMERIC DEFAULT 0,
  p75_fcp NUMERIC DEFAULT 0,
  p75_cls NUMERIC DEFAULT 0,
  p95_lcp NUMERIC DEFAULT 0,
  p95_fcp NUMERIC DEFAULT 0,
  p95_cls NUMERIC DEFAULT 0,
  total_page_loads INTEGER DEFAULT 0,
  good_lcp NUMERIC DEFAULT 0,
  needs_improvement_lcp NUMERIC DEFAULT 0,
  poor_lcp NUMERIC DEFAULT 0,
  good_fcp NUMERIC DEFAULT 0,
  needs_improvement_fcp NUMERIC DEFAULT 0,
  poor_fcp NUMERIC DEFAULT 0,
  good_cls NUMERIC DEFAULT 0,
  needs_improvement_cls NUMERIC DEFAULT 0,
  poor_cls NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE performance_overview ENABLE ROW LEVEL SECURITY;

-- 96. performance_by_page
CREATE TABLE IF NOT EXISTS performance_by_page (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT,
  load_count INTEGER DEFAULT 0,
  avg_lcp NUMERIC DEFAULT 0,
  avg_fcp NUMERIC DEFAULT 0,
  avg_cls NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE performance_by_page ENABLE ROW LEVEL SECURITY;

-- 97. performance_by_device
CREATE TABLE IF NOT EXISTS performance_by_device (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_type VARCHAR(30),
  avg_lcp NUMERIC DEFAULT 0,
  avg_fcp NUMERIC DEFAULT 0,
  avg_cls NUMERIC DEFAULT 0,
  load_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE performance_by_device ENABLE ROW LEVEL SECURITY;

-- 98. performance_trend
CREATE TABLE IF NOT EXISTS performance_trend (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE,
  avg_lcp NUMERIC DEFAULT 0,
  avg_fcp NUMERIC DEFAULT 0,
  avg_cls NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE performance_trend ENABLE ROW LEVEL SECURITY;

-- 99. device_breakdown
CREATE TABLE IF NOT EXISTS device_breakdown (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_type VARCHAR(30),
  count INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE device_breakdown ENABLE ROW LEVEL SECURITY;

-- 100. os_breakdown
CREATE TABLE IF NOT EXISTS os_breakdown (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  count INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE os_breakdown ENABLE ROW LEVEL SECURITY;

-- 101. browser_breakdown
CREATE TABLE IF NOT EXISTS browser_breakdown (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  count INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE browser_breakdown ENABLE ROW LEVEL SECURITY;

-- 102. device_models
CREATE TABLE IF NOT EXISTS device_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model TEXT,
  count INTEGER DEFAULT 0,
  device_type VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE device_models ENABLE ROW LEVEL SECURITY;

-- 103. connection_breakdown
CREATE TABLE IF NOT EXISTS connection_breakdown (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_type VARCHAR(30),
  count INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE connection_breakdown ENABLE ROW LEVEL SECURITY;

-- 104. engagement_overview
CREATE TABLE IF NOT EXISTS engagement_overview (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  avg_pages_per_session NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE engagement_overview ENABLE ROW LEVEL SECURITY;

-- 105. page_popularity
CREATE TABLE IF NOT EXISTS page_popularity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  avg_time_seconds NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE page_popularity ENABLE ROW LEVEL SECURITY;

-- 106. feature_usage
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature TEXT,
  usage_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- 107. peak_hours
CREATE TABLE IF NOT EXISTS peak_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hour INTEGER,
  day_of_week INTEGER,
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE peak_hours ENABLE ROW LEVEL SECURITY;

-- 108. retention
CREATE TABLE IF NOT EXISTS retention (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort DATE,
  period INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  retained INTEGER DEFAULT 0,
  rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE retention ENABLE ROW LEVEL SECURITY;

-- 109. top_users
CREATE TABLE IF NOT EXISTS top_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  user_role VARCHAR(30),
  session_count INTEGER DEFAULT 0,
  total_time_minutes NUMERIC DEFAULT 0,
  pages_viewed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE top_users ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════
-- Done. All missing tables created with IF NOT EXISTS + RLS enabled.
-- ═══════════════════════════════════════════════════════════════════════
