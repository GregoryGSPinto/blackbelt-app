-- ================================================================
-- 066 — Health Declaration & Physical Fitness System
-- ================================================================
-- PAR-Q+ questionnaire, medical history, injury tracking,
-- training restrictions, medical clearance, pre-training checks.
-- Legal: CDC Art. 14, CC Art. 927/932, CONFEF 307/2015, LGPD Art. 11
-- ================================================================

-- ── 1. PAR-Q+ Responses ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_parq_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version       smallint NOT NULL DEFAULT 1,

  -- 7 official PAR-Q+ questions (boolean answers)
  q1_heart_condition           boolean NOT NULL DEFAULT false,
  q2_chest_pain_activity       boolean NOT NULL DEFAULT false,
  q3_chest_pain_rest           boolean NOT NULL DEFAULT false,
  q4_dizziness_balance         boolean NOT NULL DEFAULT false,
  q5_bone_joint_problem        boolean NOT NULL DEFAULT false,
  q6_medication_bp_heart       boolean NOT NULL DEFAULT false,
  q7_other_reason              boolean NOT NULL DEFAULT false,

  -- Result
  has_risk_factor    boolean GENERATED ALWAYS AS (
    q1_heart_condition OR q2_chest_pain_activity OR q3_chest_pain_rest OR
    q4_dizziness_balance OR q5_bone_joint_problem OR q6_medication_bp_heart OR
    q7_other_reason
  ) STORED,

  additional_notes   text,

  -- LGPD consent for sensitive health data
  lgpd_health_consent          boolean NOT NULL DEFAULT false,
  lgpd_consent_date            timestamptz,
  lgpd_consent_ip              text,

  completed_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_parq_academy ON health_parq_responses(academy_id);
CREATE INDEX idx_parq_profile ON health_parq_responses(profile_id);
CREATE INDEX idx_parq_risk ON health_parq_responses(academy_id, has_risk_factor) WHERE has_risk_factor = true;

ALTER TABLE health_parq_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parq_academy_access" ON health_parq_responses
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 2. Medical History ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_medical_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Cardiovascular
  has_cardiovascular           boolean NOT NULL DEFAULT false,
  cardiovascular_details       text,

  -- Respiratory
  has_respiratory              boolean NOT NULL DEFAULT false,
  respiratory_details          text,

  -- Musculoskeletal
  has_musculoskeletal          boolean NOT NULL DEFAULT false,
  musculoskeletal_details      text,

  -- Neurological
  has_neurological             boolean NOT NULL DEFAULT false,
  neurological_details         text,

  -- Metabolic (diabetes, thyroid, etc.)
  has_metabolic                boolean NOT NULL DEFAULT false,
  metabolic_details            text,

  -- Allergies
  has_allergies                boolean NOT NULL DEFAULT false,
  allergies_details            text,

  -- Current medications
  takes_medication             boolean NOT NULL DEFAULT false,
  medication_details           text,

  -- Surgeries
  has_surgeries                boolean NOT NULL DEFAULT false,
  surgeries_details            text,

  -- Martial-arts-specific
  has_skin_conditions          boolean NOT NULL DEFAULT false,
  skin_conditions_details      text,
  has_infectious_disease       boolean NOT NULL DEFAULT false,
  infectious_disease_details   text,
  has_bleeding_disorder        boolean NOT NULL DEFAULT false,
  bleeding_disorder_details    text,
  uses_hearing_aid             boolean NOT NULL DEFAULT false,
  uses_glasses_contacts        boolean NOT NULL DEFAULT false,
  has_dental_prosthesis        boolean NOT NULL DEFAULT false,

  -- Emergency contact
  emergency_contact_name       text,
  emergency_contact_phone      text,
  emergency_contact_relation   text,

  blood_type                   text CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-', NULL)),

  -- LGPD
  lgpd_health_consent          boolean NOT NULL DEFAULT false,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_medhist_academy ON health_medical_history(academy_id);
CREATE INDEX idx_medhist_profile ON health_medical_history(profile_id);
CREATE UNIQUE INDEX idx_medhist_unique ON health_medical_history(academy_id, profile_id);

ALTER TABLE health_medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medhist_academy_access" ON health_medical_history
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 3. Injury Records ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_injuries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  injury_date        date NOT NULL,
  body_part          text NOT NULL,
  description        text NOT NULL,
  severity           text NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  occurred_during    text CHECK (occurred_during IN ('training', 'competition', 'outside', 'unknown')),
  class_id           uuid,
  reported_by_id     uuid REFERENCES profiles(id),

  -- Treatment
  treatment_type     text CHECK (treatment_type IN ('none', 'first_aid', 'physiotherapy', 'surgery', 'other')),
  treatment_details  text,
  medical_report_url text,

  -- Recovery
  recovery_status    text NOT NULL DEFAULT 'active' CHECK (recovery_status IN ('active', 'recovering', 'recovered', 'chronic')),
  estimated_recovery_days  integer,
  actual_recovery_date     date,
  return_cleared_by_id     uuid REFERENCES profiles(id),
  return_clearance_date    date,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_injuries_academy ON health_injuries(academy_id);
CREATE INDEX idx_injuries_profile ON health_injuries(profile_id);
CREATE INDEX idx_injuries_active ON health_injuries(academy_id, recovery_status) WHERE recovery_status IN ('active', 'recovering');
CREATE INDEX idx_injuries_date ON health_injuries(injury_date DESC);

ALTER TABLE health_injuries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "injuries_academy_access" ON health_injuries
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 4. Training Restrictions ────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_training_restrictions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  injury_id     uuid REFERENCES health_injuries(id) ON DELETE SET NULL,

  restriction_type   text NOT NULL CHECK (restriction_type IN (
    'no_sparring', 'no_ground', 'no_striking', 'no_takedowns',
    'limited_range', 'no_contact', 'light_only', 'observe_only', 'custom'
  )),
  body_part          text,
  description        text,
  severity           text NOT NULL DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high')),

  start_date         date NOT NULL DEFAULT CURRENT_DATE,
  end_date           date,
  is_permanent       boolean NOT NULL DEFAULT false,
  is_active          boolean GENERATED ALWAYS AS (
    CASE
      WHEN is_permanent THEN true
      WHEN end_date IS NULL THEN true
      WHEN end_date >= CURRENT_DATE THEN true
      ELSE false
    END
  ) STORED,

  created_by_id      uuid REFERENCES profiles(id),
  approved_by_id     uuid REFERENCES profiles(id),

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_restrictions_academy ON health_training_restrictions(academy_id);
CREATE INDEX idx_restrictions_profile ON health_training_restrictions(profile_id);
CREATE INDEX idx_restrictions_active ON health_training_restrictions(academy_id, is_active) WHERE is_active = true;

ALTER TABLE health_training_restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restrictions_academy_access" ON health_training_restrictions
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 5. Medical Clearances ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_medical_clearances (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  clearance_type     text NOT NULL CHECK (clearance_type IN (
    'general', 'post_injury', 'post_surgery', 'annual', 'competition', 'parq_follow_up'
  )),
  status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),

  -- Doctor info
  doctor_name        text,
  doctor_crm         text,
  doctor_specialty   text,

  -- Document
  document_url       text,
  valid_from         date,
  valid_until        date,
  notes              text,

  -- Review
  reviewed_by_id     uuid REFERENCES profiles(id),
  reviewed_at        timestamptz,

  injury_id          uuid REFERENCES health_injuries(id) ON DELETE SET NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clearances_academy ON health_medical_clearances(academy_id);
CREATE INDEX idx_clearances_profile ON health_medical_clearances(profile_id);
CREATE INDEX idx_clearances_status ON health_medical_clearances(academy_id, status) WHERE status = 'pending';
CREATE INDEX idx_clearances_valid ON health_medical_clearances(valid_until) WHERE status = 'approved';

ALTER TABLE health_medical_clearances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clearances_academy_access" ON health_medical_clearances
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 6. Pre-Training Health Check (Professor) ───────────────────

CREATE TABLE IF NOT EXISTS health_pretraining_checks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professor_id  uuid NOT NULL REFERENCES profiles(id),
  class_id      uuid,

  check_date         date NOT NULL DEFAULT CURRENT_DATE,
  feeling_score      smallint CHECK (feeling_score BETWEEN 1 AND 5),
  pain_reported      boolean NOT NULL DEFAULT false,
  pain_location      text,
  pain_level         smallint CHECK (pain_level BETWEEN 0 AND 10),

  -- Decision
  cleared_to_train   boolean NOT NULL DEFAULT true,
  restrictions_applied text[],
  notes              text,

  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_precheck_academy ON health_pretraining_checks(academy_id);
CREATE INDEX idx_precheck_profile ON health_pretraining_checks(profile_id, check_date DESC);
CREATE INDEX idx_precheck_date ON health_pretraining_checks(check_date DESC);

ALTER TABLE health_pretraining_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "precheck_academy_access" ON health_pretraining_checks
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));


-- ── 7. Health Config ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_config (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id    uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,

  require_parq                boolean NOT NULL DEFAULT true,
  require_medical_clearance   boolean NOT NULL DEFAULT false,
  clearance_validity_months   integer NOT NULL DEFAULT 12,
  require_emergency_contact   boolean NOT NULL DEFAULT true,
  require_pretraining_check   boolean NOT NULL DEFAULT false,
  auto_restrict_on_injury     boolean NOT NULL DEFAULT true,
  notify_professor_restrictions boolean NOT NULL DEFAULT true,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT health_config_academy_unique UNIQUE (academy_id)
);

ALTER TABLE health_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "healthconfig_academy_access" ON health_config
  FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));
