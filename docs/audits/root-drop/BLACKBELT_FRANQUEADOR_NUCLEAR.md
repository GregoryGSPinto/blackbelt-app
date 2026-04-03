# BLACKBELT v2 — FRANQUEADOR: FRANQUIA VIRTUAL COMPLETA
## 5 Agentes — Layout, Dados, Páginas, Seed, Deploy

> **PROBLEMA:** O Franqueador está com:
> 1. Sidebar rolando junto com conteúdo (falta sticky)
> 2. Páginas em branco/skeleton (dados não carregam)
> 3. Maioria das páginas mostra "Em breve" ou vazio
>
> **OBJETIVO:** Criar uma franquia virtual completa com as 3 academias que já existem
> no Supabase (Guerreiros do Tatame + as outras 2), para o Gregory visualizar
> EXATAMENTE como o painel do franqueador vai funcionar com dados reais.
>
> **BENCHMARK:** Franquias fitness como SmartFit, Bodytech, Alliance BJJ —
> painel consolidado com visão da rede inteira.

---

## AGENTE 1 — FIX LAYOUT + SIDEBAR STICKY

**Missão:** Corrigir o layout do Franqueador para ter sidebar sticky, header com busca/sino/avatar, e conteúdo rolando independente.

### 1.1 Encontrar e corrigir o layout

```bash
echo "=== LAYOUT FRANQUEADOR ==="
cat app/(franqueador)/layout.tsx

echo ""
echo "=== EXISTE SHELL? ==="
find components/shell -name '*Franq*' -name '*.tsx' | head -5

echo ""
echo "=== PÁGINAS ==="
find app/(franqueador) -name 'page.tsx' | sort
```

### 1.2 Corrigir sidebar

Se o layout é inline (sem Shell extraído), corrigir diretamente:

A `aside` deve ter:
```
className="hidden lg:flex lg:w-64 lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:overflow-y-auto"
```

O conteúdo deve ter:
```
className="flex-1 min-h-screen overflow-y-auto"
```

### 1.3 Garantir header com busca + sino

O header do conteúdo deve ter:
- Logo BELT + "Franqueador"
- Lupa (CommandPalette / busca)
- Sino (NotificationBell)
- Avatar com dropdown (Perfil, Configurações, Sair)

Se não tem → adicionar.

### 1.4 Garantir que tem CommandPalette

```bash
grep -c "CommandPalette\|searchOpen\|SearchIcon" app/(franqueador)/layout.tsx
```

Se 0 → adicionar import + state + botão + componente.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: franqueador sidebar sticky + header com busca/sino/avatar"
```

---

## AGENTE 2 — BACKEND: TABELAS + SEED FRANQUIA VIRTUAL

**Missão:** Criar dados de franquia virtual usando as 3 academias que já existem no Supabase.

### 2.1 Verificar academias existentes

```bash
set -a && source .env.local && set +a

echo "=== ACADEMIAS NO SUPABASE ==="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/academies?select=id,name,slug,status,owner_id&order=name" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'{len(data)} academias:')
for a in data:
  print(f'  {a[\"name\"]} ({a[\"status\"]}) — {a[\"id\"][:12]}...')
" 2>/dev/null
```

### 2.2 Verificar tabela de franquias

```bash
echo "=== TABELAS DE FRANQUIA ==="
for TABLE in franchise_networks franchise_units franchises franchise_financials franchise_compliance_checks; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  echo "  $TABLE: HTTP $HTTP"
done
```

### 2.3 Migration (se tabelas faltam)

```sql
-- Rede de franquias
CREATE TABLE IF NOT EXISTS franchise_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_profile_id UUID REFERENCES profiles(id),
  logo_url TEXT,
  description TEXT,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rules JSONB DEFAULT '{}'::jsonb, -- regras da rede (currículo obrigatório, identidade visual, etc.)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unidades da rede (link academia → rede)
CREATE TABLE IF NOT EXISTS franchise_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id UUID NOT NULL REFERENCES franchise_networks(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  unit_name TEXT, -- "Guerreiros Vespasiano", "Guerreiros BH Centro"
  city TEXT,
  state TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  royalty_percent NUMERIC(5,2) DEFAULT 5.0, -- % de royalty sobre receita
  joined_at TIMESTAMPTZ DEFAULT now(),
  contract_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(network_id, academy_id)
);

-- Financeiro da franquia (royalties, taxas)
CREATE TABLE IF NOT EXISTS franchise_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id UUID NOT NULL REFERENCES franchise_networks(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES franchise_units(id) ON DELETE CASCADE,
  reference_month TEXT NOT NULL, -- "2026-03"
  gross_revenue INTEGER DEFAULT 0, -- centavos
  royalty_amount INTEGER DEFAULT 0, -- centavos
  royalty_status TEXT DEFAULT 'pendente' CHECK (royalty_status IN ('pendente', 'pago', 'atrasado')),
  paid_at TIMESTAMPTZ,
  alunos_count INTEGER DEFAULT 0,
  checkins_count INTEGER DEFAULT 0,
  nps_score NUMERIC(3,1),
  compliance_score NUMERIC(5,2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE franchise_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_financials ENABLE ROW LEVEL SECURITY;

-- Franqueador vê sua rede
CREATE POLICY IF NOT EXISTS "fn_owner" ON franchise_networks
  FOR ALL USING (owner_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "fu_network_owner" ON franchise_units
  FOR ALL USING (network_id IN (SELECT id FROM franchise_networks WHERE owner_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY IF NOT EXISTS "ff_network_owner" ON franchise_financials
  FOR ALL USING (network_id IN (SELECT id FROM franchise_networks WHERE owner_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Super admin vê tudo
CREATE POLICY IF NOT EXISTS "fn_superadmin" ON franchise_networks
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'));
CREATE POLICY IF NOT EXISTS "fu_superadmin" ON franchise_units
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'));
CREATE POLICY IF NOT EXISTS "ff_superadmin" ON franchise_financials
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'));
```

### 2.4 Seed da Franquia Virtual

Criar `scripts/seed-franchise.ts`:

```typescript
// 1. Buscar profile do franqueador
//    email: franqueador@email.com (do seed anterior)

// 2. Criar rede: "Guerreiros Fight Network"
//    owner_profile_id = franqueador profile
//    slug: guerreiros-fight-network

// 3. Vincular as 3 academias existentes como unidades:
//    - Guerreiros do Tatame (Vespasiano/MG) — matriz
//    - Academia 2 (se existir)
//    - Academia 3 (se existir)
//    Se só tem 1 academia, criar 2 unidades virtuais com nomes diferentes:
//    - "Guerreiros BH Centro" (Belo Horizonte/MG)
//    - "Guerreiros Contagem" (Contagem/MG)

// 4. Para CADA unidade, criar financeiro dos últimos 6 meses:
const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

// Guerreiros Vespasiano (matriz — maior)
// Receita: R$ 8.000 → R$ 12.000 (crescendo)
// 45 alunos, 250 check-ins/mês, NPS 8.5

// Guerreiros BH Centro (nova — crescendo rápido)
// Receita: R$ 3.000 → R$ 7.000
// 25 alunos, 150 check-ins/mês, NPS 9.0

// Guerreiros Contagem (estável)
// Receita: R$ 5.000 → R$ 5.500
// 35 alunos, 200 check-ins/mês, NPS 7.8

// Royalty: 5% da receita bruta de cada unidade
// Status: Vespasiano pago, BH pendente, Contagem atrasado (1 mês)

// 5. Criar dados de compliance
// Vespasiano: 95% (excelente)
// BH Centro: 88% (bom, falta currículo padronizado)
// Contagem: 72% (precisa melhorar identidade visual)
```

```bash
set -a && source .env.local && set +a
pnpm tsx scripts/seed-franchise.ts

git add -A && git commit -m "data: franquia virtual Guerreiros Fight Network — 3 unidades, 6 meses de financeiro, compliance"
```

---

## AGENTE 3 — SERVICES DO FRANQUEADOR

**Missão:** Criar/atualizar services para buscar dados reais da franquia.

### 3.1 Service principal

Criar/atualizar `lib/api/franchise.service.ts`:

```typescript
// Funções:

// getMyNetwork(profileId) → dados da rede do franqueador
// getNetworkUnits(networkId) → lista de unidades com stats
// getUnitDetail(unitId) → detalhe completo de uma unidade
// getNetworkDashboard(networkId) → KPIs consolidados:
//   - Total alunos (soma de todas unidades)
//   - Total receita mês
//   - Total royalties (a receber)
//   - NPS médio da rede
//   - Frequência média
//   - Crescimento % vs mês anterior
//   - Unidade com melhor performance
//   - Unidade com pior performance
// getNetworkFinancials(networkId, period) → financeiro por unidade por mês
// getNetworkRanking(networkId) → ranking das unidades por receita/alunos/NPS
// getRoyaltySummary(networkId) → royalties: total a receber, pago, atrasado
// getComplianceOverview(networkId) → compliance por unidade
// getRevenueEvolution(networkId) → receita dos últimos 12 meses (gráfico)

// TODAS com isMock() branching
// TODAS com handleServiceError() no catch
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: franchise.service.ts — queries reais para dashboard, unidades, financeiro"
```

---

## AGENTE 4 — PÁGINAS DO FRANQUEADOR (Todas Funcionais)

**Missão:** Cada página do sidebar deve funcionar com dados reais. Zero "Em breve".

### 4.1 Dashboard (`/franqueador`)

```
┌─── Dashboard da Rede ────────────────────────────────────┐
│                                                           │
│  Guerreiros Fight Network                                 │
│  3 unidades ativas                                        │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 105      │ │ R$ 24.5k │ │ R$ 1.225 │ │ 8.4      │    │
│  │ Alunos   │ │ Receita  │ │ Royalties│ │ NPS Médio│    │
│  │ Total    │ │ Mês      │ │ A receber│ │          │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                           │
│  ┌──────────┐ ┌──────────┐                               │
│  │ 85%      │ │ +12%     │                               │
│  │ Frequênc.│ │ Crescim. │                               │
│  │ Média    │ │ vs mês   │                               │
│  └──────────┘ └──────────┘                               │
│                                                           │
│  ── Ranking das Unidades ──                              │
│  │ # │ Academia            │ Cidade     │ Alunos│Receita│ NPS│ Status │
│  │ 1 │ Guerreiros Vespas.  │ Vespasiano │ 45    │R$12k  │ 8.5│ 🟢     │
│  │ 2 │ Guerreiros Contagem │ Contagem   │ 35    │R$5.5k │ 7.8│ 🟡     │
│  │ 3 │ Guerreiros BH       │ BH         │ 25    │R$7k   │ 9.0│ 🟢     │
│                                                           │
│  ── Receita por Mês (últimos 6 meses) ──                 │
│  [Gráfico de barras empilhadas por unidade]              │
│                                                           │
│  ── Alertas ──                                           │
│  ⚠️ Contagem: royalty de Fev/2026 atrasado (R$ 275)      │
│  ⚠️ Contagem: compliance 72% — abaixo do mínimo (80%)    │
│  ✅ BH Centro: crescimento +15% este mês                 │
└───────────────────────────────────────────────────────────┘
```

### 4.2 Unidades (`/franqueador/unidades`)

Lista de academias da rede com cards:

```
┌─ Guerreiros do Tatame ──────────────────────────────────┐
│ Vespasiano/MG · Matriz · Desde Mar/2024                  │
│ 👥 45 alunos · 💰 R$ 12.000/mês · 📊 NPS 8.5 · ✅ 95%  │
│ Royalty: 5% · R$ 600/mês · 🟢 Pago                      │
│ [Ver detalhes →]                                         │
└──────────────────────────────────────────────────────────┘

┌─ Guerreiros BH Centro ──────────────────────────────────┐
│ Belo Horizonte/MG · Desde Jan/2026                       │
│ 👥 25 alunos · 💰 R$ 7.000/mês · 📊 NPS 9.0 · ✅ 88%  │
│ Royalty: 5% · R$ 350/mês · 🟡 Pendente                  │
│ [Ver detalhes →]                                         │
└──────────────────────────────────────────────────────────┘

┌─ Guerreiros Contagem ───────────────────────────────────┐
│ Contagem/MG · Desde Set/2025                             │
│ 👥 35 alunos · 💰 R$ 5.500/mês · 📊 NPS 7.8 · ⚠️ 72%  │
│ Royalty: 5% · R$ 275/mês · 🔴 Atrasado                  │
│ [Ver detalhes →]                                         │
└──────────────────────────────────────────────────────────┘
```

### 4.3 Currículo (`/franqueador/curriculo`)

Grade técnica padronizada da rede:

```
┌─── Currículo Padronizado ────────────────────────────────┐
│                                                           │
│  Faixa Branca → Azul (12 meses mínimo)                  │
│  • Posição de guarda: 8 técnicas obrigatórias            │
│  • Passagem de guarda: 6 técnicas                        │
│  • Finalizações básicas: 4 técnicas                      │
│  • Defesas: 5 técnicas                                   │
│  • Presença mínima: 80 aulas                             │
│                                                           │
│  Conformidade da rede:                                    │
│  Vespasiano: ✅ 100% implementado                        │
│  BH Centro: ⚠️ 75% (falta módulo de guarda)             │
│  Contagem: ⚠️ 60% (2 módulos pendentes)                 │
│                                                           │
│  [📥 Baixar PDF do Currículo]                            │
└───────────────────────────────────────────────────────────┘
```

### 4.4 Padronização (`/franqueador/padronizacao`)

Checklist de conformidade por unidade:

```
┌─── Padronização da Rede ─────────────────────────────────┐
│                                                           │
│  Itens obrigatórios:                                      │
│  ☑ Identidade visual (logo, cores, uniforme)              │
│  ☑ Currículo técnico padronizado                          │
│  ☑ Sistema de graduação unificado                         │
│  ☑ Horários mínimos de aula                               │
│  ☑ Relatório mensal de presença                           │
│  ☑ NPS mínimo 7.5                                        │
│                                                           │
│  │ Unidade          │ Score │ Pendências              │   │
│  │ Vespasiano       │ 95%  │ Relatório mensal atrasado│   │
│  │ BH Centro        │ 88%  │ Currículo incompleto     │   │
│  │ Contagem         │ 72%  │ Logo errada, NPS baixo   │   │
└───────────────────────────────────────────────────────────┘
```

### 4.5 Royalties (`/franqueador/royalties`)

```
┌─── Royalties — Março/2026 ───────────────────────────────┐
│                                                           │
│  Total a receber: R$ 1.225,00                            │
│  🟢 Pago: R$ 600,00 (Vespasiano)                        │
│  🟡 Pendente: R$ 350,00 (BH Centro)                     │
│  🔴 Atrasado: R$ 275,00 (Contagem — Fev/2026)           │
│                                                           │
│  │ Unidade     │ Receita  │ %    │ Royalty │ Status  │   │
│  │ Vespasiano  │ R$12.000 │ 5%   │ R$ 600 │ 🟢 Pago │   │
│  │ BH Centro   │ R$ 7.000 │ 5%   │ R$ 350 │ 🟡 Pend.│   │
│  │ Contagem    │ R$ 5.500 │ 5%   │ R$ 275 │ 🔴 Atras│   │
│                                                           │
│  ── Histórico ──                                         │
│  [Tabela dos últimos 6 meses com valores por unidade]    │
└───────────────────────────────────────────────────────────┘
```

### 4.6 Expansão (`/franqueador/expansao`)

```
┌─── Expansão da Rede ─────────────────────────────────────┐
│                                                           │
│  Rede atual: 3 unidades · MG                             │
│                                                           │
│  📍 Mapa com pins das unidades (ou lista por região)     │
│                                                           │
│  Oportunidades:                                           │
│  • Betim/MG — sem academia da rede, 500k habitantes      │
│  • Ribeirão das Neves/MG — demanda alta                  │
│  • Santa Luzia/MG — 2 concorrentes identificados         │
│                                                           │
│  [+ Adicionar Nova Unidade]                              │
│                                                           │
│  Meta: 5 unidades até Dez/2026                           │
│  Progresso: ██████░░░░ 3/5 (60%)                         │
└───────────────────────────────────────────────────────────┘
```

### 4.7 Comunicação (`/franqueador/comunicacao`)

```
┌─── Comunicados para a Rede ──────────────────────────────┐
│                                                           │
│  [+ Novo Comunicado]                                     │
│                                                           │
│  Para: [Todas unidades ▼] ou [Selecionar...]             │
│  Assunto: [________________________________]             │
│  Mensagem: [________________________________]            │
│                                                           │
│  ── Comunicados enviados ──                              │
│  📨 "Novo currículo disponível" — 15/03 — Todas — ✅ Lido│
│  📨 "Reunião de rede — 20/03" — 10/03 — Todas — 2/3 lido│
│  📨 "Atualização de identidade visual" — 01/03 — Contagem│
└───────────────────────────────────────────────────────────┘
```

### 4.8 Configurações (`/franqueador/configuracoes`)

```
┌─── Configurações da Rede ────────────────────────────────┐
│                                                           │
│  Nome da Rede: [Guerreiros Fight Network]                │
│  CNPJ: [12.345.678/0001-90]                             │
│  Telefone: [(31) 99999-0000]                             │
│  Email: [rede@guerreiros.com]                            │
│  Website: [www.guerreirosfight.com.br]                   │
│                                                           │
│  ── Regras da Rede ──                                    │
│  Royalty padrão: [5] %                                   │
│  NPS mínimo: [7.5]                                       │
│  Compliance mínimo: [80] %                               │
│  Relatório mensal obrigatório: [✅]                      │
│                                                           │
│  [💾 Salvar]                                             │
└───────────────────────────────────────────────────────────┘
```

### 4.9 Perfil (`/franqueador/perfil`)

Usar o componente compartilhado `ProfileSettingsPage` com role `franqueador`.

### 4.10 Visual de TODAS as páginas

- CSS vars: `var(--bb-depth-*)`, `var(--bb-ink-*)`, `var(--bb-brand)`
- Cards com sombra sutil e borda
- Badges de status coloridos (🟢 verde, 🟡 amarelo, 🔴 vermelho)
- Skeleton loading enquanto carrega
- Empty state com mensagem amigável se não tem dados
- PT-BR em toda a UI
- Mobile-first, 44px touch targets

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: todas as páginas do franqueador funcionais com dados reais"
```

---

## AGENTE 5 — VALIDAÇÃO + DEPLOY

### 5.1 Verificar CADA página

```bash
echo "=== PÁGINAS DO FRANQUEADOR ==="
find app/(franqueador) -name 'page.tsx' | sort | while read page; do
  echo "--- $page ---"
  # Tem dados reais ou mock?
  MOCK=$(grep -c "isMock\|mock\|Mock\|MOCK\|hardcoded\|placeholder" "$page" 2>/dev/null)
  LOADING=$(grep -c "loading\|Loading\|skeleton" "$page" 2>/dev/null)
  EMPTY=$(grep -c "Nenhum\|nenhum\|empty\|Empty\|Em breve\|em breve" "$page" 2>/dev/null)
  SERVICE=$(grep -c "service\|Service\|\.from(\|useEffect" "$page" 2>/dev/null)
  echo "  Mock=$MOCK Loading=$LOADING Empty=$EMPTY Service=$SERVICE"
done
```

### 5.2 Testar login do franqueador

```bash
set -a && source .env.local && set +a

# Testar login
RESULT=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"franqueador@email.com","password":"BlackBelt@2026"}')

echo "Login franqueador: $(echo $RESULT | grep -q 'access_token' && echo '✅ OK' || echo '❌ FALHOU')"

# Verificar se tem dados de franquia
for TABLE in franchise_networks franchise_units franchise_financials; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Prefer: count=exact" \
    -I 2>/dev/null | grep -i 'content-range' | grep -oE '[0-9]+$')
  echo "$TABLE: ${COUNT:-0} registros"
done
```

### 5.3 Build e deploy

```bash
pnpm typecheck && pnpm build

git add -A
git commit -m "nuclear: franqueador completo — franquia virtual, 3 unidades, todas páginas funcionais, sidebar sticky

Agente 1: Layout corrigido — sidebar sticky, header com busca/sino/avatar
Agente 2: Seed franquia virtual — Guerreiros Fight Network, 3 unidades, 6 meses financeiro
Agente 3: franchise.service.ts — queries reais para dashboard, unidades, royalties, compliance
Agente 4: 9 páginas funcionais — dashboard, unidades, currículo, padronização, royalties, expansão, comunicação, config, perfil
Agente 5: Validação — zero mock, zero em breve, dados reais

3 unidades: Vespasiano (matriz R$12k), BH Centro (R$7k crescendo), Contagem (R$5.5k, compliance baixo)
Royalties: 5%, mix de pago/pendente/atrasado para demonstrar o painel"

git push origin main
npx vercel --prod --force --yes
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_FRANQUEADOR_NUCLEAR.md nesta pasta. Execute os 5 agentes NA ORDEM:

AGENTE 1: Fix layout — sidebar sticky, header com busca/sino/avatar. Commit.

AGENTE 2: Seed franquia virtual — criar rede "Guerreiros Fight Network", vincular as 3 academias como unidades, criar 6 meses de financeiro com receita crescente, royalties (pago/pendente/atrasado), NPS, compliance. Se só tem 1 academia no banco, criar 2 unidades virtuais extras. Migration se tabelas faltam. Rodar seed. Commit.

AGENTE 3: franchise.service.ts — getMyNetwork, getNetworkUnits, getNetworkDashboard, getNetworkFinancials, getNetworkRanking, getRoyaltySummary, getComplianceOverview, getRevenueEvolution. isMock branching. Commit.

AGENTE 4: TODAS as 9 páginas funcionais com dados reais: dashboard (KPIs + ranking + gráfico + alertas), unidades (cards), currículo (grade técnica), padronização (compliance checklist), royalties (tabela + histórico), expansão (mapa + oportunidades), comunicação (comunicados), configurações (dados da rede), perfil. Zero "Em breve". Commit.

AGENTE 5: Validação — testar login franqueador, verificar dados no banco, build limpo, push, deploy.

CSS vars --bb-*, PT-BR, Supabase real, isMock branching. Comece agora.
```
