-- Add terms acceptance tracking to academies
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS terms_version VARCHAR(10) DEFAULT 'v1.0';
