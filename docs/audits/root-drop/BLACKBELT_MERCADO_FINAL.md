# BLACKBELT v2 — MEGA PROMPT: DO CÓDIGO AO MERCADO
# Prompt Único e Definitivo para Produção Real
# Data: 25/03/2026

> CONTEXTO: O BlackBelt v2 tem 273+ páginas, 220 services, 9 perfis, 503/503 checkboxes de UI.
> TODOS os services já têm branch Supabase (NEXT_PUBLIC_USE_MOCK=false).
> 3 fluxos reais testados (cadastro, check-in, presença).
> O que falta: garantir que TUDO funciona end-to-end com dados reais,
> corrigir gaps silenciosos, e preparar para primeira academia real.

---

## REGRAS DE EXECUÇÃO

1. Execute cada SEÇÃO em ordem (1 a 12)
2. pnpm typecheck && pnpm build ZERO ERROS após cada seção
3. Commit separado após cada seção
4. Se algo falha: corrigir ANTES de avançar. NUNCA pular seção.
5. git push origin main após cada commit
6. NUNCA deletar blocos mock (isMock). Preservar SEMPRE.
7. Todos os textos em PT-BR.

---

## SEÇÃO 1 — DIAGNÓSTICO COMPLETO

Antes de fazer QUALQUER coisa, faça o inventário completo.

```bash
echo "=== 1. AMBIENTE ==="
cat .env.local 2>/dev/null | grep -E "SUPABASE|USE_MOCK|ASAAS|RESEND|BETA"

echo "=== 2. MIGRATIONS ==="
ls supabase/migrations/*.sql 2>/dev/null | sort
echo "Total: $(ls supabase/migrations/*.sql 2>/dev/null | wc -l) migrações"

echo "=== 3. SERVICES ==="
echo "Total services: $(find lib/api -name '*.service.ts' | wc -l)"
echo "Com Supabase real: $(grep -rl 'createBrowserClient\|createClient\|supabase\.' lib/api/*.service.ts 2>/dev/null | wc -l)"
echo "Com throw: $(grep -rl 'throw.*Not implemented' lib/api/*.service.ts 2>/dev/null | wc -l)"

echo "=== 4. PAGES ==="
echo "Total pages: $(find app -name 'page.tsx' | wc -l)"

echo "=== 5. AUTH ==="
cat lib/api/auth.service.ts | head -50
cat middleware.ts | head -30

echo "=== 6. SUPABASE CLIENT ==="
cat lib/supabase/client.ts 2>/dev/null || echo "NAO EXISTE"
cat lib/supabase/server.ts 2>/dev/null || echo "NAO EXISTE"

echo "=== 7. ANON KEY FORMAT ==="
grep "ANON_KEY" .env.local 2>/dev/null | head -1

echo "=== 8. SEEDS ==="
ls scripts/seed*.ts 2>/dev/null || echo "Sem seed scripts"

echo "=== 9. BUILD TEST ==="
pnpm typecheck 2>&1 | tail -5
pnpm build 2>&1 | tail -10
```

LEIA TODA a saída. Documente o estado no commit.
Commit: git commit -m "market: seção 1 — diagnóstico completo"

---

## SEÇÃO 2 — FIX: ANON KEY + SUPABASE CLIENT DEFENSIVO

O BlackBelt pode ter anon key no formato sb_publishable (causa crash).

### 2A. Defensive Supabase Client

Verificar/criar lib/supabase/client.ts com null-check em url e key.
Verificar/criar lib/supabase/server.ts com null-check.
Criar lib/utils/supabase-safe.ts com wrapper safeSupabaseQuery que:
- Recebe queryFn, fallback, e context string
- try/catch completo
- NUNCA throw — sempre retorna fallback
- Loga erro com console.error

### 2B. Garantir isMock helper

Verificar lib/utils/mock.ts exporta isMock() que checa NEXT_PUBLIC_USE_MOCK === 'true'.

### 2C. .env.local

Garantir que tem:
- NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=(valor do .env atual — se sb_publishable, criar arquivo NEEDS_JWT_KEY.md avisando Gregory)
- NEXT_PUBLIC_USE_MOCK=false
- SUPABASE_SERVICE_ROLE_KEY=<REDACTED — use Vercel env or .env.local>
- SUPABASE_PROJECT_REF=tdplmmodmumryzdosmpv

Commit: git commit -m "market: seção 2 — supabase client defensivo"

---

## SEÇÃO 3 — AUTH REAL

### 3A. auth.service.ts

Branch real DEVE ter:
- signIn(email, password) → supabase.auth.signInWithPassword
- signUp(email, password, metadata) → supabase.auth.signUp
- signOut() → supabase.auth.signOut
- getSession() → supabase.auth.getSession
- onAuthStateChange(callback) → supabase.auth.onAuthStateChange

Se mock-only no branch real: IMPLEMENTAR.

### 3B. AuthContext

Verificar lib/contexts/AuthContext.tsx:
- Usa supabase.auth.getSession() no mount
- Tem onAuthStateChange listener
- Busca profile da tabela profiles após auth
- try/catch em TUDO

### 3C. Middleware

Verificar middleware.ts:
- Verifica sessão em rotas protegidas
- NÃO bloqueia /login, /registro, /landing, /compete/*
- Usa @supabase/ssr

### 3D. Login page

Verificar form funcional com loading state, error handling PT-BR, redirect após login.

### 3E. Seleção de perfil

Verificar /selecionar-perfil:
- Busca perfis do user em profiles + memberships
- Se 1 perfil: redirect automático
- Se 0 perfis: mensagem + botão criar academia

### 3F. Trigger auto-create profile

Verificar/criar migration 042_auth_trigger.sql:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, role, display_name, created_at)
  VALUES (gen_random_uuid(), NEW.id, 'aluno', COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Commit: git commit -m "market: seção 3 — auth real completo"

---

## SEÇÃO 4 — MIGRATIONS CONSOLIDADAS

### 4A. Listar todas as migrations e tabelas que criam

### 4B. Criar scripts/verify-schema.ts
Conecta ao Supabase com service_role_key, lista tabelas existentes, compara com lista esperada (profiles, academies, units, memberships, modalities, classes, class_enrollments, attendance, students, progressions, evaluations, videos, series, achievements, messages, conversations, notifications, plans, subscriptions, invoices, payments, leads, championships, beta_academies, etc.), reporta faltantes.

### 4C. Criar migration 043_missing_tables_final.sql
Para CADA tabela faltante: CREATE TABLE IF NOT EXISTS com RLS.

### 4D. Criar INSTRUCOES_MIGRATIONS.md
Passo a passo para Gregory executar no SQL Editor do Supabase.

Commit: git commit -m "market: seção 4 — migrations consolidadas"

---

## SEÇÃO 5 — SEED COMPLETO

### 5A. Criar/atualizar scripts/seed-full-academy.ts

32 users no Supabase Auth:
- gregoryguimaraes12@gmail.com / @Greg1994 (Super Admin)
- roberto@guerreiros.com / BlackBelt@2026 (Admin)
- andre@guerreiros.com / BlackBelt@2026 (Professor BJJ)
- carla@guerreiros.com / BlackBelt@2026 (Professora Judo)
- fernanda@guerreiros.com / BlackBelt@2026 (Recepcionista)
- joao@email.com / BlackBelt@2026 (Aluno adulto faixa azul)
- maria@email.com / BlackBelt@2026 (Aluna adulta faixa branca)
- pedro@email.com / BlackBelt@2026 (Aluno adulto faixa roxa)
- ana@email.com / BlackBelt@2026 (Aluna adulta)
- carlos@email.com / BlackBelt@2026 (Aluno adulto)
- lucas.teen@email.com / BlackBelt@2026 (Teen 13 anos)
- sofia.teen@email.com / BlackBelt@2026 (Teen 15 anos)
- helena.kids@email.com / BlackBelt@2026 (Kids 8 anos)
- miguel.kids@email.com / BlackBelt@2026 (Kids 10 anos)
- patricia@email.com / BlackBelt@2026 (Responsável)
- marcos@email.com / BlackBelt@2026 (Responsável)
- + 16 alunos extras

Academy "Guerreiros do Tatame", slug "guerreiros-do-tatame"
2 unidades (Centro e Bairro com endereços de Vespasiano-MG)
4 modalidades (BJJ, Judô, Karatê, MMA)
11 turmas com horários realistas
3500+ registros de presença (90 dias)
126 faturas (80% pagas, 10% pendentes, 10% vencidas)
80 conquistas distribuídas
50+ mensagens
208 avaliações
20 respostas NPS

Commit: git commit -m "market: seção 5 — seed completo 32 users"

---

## SEÇÃO 6 — TOP 30 SERVICES COM QUERY REAL

Para CADA service abaixo, verificar que o branch real faz query Supabase REAL:

CORE: auth, admin, admin-alunos, turmas, horarios, checkin, professor, turma-ativa, presenca
FINANCEIRO: planos, pagamentos, faturas
ALUNO: perfil, conquistas, xp, ranking
CONTEUDO: content, videos, playlists
SOCIAL: mensagens, notificacoes, feed
PARENT: parent, autorizacoes
RECEPCAO: recepcao-dashboard, recepcao-acesso
CRM: crm
ADMIN: admin-config, relatorios
COMPETE: compete

Para cada:
- Se return [] ou return {} no else: IMPLEMENTAR query real
- Se tabela não existe: adicionar à migration 043
- Se depende de API key externa (Asaas, Resend): implementar fallback informativo que retorna mock quando key ausente

Padrão obrigatório para cada query:
```typescript
try {
  const supabase = createClient();
  const { data, error } = await supabase.from('tabela').select('*').eq('academy_id', academyId);
  if (error) { console.error('[Service.metodo]', error.message); return []; }
  return data || [];
} catch (err) { console.error('[Service.metodo]', err); return []; }
```

Commit: git commit -m "market: seção 6 — top 30 services query real"

---

## SEÇÃO 7 — 10 FLUXOS END-TO-END

Trace CADA fluxo no código (page → service → Supabase). Se QUALQUER ponto quebrado: corrigir.

1. Admin cadastra aluno: form → insert profiles+students+memberships → lista atualiza
2. Aluno faz check-in: dashboard → QR/botão → insert attendance → contador atualiza
3. Professor faz chamada: turma ativa → lista alunos → marca presença → upsert attendance
4. Admin cria turma: form → insert classes → aparece na grade
5. Admin gera cobrança: seleciona aluno → insert invoices → aluno vê fatura
6. Aluno vê progresso: dashboard → faixa, presenças, conquistas, XP de tabelas reais
7. Recepcionista registra visitante: CRM → insert leads → kanban atualiza
8. Responsável vê filhos: dashboard → query profiles vinculados → frequência dos filhos
9. Admin vê dashboard: indicadores com COUNT/SUM reais de attendance, invoices, profiles
10. Super Admin vê academias: lista academies com totais

Commit: git commit -m "market: seção 7 — 10 fluxos end-to-end verificados"

---

## SEÇÃO 8 — UX POLISH

### 8A. EmptyState em TODAS as listas
Se dados retornam []: mostrar componente EmptyState com ícone, título PT-BR, descrição, botão de ação.

### 8B. Loading states
Skeleton loading em TODA página com fetch. NÃO spinner genérico.

### 8C. Error handling visual
Toast de erro em PT-BR em todo catch. NUNCA mensagem técnica pro usuário.

### 8D. Toasts de sucesso em PT-BR
"Aluno cadastrado!", "Presença registrada!", "Dados atualizados!"

### 8E. Formulários
Validação client-side, botão com loading, redirect após sucesso.

### 8F. Responsividade mobile (320px)
Verificar 10 páginas principais: login, dashboard admin, alunos, dashboard aluno, check-in, turma ativa, grade, financeiro, responsável, landing.

Commit: git commit -m "market: seção 8 — UX polish completo"

---

## SEÇÃO 9 — LANDING + ONBOARDING

### 9A. Landing page
Hero com CTA, pricing, features, footer com /privacidade e /termos, meta tags, mobile ok.

### 9B. Wizard de registro (4 steps)
1. Dados academia 2. Dados admin 3. Plano 4. Confirmação
DEVE criar user + academy + profile + membership no Supabase.

### 9C. Código de convite
Admin gera link → aluno acessa → form simplificado → vincula à academia.

Commit: git commit -m "market: seção 9 — landing + onboarding"

---

## SEÇÃO 10 — DEPLOY CONFIGS

### 10A. docs/VERCEL_ENV_VARS.md com todas as variáveis
### 10B. vercel.json com region gru1 e headers de segurança
### 10C. .env.example atualizado
### 10D. README.md atualizado

Commit: git commit -m "market: seção 10 — deploy configs"

---

## SEÇÃO 11 — CAPACITOR + PWA

### 11A. capacitor.config.ts (appId: app.blackbelt.v2, webDir: out)
### 11B. Scripts no package.json (cap:build, cap:android, cap:ios)
### 11C. manifest.json completo
### 11D. docs/STORE_METADATA.md com dados de App Store e Google Play

Commit: git commit -m "market: seção 11 — capacitor + PWA"

---

## SEÇÃO 12 — VERIFICAÇÃO FINAL

### 12A. pnpm typecheck && pnpm build — ZERO erros
### 12B. Varredura: zero throws, zero console.log esquecidos, zero TODO/FIXME críticos
### 12C. Gerar MARKET_READINESS_REPORT.md com scores, o que funciona, o que precisa de ação manual

```bash
git add -A
git commit -m "market: seção 12 — verificação final + readiness report"
git tag v2.1.0-market-ready
git push origin main --tags
```

---

## AÇÕES MANUAIS DO GREGORY (após o Code terminar)

### Imediato (hoje):
1. Supabase Dashboard → Settings → API Keys → copiar JWT anon key
2. Colar no .env.local e na Vercel
3. SQL Editor → executar cada migration
4. npx tsx scripts/seed-full-academy.ts
5. Testar login: roberto@guerreiros.com / BlackBelt@2026

### Esta semana:
6. Comprar domínio (blackbelts.com.br)
7. Configurar domínio na Vercel
8. Criar conta Asaas → API key
9. Criar conta Resend → API key
10. Agendar demo com as 2 academias

### Semana que vem:
11. Demo com academia 1
12. Demo com academia 2
13. Ativar trial 7 dias
14. Acompanhar /superadmin/beta

### Em 2 semanas:
15. Conta Apple Developer ($99/ano)
16. Conta Google Play Developer ($25)
17. Ícone profissional 1024x1024
18. Screenshots reais
19. Submeter para review

---

## COMANDO PARA COLAR NO CLAUDE CODE

```
Leia o arquivo BLACKBELT_MERCADO_FINAL.md na raiz do projeto. Execute TODAS as 12 seções EM ORDEM. Seção 1: diagnóstico completo. Seção 2: supabase client defensivo. Seção 3: auth real. Seção 4: migrations consolidadas. Seção 5: seed completo. Seção 6: top 30 services query real. Seção 7: 10 fluxos end-to-end. Seção 8: UX polish. Seção 9: landing + onboarding. Seção 10: deploy configs. Seção 11: capacitor + PWA. Seção 12: verificação final + report. Commit separado por seção. pnpm typecheck && pnpm build ZERO erros após cada seção. Push após cada commit. Tag v2.1.0-market-ready no final. Comece agora pela Seção 1.
```
