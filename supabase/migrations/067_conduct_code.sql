-- ================================================================
-- 067 — Academy Conduct Code System
-- ================================================================
-- System-generated template (editable/uploadable), student acceptance
-- with versioning, disciplinary incidents with progressive sanctions.
-- ================================================================

-- ── 1. Conduct Code Templates ──────────────────────────────────

CREATE TABLE IF NOT EXISTS conduct_code_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  version       integer NOT NULL DEFAULT 1,
  title         text NOT NULL DEFAULT 'Codigo de Conduta da Academia',
  content       text NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  is_system     boolean NOT NULL DEFAULT true,
  custom_pdf_url text,

  published_at  timestamptz,
  created_by_id uuid REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT conduct_code_unique_active UNIQUE (academy_id, version)
);

CREATE INDEX idx_conduct_academy ON conduct_code_templates(academy_id);
CREATE INDEX idx_conduct_active ON conduct_code_templates(academy_id, is_active) WHERE is_active = true;

ALTER TABLE conduct_code_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conduct_template_access" ON conduct_code_templates
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 2. Student Acceptance ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS conduct_code_acceptances (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id     uuid NOT NULL REFERENCES conduct_code_templates(id) ON DELETE CASCADE,
  template_version integer NOT NULL,

  accepted_at     timestamptz NOT NULL DEFAULT now(),
  ip_address      text,
  user_agent      text,

  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT conduct_acceptance_unique UNIQUE (academy_id, profile_id, template_id)
);

CREATE INDEX idx_acceptance_academy ON conduct_code_acceptances(academy_id);
CREATE INDEX idx_acceptance_profile ON conduct_code_acceptances(profile_id);
CREATE INDEX idx_acceptance_template ON conduct_code_acceptances(template_id);

ALTER TABLE conduct_code_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceptance_academy_access" ON conduct_code_acceptances
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 3. Disciplinary Incidents ──────────────────────────────────

CREATE TABLE IF NOT EXISTS conduct_incidents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_by_id uuid REFERENCES profiles(id),

  incident_date  date NOT NULL DEFAULT CURRENT_DATE,
  category       text NOT NULL CHECK (category IN (
    'hygiene', 'disrespect', 'aggression', 'property_damage',
    'sparring_violation', 'attendance', 'substance', 'harassment',
    'safety_violation', 'other'
  )),
  severity       text NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'serious', 'critical')),
  description    text NOT NULL,
  witnesses      text[],
  evidence_urls  text[],
  class_id       uuid,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_academy ON conduct_incidents(academy_id);
CREATE INDEX idx_incidents_profile ON conduct_incidents(profile_id);
CREATE INDEX idx_incidents_date ON conduct_incidents(incident_date DESC);
CREATE INDEX idx_incidents_severity ON conduct_incidents(academy_id, severity);

ALTER TABLE conduct_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incidents_academy_access" ON conduct_incidents
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 4. Sanctions ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conduct_sanctions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  incident_id   uuid REFERENCES conduct_incidents(id) ON DELETE SET NULL,
  issued_by_id  uuid REFERENCES profiles(id),

  sanction_type  text NOT NULL CHECK (sanction_type IN (
    'verbal_warning', 'written_warning', 'suspension', 'ban', 'community_service', 'other'
  )),
  description    text NOT NULL,
  severity_level integer NOT NULL DEFAULT 1 CHECK (severity_level BETWEEN 1 AND 5),

  start_date     date NOT NULL DEFAULT CURRENT_DATE,
  end_date       date,
  is_active      boolean NOT NULL DEFAULT true,

  student_acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_at      timestamptz,
  appeal_notes         text,
  appeal_resolved      boolean,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sanctions_academy ON conduct_sanctions(academy_id);
CREATE INDEX idx_sanctions_profile ON conduct_sanctions(profile_id);
CREATE INDEX idx_sanctions_active ON conduct_sanctions(academy_id, is_active) WHERE is_active = true;
CREATE INDEX idx_sanctions_incident ON conduct_sanctions(incident_id);

ALTER TABLE conduct_sanctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sanctions_academy_access" ON conduct_sanctions
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 5. Conduct Config ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conduct_config (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,

  require_acceptance_on_signup   boolean NOT NULL DEFAULT true,
  auto_escalate_sanctions        boolean NOT NULL DEFAULT true,
  notify_on_incident             boolean NOT NULL DEFAULT true,
  notify_on_sanction             boolean NOT NULL DEFAULT true,
  suspension_after_warnings      integer NOT NULL DEFAULT 3,
  ban_after_suspensions          integer NOT NULL DEFAULT 2,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT conduct_config_academy_unique UNIQUE (academy_id)
);

ALTER TABLE conduct_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conductconfig_academy_access" ON conduct_config
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));
