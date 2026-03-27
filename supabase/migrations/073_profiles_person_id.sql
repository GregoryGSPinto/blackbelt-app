-- Adicionar referencia de profiles → people
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id);
CREATE INDEX IF NOT EXISTS idx_profiles_person ON profiles(person_id) WHERE person_id IS NOT NULL;

-- Adicionar status lifecycle completo
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_lifecycle_status') THEN
    CREATE TYPE profile_lifecycle_status AS ENUM ('draft', 'pending', 'invited', 'active', 'suspended', 'archived');
  END IF;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) DEFAULT 'active';

-- Adicionar campo de controle parental
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parental_controls JSONB DEFAULT '{}';
-- Formato: { "canChangeEmail": false, "canChangePassword": false, "canViewFinancial": false, "canSendMessages": true, "canSelfCheckin": true, "isSuspended": false, "suspendedUntil": null, "suspendedReason": null }
