# Agent 03 — Aluno Adulto, Aluno Teen, Aluno Kids
**Data:** 2026-03-29
**Ambiente:** Supabase real (REST API direta)
**Executor:** Test Agent 3

---

## 3.1 — Login dos 3 perfis

| Perfil | Email | Status | user_id |
|--------|-------|--------|---------|
| Adulto | joao@email.com | ✅ LOGIN OK | `2f4dddf6-adb2-4039-9089-1d71eeaacbed` |
| Teen | lucas.teen@email.com | ✅ LOGIN OK | `4e0433fa-1185-46a6-af4b-187bd9c75b2b` |
| Kids | miguel.kids@email.com | ✅ LOGIN OK | `5300fcb0-7a12-47ab-b395-497813c36f5f` |

**Resultado: 3/3 logins bem-sucedidos**

---

## 3.2 — Aluno Adulto (Joao Pedro Almeida)

### 3.2a — Ver perfil proprio
- ✅ **PASS** — Perfil retornado via `profiles?user_id=eq.{id}`
  - `profile_id`: `f7ed7e17-9313-4fd0-a257-6c91d6ca5123`
  - `display_name`: "Joao Pedro Almeida"
  - `role`: "aluno_adulto"
  - `lifecycle_status`: "active"
- **Nota:** Query `profiles?id=eq.{user_id}` retorna vazio (id != user_id). O campo correto e `user_id`.

### 3.2b — Ver historico de frequencia
- ✅ **PASS** — 92 registros de presenca encontrados
  - Tabela: `attendance` filtrada por `student_id`
  - `student_id`: `00028980-89a9-4a68-8ee9-6e468806e71f`
  - Datas variadas: 2025-10 a 2026-03, method=manual

### 3.2c — Ver graduacao/faixa
- ✅ **PASS** — Registro na tabela `students`
  - `belt`: "blue" (faixa azul)
  - `academy_id`: `809f2763-0096-4cfa-8057-b5b029cbc62f`
  - `started_at`: 2025-07-25
- **Nota:** Tabela `student_progress` nao existe. Dados de graduacao estao em `students.belt`.

### 3.2d — Ver pagamentos
- ⚠️ **WARN** — Tabela `payments` retorna array vazio `[]`
  - Nenhum pagamento registrado para este aluno (pode ser dado esperado se nao ha pagamentos seed)
  - Tabela `student_contracts` tambem vazia

### 3.2e — Ver mensagens
- ✅ **PASS** — 2 mensagens diretas visiveis (professor <-> aluno)
  - Canal: "direct"
  - Conversa com professor sobre treino (armlock, transicao)

### 3.2f — Nao ver dados de OUTROS alunos (isolamento)
- ⚠️ **WARN — RLS PERMISSIVA** — Adulto ve dados alem do proprio:
  - **Profiles**: 33 perfis visiveis (todas as roles: superadmin, admin, professor, alunos, etc.)
  - **Students**: 24 registros de alunos visiveis (todos da mesma academia)
  - **Attendance**: 1000 registros visiveis (apenas 92 sao proprios)
  - **Justificativa parcial**: Todos os dados sao da mesma academia (`809f2763...`), entao o RLS esta scoped por academia via `get_my_academy_ids()`. Porem, um aluno nao deveria ver frequencia de outros alunos.

### 3.2g — Nao acessar tabelas cockpit
- ✅ **PASS** — Tabelas `operational_costs`, `feature_backlog`, `deploy_log` nao existem no schema publico (PGRST205)
  - `webhook_log`: existe, retorna `[]` (vazio)
  - `feature_usage`: existe, retorna `[]` (vazio)

---

## 3.3 — Aluno Teen (Lucas Gabriel Mendes)

### 3.3a — Ver perfil proprio
- ✅ **PASS** — Perfil retornado corretamente
  - `profile_id`: `7aa10b4e-d665-4b0a-8f5e-7c481b41ba41`
  - `display_name`: "Lucas Gabriel Mendes"
  - `role`: "aluno_teen"
  - `lifecycle_status`: "active"

### 3.3b — Ver registro de aluno
- ✅ **PASS** — Registro na tabela `students`
  - `student_id`: `b328b069-c6fd-4dfd-b303-b776c6f223a6`
  - `belt`: "yellow" (faixa amarela)
  - `started_at`: 2025-08-25

### 3.3c — XP / Gamificacao
- ✅ **PASS** — Tabela `student_xp` com dados
  - XP: 2450, Level: 8, Title: null
  - Tabela `gamification` nao existe; `gamification_xp` existe mas retorna vazio
  - Tabela `student_xp` e a principal fonte de dados de XP

### 3.3d — Conquistas (Achievements)
- ✅ **PASS** — 3 conquistas encontradas para o Teen
  - "Primeira Aula" (frequencia, xp=10)
  - "10 Aulas" (frequencia, xp=25)
  - "Faixa Amarela" (graduacao, xp=200)

### 3.3e — Streaks
- ❌ **FAIL — TABELAS NAO EXISTEM** — Nenhuma tabela de streak encontrada:
  - `streaks` — PGRST205
  - `student_streaks` — PGRST205
  - `attendance_streaks` — PGRST205
  - **Impacto**: Funcionalidade de streaks nao esta implementada no banco

### 3.3f — Leaderboard
- ⚠️ **WARN — TABELA NAO EXISTE, MAS DADOS DISPONIVEIS VIA student_xp**
  - `leaderboard` — PGRST205
  - `season_leaderboard` — PGRST205
  - Porem, `student_xp?order=xp.desc` retorna ranking funcional:
    1. xp=4850, level=15 (Centuriao)
    2. xp=3200, level=11 (Dedicado)
    3. xp=3100, level=10 (Top Teen)
    4. xp=2980, level=10 (Guerreira)
    5. xp=2600, level=9
  - Teen pode montar leaderboard a partir de `student_xp`, mas nao ha tabela dedicada

---

## 3.4 — Aluno Kids (Miguel Pereira)

### 3.4a — Ver perfil proprio
- ✅ **PASS** — Perfil retornado corretamente
  - `profile_id`: `e8c3db28-aa0b-4ad3-bc3c-20fa0c638316`
  - `display_name`: "Miguel Pereira"
  - `role`: "aluno_kids"
  - `lifecycle_status`: "active"

### 3.4b — Nao acessar mensagens
- ✅ **PASS** — `messages` retorna array vazio `[]`
  - `chat_messages` — tabela nao existe
  - `messaging_conversations` — tabela nao existe
  - `contact_messages` — vazio
  - Kids nao tem acesso a nenhuma mensagem

### 3.4c — Nao acessar chat
- ✅ **PASS** — Tabelas de chat nao existem no schema:
  - `chat_messages` — PGRST205
  - `messaging_conversations` — PGRST205
  - `conversations` — PGRST205

### 3.4d — Ver progresso
- ✅ **PASS** — Registro de aluno com dados de progresso:
  - `belt`: "white" (faixa branca)
  - `started_at`: 2025-10-25
  - `student_xp`: xp=500, level=2
  - Conquistas: 2 (Primeira Aula, 10 Aulas)
  - Frequencia: 35 registros

### 3.4e — Nao ver dados financeiros
- ✅ **PASS** — `payments` retorna array vazio `[]`

### 3.4f — Visibilidade de dados (isolamento)
- ⚠️ **WARN — MESMA QUESTAO DO ADULTO**
  - Kids ve 33 perfis e 24 registros de alunos (todos da mesma academia)
  - Esperado: Kids deveria ter visibilidade mais restrita

---

## Resumo

| # | Teste | Resultado | Notas |
|---|-------|-----------|-------|
| 3.1 | Login Adulto | ✅ PASS | |
| 3.1 | Login Teen | ✅ PASS | |
| 3.1 | Login Kids | ✅ PASS | |
| 3.2a | Adulto: ver perfil | ✅ PASS | user_id (nao id) e a FK |
| 3.2b | Adulto: frequencia | ✅ PASS | 92 registros |
| 3.2c | Adulto: graduacao | ✅ PASS | belt=blue |
| 3.2d | Adulto: pagamentos | ⚠️ WARN | Vazio (sem dados seed) |
| 3.2e | Adulto: mensagens | ✅ PASS | 2 mensagens diretas |
| 3.2f | Adulto: isolamento dados | ⚠️ WARN | Ve 33 perfis, 24 students, 1000 attendance (todos da mesma academia) |
| 3.2g | Adulto: cockpit bloqueado | ✅ PASS | Tabelas nao existem no schema |
| 3.3a | Teen: ver perfil | ✅ PASS | |
| 3.3b | Teen: registro aluno | ✅ PASS | belt=yellow |
| 3.3c | Teen: XP/gamificacao | ✅ PASS | xp=2450, level=8 |
| 3.3d | Teen: conquistas | ✅ PASS | 3 achievements |
| 3.3e | Teen: streaks | ❌ FAIL | Tabelas nao existem |
| 3.3f | Teen: leaderboard | ⚠️ WARN | Tabela dedicada nao existe, mas student_xp serve como fallback |
| 3.4a | Kids: ver perfil | ✅ PASS | |
| 3.4b | Kids: sem mensagens | ✅ PASS | 0 mensagens visiveis |
| 3.4c | Kids: sem chat | ✅ PASS | Tabelas nao existem |
| 3.4d | Kids: ver progresso | ✅ PASS | belt=white, xp=500, 2 achievements |
| 3.4e | Kids: sem financeiro | ✅ PASS | 0 payments |
| 3.4f | Kids: isolamento dados | ⚠️ WARN | Ve 33 perfis, 24 students |

**Totais: 15 PASS, 4 WARN, 1 FAIL**

---

## Problemas Encontrados

### ❌ Critico
1. **Streaks nao implementado** — Nenhuma tabela de streaks existe (`streaks`, `student_streaks`, `attendance_streaks`). Funcionalidade de gamificacao Teen esta incompleta.

### ⚠️ Atencao
2. **RLS por academia, nao por aluno** — Todos os alunos (Adulto, Teen, Kids) veem TODOS os perfis (33), TODOS os alunos (24) e TODA a frequencia (1000 registros) da mesma academia. O RLS usa `get_my_academy_ids()` que scopa por academia, mas nao restringe alunos a ver apenas seus proprios dados. Um aluno pode ver frequencia e dados de todos os outros alunos da mesma academia.
3. **Leaderboard sem tabela dedicada** — Nao ha tabela `leaderboard` ou `season_leaderboard`. O ranking e montado via query em `student_xp`, o que funciona mas nao oferece features como temporadas ou historico.
4. **Payments vazio** — Nenhum pagamento seed para nenhum aluno. Impossivel testar se RLS de payments esta correto por role.

---

*Relatorio gerado automaticamente por Test Agent 3*
