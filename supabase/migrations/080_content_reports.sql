CREATE TABLE IF NOT EXISTS content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID,
  reason VARCHAR(50) NOT NULL
    CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'hate_speech', 'violence', 'other')),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_academy ON content_reports(academy_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON content_reports(reporter_id);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode criar report
DO $$ BEGIN
  CREATE POLICY "cr_insert_bb" ON content_reports FOR INSERT WITH CHECK (
    auth.uid() = reporter_id
  );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Admin/Super Admin vê reports da academia (uses profiles instead of memberships)
DO $$ BEGIN
  CREATE POLICY "cr_staff_bb" ON content_reports FOR ALL USING (
    academy_id IN (
      SELECT academy_id FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );
EXCEPTION WHEN OTHERS THEN NULL; END $$;
