# BLACKBELT v2 — FINANCEIRO DO DONO: VÍNCULO + PAGAMENTO + COBRANÇA
## 5 Agentes — Backend, Frontend, Integração Asaas, Dashboard, Deploy

> **OBJETIVO:** O dono da academia precisa ver CLARAMENTE como cada aluno paga,
> quanto paga, e se está em dia. O sistema suporta cobrança manual (baixa) E
> automática (Asaas). Tudo linkado no Supabase real.
>
> **PRINCÍPIO:** Simples e objetivo. O dono olha a lista de alunos e sabe
> em 1 segundo: tipo de vínculo, forma de pagamento, valor, status.

---

## MODELO DE DADOS

### Tipo de Vínculo (como o aluno chegou)

| Código | Nome | Como paga | Quem cobra |
|--------|------|-----------|------------|
| `particular` | Particular | PIX/Cartão/Boleto/Dinheiro | Academia |
| `gympass` | GymPass | Via GymPass | GymPass repassa por check-in |
| `totalpass` | TotalPass | Via TotalPass | TotalPass repassa por check-in |
| `smartfit` | Smart Fit | Via Smart Fit | Smart Fit repassa |
| `cortesia` | Cortesia | Não paga | — |
| `funcionario` | Funcionário | Não paga | — |
| `bolsista` | Bolsista | Desconto parcial ou total | Academia (valor reduzido) |
| `avulso` | Avulso / Experimental | Por aula | Academia cobra por aula |

### Forma de Pagamento (para particular/bolsista/avulso)

| Código | Nome |
|--------|------|
| `pix` | PIX |
| `credito` | Cartão de Crédito |
| `debito` | Cartão de Débito |
| `boleto` | Boleto Bancário |
| `dinheiro` | Dinheiro |
| `transferencia` | Transferência Bancária |
| `asaas` | Cobrança Asaas (automática) |

### Recorrência (para particular/bolsista)

| Código | Nome | Meses |
|--------|------|-------|
| `mensal` | Mensal | 1 |
| `trimestral` | Trimestral | 3 |
| `semestral` | Semestral | 6 |
| `anual` | Anual | 12 |
| `avulso` | Por aula | — |

### Status do Pagamento

| Código | Cor | Significado |
|--------|-----|-------------|
| `em_dia` | 🟢 Verde | Pagamento em dia |
| `pendente` | 🟡 Amarelo | Fatura gerada, aguardando |
| `atrasado` | 🔴 Vermelho | Vencido, não pagou |
| `cortesia` | 🔵 Azul | Não cobra (cortesia/funcionário) |
| `gympass` | 🟣 Roxo | Pago via GymPass/TotalPass |
| `cancelado` | ⚫ Cinza | Aluno inativo |

---

## AGENTE 1 — BACKEND: MIGRATION + SERVICE

**Missão:** Criar/atualizar as tabelas e service para suportar todos os tipos de vínculo e pagamento.

### 1.1 Auditar estado atual

```bash
set -a && source .env.local && set +a

echo "=== TABELAS FINANCEIRAS ==="
for TABLE in invoices subscriptions student_subscriptions billing_info payment_methods student_billing; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  echo "  $TABLE: HTTP $HTTP"
done

echo ""
echo "=== MEMBERSHIPS (tem campo de billing?) ==="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/memberships?select=*&limit=1" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | \
  python3 -c "import sys,json; data=json.load(sys.stdin); print(list(data[0].keys()) if data else 'vazio')" 2>/dev/null

echo ""
echo "=== SERVICES FINANCEIROS ==="
find lib/api -name '*financ*' -o -name '*billing*' -o -name '*invoice*' -o -name '*payment*' -o -name '*fatura*' | sort
```

### 1.2 Migration — Billing Info por membro

O dado financeiro fica no **membership** (cada membro da academia tem seu vínculo financeiro).

Criar migration `supabase/migrations/089_billing_system.sql`:

```sql
-- ════════════════════════════════════════════════════
-- BLACKBELT v2 — Sistema Financeiro Completo
-- Tipo de vínculo, forma de pagamento, recorrência
-- ════════════════════════════════════════════════════

-- Adicionar campos financeiros na membership (se não existem)
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'particular'
  CHECK (billing_type IN ('particular', 'gympass', 'totalpass', 'smartfit', 'cortesia', 'funcionario', 'bolsista', 'avulso'));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS payment_method TEXT
  CHECK (payment_method IN ('pix', 'credito', 'debito', 'boleto', 'dinheiro', 'transferencia', 'asaas', NULL));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'mensal'
  CHECK (recurrence IN ('mensal', 'trimestral', 'semestral', 'anual', 'avulso'));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS monthly_amount INTEGER DEFAULT 0; -- centavos (14900 = R$149)
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0; -- 0-100
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS discount_reason TEXT; -- "Bolsa 50% competidor"
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_day INTEGER DEFAULT 10; -- dia do vencimento (1-28)
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'em_dia'
  CHECK (billing_status IN ('em_dia', 'pendente', 'atrasado', 'cortesia', 'gympass', 'cancelado'));

ALTER TABLE memberships ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT; -- ID da assinatura no Asaas
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT; -- ID do cliente no Asaas
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS contract_start DATE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS contract_end DATE;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS notes TEXT; -- obs do admin

-- Tabela de faturas (se não existe, já pode existir)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- centavos
  discount INTEGER DEFAULT 0, -- centavos
  net_amount INTEGER NOT NULL, -- amount - discount (centavos)
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  billing_type TEXT, -- particular, gympass, etc.
  payment_method TEXT, -- pix, credito, dinheiro, etc.
  reference_month TEXT, -- "2026-03"
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  paid_amount INTEGER, -- pode ser diferente se pagou parcial
  manual_payment BOOLEAN DEFAULT false,
  payment_notes TEXT,
  asaas_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_academy ON invoices(academy_id);
CREATE INDEX IF NOT EXISTS idx_invoices_profile ON invoices(profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_memberships_billing ON memberships(billing_type, billing_status);

-- RLS para invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Staff da academia pode ver/criar/editar faturas
CREATE POLICY IF NOT EXISTS "invoices_staff" ON invoices
  FOR ALL USING (
    academy_id IN (
      SELECT m.academy_id FROM memberships m
      JOIN profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.role IN ('admin', 'recepcao')
      AND m.status = 'active'
    )
  );

-- Aluno vê suas próprias faturas
CREATE POLICY IF NOT EXISTS "invoices_own" ON invoices
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Responsável vê faturas dos filhos
CREATE POLICY IF NOT EXISTS "invoices_guardian" ON invoices
  FOR SELECT USING (
    profile_id IN (
      SELECT child_id FROM guardian_links
      WHERE guardian_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );
```

### 1.3 Aplicar migration

```bash
supabase db push --include-all 2>&1
```

Se falhar, verificar o trigger `prevent_role_escalation_trigger` e desabilitar se necessário.

### 1.4 Service financeiro

Criar/atualizar `lib/api/billing.service.ts`:

```typescript
// ═══ FUNÇÕES DO SERVICE ═══

// -- MEMBERSHIPS (vínculo financeiro) --
// getMemberBilling(membershipId) → dados financeiros do membro
// updateMemberBilling(membershipId, data) → atualizar tipo/forma/valor/recorrência
// getMembersByBillingStatus(academyId, status) → filtrar por status (atrasado, em_dia, etc.)
// getMembersByBillingType(academyId, type) → filtrar por tipo (gympass, particular, etc.)

// -- FATURAS --
// getInvoices(academyId, filters) → listar faturas com filtros
// getInvoicesByMember(membershipId) → faturas de um membro
// createInvoice(data) → criar fatura manual
// generateMonthlyInvoices(academyId) → gerar faturas do mês para todos os particulares
// markAsPaid(invoiceId, method, notes) → baixa manual
// cancelInvoice(invoiceId) → cancelar fatura

// -- RESUMO FINANCEIRO --
// getFinancialSummary(academyId) → MRR, inadimplência, recebido mês, por tipo
// getBillingTypeBreakdown(academyId) → quantos alunos por tipo (particular: 30, gympass: 15, etc.)
// getOverdueMembers(academyId) → lista de inadimplentes com dias de atraso

// -- ASAAS (automática) --
// createAsaasSubscription(membershipId) → criar assinatura recorrente no Asaas
// cancelAsaasSubscription(membershipId) → cancelar assinatura
// syncAsaasPayment(asaasPaymentId) → sincronizar pagamento recebido do webhook

// TODAS com isMock() branching
// TODAS com handleServiceError() no catch
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: billing backend — migration 089, campos financeiros em memberships, service completo"
```

---

## AGENTE 2 — FRONTEND: CONFIGURAR VÍNCULO DO ALUNO

**Missão:** O admin/owner precisa configurar o tipo de vínculo, forma de pagamento e valor de CADA aluno.

### 2.1 No cadastro/edição do aluno

Quando o admin cadastra ou edita um aluno, deve ter uma seção "Financeiro":

```
┌─── Dados Financeiros ──────────────────────────────────┐
│                                                         │
│  Tipo de Vínculo:                                       │
│  [Particular ▼]                                         │
│  Opções: Particular, GymPass, TotalPass, Smart Fit,     │
│          Cortesia, Funcionário, Bolsista, Avulso        │
│                                                         │
│  ── Se Particular/Bolsista ──                           │
│                                                         │
│  Forma de Pagamento:                                    │
│  [PIX ▼]                                                │
│  Opções: PIX, Cartão Crédito, Cartão Débito,            │
│          Boleto, Dinheiro, Transferência,                │
│          Cobrança Automática (Asaas)                     │
│                                                         │
│  Recorrência:                                           │
│  [Mensal ▼]                                             │
│  Opções: Mensal, Trimestral, Semestral, Anual            │
│                                                         │
│  Valor Mensal: [R$ 149,00]                              │
│  Dia de Vencimento: [10]                                │
│                                                         │
│  ── Se Bolsista ──                                      │
│  Desconto: [50] %                                       │
│  Motivo: [Competidor da equipe]                         │
│  Valor com desconto: R$ 74,50                           │
│                                                         │
│  ── Se GymPass/TotalPass/Smart Fit ──                   │
│  ℹ️ Pagamento gerenciado pela plataforma parceira.       │
│     Receita contabilizada por check-in.                  │
│                                                         │
│  ── Se Cortesia/Funcionário ──                          │
│  ℹ️ Sem cobrança. Acesso liberado.                      │
│                                                         │
│  ── Se Asaas selecionado ──                             │
│  [🔄 Criar Cobrança Automática]                        │
│  Status Asaas: ✅ Ativa — Próximo: R$149 em 10/04       │
│                                                         │
│  Início do Contrato: [01/03/2026]                       │
│  Fim do Contrato: [28/02/2027] (opcional)               │
│  Observações: [________________________]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Criar componente BillingConfigSection

Criar `components/finance/BillingConfigSection.tsx`:

- Props: `membershipId`, `initialData`, `onSave`
- Formulário com os campos acima
- Campos condicionais (mostra/esconde baseado no tipo de vínculo)
- Máscara de valor em R$ (formato BR: R$ 149,00)
- Auto-calcula valor com desconto para bolsista
- Botão salvar → chama `billing.service.updateMemberBilling()`

### 2.3 Integrar na página de edição do aluno

```bash
# Encontrar onde o admin edita aluno
find app -path '*admin*aluno*' -name 'page.tsx' | sort
find app -path '*admin*aluno*' -name '*.tsx' | sort
```

Adicionar a seção `<BillingConfigSection />` na página de edição do aluno.

### 2.4 Coluna de status na lista de alunos

Na tabela de alunos (`/admin/alunos`), adicionar colunas:

| Nome | Faixa | Tipo | Pagamento | Valor | Status |
|------|-------|------|-----------|-------|--------|
| João Mendes | 🟦 Azul | Particular | PIX | R$ 149 | 🟢 Em dia |
| Maria Silva | ⬜ Branca | GymPass | — | — | 🟣 GymPass |
| Pedro Santos | 🟨 Amarela | Cortesia | — | — | 🔵 Cortesia |
| Ana Costa | 🟦 Azul | Particular | Cartão | R$ 149 | 🔴 Atrasado |

O status deve ter badge colorido visual (não só texto).

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: billing frontend — BillingConfigSection, integrar no cadastro/edição, colunas na lista"
```

---

## AGENTE 3 — LISTA DE FATURAS + BAIXA MANUAL + COBRANÇA

**Missão:** Página de financeiro do admin com lista de faturas, baixa manual, e geração de cobrança.

### 3.1 Página /admin/financeiro

```
┌─── Financeiro ──────────────────────────────────────────┐
│                                                          │
│  ── Resumo do Mês ──                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ R$ 8.940 │ │ R$ 7.450 │ │ R$ 1.490 │ │ 3        │   │
│  │ Previsto │ │ Recebido │ │ Pendente │ │ Atrasados│   │
│  │          │ │ 🟢       │ │ 🟡       │ │ 🔴       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ── Por Tipo de Vínculo ──                              │
│  Particular: 30 alunos · R$ 4.470/mês                   │
│  GymPass: 15 alunos · ~R$ 1.200/mês (por check-in)     │
│  TotalPass: 8 alunos · ~R$ 640/mês                      │
│  Cortesia: 5 alunos                                     │
│  Bolsista: 2 alunos · R$ 149/mês                        │
│                                                          │
│  ── Faturas ──                                          │
│  Filtros: [Mês ▼] [Status ▼] [Tipo ▼] [Buscar nome...] │
│                                                          │
│  │ Aluno      │ Tipo       │ Valor   │ Vencimento │ Status    │ Ações         │
│  │ João       │ Particular │ R$ 149  │ 10/03      │ 🟢 Pago  │ 👁️           │
│  │ Ana        │ Particular │ R$ 149  │ 10/03      │ 🔴 Atras │ 💳 ✅        │
│  │ Pedro      │ Bolsista   │ R$ 74   │ 10/03      │ 🟡 Pend  │ 💳 ✅        │
│  │ Marcos     │ GymPass    │ —       │ —          │ 🟣 GP    │ —             │
│  │ Juliana    │ Cortesia   │ —       │ —          │ 🔵 Cort  │ —             │
│                                                          │
│  Ações:                                                  │
│  💳 Cobrar (gerar cobrança Asaas ou enviar PIX)         │
│  ✅ Dar baixa (marcar como pago manualmente)             │
│  👁️ Ver detalhes                                        │
│                                                          │
│  [+ Gerar Faturas do Mês] [📊 Exportar CSV]            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Modal de Baixa Manual (já existe do transplante — verificar)

```bash
find components -name '*Manual*' -o -name '*Baixa*' -o -name '*manual*payment*' | head -5
```

Se existe, verificar que funciona com o novo modelo. Se não, criar.

### 3.3 Botão "Gerar Faturas do Mês"

Ao clicar:
1. Busca todos os memberships com `billing_type = 'particular'` ou `'bolsista'`
2. Para cada um que NÃO tem fatura do mês atual → cria fatura
3. Calcula valor com desconto se bolsista
4. Seta `due_date` = dia do vencimento do membro neste mês
5. Toast: "32 faturas geradas para Março/2026"

### 3.4 Integração Asaas (preparar)

Se o admin escolheu "Cobrança Automática (Asaas)" para um aluno:
- Criar API route `app/api/billing/asaas/route.ts`
- No cadastro: botão "Criar Cobrança Automática" → chama Asaas API para criar subscription
- Webhook `app/api/webhooks/asaas/route.ts` → recebe notificação de pagamento → marca fatura como paga
- Se `ASAAS_API_KEY` não está configurada → mostrar aviso "Configure a chave Asaas em Configurações"

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: financeiro admin — resumo, faturas por tipo, baixa manual, gerar faturas, preparação Asaas"
```

---

## AGENTE 4 — DASHBOARD + ALERTAS DE INADIMPLÊNCIA

**Missão:** O dono vê no dashboard quem está atrasado e recebe alertas.

### 4.1 Card de inadimplência no dashboard admin

```
┌─── ⚠️ Inadimplentes (3) ──────────────────────────────┐
│                                                         │
│  🔴 Ana Costa — R$ 149 — 15 dias atrasado               │
│  🔴 Carlos Alves — R$ 149 — 8 dias atrasado             │
│  🟡 Pedro Santos — R$ 74 — vence amanhã                 │
│                                                         │
│  [Ver todos →]                                          │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Badge no sidebar

No sidebar do Admin, o item "Financeiro" deve ter badge com número de inadimplentes:
```
💰 Financeiro  🔴 3
```

### 4.3 Notificação ao dono

Quando uma fatura vence e não foi paga → criar notificação:
- "Ana Costa está com pagamento atrasado há 15 dias (R$ 149,00)"
- Isso pode ser feito via CRON job ou ao carregar o dashboard

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: dashboard inadimplência — card alertas, badge sidebar, notificações"
```

---

## AGENTE 5 — TESTES + SEED + DEPLOY

### 5.1 Seed de dados financeiros

Para os memberships existentes no seed, configurar dados financeiros variados:

```typescript
// Atualizar memberships existentes com dados financeiros
const billingData = [
  { role: 'aluno_adulto', billing_type: 'particular', payment_method: 'pix', monthly_amount: 14900, recurrence: 'mensal' },
  { role: 'aluno_teen', billing_type: 'particular', payment_method: 'credito', monthly_amount: 12900, recurrence: 'mensal' },
  { role: 'aluno_kids', billing_type: 'gympass', payment_method: null, monthly_amount: 0, recurrence: 'avulso' },
  // Mais variações...
];
```

### 5.2 Gerar faturas de teste

```typescript
// Gerar faturas dos últimos 3 meses para os alunos particulares
// Mix de pagas, pendentes e atrasadas
```

### 5.3 Testes E2E

```bash
cat > scripts/test-billing-flows.ts << 'SCRIPT'
// Testar:
// 1. Memberships têm campos financeiros
// 2. Invoices existem com dados corretos
// 3. Baixa manual funciona (insert + update status)
// 4. Filtros por tipo/status funcionam
// 5. Resumo financeiro retorna dados corretos
SCRIPT

set -a && source .env.local && set +a
pnpm tsx scripts/test-billing-flows.ts
```

### 5.4 Build e deploy

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "nuclear: sistema financeiro completo — vínculo, pagamento, cobrança manual+automática

Agente 1: Migration 089 — billing_type, payment_method, recurrence em memberships + invoices
Agente 2: BillingConfigSection — config financeiro no cadastro/edição do aluno
Agente 3: /admin/financeiro — resumo, faturas, baixa manual, gerar faturas, filtros
Agente 4: Dashboard — card inadimplentes, badge no sidebar, notificações
Agente 5: Seed financeiro, testes E2E, deploy

Tipos: Particular, GymPass, TotalPass, Smart Fit, Cortesia, Funcionário, Bolsista, Avulso
Pagamento: PIX, Crédito, Débito, Boleto, Dinheiro, Transferência, Asaas (auto)
Recorrência: Mensal, Trimestral, Semestral, Anual, Avulso"

git push origin main
npx vercel --prod --force --yes
```

---

---

## REGRA GYMPASS/TOTALPASS: CHECK-IN MÍNIMO MENSAL

### Modelo

O dono define o mínimo de check-ins por mês para alunos GymPass/TotalPass/Smart Fit.
O sistema monitora e envia alertas automáticos quando o aluno está abaixo do mínimo.

### Migration (adicionar na 089)

```sql
-- Config de check-in mínimo por academia (na tabela academies ou settings)
ALTER TABLE academies ADD COLUMN IF NOT EXISTS gympass_min_checkins INTEGER DEFAULT 8;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS totalpass_min_checkins INTEGER DEFAULT 8;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS smartfit_min_checkins INTEGER DEFAULT 8;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS checkin_alert_days_before INTEGER DEFAULT 7; -- alerta X dias antes do fim do mês

-- Registro de alertas enviados (para não enviar duplicado)
CREATE TABLE IF NOT EXISTS checkin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('gympass_low', 'totalpass_low', 'smartfit_low')),
  reference_month TEXT NOT NULL, -- "2026-03"
  current_checkins INTEGER NOT NULL,
  required_checkins INTEGER NOT NULL,
  sent_to_student BOOLEAN DEFAULT false,
  sent_to_guardian BOOLEAN DEFAULT false,
  sent_to_owner BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(membership_id, reference_month, alert_type)
);

ALTER TABLE checkin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "checkin_alerts_academy" ON checkin_alerts
  FOR ALL USING (
    academy_id IN (
      SELECT m.academy_id FROM memberships m
      JOIN profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid() AND m.status = 'active'
    )
  );
```

### Service: lib/api/checkin-alerts.service.ts

```typescript
// Funções:
// getGymPassConfig(academyId) → { gympass_min: 8, totalpass_min: 8, alert_days: 7 }
// updateGymPassConfig(academyId, config) → atualizar mínimos
// checkAndAlertLowCheckins(academyId) → verificar TODOS os membros GymPass/TotalPass do mês atual
//   Para cada membro com check-ins < mínimo E faltando <= alert_days para o fim do mês:
//   1. Verificar se alerta já foi enviado este mês (checkin_alerts)
//   2. Se não: criar notificação para o aluno + responsável (se teen/kids) + dono
//   3. Registrar em checkin_alerts para não duplicar
// getMonthlyCheckinProgress(academyId) → lista de membros GymPass com progresso (5/8, 3/8, etc.)
// getMemberCheckinProgress(membershipId) → progresso individual
```

### Frontend: Config na página de configurações da academia

Na página `/admin/configuracoes` (ou seção dentro do financeiro):

```
┌─── Check-in Mínimo (Plataformas Parceiras) ────────────┐
│                                                          │
│  GymPass — Mínimo por mês: [8] check-ins                │
│  TotalPass — Mínimo por mês: [8] check-ins              │
│  Smart Fit — Mínimo por mês: [8] check-ins              │
│                                                          │
│  Alerta automático: [7] dias antes do fim do mês        │
│                                                          │
│  Quando o aluno estiver abaixo do mínimo:               │
│  ☑ Enviar notificação para o aluno                      │
│  ☑ Enviar notificação para o responsável (teen/kids)    │
│  ☑ Notificar o dono da academia que o alerta foi enviado│
│                                                          │
│  [💾 Salvar]                                            │
└──────────────────────────────────────────────────────────┘
```

### Frontend: Progresso na lista de alunos GymPass

Na tabela de alunos, para alunos GymPass/TotalPass, mostrar progresso:

```
│ Nome        │ Tipo     │ Check-ins Mês │ Mínimo │ Status        │
│ João GymP   │ GymPass  │ ████████░░ 8/8│ 8      │ 🟢 Atingido  │
│ Maria GP    │ GymPass  │ █████░░░░░ 5/8│ 8      │ 🟡 Faltam 3  │
│ Pedro TP    │ TotalPass│ ███░░░░░░░ 3/8│ 8      │ 🔴 Risco     │
```

### Frontend: Card no dashboard do admin

```
┌─── 🏋️ GymPass/TotalPass — Março ───────────────────────┐
│                                                          │
│  15 alunos via plataformas parceiras                     │
│  🟢 8 atingiram o mínimo                                │
│  🟡 4 precisam de mais check-ins                        │
│  🔴 3 em risco (menos de 50%)                           │
│                                                          │
│  ⚠️ Alertas enviados para 4 alunos hoje                 │
│  [Ver detalhes →]                                       │
└──────────────────────────────────────────────────────────┘
```

### Notificações enviadas

**Para o aluno:**
> "Você tem 5 de 8 check-ins em Março. Faltam 3 para atingir o mínimo do GymPass. Venha treinar! 🥋"

**Para o responsável (se teen/kids):**
> "Lucas tem 5 de 8 check-ins em Março (GymPass). Faltam 3 para atingir o mínimo."

**Para o dono:**
> "Alerta GymPass enviado para 4 alunos abaixo do mínimo em Março:
> • João — 5/8 check-ins
> • Maria — 3/8 check-ins
> • Pedro — 2/8 check-ins
> • Ana — 4/8 check-ins"

### CRON (verificação diária)

Criar `app/api/cron/checkin-alerts/route.ts`:
- Roda diariamente (configurar no Vercel Cron ou via Supabase pg_cron)
- Para CADA academia ativa:
  1. Verificar se estamos nos últimos X dias do mês (alert_days)
  2. Buscar membros GymPass/TotalPass com check-ins < mínimo
  3. Para cada um que NÃO recebeu alerta este mês → enviar notificação + registrar

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_BILLING_NUCLEAR.md nesta pasta. Execute os 5 agentes NA ORDEM:

AGENTE 1: Auditar Supabase, criar migration 089 com campos financeiros em memberships (billing_type, payment_method, recurrence, monthly_amount, discount, billing_status) + tabela invoices + tabela checkin_alerts + campos gympass_min_checkins em academies. RLS por role. Services billing.service.ts + checkin-alerts.service.ts. Aplicar migration. Commit.

AGENTE 2: Criar BillingConfigSection — formulário condicional por tipo de vínculo. Integrar na edição do aluno. Adicionar colunas de tipo/status/progresso na lista de alunos. Para GymPass/TotalPass mostrar barra de progresso de check-ins (5/8). Config de mínimo em /admin/configuracoes. Commit.

AGENTE 3: Página /admin/financeiro — resumo por tipo, lista de faturas com filtros, baixa manual, gerar faturas do mês, card GymPass com progresso, preparação Asaas. Commit.

AGENTE 4: Dashboard admin — card inadimplentes, card GymPass/TotalPass com progresso e alertas enviados, badge financeiro no sidebar. CRON route app/api/cron/checkin-alerts para alerta automático quando aluno GymPass está abaixo do mínimo nos últimos 7 dias do mês. Notificação para aluno + responsável + dono. Commit.

AGENTE 5: Seed com dados financeiros variados (particular, GymPass, cortesia, bolsista), testes E2E, build, push, deploy.

Supabase real. isMock() branching. PT-BR. CSS vars --bb-*. Valores em centavos no banco, R$ formatado na UI. Comece agora.
```
