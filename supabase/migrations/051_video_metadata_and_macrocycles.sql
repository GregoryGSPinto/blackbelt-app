-- ═══════════════════════════════════════════════════════
-- Migration 051: Video metadata JSONB + Macrocycles table
-- Supports: video-analysis caching, periodization service
-- Safe: uses IF NOT EXISTS throughout
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. Add metadata JSONB to videos table (for AI analysis cache)
-- ─────────────────────────────────────────────────────
ALTER TABLE videos ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- ─────────────────────────────────────────────────────
-- 2. macrocycles — periodization macrocycles per student
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS macrocycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  competition_name TEXT NOT NULL,
  competition_date DATE NOT NULL,
  phases JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE macrocycles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_macrocycles_student ON macrocycles(student_id);
CREATE INDEX IF NOT EXISTS idx_macrocycles_created_by ON macrocycles(created_by);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'macrocycles' AND policyname = 'macrocycles_select') THEN
    CREATE POLICY "macrocycles_select" ON macrocycles FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'macrocycles' AND policyname = 'macrocycles_insert') THEN
    CREATE POLICY "macrocycles_insert" ON macrocycles FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'macrocycles' AND policyname = 'macrocycles_update') THEN
    CREATE POLICY "macrocycles_update" ON macrocycles FOR UPDATE
      USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'macrocycles' AND policyname = 'macrocycles_delete') THEN
    CREATE POLICY "macrocycles_delete" ON macrocycles FOR DELETE
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 3. video_annotations — annotations on training videos
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_annotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  author_name TEXT,
  timestamp_sec NUMERIC(10,2) DEFAULT 0,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('circle','arrow','text')),
  color VARCHAR(20) DEFAULT 'green' CHECK (color IN ('green','red','yellow')),
  content TEXT,
  x NUMERIC(10,4) DEFAULT 0,
  y NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_annotations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vannotations_video ON video_annotations(video_id);
CREATE INDEX IF NOT EXISTS idx_vannotations_author ON video_annotations(author_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_annotations' AND policyname = 'vannotations_select') THEN
    CREATE POLICY "vannotations_select" ON video_annotations FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_annotations' AND policyname = 'vannotations_insert') THEN
    CREATE POLICY "vannotations_insert" ON video_annotations FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_annotations' AND policyname = 'vannotations_delete') THEN
    CREATE POLICY "vannotations_delete" ON video_annotations FOR DELETE
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;
