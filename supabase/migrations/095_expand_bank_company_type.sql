-- Expand bank_company_type CHECK constraint to include all company types
-- The original migration (078) only allowed 4 values: MEI, LIMITED, INDIVIDUAL, ASSOCIATION
-- The form supports 13 company types, so we need to expand the constraint

-- Drop the existing CHECK constraint
ALTER TABLE academies DROP CONSTRAINT IF EXISTS academies_bank_company_type_check;

-- Add expanded CHECK constraint with all supported company types
ALTER TABLE academies ADD CONSTRAINT academies_bank_company_type_check
  CHECK (bank_company_type IS NULL OR bank_company_type IN (
    'MEI',
    'ME',
    'EPP',
    'LIMITED',
    'SA',
    'EIRELI',
    'SLU',
    'INDIVIDUAL',
    'ASSOCIATION',
    'COOPERATIVA',
    'PESSOA_FISICA',
    'OUTRO'
  ));
