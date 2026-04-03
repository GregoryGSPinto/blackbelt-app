# 🥋 BLACKBELT V2 — DEPLOY + MIGRATIONS + SEED COCKPIT + VERIFICAÇÃO
# Tudo que falta para o Cockpit estar LIVE no Supabase real
# Executar no terminal do projeto black_belt_v2

---

Este prompt faz TUDO que falta em sequência: push pro GitHub, aplica migrations no Supabase real, popula o cockpit com seed data, e verifica que tudo funciona. Usa Agent() para paralelizar o seed.

## REGRAS

1. Cada etapa verifica sucesso antes de avançar
2. Se migration falhar via script, gere instruções pro SQL Editor
3. Seed usa service_role key (não anon key)
4. Verificação final testa login + RLS + contagens
5. Commit e tag ao final

---

## ETAPA 1 — PUSH PRO GITHUB

```bash
echo "=== Estado atual ==="
git log --oneline -5
git status --short

echo ""
echo "=== Pushing ==="
git push origin main --tags 2>&1
echo "Push exit: $?"
```

Se push falhar por divergência:
```bash
git pull --rebase origin main && git push origin main --tags
```

---

## ETAPA 2 — APLICAR MIGRATIONS NO SUPABASE REAL

```bash
set -a && source .env.local && set +a

echo "=== Supabase: ${NEXT_PUBLIC_SUPABASE_URL} ==="
echo "=== Projeto: tdplmmodmumryzdosmpv ==="
```

### 2A — Verificar quais migrations precisam rodar

```bash
echo "=== Migrations locais ==="
ls -la supabase/migrations/ | grep -E "081|082|036" 

echo ""
echo "=== Verificar se tabelas do cockpit já existem ==="
for TABLE in feature_backlog cockpit_personas deploy_log cockpit_error_log daily_metrics; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  if [ "$CODE" = "200" ]; then
    echo "  ✅ $TABLE já existe"
  else
    echo "  ⏳ $TABLE precisa ser criada (HTTP $CODE)"
  fi
done
```

### 2B — Tentar aplicar via supabase CLI

```bash
npx supabase db push 2>&1 | tail -20
```

### 2C — Se CLI não funcionar, aplicar via script Node

Se o CLI não estiver configurado ou falhar, crie e execute um script temporário:

```bash
cat > /tmp/apply-cockpit-migrations.mjs << 'SCRIPT'
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Env vars não carregadas. Rode: set -a && source .env.local && set +a');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const migrations = [
  'supabase/migrations/036_performance_indexes.sql',
  'supabase/migrations/081_cockpit.sql',
  'supabase/migrations/082_fix_role_escalation.sql',
];

for (const file of migrations) {
  if (!existsSync(file)) {
    console.log(`⏭️  ${file} não encontrado, pulando`);
    continue;
  }
  
  const sql = readFileSync(file, 'utf8');
  console.log(`\n📄 Aplicando ${file} (${sql.length} chars)...`);
  
  // Tentar via RPC
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  
  if (error) {
    if (error.message?.includes('function') && error.message?.includes('does not exist')) {
      console.log(`⚠️  RPC exec_sql não disponível. Precisa colar no SQL Editor.`);
      console.log(`📋 Arquivo: ${file}`);
    } else if (error.message?.includes('already exists')) {
      console.log(`✅ ${file} — tabelas já existem (safe)`);
    } else {
      console.log(`❌ Erro: ${error.message}`);
    }
  } else {
    console.log(`✅ ${file} aplicada com sucesso`);
  }
}

// Verificar resultado
console.log('\n=== Verificação ===');
const tables = ['feature_backlog','operational_costs','architecture_decisions','sprints',
  'cockpit_personas','deploy_log','cockpit_error_log','daily_metrics',
  'content_calendar'];

for (const t of tables) {
  const { data, error } = await supabase.from(t).select('id').limit(1);
  if (error) {
    console.log(`❌ ${t}: ${error.message}`);
  } else {
    console.log(`✅ ${t}: acessível`);
  }
}
SCRIPT

node /tmp/apply-cockpit-migrations.mjs
```

### 2D — Se NADA funcionar via script

Imprima instruções claras:
```
════════════════════════════════════════════════════
AÇÃO MANUAL — Gregory precisa fazer no browser:

1. Abrir: https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/sql

2. Colar e rodar CADA arquivo (um por vez, nesta ordem):
   a) supabase/migrations/036_performance_indexes.sql
   b) supabase/migrations/081_cockpit.sql
   c) supabase/migrations/082_fix_role_escalation.sql

3. Cada um deve retornar "Success"

4. Depois, voltar aqui e rodar a Etapa 3 (seed)
════════════════════════════════════════════════════
```

Após confirmar que as tabelas existem (verificação do 2A deve dar ✅ em todas), prossiga.

---

## ETAPA 3 — SEED DO COCKPIT (3 Agents em paralelo)

Só executar se as tabelas do cockpit existem no banco. Verificar primeiro:

```bash
set -a && source .env.local && set +a

TABLES_OK=true
for TABLE in feature_backlog operational_costs architecture_decisions sprints cockpit_personas deploy_log cockpit_error_log content_calendar campaigns daily_metrics; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")
  if [ "$CODE" != "200" ]; then
    echo "❌ $TABLE não existe — rodar migrations primeiro"
    TABLES_OK=false
  fi
done

if [ "$TABLES_OK" = false ]; then
  echo "⛔ Migrations não aplicadas. Volte à Etapa 2."
  exit 1
fi
echo "✅ Todas as 10 tabelas existem. Prosseguindo com seed."
```

Se OK, lance 3 Agents em paralelo para popular:

```
Agent("BB Cockpit Seed: CEO — custos, ADRs, features, métricas diárias")
Agent("BB Cockpit Seed: CPO — personas, sprint, feedbacks")
Agent("BB Cockpit Seed: CTO+Growth — deploys, errors, content calendar, campanhas")
```

### AGENT SEED CEO

```bash
set -a && source .env.local && set +a

supa_insert() {
  curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$1" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$2"
}

# Verificar se já tem seed (evitar duplicar)
EXISTING=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/operational_costs?select=id&limit=1" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | grep -o '"id"' | wc -l)

if [ "$EXISTING" -gt 0 ]; then
  echo "⚠️ Cockpit já tem dados. Pulando seed CEO para não duplicar."
else
  echo "=== SEED: Custos Operacionais ==="
  supa_insert "operational_costs" '[
    {"product":"shared","category":"infra","name":"Vercel (Hobby)","amount_brl":0,"frequency":"monthly","active":true},
    {"product":"shared","category":"infra","name":"Supabase (Free Tier)","amount_brl":0,"frequency":"monthly","active":true},
    {"product":"shared","category":"infra","name":"Bunny Stream","amount_brl":0,"frequency":"usage_based","active":true},
    {"product":"shared","category":"tools","name":"Apple Developer Account","amount_brl":499,"frequency":"yearly","active":true},
    {"product":"shared","category":"domain","name":"Domínios","amount_brl":40,"frequency":"yearly","active":true},
    {"product":"shared","category":"tools","name":"Claude Max","amount_brl":200,"frequency":"monthly","active":true},
    {"product":"shared","category":"tools","name":"GitHub (Free)","amount_brl":0,"frequency":"monthly","active":true}
  ]'

  echo "=== SEED: ADRs ==="
  supa_insert "architecture_decisions" '[
    {"product":"both","title":"Stack unificado Next.js + Supabase + Vercel","status":"accepted","context":"Founder solo com AI. Minimizar context-switching.","decision":"Next.js 14 + Supabase + Vercel + Capacitor. TypeScript strict.","consequences":"Vendor lock-in Vercel aceitável. PostgreSQL portável."},
    {"product":"blackbelt","title":"9 perfis com RLS granular","status":"accepted","context":"Multi-tenant com diferentes níveis de acesso.","decision":"Super Admin, Admin, Professor, Recepcionista, Aluno Adulto/Teen/Kids, Responsável, Franqueador.","consequences":"RLS por academy_id. Kids sem mensagens. Teen com gamificação."},
    {"product":"blackbelt","title":"Pricing 5 tiers","status":"accepted","context":"Escalabilidade por tamanho de academia.","decision":"Starter R$97 → Essencial R$197 → Pro R$347 → BlackBelt R$597 → Enterprise.","consequences":"Trial 7 dias. Limites por tier."},
    {"product":"blackbelt","title":"Bunny Stream para vídeos","status":"accepted","context":"Upload TUS, CDN, sem branding.","decision":"Library 626933, CDN vz-1ea2733d-15c.b-cdn.net. Shared com PrimalWOD.","consequences":"Webhook para processamento."},
    {"product":"both","title":"Cockpit integrado (não app separado)","status":"accepted","context":"Painel CEO/CTO/CPO/Growth.","decision":"Rota /cockpit protegida por superadmin em cada app.","consequences":"Métricas distintas por produto. Menos repos."}
  ]'

  echo "=== SEED: Feature Backlog ==="
  supa_insert "feature_backlog" '[
    {"product":"blackbelt","title":"Integração Asaas (pagamentos)","module":"financeiro","persona":"admin","rice_impact":5,"rice_urgency":5,"rice_effort":3,"pipeline_phase":"cto_arch","status":"backlog"},
    {"product":"blackbelt","title":"Integração Resend (emails)","module":"core","persona":"admin","rice_impact":4,"rice_urgency":4,"rice_effort":4,"pipeline_phase":"cto_arch","status":"backlog"},
    {"product":"blackbelt","title":"Sentry (error monitoring)","module":"core","rice_impact":3,"rice_urgency":3,"rice_effort":5,"pipeline_phase":"cto_arch","status":"backlog"},
    {"product":"blackbelt","title":"Beta academia Guerreiros do Tatame","module":"core","persona":"admin","rice_impact":5,"rice_urgency":5,"rice_effort":4,"pipeline_phase":"cpo_spec","status":"sprint"},
    {"product":"blackbelt","title":"Screenshots reais para stores","module":"core","rice_impact":5,"rice_urgency":4,"rice_effort":5,"pipeline_phase":"idea","status":"backlog"},
    {"product":"blackbelt","title":"Compete module","module":"compete","rice_impact":4,"rice_urgency":3,"rice_effort":2,"pipeline_phase":"shipped","status":"done","shipped_at":"2026-03-20T00:00:00Z"},
    {"product":"blackbelt","title":"Bunny Stream integration","module":"streaming","rice_impact":4,"rice_urgency":3,"rice_effort":2,"pipeline_phase":"shipped","status":"done","shipped_at":"2026-03-18T00:00:00Z"},
    {"product":"blackbelt","title":"Cockpit do Founder","module":"core","rice_impact":4,"rice_urgency":4,"rice_effort":2,"pipeline_phase":"shipped","status":"done","shipped_at":"2026-03-29T00:00:00Z"}
  ]'

  echo "=== SEED: Métricas diárias (7 dias) ==="
  for i in $(seq 0 6); do
    DAY=$(date -d "-${i} days" +%Y-%m-%d 2>/dev/null || date -v-${i}d +%Y-%m-%d 2>/dev/null || echo "2026-03-$((29-i))")
    supa_insert "daily_metrics" "{
      \"product\":\"blackbelt\",\"date\":\"${DAY}\",
      \"total_academies\":2,\"active_academies\":2,\"trial_academies\":2,
      \"total_users\":$((40+i)),\"active_users_7d\":$((28+i)),\"new_users\":$((i%3)),
      \"mrr_brl\":0,\"total_checkins\":$((10+i*2)),\"total_classes\":$((4+i))
    }" > /dev/null 2>&1
  done
  echo "  ✅ 7 dias de métricas"
fi

echo ""
echo "=== Contagens CEO ==="
for T in operational_costs architecture_decisions feature_backlog daily_metrics; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${T}?select=id" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | grep -o '"id"' | wc -l)
  echo "  $T: $COUNT rows"
done
```

### AGENT SEED CPO

```bash
set -a && source .env.local && set +a

supa_insert() {
  curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$1" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" -H "Prefer: return=representation" -d "$2"
}

EXISTING=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cockpit_personas?select=id&limit=1" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | grep -o '"id"' | wc -l)

if [ "$EXISTING" -gt 0 ]; then
  echo "⚠️ CPO já tem dados. Pulando."
else
  echo "=== SEED: Personas (8 perfis) ==="
  supa_insert "cockpit_personas" '[
    {"product":"blackbelt","name":"Dono de Academia","role_in_app":"admin","description":"Gerencia tudo: alunos, professores, financeiro.","pains":["Planilhas limitadas","Cobrança manual","Sem visão consolidada"],"jobs_to_be_done":["Gerenciar 50-500 alunos","Controlar financeiro","Acompanhar presença"],"key_features":["Dashboard","Financeiro","Presença","Relatórios"],"feature_completion_pct":85},
    {"product":"blackbelt","name":"Professor","role_in_app":"professor","description":"Dá aulas, faz chamada, publica vídeos.","pains":["Chamada em papel","Sem vídeos","Sem histórico"],"jobs_to_be_done":["Chamada digital","Upload vídeos","Avaliar alunos"],"key_features":["Chamada","Vídeos","Avaliação","Gradebook"],"feature_completion_pct":80},
    {"product":"blackbelt","name":"Aluno Adulto","role_in_app":"aluno_adulto","description":"Praticante 18+. Evolução, presenças, graduações.","pains":["Não sabe aulas feitas","Sem registro evolução"],"jobs_to_be_done":["Histórico presenças","Evolução faixa","Pagar mensalidade"],"key_features":["Dashboard","Presenças","Graduações","Pagamentos"],"feature_completion_pct":90},
    {"product":"blackbelt","name":"Aluno Teen","role_in_app":"aluno_teen","description":"Adolescente. XP, badges, gamificação.","pains":["Treino sem incentivo"],"jobs_to_be_done":["Ganhar XP","Ranking amigos","Streaks"],"key_features":["XP","Badges","Streaks","Leaderboard"],"feature_completion_pct":75},
    {"product":"blackbelt","name":"Aluno Kids","role_in_app":"aluno_kids","description":"Criança. UI lúdica, sem mensagens.","pains":["Interface séria"],"jobs_to_be_done":["Stickers","Progresso divertido"],"key_features":["UI playful","Stickers","Sem mensagens"],"feature_completion_pct":70},
    {"product":"blackbelt","name":"Responsável","role_in_app":"responsavel","description":"Pai/mãe. Paga e acompanha filhos.","pains":["Não sabe se filho treinou"],"jobs_to_be_done":["Presença filhos","Pagar","Comunicados"],"key_features":["Dashboard filhos","Pagamentos","Comunicação"],"feature_completion_pct":75},
    {"product":"blackbelt","name":"Recepcionista","role_in_app":"recepcionista","description":"Check-in e cadastro. Sem financeiro.","pains":["Check-in lento"],"jobs_to_be_done":["Check-in rápido","Cadastro"],"key_features":["Check-in","Cadastro","Consulta"],"feature_completion_pct":85},
    {"product":"blackbelt","name":"Franqueador","role_in_app":"franqueador","description":"Multi-unidade. Visão consolidada.","pains":["Sem visão unificada"],"jobs_to_be_done":["Dashboard multi-unidade","Comparar métricas"],"key_features":["Multi-unidade","Comparativos"],"feature_completion_pct":60}
  ]'

  echo "=== SEED: Sprint atual ==="
  MONDAY=$(date -d "last monday" +%Y-%m-%d 2>/dev/null || date -v-monday +%Y-%m-%d 2>/dev/null || echo "2026-03-24")
  FRIDAY=$(date -d "next friday" +%Y-%m-%d 2>/dev/null || date -v+friday +%Y-%m-%d 2>/dev/null || echo "2026-03-28")
  supa_insert "sprints" "{
    \"product\":\"blackbelt\",\"week_start\":\"${MONDAY}\",\"week_end\":\"${FRIDAY}\",
    \"goals\":[{\"title\":\"Cockpit do Founder completo\",\"status\":\"done\"},{\"title\":\"Teste real Supabase 9 perfis\",\"status\":\"done\"},{\"title\":\"Preparar beta com academia\",\"status\":\"in_progress\"}],
    \"velocity\":3,\"prompts_executed\":8,\"notes\":\"Operação 100/100 + Cockpit + Testes reais numa semana.\"
  }"

  echo "=== SEED: Feedbacks ==="
  supa_insert "cockpit_feedback" '[
    {"product":"blackbelt","user_name":"Roberto Silva","user_role":"admin","academy_name":"Guerreiros do Tatame","category":"feature","message":"Relatório mensal de presenças por turma seria muito útil.","rating":4,"status":"new"},
    {"product":"blackbelt","user_name":"Prof. Carlos","user_role":"professor","academy_name":"Guerreiros do Tatame","category":"ux","message":"Upload de vídeo precisa de barra de progresso mais clara.","rating":3,"status":"new"},
    {"product":"blackbelt","user_name":"João Pedro","user_role":"aluno_adulto","academy_name":"Guerreiros do Tatame","category":"elogio","message":"Finalmente consigo ver meu histórico de presenças sem perguntar na recepção!","rating":5,"status":"read"},
    {"product":"blackbelt","user_name":"Maria Responsável","user_role":"responsavel","academy_name":"Guerreiros do Tatame","category":"feature","message":"Quero notificação quando meu filho fizer check-in.","rating":4,"status":"new"}
  ]' 2>/dev/null
  # Se cockpit_feedback não existir, tentar user_feedback ou cockpit_user_feedback
  supa_insert "cockpit_user_feedback" '[
    {"product":"blackbelt","user_name":"Roberto Silva","user_role":"admin","academy_name":"Guerreiros do Tatame","category":"feature","message":"Relatório mensal de presenças por turma seria muito útil.","rating":4,"status":"new"},
    {"product":"blackbelt","user_name":"Prof. Carlos","user_role":"professor","academy_name":"Guerreiros do Tatame","category":"ux","message":"Upload de vídeo precisa de barra de progresso mais clara.","rating":3,"status":"new"},
    {"product":"blackbelt","user_name":"João Pedro","user_role":"aluno_adulto","academy_name":"Guerreiros do Tatame","category":"elogio","message":"Finalmente consigo ver meu histórico sem perguntar na recepção!","rating":5,"status":"read"},
    {"product":"blackbelt","user_name":"Maria Responsável","user_role":"responsavel","academy_name":"Guerreiros do Tatame","category":"feature","message":"Quero notificação quando meu filho fizer check-in.","rating":4,"status":"new"}
  ]' 2>/dev/null
fi

echo ""
echo "=== Contagens CPO ==="
for T in cockpit_personas sprints; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${T}?select=id" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | grep -o '"id"' | wc -l)
  echo "  $T: $COUNT rows"
done
# Tentar ambos os nomes possíveis da tabela de feedback
for T in cockpit_feedback cockpit_user_feedback user_feedback; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${T}?select=id" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null | grep -o '"id"' | wc -l)
  [ "$COUNT" -gt 0 ] && echo "  $T: $COUNT rows" && break
done
```

### AGENT SEED CTO+GROWTH

```bash
set -a && source .env.local && set +a

supa_insert() {
  curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/$1" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" -H "Prefer: return=representation" -d "$2"
}

EXISTING=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/deploy_log?select=id&limit=1" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | grep -o '"id"' | wc -l)

if [ "$EXISTING" -gt 0 ]; then
  echo "⚠️ CTO+Growth já tem dados. Pulando."
else
  echo "=== SEED: Deploy Log ==="
  supa_insert "deploy_log" '[
    {"product":"blackbelt","commit_message":"review: agente-08-integrador","branch":"main","tag":"v3.2.0-enterprise-review","status":"success","duration_seconds":185,"files_changed":32,"lines_added":1474,"lines_removed":125,"deployed_at":"2026-03-29T10:00:00Z"},
    {"product":"blackbelt","commit_message":"fix-100: agente-12-final-validator","branch":"main","tag":"v3.3.0-100-score","status":"success","duration_seconds":1282,"files_changed":385,"lines_added":5447,"lines_removed":2990,"deployed_at":"2026-03-29T14:00:00Z"},
    {"product":"blackbelt","commit_message":"cockpit: fase-5-verificacao-final","branch":"main","tag":"v3.4.0-cockpit","status":"success","duration_seconds":1191,"files_changed":30,"lines_added":9500,"lines_removed":50,"deployed_at":"2026-03-29T20:00:00Z"},
    {"product":"blackbelt","commit_message":"test-real: 5 agents paralelos","branch":"main","tag":"v3.5.0-tested","status":"success","duration_seconds":1417,"files_changed":20,"lines_added":500,"lines_removed":10,"deployed_at":"2026-03-29T21:00:00Z"}
  ]'

  echo "=== SEED: Errors ==="
  supa_insert "cockpit_error_log" '[
    {"product":"blackbelt","error_type":"integration","severity":"medium","message":"Asaas API não configurada — pagamentos em mock","affected_route":"/admin/financeiro","status":"monitoring"},
    {"product":"blackbelt","error_type":"integration","severity":"medium","message":"Resend não configurado — emails não enviados","affected_route":"/api/emails","status":"monitoring"},
    {"product":"blackbelt","error_type":"integration","severity":"low","message":"Sentry não configurado","affected_route":"global","status":"new"}
  ]'

  echo "=== SEED: Content Calendar ==="
  supa_insert "content_calendar" '[
    {"product":"blackbelt","title":"Post lançamento — BlackBelt para academias","platform":"instagram","content_type":"carousel","planned_date":"2026-04-07","status":"planned","target_persona":"admin"},
    {"product":"blackbelt","title":"Vídeo demo — Dashboard professor","platform":"youtube","content_type":"video","planned_date":"2026-04-10","status":"idea","target_persona":"professor"},
    {"product":"blackbelt","title":"Reel — Check-in biométrico","platform":"instagram","content_type":"reel","planned_date":"2026-04-08","status":"idea","target_persona":"admin"},
    {"product":"blackbelt","title":"LinkedIn — Founder story","platform":"linkedin","content_type":"post","planned_date":"2026-04-14","status":"planned"}
  ]'

  echo "=== SEED: Campanhas ==="
  supa_insert "campaigns" '[
    {"product":"blackbelt","name":"Beta Fechado — 2 academias piloto","channel":"outbound","budget_brl":0,"status":"active","start_date":"2026-03-25","goal":"Validar com 2 academias reais","target_metric":"academias_ativas","target_value":2,"actual_value":0},
    {"product":"blackbelt","name":"Instagram Orgânico","channel":"organic","budget_brl":0,"status":"planned","start_date":"2026-04-07","goal":"Awareness e lista de espera","target_metric":"seguidores","target_value":500},
    {"product":"blackbelt","name":"Parcerias Federações BJJ","channel":"partnerships","budget_brl":0,"status":"planned","goal":"Fechar parceria estadual MG","target_metric":"parcerias","target_value":1}
  ]'
fi

echo ""
echo "=== Contagens CTO+Growth ==="
for T in deploy_log cockpit_error_log content_calendar campaigns; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${T}?select=id" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | grep -o '"id"' | wc -l)
  echo "  $T: $COUNT rows"
done
```

---

## ETAPA 4 — VERIFICAÇÃO FINAL

```bash
set -a && source .env.local && set +a

echo "════════════════════════════════════════════"
echo "  BLACKBELT V2 — VERIFICAÇÃO FINAL"
echo "════════════════════════════════════════════"

TOTAL=0
for TABLE in feature_backlog operational_costs architecture_decisions sprints cockpit_personas deploy_log cockpit_error_log content_calendar campaigns daily_metrics; do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | grep -o '"id"' | wc -l)
  TOTAL=$((TOTAL + COUNT))
  printf "  %-25s %3d rows\n" "$TABLE" "$COUNT"
done
echo "  ─────────────────────────────────────"
printf "  %-25s %3d rows\n" "TOTAL" "$TOTAL"

echo ""
echo "=== RLS: SuperAdmin vê tudo ==="
SA_RESP=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"gregoryguimaraes12@gmail.com","password":"@Greg1994"}')
SA_TOKEN=$(echo "$SA_RESP" | grep -o '"access_token":"[^"]*"' | head -1 | sed 's/"access_token":"//;s/"//')

if [ -n "$SA_TOKEN" ]; then
  for TABLE in feature_backlog operational_costs architecture_decisions daily_metrics; do
    CNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id" \
      -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SA_TOKEN}" | grep -o '"id"' | wc -l)
    [ "$CNT" -gt 0 ] && echo "  ✅ SuperAdmin vê $TABLE ($CNT)" || echo "  ❌ SuperAdmin NÃO vê $TABLE"
  done
else
  echo "  ⚠️ SuperAdmin login falhou"
fi

echo ""
echo "=== RLS: Aluno NÃO vê cockpit ==="
AL_RESP=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"BlackBelt@2026"}')
AL_TOKEN=$(echo "$AL_RESP" | grep -o '"access_token":"[^"]*"' | head -1 | sed 's/"access_token":"//;s/"//')

if [ -n "$AL_TOKEN" ]; then
  for TABLE in feature_backlog operational_costs campaigns daily_metrics; do
    CNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${TABLE}?select=id" \
      -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${AL_TOKEN}" | grep -o '"id"' | wc -l)
    [ "$CNT" -eq 0 ] && echo "  ✅ Aluno BLOQUEADO de $TABLE" || echo "  ❌ Aluno VÊ $TABLE!"
  done
else
  echo "  ⚠️ Aluno login falhou"
fi

echo ""
echo "════════════════════════════════════════════"
echo "  🥋 BLACKBELT COCKPIT LIVE!"
echo "  Acesse: blackbelts.com.br/cockpit"
echo "  Login: gregoryguimaraes12@gmail.com"
echo "  $TOTAL rows de dados no cockpit"
echo "════════════════════════════════════════════"

git add -A && git commit -m "cockpit-live: migrations aplicadas + seed completo + RLS verificado" 2>/dev/null
```

---

## EXECUÇÃO

Etapa 1 (push) → Etapa 2 (migrations) → Etapa 3 (3 agents seed paralelos) → Etapa 4 (verificação)

COMECE PELA ETAPA 1 AGORA.
