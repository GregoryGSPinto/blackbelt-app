-- Tabela de planos da PLATAFORMA gerenciados pelo Super Admin
-- A tabela platform_plans anterior tinha schema diferente (sem tier, price como decimal).
-- Dropar e recriar com schema correto.
DROP TABLE IF EXISTS platform_plans CASCADE;

CREATE TABLE platform_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('starter', 'essencial', 'pro', 'blackbelt', 'enterprise')),
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- centavos
  is_custom_price BOOLEAN NOT NULL DEFAULT FALSE,
  max_alunos INTEGER, -- NULL = ilimitado
  max_professores INTEGER,
  max_unidades INTEGER,
  max_storage_gb INTEGER NOT NULL DEFAULT 5,
  max_turmas INTEGER,
  overage_aluno INTEGER NOT NULL DEFAULT 300, -- centavos
  overage_professor INTEGER NOT NULL DEFAULT 1500,
  overage_unidade INTEGER NOT NULL DEFAULT 4900,
  overage_storage_gb INTEGER NOT NULL DEFAULT 50,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  trial_days INTEGER NOT NULL DEFAULT 7,
  trial_tier TEXT NOT NULL DEFAULT 'blackbelt',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE platform_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "pplans_select_active" ON platform_plans
    FOR SELECT USING (is_active = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pplans_superadmin_all" ON platform_plans
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'superadmin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed dos 5 planos
INSERT INTO platform_plans (tier, name, price_monthly, is_custom_price, max_alunos, max_professores, max_unidades, max_storage_gb, max_turmas, features, is_popular, sort_order) VALUES
('starter', 'Starter', 7900, FALSE, 50, 2, 1, 5, 10,
 '["gestao_alunos","checkin","financeiro_basico","agenda","notificacoes","biblioteca_videos"]',
 FALSE, 1),
('essencial', 'Essencial', 14900, FALSE, 100, 5, 1, 10, 20,
 '["gestao_alunos","checkin","financeiro_basico","agenda","notificacoes","biblioteca_videos","streaming_library","certificados_digitais","relatorios_avancados","comunicacao_responsaveis","app_aluno"]',
 FALSE, 2),
('pro', 'Pro', 24900, FALSE, 200, NULL, 2, 20, NULL,
 '["gestao_alunos","checkin","financeiro_basico","agenda","notificacoes","biblioteca_videos","streaming_library","certificados_digitais","relatorios_avancados","comunicacao_responsaveis","app_aluno","compete","gamificacao_teen","curriculo_tecnico","match_analysis","estoque","contratos_digitais"]',
 TRUE, 3),
('blackbelt', 'Black Belt', 39700, FALSE, NULL, NULL, NULL, 50, NULL,
 '["gestao_alunos","checkin","financeiro_basico","agenda","notificacoes","biblioteca_videos","streaming_library","certificados_digitais","relatorios_avancados","comunicacao_responsaveis","app_aluno","compete","gamificacao_teen","curriculo_tecnico","match_analysis","estoque","contratos_digitais","franqueador","white_label","api_access","suporte_prioritario","relatorios_multi_unidade"]',
 FALSE, 4),
('enterprise', 'Enterprise', 0, TRUE, NULL, NULL, NULL, 100, NULL,
 '["gestao_alunos","checkin","financeiro_basico","agenda","notificacoes","biblioteca_videos","streaming_library","certificados_digitais","relatorios_avancados","comunicacao_responsaveis","app_aluno","compete","gamificacao_teen","curriculo_tecnico","match_analysis","estoque","contratos_digitais","franqueador","white_label","api_access","suporte_prioritario","relatorios_multi_unidade","sla_dedicado","onboarding_assistido","customizacoes","integracao_legados"]',
 FALSE, 5)
ON CONFLICT (tier) DO NOTHING;

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION update_platform_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER platform_plans_updated_at
    BEFORE UPDATE ON platform_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_platform_plans_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
