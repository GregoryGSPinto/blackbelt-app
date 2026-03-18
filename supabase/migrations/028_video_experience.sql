-- ═══════════════════════════════════════════════════════
-- Migration 028: Video Experience
-- Progresso, curtidas, avaliações, salvos, comentários,
-- dúvidas, notas pessoais, capítulos — com RLS e indexes
-- ═══════════════════════════════════════════════════════

-- 1. video_progress — progresso de visualização por usuário
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  progress_percent NUMERIC(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  total_watch_time INTEGER DEFAULT 0,
  times_watched INTEGER DEFAULT 1,
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON video_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON video_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON video_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_video_progress_user ON video_progress(user_id);
CREATE INDEX idx_video_progress_video ON video_progress(video_id);
CREATE INDEX idx_video_progress_academy ON video_progress(academy_id);
CREATE INDEX idx_video_progress_user_video ON video_progress(user_id, video_id);

-- 2. video_likes — curtidas em vídeos
CREATE TABLE IF NOT EXISTS video_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
  ON video_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON video_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_video_likes_video ON video_likes(video_id);
CREATE INDEX idx_video_likes_user ON video_likes(user_id);

-- 3. video_ratings — avaliações (1-5 estrelas)
CREATE TABLE IF NOT EXISTS video_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE video_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings"
  ON video_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON video_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON video_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_video_ratings_video ON video_ratings(video_id);
CREATE INDEX idx_video_ratings_user ON video_ratings(user_id);

-- 4. video_saves — vídeos salvos/favoritos
CREATE TABLE IF NOT EXISTS video_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE video_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves"
  ON video_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON video_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON video_saves FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_video_saves_user ON video_saves(user_id);
CREATE INDEX idx_video_saves_video ON video_saves(video_id);

-- 5. video_comments — comentários em vídeos (com suporte a threads)
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp_seconds INTEGER,
  is_pinned BOOLEAN DEFAULT false,
  is_professor BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments"
  ON video_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON video_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON video_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON video_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_video_comments_video ON video_comments(video_id);
CREATE INDEX idx_video_comments_parent ON video_comments(parent_id);
CREATE INDEX idx_video_comments_user ON video_comments(user_id);
CREATE INDEX idx_video_comments_pinned ON video_comments(video_id, is_pinned) WHERE is_pinned = true;

-- 6. comment_likes — curtidas em comentários
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES video_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comment likes"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment likes"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

-- 7. video_questions — dúvidas em vídeos
CREATE TABLE IF NOT EXISTS video_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  timestamp_seconds INTEGER,
  votes_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  answer_text TEXT,
  answer_professor_id UUID REFERENCES auth.users(id),
  answer_professor_name VARCHAR(200),
  answer_video_url TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions"
  ON video_questions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own questions"
  ON video_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON video_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_video_questions_video ON video_questions(video_id);
CREATE INDEX idx_video_questions_user ON video_questions(user_id);
CREATE INDEX idx_video_questions_unanswered ON video_questions(is_answered) WHERE is_answered = false;

-- 8. question_votes — votos em dúvidas
CREATE TABLE IF NOT EXISTS question_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES video_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view question votes"
  ON question_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own question votes"
  ON question_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own question votes"
  ON question_votes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_question_votes_question ON question_votes(question_id);
CREATE INDEX idx_question_votes_user ON question_votes(user_id);

-- 9. video_notes — notas pessoais do aluno
CREATE TABLE IF NOT EXISTS video_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON video_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON video_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON video_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON video_notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_video_notes_user ON video_notes(user_id);
CREATE INDEX idx_video_notes_video ON video_notes(video_id);
CREATE INDEX idx_video_notes_user_video ON video_notes(user_id, video_id);

-- 10. video_chapters — capítulos/marcadores de tempo
CREATE TABLE IF NOT EXISTS video_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chapters"
  ON video_chapters FOR SELECT
  USING (true);

CREATE POLICY "Professors can insert chapters"
  ON video_chapters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Professors can update chapters"
  ON video_chapters FOR UPDATE
  USING (true);

CREATE POLICY "Professors can delete chapters"
  ON video_chapters FOR DELETE
  USING (true);

CREATE INDEX idx_video_chapters_video ON video_chapters(video_id);
CREATE INDEX idx_video_chapters_video_order ON video_chapters(video_id, sort_order);
