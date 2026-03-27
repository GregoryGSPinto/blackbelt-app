-- Tabela: family_links (vinculo familiar entre pessoas)
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

CREATE INDEX idx_family_links_guardian ON family_links(guardian_person_id);
CREATE INDEX idx_family_links_dependent ON family_links(dependent_person_id);

ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

-- Helper: dado um person_id de crianca, retorna os responsaveis
CREATE OR REPLACE FUNCTION get_guardians(p_dependent_id UUID)
RETURNS TABLE(
  guardian_id UUID,
  guardian_name VARCHAR,
  relationship VARCHAR,
  is_primary BOOLEAN,
  is_financial BOOLEAN,
  phone VARCHAR,
  email VARCHAR
) AS $$
  SELECT
    p.id, p.full_name, fl.relationship,
    fl.is_primary_guardian, fl.is_financial_responsible,
    p.phone, p.email
  FROM family_links fl
  JOIN people p ON p.id = fl.guardian_person_id
  WHERE fl.dependent_person_id = p_dependent_id
  ORDER BY fl.is_primary_guardian DESC;
$$ LANGUAGE sql STABLE;

-- Helper: dado um person_id de responsavel, retorna os dependentes
CREATE OR REPLACE FUNCTION get_dependents(p_guardian_id UUID)
RETURNS TABLE(
  dependent_id UUID,
  dependent_name VARCHAR,
  birth_date DATE,
  relationship VARCHAR,
  phone VARCHAR,
  email VARCHAR
) AS $$
  SELECT
    p.id, p.full_name, p.birth_date,
    fl.relationship, p.phone, p.email
  FROM family_links fl
  JOIN people p ON p.id = fl.dependent_person_id
  WHERE fl.guardian_person_id = p_guardian_id
  ORDER BY p.birth_date ASC;
$$ LANGUAGE sql STABLE;
