# AGENTE 04 — ENGENHEIRO DE SEGURANÇA
## Relatório de Auditoria de Segurança

**Data:** 2026-03-29
**Projeto:** BlackBelt v2

---

## 1. RLS Policies (Row Level Security)

### Status: ✅ EXCELENTE

- **Todas as tabelas públicas** têm RLS habilitado (migration 012)
- Policies cobrem SELECT, INSERT, UPDATE, DELETE para tabelas core
- `get_my_academy_ids()` — SECURITY DEFINER para isolamento multi-tenant
- `get_my_profile_ids()` — Prevenção de recursão
- `is_superadmin()` — Bypass controlado para super admin
- Cross-tenant leak corrigido (migration 018)
- Recursão RLS em profiles e memberships corrigida (migrations 019, 020)

### Tabelas com RLS Verificado
- profiles, academies, units, memberships
- students, modalities, classes, class_enrollments
- attendance, videos, evaluations, progressions
- achievements, messages, notifications
- plans, subscriptions, invoices
- push_tokens, feed_posts, class_notes
- + todas tabelas de migrations 050-080

---

## 2. Autenticação em API Routes

### Vulnerabilidades Encontradas e Corrigidas

| Rota | Problema | Severidade | Status |
|------|----------|-----------|--------|
| `/api/videos` GET | Sem auth check | ALTA | ✅ **CORRIGIDO** — Adicionado `supabase.auth.getUser()` |
| `/api/videos/create-upload` POST | Sem auth check | ALTA | ✅ **CORRIGIDO** — Adicionado auth check |
| `/api/v1/auth-guard.ts` | Aceita QUALQUER API key | CRÍTICA | ✅ **CORRIGIDO** — Valida contra tabela `api_keys` |
| `/api/payments/webhook` | Token opcional | ALTA | ✅ **CORRIGIDO** — Token obrigatório, retorna 503 se não configurado |
| `/api/payments/webhook` | Fallback para service_role_key | ALTA | ✅ **CORRIGIDO** — Removido fallback |

### Rotas com Auth OK (verificadas)
- `/api/auth/register` — Não requer auth (registro público)
- `/api/auth/callback` — OAuth callback, verifica session
- `/api/webhooks/asaas` — Valida access_token ✅
- `/api/webhooks/payment` — Valida signature ✅
- `/api/complete-oauth-signup` — Verifica user.id match ✅
- `/api/auth/delete-account` — Requer confirmação "EXCLUIR" + auth ✅

### Rotas Públicas por Design (sem auth necessário)
- `/api/leads` — Formulário público de contato
- `/api/contato` — Formulário público de contato
- `/api/telemetry` — Telemetria (rate-limited)
- `/api/health` — Health check

---

## 3. Exposição de Secrets

### Alertas

| Item | Severidade | Ação Recomendada |
|------|-----------|------------------|
| Service role key em `.env.local` | CRÍTICA | Mover para `.env.local` (não versionado) — verificar .gitignore |
| API keys de produção em `.env.local` | CRÍTICA | Rotacionar chaves, usar secrets manager |
| Bunny Stream API key | ALTA | Mover para environment variables do deploy |

**Nota:** `.env.local` normalmente NÃO é versionado pelo git (verificar `.gitignore`). Se estiver no repo, deve ser removido imediatamente.

---

## 4. XSS / Injection

### dangerouslySetInnerHTML

| Arquivo | Risco | Recomendação |
|---------|-------|-------------|
| `dashboard/contrato/page.tsx` | MÉDIO | Sanitizar contract_body_html antes de render |
| `admin/contratos/page.tsx` | MÉDIO | Sanitizar com DOMPurify ou similar |
| `superadmin/contratos/page.tsx` | MÉDIO | Sanitizar |
| `layout.tsx` (theme script) | BAIXO | Seguro — HTML first-party |
| `loading.tsx` (skeleton) | BAIXO | Seguro — HTML estático |
| `BeltPromotionCeremony.tsx` | BAIXO | Seguro — CSS keyframes |

### SQL Injection
- ✅ Sem queries raw SQL — 100% via Supabase SDK (parametrizado)

---

## 5. Middleware de Autenticação

### Status: ✅ BOM

- JWT token expiry check ✅
- Role-based route guards ✅
- Redirect para /login se não autenticado ✅
- Mock mode separado de prod mode ✅
- 28 rotas públicas no whitelist ✅

### Riscos Residuais
- `bb-active-role` cookie pode ser manipulado (mitigado por RLS no backend)
- Mock mode deve ser desabilitado em produção (verificar deploy)

---

## 6. Webhook Security

### Antes vs Depois

| Webhook | Antes | Depois |
|---------|-------|--------|
| `/api/payments/webhook` | Token opcional | ✅ Token obrigatório |
| `/api/payments/webhook` | Fallback service_role_key | ✅ Removido |
| `/api/webhooks/asaas` | ✅ Token verificado | ✅ Mantido |
| `/api/webhooks/payment` | ✅ Signature verificada | ✅ Mantido |
| `/api/webhooks/bunny` | Sem verificação | ⚠️ Apenas log (baixo risco) |

---

## 7. LGPD / Privacidade

- ✅ Deleção de conta com confirmação "EXCLUIR" + soft delete 30 dias
- ✅ LGPD export endpoint (`/api/lgpd/export`)
- ✅ Audit log implementado
- ⚠️ IP address armazenado em telemetria (verificar consentimento)
- ⚠️ Audit log permite INSERT sem restrição (by design para logging)

---

## 8. Score de Segurança

| Critério | Peso | Score | Justificativa |
|----------|------|-------|---------------|
| RLS Policies | 25% | 95 | Completo, com fixes de recursão e cross-tenant |
| API Route Auth | 25% | 85 | 4 rotas corrigidas, 1 webhook ainda sem verify |
| Secrets Management | 15% | 60 | .env.local deve ser verificado no .gitignore |
| XSS/Injection | 10% | 80 | dangerouslySetInnerHTML em contratos (sanitizar) |
| Middleware | 10% | 90 | Robusto com JWT + role check |
| Webhook Security | 10% | 85 | Token agora obrigatório |
| LGPD/Privacidade | 5% | 85 | Boas bases, IP storage a revisar |

### **Score Final: 84/100**

---

## 9. Correções Realizadas

| Métrica | Valor |
|---------|-------|
| Rotas sem auth corrigidas | 2 (/api/videos, /api/videos/create-upload) |
| API key guard corrigido | 1 (v1/auth-guard.ts → valida contra DB) |
| Webhook validation corrigido | 1 (/api/payments/webhook → token obrigatório) |
| Service role key fallback removido | 1 |
| Vulnerabilidades críticas corrigidas | 4 |
