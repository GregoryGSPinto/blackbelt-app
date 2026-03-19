-- ═══════════════════════════════════════════════════════
-- Migration 034: Pedagogical Coordination
-- Tables for curricula, meetings, and incidents.
-- Safe: uses IF NOT EXISTS and DO blocks throughout.
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. academy_curricula — currículos da academia
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_curricula (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  modalidade VARCHAR(50) NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE academy_curricula ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ac_academy ON academy_curricula(academy_id);
CREATE INDEX IF NOT EXISTS idx_ac_modalidade ON academy_curricula(modalidade);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_curricula' AND policyname = 'ac_select') THEN
    CREATE POLICY "ac_select" ON academy_curricula FOR SELECT
      USING (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_curricula' AND policyname = 'ac_insert') THEN
    CREATE POLICY "ac_insert" ON academy_curricula FOR INSERT
      WITH CHECK (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_curricula' AND policyname = 'ac_update') THEN
    CREATE POLICY "ac_update" ON academy_curricula FOR UPDATE
      USING (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_curricula' AND policyname = 'ac_delete') THEN
    CREATE POLICY "ac_delete" ON academy_curricula FOR DELETE
      USING (is_member_of(academy_id));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 2. curriculum_modules — módulos do currículo
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID NOT NULL REFERENCES academy_curricula(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  faixa VARCHAR(30),
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cm_curriculum ON curriculum_modules(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_cm_ordem ON curriculum_modules(curriculum_id, ordem);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_modules' AND policyname = 'cm_select') THEN
    CREATE POLICY "cm_select" ON curriculum_modules FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_modules.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_modules' AND policyname = 'cm_insert') THEN
    CREATE POLICY "cm_insert" ON curriculum_modules FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_modules.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_modules' AND policyname = 'cm_update') THEN
    CREATE POLICY "cm_update" ON curriculum_modules FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_modules.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_modules' AND policyname = 'cm_delete') THEN
    CREATE POLICY "cm_delete" ON curriculum_modules FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_modules.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 3. curriculum_techniques — técnicas de cada módulo
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_techniques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  faixa_minima VARCHAR(30),
  posicao VARCHAR(100),
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE curriculum_techniques ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ct_module ON curriculum_techniques(module_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_techniques' AND policyname = 'ct_select') THEN
    CREATE POLICY "ct_select" ON curriculum_techniques FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM curriculum_modules cm
          JOIN academy_curricula ac ON ac.id = cm.curriculum_id
          WHERE cm.id = curriculum_techniques.module_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_techniques' AND policyname = 'ct_insert') THEN
    CREATE POLICY "ct_insert" ON curriculum_techniques FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM curriculum_modules cm
          JOIN academy_curricula ac ON ac.id = cm.curriculum_id
          WHERE cm.id = curriculum_techniques.module_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_techniques' AND policyname = 'ct_update') THEN
    CREATE POLICY "ct_update" ON curriculum_techniques FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM curriculum_modules cm
          JOIN academy_curricula ac ON ac.id = cm.curriculum_id
          WHERE cm.id = curriculum_techniques.module_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_techniques' AND policyname = 'ct_delete') THEN
    CREATE POLICY "ct_delete" ON curriculum_techniques FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM curriculum_modules cm
          JOIN academy_curricula ac ON ac.id = cm.curriculum_id
          WHERE cm.id = curriculum_techniques.module_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 4. curriculum_progress — progresso de turma no currículo
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID NOT NULL REFERENCES academy_curricula(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  current_module_id UUID REFERENCES curriculum_modules(id),
  percentual_concluido INTEGER DEFAULT 0 CHECK (percentual_concluido >= 0 AND percentual_concluido <= 100),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(curriculum_id, class_id)
);

ALTER TABLE curriculum_progress ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cp_curriculum ON curriculum_progress(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_cp_class ON curriculum_progress(class_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_progress' AND policyname = 'cp_select') THEN
    CREATE POLICY "cp_select" ON curriculum_progress FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_progress.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_progress' AND policyname = 'cp_insert') THEN
    CREATE POLICY "cp_insert" ON curriculum_progress FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_progress.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_progress' AND policyname = 'cp_update') THEN
    CREATE POLICY "cp_update" ON curriculum_progress FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_progress.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curriculum_progress' AND policyname = 'cp_delete') THEN
    CREATE POLICY "cp_delete" ON curriculum_progress FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM academy_curricula ac
          WHERE ac.id = curriculum_progress.curriculum_id
            AND is_member_of(ac.academy_id)
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 5. pedagogical_meetings — reuniões pedagógicas
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedagogical_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada','em_andamento','concluida','cancelada')),
  ata TEXT DEFAULT '',
  criado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pedagogical_meetings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pm_academy ON pedagogical_meetings(academy_id);
CREATE INDEX IF NOT EXISTS idx_pm_data ON pedagogical_meetings(data);
CREATE INDEX IF NOT EXISTS idx_pm_status ON pedagogical_meetings(status);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedagogical_meetings' AND policyname = 'pm_select') THEN
    CREATE POLICY "pm_select" ON pedagogical_meetings FOR SELECT
      USING (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedagogical_meetings' AND policyname = 'pm_insert') THEN
    CREATE POLICY "pm_insert" ON pedagogical_meetings FOR INSERT
      WITH CHECK (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedagogical_meetings' AND policyname = 'pm_update') THEN
    CREATE POLICY "pm_update" ON pedagogical_meetings FOR UPDATE
      USING (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedagogical_meetings' AND policyname = 'pm_delete') THEN
    CREATE POLICY "pm_delete" ON pedagogical_meetings FOR DELETE
      USING (is_member_of(academy_id));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 6. meeting_participants — participantes da reunião
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES pedagogical_meetings(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES profiles(id),
  presente BOOLEAN DEFAULT false,
  UNIQUE(meeting_id, professor_id)
);

ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_mp_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_mp_professor ON meeting_participants(professor_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_participants' AND policyname = 'mp_select') THEN
    CREATE POLICY "mp_select" ON meeting_participants FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_participants.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_participants' AND policyname = 'mp_insert') THEN
    CREATE POLICY "mp_insert" ON meeting_participants FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_participants.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_participants' AND policyname = 'mp_update') THEN
    CREATE POLICY "mp_update" ON meeting_participants FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_participants.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_participants' AND policyname = 'mp_delete') THEN
    CREATE POLICY "mp_delete" ON meeting_participants FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_participants.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 7. meeting_actions — ações definidas na reunião
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meeting_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES pedagogical_meetings(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  responsavel UUID REFERENCES profiles(id),
  prazo DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE meeting_actions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ma_meeting ON meeting_actions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_ma_responsavel ON meeting_actions(responsavel);
CREATE INDEX IF NOT EXISTS idx_ma_status ON meeting_actions(status);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_actions' AND policyname = 'ma_select') THEN
    CREATE POLICY "ma_select" ON meeting_actions FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_actions.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_actions' AND policyname = 'ma_insert') THEN
    CREATE POLICY "ma_insert" ON meeting_actions FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_actions.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_actions' AND policyname = 'ma_update') THEN
    CREATE POLICY "ma_update" ON meeting_actions FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_actions.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meeting_actions' AND policyname = 'ma_delete') THEN
    CREATE POLICY "ma_delete" ON meeting_actions FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM pedagogical_meetings pm
          WHERE pm.id = meeting_actions.meeting_id
            AND is_member_of(pm.academy_id)
        )
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 8. incidents — ocorrências pedagógicas
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES profiles(id),
  turma_id UUID NOT NULL REFERENCES classes(id),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('comportamento','disciplina','seguranca','positiva','observacao')),
  gravidade VARCHAR(20) NOT NULL CHECK (gravidade IN ('leve','moderada','grave')),
  descricao TEXT NOT NULL,
  acao_tomada TEXT DEFAULT '',
  responsavel_notificado BOOLEAN DEFAULT false,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inc_academy ON incidents(academy_id);
CREATE INDEX IF NOT EXISTS idx_inc_aluno ON incidents(aluno_id);
CREATE INDEX IF NOT EXISTS idx_inc_turma ON incidents(turma_id);
CREATE INDEX IF NOT EXISTS idx_inc_professor ON incidents(professor_id);
CREATE INDEX IF NOT EXISTS idx_inc_tipo ON incidents(tipo);
CREATE INDEX IF NOT EXISTS idx_inc_data ON incidents(data);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'inc_select') THEN
    CREATE POLICY "inc_select" ON incidents FOR SELECT
      USING (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'inc_insert') THEN
    CREATE POLICY "inc_insert" ON incidents FOR INSERT
      WITH CHECK (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'inc_update') THEN
    CREATE POLICY "inc_update" ON incidents FOR UPDATE
      USING (is_member_of(academy_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'inc_delete') THEN
    CREATE POLICY "inc_delete" ON incidents FOR DELETE
      USING (is_member_of(academy_id));
  END IF;
END $$;
