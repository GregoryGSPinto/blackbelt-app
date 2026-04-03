# 🥋 BLACKBELT V2 — COCKPIT DO FOUNDER
# IMPLEMENTAÇÃO COMPLETA — CEO · CPO · CTO · GROWTH
# Rota /cockpit — Exclusivo super_admin (Gregory)

---

Você vai implementar o **Cockpit do Founder** no BlackBelt v2 — um painel de gestão executivo acessível apenas para o role `super_admin`. São 4 abas (CEO, CPO, CTO, Growth), cada uma com ferramentas reais de decisão.

Este NÃO é um admin dashboard de gerenciar academias (isso já existe). Este é o cockpit onde o founder toma decisões de negócio, acompanha saúde técnica, prioriza features, e planeja crescimento.

## REGRAS DE EXECUÇÃO

1. Leia o arquivo inteiro ANTES de começar a codar
2. Execute em 6 blocos sequenciais (Schema → Layout → CEO → CPO → CTO → Growth)
3. `npx tsc --noEmit` DEVE retornar 0 erros após CADA bloco
4. Commit entre cada bloco: `git add -A && git commit -m "cockpit: bloco-XX-nome"`
5. CSS variables SEMPRE: `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)` — ZERO cores hardcoded
6. Toast PT-BR em TODA ação de mutação
7. `handleServiceError(error)` em todo catch de service
8. NUNCA delete blocos `isMock()` — mock e real coexistem
9. Mobile-first — Gregory acessa pelo celular durante o dia
10. Componentes de cockpit ficam em `components/cockpit/` — isolados do resto
11. Dados sensíveis (MRR, custos) NUNCA cacheados no client — sempre fetch fresh
12. Dark mode padrão — consistente com o app

---

## BLOCO 1 — SCHEMA SUPABASE (Migração)

Crie o arquivo `supabase/migrations/037_cockpit.sql`:

```sql
-- ============================================================
-- COCKPIT DO FOUNDER — Schema completo
-- Apenas super_admin tem acesso (RLS)
-- ============================================================

-- ============================================================
-- 1. FEATURE BACKLOG (CEO Filter + CPO Roadmap)
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_backlog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt', 'primal')),
  title TEXT NOT NULL,
  description TEXT,
  module TEXT, -- 'streaming', 'compete', 'gestao', 'financeiro', 'social', 'kids', 'core'
  persona TEXT, -- 'admin', 'professor', 'aluno-adulto', 'aluno-teen', 'aluno-kids', 'responsavel', 'recepcionista', 'franqueador', 'super-admin'
  job_to_be_done TEXT,
  success_criteria TEXT,
  
  -- RICE scoring (simplificado: Impacto 3x, Urgência 2x, Esforço inverso 1x)
  rice_impact INT DEFAULT 0 CHECK (rice_impact BETWEEN 0 AND 5),
  rice_urgency INT DEFAULT 0 CHECK (rice_urgency BETWEEN 0 AND 5),
  rice_effort INT DEFAULT 0 CHECK (rice_effort BETWEEN 0 AND 5),
  rice_score NUMERIC GENERATED ALWAYS AS (
    (rice_impact * 3 + rice_urgency * 2 + rice_effort * 1)
  ) STORED,
  
  -- Pipeline phase (CEO-OS: Filter → Spec → Arch → Prompt → Ship)
  pipeline_phase TEXT DEFAULT 'idea' CHECK (pipeline_phase IN (
    'idea', 'ceo_filter', 'cpo_spec', 'cto_arch', 'prompting', 'building', 'shipped', 'icebox', 'killed'
  )),
  
  -- Kanban status (dentro do pipeline)
  status TEXT DEFAULT 'backlog' CHECK (status IN (
    'backlog', 'sprint', 'in_progress', 'review', 'done', 'icebox', 'killed'
  )),
  
  priority_order INT DEFAULT 0, -- para drag-and-drop ordering
  sprint_id UUID, -- FK para sprints (preenchido quando status = 'sprint' ou 'in_progress')
  shipped_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. CUSTOS OPERACIONAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS operational_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt', 'primal', 'shared')),
  category TEXT NOT NULL CHECK (category IN ('infra', 'domain', 'api', 'marketing', 'tools', 'legal', 'other')),
  name TEXT NOT NULL, -- 'Vercel Pro', 'Supabase', 'Bunny Stream', 'Apple Developer'
  description TEXT,
  amount_brl NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'yearly', 'one_time', 'usage_based')),
  active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. DECISÕES ARQUITETURAIS (ADR)
-- ============================================================
CREATE TABLE IF NOT EXISTS architecture_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt', 'primal', 'both')),
  adr_number SERIAL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'deprecated', 'superseded')),
  context TEXT,
  options_considered JSONB DEFAULT '[]', -- [{option, pros, cons}]
  decision TEXT,
  consequences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. SPRINTS SEMANAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS sprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt' CHECK (product IN ('blackbelt', 'primal')),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  goals JSONB DEFAULT '[]', -- [{title, status: 'not_started'|'in_progress'|'done', feature_id?}]
  velocity INT DEFAULT 0, -- features shipped this sprint
  prompts_executed INT DEFAULT 0, -- mega prompts rodados no Claude Code
  notes TEXT,
  retrospective TEXT, -- o que aprendeu
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. FEEDBACK DE USUÁRIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_email TEXT,
  user_role TEXT, -- perfil do usuário que enviou
  academy_id UUID, -- de qual academia veio
  academy_name TEXT,
  category TEXT DEFAULT 'geral' CHECK (category IN ('bug', 'feature', 'ux', 'performance', 'geral', 'elogio')),
  message TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5), -- NPS simplificado
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'investigating', 'archived', 'converted')),
  converted_to UUID REFERENCES feature_backlog(id),
  internal_notes TEXT, -- anotações do Gregory
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. PERSONAS
-- ============================================================
CREATE TABLE IF NOT EXISTS cockpit_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  name TEXT NOT NULL, -- 'Dono de Academia', 'Professor de BJJ', 'Aluno Faixa Azul'
  role_in_app TEXT, -- 'admin', 'professor', 'aluno-adulto', etc.
  description TEXT,
  pains JSONB DEFAULT '[]', -- ["não consigo controlar presença", "planilha é limitada"]
  jobs_to_be_done JSONB DEFAULT '[]', -- ["gerenciar 200 alunos", "acompanhar graduações"]
  key_features JSONB DEFAULT '[]', -- ["check-in biométrico", "relatórios de presença"]
  feature_completion_pct INT DEFAULT 0, -- % das features dessa persona que estão prontas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. DEPLOY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS deploy_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  commit_sha TEXT,
  commit_message TEXT,
  branch TEXT DEFAULT 'main',
  tag TEXT, -- v3.3.0-100-score, etc.
  status TEXT CHECK (status IN ('success', 'failed', 'building', 'cancelled')),
  duration_seconds INT,
  files_changed INT,
  lines_added INT,
  lines_removed INT,
  vercel_url TEXT,
  deployed_by TEXT DEFAULT 'gregory',
  deployed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. ERROR LOG (até Sentry ser configurado)
-- ============================================================
CREATE TABLE IF NOT EXISTS cockpit_error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  error_type TEXT CHECK (error_type IN ('runtime', 'build', 'api', 'database', 'auth', 'integration')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  stack_trace TEXT,
  affected_route TEXT,
  affected_users INT DEFAULT 0,
  frequency INT DEFAULT 1,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'wont_fix', 'monitoring')),
  resolution TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- 9. CONTENT CALENDAR
-- ============================================================
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'blog', 'linkedin', 'whatsapp', 'email')),
  content_type TEXT CHECK (content_type IN ('post', 'reel', 'story', 'article', 'video', 'carousel', 'newsletter')),
  planned_date DATE,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'planned', 'creating', 'ready', 'published', 'cancelled')),
  published_url TEXT,
  target_persona TEXT, -- qual persona esse conteúdo atinge
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. CAMPANHAS & EXPERIMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  name TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('organic', 'paid_social', 'influencer', 'seo', 'partnerships', 'referral', 'events', 'outbound')),
  budget_brl NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  goal TEXT,
  target_metric TEXT, -- 'academias_cadastradas', 'trial_conversions', 'mrr'
  target_value NUMERIC,
  actual_value NUMERIC,
  result TEXT,
  learnings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. MÉTRICAS DIÁRIAS (snapshot agregado)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'blackbelt',
  date DATE NOT NULL,
  -- Academias
  total_academies INT DEFAULT 0,
  active_academies INT DEFAULT 0,
  trial_academies INT DEFAULT 0,
  churned_academies INT DEFAULT 0,
  -- Usuários
  total_users INT DEFAULT 0,
  active_users_7d INT DEFAULT 0,
  new_users INT DEFAULT 0,
  -- Financeiro
  mrr_brl NUMERIC DEFAULT 0,
  new_mrr_brl NUMERIC DEFAULT 0, -- expansão
  churned_mrr_brl NUMERIC DEFAULT 0, -- contração
  -- Engajamento
  total_checkins INT DEFAULT 0,
  total_classes INT DEFAULT 0,
  avg_session_seconds INT DEFAULT 0,
  -- Compete
  active_championships INT DEFAULT 0,
  total_registrations INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product, date)
);

-- ============================================================
-- RLS — Apenas super_admin acessa tudo
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'feature_backlog', 'operational_costs', 'architecture_decisions',
      'sprints', 'user_feedback', 'cockpit_personas', 'deploy_log',
      'cockpit_error_log', 'content_calendar', 'campaigns', 'daily_metrics'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    
    -- Super admin full access
    EXECUTE format(
      'CREATE POLICY "super_admin_all_%1$s" ON %1$s FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = ''super_admin'')
      )',
      tbl
    );
  END LOOP;
END $$;

-- Feedback: qualquer usuário autenticado pode INSERT (enviar feedback)
CREATE POLICY "authenticated_insert_feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_feature_backlog_product ON feature_backlog(product);
CREATE INDEX idx_feature_backlog_status ON feature_backlog(status);
CREATE INDEX idx_feature_backlog_pipeline ON feature_backlog(pipeline_phase);
CREATE INDEX idx_feature_backlog_rice ON feature_backlog(rice_score DESC);
CREATE INDEX idx_operational_costs_active ON operational_costs(active) WHERE active = TRUE;
CREATE INDEX idx_sprints_product_week ON sprints(product, week_start);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);
CREATE INDEX idx_user_feedback_product ON user_feedback(product);
CREATE INDEX idx_deploy_log_product ON deploy_log(product, deployed_at DESC);
CREATE INDEX idx_error_log_status ON cockpit_error_log(status);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(product, date DESC);
CREATE INDEX idx_content_calendar_date ON content_calendar(planned_date);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION cockpit_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'feature_backlog', 'operational_costs', 'architecture_decisions',
      'sprints', 'user_feedback', 'cockpit_personas', 'campaigns'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON %1$s
       FOR EACH ROW EXECUTE FUNCTION cockpit_set_updated_at()',
      tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- SEED — Dados iniciais do cockpit
-- ============================================================

-- Custos operacionais atuais
INSERT INTO operational_costs (product, category, name, amount_brl, frequency) VALUES
  ('shared', 'infra', 'Vercel (Hobby)', 0, 'monthly'),
  ('shared', 'infra', 'Supabase (Free Tier)', 0, 'monthly'),
  ('shared', 'infra', 'Bunny Stream', 0, 'usage_based'),
  ('shared', 'tools', 'Apple Developer Account', 499, 'yearly'),
  ('shared', 'domain', 'Domínios (.com.br)', 40, 'yearly'),
  ('shared', 'tools', 'Claude Pro/Max', 200, 'monthly'),
  ('blackbelt', 'infra', 'Supabase BlackBelt (quando Pro)', 0, 'monthly'),
  ('primal', 'infra', 'Supabase PrimalWOD (quando Pro)', 0, 'monthly');

-- Personas do BlackBelt (baseado nos 9 perfis reais)
INSERT INTO cockpit_personas (product, name, role_in_app, description, pains, jobs_to_be_done, key_features, feature_completion_pct) VALUES
  ('blackbelt', 'Dono de Academia', 'admin', 'Proprietário de academia de artes marciais. Gerencia tudo: alunos, professores, financeiro, turmas. Precisa de visão completa do negócio.',
    '["Planilhas limitadas para gestão", "Sem visão consolidada do negócio", "Cobrança manual de mensalidades", "Não sabe quem está inadimplente"]'::jsonb,
    '["Gerenciar 50-500 alunos eficientemente", "Controlar financeiro e inadimplência", "Acompanhar presença e engajamento", "Comunicar com pais de alunos kids"]'::jsonb,
    '["Dashboard completo", "Gestão financeira", "Controle de presença", "Relatórios", "Comunicação"]'::jsonb,
    85),
  ('blackbelt', 'Professor', 'professor', 'Professor de BJJ, Judô, Karatê ou MMA. Dá aulas, faz chamada, avalia alunos, publica conteúdo em vídeo.',
    '["Chamada em papel é ineficiente", "Não tem como compartilhar vídeos de aula", "Sem histórico de evolução dos alunos"]'::jsonb,
    '["Fazer chamada digital", "Compartilhar vídeos de técnicas", "Acompanhar evolução de cada aluno", "Avaliar alunos para graduação"]'::jsonb,
    '["Chamada digital", "Upload de vídeos", "Avaliação de alunos", "Gradebook"]'::jsonb,
    80),
  ('blackbelt', 'Aluno Adulto', 'aluno-adulto', 'Praticante adulto (18+). Treina regularmente, quer acompanhar sua evolução, presenças, e graduações.',
    '["Não sabe quantas aulas fez no mês", "Sem registro de evolução", "Não sabe quando será graduado"]'::jsonb,
    '["Ver meu histórico de presenças", "Acompanhar minha evolução de faixa", "Pagar mensalidade pelo app", "Participar de campeonatos"]'::jsonb,
    '["Dashboard pessoal", "Histórico de presenças", "Graduações", "Pagamentos", "Compete"]'::jsonb,
    90),
  ('blackbelt', 'Aluno Teen (13-17)', 'aluno-teen', 'Adolescente praticante. Motivado por gamificação, XP, badges. Age-appropriate.',
    '["Treino parece chato sem incentivo", "Não vê progresso tangível", "Quer competir com amigos"]'::jsonb,
    '["Ganhar XP e badges por treino", "Ver meu ranking entre amigos", "Acompanhar streaks de presença"]'::jsonb,
    '["XP e gamificação", "Badges", "Streaks", "Leaderboard teen"]'::jsonb,
    75),
  ('blackbelt', 'Aluno Kids (<13)', 'aluno-kids', 'Criança praticante. UI lúdica, sem mensagens, sem conteúdo adulto. Pais gerenciam.',
    '["Interface muito séria para criança", "Precisa de motivação visual"]'::jsonb,
    '["Ver stickers e recompensas", "Acompanhar progresso de forma divertida"]'::jsonb,
    '["UI playful", "Stickers", "Progresso simplificado", "Sem mensagens"]'::jsonb,
    70),
  ('blackbelt', 'Responsável/Guardian', 'responsavel', 'Pai/mãe de aluno kid ou teen. Paga, autoriza, acompanha progresso dos filhos.',
    '["Não sabe se meu filho foi ao treino", "Não consigo pagar pelo app", "Sem comunicação com a academia"]'::jsonb,
    '["Ver presença dos filhos", "Pagar mensalidade", "Receber comunicados", "Autorizar participação em eventos"]'::jsonb,
    '["Dashboard dos filhos", "Pagamentos", "Comunicação", "Autorizações"]'::jsonb,
    75),
  ('blackbelt', 'Recepcionista', 'recepcionista', 'Atende na recepção. Faz check-in, cadastro, agendamento. Sem acesso financeiro.',
    '["Check-in manual é lento", "Cadastro em papel perde informação"]'::jsonb,
    '["Check-in rápido de alunos", "Cadastrar novos alunos", "Consultar dados rapidamente"]'::jsonb,
    '["Check-in biométrico", "Cadastro digital", "Consulta rápida"]'::jsonb,
    85),
  ('blackbelt', 'Franqueador', 'franqueador', 'Gerencia múltiplas unidades de uma rede. Precisa de visão consolidada cross-academia.',
    '["Sem visão unificada das unidades", "Cada unidade usa sistema diferente", "Não consigo comparar performance entre unidades"]'::jsonb,
    '["Dashboard multi-unidade", "Comparar métricas entre academias", "Padronizar operação"]'::jsonb,
    '["Dashboard multi-unidade", "Relatórios comparativos", "Padrões de qualidade"]'::jsonb,
    60);

-- ADRs iniciais (decisões já tomadas)
INSERT INTO architecture_decisions (product, title, status, context, decision, consequences) VALUES
  ('both', 'Stack unificado Next.js + Supabase + Vercel', 'accepted',
    'Founder solo usando AI como equipe de dev. Precisa de stack que minimize context-switching.',
    'Next.js 14 App Router + Supabase + Vercel + Capacitor para ambos os produtos.',
    'Vendor lock-in aceitável. PostgreSQL portável. TypeScript end-to-end.'),
  ('both', 'Cockpit como feature do app (não app separado)', 'accepted',
    'Precisamos de painel de gestão CEO/CTO/CPO/Growth.',
    'Cockpit integrado em cada app via rota /cockpit protegida por super_admin.',
    'Cada produto tem métricas distintas. Mesmo Supabase = zero latência. Menos repos.'),
  ('blackbelt', 'Bunny Stream para vídeos (não YouTube/Vimeo)', 'accepted',
    'Precisa de hosting de vídeo com upload TUS, CDN, e sem branding de terceiros.',
    'Bunny Stream com Library ID 626933, CDN host vz-1ea2733d-15c.b-cdn.net.',
    'Shared library entre BlackBelt e PrimalWOD. Webhook para status de processamento.'),
  ('blackbelt', '9 perfis de usuário com RLS granular', 'accepted',
    'Sistema multi-tenant com diferentes níveis de acesso.',
    'Super Admin, Admin, Professor, Recepcionista, Aluno Adulto, Teen, Kids, Responsável, Franqueador.',
    'RLS por academia_id em todas as tabelas. Kids sem mensagens. Teen com gamificação.'),
  ('blackbelt', 'Modelo de pricing 5 tiers', 'accepted',
    'Precisa de escalabilidade de preço por tamanho de academia.',
    'Starter R$97 → Essencial R$197 → Pro R$347 → BlackBelt R$597 → Enterprise sob consulta. Trial 7 dias.',
    'Limites por tier em: alunos, professores, turmas, armazenamento de vídeo.');
```

Agora, ANTES de criar o arquivo SQL, leia as migrações existentes para adaptar os nomes das tabelas reais:
```bash
ls supabase/migrations/
grep -rn "CREATE TABLE" supabase/migrations/ | grep -v "IF NOT EXISTS cockpit\|IF NOT EXISTS feature\|IF NOT EXISTS operational\|IF NOT EXISTS architecture\|IF NOT EXISTS sprint\|IF NOT EXISTS user_feedback\|IF NOT EXISTS cockpit_persona\|IF NOT EXISTS deploy_log\|IF NOT EXISTS cockpit_error\|IF NOT EXISTS content_calendar\|IF NOT EXISTS campaign\|IF NOT EXISTS daily_metrics"
```

Se alguma dessas tabelas já existir (por exemplo, se audit_logs já foi criado anteriormente), NÃO crie duplicata — adicione `IF NOT EXISTS`.

Garanta que as FKs para `profiles` e `auth.users` usam os nomes corretos do schema real.

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-01-schema-supabase"
```

---

## BLOCO 2 — ESTRUTURA DE ROTAS E LAYOUT

### 2.1 — Rota protegida /cockpit

Crie a estrutura de rotas:
```
app/(cockpit)/
  ├── cockpit/
  │   ├── layout.tsx          — Layout com tab bar (CEO | CPO | CTO | Growth)
  │   ├── page.tsx            — Redirect para /cockpit/ceo
  │   ├── loading.tsx         — Skeleton do cockpit
  │   ├── error.tsx           — Error boundary
  │   ├── not-found.tsx       — 404
  │   ├── ceo/
  │   │   └── page.tsx        — Tab CEO
  │   ├── cpo/
  │   │   └── page.tsx        — Tab CPO
  │   ├── cto/
  │   │   └── page.tsx        — Tab CTO
  │   └── growth/
  │       └── page.tsx        — Tab Growth
```

### 2.2 — Layout do Cockpit

O layout do cockpit é INDEPENDENTE do layout principal do app. Tem seu próprio header e navegação.

```tsx
// app/(cockpit)/cockpit/layout.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  Crown, // CEO
  Lightbulb, // CPO
  Server, // CTO
  TrendingUp, // Growth
  ArrowLeft,
  Bell
} from 'lucide-react';

const TABS = [
  { id: 'ceo', label: 'CEO', icon: Crown, href: '/cockpit/ceo' },
  { id: 'cpo', label: 'CPO', icon: Lightbulb, href: '/cockpit/cpo' },
  { id: 'cto', label: 'CTO', icon: Server, href: '/cockpit/cto' },
  { id: 'growth', label: 'Growth', icon: TrendingUp, href: '/cockpit/growth' },
];

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = TABS.find(t => pathname.includes(t.id))?.id ?? 'ceo';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bb-depth-0, #0a0a0a)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" 
        style={{ borderColor: 'var(--bb-depth-3)', background: 'var(--bb-depth-1)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/superadmin')} 
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--bb-ink-2)' }}
            aria-label="Voltar ao painel">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--bb-ink-1)' }}>Cockpit</h1>
            <p className="text-xs" style={{ color: 'var(--bb-ink-3)' }}>Painel do Founder</p>
          </div>
        </div>
        <button className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg relative"
          style={{ color: 'var(--bb-ink-2)' }}
          aria-label="Notificações">
          <Bell className="w-5 h-5" />
          {/* Badge - mostrar quando houver feedback novo, erro novo, etc */}
        </button>
      </header>

      {/* Tab Bar */}
      <nav className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--bb-depth-3)', background: 'var(--bb-depth-1)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className="flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors relative"
              style={{ 
                color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-3)',
              }}
              aria-label={`Aba ${tab.label}`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full" 
                  style={{ background: 'var(--bb-brand)' }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

### 2.3 — Middleware protection

Verifique o middleware.ts existente e adicione proteção para `/cockpit`:
```bash
cat middleware.ts
```

Adicione a rota `/cockpit` ao grupo de rotas protegidas por `super_admin`. Se o middleware já verifica roles, adicione cockpit ao mapa de roles. Se não, adicione a verificação.

### 2.4 — Ícone de acesso no sidebar do Super Admin

Busque o sidebar/shell do Super Admin:
```bash
grep -rn "superadmin\|super.admin\|SuperAdmin" app/ components/ --include="*.tsx" -l | head -10
```

Adicione um ícone de "Cockpit" (Crown ou Rocket) na sidebar do Super Admin que linka para `/cockpit`. Com badge se houver notificações pendentes.

### 2.5 — Componentes compartilhados do cockpit

Crie os componentes reutilizáveis:

```
components/cockpit/
  ├── KpiCard.tsx             — Card com número + delta + sparkline + tendência
  ├── StatusBadge.tsx         — Verde/amarelo/vermelho com label
  ├── RiceScorer.tsx          — Input de RICE com cálculo automático
  ├── MiniChart.tsx           — Line/bar chart compacto (Recharts)
  ├── EmptyState.tsx          — Empty state padrão do cockpit
  ├── SectionHeader.tsx       — Header de seção com título + ação
  ├── ConfirmDialog.tsx       — Modal de confirmação para ações destrutivas
  └── CockpitSkeleton.tsx     — Skeleton loading padrão
```

#### KpiCard.tsx
```tsx
'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: number; // percentual de mudança
  deltaLabel?: string; // "vs semana passada"
  icon?: LucideIcon;
  format?: 'number' | 'currency' | 'percent';
  loading?: boolean;
}

export function KpiCard({ title, value, delta, deltaLabel, icon: Icon, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--bb-depth-2)' }}>
        <div className="h-4 w-24 rounded mb-3" style={{ background: 'var(--bb-depth-3)' }} />
        <div className="h-8 w-16 rounded" style={{ background: 'var(--bb-depth-3)' }} />
      </div>
    );
  }

  const isPositive = delta && delta > 0;
  const isNegative = delta && delta < 0;
  const DeltaIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-depth-3)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-3)' }}>
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4" style={{ color: 'var(--bb-ink-3)' }} />}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--bb-ink-1)' }}>
        {value}
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          <DeltaIcon className="w-3 h-3" style={{ 
            color: isPositive ? 'var(--bb-success, #22c55e)' : isNegative ? 'var(--bb-danger, #ef4444)' : 'var(--bb-ink-3)' 
          }} />
          <span className="text-xs" style={{ 
            color: isPositive ? 'var(--bb-success, #22c55e)' : isNegative ? 'var(--bb-danger, #ef4444)' : 'var(--bb-ink-3)' 
          }}>
            {Math.abs(delta)}%
          </span>
          {deltaLabel && (
            <span className="text-xs" style={{ color: 'var(--bb-ink-4)' }}>{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
```

Crie os demais componentes seguindo o mesmo padrão: CSS variables, aria-labels, loading states, mobile-first.

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-02-estrutura-rotas-layout-componentes"
```

---

## BLOCO 3 — TAB CEO (Dashboard Executivo)

**Propósito**: Visão de 30 segundos do estado do negócio. Gregory abre isso toda segunda de manhã.

### 3.1 — Service layer

Crie `lib/api/cockpit.service.ts` com TODOS os services do cockpit:

```ts
// lib/api/cockpit.service.ts
import { createBrowserClient } from '@/lib/supabase/client';
import { isMock } from '@/lib/utils/mock'; // ou onde estiver o helper
import { handleServiceError } from '@/lib/utils/error'; // ou logServiceError

// ========== TYPES ==========

export interface KpiSnapshot {
  totalAcademies: number;
  activeAcademies: number;
  trialAcademies: number;
  totalUsers: number;
  activeUsers7d: number;
  mrr: number;
  churnRate: number;
  avgCheckins: number;
  npsScore: number;
  // Deltas (vs semana anterior)
  deltaAcademies: number;
  deltaUsers: number;
  deltaMrr: number;
  deltaChurn: number;
}

export interface FeatureBacklogItem {
  id: string;
  product: string;
  title: string;
  description: string | null;
  module: string | null;
  persona: string | null;
  job_to_be_done: string | null;
  success_criteria: string | null;
  rice_impact: number;
  rice_urgency: number;
  rice_effort: number;
  rice_score: number;
  pipeline_phase: string;
  status: string;
  priority_order: number;
  sprint_id: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationalCost {
  id: string;
  product: string;
  category: string;
  name: string;
  description: string | null;
  amount_brl: number;
  frequency: string;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface ArchitectureDecision {
  id: string;
  product: string;
  adr_number: number;
  title: string;
  status: string;
  context: string | null;
  decision: string | null;
  consequences: string | null;
  created_at: string;
}

export interface Sprint {
  id: string;
  product: string;
  week_start: string;
  week_end: string;
  goals: Array<{ title: string; status: string; feature_id?: string }>;
  velocity: number;
  prompts_executed: number;
  notes: string | null;
  retrospective: string | null;
}

export interface UserFeedbackItem {
  id: string;
  product: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  academy_name: string | null;
  category: string;
  message: string;
  rating: number | null;
  status: string;
  converted_to: string | null;
  internal_notes: string | null;
  created_at: string;
}

export interface DeployLogItem {
  id: string;
  product: string;
  commit_sha: string | null;
  commit_message: string | null;
  branch: string;
  tag: string | null;
  status: string;
  duration_seconds: number | null;
  files_changed: number | null;
  lines_added: number | null;
  lines_removed: number | null;
  vercel_url: string | null;
  deployed_at: string;
}

export interface ErrorLogItem {
  id: string;
  product: string;
  error_type: string | null;
  severity: string;
  message: string;
  affected_route: string | null;
  frequency: number;
  status: string;
  first_seen: string;
  last_seen: string;
}

export interface ContentCalendarItem {
  id: string;
  product: string;
  title: string;
  platform: string;
  content_type: string | null;
  planned_date: string | null;
  status: string;
  published_url: string | null;
  target_persona: string | null;
  notes: string | null;
}

export interface CampaignItem {
  id: string;
  product: string;
  name: string;
  channel: string | null;
  budget_brl: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  goal: string | null;
  target_metric: string | null;
  target_value: number | null;
  actual_value: number | null;
  result: string | null;
  learnings: string | null;
}

export interface PersonaItem {
  id: string;
  name: string;
  role_in_app: string | null;
  description: string | null;
  pains: string[];
  jobs_to_be_done: string[];
  key_features: string[];
  feature_completion_pct: number;
}

// ========== MOCK DATA ==========
// (gere dados mock realistas para cada função abaixo)

// ========== CEO SERVICES ==========

export async function getKpiSnapshot(product: string = 'blackbelt'): Promise<KpiSnapshot> {
  if (isMock()) {
    return {
      totalAcademies: 2, activeAcademies: 2, trialAcademies: 2,
      totalUsers: 47, activeUsers7d: 31, mrr: 0,
      churnRate: 0, avgCheckins: 12, npsScore: 0,
      deltaAcademies: 0, deltaUsers: 8, deltaMrr: 0, deltaChurn: 0,
    };
  }
  try {
    const supabase = createBrowserClient();
    // Buscar da tabela daily_metrics os últimos 2 registros para calcular deltas
    const { data } = await supabase
      .from('daily_metrics')
      .select('total_academies, active_academies, trial_academies, total_users, active_users_7d, mrr_brl, total_checkins')
      .eq('product', product)
      .order('date', { ascending: false })
      .limit(2);
    
    const today = data?.[0];
    const lastWeek = data?.[1];
    
    return {
      totalAcademies: today?.total_academies ?? 0,
      activeAcademies: today?.active_academies ?? 0,
      trialAcademies: today?.trial_academies ?? 0,
      totalUsers: today?.total_users ?? 0,
      activeUsers7d: today?.active_users_7d ?? 0,
      mrr: today?.mrr_brl ?? 0,
      churnRate: 0, // calcular com base em churned_academies
      avgCheckins: today?.total_checkins ?? 0,
      npsScore: 0,
      deltaAcademies: lastWeek ? ((today?.total_academies ?? 0) - (lastWeek.total_academies ?? 0)) : 0,
      deltaUsers: lastWeek ? ((today?.total_users ?? 0) - (lastWeek.total_users ?? 0)) : 0,
      deltaMrr: lastWeek ? ((today?.mrr_brl ?? 0) - (lastWeek.mrr_brl ?? 0)) : 0,
      deltaChurn: 0,
    };
  } catch (error) {
    handleServiceError(error);
    return { totalAcademies: 0, activeAcademies: 0, trialAcademies: 0, totalUsers: 0, activeUsers7d: 0, mrr: 0, churnRate: 0, avgCheckins: 0, npsScore: 0, deltaAcademies: 0, deltaUsers: 0, deltaMrr: 0, deltaChurn: 0 };
  }
}

// ... continuar com TODAS as funções CRUD para cada entidade:
// getFeatureBacklog, createFeature, updateFeature, deleteFeature, moveFeatureStatus
// getOperationalCosts, createCost, updateCost, deleteCost, getTotalMonthlyCost
// getArchitectureDecisions, createADR, updateADR
// getSprints, createSprint, updateSprint, getCurrentSprint
// getUserFeedback, updateFeedbackStatus, convertFeedbackToFeature
// getDeployLog, createDeployEntry
// getErrorLog, updateErrorStatus
// getContentCalendar, createContent, updateContent
// getCampaigns, createCampaign, updateCampaign
// getPersonas, updatePersona
```

IMPLEMENTE TODAS as funções acima com:
1. `isMock()` branch com dados realistas
2. Branch real com Supabase queries otimizadas (NÃO select('*'))
3. `handleServiceError(error)` em todo catch
4. Tipagem TypeScript completa (sem any)

### 3.2 — Página CEO

Crie `app/(cockpit)/cockpit/ceo/page.tsx` com:

1. **KPI Cards (topo)** — Grid 2x2 mobile, 3x2 desktop:
   - Academias ativas (número + delta)
   - Academias em trial (número)
   - Total de usuários (número + delta)
   - MRR (R$ + delta)
   - Churn rate (% )
   - NPS score

2. **Gráfico de receita** (placeholder — MiniChart com dados mock):
   - Line chart dos últimos 6 meses
   - MRR, novos assinantes, cancelamentos

3. **CEO Filter Board** — Lista de features com:
   - Cada item mostra: título, score RICE (preenchível inline), pipeline phase
   - Botões: "Ship it" (→ sprint), "Kill" (→ killed), "Icebox"
   - Ordenado por rice_score DESC
   - Formulário para criar nova feature
   - Filtro por módulo e status

4. **Controle de custos** — Lista de custos operacionais:
   - Cada custo: nome, categoria, valor, frequência, ativo/inativo
   - Total mensal calculado (somar monthly + yearly/12)
   - Formulário para adicionar novo custo
   - Toggle ativo/inativo

5. **ADR Feed** — Lista cronológica de decisões:
   - Cada ADR: número, título, status (badge colorido), data
   - Expandível para ver contexto + decisão + consequências
   - Botão "Nova decisão" (modal com formulário)

TODOS os componentes devem:
- Ter loading skeleton
- Ter empty state com ícone + mensagem + CTA
- Ter toast de feedback em mutações
- Ter confirmação antes de ações destrutivas (Kill, Delete)
- Usar CSS variables EXCLUSIVAMENTE
- Ser responsivos mobile-first

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-03-tab-ceo"
```

---

## BLOCO 4 — TAB CPO (Produto & Roadmap)

Crie `app/(cockpit)/cockpit/cpo/page.tsx` com:

1. **Sprint atual** (topo, destaque):
   - As 3 prioridades da semana (máximo 3)
   - Cada goal com status visual: ⬜ Não iniciado → 🔄 Em progresso → ✅ Concluído
   - Dias restantes no sprint (contador: "3 dias restantes")
   - Prompts executados esta semana
   - Botão "Criar sprint" se não existe sprint ativo
   - Área de retrospectiva (textarea)

2. **Roadmap Kanban** — Colunas visuais (scroll horizontal no mobile):
   - Icebox → Backlog → Sprint → Em progresso → Review → Done
   - Cards do `feature_backlog` distribuídos por `status`
   - Cada card: título, módulo (badge), persona, RICE score, dias na coluna
   - Tap no card abre detalhe/edição inline
   - Botão "+ Feature" para criar nova

3. **Feedback inbox** — Lista de feedbacks:
   - Filtro por status: Novo / Lido / Investigando / Arquivado / Convertido
   - Cada feedback: mensagem (truncada), categoria (badge), rating (estrelas), academia, data
   - Ações: Marcar como lido, Arquivar, Converter em feature (cria item no backlog automaticamente)
   - Contador de feedbacks novos no topo

4. **Personas** — Grid de cards:
   - Cada persona: nome, role, % de features completas (progress bar)
   - Tap abre detalhe com: dores, jobs-to-be-done, key features
   - Editável inline
   - Seeded com os 9 perfis do BlackBelt

5. **Métricas de produto** (quando dados disponíveis):
   - Funil: Lead → Trial → Conversão → Ativo
   - Feature usage por módulo (horizontal bar chart)
   - Buscas sem resultado (gap de conteúdo)

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-04-tab-cpo"
```

---

## BLOCO 5 — TAB CTO (Técnico & Infraestrutura)

Crie `app/(cockpit)/cockpit/cto/page.tsx` com:

1. **Status de infra** (topo, cards de status):
   - Vercel: link direto, último deploy status, URL de produção (`blackbelts.com.br`)
   - Supabase: link direto, projeto `tdplmmodmumryzdosmpv`, indicador de free tier
   - GitHub: link direto `GregoryGSPinto/blackbelt-v2`, último commit
   - Bunny Stream: Library ID `626933`, vídeos totais
   - Cada card com StatusBadge (verde = ok, amarelo = warning, vermelho = down)

2. **Deploy log** — Tabela/lista de deploys:
   - Colunas: data, commit message, branch, tag, status (badge), duração, files changed
   - Últimos 20 deploys
   - Formulário para registrar deploy manualmente (até ter webhook)
   - Link para Vercel dashboard

3. **Error tracking** — Lista de erros:
   - Filtro por status: Novo / Investigando / Resolvido
   - Filtro por severidade: Critical / High / Medium / Low
   - Cada erro: tipo, mensagem, rota afetada, frequência, first/last seen
   - Ações: Investigar, Resolver (pede descrição da resolução), Won't fix
   - Formulário para registrar erro manualmente

4. **Stack & dependências** — Informativo:
   - Versões atuais: Next.js 14, React 18, TypeScript 5, Supabase SDK, Capacitor
   - Checklist de segurança:
     - [ ] Chaves rotacionadas recentemente
     - [ ] RLS ativo em todas as tabelas
     - [ ] Auth check em todas as API routes
     - [ ] Headers de segurança configurados
   - Variáveis de ambiente listadas (SEM valores, só nomes e indicador de onde estão)

5. **Database overview** — Métricas do banco:
   - Contagem de rows por tabela principal (query do Supabase)
   - Total de migrações aplicadas
   - Último backup

6. **Review reports** — Links para `/docs/review/`:
   - Listar os relatórios de revisão existentes
   - Score por dimensão (tabela do RELATORIO_FINAL_100)

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-05-tab-cto"
```

---

## BLOCO 6 — TAB GROWTH (Marketing & Crescimento)

Crie `app/(cockpit)/cockpit/growth/page.tsx` com:

1. **Funil de conversão** (topo):
   - Etapas: Lead/Visitante → Cadastro → Trial 7 dias → Conversão → Ativo
   - Visual de funil com % de conversão entre etapas
   - Dados mock por enquanto (atualizar quando tiver analytics)

2. **Metas de crescimento** — KPI Cards:
   - Academias meta MVP (ex: 20) vs atual
   - MRR meta MVP (ex: R$2.000) vs atual
   - Coaches ativos vs meta
   - Progress bar visual para cada meta

3. **Calendário de conteúdo** — View mensal:
   - Grid de dias do mês com posts planejados
   - Cada item: título, plataforma (ícone), status (badge)
   - Criar novo: título, plataforma, tipo, data planejada, persona target
   - Plataformas: Instagram, TikTok, YouTube, Blog, LinkedIn, WhatsApp, Email

4. **Campanhas & experimentos** — Lista de campanhas:
   - Cada campanha: nome, canal, budget, status, meta vs resultado
   - Learnings section (textarea)
   - Criar nova campanha

5. **Tracker de ASO** (App Store Optimization):
   - Checklist de readiness para Google Play e Apple App Store:
     - [ ] Screenshots reais de dispositivos
     - [ ] Descrição em PT-BR
     - [ ] Keywords definidas
     - [ ] Privacy policy publicada
     - [ ] Data safety form preenchido
     - [ ] Rating target (4.5+)
   - Editável — cada item pode ser marcado como concluído

6. **Canais de aquisição** — Onde estão os leads:
   - Lista manual de canais: Indicação, Instagram, Eventos, Parcerias com federações
   - Para cada canal: leads gerados, conversões, custo
   - CAC por canal

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-06-tab-growth"
```

---

## BLOCO 7 — FORMULÁRIO PÚBLICO DE FEEDBACK

Crie uma rota pública (sem auth) para receber feedback de qualquer usuário do app:

### Rota: `app/(public)/feedback/page.tsx`

Formulário simples:
- Nome (opcional)
- Email (opcional)
- Categoria: Bug, Feature, UX, Performance, Geral, Elogio (select)
- Mensagem (textarea, required)
- Rating 1-5 estrelas (clicável)
- Botão Enviar

Ao enviar:
- Insert na tabela `user_feedback`
- Se o usuário está logado, preenche user_id, user_role, academy_name automaticamente
- Toast: "Obrigado pelo feedback! Vamos analisar em breve."
- Redirect para a página anterior

Adicione link para este formulário no menu do app (todos os perfis).

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-07-feedback-publico"
```

---

## BLOCO 8 — CRON/HELPER PARA MÉTRICAS DIÁRIAS

Crie um helper que pode ser chamado via API route ou cron para popular `daily_metrics`:

### Rota: `app/api/cockpit/snapshot/route.ts`

- Método POST protegido (super_admin ou internal token)
- Conta academies da tabela real (profiles com role=admin, ou academias)
- Conta users ativos (último login em 7 dias)
- Conta checkins do dia
- Insere/atualiza daily_metrics para o dia atual

Isso permite que Gregory rode manualmente pelo cockpit ("Atualizar métricas") até ter um cron real.

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: bloco-08-metricas-snapshot"
```

---

## BLOCO 9 — VERIFICAÇÃO FINAL E TAG

```bash
# TypeScript
npx tsc --noEmit

# Build
pnpm build 2>&1 | tail -15

# Verificar cores hardcoded no cockpit
grep -rn "#[0-9a-fA-F]\{3,8\}" app/\(cockpit\)/ components/cockpit/ --include="*.tsx" | grep -v "var(--" | wc -l

# Verificar acessibilidade
grep -rn "<button" app/\(cockpit\)/ components/cockpit/ --include="*.tsx" | grep -v "aria-label" | wc -l

# Se qualquer número > 0, corrija

git add -A && git commit -m "cockpit: bloco-09-verificacao-final"
git tag -a v3.4.0-cockpit -m "Cockpit do Founder - CEO/CPO/CTO/Growth completo"
git log --oneline -12
echo "========================================="
echo "  COCKPIT DO FOUNDER IMPLEMENTADO"
echo "  Tag: v3.4.0-cockpit"
echo "  Rota: /cockpit"
echo "  Abas: CEO | CPO | CTO | Growth"
echo "========================================="
```

---

## EXECUÇÃO

Comece AGORA pelo Bloco 1 (Schema). Execute cada bloco completamente antes de avançar.

**Regra de ouro do CEO-OS**: Antes de codar, identifique qual "chapéu" cada componente serve. Se não serve a nenhum chapéu (CEO, CPO, CTO, Growth), não construa.

**Contexto do projeto:**
- Projeto: BlackBelt v2
- Stack: Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase
- Supabase project: `tdplmmodmumryzdosmpv`
- Deploy: `blackbelts.com.br`
- CSS variables: `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)`
- Bunny Stream Library: `626933`
- 9 perfis: Super Admin, Admin, Professor, Recepcionista, Aluno Adulto, Teen, Kids, Responsável, Franqueador
- Super Admin credentials: `gregoryguimaraes12@gmail.com` / `BlackBelt@2026` (ou `@Greg1994`)

EXECUTE BLOCO 1 AGORA.
