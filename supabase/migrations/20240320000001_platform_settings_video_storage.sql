-- Platform-wide settings (key-value with JSONB)
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS: only super admins can read/write
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage platform settings"
  ON platform_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Default video storage config (Supabase Storage)
INSERT INTO platform_settings (key, value) VALUES
('video_storage', '{"provider": "supabase", "youtube": null, "vimeo": null, "google_drive": null, "s3": null}')
ON CONFLICT (key) DO NOTHING;

-- Add provider tracking columns to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'supabase';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS external_id VARCHAR(200);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS embed_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Index for provider queries
CREATE INDEX IF NOT EXISTS idx_videos_provider ON videos(provider);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_updated_at();
