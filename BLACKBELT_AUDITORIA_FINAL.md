# BLACKBELT v2 — AUDITORIA E POLISH FINAL

> O último prompt antes de vender.
> Corrigir tudo. Auditar tudo. Polir tudo. Zero falhas.
> Build no Vercel passando. App nas stores. Produto vendável.

---

## PRIORIDADE ABSOLUTA: BUILD PASSANDO NO VERCEL

O Vercel está falhando. Antes de qualquer outra coisa, o build PRECISA passar.

```
FASE 0 — FIX BUILD (executar PRIMEIRO, antes de tudo)

1. Rode pnpm build 2>&1 e capture TODOS os erros (não só tail)
2. Para CADA erro, corrija na ordem:
   a. Rotas duplicadas: se dois route groups resolvem pro mesmo path,
      REMOVA o duplicado (mantenha o mais completo/recente)
      Verificar especificamente:
      - /(main)/mensagens vs /(professor)/mensagens
      - /(main)/* vs /(admin)/* vs /(professor)/* — nenhum path pode colidir
      - Qualquer page.tsx que gere conflito de rota

   b. Imports não usados: remova todos os imports marcados como unused
   
   c. Tipos incompatíveis: corrija com tipagem explícita (nunca use 'any')
   
   d. Variáveis não usadas: prefixe com _ ou remova
   
   e. Missing dependencies em useEffect: adicione ao array ou use useCallback

3. Após corrigir, rode novamente: pnpm build
4. Repita até: ✅ Build success com ZERO erros (warnings OK)
5. Rode: pnpm typecheck — deve passar limpo
6. Rode: pnpm test — todos os testes devem passar
7. Commit: "fix: build errors resolved — vercel deploy ready"
8. Push e confirme que o Vercel deploya com sucesso
```

---

## FASE 1 — AUDITORIA DE SEGURANÇA

```
Faça uma auditoria completa de segurança:

1. VARIÁVEIS DE AMBIENTE:
   - Verifique que .env.local está no .gitignore (NUNCA no repo)
   - Verifique que NENHUMA chave secreta está hardcoded em código
   - Grep no repo inteiro: grep -r "sb_secret" --include="*.ts" --include="*.tsx"
   - Grep: grep -r "SUPABASE_SERVICE_ROLE" --include="*.ts" --include="*.tsx"
   - Se encontrar qualquer chave hardcoded: REMOVA e use process.env
   - Verifique que service_role key só é usada em:
     - API routes (app/api/*)
     - Server actions
     - Scripts (scripts/*)
     NUNCA em código client-side (components, pages com 'use client')

2. RLS (Row Level Security):
   - Verifique que TODAS as tabelas no Supabase têm RLS habilitado
   - Crie migration que garante RLS em todas:
     ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
     ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
     ALTER TABLE students ENABLE ROW LEVEL SECURITY;
     ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
     ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
     ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
     ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
     ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
     ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
     ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
     (e qualquer outra tabela que exista)
   
   - Para cada tabela, verifique que tem pelo menos:
     - SELECT policy: users can only read data from their academy
     - INSERT policy: users can only insert to their academy
     - UPDATE policy: users can only update their own data
     - DELETE policy: only admins can delete

3. MIDDLEWARE DE AUTH:
   - Verifique que middleware.ts redireciona para /login se não autenticado
   - Verifique que rotas públicas estão explicitamente listadas:
     /login, /cadastro, /landing, /sobre, /contato, /blog, /termos, /privacidade, /status
   - Verifique que /api/webhooks/* não exige auth (webhooks são externos)
   - Verifique que /api/admin/* exige role admin
   - Verifique que /api/v1/* valida API key

4. INPUT VALIDATION:
   - Para CADA formulário que envia dados ao banco:
     - Validar email format
     - Validar comprimento de strings (max 255 para nomes, max 1000 para notas)
     - Sanitizar HTML (strip tags) em campos de texto
     - Validar números (não negativos para valores monetários)
   - Crie lib/utils/validation.ts com funções reutilizáveis:
     validateEmail(email) → boolean
     sanitizeText(text) → string (strip HTML)
     validateCurrency(value) → boolean (> 0, max 2 decimais)
     validatePhone(phone) → boolean (formato BR)

5. RATE LIMITING:
   - Crie middleware de rate limiting para API routes:
     lib/middleware/rate-limit.ts
     Max 100 requests/min por IP para APIs públicas
     Max 10 requests/min para login (anti-brute-force)
     Max 5 requests/min para registro
   - Implementação simples: Map em memória (para MVP é suficiente)

6. HEADERS DE SEGURANÇA:
   - Em next.config.mjs, adicione headers:
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     X-XSS-Protection: 1; mode=block
     Strict-Transport-Security: max-age=31536000; includeSubDomains
     Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'

Commit: "security: RLS, validation, rate limiting, headers, env audit"
```

---

## FASE 2 — AUDITORIA DE BACKEND (Supabase Real)

```
Verificar que TODOS os services críticos funcionam com mock=false:

1. VERIFICAR CONEXÃO:
   Crie scripts/verify-supabase.ts que:
   - Conecta ao Supabase
   - Lista todas as tabelas
   - Verifica que RLS está habilitado em cada uma
   - Conta registros por tabela
   - Testa auth: cria user temporário, loga, deleta
   - Printa relatório: "✅ 15 tabelas, RLS OK, auth OK"

2. VERIFICAR MIGRAÇÕES:
   - Rode: npx supabase db push --dry-run
   - Se mostra migrações pendentes: aplique
   - Verifique que migration 011_seed_tables.sql criou:
     leads, events, nps_responses, lesson_plans, lesson_templates,
     teacher_notes, goals, sticker_albums, community_posts,
     campaigns, teacher_substitutions, record_board
   - Se alguma tabela falta: crie migration nova

3. VERIFICAR SEED:
   O seed (scripts/seed-full-academy.ts) pode não ter rodado.
   - Verifique no Supabase Dashboard > Auth > Users se existem 30 users
   - Se NÃO existem:
     a. Verifique que o script existe e está correto
     b. Rode: npx tsx scripts/seed-full-academy.ts
     c. Se falhar: leia o erro, corrija, re-rode
     d. Confirme: 30 users criados, tabelas populadas
   - Se existem: verifique que presenças, faturas, etc. foram populados

4. VERIFICAR CADA SERVICE CRÍTICO (mock=false):
   Crie scripts/verify-services.ts que testa:
   - auth.service.ts: login com roberto@guerreiros.com
   - admin.service.ts: getDashboard retorna dados reais
   - professor.service.ts: getDashboard retorna turmas reais
   - aluno.service.ts: getDashboard retorna progresso real
   - checkin.service.ts: doCheckin persiste e getHistory retorna
   - turmas.service.ts: list retorna turmas reais
   - financeiro.service.ts: getDashboard retorna faturas reais
   - health-score.service.ts: getStudentHealthScores retorna scores
   - crm.service.ts: getLeads retorna leads
   Para cada: "✅ service OK" ou "❌ service FALHOU: [erro]"

5. CORRIGIR SERVICES QUE FALHAM:
   Para cada service que falhou no teste:
   - Verifique a query Supabase
   - Verifique que a tabela existe e tem dados
   - Verifique que os joins estão corretos
   - Verifique que os nomes de colunas batem com o schema
   - Corrija e re-teste

Commit: "fix: backend verification — all services working with real data"
```

---

## FASE 3 — AUDITORIA DE FRONTEND

```
Verificar que TODAS as páginas renderizam sem erros:

1. VERIFICAR CADA ROTA:
   Rode pnpm dev e acesse CADA rota manualmente (ou crie script).
   Liste todas as páginas que existem em app/:
   
   Públicas:
   /login, /cadastro, /landing, /sobre, /contato, /blog, /termos, /privacidade, /status

   Admin:
   /admin (dashboard), /admin/alunos, /admin/turmas, /admin/financeiro,
   /admin/retencao, /admin/comercial, /admin/modalidades, /admin/eventos,
   /admin/comunidade, /admin/configuracoes/*, /admin/sistema, /admin/nps,
   /admin/indicar, /admin/relatorios, /admin/setup-wizard

   Professor:
   /professor (dashboard), /professor/turma-ativa, /professor/avaliar/*,
   /professor/plano-aula

   Aluno (main):
   /dashboard, /progresso, /conteudo, /ranking, /comunidade, /eventos,
   /mensagens, /conquistas, /metas, /saude, /certificados

   Teen:
   /teen (dashboard)

   Kids:
   /kids (dashboard)

   Responsável (parent):
   /parent (dashboard)

   Para CADA página:
   - Carrega sem crash? (sem tela branca)
   - Mostra skeleton loading? (não spinner genérico)
   - Mostra dados do banco? (não "Sem dados" ou "undefined")
   - Mobile responsive? (viewport 375px)
   - Console sem erros? (abrir DevTools)

2. CORRIGIR PÁGINAS COM PROBLEMAS:
   Para cada página que falha:
   - Se crash: verificar import, verificar que service retorna dados
   - Se "Sem dados": verificar que seed populou a tabela
   - Se "undefined": verificar que o DTO do service match o que a página espera
   - Se console error: corrigir (geralmente missing key, ref, ou hydration)

3. VERIFICAR FLUXOS COMPLETOS:
   Logar como cada perfil e percorrer os fluxos principais:
   
   ADMIN:
   - [ ] Dashboard carrega com KPIs
   - [ ] Central de atenção mostra alertas
   - [ ] Navegar para Alunos → lista com dados
   - [ ] Click em aluno → perfil com jornada
   - [ ] Navegar para Turmas → grade horária
   - [ ] Navegar para Financeiro → receita, inadimplentes
   - [ ] Navegar para Retenção → health scores
   - [ ] Navegar para Comercial → pipeline de leads

   PROFESSOR:
   - [ ] Dashboard mostra próxima aula
   - [ ] Abrir turma ativa → lista de alunos
   - [ ] Marcar presença → persiste
   - [ ] Gerar QR → QR aparece
   - [ ] Mensagens → conversas existem

   ALUNO:
   - [ ] Dashboard: próxima aula, streak, faixa, conquistas
   - [ ] Progresso: jornada, heatmap, radar
   - [ ] Conteúdo: vídeos listados
   - [ ] Ranking: posição visível

   RESPONSÁVEL:
   - [ ] Seletor de filhos funciona
   - [ ] Presenças dos filhos aparecem
   - [ ] Mensagens do professor aparecem
   - [ ] Pagamentos listados

Commit: "fix: frontend audit — all pages rendering correctly"
```

---

## FASE 4 — POLISH VISUAL E UX

```
Fazer o app parecer PRONTO PARA VENDER:

1. LOADING STATES:
   Verifique que TODA página tem skeleton loading (não tela branca):
   - components/shared/SkeletonDashboard.tsx (já deve existir)
   - Se alguma página carrega sem skeleton: adicione
   - Skeleton deve ter o formato do conteúdo real (não genérico)

2. EMPTY STATES:
   NUNCA "Nenhum resultado" ou "Sem dados" sem contexto.
   Crie components/shared/EmptyState.tsx (se não existe):
   Props: icon, title, description, actionLabel, onAction
   Usar em TODA tela que pode estar vazia:
   - Alunos sem presenças: "Faça check-in na sua próxima aula!"
   - Professor sem turmas: "Nenhuma turma atribuída. Fale com o admin."
   - Admin sem leads: "Nenhum lead ainda. Crie seu primeiro!"
   - Vídeos não assistidos: "Comece pela trilha Fundamentos!"

3. ERROR BOUNDARIES:
   Verifique que app/error.tsx e app/global-error.tsx existem e:
   - Mostram mensagem amigável (não stack trace)
   - Botão "Tentar novamente" (reset)
   - Link "Voltar para o início"
   - Relatam para Sentry (se configurado)

4. TOAST/FEEDBACK:
   Verifique que toda ação mostra feedback:
   - Salvar: "Salvo com sucesso ✅"
   - Erro: "Erro ao salvar. Tente novamente."
   - Check-in: "Check-in realizado! 🎉"
   - Enviar mensagem: "Mensagem enviada ✅"
   Se não tem toast system: crie components/shared/Toast.tsx (hook useToast)

5. FORMULÁRIOS:
   Todo formulário deve ter:
   - Labels claras
   - Placeholder com exemplo
   - Validação visual (borda vermelha + mensagem)
   - Botão submit com loading state
   - Disable double-submit
   - Focus no primeiro campo ao abrir
   - Submit com Enter (se faz sentido)

6. NAVEGAÇÃO:
   Verifique sidebar/menu para cada route group:
   - Admin: sidebar com todos os links funcionando
   - Professor: sidebar com links relevantes
   - Aluno: bottom nav (mobile) ou sidebar
   - Responsável: sidebar com links
   - Links ativos destacados (cor/bold)
   - Breadcrumbs onde faz sentido

7. RESPONSIVIDADE:
   Testar em viewport 375px (iPhone SE):
   - Todo conteúdo visível (sem overflow horizontal)
   - Touch targets mínimo 44px
   - Texto legível (mínimo 14px)
   - Cards empilham em coluna (não overflow)
   - Tabelas: scroll horizontal ou cards no mobile

8. FAVICON E META:
   - Favicon: logo BlackBelt (se não tem, usar placeholder)
   - app/layout.tsx: metadata com title, description, og:image
   - Cada página: title dinâmico (ex: "Dashboard | BlackBelt")

Commit: "polish: loading states, empty states, toasts, responsive, meta"
```

---

## FASE 5 — PERFORMANCE

```
1. BUNDLE SIZE:
   Rode: npx next build e verifique o bundle report.
   - Se alguma página > 200KB: identificar imports pesados
   - Lazy load componentes pesados: dynamic(() => import(...))
   - Recharts: importar apenas componentes usados, não todo o pacote
   - Separar rotas pesadas com next/dynamic

2. QUERIES OTIMIZADAS:
   Para cada service com Supabase:
   - Selecionar apenas colunas necessárias (não select('*'))
   - Usar count: 'exact' com head: true quando só precisa contagem
   - Limitar resultados: .limit(20) em listas
   - Usar index nas colunas mais consultadas:
     CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
     CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
     CREATE INDEX IF NOT EXISTS idx_attendance_checked_at ON attendance(checked_at);
     CREATE INDEX IF NOT EXISTS idx_students_academy_id ON students(academy_id);
     CREATE INDEX IF NOT EXISTS idx_classes_professor_id ON classes(professor_id);
     CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
     CREATE INDEX IF NOT EXISTS idx_memberships_profile_id ON memberships(profile_id);

3. IMAGENS:
   - Se tem imagens: usar next/image com width/height
   - Avatares: usar fallback de iniciais (não imagem quebrada)
   - Thumbnails de vídeo: placeholder se não tem URL real

4. CACHING:
   - Dados que não mudam frequentemente: cache no client (useState com staleTime)
   - Dashboard admin: refresh a cada 30s (não a cada render)
   - Lista de modalidades: cache por 5min
   - Ranking: cache por 1min

Commit: "perf: bundle, queries, indexes, caching"
```

---

## FASE 6 — TESTES MÍNIMOS PARA PRODUÇÃO

```
Criar testes que garantem que o core não quebra:

1. TESTES DE SERVIÇO (mocks):
   Já existem 45 testes. Adicionar pelo menos:
   - auth.service: login success, login fail, register
   - checkin.service: doCheckin success, duplicate prevention
   - health-score.service: calcScore returns valid range
   - turmas.service: list returns array
   Total alvo: 60+ testes

2. TESTE DE BUILD:
   Crie test que verifica que pnpm build não falha:
   tests/build.test.ts:
   - Importar todos os services e verificar que exportam funções
   - Verificar que todos os mocks retornam dados válidos

3. TESTE DE ROTAS:
   Crie tests/routes.test.ts que verifica:
   - Todas as rotas públicas existem (arquivo page.tsx existe)
   - Nenhum route group tem conflito de path

Commit: "test: add critical service tests — 60+ total"
```

---

## FASE 7 — PREPARAÇÃO PARA STORES

```
1. CAPACITOR CONFIG:
   Verifique capacitor.config.ts:
   - appId: "com.blackbelt.app"
   - appName: "BlackBelt"
   - webDir: "out" ou ".next" (dependendo do setup)
   - Plugins configurados: SplashScreen, StatusBar, PushNotifications

2. MANIFEST PWA:
   Verifique public/manifest.json:
   {
     "name": "BlackBelt — Gestão de Academias",
     "short_name": "BlackBelt",
     "start_url": "/login",
     "display": "standalone",
     "background_color": "#0A0A0A",
     "theme_color": "#C62828",
     "icons": [
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   Se não tem ícones: gerar placeholder (quadrado vermelho com "BB")

3. SERVICE WORKER:
   Verifique que PWA funciona:
   - next-pwa ou sw registrado em app/layout.tsx
   - Offline: mostra tela "Sem conexão" (não erro genérico)

4. META TAGS PARA STORES:
   Verifique docs/STORE_METADATA.md com:
   - Título: "BlackBelt — Gestão de Academias de Artes Marciais"
   - Descrição curta (80 chars)
   - Descrição longa (4000 chars)
   - Keywords
   - Categoria: Health & Fitness
   - Credenciais de review (para Apple/Google testarem)

Commit: "chore: store preparation — capacitor, PWA, manifest, metadata"
```

---

## FASE 8 — DOCUMENTAÇÃO E README

```
1. README.md PROFISSIONAL:
   Reescreva README.md com:
   - Logo/banner
   - Descrição do produto (2 parágrafos)
   - Screenshots (placeholder por enquanto)
   - Stack técnica
   - Quick start (pnpm install, cp .env, pnpm dev)
   - Estrutura de pastas (resumida)
   - Scripts disponíveis
   - Contribuindo
   - Licença

2. CLAUDE.md ATUALIZADO:
   Atualize com TODOS os padrões atuais:
   - Services: isMock() + handleServiceError + Supabase real
   - Mocks: dados BR, delay 200-500ms
   - Componentes: Tailwind, forwardRef, displayName
   - Rotas: /(admin), /(professor), /(main), /(teen), /(kids), /(parent)
   - Tipos: lib/types/ + database.types.ts
   - Nunca 'any'
   - Dark mode: CSS variables

3. .env.example ATUALIZADO:
   Listar TODAS as variáveis necessárias:
   NEXT_PUBLIC_USE_MOCK=true
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_PROJECT_REF=
   NEXT_PUBLIC_SENTRY_DSN=
   NEXT_PUBLIC_POSTHOG_KEY=
   NEXT_PUBLIC_POSTHOG_HOST=
   PAYMENT_GATEWAY=asaas
   ASAAS_API_KEY=
   ASAAS_SANDBOX=true
   RESEND_API_KEY=

Commit: "docs: README, CLAUDE.md, .env.example updated"
```

---

## FASE 9 — VERIFICAÇÃO FINAL ABSOLUTA

```
Após TODAS as fases anteriores, faça a verificação final:

1. BUILD:
   pnpm build — ✅ DEVE PASSAR SEM ERROS
   pnpm typecheck — ✅ DEVE PASSAR LIMPO
   pnpm test — ✅ TODOS OS TESTES PASSAM
   pnpm lint — warnings OK, ZERO erros

2. DEPLOY:
   git push — Vercel deve buildar com sucesso
   Acessar https://blackbelt-v2.vercel.app — deve carregar login

3. LOGIN:
   Testar com NEXT_PUBLIC_USE_MOCK=false:
   - roberto@guerreiros.com → dashboard admin funciona
   - andre@guerreiros.com → dashboard professor funciona
   - joao@email.com → dashboard aluno funciona
   - patricia@email.com → dashboard responsável funciona
   - lucas.teen@email.com → dashboard teen funciona
   - helena.kids@email.com → dashboard kids funciona
   (Se seed não rodou, rodar agora: npx tsx scripts/seed-full-academy.ts)

4. NENHUMA TELA VAZIA:
   Percorrer CADA rota listada na Fase 3 e confirmar:
   - [ ] Dados reais aparecem
   - [ ] Sem "undefined", "null", "NaN" visível
   - [ ] Sem console.error no DevTools
   - [ ] Sem tela branca ou crash

5. MOBILE:
   Abrir DevTools > Toggle Device (iPhone 12):
   - [ ] Login funciona
   - [ ] Dashboard não tem overflow horizontal
   - [ ] Navegação bottom funciona
   - [ ] Touch targets são grandes o suficiente

6. COMMIT FINAL:
   git add .
   git commit -m "release: v1.0.0 — BlackBelt v2 production ready"
   git tag v1.0.0
   git push origin main --tags

   O tag v1.0.0 marca o produto como pronto para vender.
```

---

## EXECUÇÃO

```
Cole no Claude Code:

"Leia o BLACKBELT_AUDITORIA_FINAL.md nesta pasta.
Execute TODAS as 9 fases em sequência.

PRIORIDADE ABSOLUTA: Fase 0 (fix build) PRIMEIRO.
Sem build passando, nada mais importa.

Depois execute Fases 1-8 em ordem.
Fase 9 é a verificação final.

Ao final: pnpm build DEVE PASSAR.
O Vercel DEVE deployar sem erro.
NENHUMA tela vazia. NENHUM crash.

Commit final com tag v1.0.0.
Comece agora."
```
