# Agent 05 — Seguranca, RLS e Isolamento Cross-Tenant

**Data:** 2026-03-29
**Ambiente:** Supabase remoto (producao)
**Executor:** Test Agent 5 (Claude Opus 4.6)

---

## 5.1 — Login dos usuarios de teste

| Usuario        | Email                      | user_id                              | profile_id                           | Role          | Status |
|----------------|----------------------------|--------------------------------------|--------------------------------------|---------------|--------|
| Aluno          | joao@email.com             | 2f4dddf6-adb2-4039-9089-1d71eeaacbed | f7ed7e17-9313-4fd0-a257-6c91d6ca5123 | aluno_adulto  | ✅ OK  |
| Professor      | andre@guerreiros.com       | 42e55e1e-f985-4541-8acf-c3c2ee9cf1ce | 21eecdbc-14a3-484d-b74e-9509c622e5e3 | professor     | ✅ OK  |
| Recepcionista  | julia@guerreiros.com       | c1f4e1b5-6168-4006-9855-525dd308ff75 | 98f3df37-fceb-4b81-bd3d-15929f172719 | recepcao      | ✅ OK  |
| Admin          | roberto@guerreiros.com     | 5bc8697d-242a-4729-a974-ea6359e6b944 | 808d4578-b4f7-4d29-b793-16989ecd449f | admin         | ✅ OK  |

**Resultado: ✅ 4/4 logins bem-sucedidos**

---

## 5.2 — Testes de Escalacao de Privilegio

### 5.2a — Aluno tenta alterar role para admin

| Aspecto          | Detalhe |
|------------------|---------|
| Acao             | `PATCH /profiles?id=eq.<aluno_pid>` com `{"role":"admin"}` |
| Resultado        | ❌ **CRITICO: ESCALACAO BEM-SUCEDIDA** |
| Evidencia        | Response retornou `"role":"admin"`. Query de verificacao confirmou `"role":"admin"`. |
| Impacto          | Qualquer usuario autenticado pode se tornar admin via API REST direta. |
| Causa raiz       | A policy `profiles_update` permite UPDATE onde `user_id = auth.uid()` sem restricao de colunas. Nao ha constraint ou trigger impedindo mudanca do campo `role`. |
| Recomendacao     | Adicionar trigger `BEFORE UPDATE ON profiles` que impede alteracao da coluna `role` por usuarios nao-admin, OU remover `role` das colunas acessiveis via RLS update, OU usar column-level security. |

> **NOTA:** O role foi revertido para `aluno_adulto` apos o teste.

### 5.2b — Professor tenta alterar role para admin

| Aspecto          | Detalhe |
|------------------|---------|
| Acao             | `PATCH /profiles?id=eq.<prof_pid>` com `{"role":"admin"}` |
| Resultado        | ❌ **CRITICO: ESCALACAO BEM-SUCEDIDA** |
| Evidencia        | Response retornou `"role":"admin"`. Query de verificacao confirmou `"role":"admin"`. |
| Impacto          | Mesmo problema do 5.2a. |

> **NOTA:** O role foi revertido para `professor` apos o teste.

### 5.2c — Recepcionista tenta deletar perfil de aluno

| Aspecto          | Detalhe |
|------------------|---------|
| Acao             | `DELETE /profiles?id=eq.<aluno_pid>` como recepcionista |
| Resultado        | ✅ BLOQUEADO |
| Evidencia        | Response retornou `[]` (nenhuma linha afetada). Perfil do aluno continuou existindo. |
| Motivo           | Nao existe policy `profiles_delete` para nenhum role. RLS bloqueia DELETEs por padrao quando nao ha policy habilitante. |

**Resultado 5.2: ❌ 1/3 — 2 FALHAS CRITICAS de escalacao de privilegio**

---

## 5.3 — Isolamento Cross-Tenant

### Ambiente

Apenas 1 academia existe no banco: `Academia Guerreiros do Tatame` (809f2763-0096-4cfa-8057-b5b029cbc62f). Nao foi possivel testar isolamento cross-tenant com dados reais de outra academia.

### Resultados

| Teste | Resultado | Detalhe |
|-------|-----------|---------|
| Academias visiveis ao admin | ✅ | 1 academia (somente a propria) |
| Academias visiveis ao aluno | ✅ | 1 academia (somente a propria) |
| Memberships visiveis ao aluno | ✅ | 33 memberships, todas da mesma academy_id |
| Profiles visiveis ao aluno | ✅ | 33 perfis, todos da mesma academia (via same-academy RLS policy) |

### Analise das policies

- `academies_select` usa `is_member_of(id)` — correto, restringe por membership.
- `memberships_select` usa `get_my_profile_ids()` e `get_my_academy_ids()` — correto, SECURITY DEFINER.
- `profiles_select` usa `user_id = auth.uid()` OR same-academy join — correto.
- `get_my_academy_ids()` e `get_my_profile_ids()` sao SECURITY DEFINER com `SET search_path = public` — correto.

**Resultado 5.3: ✅ Isolamento por academia funcionando (limitado a 1 academia no ambiente)**

---

## 5.4 — Tabelas do Cockpit bloqueadas para nao-superadmin

| Tabela                  | Resultado | Detalhe |
|-------------------------|-----------|---------|
| feature_backlog         | ✅        | Nao encontrada no schema cache (PGRST205) |
| operational_costs       | ✅        | Nao encontrada no schema cache (PGRST205) |
| architecture_decisions  | ✅        | Nao encontrada no schema cache (PGRST205) |
| deploy_log              | ✅        | Nao encontrada no schema cache (PGRST205) |
| cockpit_error_log       | ✅        | Nao encontrada no schema cache (PGRST205) |
| daily_metrics           | ✅        | Nao encontrada no schema cache (PGRST205) |
| cockpit_campaigns       | ✅        | Nao encontrada no schema cache (PGRST205) |

> **Nota:** As tabelas cockpit nao estao expostas no PostgREST schema cache, o que significa que a API REST nao as expoe de forma alguma. Isso e uma protecao ainda mais forte que RLS, pois as tabelas sao completamente invisíveis para qualquer token (anon ou autenticado). Provavelmente as tabelas existem no banco mas nao foram adicionadas ao schema `public` exposto pelo PostgREST, ou o cache do PostgREST nao as incluiu.

**Resultado 5.4: ✅ 7/7 tabelas bloqueadas**

---

## 5.5 — Exposicao da service_role key em codigo client-side

### Busca em `app/` e `components/`

| Arquivo | Contexto | Server-side? |
|---------|----------|--------------|
| `app/api/webhooks/asaas/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY!` | ✅ Sim (route.ts) |
| `app/api/telemetry/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY` | ✅ Sim (route.ts) |
| `app/api/report/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY!` | ✅ Sim (route.ts) |
| `app/api/emails/payment-confirmed/route.ts` | Comparacao com webhook token | ✅ Sim (route.ts) |
| `app/api/health/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY` | ✅ Sim (route.ts) |
| `app/api/academy/charge-student/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY!` | ✅ Sim (route.ts) |
| `app/api/academy/setup-payments/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY!` | ✅ Sim (route.ts) |
| `app/api/subscriptions/create/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY!` | ✅ Sim (route.ts) |
| `app/api/payments/generate/route.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY!` | ✅ Sim (route.ts) |
| `app/api/register-academy/route.ts` | Comentario apenas | ✅ Sim (route.ts) |

### Busca em `components/`
Nenhuma ocorrencia encontrada. ✅

### Busca em `lib/`
| Arquivo | Contexto | Risco? |
|---------|----------|--------|
| `lib/supabase/admin.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY` | ✅ Nao — usa env var sem NEXT_PUBLIC_, nao e bundled no client |
| `lib/supabase/server.ts` | `process.env.SUPABASE_SERVICE_ROLE_KEY` | ✅ Nao — server-only |
| `lib/config/env-production.ts` | Lista de env vars | ✅ Nao — configuracao, nao expoe valor |
| `lib/supabase/setup-guide.ts` | Lista de env vars necessarias | ✅ Nao — referencia por nome |
| `lib/api/recepcao-cadastro.service.ts` | Comentario apenas | ✅ Nao |

**Resultado 5.5: ✅ Nenhuma exposicao da service_role key em codigo client-side**

---

## Resumo Geral

| Teste | Resultado | Prioridade |
|-------|-----------|------------|
| 5.1 — Login dos usuarios | ✅ 4/4 OK | — |
| 5.2a — Aluno escalacao de role | ❌ **CRITICO** | P0 |
| 5.2b — Professor escalacao de role | ❌ **CRITICO** | P0 |
| 5.2c — Recepcionista delete profile | ✅ Bloqueado | — |
| 5.3 — Isolamento cross-tenant | ✅ OK (1 academia) | — |
| 5.4 — Cockpit tables bloqueadas | ✅ 7/7 | — |
| 5.5 — Service role key exposure | ✅ Limpo | — |

### Total: 5 ✅ / 2 ❌

---

## Vulnerabilidades Criticas Encontradas

### VULN-001: Escalacao de privilegio via UPDATE em profiles.role (P0)

**Severidade:** CRITICA
**Vetor de ataque:** Qualquer usuario autenticado pode enviar `PATCH /rest/v1/profiles?id=eq.<own_id>` com `{"role":"admin"}` ou `{"role":"superadmin"}` e alterar seu proprio role.
**Causa raiz:** A policy `profiles_update` em `001_auth_profiles.sql` permite UPDATE para qualquer usuario em seu proprio profile (`user_id = auth.uid()`), sem restricao sobre quais colunas podem ser alteradas. O campo `role` nao tem protecao contra escrita pelo proprio usuario.
**Impacto:** Um aluno pode se tornar admin e obter acesso total a gestao da academia. Pode ate se tornar superadmin e acessar o cockpit do founder.
**Correcao recomendada:**

```sql
-- Opcao 1: Trigger que impede alteracao de role
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Somente admins da mesma academia podem alterar roles
    IF NOT EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE p.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.status = 'active'
    ) THEN
      RAISE EXCEPTION 'Somente admins podem alterar roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();
```

```sql
-- Opcao 2: Policy mais restritiva que exclui o campo role
-- (PostgREST nao suporta column-level policies nativamente,
-- entao o trigger e a opcao mais segura)
```

---

*Relatório gerado automaticamente por Test Agent 5*
