# BLACKBELT v2 — SUPER ADMIN: GESTÃO DE PLANOS & VALORES
## Prompt Multi-Agente (Team) para Claude Code (Opus)

> **Objetivo:** Garantir que o Super Admin consiga criar, editar, ativar/desativar planos e alterar valores cobrados das academias. Se a funcionalidade existir mas estiver escondida, tornar visível. Se não existir, criar do zero.

---

## CONTEXTO

- **Repo:** `GregoryGSPinto/blackbelt-v2`
- **Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase
- **Supabase project:** `tdplmmodmumryzdosmpv`
- **CSS vars:** `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)`
- **Login Super Admin:** `greg@email.com` / `BlackBelt@Greg1994`
- **Rota esperada:** `/superadmin/planos`
- **Shell:** SuperAdminShell (sidebar dourado)
- **Regra:** `isMock()` branching em todos os services, `handleServiceError()` em todos os catch blocks
- **UI:** PT-BR, zero inglês visível, skeleton loading, empty states, mobile-first, 44px touch targets

### PLANOS ATUAIS (fonte de verdade — usar ESTES valores):

| Plano | Preço/mês | Alunos | Unidades | Professores | Trial |
|-------|-----------|--------|----------|-------------|-------|
| Starter | R$ 79 | 50 | 1 | 2 | 7 dias Black Belt |
| Essencial | R$ 149 | 100 | 1 | 5 | 7 dias Black Belt |
| Pro ⭐ | R$ 249 | 200 | 2 | Ilimitados | 7 dias Black Belt |
| Black Belt | R$ 397 | Ilimitados | Ilimitados | Ilimitados | 7 dias Black Belt |
| Enterprise | Sob consulta | Ilimitados | Ilimitados | Ilimitados | Negociável |

### FEATURES POR PLANO:

**Starter:** gestão de alunos, check-in, financeiro básico, agenda, notificações, biblioteca de vídeos
**Essencial:** + streaming library, certificados digitais, relatórios avançados, comunicação com responsáveis, app do aluno
**Pro:** + módulo Compete (campeonatos), gamificação teen, currículo técnico, match analysis, estoque, contratos digitais
**Black Belt:** + painel franqueador, white-label, API access, suporte prioritário, relatórios consolidados multi-unidade
**Enterprise:** + SLA dedicado, onboarding assistido, customizações, integração com sistemas legados

### REGRAS DE EXCEDENTE:
- 80% do limite → alerta warning (amarelo)
- 90% do limite → alerta critical (vermelho)
- 100%+ → permite excedente, NÃO bloqueia, cobra no fim do mês
- Excedente aluno: R$ 3/aluno/mês
- Excedente professor: R$ 15/prof/mês
- Excedente unidade: R$ 49/unidade/mês
- Excedente storage: R$ 0,50/GB/mês acima do incluso

---

## EXECUÇÃO: 5 AGENTES SEQUENCIAIS

Cada agente executa suas tarefas, verifica resultado, e commita antes de passar pro próximo.

---

### 🔍 AGENTE 1 — AUDITOR (Diagnóstico)

**Missão:** Mapear TUDO que já existe sobre planos/pricing no codebase.

```bash
echo "=== AGENTE 1: AUDITOR ==="

# 1. Buscar QUALQUER referência a planos/pricing
echo "--- Referências a planos/pricing ---"
grep -rn "planos\|pricing\|Pricing\|plans\|Plans\|Starter\|Essencial\|Enterprise\|Black.Belt\|BlackBelt.*plan\|subscription\|assinatura" app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v .next | head -60

# 2. Buscar rota /superadmin/planos
echo "--- Rota /superadmin/planos ---"
find app -path "*superadmin*plano*" -type f 2>/dev/null
find app -path "*superadmin*pricing*" -type f 2>/dev/null
find app -path "*superadmin*plan*" -type f 2>/dev/null

# 3. Buscar types de planos
echo "--- Types de planos ---"
grep -rn "type Plan\|interface Plan\|PlanTier\|PlanType\|SubscriptionPlan\|BillingPlan" lib/ --include="*.ts" --include="*.tsx" | head -20

# 4. Buscar service de planos
echo "--- Services de planos ---"
find lib -name "*plan*" -o -name "*pricing*" -o -name "*billing*" -o -name "*subscription*" 2>/dev/null

# 5. Buscar mock de planos
echo "--- Mocks de planos ---"
find lib/mocks -name "*plan*" -o -name "*pricing*" -o -name "*billing*" 2>/dev/null

# 6. Buscar migration de planos no Supabase
echo "--- Migrations de planos ---"
grep -rn "plans\|planos\|pricing\|subscription" supabase/migrations/ --include="*.sql" | head -20

# 7. Buscar no sidebar do SuperAdmin se "Planos" aparece
echo "--- Sidebar SuperAdmin ---"
grep -rn "plano\|Plano\|pricing\|Pricing" components/shell/ --include="*.tsx" | head -10

# 8. Buscar valores hardcoded
echo "--- Valores hardcoded ---"
grep -rn "R\$.*79\|R\$.*97\|R\$.*149\|R\$.*197\|R\$.*249\|R\$.*347\|R\$.*397\|R\$.*597\|99,90\|199,90\|499,90" app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v node_modules | head -30
```

**Decisão baseada no resultado:**

- Se `/superadmin/planos/page.tsx` EXISTE e tem conteúdo funcional → Agente 2 verifica se está visível no sidebar e se os valores estão corretos
- Se NÃO EXISTE ou está vazio/placeholder → Agente 3 cria do zero
- Se EXISTE mas com valores desatualizados → Agente 2 atualiza

**Gerar relatório:** `docs/review/pricing-audit.md` com status de cada item encontrado.

```bash
git add docs/review/pricing-audit.md
git commit -m "audit: pricing module diagnostic report"
```

---

### 🔧 AGENTE 2 — CORRETOR (Atualização & Visibilidade)

**Missão:** Se a página existe, garantir que (a) está visível no sidebar, (b) tem os valores corretos, (c) CRUD funciona.

**Tarefas:**

1. **Verificar sidebar do SuperAdminShell:**
   ```bash
   grep -n "plano\|Plano\|DollarSign\|CreditCard\|Banknote" components/shell/SuperAdminShell.tsx
   ```
   - Se "Planos" NÃO está no sidebar → ADICIONAR item com ícone `DollarSign` (lucide-react), rota `/superadmin/planos`, label "Planos"
   - Se está mas com `hidden`, `display: none`, `// comentado` → REMOVER a ocultação

2. **Verificar se os valores estão corretos conforme tabela acima**
   - Se algum valor está diferente (ex: R$97 em vez de R$79) → ATUALIZAR para os valores da tabela acima
   - Atualizar em TODOS os lugares: types, mocks, constantes, componentes

3. **Verificar se features por plano estão corretas conforme lista acima**

4. **Verificar se excedentes estão definidos conforme regras acima**

5. **Se tudo está correto e visível:**
   ```bash
   pnpm typecheck && pnpm build
   git add -A
   git commit -m "fix: pricing page visibility and values updated to current spec"
   ```
   → Pular para Agente 4

6. **Se a página NÃO existe:** → Passar para Agente 3

---

### 🏗️ AGENTE 3 — CONSTRUTOR (Criar do Zero)

**Missão:** Criar o módulo completo de gestão de planos pelo Super Admin.

#### PASSO 3.1 — Types

Criar/atualizar `lib/types/plan.ts`:

```typescript
export type PlanTier = 'starter' | 'essencial' | 'pro' | 'blackbelt' | 'enterprise';

export interface PlanFeature {
  id: string;
  name: string;        // PT-BR
  description: string; // PT-BR
  included: boolean;
}

export interface PlanLimits {
  max_alunos: number | null;       // null = ilimitado
  max_professores: number | null;  // null = ilimitado
  max_unidades: number | null;     // null = ilimitado
  max_storage_gb: number;
  max_turmas: number | null;
}

export interface PlanOverageRates {
  aluno_extra: number;      // R$ por aluno/mês
  professor_extra: number;  // R$ por prof/mês
  unidade_extra: number;    // R$ por unidade/mês
  storage_extra_gb: number; // R$ por GB/mês
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;           // "Starter", "Essencial", "Pro", "Black Belt", "Enterprise"
  price_monthly: number;  // em centavos (7900 = R$79). Enterprise = 0 (sob consulta)
  price_display: string;  // "R$ 79/mês" ou "Sob consulta"
  is_custom_price: boolean; // true para Enterprise
  limits: PlanLimits;
  overage_rates: PlanOverageRates;
  features: PlanFeature[];
  is_popular: boolean;    // true apenas para Pro
  is_active: boolean;     // Super Admin pode desativar plano
  trial_days: number;     // 7
  trial_tier: PlanTier;   // 'blackbelt' — trial dá acesso Black Belt
  sort_order: number;     // 1-5 para ordenação
  created_at: string;
  updated_at: string;
}

export interface PlanFormData {
  name: string;
  tier: PlanTier;
  price_monthly: number;
  is_custom_price: boolean;
  limits: PlanLimits;
  overage_rates: PlanOverageRates;
  features: string[];     // IDs das features incluídas
  is_popular: boolean;
  is_active: boolean;
  trial_days: number;
}
```

#### PASSO 3.2 — Constantes de Features

Criar `lib/constants/plan-features.ts`:

```typescript
export const ALL_FEATURES = [
  { id: 'gestao_alunos', name: 'Gestão de Alunos', category: 'core' },
  { id: 'checkin', name: 'Check-in', category: 'core' },
  { id: 'financeiro_basico', name: 'Financeiro Básico', category: 'core' },
  { id: 'agenda', name: 'Agenda', category: 'core' },
  { id: 'notificacoes', name: 'Notificações', category: 'core' },
  { id: 'biblioteca_videos', name: 'Biblioteca de Vídeos', category: 'core' },
  { id: 'streaming_library', name: 'Streaming Library', category: 'essencial' },
  { id: 'certificados_digitais', name: 'Certificados Digitais', category: 'essencial' },
  { id: 'relatorios_avancados', name: 'Relatórios Avançados', category: 'essencial' },
  { id: 'comunicacao_responsaveis', name: 'Comunicação com Responsáveis', category: 'essencial' },
  { id: 'app_aluno', name: 'App do Aluno', category: 'essencial' },
  { id: 'compete', name: 'Módulo Compete (Campeonatos)', category: 'pro' },
  { id: 'gamificacao_teen', name: 'Gamificação Teen', category: 'pro' },
  { id: 'curriculo_tecnico', name: 'Currículo Técnico', category: 'pro' },
  { id: 'match_analysis', name: 'Match Analysis', category: 'pro' },
  { id: 'estoque', name: 'Estoque', category: 'pro' },
  { id: 'contratos_digitais', name: 'Contratos Digitais', category: 'pro' },
  { id: 'franqueador', name: 'Painel Franqueador', category: 'blackbelt' },
  { id: 'white_label', name: 'White-Label', category: 'blackbelt' },
  { id: 'api_access', name: 'API Access', category: 'blackbelt' },
  { id: 'suporte_prioritario', name: 'Suporte Prioritário', category: 'blackbelt' },
  { id: 'relatorios_multi_unidade', name: 'Relatórios Multi-Unidade', category: 'blackbelt' },
  { id: 'sla_dedicado', name: 'SLA Dedicado', category: 'enterprise' },
  { id: 'onboarding_assistido', name: 'Onboarding Assistido', category: 'enterprise' },
  { id: 'customizacoes', name: 'Customizações', category: 'enterprise' },
  { id: 'integracao_legados', name: 'Integração Sistemas Legados', category: 'enterprise' },
] as const;
```

#### PASSO 3.3 — Mock Data

Criar `lib/mocks/plans.mock.ts` com os 5 planos conforme tabela acima, usando os types criados no Passo 3.1. Cada plano com todas as features corretas, limites, preços em centavos, overage rates.

#### PASSO 3.4 — Service

Criar `lib/api/plans.service.ts`:

```typescript
// Funções:
// - getPlans(): Plan[] — lista todos os planos (ativos e inativos)
// - getActivePlans(): Plan[] — lista só os ativos (para onboarding)
// - getPlanById(id: string): Plan | null
// - getPlanByTier(tier: PlanTier): Plan | null
// - createPlan(data: PlanFormData): Plan — APENAS Super Admin
// - updatePlan(id: string, data: Partial<PlanFormData>): Plan — APENAS Super Admin
// - togglePlanActive(id: string): Plan — ativa/desativa
// - deletePlan(id: string): void — soft delete (is_active = false)

// TODAS as funções com isMock() branching
// TODOS os catch com handleServiceError(error)
```

#### PASSO 3.5 — Página /superadmin/planos

Criar `app/(superadmin)/superadmin/planos/page.tsx`:

**Layout da página:**

```
HEADER:
💰 Gestão de Planos                    [+ Novo Plano]

STATS (4 cards):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📋 5         │ │ ✅ 4         │ │ ⭐ Pro       │ │ 💰 R$38.670  │
│ Total Planos │ │ Ativos       │ │ Mais Popular │ │ MRR Total    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

TABELA DE PLANOS:
│ Plano      │ Preço/mês  │ Alunos    │ Profs     │ Unidades  │ Academias │ Status  │ Ações     │
│ Starter    │ R$ 79      │ 50        │ 2         │ 1         │ 12        │ ✅ Ativo│ ✏️ 🔄 🗑️│
│ Essencial  │ R$ 149     │ 100       │ 5         │ 1         │ 23        │ ✅ Ativo│ ✏️ 🔄 🗑️│
│ Pro ⭐     │ R$ 249     │ 200       │ Ilimitados│ 2         │ 31        │ ✅ Ativo│ ✏️ 🔄 🗑️│
│ Black Belt │ R$ 397     │ Ilimitados│ Ilimitados│ Ilimitados│ 8         │ ✅ Ativo│ ✏️ 🔄 🗑️│
│ Enterprise │ Sob consulta│ Ilimitados│ Ilimitados│ Ilimitados│ 2         │ ✅ Ativo│ ✏️ 🔄 🗑️│

AÇÕES POR PLANO:
✏️ Editar → abre modal/drawer com form completo
🔄 Ativar/Desativar → toggle com confirmação
🗑️ Excluir → só se nenhuma academia usa esse plano (senão mostra aviso)

SEÇÃO ABAIXO DA TABELA:
📊 Distribuição de Academias por Plano (gráfico de barras horizontal ou donut)
💰 Receita por Plano (gráfico de barras)
```

**Modal/Drawer de Edição de Plano:**

```
┌─────────────────────────────────────────────────┐
│ ✏️ Editar Plano: Pro                      [X]  │
│                                                 │
│ Nome do Plano: [Pro                         ]   │
│                                                 │
│ Preço Mensal:  [R$ 249                      ]   │
│ □ Sob consulta (sem preço fixo)                 │
│                                                 │
│ ── Limites ──                                   │
│ Máx. Alunos:      [200     ] □ Ilimitado        │
│ Máx. Professores: [        ] ☑ Ilimitado        │
│ Máx. Unidades:    [2       ] □ Ilimitado        │
│ Storage (GB):     [10      ]                    │
│ Máx. Turmas:      [20      ] □ Ilimitado        │
│                                                 │
│ ── Excedentes ──                                │
│ Aluno extra:      [R$ 3    ] /aluno/mês         │
│ Professor extra:  [R$ 15   ] /prof/mês          │
│ Unidade extra:    [R$ 49   ] /unidade/mês       │
│ Storage extra:    [R$ 0,50 ] /GB/mês            │
│                                                 │
│ ── Features Incluídas ──                        │
│ ☑ Gestão de Alunos     ☑ Check-in               │
│ ☑ Financeiro Básico    ☑ Agenda                  │
│ ☑ Notificações         ☑ Biblioteca de Vídeos    │
│ ☑ Streaming Library    ☑ Certificados Digitais   │
│ ☑ Relatórios Avançados ☑ Comunicação Responsáveis│
│ ☑ App do Aluno         ☑ Módulo Compete          │
│ ☑ Gamificação Teen     ☑ Currículo Técnico       │
│ ☑ Match Analysis       ☑ Estoque                 │
│ ☑ Contratos Digitais                             │
│ ☐ Painel Franqueador   ☐ White-Label             │
│ ☐ API Access           ☐ Suporte Prioritário     │
│ ☐ Relatórios Multi-Un. ☐ SLA Dedicado            │
│ ☐ Onboarding Assistido ☐ Customizações           │
│ ☐ Integração Legados                             │
│                                                 │
│ ⭐ Marcar como "Mais Popular"  [toggle]          │
│                                                 │
│ ── Trial ──                                     │
│ Dias de trial: [7]                              │
│ Nível de acesso no trial: [Black Belt ▼]        │
│                                                 │
│            [Cancelar]  [💾 Salvar Alterações]    │
└─────────────────────────────────────────────────┘
```

**Modal de Novo Plano:** Mesmo form, campos vazios, botão "Criar Plano".

**Confirmações:**
- Desativar plano com academias usando → "Este plano tem X academias. Elas manterão o plano atual mas novos cadastros não poderão selecionar este plano. Continuar?"
- Excluir plano com academias → "Não é possível excluir. X academias usam este plano. Desative-o em vez disso."
- Alterar preço → "O novo preço será aplicado apenas a novos cadastros. Academias existentes mantêm o valor atual até renovação. Confirmar?"

#### PASSO 3.6 — Sidebar

Adicionar ao `SuperAdminShell.tsx`:
- Item: "Planos" com ícone `DollarSign` de lucide-react
- Rota: `/superadmin/planos`
- Posição: após "Academias" e antes de outros itens
- Badge: mostrar número de planos ativos

#### PASSO 3.7 — Supabase Migration (preparar mas NÃO executar)

Criar `supabase/migrations/036_plans.sql` (ou próximo número disponível):

```sql
-- Tabela de planos gerenciados pelo Super Admin
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'essencial', 'pro', 'blackbelt', 'enterprise')),
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
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode VER planos ativos (para onboarding/upgrade)
CREATE POLICY "plans_select_active" ON plans
  FOR SELECT USING (is_active = TRUE);

-- Apenas Super Admin pode gerenciar planos
CREATE POLICY "plans_superadmin_all" ON plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Seed dos 5 planos
INSERT INTO plans (tier, name, price_monthly, is_custom_price, max_alunos, max_professores, max_unidades, max_storage_gb, max_turmas, features, is_popular, sort_order) VALUES
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
 FALSE, 5);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_plans_updated_at();
```

#### PASSO 3.8 — Build & Commit

```bash
pnpm typecheck && pnpm build  # ZERO erros obrigatório

git add -A
git commit -m "feat: superadmin plan management — CRUD planos, pricing, features, excedentes

- Types: Plan, PlanTier, PlanLimits, PlanOverageRates, PlanFeature
- Constants: ALL_FEATURES com 26 features categorizadas
- Service: plans.service.ts com isMock() branching
- Mock: 5 planos com valores atualizados (Starter R$79 → Enterprise sob consulta)
- Page: /superadmin/planos com tabela, stats, gráficos, modal CRUD
- Sidebar: item 'Planos' adicionado ao SuperAdminShell
- Migration: 036_plans.sql preparada (não executada)
- Confirmações de segurança em todas as ações destrutivas
- PT-BR em toda a UI, skeleton loading, empty states"

git push origin main
```

---

### ✅ AGENTE 4 — INTEGRADOR (Conexão com Onboarding & Admin)

**Missão:** Garantir que os planos definidos pelo Super Admin são os mesmos usados no onboarding e na página /admin/plano.

1. **Buscar onde o onboarding mostra planos:**
   ```bash
   grep -rn "Starter\|Essencial\|Pro\|Black.Belt\|Enterprise\|R\$.*79\|R\$.*149\|R\$.*249\|R\$.*397" app/(public)/ app/onboarding/ app/cadastro/ components/ --include="*.tsx" --include="*.ts" | grep -v node_modules | head -30
   ```

2. **Substituir planos hardcoded no onboarding** por chamada ao service `getActivePlans()`. Se o onboarding usa um array estático de planos, substituir pelo array do service/mock.

3. **Buscar página /admin/plano:**
   ```bash
   find app -path "*admin*plano*" -type f 2>/dev/null
   ```
   - Se existe → verificar se usa os mesmos dados do service. Se hardcoded, substituir.
   - Se não existe → não criar agora (é escopo do prompt ADMIN_BILLING separado)

4. **Garantir single source of truth:** Os planos DEVEM vir de `lib/api/plans.service.ts` (ou mock) em TODOS os lugares. Zero duplicação de arrays de planos.

5. **Verificar se landing page NÃO mostra preços** (já removidos em prompt anterior). Se ainda mostrar, remover.

```bash
pnpm typecheck && pnpm build

git add -A
git commit -m "refactor: single source of truth for plans — onboarding and admin use plans.service"
git push origin main
```

---

### 🧪 AGENTE 5 — VALIDADOR FINAL

**Missão:** Testar tudo, garantir zero erros, validar fluxos.

**Checklist de validação:**

```bash
echo "=== AGENTE 5: VALIDADOR ==="

# 1. Build limpo
pnpm typecheck && pnpm build

# 2. Rota existe e renderiza
echo "Verificando rota /superadmin/planos..."
grep -r "planos" app/(superadmin)/ --include="*.tsx" -l

# 3. Sidebar tem o item
echo "Verificando sidebar..."
grep "plano\|Plano\|DollarSign" components/shell/SuperAdminShell.tsx

# 4. Service existe e exporta funções
echo "Verificando service..."
grep "export" lib/api/plans.service.ts | head -10

# 5. Types exportados
echo "Verificando types..."
grep "export" lib/types/plan.ts | head -10

# 6. Mock existe
echo "Verificando mock..."
ls -la lib/mocks/plan* 2>/dev/null || ls -la lib/mocks/*plan* 2>/dev/null

# 7. Migration existe
echo "Verificando migration..."
ls -la supabase/migrations/*plan* 2>/dev/null

# 8. Valores corretos no mock
echo "Verificando valores..."
grep "7900\|14900\|24900\|39700" lib/mocks/plan* lib/api/plans.service.ts 2>/dev/null | head -10

# 9. Zero inglês na UI
echo "Verificando PT-BR..."
grep -rn "Save\|Cancel\|Delete\|Edit\|Create\|Submit\|Close\|Loading\|Error" app/(superadmin)/superadmin/planos/ --include="*.tsx" 2>/dev/null | grep -v "// \|import\|console\|type\|interface" | head -10

# 10. CSS vars (zero hardcoded)
echo "Verificando CSS vars..."
grep -n "#[0-9a-fA-F]\{3,6\}" app/(superadmin)/superadmin/planos/ --include="*.tsx" -r 2>/dev/null | head -10
```

**Gerar relatório final:** `docs/review/pricing-validation.md`

```bash
git add docs/review/
git commit -m "docs: pricing module validation report — all checks passed"
git push origin main
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_SUPERADMIN_PRICING_AUDIT.md nesta pasta. Execute os 5 agentes NA ORDEM: Auditor → Corretor → Construtor → Integrador → Validador. O Agente 1 determina se o módulo existe ou não. Se existe e está correto, o Agente 2 garante visibilidade e pula pro 4. Se não existe, o Agente 3 cria do zero. O Agente 4 integra com onboarding/admin. O Agente 5 valida tudo. Cada agente commita antes de passar ao próximo. ZERO erros em pnpm typecheck && pnpm build. PT-BR em toda a UI. CSS vars apenas. Push ao final de cada agente.
```

---

## NOTAS IMPORTANTES

- Os valores neste prompt (R$79/149/249/397/Enterprise sob consulta) são a **FONTE DE VERDADE ATUAL**
- Se encontrar valores diferentes no código (R$97/197/347/597 são versões antigas), ATUALIZAR para os valores deste prompt
- A landing page NÃO deve mostrar preços — apenas o wizard de onboarding e /superadmin/planos
- Enterprise é sempre "Sob consulta" — sem preço fixo
- Trial é sempre 7 dias com acesso nível Black Belt para TODOS os planos
- Excedente é PERMITIDO — nunca bloqueia o uso, cobra no fim do mês
