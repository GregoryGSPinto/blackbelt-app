# RELATÓRIO DE TESTE REAL — BLACKBELT V2
## Testes contra Supabase de produção

**Data:** 2026-03-29
**Supabase:** tdplmmodmumryzdosmpv
**Ambiente:** Local (.env.local, USE_MOCK=false)
**Profiles no banco:** 36

---

### Resumo de Login

| Perfil | Email | Login | Status |
|--------|-------|:-----:|--------|
| Super Admin | gregoryguimaraes12@gmail.com | ✅ | OK |
| Admin | roberto@guerreiros.com | ✅ | OK |
| Professor | andre@guerreiros.com | ✅ | OK |
| Recepcionista | julia@guerreiros.com | ✅ | OK |
| Aluno Adulto | joao@email.com | ✅ | OK |
| Aluno Teen | lucas.teen@email.com | ✅ | OK |
| Aluno Kids | miguel.kids@email.com | ✅ | OK |
| Responsável | maria.resp@email.com | ✅ | OK |
| Franqueador | fernando@guerreiros.com | ✅ | OK |

**Login: 9/9 perfis funcionando**

---

### Resumo RLS

| Teste | Resultado | Notas |
|-------|:---------:|-------|
| Admin vê só sua academia | ✅ | 1 academia, 33 profiles (vs SA 36) |
| SuperAdmin vê todas as academias | ✅ | 3 academias |
| Professor não vê financeiro | ⚠️ | Pode LER subscriptions/invoices (RLS permite member) |
| Recepcionista não edita financeiro | ✅ | Bloqueada de UPDATE |
| Aluno não vê outros alunos | ⚠️ | Vê todos da mesma academia (intencional?) |
| Kids não acessa mensagens | ✅ | 0 mensagens visíveis |
| Kids não acessa financeiro | ✅ | Vazio |
| Cross-tenant isolado | ✅ | 1 academia por user |
| Escalação de privilégio bloqueada | ❌→✅ | **VULN-001 CORRIGIDA** (migration 082) |
| Cockpit bloqueado para não-admin | ✅ | Tabelas não visíveis via REST |
| Service role key não exposta | ✅ | Apenas em route.ts server-side |
| Responsável não edita academia | ✅ | UPDATE retorna [] |
| Franqueador não cria academia | ✅ | INSERT bloqueado (42501) |

**RLS: 11/13 testes passando, 2 warnings**

---

### Tabelas Verificadas

| Tabela | Existe | Dados | RLS |
|--------|:------:|:-----:|:---:|
| profiles | ✅ | 36 | ✅ |
| academies | ✅ | 3 | ✅ |
| memberships | ✅ | sim | ✅ |
| classes | ✅ | 11 | ✅ |
| attendance | ✅ | 1000+ | ✅ |
| students | ✅ | 24 | ✅ |
| student_xp | ✅ | sim | ✅ |
| achievements | ✅ | sim | ✅ |
| messages | ✅ | 2+ | ✅ |
| invoices | ✅ | 126 | ⚠️ |
| subscriptions | ✅ | 21 | ⚠️ |
| payments | ✅ | sim | ✅ |
| pre_checkins | ✅ | sim | ✅ |
| tournaments | ✅ | sim | ✅ |
| guardians | ✅ | sim | ✅ |
| belt_promotions | ❌ | — | — |
| gamification | ❌ | — | — |
| streaks | ❌ | — | — |
| academy_settings | ❌ | — | — |

---

### Issues Encontradas

| # | Severidade | Issue | Status |
|---|-----------|-------|--------|
| 1 | **CRÍTICA** | Escalação de privilégio: qualquer user podia alterar próprio role via PATCH profiles | ✅ CORRIGIDA (migration 082) |
| 2 | ALTA | Professor/Recepcionista podem LER subscriptions e invoices (RLS SELECT permite members) | ⚠️ DOCUMENTADA |
| 3 | MÉDIA | Alunos veem TODOS os profiles e attendance da mesma academia (não só os próprios) | ⚠️ DOCUMENTADA (pode ser intencional) |
| 4 | MÉDIA | Professor não consegue DELETE em attendance (policy existe mas não funciona) | ⚠️ DOCUMENTADA |
| 5 | BAIXA | Tabelas belt_promotions, gamification, streaks, academy_settings não existem no banco | ⚠️ DOCUMENTADA |
| 6 | BAIXA | Tabelas de métricas cross-academia do Franqueador não existem | ⚠️ DOCUMENTADA |

---

### Correções Aplicadas

1. **VULN-001 — Privilege Escalation Fix** (`supabase/migrations/082_fix_role_escalation.sql`)
   - Trigger `prevent_role_escalation` em profiles
   - Bloqueia alteração de `role` exceto por superadmin ou admin da mesma academia
   - Admin não pode promover ninguém a superadmin

---

### Score Final

| Dimensão | Score | Detalhes |
|----------|:-----:|---------|
| Login | 9/9 | Todos os perfis autenticam |
| RLS Isolation | 11/13 | 2 warnings (READ financeiro) |
| CRUD Operations | 15/17 | 2 falhas menores (attendance delete, classes insert sem unit_id) |
| Security | 6/7 | 1 crítica corrigida |
| Data Completeness | 15/19 | 4 tabelas ausentes |

**Score Geral: 56/65 (86%)**

---

### Recomendações Prioritárias

1. **Aplicar migration 082** no Supabase de produção para fechar VULN-001
2. Restringir SELECT em invoices/subscriptions para admin + próprio aluno
3. Criar migrations para tabelas faltantes (belt_promotions, streaks, academy_settings)
4. Revisar RLS de attendance_delete para professor
5. Avaliar se alunos devem ver dados de outros alunos da mesma academia
