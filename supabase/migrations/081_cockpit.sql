-- ═══════════════════════════════════════════════════════════
-- COCKPIT DO FOUNDER — 11 tabelas + RLS + Índices + Seed
-- Prefixo cockpit_ para evitar conflito com tabelas existentes
-- (user_feedback e campaigns já existem para academias)
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────────────────────
-- 1. feature_backlog
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feature_backlog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt', 'primal')),
  title TEXT NOT NULL,
  description TEXT,
  module TEXT,
  persona TEXT,
  job_to_be_done TEXT,
  success_criteria TEXT,
  rice_impact INT DEFAULT 0 CHECK (rice_impact BETWEEN 0 AND 5),
  rice_urgency INT DEFAULT 0 CHECK (rice_urgency BETWEEN 0 AND 5),
  rice_effort INT DEFAULT 0 CHECK (rice_effort BETWEEN 0 AND 5),
  rice_score NUMERIC GENERATED ALWAYS AS (rice_impact * 3 + rice_urgency * 2 + rice_effort * 1) STORED,
  pipeline_phase TEXT DEFAULT 'idea' CHECK (pipeline_phase IN ('idea','ceo_filter','cpo_spec','cto_arch','prompting','building','shipped','icebox','killed')),
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog','sprint','in_progress','review','done','icebox','killed')),
  priority_order INT DEFAULT 0,
  sprint_id UUID,
  shipped_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 2. operational_costs
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operational_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt','primal','shared')),
  category TEXT NOT NULL CHECK (category IN ('infra','domain','api','marketing','tools','legal','other')),
  name TEXT NOT NULL,
  description TEXT,
  amount_brl NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly','yearly','one_time','usage_based')),
  active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 3. architecture_decisions
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS architecture_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt','primal','both')),
  adr_number SERIAL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','deprecated','superseded')),
  context TEXT,
  options_considered JSONB DEFAULT '[]',
  decision TEXT,
  consequences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 4. cockpit_sprints
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cockpit_sprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt','primal')),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  goals JSONB DEFAULT '[]',
  velocity INT DEFAULT 0,
  prompts_executed INT DEFAULT 0,
  notes TEXT,
  retrospective TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 5. cockpit_feedback
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cockpit_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_email TEXT,
  user_role TEXT,
  academy_id UUID,
  academy_name TEXT,
  category TEXT DEFAULT 'geral' CHECK (category IN ('bug','feature','ux','performance','geral','elogio')),
  message TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'new' CHECK (status IN ('new','read','investigating','archived','converted')),
  converted_to UUID REFERENCES feature_backlog(id),
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 6. cockpit_personas
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cockpit_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  name TEXT NOT NULL,
  role_in_app TEXT,
  description TEXT,
  pains JSONB DEFAULT '[]',
  jobs_to_be_done JSONB DEFAULT '[]',
  key_features JSONB DEFAULT '[]',
  feature_completion_pct INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 7. deploy_log
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deploy_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  commit_sha TEXT,
  commit_message TEXT,
  branch TEXT DEFAULT 'main',
  tag TEXT,
  status TEXT CHECK (status IN ('success','failed','building','cancelled')),
  duration_seconds INT,
  files_changed INT,
  lines_added INT,
  lines_removed INT,
  vercel_url TEXT,
  deployed_by TEXT DEFAULT 'gregory',
  deployed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 8. cockpit_error_log
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cockpit_error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  error_type TEXT CHECK (error_type IN ('runtime','build','api','database','auth','integration')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  message TEXT NOT NULL,
  stack_trace TEXT,
  affected_route TEXT,
  affected_users INT DEFAULT 0,
  frequency INT DEFAULT 1,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','investigating','resolved','wont_fix','monitoring')),
  resolution TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ──────────────────────────────────────────
-- 9. cockpit_content_calendar
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cockpit_content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','tiktok','youtube','blog','linkedin','whatsapp','email')),
  content_type TEXT CHECK (content_type IN ('post','reel','story','article','video','carousel','newsletter')),
  planned_date DATE,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea','planned','creating','ready','published','cancelled')),
  published_url TEXT,
  target_persona TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 10. cockpit_campaigns
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cockpit_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  name TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('organic','paid_social','influencer','seo','partnerships','referral','events','outbound')),
  budget_brl NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','active','paused','completed','cancelled')),
  start_date DATE,
  end_date DATE,
  goal TEXT,
  target_metric TEXT,
  target_value NUMERIC,
  actual_value NUMERIC,
  result TEXT,
  learnings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 11. daily_metrics
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  date DATE NOT NULL,
  total_academies INT DEFAULT 0,
  active_academies INT DEFAULT 0,
  trial_academies INT DEFAULT 0,
  churned_academies INT DEFAULT 0,
  total_users INT DEFAULT 0,
  active_users_7d INT DEFAULT 0,
  new_users INT DEFAULT 0,
  mrr_brl NUMERIC DEFAULT 0,
  new_mrr_brl NUMERIC DEFAULT 0,
  churned_mrr_brl NUMERIC DEFAULT 0,
  total_checkins INT DEFAULT 0,
  total_classes INT DEFAULT 0,
  avg_session_seconds INT DEFAULT 0,
  active_championships INT DEFAULT 0,
  total_registrations INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product, date)
);


-- ═══════════════════════════════════════════════════════════
-- RLS — Super admin only (exceto cockpit_feedback que aceita insert de autenticados)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE feature_backlog ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE architecture_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cockpit_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE cockpit_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE cockpit_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cockpit_error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cockpit_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE cockpit_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Helper: superadmin check
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.is_superadmin()
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  AS $fn$
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    );
  $fn$;
EXCEPTION WHEN duplicate_function THEN NULL;
END $$;

-- Super admin full access on all 11 tables
CREATE POLICY sa_all_feature_backlog ON feature_backlog FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_operational_costs ON operational_costs FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_architecture_decisions ON architecture_decisions FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_cockpit_sprints ON cockpit_sprints FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_cockpit_feedback ON cockpit_feedback FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_cockpit_personas ON cockpit_personas FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_deploy_log ON deploy_log FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_cockpit_error_log ON cockpit_error_log FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_cockpit_content_calendar ON cockpit_content_calendar FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_cockpit_campaigns ON cockpit_campaigns FOR ALL USING (public.is_superadmin());
CREATE POLICY sa_all_daily_metrics ON daily_metrics FOR ALL USING (public.is_superadmin());

-- Authenticated users can submit feedback
CREATE POLICY authenticated_insert_feedback ON cockpit_feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_feature_backlog_product ON feature_backlog(product);
CREATE INDEX IF NOT EXISTS idx_feature_backlog_status ON feature_backlog(status);
CREATE INDEX IF NOT EXISTS idx_feature_backlog_phase ON feature_backlog(pipeline_phase);
CREATE INDEX IF NOT EXISTS idx_feature_backlog_rice ON feature_backlog(rice_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_operational_costs_active ON operational_costs(active);
CREATE INDEX IF NOT EXISTS idx_cockpit_sprints_product ON cockpit_sprints(product, week_start);
CREATE INDEX IF NOT EXISTS idx_cockpit_feedback_status ON cockpit_feedback(status, product);
CREATE INDEX IF NOT EXISTS idx_deploy_log_deployed ON deploy_log(product, deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cockpit_error_log_status ON cockpit_error_log(status);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(product, date DESC);
CREATE INDEX IF NOT EXISTS idx_cockpit_content_date ON cockpit_content_calendar(planned_date);
CREATE INDEX IF NOT EXISTS idx_cockpit_campaigns_status ON cockpit_campaigns(status);


-- ═══════════════════════════════════════════════════════════
-- TRIGGERS — updated_at (usa set_updated_at() já existente)
-- ═══════════════════════════════════════════════════════════

CREATE TRIGGER set_updated_at_feature_backlog BEFORE UPDATE ON feature_backlog FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_operational_costs BEFORE UPDATE ON operational_costs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_architecture_decisions BEFORE UPDATE ON architecture_decisions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_cockpit_sprints BEFORE UPDATE ON cockpit_sprints FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_cockpit_feedback BEFORE UPDATE ON cockpit_feedback FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_cockpit_personas BEFORE UPDATE ON cockpit_personas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_cockpit_campaigns BEFORE UPDATE ON cockpit_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ═══════════════════════════════════════════════════════════
-- SEED — Custos operacionais + Personas + ADRs iniciais
-- ═══════════════════════════════════════════════════════════

-- Custos operacionais atuais
INSERT INTO operational_costs (product, category, name, description, amount_brl, frequency, active) VALUES
  ('shared', 'infra', 'Vercel', 'Hospedagem frontend — Hobby Tier', 0, 'monthly', true),
  ('shared', 'infra', 'Supabase', 'Backend + DB — Free Tier', 0, 'monthly', true),
  ('blackbelt', 'infra', 'Bunny Stream', 'CDN de vídeo — uso por GB', 15, 'usage_based', true),
  ('shared', 'tools', 'Apple Developer', 'Conta anual iOS', 499, 'yearly', true),
  ('shared', 'tools', 'Claude Pro', 'IA para desenvolvimento', 200, 'monthly', true),
  ('shared', 'domain', 'Domínio .com.br', 'Registro anual', 40, 'yearly', true),
  ('shared', 'tools', 'Google Play Developer', 'Conta única Android', 125, 'one_time', true)
ON CONFLICT DO NOTHING;

-- 8 Personas dos perfis reais do BlackBelt
INSERT INTO cockpit_personas (product, name, role_in_app, description, pains, jobs_to_be_done, key_features, feature_completion_pct) VALUES
  ('blackbelt', 'Admin (Dono)', 'admin', 'Proprietário ou gestor principal da academia. Precisa de visão 360° do negócio.',
   '["Falta de controle financeiro", "Não sabe quem está inadimplente", "Dificuldade em reter alunos"]'::jsonb,
   '["Gerenciar a academia de forma profissional", "Aumentar receita e reduzir churn", "Tomar decisões baseadas em dados"]'::jsonb,
   '["Dashboard completo", "Gestão financeira", "Relatórios", "Gestão de alunos", "Configurações"]'::jsonb,
   95),
  ('blackbelt', 'Professor', 'professor', 'Instrutor de artes marciais. Foca em aulas e evolução dos alunos.',
   '["Chamada manual no papel", "Sem registro de evolução", "Comunicação fragmentada"]'::jsonb,
   '["Registrar presença rapidamente", "Acompanhar evolução dos alunos", "Comunicar com alunos e responsáveis"]'::jsonb,
   '["Chamada digital", "Diário de aulas", "Chat", "Vídeo-aulas", "Turmas"]'::jsonb,
   95),
  ('blackbelt', 'Aluno Adulto', 'aluno', 'Praticante adulto. Quer acompanhar sua jornada e evoluir.',
   '["Não sabe quando treinou", "Sem visão de progresso", "Esquece horários das aulas"]'::jsonb,
   '["Ver meu progresso no esporte", "Saber os horários e não perder aulas", "Sentir que estou evoluindo"]'::jsonb,
   '["Dashboard pessoal", "Calendário de aulas", "Histórico de presença", "Graduações", "Perfil"]'::jsonb,
   95),
  ('blackbelt', 'Aluno Teen', 'teen', 'Adolescente 13-17 anos. Gamificação é essencial para engajamento.',
   '["Acha treino monótono", "Sem motivação para continuar", "Não se sente parte de um grupo"]'::jsonb,
   '["Ganhar pontos e subir de nível", "Competir com colegas", "Sentir que faz parte de algo"]'::jsonb,
   '["XP e níveis", "Achievements", "Leaderboard", "Desafios", "Perfil gamificado"]'::jsonb,
   95),
  ('blackbelt', 'Aluno Kids', 'kids', 'Criança 6-12 anos. Interface precisa ser divertida e segura.',
   '["Interface adulta é confusa", "Sem incentivo visual", "Pais não sabem o que acontece"]'::jsonb,
   '["Ver meu progresso de forma divertida", "Ganhar estrelas e figurinhas", "Mostrar para os pais"]'::jsonb,
   '["Estrelas", "Jornada da faixa", "Figurinhas", "Conquistas visuais"]'::jsonb,
   90),
  ('blackbelt', 'Responsável', 'parent', 'Pai/mãe de aluno kids ou teen. Quer acompanhar o filho.',
   '["Não sabe se filho foi à aula", "Sem acesso a informações", "Pagamentos desorganizados"]'::jsonb,
   '["Acompanhar frequência do filho", "Ver evolução e próxima graduação", "Gerenciar pagamentos"]'::jsonb,
   '["Dashboard do filho", "Presença", "Financeiro", "Comunicação com professor"]'::jsonb,
   90),
  ('blackbelt', 'Recepcionista', 'recepcao', 'Responsável pelo atendimento e check-in na academia.',
   '["Check-in manual", "Não sabe quem é trial", "Cadastro de alunos demorado"]'::jsonb,
   '["Fazer check-in rápido", "Cadastrar alunos novos", "Identificar trials e visitantes"]'::jsonb,
   '["Check-in digital", "Cadastro rápido", "Agenda de aulas", "Lista de presença"]'::jsonb,
   90),
  ('blackbelt', 'Franqueador', 'franqueador', 'Dono de rede de academias. Visão consolidada de todas as unidades.',
   '["Sem visão unificada das unidades", "Relatórios manuais", "Padrão inconsistente"]'::jsonb,
   '["Ver todas as academias em um painel", "Comparar performance entre unidades", "Padronizar operação"]'::jsonb,
   '["Dashboard multi-unidade", "Ranking de unidades", "Relatórios consolidados", "Alertas"]'::jsonb,
   85)
ON CONFLICT DO NOTHING;

-- 5 ADRs iniciais
INSERT INTO architecture_decisions (product, title, status, context, options_considered, decision, consequences) VALUES
  ('both', 'Stack unificada Next.js + Supabase + Capacitor', 'accepted',
   'Precisamos de uma stack que funcione web + mobile com time de 1 dev (fundador + IA).',
   '[{"option":"React Native + Node + PostgreSQL","pros":"Melhor UX nativa mobile","cons":"Duas bases de código, mais complexo"},{"option":"Next.js + Supabase + Capacitor","pros":"Uma base de código, auth/DB pronto, PWA + nativo","cons":"UX nativa limitada pelo WebView"},{"option":"Flutter + Firebase","pros":"Cross-platform nativo","cons":"Vendor lock-in Google, sem SSR"}]'::jsonb,
   'Next.js 14 (App Router) + Supabase (auth, DB, storage, realtime) + Capacitor (iOS/Android). Uma base de código TypeScript strict para tudo.',
   'Velocidade de desenvolvimento muito alta. Trade-off: UX mobile via WebView. Mitigação: mobile-first CSS + PWA features.'),
  ('blackbelt', 'Cockpit integrado ao app (não ferramenta separada)', 'accepted',
   'O founder precisa de um painel de gestão do produto/negócio. Opções: ferramenta externa ou integrado.',
   '[{"option":"Notion/Linear/Airtable","pros":"Pronto para usar","cons":"Fragmentado, sem dados reais do app"},{"option":"Dashboard integrado na app","pros":"Dados reais, uma ferramenta só","cons":"Esforço de desenvolvimento"},{"option":"Admin panel separado","pros":"Isolado, sem risco","cons":"Mais infra, mais complexidade"}]'::jsonb,
   'Cockpit integrado como rota /cockpit dentro do app, protegido por role superadmin. Acessa dados reais diretamente.',
   'Zero custo extra de infra. Dados sempre atualizados. Risk: se app cair, cockpit cai também. Aceitável para estágio atual.'),
  ('blackbelt', 'Bunny Stream para vídeo em vez de S3/CloudFront', 'accepted',
   'Precisamos de streaming de vídeo para aulas gravadas. Custo é crítico no início.',
   '[{"option":"AWS S3 + CloudFront","pros":"Escalável, controle total","cons":"Complexo, custo alto para vídeo"},{"option":"Bunny Stream","pros":"CDN global, transcoding automático, pay-per-use","cons":"Dependência de terceiro"},{"option":"YouTube unlisted","pros":"Grátis","cons":"Sem controle, ads, não profissional"}]'::jsonb,
   'Bunny Stream com upload via tus-js-client. CDN global, transcoding automático, preço por GB armazenado + transferido.',
   'Custo muito baixo no início (~R$15/mês). Transcoding automático para múltiplas resoluções. Lock-in moderado mas aceitável.'),
  ('blackbelt', '9 perfis de usuário com shells independentes', 'accepted',
   'O app atende desde crianças até franqueadores. A UX precisa ser radicalmente diferente por perfil.',
   '[{"option":"Interface única com permissões","pros":"Menos código","cons":"UX genérica para todos"},{"option":"Shells por perfil com rotas separadas","pros":"UX otimizada por persona","cons":"Mais código, mais manutenção"}]'::jsonb,
   '9 shells independentes: Admin, Professor, Aluno Adulto, Teen, Kids, Responsável, Recepcionista, Franqueador, SuperAdmin. Cada um com sidebar/nav, cores e features próprias.',
   'UX excelente por persona. Kids tem interface lúdica, Teen tem gamificação, Admin tem dashboard analítico. Custo: manutenção de 9 layouts.'),
  ('blackbelt', 'Pricing 5 tiers: Free trial 7d + 4 planos pagos', 'accepted',
   'Modelo de monetização para academias de artes marciais no Brasil.',
   '[{"option":"Freemium permanente","pros":"Baixa barreira","cons":"Difícil converter, custo de infra"},{"option":"Trial + planos","pros":"Urgência, valor claro","cons":"Barreira inicial"},{"option":"Pay per student","pros":"Alinhado ao uso","cons":"Imprevisível para academia"}]'::jsonb,
   'Trial 7 dias grátis → 4 planos: Starter (R$97), Pro (R$197), Premium (R$297), Enterprise (R$497). Diferença em nº de alunos, módulos e suporte.',
   'MRR previsível. Trial gera urgência. Planos escalam com tamanho da academia. Risk: churn alto se valor não percebido nos 7 dias.')
ON CONFLICT DO NOTHING;
