-- Tabela: people (pessoa fisica — pode ou nao ter conta Auth)
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable: kids nao tem conta
  full_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE, -- formato 000.000.000-00, nullable
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255), -- pode diferir do email da conta Auth
  gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'outro', 'nao_informado')),
  avatar_url TEXT,
  medical_notes TEXT, -- alergias, condicoes medicas
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_people_account ON people(account_id);
CREATE INDEX idx_people_cpf ON people(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_people_email ON people(email) WHERE email IS NOT NULL;
CREATE INDEX idx_people_phone ON people(phone) WHERE phone IS NOT NULL;

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
