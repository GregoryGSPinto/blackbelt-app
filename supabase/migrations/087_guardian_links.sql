-- ============================================================
-- 087 — Guardian Links (vinculo responsavel-dependente)
-- ============================================================

CREATE TABLE IF NOT EXISTS guardian_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL,
  child_id UUID NOT NULL,
  relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent', 'legal_guardian', 'other')),
  can_precheckin BOOLEAN DEFAULT true,
  can_view_grades BOOLEAN DEFAULT true,
  can_manage_payments BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_id, child_id)
);

ALTER TABLE guardian_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guardian_own_links" ON guardian_links
  FOR ALL USING (
    guardian_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR child_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Pre-checkin tracking
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS checked_in_by UUID;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS checkin_type TEXT DEFAULT 'self'
  CHECK (checkin_type IN ('self', 'pre_checkin', 'qr', 'biometric', 'manual'));
