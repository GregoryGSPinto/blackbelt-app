-- ═══════════════════════════════════════════════════════════════
-- BLACKBELT v2 — MIGRATION CONSOLIDADA MASTER
-- Cobre: MEGA + REAL + MARCA_FINAL + COMPLEMENTAR
-- Rodar no Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- Usar IF NOT EXISTS em tudo para ser idempotente (pode rodar múltiplas vezes)

-- ═══ 1. PEOPLE ═══
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  gender VARCHAR(20) CHECK (gender IS NULL OR gender IN ('masculino', 'feminino', 'outro', 'nao_informado')),
  avatar_url TEXT,
  medical_notes TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_people_account ON people(account_id);
CREATE INDEX IF NOT EXISTS idx_people_cpf ON people(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_people_phone ON people(phone) WHERE phone IS NOT NULL;

-- ═══ 2. FAMILY_LINKS ═══
CREATE TABLE IF NOT EXISTS family_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  dependent_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relationship VARCHAR(30) NOT NULL CHECK (relationship IN (
    'pai', 'mae', 'avo', 'avo_materna', 'tio', 'tia',
    'padrasto', 'madrasta', 'responsavel_legal', 'outro'
  )),
  is_primary_guardian BOOLEAN DEFAULT false,
  is_financial_responsible BOOLEAN DEFAULT false,
  can_authorize_events BOOLEAN DEFAULT true,
  receives_notifications BOOLEAN DEFAULT true,
  receives_billing BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_person_id, dependent_person_id)
);
CREATE INDEX IF NOT EXISTS idx_family_links_guardian ON family_links(guardian_person_id);
CREATE INDEX IF NOT EXISTS idx_family_links_dependent ON family_links(dependent_person_id);

-- ═══ 3. PROFILES — colunas novas ═══
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id);
CREATE INDEX IF NOT EXISTS idx_profiles_person ON profiles(person_id) WHERE person_id IS NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parental_controls JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS needs_password_change BOOLEAN DEFAULT false;

-- ═══ 4. ACADEMY_TEEN_CONFIG ═══
CREATE TABLE IF NOT EXISTS academy_teen_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  teen_can_view_schedule BOOLEAN DEFAULT true,
  teen_can_self_checkin BOOLEAN DEFAULT true,
  teen_can_receive_direct_notifications BOOLEAN DEFAULT true,
  teen_can_view_payments BOOLEAN DEFAULT false,
  teen_can_edit_personal_data BOOLEAN DEFAULT false,
  teen_can_participate_general_ranking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

-- ═══ 5. PROFILE_EVOLUTION_LOG ═══
CREATE TABLE IF NOT EXISTS profile_evolution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_role VARCHAR(30) NOT NULL,
  to_role VARCHAR(30) NOT NULL,
  reason TEXT,
  evolved_by UUID REFERENCES profiles(id),
  preserved_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ 6. DATA_HEALTH_ISSUES ═══
CREATE TABLE IF NOT EXISTS data_health_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL CHECK (category IN ('cadastro', 'financeiro', 'turma', 'familia', 'documento')),
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  entity_type VARCHAR(30) NOT NULL,
  entity_id UUID NOT NULL,
  description TEXT NOT NULL,
  action_label VARCHAR(100),
  action_route VARCHAR(255),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_data_health_academy ON data_health_issues(academy_id, is_resolved);

-- ═══ 7. FAMILY_INVOICES ═══
CREATE TABLE IF NOT EXISTS family_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  reference_month VARCHAR(7) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(30),
  payment_link TEXT,
  line_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_family_invoices_guardian ON family_invoices(guardian_person_id);
CREATE INDEX IF NOT EXISTS idx_family_invoices_academy ON family_invoices(academy_id, reference_month);

-- ═══ 8. STUDENT_TIMELINE_EVENTS ═══
CREATE TABLE IF NOT EXISTS student_timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN (
    'matricula', 'presenca', 'troca_turma', 'graduacao', 'pagamento',
    'competicao', 'comunicado', 'nota_professor', 'evolucao_perfil',
    'suspensao', 'reativacao', 'experimental', 'conquista'
  )),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  event_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timeline_profile ON student_timeline_events(profile_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_academy ON student_timeline_events(academy_id, event_type);

-- ═══ 9. ACCOUNT_DELETION_LOG ═══
CREATE TABLE IF NOT EXISTS account_deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_hash VARCHAR(64) NOT NULL,
  profiles_archived UUID[] DEFAULT '{}',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address VARCHAR(45),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '5 years'
);

-- ═══ 10. AUDIT_LOG ═══
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  user_id UUID REFERENCES auth.users(id),
  profile_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_academy ON audit_log(academy_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- ═══ 11. WEBHOOK_LOG ═══
CREATE TABLE IF NOT EXISTS webhook_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(30) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  external_id VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_log_source ON webhook_log(source, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_log_external ON webhook_log(external_id);

-- ═══ 12. PAYMENT_CUSTOMERS ═══
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  academy_id UUID NOT NULL REFERENCES academies(id),
  external_customer_id VARCHAR(255) NOT NULL,
  provider VARCHAR(30) DEFAULT 'asaas',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id, academy_id, provider)
);

-- ═══ 13. SUPPORT_TICKETS ═══
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  academy_id UUID REFERENCES academies(id),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ 14. INVOICES — colunas de pagamento ═══
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_payment_id VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS net_value DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pix_payload TEXT;

-- ═══ 15. ANNOUNCEMENTS — colunas de segmentação (só se a tabela existir) ═══
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'announcements') THEN
    ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_config JSONB DEFAULT '{}';
    ALTER TABLE announcements ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;
    ALTER TABLE announcements ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_age(p_birth_date DATE)
RETURNS INTEGER AS $$
  SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, p_birth_date))::INTEGER;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_guardians(p_dependent_id UUID)
RETURNS TABLE(
  guardian_id UUID, guardian_name VARCHAR, relationship VARCHAR,
  is_primary BOOLEAN, is_financial BOOLEAN, can_authorize BOOLEAN,
  receives_notifications BOOLEAN, receives_billing BOOLEAN,
  phone VARCHAR, email VARCHAR
) AS $$
  SELECT p.id, p.full_name, fl.relationship,
    fl.is_primary_guardian, fl.is_financial_responsible,
    fl.can_authorize_events, fl.receives_notifications,
    fl.receives_billing, p.phone, p.email
  FROM family_links fl
  JOIN people p ON p.id = fl.guardian_person_id
  WHERE fl.dependent_person_id = p_dependent_id
  ORDER BY fl.is_primary_guardian DESC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_dependents(p_guardian_id UUID)
RETURNS TABLE(
  dependent_id UUID, dependent_name VARCHAR, birth_date DATE,
  relationship VARCHAR, phone VARCHAR, email VARCHAR, medical_notes TEXT
) AS $$
  SELECT p.id, p.full_name, p.birth_date,
    fl.relationship, p.phone, p.email, p.medical_notes
  FROM family_links fl
  JOIN people p ON p.id = fl.dependent_person_id
  WHERE fl.guardian_person_id = p_guardian_id
  ORDER BY p.birth_date ASC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION detect_data_health_issues(p_academy_id UUID)
RETURNS INTEGER AS $$
DECLARE
  issues_found INTEGER := 0;
  v_count INTEGER;
BEGIN
  -- Limpar issues resolvidas antigas
  DELETE FROM data_health_issues
  WHERE academy_id = p_academy_id AND is_resolved = true
    AND resolved_at < now() - interval '30 days';

  -- Alunos menores sem responsavel
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'familia', 'high', 'profile', pr.id,
    'Aluno ' || COALESCE(pr.display_name, 'sem nome') || ' e menor mas nao tem responsavel vinculado',
    'Vincular responsavel', '/admin/alunos/' || pr.id
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role IN ('aluno_kids', 'aluno_teen')
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND (pr.person_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM family_links fl WHERE fl.dependent_person_id = pr.person_id
    ))
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'familia' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Alunos sem turma
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'turma', 'medium', 'profile', pr.id,
    'Aluno ' || COALESCE(pr.display_name, 'sem nome') || ' nao esta em nenhuma turma',
    'Definir turma', '/admin/alunos/' || pr.id
  FROM profiles pr
  WHERE pr.academy_id = p_academy_id
    AND pr.role IN ('aluno_adulto', 'aluno_teen', 'aluno_kids')
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND NOT EXISTS (SELECT 1 FROM class_enrollments ce WHERE ce.student_id = pr.id AND ce.status = 'active')
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.category = 'turma' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Kids que fizeram 13 anos
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    COALESCE(pr.display_name, 'Aluno') || ' completou 13 anos — considere promover para Teen',
    'Promover para Teen', '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'aluno_kids'
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 13
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 13%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  -- Teens que fizeram 18 anos
  INSERT INTO data_health_issues (academy_id, category, severity, entity_type, entity_id, description, action_label, action_route)
  SELECT p_academy_id, 'cadastro', 'low', 'profile', pr.id,
    COALESCE(pr.display_name, 'Aluno') || ' completou 18 anos — considere promover para Adulto',
    'Promover para Adulto', '/admin/alunos/' || pr.id
  FROM profiles pr
  JOIN people pe ON pe.id = pr.person_id
  WHERE pr.academy_id = p_academy_id
    AND pr.role = 'aluno_teen'
    AND COALESCE(pr.lifecycle_status, 'active') = 'active'
    AND pe.birth_date IS NOT NULL
    AND calculate_age(pe.birth_date) >= 18
    AND NOT EXISTS (
      SELECT 1 FROM data_health_issues dhi
      WHERE dhi.entity_id = pr.id AND dhi.description LIKE '%completou 18%' AND dhi.is_resolved = false
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  issues_found := issues_found + v_count;

  RETURN issues_found;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_teen_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_evolution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_health_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- People
DROP POLICY IF EXISTS "people_own" ON people;
CREATE POLICY "people_own" ON people FOR SELECT USING (account_id = auth.uid());
DROP POLICY IF EXISTS "people_admin" ON people;
CREATE POLICY "people_admin" ON people FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
DROP POLICY IF EXISTS "people_guardian" ON people;
CREATE POLICY "people_guardian" ON people FOR SELECT USING (
  EXISTS (SELECT 1 FROM family_links fl JOIN people gp ON gp.id = fl.guardian_person_id
  WHERE fl.dependent_person_id = people.id AND gp.account_id = auth.uid())
);

-- Family links
DROP POLICY IF EXISTS "fl_guardian" ON family_links;
CREATE POLICY "fl_guardian" ON family_links FOR ALL USING (
  EXISTS (SELECT 1 FROM people p WHERE p.id = family_links.guardian_person_id AND p.account_id = auth.uid())
);
DROP POLICY IF EXISTS "fl_admin" ON family_links;
CREATE POLICY "fl_admin" ON family_links FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);

-- Academy teen config
DROP POLICY IF EXISTS "tc_admin" ON academy_teen_config;
CREATE POLICY "tc_admin" ON academy_teen_config FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = academy_teen_config.academy_id OR p.role = 'superadmin'))
);

-- Data health
DROP POLICY IF EXISTS "dh_admin" ON data_health_issues;
CREATE POLICY "dh_admin" ON data_health_issues FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = data_health_issues.academy_id OR p.role = 'superadmin'))
);

-- Family invoices
DROP POLICY IF EXISTS "fi_guardian" ON family_invoices;
CREATE POLICY "fi_guardian" ON family_invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM people p WHERE p.id = family_invoices.guardian_person_id AND p.account_id = auth.uid())
);
DROP POLICY IF EXISTS "fi_admin" ON family_invoices;
CREATE POLICY "fi_admin" ON family_invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = family_invoices.academy_id OR p.role = 'superadmin'))
);

-- Timeline
DROP POLICY IF EXISTS "tl_own" ON student_timeline_events;
CREATE POLICY "tl_own" ON student_timeline_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = student_timeline_events.profile_id AND p.user_id = auth.uid())
);
DROP POLICY IF EXISTS "tl_staff" ON student_timeline_events;
CREATE POLICY "tl_staff" ON student_timeline_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'professor', 'superadmin')
  AND (p.academy_id = student_timeline_events.academy_id OR p.role = 'superadmin'))
);
DROP POLICY IF EXISTS "tl_guardian" ON student_timeline_events;
CREATE POLICY "tl_guardian" ON student_timeline_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles pr JOIN people pe ON pe.id = pr.person_id
    JOIN family_links fl ON fl.dependent_person_id = pe.id
    JOIN people gp ON gp.id = fl.guardian_person_id
    WHERE pr.id = student_timeline_events.profile_id AND gp.account_id = auth.uid()
  )
);

-- Audit log
DROP POLICY IF EXISTS "al_admin" ON audit_log;
CREATE POLICY "al_admin" ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin')
  AND (p.academy_id = audit_log.academy_id OR p.role = 'superadmin'))
);
DROP POLICY IF EXISTS "al_insert" ON audit_log;
CREATE POLICY "al_insert" ON audit_log FOR INSERT WITH CHECK (true);

-- Webhook log, deletion log, evolution log, payment customers, support tickets
DROP POLICY IF EXISTS "wl_super" ON webhook_log;
CREATE POLICY "wl_super" ON webhook_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
);
DROP POLICY IF EXISTS "dl_super" ON account_deletion_log;
CREATE POLICY "dl_super" ON account_deletion_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'superadmin')
);
DROP POLICY IF EXISTS "el_admin" ON profile_evolution_log;
CREATE POLICY "el_admin" ON profile_evolution_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
DROP POLICY IF EXISTS "pc_admin" ON payment_customers;
CREATE POLICY "pc_admin" ON payment_customers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
DROP POLICY IF EXISTS "st_all" ON support_tickets;
CREATE POLICY "st_all" ON support_tickets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "st_admin" ON support_tickets;
CREATE POLICY "st_admin" ON support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'superadmin'))
);
