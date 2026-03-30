-- 090 — Add missing columns to franchise_units for franqueador-unidades.service.ts
-- The service expects manager_name, manager_email, students_count, revenue_monthly,
-- health_score, compliance_score, opened_at but the original table only had basic fields.

ALTER TABLE franchise_units
  ADD COLUMN IF NOT EXISTS manager_name TEXT,
  ADD COLUMN IF NOT EXISTS manager_email TEXT,
  ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_monthly NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS health_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS compliance_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ DEFAULT now();
