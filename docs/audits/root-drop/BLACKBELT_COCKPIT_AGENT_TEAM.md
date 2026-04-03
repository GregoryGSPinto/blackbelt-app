# 🥋 BLACKBELT V2 — COCKPIT DO FOUNDER (AGENT TEAM)
# MULTI-AGENT EXECUTION — PARALLELIZED WHERE POSSIBLE
# 4 Abas: CEO · CPO · CTO · Growth

---

Você vai implementar o **Cockpit do Founder** no BlackBelt v2 usando Agent() para paralelizar. São 11 tabelas Supabase, 4 abas completas, formulário público, API de métricas.

## REGRAS ABSOLUTAS

1. `npx tsc --noEmit` = 0 erros após CADA fase
2. Commit entre cada fase
3. NUNCA delete blocos `isMock()`
4. `handleServiceError(error)` ou `logServiceError(error)` em todo catch
5. CSS: `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)` — ZERO cores hardcoded
6. Toast PT-BR em TODA mutação
7. Mobile-first — Gregory acessa pelo celular
8. Componentes cockpit isolados em `components/cockpit/`
9. Dados sensíveis (MRR, custos) NUNCA cacheados — sempre fetch fresh
10. Dark mode padrão

## ORDEM DE EXECUÇÃO

```
FASE 1 (sequencial) → Schema SQL + Service Layer
FASE 2 (sequencial) → Rotas + Layout + Componentes base
FASE 3 (4 AGENTS PARALELOS) → Tab CEO | Tab CPO | Tab CTO | Tab Growth
FASE 4 (sequencial) → Feedback público + API snapshot
FASE 5 (sequencial) → Build + verificação + tag
```

---

# ═══════════════════════════════════════════
# FASE 1 — SCHEMA + SERVICES (Sequencial)
# ═══════════════════════════════════════════

Antes de tudo, leia as migrações existentes:
```bash
ls supabase/migrations/
grep -rn "CREATE TABLE" supabase/migrations/ | head -40
```

Adapte os nomes abaixo para não conflitar com tabelas existentes. Use `IF NOT EXISTS` em tudo.

## 1A — Migração Supabase

Crie `supabase/migrations/037_cockpit.sql` com estas 11 tabelas:

### feature_backlog
```sql
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
```

### operational_costs
```sql
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
```

### architecture_decisions
```sql
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
```

### sprints
```sql
CREATE TABLE IF NOT EXISTS sprints (
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
```

### user_feedback
```sql
CREATE TABLE IF NOT EXISTS user_feedback (
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
```

### cockpit_personas
```sql
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
```

### deploy_log
```sql
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
```

### cockpit_error_log
```sql
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
```

### content_calendar
```sql
CREATE TABLE IF NOT EXISTS content_calendar (
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
```

### campaigns
```sql
CREATE TABLE IF NOT EXISTS campaigns (
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
```

### daily_metrics
```sql
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
```

### RLS, Índices, Triggers, e Seed

Após TODAS as tabelas, adicione:

1. **RLS** — `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policy `super_admin_all_*` FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')) em TODAS as 11 tabelas
2. **Exceção feedback**: policy adicional `authenticated_insert_feedback` ON user_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)
3. **Índices** para: feature_backlog(product, status, pipeline_phase, rice_score DESC), operational_costs(active), sprints(product, week_start), user_feedback(status, product), deploy_log(product, deployed_at DESC), cockpit_error_log(status), daily_metrics(product, date DESC), content_calendar(planned_date), campaigns(status)
4. **Trigger updated_at** em: feature_backlog, operational_costs, architecture_decisions, sprints, user_feedback, cockpit_personas, campaigns
5. **Seed**: Custos operacionais atuais (Vercel $0, Supabase $0, Bunny Stream usage, Apple Dev R$499/ano, Claude Pro R$200/mês), 8 personas dos perfis reais do BlackBelt, 5 ADRs iniciais (stack unificado, cockpit integrado, Bunny Stream, 9 perfis, pricing 5 tiers)

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: fase-1a-schema-supabase-11-tabelas"
```

## 1B — Service Layer Completo

Crie `lib/api/cockpit.service.ts` — UM ARQUIVO com TODAS as funções do cockpit.

Cada função deve ter:
- Interface/type de retorno tipada (ZERO `any`)
- Branch `isMock()` com dados realistas
- Branch real com query Supabase otimizada (NÃO `select('*')` — selecionar só as colunas usadas)
- `handleServiceError(error)` ou `logServiceError(error)` no catch
- Return type explícito

### Funções necessárias (IMPLEMENTE TODAS):

**CEO:**
- `getKpiSnapshot(product)` → KpiSnapshot (academias, users, mrr, churn, deltas)
- `getFeatureBacklog(product, filters?)` → FeatureBacklogItem[]
- `createFeature(data)` → FeatureBacklogItem
- `updateFeature(id, data)` → FeatureBacklogItem
- `deleteFeature(id)` → boolean
- `moveFeatureStatus(id, newStatus)` → boolean
- `getOperationalCosts(product)` → OperationalCost[]
- `createCost(data)` → OperationalCost
- `updateCost(id, data)` → OperationalCost
- `deleteCost(id)` → boolean
- `getTotalMonthlyCost(product)` → number
- `getArchitectureDecisions(product)` → ArchitectureDecision[]
- `createADR(data)` → ArchitectureDecision
- `updateADR(id, data)` → ArchitectureDecision

**CPO:**
- `getCurrentSprint(product)` → Sprint | null
- `getSprints(product, limit?)` → Sprint[]
- `createSprint(data)` → Sprint
- `updateSprint(id, data)` → Sprint
- `getUserFeedback(product, status?)` → UserFeedbackItem[]
- `updateFeedbackStatus(id, status, notes?)` → boolean
- `convertFeedbackToFeature(feedbackId, featureTitle)` → string (new feature id)
- `submitPublicFeedback(data)` → boolean
- `getPersonas(product)` → PersonaItem[]
- `updatePersona(id, data)` → PersonaItem
- `getFeedbackCount(product, status)` → number

**CTO:**
- `getDeployLog(product, limit?)` → DeployLogItem[]
- `createDeployEntry(data)` → DeployLogItem
- `getErrorLog(product, status?)` → ErrorLogItem[]
- `createError(data)` → ErrorLogItem
- `updateErrorStatus(id, status, resolution?)` → boolean
- `getTableRowCounts()` → Array<{table: string, count: number}>

**Growth:**
- `getContentCalendar(product, month?, year?)` → ContentCalendarItem[]
- `createContent(data)` → ContentCalendarItem
- `updateContent(id, data)` → ContentCalendarItem
- `deleteContent(id)` → boolean
- `getCampaigns(product, status?)` → CampaignItem[]
- `createCampaign(data)` → CampaignItem
- `updateCampaign(id, data)` → CampaignItem

**Snapshot:**
- `generateDailySnapshot(product)` → boolean (agrega métricas do dia)

### Types (defina no topo do arquivo):

```ts
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
  id: string; product: string; category: string; name: string;
  description: string | null; amount_brl: number; frequency: string;
  active: boolean; start_date: string | null; end_date: string | null;
}

export interface ArchitectureDecision {
  id: string; product: string; adr_number: number; title: string;
  status: string; context: string | null; options_considered: Array<{option: string; pros: string; cons: string}>;
  decision: string | null; consequences: string | null; created_at: string;
}

export interface Sprint {
  id: string; product: string; week_start: string; week_end: string;
  goals: Array<{title: string; status: string; feature_id?: string}>;
  velocity: number; prompts_executed: number; notes: string | null;
  retrospective: string | null;
}

export interface UserFeedbackItem {
  id: string; product: string; user_name: string | null; user_email: string | null;
  user_role: string | null; academy_name: string | null; category: string;
  message: string; rating: number | null; status: string;
  converted_to: string | null; internal_notes: string | null; created_at: string;
}

export interface DeployLogItem {
  id: string; product: string; commit_sha: string | null;
  commit_message: string | null; branch: string; tag: string | null;
  status: string; duration_seconds: number | null; files_changed: number | null;
  lines_added: number | null; lines_removed: number | null;
  vercel_url: string | null; deployed_at: string;
}

export interface ErrorLogItem {
  id: string; product: string; error_type: string | null; severity: string;
  message: string; affected_route: string | null; frequency: number;
  status: string; first_seen: string; last_seen: string; resolution: string | null;
}

export interface ContentCalendarItem {
  id: string; product: string; title: string; platform: string;
  content_type: string | null; planned_date: string | null; status: string;
  published_url: string | null; target_persona: string | null; notes: string | null;
}

export interface CampaignItem {
  id: string; product: string; name: string; channel: string | null;
  budget_brl: number; status: string; start_date: string | null;
  end_date: string | null; goal: string | null; target_metric: string | null;
  target_value: number | null; actual_value: number | null;
  result: string | null; learnings: string | null;
}

export interface PersonaItem {
  id: string; name: string; role_in_app: string | null; description: string | null;
  pains: string[]; jobs_to_be_done: string[]; key_features: string[];
  feature_completion_pct: number;
}
```

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: fase-1b-service-layer-completo"
```

---

# ═══════════════════════════════════════════
# FASE 2 — ROTAS + LAYOUT + COMPONENTES (Sequencial)
# ═══════════════════════════════════════════

## 2A — Estrutura de rotas

Crie a árvore completa:
```
app/(cockpit)/
  └── cockpit/
      ├── layout.tsx
      ├── page.tsx          → redirect para /cockpit/ceo
      ├── loading.tsx
      ├── error.tsx
      ├── not-found.tsx
      ├── ceo/
      │   └── page.tsx      → placeholder "CEO tab - será preenchido na Fase 3"
      ├── cpo/
      │   └── page.tsx      → placeholder
      ├── cto/
      │   └── page.tsx      → placeholder
      └── growth/
          └── page.tsx      → placeholder
```

## 2B — Layout do Cockpit

`app/(cockpit)/cockpit/layout.tsx` — Layout INDEPENDENTE do app principal:

- Header: botão voltar (→ /superadmin) + título "Cockpit" + subtítulo "Painel do Founder" + sino de notificações
- Tab bar horizontal: CEO (Crown) | CPO (Lightbulb) | CTO (Server) | Growth (TrendingUp)
- Tab ativa com indicador visual (barra colorida embaixo)
- Mobile-first: tabs com scroll horizontal se necessário
- Todas as cores via CSS variables
- aria-labels em todos os botões

## 2C — Middleware

Leia `middleware.ts` e adicione `/cockpit` ao grupo de rotas protegidas por `super_admin`.

## 2D — Link no sidebar do Super Admin

Busque o shell/sidebar do Super Admin e adicione ícone de Cockpit (Crown ou Rocket) que linka para `/cockpit`.

## 2E — Componentes reutilizáveis

Crie em `components/cockpit/`:

### KpiCard.tsx
Card com: título (uppercase, small), valor (large, bold), delta (arrow + %, verde/vermelho), ícone opcional. Loading state com skeleton. Tudo via CSS variables.

### StatusBadge.tsx
Badge colorido: verde (sucesso/ativo), amarelo (warning/pendente), vermelho (erro/inativo), azul (info). Props: `label`, `variant`.

### RiceScorer.tsx
3 inputs numéricos (1-5): Impacto, Urgência, Esforço. Cálculo automático: `impact*3 + urgency*2 + effort*1`. Resultado visual: score ≥20 verde, 15-19 amarelo, <15 vermelho. Inline, compacto para funcionar dentro de cards.

### MiniChart.tsx
Wrapper fino sobre Recharts LineChart/BarChart. Props: `data`, `type: 'line' | 'bar'`, `height`, `color`. Sem eixos, sem legenda — só a curva/barras. Usado dentro de KpiCards.

### EmptyState.tsx
Ícone (Lucide) + título + descrição + CTA button opcional. Tudo centralizado, CSS variables.

### SectionHeader.tsx
Título da seção + botão de ação à direita. Props: `title`, `action?: {label, onClick, icon}`.

### ConfirmDialog.tsx
Modal de confirmação para ações destrutivas. Overlay escuro + card branco + título + mensagem + Cancelar/Confirmar. Props: `open`, `onClose`, `onConfirm`, `title`, `message`, `confirmLabel`, `variant: 'danger' | 'warning'`.

### CockpitSkeleton.tsx
Skeleton loading padrão: 6 KPI cards + seção com 5 linhas. Usado nos loading.tsx das abas.

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: fase-2-rotas-layout-componentes"
```

---

# ═══════════════════════════════════════════
# FASE 3 — 4 TABS EM PARALELO (Agent Teams)
# ═══════════════════════════════════════════

Execute estas 4 implementações em PARALELO usando Agent():

```
Agent("Cockpit Tab CEO — Dashboard Executivo")
Agent("Cockpit Tab CPO — Produto & Roadmap")
Agent("Cockpit Tab CTO — Técnico & Infra")
Agent("Cockpit Tab Growth — Marketing & Crescimento")
```

Cada Agent recebe as instruções abaixo para sua aba específica. Todos usam os componentes de `components/cockpit/` e o service de `lib/api/cockpit.service.ts` criados nas fases anteriores.

---

## AGENT: Tab CEO — Dashboard Executivo

**Arquivo**: `app/(cockpit)/cockpit/ceo/page.tsx`

**Propósito**: Visão de 30 segundos do estado do negócio. Gregory abre toda segunda de manhã.

### Seções (de cima para baixo):

**1. KPI Cards** — Grid `grid-cols-2 md:grid-cols-3 gap-3`:
- Academias ativas (ícone Building2, delta vs semana anterior)
- Academias em trial (ícone Clock)
- Total de usuários (ícone Users)
- Usuários ativos 7d (ícone Activity)
- MRR (ícone DollarSign, formato `R$ X.XXX`)
- NPS Score (ícone Star)
Use `getKpiSnapshot('blackbelt')`. Cada card é `<KpiCard />`.

**2. Gráfico de Receita** — MiniChart line com dados dos últimos 6 meses:
- Buscar de `daily_metrics` agrupado por mês
- Se mock, gerar 6 pontos de dados crescentes
- `<SectionHeader title="Receita (MRR)" />`

**3. CEO Filter Board** — Feature backlog com RICE:
- `<SectionHeader title="CEO Filter" action={{label: "Nova Feature", icon: Plus}} />`
- Lista de features do `getFeatureBacklog('blackbelt')`
- Cada item mostra: título, módulo (badge), `<RiceScorer />` inline editável, pipeline_phase (badge)
- Botões por item: "Ship it" (→ status='sprint'), "Icebox" (→ status='icebox'), "Kill" (→ status='killed', com `<ConfirmDialog />`)
- Ordenado por rice_score DESC
- Filtro por status no topo (pills: Todos | Backlog | Sprint | Icebox | Shipped | Killed)
- Modal/inline form para criar feature: título, descrição, módulo (select), persona (select), RICE scores
- Empty state quando lista vazia

**4. Controle de Custos** — Operational costs:
- `<SectionHeader title="Custos Operacionais" action={{label: "Novo Custo", icon: Plus}} />`
- Lista: nome, categoria (badge), valor formatado (R$), frequência, toggle ativo/inativo
- Total mensal no topo: soma de (monthly) + (yearly/12) + (usage_based estimado)
- Runway calculator: se MRR > 0, mostrar "Break-even: X assinantes no plano [mais popular]"
- Formulário inline para adicionar: nome, categoria (select), valor, frequência (select)
- Delete com confirmação

**5. ADR Feed** — Architecture decisions:
- `<SectionHeader title="Decisões (ADR)" action={{label: "Nova ADR", icon: Plus}} />`
- Lista cronológica: `ADR-{number}: {title}` + StatusBadge + data
- Cada item expansível (accordion): contexto, decisão, consequências
- Modal para criar: título, produto (select), contexto, decisão, consequências
- Editar status (dropdown: proposed → accepted → deprecated)

**Tudo com**: loading skeleton, empty states, toast PT-BR, confirmação em destrutivas, CSS variables only, mobile-first.

---

## AGENT: Tab CPO — Produto & Roadmap

**Arquivo**: `app/(cockpit)/cockpit/cpo/page.tsx`

**Propósito**: Onde Gregory planeja o que construir, organiza roadmap, coleta feedback.

### Seções:

**1. Sprint Atual** (card de destaque no topo):
- Se existe sprint da semana: mostrar goals com status visual (⬜→🔄→✅), dias restantes ("3 dias"), velocity, prompts executados
- Cada goal clicável para alternar status (not_started → in_progress → done)
- Área de notas e retrospectiva (textarea expansível)
- Se NÃO existe sprint: botão "Criar Sprint da Semana" que auto-preenche week_start (segunda) e week_end (sexta)
- 3 inputs para goals (máximo 3 — regra do CEO-OS)
- Histórico: últimos 4 sprints com velocity (linha de tendência se possível)

**2. Roadmap Kanban** — Colunas visuais:
- Colunas: Icebox | Backlog | Sprint | Em Progresso | Review | Done
- Cards do `feature_backlog` filtrados por `status`
- Cada card: título (bold), módulo (badge pequeno), persona (text muted), RICE score (número), "há X dias" (tempo na coluna)
- Scroll horizontal no mobile
- Tap em card → edição inline (título, descrição, módulo, persona, RICE)
- Botão "+" em cada coluna para criar feature naquele status
- Contagem de items por coluna no header

**3. Feedback Inbox**:
- `<SectionHeader title="Feedback" />`
- Filtro por pills: Novo (com contagem badge) | Lido | Investigando | Arquivado | Convertido
- Cada feedback: ícone por categoria, mensagem (truncada 2 linhas), nome + academia, rating (estrelas), data relativa ("há 2 dias")
- Ações em cada feedback: Marcar como Lido (eye icon), Arquivar (archive icon), Converter em Feature (lightbulb icon — abre modal para definir título da feature, cria automaticamente no backlog)
- Tap para expandir mensagem completa + campo de notas internas
- Contagem de novos no badge do SectionHeader

**4. Personas** — Grid de cards (2 cols mobile, 3 cols desktop):
- Cada persona: avatar/ícone, nome, role badge, progress bar (feature_completion_pct)
- Tap abre detalhe: dores (lista), jobs-to-be-done (lista), key features (lista com checkboxes visuais)
- Botão editar: todos os campos editáveis
- Seeded com os 8 perfis do BlackBelt (Admin, Professor, Aluno Adulto, Teen, Kids, Responsável, Recepcionista, Franqueador)

**5. Métricas de Produto** (seção menor, dados quando disponíveis):
- Funil visual: Lead → Trial → Conversão → Ativo (barras horizontais decrescentes)
- Top módulos mais usados (horizontal bar chart mock)
- Placeholder: "Dados reais disponíveis após integrar analytics"

---

## AGENT: Tab CTO — Técnico & Infra

**Arquivo**: `app/(cockpit)/cockpit/cto/page.tsx`

**Propósito**: Saúde técnica. O que está rodando, o que está quebrando.

### Seções:

**1. Status de Infra** — Grid de cards (2x2):
- **Vercel**: StatusBadge verde, link `blackbelts.com.br`, "Hobby Tier"
- **Supabase**: StatusBadge verde, projeto `tdplmmodmumryzdosmpv`, "Free Tier"
- **GitHub**: StatusBadge verde, link `GregoryGSPinto/blackbelt-v2`, branch `main`
- **Bunny Stream**: StatusBadge verde, Library ID `626933`, CDN host
- Cada card com ícone, nome, status, link externo (ExternalLink icon), tier/plano

**2. Deploy Log**:
- `<SectionHeader title="Deploys" action={{label: "Registrar Deploy", icon: Plus}} />`
- Lista dos últimos 20 deploys: data (relativa), commit message (truncada), branch, tag (badge se existir), status (StatusBadge), duração ("2m 31s"), files changed
- Formulário para registrar manualmente: commit SHA, mensagem, branch, tag, status, duração, files/lines
- Link externo para Vercel dashboard

**3. Error Tracking**:
- `<SectionHeader title="Erros" action={{label: "Registrar Erro", icon: Plus}} />`
- Filtro pills: Novo | Investigando | Resolvido | Won't Fix
- Filtro severidade: Critical (vermelho) | High (laranja) | Medium (amarelo) | Low (cinza)
- Cada erro: tipo (badge), severidade (badge), mensagem, rota afetada, frequência ("X ocorrências"), first/last seen
- Ações: Investigar, Resolver (pede resolução em textarea), Won't Fix (com confirmação)
- Formulário para registrar: tipo, severidade, mensagem, rota, stack trace

**4. Stack & Dependências** — Card informativo:
- Versões: Next.js 14.x, React 18.x, TypeScript 5.x, @supabase/ssr X.x, Capacitor X.x
- Ler versões de `package.json` se possível, ou hardcode
- Checklist de segurança (visual, não interativo — informativo):
  - ✅ RLS ativo em todas as tabelas
  - ✅ Auth check em API routes (11 routes protegidas)
  - ✅ Headers de segurança (X-Frame-Options, etc.)
  - ✅ Rate limiting em routes críticas
  - ⚠️ Sentry não configurado (placeholder)
  - ⚠️ Chaves não rotacionadas desde setup

**5. Database Overview**:
- Chamar `getTableRowCounts()` — listar top 20 tabelas com contagem de rows
- Total de migrações: contar arquivos em `supabase/migrations/`
- Tag atual do projeto (buscar do git ou hardcode v3.3.0-100-score)

**6. Variáveis de Ambiente** — Lista informativa (SEM valores):
- Listar nomes das env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, BUNNY_API_KEY, etc.
- Indicador: 🟢 No Vercel | 🟡 Só local | 🔴 Não configurada
- Lista estática baseada no que o projeto usa

---

## AGENT: Tab Growth — Marketing & Crescimento

**Arquivo**: `app/(cockpit)/cockpit/growth/page.tsx`

**Propósito**: Tudo que leva gente pro produto e mantém.

### Seções:

**1. Metas de Crescimento** — KPI Cards (grid 2x2):
- Academias: meta MVP 20 vs atual (progress bar)
- MRR: meta MVP R$2.000 vs atual (progress bar)
- Coaches ativos: meta 40 vs atual
- NPS: meta >30 vs atual
- Cada card com progress bar visual + % do target

**2. Funil de Conversão** — Visual de funil:
- Lead/Visitante → Cadastro → Trial 7d → Conversão → Ativo
- Barras horizontais decrescentes com % de conversão entre etapas
- Dados mock por enquanto com nota "Dados reais após integrar analytics"
- Visual clean, cores gradiente do brand

**3. Calendário de Conteúdo** — View mensal:
- Grid de 7 colunas (Dom-Sáb) com dias do mês
- Cada dia mostra dots/badges de conteúdo planejado
- Tap no dia mostra lista de conteúdos daquele dia
- Criar novo: título, plataforma (select com ícones: Instagram, TikTok, YouTube, Blog, LinkedIn, WhatsApp, Email), tipo (select), data, persona target, notas
- Filtro por plataforma (pills com ícones)
- Status visual por cor: idea (cinza), planned (azul), creating (amarelo), ready (verde), published (verde escuro), cancelled (vermelho)

**4. Campanhas & Experimentos**:
- `<SectionHeader title="Campanhas" action={{label: "Nova Campanha", icon: Plus}} />`
- Cada campanha: nome, canal (badge), budget (R$), status (StatusBadge), meta vs resultado (progress bar se tem target)
- Expandível: goal, resultado, learnings
- Formulário: nome, canal (select), budget, meta, target metric/value, datas

**5. ASO Checklist** — Readiness para stores:
- Lista de checkboxes visuais (não persiste em DB — local state ou hardcode):
  - [ ] Screenshots reais Android
  - [ ] Screenshots reais iOS
  - [ ] Descrição PT-BR Google Play
  - [ ] Descrição PT-BR App Store
  - [ ] Keywords definidas
  - [ ] Privacy policy publicada (/politica-privacidade)
  - [ ] Termos de uso publicados (/termos-uso)
  - [ ] Data safety form (Google)
  - [ ] App Review guidelines compliance (Apple)
  - [ ] Ícone 512x512 e 1024x1024
  - [ ] Feature graphic (Google Play)
- Progress: "X de Y concluídos"

**6. Canais de Aquisição** — Lista manual:
- Canais: Indicação, Instagram, Eventos/Competições, Parcerias com Federações, Google/SEO, Outbound direto
- Para cada: leads, conversões, custo, CAC calculado
- Dados mock — editável quando tiver dados reais

---

Após os 4 Agents concluírem, faça:
```bash
npx tsc --noEmit  # DEVE ser 0 erros
# Se algum Agent introduziu erros, corrija aqui
git add -A && git commit -m "cockpit: fase-3-4-tabs-completas-ceo-cpo-cto-growth"
```

---

# ═══════════════════════════════════════════
# FASE 4 — FEEDBACK PÚBLICO + API (Sequencial)
# ═══════════════════════════════════════════

## 4A — Formulário público de feedback

Crie `app/(public)/feedback/page.tsx` — acessível SEM login:

- Campo: Nome (opcional, text)
- Campo: Email (opcional, email)
- Campo: Categoria (select: Bug, Sugestão, UX, Performance, Geral, Elogio)
- Campo: Mensagem (textarea, required, min 10 chars)
- Campo: Rating 1-5 estrelas (clicável, visual)
- Botão: "Enviar Feedback"

Ao enviar:
- Chama `submitPublicFeedback()` do cockpit.service
- Se usuário logado: preenche user_id, user_role, academy_name automaticamente
- Toast sucesso: "Obrigado pelo seu feedback! Vamos analisar em breve. 🙏"
- Toast erro: "Erro ao enviar feedback. Tente novamente."
- Após sucesso: limpa form

Adicione link "Dar feedback" no menu/footer de TODOS os perfis (verificar onde fica o menu principal).

## 4B — API de snapshot de métricas

Crie `app/api/cockpit/snapshot/route.ts`:

- Método: POST
- Auth: verificar super_admin OU internal token (header `x-internal-token`)
- Lógica:
  1. Contar academias (total, active, trial) da tabela real de academias/profiles
  2. Contar users (total, ativos últimos 7 dias, novos hoje)
  3. Contar checkins do dia
  4. Contar turmas ativas
  5. Calcular MRR (soma de pagamentos ativos — se tabela de pagamentos existir)
  6. Upsert em `daily_metrics` para a data atual
- Response: `{ success: true, date: '2026-03-29', metrics: {...} }`
- Se tabelas de origem não existirem, usar valores 0 sem quebrar

Adicione botão "Atualizar Métricas" na tab CEO que chama este endpoint.

```bash
npx tsc --noEmit
git add -A && git commit -m "cockpit: fase-4-feedback-publico-api-snapshot"
```

---

# ═══════════════════════════════════════════
# FASE 5 — VERIFICAÇÃO FINAL + TAG (Sequencial)
# ═══════════════════════════════════════════

```bash
# TypeScript
npx tsc --noEmit

# Build completo
pnpm build 2>&1 | tail -20

# Se build falhar, corrija TUDO antes de continuar

# Verificações de qualidade
echo "=== Cores hardcoded no cockpit ==="
grep -rn "#[0-9a-fA-F]\{3,8\}" "app/(cockpit)/" components/cockpit/ --include="*.tsx" 2>/dev/null | grep -v "var(--" | wc -l

echo "=== Botões sem aria-label ==="
grep -rn "<button" "app/(cockpit)/" components/cockpit/ --include="*.tsx" 2>/dev/null | grep -v "aria-label" | wc -l

echo "=== Inglês na UI do cockpit ==="
grep -rn '"Submit\|"Cancel\|"Delete\|"Save\|"Loading\|"Error"' "app/(cockpit)/" components/cockpit/ --include="*.tsx" 2>/dev/null | grep -v "console\|import\|aria-" | wc -l

echo "=== catch sem error handling ==="
grep -rn "catch" lib/api/cockpit.service.ts -A2 | grep -v "handleServiceError\|logServiceError" | grep "catch" | wc -l

# Se QUALQUER contagem > 0, corrija antes de continuar

# Commit e tag
git add -A && git commit -m "cockpit: fase-5-verificacao-final"
git tag -a v3.4.0-cockpit -m "Cockpit do Founder - CEO/CPO/CTO/Growth - 11 tabelas, 4 abas, feedback público"
git log --oneline -12

echo "========================================="
echo "  🥋 COCKPIT DO FOUNDER IMPLEMENTADO"
echo "  Tag: v3.4.0-cockpit"
echo "  Rota: /cockpit (super_admin only)"
echo "  Abas: CEO | CPO | CTO | Growth"
echo "  Tabelas: 11 novas"
echo "  Services: 35+ funções"
echo "  Feedback: /feedback (público)"
echo "========================================="
```

---

## RESUMO DE EXECUÇÃO

| Fase | Tipo | O que faz | Agent? |
|------|------|-----------|--------|
| 1A | Sequencial | Schema SQL 11 tabelas + RLS + seed | Não |
| 1B | Sequencial | Service layer 35+ funções | Não |
| 2 | Sequencial | Rotas + layout + 8 componentes base | Não |
| 3 | **4 PARALELOS** | Tab CEO + Tab CPO + Tab CTO + Tab Growth | **SIM** |
| 4A | Sequencial | Formulário público de feedback | Não |
| 4B | Sequencial | API de snapshot de métricas | Não |
| 5 | Sequencial | Build + verificação + tag v3.4.0-cockpit | Não |

**Dependências**: Fase 1 → Fase 2 → Fase 3 (paralela) → Fase 4 → Fase 5

COMECE AGORA PELA FASE 1A.
