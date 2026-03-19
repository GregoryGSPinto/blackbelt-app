-- 030: Add acknowledged fields to academies table
-- Used by superadmin to mark when they've seen a newly registered academy

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS acknowledged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;

-- Index for quick lookup of unacknowledged academies
CREATE INDEX IF NOT EXISTS idx_academies_acknowledged
  ON academies (acknowledged) WHERE acknowledged = false;
