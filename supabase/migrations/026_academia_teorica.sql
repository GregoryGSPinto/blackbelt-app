-- ═══════════════════════════════════════════════════════
-- Migration 026: Academia Teórica
-- Módulos teóricos por faixa, lições, quizzes, certificados, glossário
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS theory_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id),
  modality VARCHAR(50) NOT NULL,
  belt VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(30) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS theory_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES theory_modules(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  type VARCHAR(20) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  duration_estimate VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS theory_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES theory_lessons(id),
  module_id UUID NOT NULL REFERENCES theory_modules(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS theory_quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES theory_modules(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '[]',
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS theory_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES theory_modules(id),
  score INTEGER NOT NULL,
  verification_code VARCHAR(20) UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original VARCHAR(100) NOT NULL,
  translation VARCHAR(200) NOT NULL,
  pronunciation VARCHAR(100),
  language VARCHAR(20) DEFAULT 'japonês',
  modality VARCHAR(50),
  category VARCHAR(30),
  description TEXT,
  example TEXT,
  min_belt VARCHAR(30) DEFAULT 'branca',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_theory_progress_user ON theory_progress(user_id);
CREATE INDEX idx_theory_progress_module ON theory_progress(module_id);
CREATE INDEX idx_quiz_attempts_user ON theory_quiz_attempts(user_id);
CREATE INDEX idx_certificates_user ON theory_certificates(user_id);
CREATE INDEX idx_certificates_code ON theory_certificates(verification_code);
CREATE INDEX idx_glossary_modality ON glossary_terms(modality);

-- RLS
ALTER TABLE theory_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_public" ON theory_modules FOR SELECT USING (true);
CREATE POLICY "lessons_public" ON theory_lessons FOR SELECT USING (true);
CREATE POLICY "glossary_public" ON glossary_terms FOR SELECT USING (true);
CREATE POLICY "progress_own" ON theory_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "quiz_own" ON theory_quiz_attempts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "certs_own_read" ON theory_certificates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "certs_public_verify" ON theory_certificates FOR SELECT USING (true);
