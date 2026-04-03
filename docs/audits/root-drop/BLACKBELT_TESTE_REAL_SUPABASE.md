# 🥋 BLACKBELT V2 — TESTE REAL SUPABASE (MULTI-AGENT TEAM)
# Simular TODOS os perfis contra o banco REAL
# ZERO mocks — tudo persistido no Supabase de produção

---

Este prompt testa o BlackBelt v2 inteiro contra o Supabase real. Cada Agent simula um grupo de perfis reais, faz login via API, testa CRUD, verifica RLS, e reporta tudo que falha. O que falhar é CORRIGIDO inline.

## PRÉ-REQUISITOS

Antes de QUALQUER teste, execute:

```bash
# 1. Carregar env vars
set -a && source .env.local && set +a

# 2. Confirmar que NÃO está em mock
echo "USE_MOCK = ${NEXT_PUBLIC_USE_MOCK}"
# DEVE ser "false" ou vazio. Se for "true", faça:
# export NEXT_PUBLIC_USE_MOCK=false

# 3. Confirmar Supabase conectado
echo "SUPABASE_URL = ${NEXT_PUBLIC_SUPABASE_URL}"
echo "ANON_KEY = ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo "SERVICE_KEY = ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

# 4. Verificar que as tabelas existem
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=count&limit=1" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Prefer: count=exact"
# DEVE retornar contagem, não erro

# 5. Verificar que users existem
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=email,role,display_name&order=role" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | head -80
```

Se algum pré-requisito falha, PARE e corrija antes de continuar. Se não tem users no banco, rode o seed:
```bash
npx tsx scripts/seed-auth-users.ts 2>/dev/null || npx tsx scripts/seed-test-users.ts 2>/dev/null || echo "SEED SCRIPT NOT FOUND — criar antes de continuar"
```

## CREDENCIAIS DE TESTE

```
SUPER ADMIN:
  gregoryguimaraes12@gmail.com / @Greg1994
  gregoryguimaraes12@gmail.com / @Greg1994

ADMIN (Dono da academia):
  roberto@guerreiros.com / BlackBelt@2026
  OU admin@guerreiros.com / BlackBelt@2026

PROFESSOR:
  andre@guerreiros.com / BlackBelt@2026
  OU professor@guerreiros.com / BlackBelt@2026

RECEPCIONISTA:
  julia@guerreiros.com / BlackBelt@2026
  OU recepcionista@guerreiros.com / BlackBelt@2026

ALUNO ADULTO:
  joao@email.com / BlackBelt@2026
  OU adulto@guerreiros.com / BlackBelt@2026

ALUNO TEEN:
  lucas.teen@email.com / BlackBelt@2026
  OU teen@guerreiros.com / BlackBelt@2026

ALUNO KIDS:
  miguel.kids@email.com / BlackBelt@2026
  OU kids@guerreiros.com / BlackBelt@2026

RESPONSÁVEL:
  maria.resp@email.com / BlackBelt@2026
  OU responsavel@guerreiros.com / BlackBelt@2026

FRANQUEADOR:
  fernando@guerreiros.com / BlackBelt@2026
  OU franqueador@guerreiros.com / BlackBelt@2026
```

Se um email não existir, tente o alternativo. Se nenhum existir, crie com service_role.

## HELPER DE LOGIN (reutilizar em todos os agents)

```bash
# Função para login e retornar token
login_user() {
  local EMAIL="$1"
  local PASS="$2"
  local LABEL="$3"
  
  RESPONSE=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
  
  TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | head -1 | sed 's/"access_token":"//;s/"//')
  USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
  ERROR=$(echo "$RESPONSE" | grep -o '"error_description":"[^"]*"' | sed 's/"error_description":"//;s/"//')
  
  if [ -z "$TOKEN" ]; then
    echo "❌ [$LABEL] LOGIN FALHOU: $EMAIL → $ERROR"
    return 1
  fi
  
  echo "✅ [$LABEL] LOGIN OK: $EMAIL (user_id: ${USER_ID:0:8}...)"
  echo "$TOKEN"
  return 0
}

# Função para query autenticada
query_as() {
  local TOKEN="$1"
  local TABLE="$2"
  local FILTER="$3"
  local SELECT="${4:-*}"
  
  curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?${FILTER}&select=${SELECT}" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Prefer: return=representation"
}

# Função para INSERT autenticado
insert_as() {
  local TOKEN="$1"
  local TABLE="$2"
  local DATA="$3"
  
  curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$DATA"
}

# Função para UPDATE autenticado
update_as() {
  local TOKEN="$1"
  local TABLE="$2"
  local FILTER="$3"
  local DATA="$4"
  
  curl -s -X PATCH "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?${FILTER}" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$DATA"
}

# Função para DELETE autenticado
delete_as() {
  local TOKEN="$1"
  local TABLE="$2"
  local FILTER="$3"
  
  curl -s -X DELETE "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?${FILTER}" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Prefer: return=representation"
}
```

---

## REGRAS DE EXECUÇÃO

1. Defina as funções helper acima no início (copie para um script temporário se necessário)
2. Execute os PRÉ-REQUISITOS
3. Depois use **5 Agent() em paralelo** para os testes
4. Cada Agent gera relatório em `/docs/test/`
5. O que FALHAR deve ser CORRIGIDO inline pelo Agent
6. Após todos os Agents, faça verificação cruzada + build + commit

## ORDEM DE EXECUÇÃO

```
PRÉ-REQUISITOS (sequencial) → verificar env, Supabase, users
↓
5 AGENTS EM PARALELO:
  Agent("Test: Admin + Super Admin")
  Agent("Test: Professor + Recepcionista")
  Agent("Test: Alunos (Adulto + Teen + Kids)")
  Agent("Test: Responsável + Franqueador")
  Agent("Test: RLS + Segurança + Cross-tenant")
↓
VERIFICAÇÃO FINAL (sequencial) → build + relatório consolidado
```

---

# ═══════════════════════════════════════════
# AGENT 1: ADMIN + SUPER ADMIN
# ═══════════════════════════════════════════

**Perfis testados:** super_admin (gregoryguimaraes12@gmail.com) + admin (roberto@guerreiros.com)

## 1.1 — Login

```bash
# Login Super Admin
SA_TOKEN=$(login_user "gregoryguimaraes12@gmail.com" "@Greg1994" "SUPER_ADMIN")
if [ $? -ne 0 ]; then
  # Tentar alternativo
  SA_TOKEN=$(login_user "gregoryguimaraes12@gmail.com" "@Greg1994" "SUPER_ADMIN_ALT")
fi

# Login Admin
ADMIN_TOKEN=$(login_user "roberto@guerreiros.com" "BlackBelt@2026" "ADMIN")
if [ $? -ne 0 ]; then
  ADMIN_TOKEN=$(login_user "admin@guerreiros.com" "BlackBelt@2026" "ADMIN_ALT")
fi
```

Se AMBOS falharem para um perfil, CRIE o user usando service_role:
```bash
curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"EMAIL","password":"PASS","email_confirm":true}'
```
E insira profile correspondente.

## 1.2 — Super Admin: Queries de gestão global

```bash
echo "=== SUPER ADMIN: Ver todas as academias ==="
query_as "$SA_TOKEN" "academies" "select=id,name,status,plan" "id,name,status,plan"

echo "=== SUPER ADMIN: Ver todos os perfis ==="
query_as "$SA_TOKEN" "profiles" "select=id,email,role,display_name&limit=20" "id,email,role,display_name"

echo "=== SUPER ADMIN: Contar users por role ==="
for ROLE in super_admin admin professor recepcionista aluno_adulto aluno_teen aluno_kids responsavel franqueador; do
  COUNT=$(query_as "$SA_TOKEN" "profiles" "role=eq.${ROLE}&select=id" "id" | grep -o '"id"' | wc -l)
  echo "  $ROLE: $COUNT"
done

echo "=== SUPER ADMIN: Ver campeonatos (compete) ==="
query_as "$SA_TOKEN" "tournaments" "select=id,name,status&limit=5" "id,name,status" 2>/dev/null || echo "  (tabela não existe ou vazia)"
```

**Verificações:**
- Super Admin VÊ dados de TODAS as academias? Se não → RLS incorreto
- Super Admin VÊ todos os perfis? Se não → RLS incorreto
- Contagem de roles bate com o seed? Se não → seed incompleto

## 1.3 — Admin: CRUD da academia

```bash
echo "=== ADMIN: Ver minha academia ==="
query_as "$ADMIN_TOKEN" "academies" "select=id,name,status,plan" "id,name,status,plan"
# DEVE retornar APENAS a academia do admin, não todas

echo "=== ADMIN: Ver alunos da minha academia ==="
# Descobrir academy_id
ACAD_ID=$(query_as "$ADMIN_TOKEN" "profiles" "select=academy_id&user_id=eq.ME" "academy_id" | grep -o '"academy_id":"[^"]*"' | head -1 | sed 's/"academy_id":"//;s/"//')
echo "  Academy ID: $ACAD_ID"

query_as "$ADMIN_TOKEN" "profiles" "academy_id=eq.${ACAD_ID}&role=in.(aluno_adulto,aluno_teen,aluno_kids)&select=display_name,role,email" "display_name,role,email"

echo "=== ADMIN: Ver turmas ==="
query_as "$ADMIN_TOKEN" "classes" "select=id,name,modality,schedule&limit=10" "id,name,modality,schedule" 2>/dev/null || echo "  (tabela classes não encontrada)"

echo "=== ADMIN: Ver presenças de hoje ==="
TODAY=$(date +%Y-%m-%d)
query_as "$ADMIN_TOKEN" "attendance" "check_in_date=eq.${TODAY}&select=id,profile_id,check_in_date" "id,profile_id,check_in_date" 2>/dev/null || echo "  (tabela attendance não encontrada)"

echo "=== ADMIN: Ver pagamentos/faturas ==="
query_as "$ADMIN_TOKEN" "payments" "select=id,status,amount,due_date&limit=5&order=due_date.desc" "id,status,amount,due_date" 2>/dev/null || \
query_as "$ADMIN_TOKEN" "invoices" "select=id,status,amount,due_date&limit=5&order=due_date.desc" "id,status,amount,due_date" 2>/dev/null || echo "  (tabela payments/invoices não encontrada)"
```

**Verificações:**
- Admin vê APENAS sua academia? Se vê outras → RLS QUEBRADO (CRÍTICO)
- Admin vê alunos da sua academia? Se não → query ou RLS incorreto
- Turmas, presenças, pagamentos existem? Se não → seed incompleto

## 1.4 — Admin: Testar ESCRITA

```bash
echo "=== ADMIN: Criar turma de teste ==="
NEW_CLASS=$(insert_as "$ADMIN_TOKEN" "classes" "{
  \"name\": \"Turma Teste API\",
  \"academy_id\": \"${ACAD_ID}\",
  \"modality\": \"jiu_jitsu\",
  \"schedule\": \"Seg/Qua/Sex 19h\"
}")
echo "$NEW_CLASS"
CLASS_ID=$(echo "$NEW_CLASS" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

if [ -n "$CLASS_ID" ]; then
  echo "  ✅ Turma criada: $CLASS_ID"
  
  echo "=== ADMIN: Atualizar turma ==="
  update_as "$ADMIN_TOKEN" "classes" "id=eq.${CLASS_ID}" '{"name":"Turma Teste Atualizada"}'
  
  echo "=== ADMIN: Deletar turma de teste ==="
  delete_as "$ADMIN_TOKEN" "classes" "id=eq.${CLASS_ID}"
  echo "  ✅ Turma deletada (cleanup)"
else
  echo "  ❌ FALHA ao criar turma — verificar RLS INSERT policy"
fi
```

## 1.5 — Admin: Testar funcionalidades específicas

```bash
echo "=== ADMIN: Pre-check-in (se existir) ==="
query_as "$ADMIN_TOKEN" "pre_checkins" "select=id,status&limit=5" "id,status" 2>/dev/null || echo "  (pre_checkins não existe)"

echo "=== ADMIN: Graduações/Faixas ==="
query_as "$ADMIN_TOKEN" "belt_promotions" "select=id,student_id,from_belt,to_belt&limit=5" "id,student_id,from_belt,to_belt" 2>/dev/null || \
query_as "$ADMIN_TOKEN" "graduations" "select=*&limit=5" 2>/dev/null || echo "  (tabela de graduações não encontrada)"

echo "=== ADMIN: Configurações da academia ==="
query_as "$ADMIN_TOKEN" "academy_settings" "select=*&limit=1" 2>/dev/null || echo "  (academy_settings não existe — pode estar no JSONB de academies)"
```

## 1.6 — Gerar relatório

Gere `/docs/test/AGENT_01_ADMIN_SUPERADMIN.md` com:
- Resultado de cada teste (✅/❌)
- Tabelas que existem vs não existem
- RLS que funciona vs não funciona
- Dados que existem vs faltam
- O que foi corrigido inline

```bash
git add -A && git commit -m "test-real: agent-01-admin-superadmin"
```

---

# ═══════════════════════════════════════════
# AGENT 2: PROFESSOR + RECEPCIONISTA
# ═══════════════════════════════════════════

**Perfis testados:** professor (andre@guerreiros.com) + recepcionista (julia@guerreiros.com)

## 2.1 — Login

```bash
PROF_TOKEN=$(login_user "andre@guerreiros.com" "BlackBelt@2026" "PROFESSOR")
if [ $? -ne 0 ]; then
  PROF_TOKEN=$(login_user "professor@guerreiros.com" "BlackBelt@2026" "PROF_ALT")
fi

RECEP_TOKEN=$(login_user "julia@guerreiros.com" "BlackBelt@2026" "RECEPCIONISTA")
if [ $? -ne 0 ]; then
  RECEP_TOKEN=$(login_user "recepcionista@guerreiros.com" "BlackBelt@2026" "RECEP_ALT")
fi
```

## 2.2 — Professor: Minhas turmas e chamada

```bash
echo "=== PROFESSOR: Ver meu perfil ==="
query_as "$PROF_TOKEN" "profiles" "select=id,display_name,role,academy_id" "id,display_name,role,academy_id"

echo "=== PROFESSOR: Ver minhas turmas ==="
PROF_ID=$(query_as "$PROF_TOKEN" "profiles" "select=id" "id" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
query_as "$PROF_TOKEN" "classes" "professor_id=eq.${PROF_ID}&select=id,name,modality" "id,name,modality" 2>/dev/null || \
query_as "$PROF_TOKEN" "classes" "select=id,name,modality&limit=5" "id,name,modality" 2>/dev/null || echo "  (sem turmas)"

echo "=== PROFESSOR: Registrar presença ==="
# Buscar um aluno da academia
ALUNO_ID=$(query_as "$PROF_TOKEN" "profiles" "role=eq.aluno_adulto&select=id" "id" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
if [ -n "$ALUNO_ID" ]; then
  TODAY=$(date +%Y-%m-%d)
  ATTENDANCE=$(insert_as "$PROF_TOKEN" "attendance" "{
    \"profile_id\": \"${ALUNO_ID}\",
    \"check_in_date\": \"${TODAY}\",
    \"check_in_time\": \"$(date +%H:%M:%S)\",
    \"type\": \"manual\",
    \"registered_by\": \"${PROF_ID}\"
  }")
  ATT_ID=$(echo "$ATTENDANCE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
  if [ -n "$ATT_ID" ]; then
    echo "  ✅ Presença registrada: $ATT_ID"
    delete_as "$PROF_TOKEN" "attendance" "id=eq.${ATT_ID}"
    echo "  ✅ Cleanup: presença removida"
  else
    echo "  ❌ FALHA ao registrar presença"
    echo "  Response: $ATTENDANCE"
  fi
else
  echo "  ⚠️ Nenhum aluno encontrado para testar presença"
fi

echo "=== PROFESSOR: Ver histórico de presenças ==="
query_as "$PROF_TOKEN" "attendance" "select=id,profile_id,check_in_date&limit=10&order=check_in_date.desc" "id,profile_id,check_in_date" 2>/dev/null

echo "=== PROFESSOR: Não deve ver dados financeiros ==="
FINANCEIRO=$(query_as "$PROF_TOKEN" "payments" "select=id,amount&limit=1" "id,amount" 2>&1)
if echo "$FINANCEIRO" | grep -q '"id"'; then
  echo "  ❌ PROFESSOR VÊ PAGAMENTOS — RLS QUEBRADO!"
else
  echo "  ✅ Professor bloqueado de ver pagamentos"
fi
```

## 2.3 — Recepcionista: Check-in e cadastro

```bash
echo "=== RECEPCIONISTA: Ver alunos para check-in ==="
query_as "$RECEP_TOKEN" "profiles" "role=in.(aluno_adulto,aluno_teen,aluno_kids)&select=id,display_name,role&limit=10" "id,display_name,role"

echo "=== RECEPCIONISTA: Registrar check-in ==="
# Similar ao professor — testar insert em attendance
RECEP_PROFILE=$(query_as "$RECEP_TOKEN" "profiles" "select=id,academy_id" "id,academy_id" | head -5)
echo "  Perfil: $RECEP_PROFILE"

echo "=== RECEPCIONISTA: Não deve editar financeiro ==="
EDIT_RESULT=$(update_as "$RECEP_TOKEN" "payments" "limit=1" '{"status":"paid"}' 2>&1)
if echo "$EDIT_RESULT" | grep -qi "error\|denied\|permission\|policy"; then
  echo "  ✅ Recepcionista bloqueada de editar pagamentos"
else
  echo "  ❌ RECEPCIONISTA EDITOU PAGAMENTOS — RLS QUEBRADO!"
fi

echo "=== RECEPCIONISTA: Não deve ver dados de OUTRAS academias ==="
ALL_PROFILES=$(query_as "$RECEP_TOKEN" "profiles" "select=academy_id" "academy_id")
DISTINCT_ACAD=$(echo "$ALL_PROFILES" | grep -o '"academy_id":"[^"]*"' | sort -u | wc -l)
if [ "$DISTINCT_ACAD" -le 1 ]; then
  echo "  ✅ Recepcionista vê apenas sua academia"
else
  echo "  ❌ RECEPCIONISTA VÊ MÚLTIPLAS ACADEMIAS — RLS QUEBRADO!"
fi
```

## 2.4 — Gerar relatório

Gere `/docs/test/AGENT_02_PROFESSOR_RECEPCIONISTA.md`

```bash
git add -A && git commit -m "test-real: agent-02-professor-recepcionista"
```

---

# ═══════════════════════════════════════════
# AGENT 3: ALUNOS (Adulto + Teen + Kids)
# ═══════════════════════════════════════════

**Perfis testados:** aluno_adulto, aluno_teen, aluno_kids

## 3.1 — Login dos 3 perfis

```bash
ADULTO_TOKEN=$(login_user "joao@email.com" "BlackBelt@2026" "ALUNO_ADULTO")
[ $? -ne 0 ] && ADULTO_TOKEN=$(login_user "adulto@guerreiros.com" "BlackBelt@2026" "ADULTO_ALT")

TEEN_TOKEN=$(login_user "lucas.teen@email.com" "BlackBelt@2026" "ALUNO_TEEN")
[ $? -ne 0 ] && TEEN_TOKEN=$(login_user "teen@guerreiros.com" "BlackBelt@2026" "TEEN_ALT")

KIDS_TOKEN=$(login_user "miguel.kids@email.com" "BlackBelt@2026" "ALUNO_KIDS")
[ $? -ne 0 ] && KIDS_TOKEN=$(login_user "kids@guerreiros.com" "BlackBelt@2026" "KIDS_ALT")
```

## 3.2 — Aluno Adulto: Dashboard pessoal

```bash
echo "=== ADULTO: Meu perfil ==="
query_as "$ADULTO_TOKEN" "profiles" "select=id,display_name,role,academy_id" "id,display_name,role,academy_id"

echo "=== ADULTO: Meu histórico de presenças ==="
ADULTO_ID=$(query_as "$ADULTO_TOKEN" "profiles" "select=id" "id" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
query_as "$ADULTO_TOKEN" "attendance" "profile_id=eq.${ADULTO_ID}&select=id,check_in_date&order=check_in_date.desc&limit=10" "id,check_in_date"

echo "=== ADULTO: Minha graduação ==="
query_as "$ADULTO_TOKEN" "students" "profile_id=eq.${ADULTO_ID}&select=belt,stripes" "belt,stripes" 2>/dev/null

echo "=== ADULTO: Meus pagamentos ==="
query_as "$ADULTO_TOKEN" "payments" "select=id,status,amount,due_date&order=due_date.desc&limit=5" "id,status,amount,due_date" 2>/dev/null

echo "=== ADULTO: Não deve ver dados de OUTROS alunos ==="
OUTROS=$(query_as "$ADULTO_TOKEN" "profiles" "role=eq.aluno_adulto&select=id" "id" | grep -o '"id"' | wc -l)
if [ "$OUTROS" -le 1 ]; then
  echo "  ✅ Aluno vê apenas seu próprio perfil"
else
  echo "  ⚠️ Aluno vê $OUTROS perfis — verificar se RLS permite ver colegas da mesma academia (pode ser intencional)"
fi

echo "=== ADULTO: Não deve ver dados admin ==="
ADMIN_DATA=$(query_as "$ADULTO_TOKEN" "operational_costs" "select=id&limit=1" "id" 2>&1)
if echo "$ADMIN_DATA" | grep -q '"id"'; then
  echo "  ❌ ALUNO VÊ CUSTOS OPERACIONAIS — RLS QUEBRADO!"
else
  echo "  ✅ Aluno bloqueado de dados admin"
fi
```

## 3.3 — Aluno Teen: Gamificação

```bash
echo "=== TEEN: Meu perfil ==="
query_as "$TEEN_TOKEN" "profiles" "select=id,display_name,role" "id,display_name,role"
TEEN_ID=$(query_as "$TEEN_TOKEN" "profiles" "select=id" "id" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

echo "=== TEEN: XP e gamificação ==="
query_as "$TEEN_TOKEN" "gamification" "profile_id=eq.${TEEN_ID}&select=xp,level,badges" 2>/dev/null || \
query_as "$TEEN_TOKEN" "student_xp" "profile_id=eq.${TEEN_ID}&select=*" 2>/dev/null || \
echo "  (tabela de gamificação não encontrada — verificar nome)"

echo "=== TEEN: Streaks ==="
query_as "$TEEN_TOKEN" "streaks" "profile_id=eq.${TEEN_ID}&select=*" 2>/dev/null || echo "  (streaks não encontrada)"

echo "=== TEEN: Leaderboard ==="
query_as "$TEEN_TOKEN" "leaderboard" "select=*&limit=10" 2>/dev/null || echo "  (leaderboard não encontrada)"
```

## 3.4 — Aluno Kids: Restrições

```bash
echo "=== KIDS: Meu perfil ==="
query_as "$KIDS_TOKEN" "profiles" "select=id,display_name,role" "id,display_name,role"
KIDS_ID=$(query_as "$KIDS_TOKEN" "profiles" "select=id" "id" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

echo "=== KIDS: NÃO deve acessar mensagens ==="
MSGS=$(query_as "$KIDS_TOKEN" "messages" "select=id&limit=1" "id" 2>&1)
if echo "$MSGS" | grep -q '"id"'; then
  echo "  ❌ KIDS ACESSA MENSAGENS — DEVE SER BLOQUEADO!"
else
  echo "  ✅ Kids bloqueado de mensagens"
fi

echo "=== KIDS: NÃO deve acessar chat ==="
CHAT=$(query_as "$KIDS_TOKEN" "chat_messages" "select=id&limit=1" "id" 2>&1)
if echo "$CHAT" | grep -q '"id"'; then
  echo "  ❌ KIDS ACESSA CHAT — DEVE SER BLOQUEADO!"
else
  echo "  ✅ Kids bloqueado de chat"
fi

echo "=== KIDS: Deve ver progresso simplificado ==="
query_as "$KIDS_TOKEN" "students" "profile_id=eq.${KIDS_ID}&select=belt,stripes" "belt,stripes" 2>/dev/null

echo "=== KIDS: NÃO deve ver dados financeiros ==="
FIN=$(query_as "$KIDS_TOKEN" "payments" "select=id&limit=1" "id" 2>&1)
if echo "$FIN" | grep -q '"id"'; then
  echo "  ❌ KIDS VÊ PAGAMENTOS — DEVE SER BLOQUEADO!"
else
  echo "  ✅ Kids bloqueado de financeiro"
fi
```

## 3.5 — Gerar relatório

Gere `/docs/test/AGENT_03_ALUNOS.md`

```bash
git add -A && git commit -m "test-real: agent-03-alunos-adulto-teen-kids"
```

---

# ═══════════════════════════════════════════
# AGENT 4: RESPONSÁVEL + FRANQUEADOR
# ═══════════════════════════════════════════

**Perfis testados:** responsavel + franqueador

## 4.1 — Login

```bash
RESP_TOKEN=$(login_user "maria.resp@email.com" "BlackBelt@2026" "RESPONSAVEL")
[ $? -ne 0 ] && RESP_TOKEN=$(login_user "responsavel@guerreiros.com" "BlackBelt@2026" "RESP_ALT")

FRANQ_TOKEN=$(login_user "fernando@guerreiros.com" "BlackBelt@2026" "FRANQUEADOR")
[ $? -ne 0 ] && FRANQ_TOKEN=$(login_user "franqueador@guerreiros.com" "BlackBelt@2026" "FRANQ_ALT")
```

## 4.2 — Responsável: Ver filhos

```bash
echo "=== RESPONSÁVEL: Meu perfil ==="
query_as "$RESP_TOKEN" "profiles" "select=id,display_name,role,academy_id" "id,display_name,role,academy_id"
RESP_ID=$(query_as "$RESP_TOKEN" "profiles" "select=id" "id" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')

echo "=== RESPONSÁVEL: Meus dependentes (filhos) ==="
query_as "$RESP_TOKEN" "guardian_links" "guardian_id=eq.${RESP_ID}&select=*" 2>/dev/null || \
query_as "$RESP_TOKEN" "guardian_students" "guardian_profile_id=eq.${RESP_ID}&select=*" 2>/dev/null || \
query_as "$RESP_TOKEN" "dependents" "guardian_id=eq.${RESP_ID}&select=*" 2>/dev/null || \
echo "  (tabela de guardian links não encontrada — verificar nome)"

echo "=== RESPONSÁVEL: Presenças dos filhos ==="
# Buscar IDs dos filhos do guardian_links e depois attendance
echo "  (depende da estrutura do guardian_links)"

echo "=== RESPONSÁVEL: Pagamentos ==="
query_as "$RESP_TOKEN" "payments" "select=id,status,amount,due_date&limit=5" "id,status,amount,due_date" 2>/dev/null

echo "=== RESPONSÁVEL: Não deve editar dados da academia ==="
EDIT=$(update_as "$RESP_TOKEN" "academies" "limit=1" '{"name":"HACKEADO"}' 2>&1)
if echo "$EDIT" | grep -qi "error\|denied\|policy\|\[\]"; then
  echo "  ✅ Responsável não pode editar academia"
else
  echo "  ❌ RESPONSÁVEL EDITOU ACADEMIA — RLS QUEBRADO!"
fi
```

## 4.3 — Franqueador: Visão multi-academia

```bash
echo "=== FRANQUEADOR: Meu perfil ==="
query_as "$FRANQ_TOKEN" "profiles" "select=id,display_name,role,academy_id" "id,display_name,role,academy_id"

echo "=== FRANQUEADOR: Academias que gerencio ==="
query_as "$FRANQ_TOKEN" "academies" "select=id,name,status,plan" "id,name,status,plan" 2>/dev/null
# Franqueador deve ver MÚLTIPLAS academias (ou as que estão vinculadas a ele)

echo "=== FRANQUEADOR: Métricas consolidadas ==="
# Verificar se existe tabela ou view de métricas cross-academia
query_as "$FRANQ_TOKEN" "academy_metrics" "select=*&limit=5" 2>/dev/null || echo "  (métricas consolidadas não implementadas ainda)"

echo "=== FRANQUEADOR: Não deve criar/deletar academias ==="
CREATE=$(insert_as "$FRANQ_TOKEN" "academies" '{"name":"ACADEMIA FANTASMA","status":"active"}' 2>&1)
if echo "$CREATE" | grep -qi "error\|denied\|policy"; then
  echo "  ✅ Franqueador não pode criar academias"
else
  echo "  ❌ FRANQUEADOR CRIOU ACADEMIA — RLS QUEBRADO! Deletar imediatamente."
  GHOST_ID=$(echo "$CREATE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
  [ -n "$GHOST_ID" ] && delete_as "$FRANQ_TOKEN" "academies" "id=eq.${GHOST_ID}" 2>/dev/null
fi
```

## 4.4 — Gerar relatório

Gere `/docs/test/AGENT_04_RESPONSAVEL_FRANQUEADOR.md`

```bash
git add -A && git commit -m "test-real: agent-04-responsavel-franqueador"
```

---

# ═══════════════════════════════════════════
# AGENT 5: RLS + SEGURANÇA + CROSS-TENANT
# ═══════════════════════════════════════════

**Missão:** Testar que o isolamento de dados funciona corretamente.

## 5.1 — Cross-tenant isolation

```bash
# Login com 2 perfis de academias DIFERENTES (se existirem)
# Se só existe 1 academia, criar uma segunda temporária via service_role

echo "=== TESTE: Aluno da academia A NÃO vê dados da academia B ==="
# Se tiver tokens de 2 academias diferentes:
# query_as "$ALUNO_ACAD_A" "profiles" "academy_id=eq.ACAD_B_ID&select=id" "id"
# DEVE retornar vazio

echo "=== TESTE: Admin da academia A NÃO edita academia B ==="
# update_as "$ADMIN_ACAD_A" "academies" "id=eq.ACAD_B_ID" '{"name":"HACKEADO"}'
# DEVE falhar
```

## 5.2 — Escalação de privilégio

```bash
echo "=== TESTE: Aluno NÃO pode se promover a admin ==="
SELF_PROMO=$(update_as "$ADULTO_TOKEN" "profiles" "id=eq.${ADULTO_ID}" '{"role":"admin"}' 2>&1)
# Verificar se o role realmente mudou
CURRENT_ROLE=$(query_as "$ADULTO_TOKEN" "profiles" "id=eq.${ADULTO_ID}&select=role" "role")
if echo "$CURRENT_ROLE" | grep -q '"admin"'; then
  echo "  ❌ ALUNO SE PROMOVEU A ADMIN — RLS GRAVEMENTE QUEBRADO!"
else
  echo "  ✅ Escalação de privilégio bloqueada"
fi

echo "=== TESTE: Professor NÃO pode se promover a admin ==="
PROF_PROMO=$(update_as "$PROF_TOKEN" "profiles" "select=role" '{"role":"admin"}' 2>&1)
PROF_ROLE=$(query_as "$PROF_TOKEN" "profiles" "select=role" "role" | grep -o '"role":"[^"]*"' | head -1)
if echo "$PROF_ROLE" | grep -q '"admin"'; then
  echo "  ❌ PROFESSOR SE PROMOVEU — RLS QUEBRADO!"
else
  echo "  ✅ Professor bloqueado"
fi

echo "=== TESTE: Recepcionista NÃO pode deletar alunos ==="
DEL_RESULT=$(delete_as "$RECEP_TOKEN" "profiles" "role=eq.aluno_adulto&limit=1" 2>&1)
if echo "$DEL_RESULT" | grep -q '"id"'; then
  echo "  ❌ RECEPCIONISTA DELETOU ALUNO — RLS QUEBRADO!"
else
  echo "  ✅ Recepcionista bloqueada de deletar"
fi
```

## 5.3 — API routes sem auth

```bash
echo "=== TESTE: API routes sem token ==="
# Testar as API routes do app sem Authorization header
APP_URL="http://localhost:3000"
# Se não está rodando local, usar a URL do Vercel
# APP_URL="https://blackbelts.com.br"

for ROUTE in "/api/videos" "/api/videos/create-upload" "/api/cockpit/snapshot" "/api/v1/academies"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}${ROUTE}")
  if [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo "  ✅ ${ROUTE} → ${STATUS} (bloqueado sem auth)"
  elif [ "$STATUS" = "404" ]; then
    echo "  ⚠️ ${ROUTE} → 404 (rota não existe)"
  elif [ "$STATUS" = "000" ]; then
    echo "  ⚠️ ${ROUTE} → não acessível (app não está rodando?)"
  else
    echo "  ❌ ${ROUTE} → ${STATUS} (DEVERIA SER 401!)"
  fi
done
```

## 5.4 — Dados sensíveis

```bash
echo "=== TESTE: Tabelas do cockpit bloqueadas para não-super-admin ==="
for TABLE in feature_backlog operational_costs architecture_decisions deploy_log cockpit_error_log daily_metrics campaigns; do
  RESULT=$(query_as "$ADULTO_TOKEN" "$TABLE" "select=id&limit=1" "id" 2>&1)
  if echo "$RESULT" | grep -q '"id"'; then
    echo "  ❌ ALUNO ACESSA ${TABLE} — RLS COCKPIT QUEBRADO!"
  else
    echo "  ✅ ${TABLE} bloqueado para aluno"
  fi
done

echo "=== TESTE: Service role key NÃO exposta no client ==="
grep -rn "SUPABASE_SERVICE_ROLE_KEY\|service_role" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "node_modules\|\.env\|route\.ts\|middleware\|scripts/" | head -10
# DEVE retornar vazio ou apenas referências em API routes (server-side)
```

## 5.5 — Gerar relatório de segurança

Gere `/docs/test/AGENT_05_SEGURANCA_RLS.md` com:
- TODOS os testes de RLS (✅/❌)
- Vulnerabilidades encontradas
- Correções aplicadas
- Score de segurança

```bash
git add -A && git commit -m "test-real: agent-05-seguranca-rls-cross-tenant"
```

---

# ═══════════════════════════════════════════
# VERIFICAÇÃO FINAL (Sequencial, após todos os Agents)
# ═══════════════════════════════════════════

```bash
# 1. Garantir build limpo
npx tsc --noEmit
pnpm build 2>&1 | tail -15

# 2. Ler todos os relatórios
cat docs/test/AGENT_01_ADMIN_SUPERADMIN.md
cat docs/test/AGENT_02_PROFESSOR_RECEPCIONISTA.md
cat docs/test/AGENT_03_ALUNOS.md
cat docs/test/AGENT_04_RESPONSAVEL_FRANQUEADOR.md
cat docs/test/AGENT_05_SEGURANCA_RLS.md

# 3. Consolidar
```

Gere `/docs/test/RELATORIO_TESTE_REAL.md`:

```markdown
# RELATÓRIO DE TESTE REAL — BLACKBELT V2
## Testes contra Supabase de produção

**Data:** [data]
**Supabase:** tdplmmodmumryzdosmpv
**Ambiente:** [local/vercel]

### Resumo de Login
| Perfil | Email | Login | Profile | Status |
|--------|-------|-------|---------|--------|
| Super Admin | gregoryguimaraes12@gmail.com | ✅/❌ | ✅/❌ | |
| Admin | roberto@guerreiros.com | ✅/❌ | ✅/❌ | |
| Professor | andre@guerreiros.com | ✅/❌ | ✅/❌ | |
| Recepcionista | julia@guerreiros.com | ✅/❌ | ✅/❌ | |
| Aluno Adulto | joao@email.com | ✅/❌ | ✅/❌ | |
| Aluno Teen | lucas.teen@email.com | ✅/❌ | ✅/❌ | |
| Aluno Kids | miguel.kids@email.com | ✅/❌ | ✅/❌ | |
| Responsável | maria.resp@email.com | ✅/❌ | ✅/❌ | |
| Franqueador | fernando@guerreiros.com | ✅/❌ | ✅/❌ | |

### Resumo RLS
| Teste | Resultado |
|-------|-----------|
| Admin vê só sua academia | ✅/❌ |
| Professor não vê financeiro | ✅/❌ |
| Recepcionista não edita financeiro | ✅/❌ |
| Aluno não vê outros alunos | ✅/❌ |
| Kids não acessa mensagens | ✅/❌ |
| Kids não acessa financeiro | ✅/❌ |
| Cross-tenant isolado | ✅/❌ |
| Escalação de privilégio bloqueada | ✅/❌ |
| Cockpit bloqueado para não-admin | ✅/❌ |
| API routes exigem auth | ✅/❌ |
| Service role key não exposta | ✅/❌ |

### Tabelas Verificadas
| Tabela | Existe | Tem dados | RLS |
|--------|--------|-----------|-----|
| profiles | ✅/❌ | X rows | ✅/❌ |
| academies | ✅/❌ | X rows | ✅/❌ |
| ... | | | |

### Issues Encontradas
1. [Descrição — Severidade — Status]

### Correções Aplicadas
1. [O que foi corrigido]

### Score Final
- Login: X/9 perfis funcionando
- RLS: X/11 testes passando
- CRUD: X/Y operações funcionando
- Segurança: X/Y verificações OK
```

```bash
git add -A && git commit -m "test-real: relatorio-final-teste-supabase"
git tag -a v3.5.0-tested -m "Real Supabase integration tests - all profiles verified"
git log --oneline -10

echo "========================================="
echo "  🥋 TESTE REAL SUPABASE CONCLUÍDO"
echo "  Tag: v3.5.0-tested"
echo "  Relatórios: /docs/test/"
echo "========================================="
```

---

## EXECUÇÃO

1. Execute os PRÉ-REQUISITOS primeiro (verificar env, Supabase, users)
2. Se os pré-requisitos passam, lance os 5 Agents em paralelo
3. Se um Agent encontra problema de schema/seed, corrija e continue
4. Após todos os Agents, faça a verificação final

COMECE PELOS PRÉ-REQUISITOS AGORA.
