-- ═══════════════════════════════════════════════════════
-- Migration 033: Video Upload
-- Colunas de storage/upload na tabela videos,
-- assignments a turmas, audiências, séries de vídeo,
-- e controle de uso de storage por academia.
-- Safe: uses IF NOT EXISTS and conditionals throughout
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. Novas colunas na tabela videos
-- ─────────────────────────────────────────────────────
ALTER TABLE videos ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS storage_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_storage_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS mime_type VARCHAR(50);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS upload_status VARCHAR(20) DEFAULT 'ready';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES profiles(id);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS min_belt VARCHAR(30);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS modality VARCHAR(50);

-- CHECK constraints added conditionally (ADD COLUMN IF NOT EXISTS doesn't support inline CHECK)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'videos_upload_status_check'
  ) THEN
    ALTER TABLE videos ADD CONSTRAINT videos_upload_status_check
      CHECK (upload_status IN ('uploading','processing','ready','failed','deleted'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'videos_difficulty_check'
  ) THEN
    ALTER TABLE videos ADD CONSTRAINT videos_difficulty_check
      CHECK (difficulty IN ('iniciante','intermediario','avancado','expert'));
  END IF;
END $$;

-- Indexes on new columns
CREATE INDEX IF NOT EXISTS idx_videos_upload_status ON videos(upload_status);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_modality ON videos(modality);
CREATE INDEX IF NOT EXISTS idx_videos_is_published ON videos(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_difficulty ON videos(difficulty);

-- ─────────────────────────────────────────────────────
-- 2. video_class_assignments — vínculo de vídeo a turma
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_class_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(video_id, class_id)
);

ALTER TABLE video_class_assignments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vca_video ON video_class_assignments(video_id);
CREATE INDEX IF NOT EXISTS idx_vca_class ON video_class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_vca_assigned_by ON video_class_assignments(assigned_by);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_class_assignments' AND policyname = 'vca_select') THEN
    CREATE POLICY "vca_select" ON video_class_assignments FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM videos v
          WHERE v.id = video_class_assignments.video_id
            AND v.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_class_assignments' AND policyname = 'vca_insert') THEN
    CREATE POLICY "vca_insert" ON video_class_assignments FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM videos v
          WHERE v.id = video_class_assignments.video_id
            AND v.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_class_assignments' AND policyname = 'vca_update') THEN
    CREATE POLICY "vca_update" ON video_class_assignments FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM videos v
          WHERE v.id = video_class_assignments.video_id
            AND v.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_class_assignments' AND policyname = 'vca_delete') THEN
    CREATE POLICY "vca_delete" ON video_class_assignments FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM videos v
          WHERE v.id = video_class_assignments.video_id
            AND v.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 3. video_audiences — público-alvo do vídeo
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_audiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  audience VARCHAR(20) NOT NULL CHECK (audience IN ('kids','teen','adulto','todos')),
  UNIQUE(video_id, audience)
);

ALTER TABLE video_audiences ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_va_video ON video_audiences(video_id);
CREATE INDEX IF NOT EXISTS idx_va_audience ON video_audiences(audience);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_audiences' AND policyname = 'va_select') THEN
    CREATE POLICY "va_select" ON video_audiences FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_audiences' AND policyname = 'va_insert') THEN
    CREATE POLICY "va_insert" ON video_audiences FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM videos v
          WHERE v.id = video_audiences.video_id
            AND v.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_audiences' AND policyname = 'va_update') THEN
    CREATE POLICY "va_update" ON video_audiences FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM videos v
          WHERE v.id = video_audiences.video_id
            AND v.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_audiences' AND policyname = 'va_delete') THEN
    CREATE POLICY "va_delete" ON video_audiences FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM videos v
          WHERE v.id = video_audiences.video_id
            AND v.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 4. video_series — séries/playlists de vídeo
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  modality VARCHAR(50),
  min_belt VARCHAR(30),
  audience VARCHAR(20),
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_series ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vs_academy ON video_series(academy_id);
CREATE INDEX IF NOT EXISTS idx_vs_professor ON video_series(professor_id);
CREATE INDEX IF NOT EXISTS idx_vs_modality ON video_series(modality);
CREATE INDEX IF NOT EXISTS idx_vs_is_published ON video_series(is_published);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series' AND policyname = 'vs_select') THEN
    CREATE POLICY "vs_select" ON video_series FOR SELECT
      USING (academy_id IN (SELECT get_my_academy_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series' AND policyname = 'vs_insert') THEN
    CREATE POLICY "vs_insert" ON video_series FOR INSERT
      WITH CHECK (academy_id IN (SELECT get_my_academy_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series' AND policyname = 'vs_update') THEN
    CREATE POLICY "vs_update" ON video_series FOR UPDATE
      USING (academy_id IN (SELECT get_my_academy_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series' AND policyname = 'vs_delete') THEN
    CREATE POLICY "vs_delete" ON video_series FOR DELETE
      USING (academy_id IN (SELECT get_my_academy_ids()));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 5. video_series_items — itens de uma série
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_series_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES video_series(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(series_id, video_id)
);

ALTER TABLE video_series_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vsi_series ON video_series_items(series_id);
CREATE INDEX IF NOT EXISTS idx_vsi_video ON video_series_items(video_id);
CREATE INDEX IF NOT EXISTS idx_vsi_series_order ON video_series_items(series_id, sort_order);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series_items' AND policyname = 'vsi_select') THEN
    CREATE POLICY "vsi_select" ON video_series_items FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series_items' AND policyname = 'vsi_insert') THEN
    CREATE POLICY "vsi_insert" ON video_series_items FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM video_series vs
          WHERE vs.id = video_series_items.series_id
            AND vs.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series_items' AND policyname = 'vsi_update') THEN
    CREATE POLICY "vsi_update" ON video_series_items FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM video_series vs
          WHERE vs.id = video_series_items.series_id
            AND vs.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_series_items' AND policyname = 'vsi_delete') THEN
    CREATE POLICY "vsi_delete" ON video_series_items FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM video_series vs
          WHERE vs.id = video_series_items.series_id
            AND vs.academy_id IN (SELECT get_my_academy_ids())
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 6. storage_usage — controle de uso de storage
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS storage_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE UNIQUE,
  total_videos INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 5368709120,
  last_calculated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_su_academy ON storage_usage(academy_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'storage_usage' AND policyname = 'su_select') THEN
    CREATE POLICY "su_select" ON storage_usage FOR SELECT
      USING (academy_id IN (SELECT get_my_academy_ids()));
  END IF;
END $$;
