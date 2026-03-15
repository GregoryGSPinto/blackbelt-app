# BLACKBELT v2 — Master Build Roadmap

> Do Zero ao Produto Publicado
> 10 Fases · 52 Prompts Executáveis · Entidades · RBAC · Deploy
>
> Autor: Gregory Gonçalves Silveira Pinto
> Data: Março 2026 | Status: DEFINITIVO

---

## Como Usar Este Documento

Cada fase contém prompts executáveis — execute na ordem. Cada prompt assume que os anteriores já foram executados.

**Regras:**
- **Sequência obrigatória**: Pular passos gera código quebrado.
- **Um prompt = uma entrega**: Cada prompt gera um deliverable completo e testável.
- **Valide antes de avançar**: Rode o app, teste, confirme que funciona.
- **Contexto cumulativo**: Sempre informe ao Claude o que já existe.
- **Checklist de fechamento por fase**: Ao concluir cada fase, verifique — limpeza estrutural, cobertura mínima de testes, zero warnings no build, e não-regressão das fases anteriores.

**Regra arquitetural permanente**: Services (lib/api/) NUNCA dependem de rotas. Route groups são decisão de interface. Permissão é decisão de domínio. O domínio (domain.ts, enums.ts, rules.ts) é a fonte de verdade — mocks implementam os contratos, nunca os definem.

---

## Visão Geral das Fases

| Fase | Nome | Foco | Prompts | Resultado |
|------|------|------|---------|-----------|
| 0 | Modelo de Domínio | Entidades, RBAC, regras de negócio | P01–P05 | Fundamento conceitual completo |
| 1 | Scaffold | Repo, configs, CI/CD, design tokens | P06–P10 | Projeto roda vazio com pipeline |
| 2 | Auth | Login, registro, perfis, middleware, tokens | P11–P15 | Auth completo com multi-perfil |
| 3 | Core: Turmas & Presença | CRUD turmas, check-in, grade horária | P16–P21 | Fluxo operacional funcional |
| 4 | Dashboards | Admin, professor, aluno, parent | P22–P27 | Cada perfil tem sua home |
| 5 | Pedagógico & Social | Evolução, conquistas, mensagens, XP | P28–P33 | Engajamento e retenção |
| 6 | Conteúdo | Vídeos, séries, playlists, player | P34–P37 | Streaming educacional |
| 7 | Financeiro | Planos, pagamentos, faturas | P38–P41 | Monetização funcional |
| 8 | Supabase Real | Migrações, RLS, Edge Functions | P42–P46 | Backend de produção |
| 9 | Mobile & PWA | Capacitor, service worker, push | P47–P50 | App nas stores |
| 10 | Polish & Launch | Performance, a11y, SEO, go-live | P51–P52 | Produto publicado |

---

## FASE 0 — MODELO DE DOMÍNIO

Antes de qualquer código, definimos as entidades, relações, regras de negócio e permissões.

### 0.1 Mapa de Entidades

| Módulo | Entidade | Campos-Chave | Owner | Invariante Principal |
|--------|----------|-------------|-------|---------------------|
| Identity | User | id, email, password_hash, created_at | Sistema | Email único globalmente |
| Identity | Profile | id, user_id, role, display_name, avatar | User | Um user pode ter N perfis, mas só 1 por role por academia |
| Tenant | Academy | id, name, slug, plan_id, owner_id | Admin | Slug único. Todo dado pertence a uma academy |
| Tenant | Unit | id, academy_id, name, address | Admin | Uma academy pode ter N unidades físicas |
| Membership | Membership | id, profile_id, academy_id, role, status | Admin | Vincula perfil à academia com role específico |
| Enrollment | Student | id, profile_id, academy_id, belt, started_at | Admin/Prof | Belt só pode subir, nunca descer |
| Enrollment | Guardian | id, guardian_profile_id, student_id, relation | Admin | Teen/Kids obrigatório ter pelo menos 1 guardian |
| Classes | Modality | id, academy_id, name, belt_required | Admin | Nome único por academia |
| Classes | Class | id, modality_id, unit_id, professor_id, schedule | Admin/Prof | Professor só pode estar em 1 turma por horário |
| Classes | ClassEnrollment | id, student_id, class_id, status, enrolled_at | Admin/Prof | Aluno só se matricula se belt >= belt_required da modalidade |
| Attendance | Attendance | id, student_id, class_id, checked_at, method | Prof/Sistema | Máximo 1 check-in por aluno por aula por dia |
| Pedagogic | Progression | id, student_id, evaluated_by, from_belt, to_belt | Professor | Requires minimum attendance count para promoção |
| Pedagogic | Evaluation | id, student_id, class_id, criteria, score | Professor | Score entre 0–100. Professor só avalia aluno da própria turma |
| Content | Video | id, academy_id, title, url, belt_level, duration | Admin | URL única. Belt_level filtra visibilidade |
| Content | Series | id, academy_id, title, video_ids[] | Admin | Ordem dos vídeos é explícita |
| Social | Achievement | id, student_id, type, granted_at, granted_by | Sistema/Prof | Mesma achievement não pode ser concedida 2x ao mesmo aluno |
| Social | Message | id, from_id, to_id, content, read_at | Remetente | Apenas professor↔aluno ou admin↔qualquer |
| Financial | Plan | id, academy_id, name, price, interval, features | Admin | Preço > 0. Interval: monthly/quarterly/yearly |
| Financial | Subscription | id, student_id, plan_id, status, current_period_end | Sistema | Só 1 subscription ativa por aluno por academia |
| Financial | Invoice | id, subscription_id, amount, status, due_date | Sistema | Amount imutável após emissão |

### 0.2 Matriz de Autorização (RBAC)

| Recurso | Admin | Professor | Adulto | Teen | Kids | Responsável |
|---------|-------|-----------|--------|------|------|-------------|
| Academy settings | RW | — | — | — | — | — |
| Units CRUD | RW | R | — | — | — | — |
| All students list | RW | R (suas turmas) | — | — | — | — |
| Classes CRUD | RW | RW (suas) | — | — | — | — |
| Class enrollment | RW | RW (suas turmas) | R (próprio) | R (próprio) | — | R (filhos) |
| Attendance mark | RW | W (turma ativa) | — | — | — | — |
| Attendance read | RW | R (suas turmas) | R (próprio) | R (próprio) | — | R (filhos) |
| Check-in (QR/FAB) | — | — | W | W | — | — |
| Progression/Belt | R | RW (seus alunos) | R (próprio) | R (próprio) | R | R (filhos) |
| Evaluation | R | RW (seus alunos) | R (próprio) | R (próprio) | — | R (filhos) |
| Videos/Content | RW | R | R (belt compatível) | R (belt compatível) | R (kids) | R (filhos) |
| Messages send | W (qualquer) | W (seus alunos) | W (professor) | W (professor) | — | W (professor) |
| Messages read | R (todas) | R (suas) | R (suas) | R (suas) | — | R (filhos) |
| Achievements | R | W (conceder) | R (próprio) | R (próprio) | R (próprio) | R (filhos) |
| Plans CRUD | RW | — | R | R | — | R |
| Subscriptions | RW | — | R (próprio) | — | — | RW (filhos) |
| Invoices | RW | — | R (próprio) | — | — | RW (filhos) |
| Reports/Analytics | RW | R (suas turmas) | — | — | — | — |
| XP/Ranking | R | R | R | R | R | R (filhos) |
| Guardian management | RW | — | — | — | — | R (próprio) |

> Legenda: R = Read, W = Write, RW = Read+Write, — = Sem acesso. Escopo entre parênteses.

### 0.3 Prompts da Fase 0

---

#### PROMPT P01: Diagrama de Entidades

```
Crie um diagrama ER completo do BlackBelt v2 com estas entidades:
User, Profile, Academy, Unit, Membership, Student, Guardian,
Modality, Class, ClassEnrollment, Attendance, Progression,
Evaluation, Video, Series, Achievement, Message, Plan,
Subscription, Invoice.
Mostre: cardinalidade (1:N, N:N), campos PK/FK, e as
invariantes principais como notas no diagrama.
Use mermaid erDiagram. Agrupe por módulo com comentários.
```

---

#### PROMPT P02: TypeScript Types Centrais

```
Crie o arquivo lib/types/domain.ts com todas as interfaces
TypeScript das 20 entidades do BlackBelt v2:
User, Profile, Academy, Unit, Membership, Student, Guardian,
Modality, Class, ClassEnrollment, Attendance, Progression,
Evaluation, Video, Series, Achievement, Message, Plan,
Subscription, Invoice.
Cada interface deve ter:
- Todos os campos tipados (use string para IDs, nunca number)
- Campos de auditoria: created_at, updated_at
- Enums para status fields (ex: MembershipStatus, BeltLevel, etc)
- JSDoc com a invariante principal de cada entidade
Exporte tudo. Zero 'any'. Strict mode.
```

---

#### PROMPT P03: Enums e Constantes de Domínio

```
Crie lib/types/enums.ts com todos os enums do BlackBelt v2:
- Role: admin, professor, aluno_adulto, aluno_teen, aluno_kids, responsavel
- BeltLevel: white, gray, yellow, orange, green, blue, purple, brown, black (nesta ordem)
- MembershipStatus: active, inactive, suspended, pending
- SubscriptionStatus: active, past_due, cancelled, trialing
- InvoiceStatus: draft, open, paid, void, uncollectible
- AttendanceMethod: qr_code, manual, system
- EvaluationCriteria: technique, discipline, attendance, evolution
- MessageChannel: direct, class_group
- AchievementType: attendance_streak, belt_promotion, class_milestone, custom
Cada enum deve ter JSDoc explicando uso.
Crie também lib/types/constants.ts com:
- BELT_ORDER (array ordenado para comparação)
- MIN_ATTENDANCE_FOR_PROMOTION (por belt level)
- MAX_CLASSES_PER_DAY
- SESSION_TIMEOUT_MINUTES
```

---

#### PROMPT P04: Regras de Negócio como Funções Puras

```
Crie lib/domain/rules.ts com funções puras que validam
as regras de negócio do BlackBelt v2:

canEnrollInClass(student, class) → verifica belt compatível
canPromoteBelt(student, targetBelt, attendanceCount) → verifica mínimo
canMarkAttendance(professor, class) → verifica se é professor da turma
isAttendanceValid(student, class, date) → verifica duplicata
canSendMessage(sender, recipient) → verifica permissão
canGrantAchievement(granter, student, type) → verifica duplicata
canAccessContent(user, video) → verifica belt level
isGuardianRequired(studentAge) → true se < 18
canManageSubscription(user, student) → admin ou guardian

Cada função retorna { allowed: boolean, reason?: string }.
Importe os types de domain.ts. 100% testavel sem side effects.
```

---

#### PROMPT P05: Testes das Regras de Domínio

```
Crie tests/domain/rules.test.ts com testes unitários usando
Vitest para TODAS as funções de lib/domain/rules.ts.
Para cada função, teste:
- Happy path (retorna allowed: true)
- Cada caso de falha (retorna allowed: false + reason)
- Edge cases (belt no limite, attendance exatamente no mínimo)
Use describe/it com nomes em português.
Mock data inline (sem importar mocks externos).
Mínimo 3 testes por função. Alvo: 100% coverage das rules.
```

---

## FASE 1 — SCAFFOLD DO PROJETO

Criação do repositório, configurações, design tokens, CI/CD, observabilidade base. Ao final, o projeto roda vazio com pipeline funcional.

---

#### PROMPT P06: Init do Projeto Next.js

```
Crie o projeto BlackBelt v2 do zero com:
- pnpm create next-app blackbelt --typescript --tailwind --app --src-dir=false
- Configure tsconfig.json com strict: true, paths: { "@/*": ["./*"] }
- Configure .eslintrc.json com rules rigorosas
- Configure .prettierrc.json
- Crie .gitignore completo (node_modules, .next, .env.local, etc)
- Crie .env.example com todas as variáveis documentadas
- Crie README.md limpo (sem lixo, sem badges decorativas)
- pnpm add -D vitest @testing-library/react
- Configure observabilidade base:
  - lib/monitoring/logger.ts (structured logger com levels)
  - lib/monitoring/web-vitals.ts (reportWebVitals helper)
  - lib/api/errors.ts (ServiceError class + handleServiceError)
  - Sentry config stubs (sentry.client.config.ts, sentry.server.config.ts)
Me dê os comandos exatos e o conteúdo de cada arquivo de config.
```

---

#### PROMPT P07: Estrutura de Pastas Completa

```
No projeto BlackBelt v2 que já existe, crie a estrutura completa:
app/(auth)/login/page.tsx         → placeholder
app/(auth)/cadastro/page.tsx      → placeholder
app/(auth)/layout.tsx             → auth layout sem nav
app/(main)/dashboard/page.tsx     → placeholder
app/(main)/layout.tsx             → MainShell
app/(professor)/dashboard/page.tsx
app/(professor)/layout.tsx        → ProfessorShell
app/(admin)/dashboard/page.tsx
app/(admin)/layout.tsx            → AdminShell
app/(teen)/dashboard/page.tsx
app/(teen)/layout.tsx             → TeenShell
app/(kids)/dashboard/page.tsx
app/(kids)/layout.tsx             → KidsShell
app/(parent)/dashboard/page.tsx
app/(parent)/layout.tsx           → ParentShell
components/ui/                    → vazio
components/shell/                 → vazio
lib/api/                          → vazio
lib/mocks/                        → vazio
lib/types/                        → copie domain.ts, enums.ts, constants.ts da Fase 0
lib/domain/                       → copie rules.ts da Fase 0
lib/security/                     → vazio
lib/hooks/                        → vazio
lib/contexts/                     → vazio
lib/utils/                        → cn.ts (classnames helper)
lib/env.ts                        → isMock() + env validation
styles/globals.css                → Tailwind imports
tests/                            → copie rules.test.ts
Cada page.tsx placeholder: export default com texto "BlackBelt v2 - [nome]".
Cada layout placeholder: children wrapper com className adequado.
```

---

#### PROMPT P08: Design Tokens + Tailwind Config

```
Configure o Tailwind CSS do BlackBelt v2 com design tokens completos:
tailwind.config.ts deve ter:
- Cores: bb-black, bb-red, bb-red-dark, bb-gray-100/300/500/700/900,
  bb-white, bb-success, bb-warning, bb-error, bb-info
- Cores de faixa: belt-white, belt-gray, belt-yellow, belt-orange,
  belt-green, belt-blue, belt-purple, belt-brown, belt-black
- Fontes: sans (Inter), mono (JetBrains Mono)
- Spacing customizado se necessário
- Border radius: sm(4), md(8), lg(12), xl(16), pill(9999)
- Breakpoints: mobile(0), sm(640), md(768), lg(1024), xl(1280)
- Dark mode: class strategy
Crie também styles/globals.css com:
- CSS variables correspondentes
- Reset base
- Scrollbar customizada
- Focus ring padrão
```

---

#### PROMPT P09: Componentes UI Primitivos

```
Crie os componentes primitivos em components/ui/ do BlackBelt v2:
Button.tsx → variants: primary, secondary, ghost, danger. Sizes: sm, md, lg. Loading state.
Input.tsx → Com label, error, helperText. Types: text, password, email, search.
Modal.tsx → Overlay + container. Variants: default, confirm (destrutivo), fullscreen.
Toast.tsx → Success, error, warning, info. Auto-dismiss. Stackable.
Card.tsx → Base composable. Variants: default, elevated, outlined.
Badge.tsx → Status (active/inactive/pending). Belt colors. Sizes: sm, md.
Avatar.tsx → Image com fallback de iniciais. Sizes: sm, md, lg, xl.
Skeleton.tsx → Pulse animation. Variants: text, circle, card, table-row.
EmptyState.tsx → Icon + title + description + CTA button.
PageError.tsx → Error display com retry button. Usa ServiceError.
Spinner.tsx → Loading indicator. Sizes: sm, md, lg.
Todos com: TypeScript strict, Tailwind only, forwardRef, displayName.
Sem dependências externas de UI. Export tudo de components/ui/index.ts.
```

---

#### PROMPT P10: CI/CD Pipeline

```
Crie .github/workflows/ci.yml para o BlackBelt v2:
Trigger: push em main + pull requests
Jobs (paralelos onde possível):
1. lint → pnpm lint
2. typecheck → pnpm tsc --noEmit
3. test → pnpm test
4. build → pnpm build (depende dos 3 anteriores)
Node 20, pnpm 9, cache de node_modules.
Crie também:
- .github/workflows/supabase-deploy.yml (trigger em supabase/migrations/*)
- vitest.config.ts configurado com paths aliases
- package.json scripts: dev, build, start, lint, lint:fix, typecheck, test
Tudo pronto para rodar. Sem secrets ainda (fase posterior).
```

---

## FASE 2 — AUTENTICAÇÃO

Sistema de auth completo: login, registro, seleção de perfil, middleware de proteção, token management.

---

#### PROMPT P11: Auth Service + Mock

```
Crie para o BlackBelt v2:
lib/api/auth.service.ts:
- login(email, password) → { accessToken, refreshToken, profiles[] }
- register(data) → { user, profile }
- refreshToken(token) → { accessToken }
- logout() → void
- forgotPassword(email) → void
- resetPassword(token, newPassword) → void
Cada função usa isMock() para bifurcar.
lib/mocks/auth.mock.ts:
- 6 usuários demo (admin, professor, adulto, teen, responsável, reviewer)
- Um usuário com 2 perfis (adulto + responsável) para testar ProfileSelector
- Tokens fake com expiry
- Simular delay de 300ms com setTimeout
DTOs tipados. handleServiceError() implementado.
```

---

#### PROMPT P12: Token Store + Security

```
Crie lib/security/ do BlackBelt v2:
token-store.ts:
- setTokens(access, refresh) → armazena em memória (closure)
- getAccessToken() → string | null
- getRefreshToken() → string | null
- clearTokens() → void
- isAuthenticated() → boolean
- Nunca usar localStorage/sessionStorage
session.ts:
- getCurrentProfile() → Profile do token decodificado
- getAcademyId() → string do token
- hasRole(role) → boolean
crypto.ts:
- decodeJWT(token) → payload (sem verificação, só decode)
- isTokenExpired(token) → boolean
Tudo tipado. Export de lib/security/index.ts.
```

---

#### PROMPT P13: AuthContext + useAuth Hook

```
Crie para o BlackBelt v2:
lib/contexts/AuthContext.tsx:
- Provider que gerencia estado de auth
- State: user, profile, isLoading, isAuthenticated, profiles[]
- Actions: login, logout, selectProfile, refreshSession
- Usa token-store por baixo
- Auto-refresh quando token está perto de expirar
lib/hooks/useAuth.ts:
- Hook que consome AuthContext
- Retorna: user, profile, isLoading, isAuthenticated, login, logout, selectProfile
- Throw se usado fora do Provider
Crie também lib/contexts/ToastContext.tsx + lib/hooks/useToast.ts
(success, error, warning, info → renderiza Toast component).
```

---

#### PROMPT P14: Telas de Auth

```
Crie as telas de auth do BlackBelt v2:
app/(auth)/login/page.tsx:
- Form com email + senha
- Botão "Entrar" com loading state
- Link "Esqueci minha senha"
- Link "Criar conta"
- Validação client-side
- Chama auth.service.login()
- Se 1 perfil: redirect para dashboard do perfil
- Se 2+ perfis: redirect para /selecionar-perfil
app/(auth)/cadastro/page.tsx:
- Form completo: nome, email, senha, confirmação
- Validação em tempo real
app/(auth)/selecionar-perfil/page.tsx:
- Lista de perfis do usuário com avatar e role
- Click seleciona e redireciona
app/(auth)/esqueci-senha/page.tsx:
- Form com email + feedback de sucesso
Design: dark background, card centralizado, logo BlackBelt.
Mobile-first. Todas usando useAuth hook.
```

---

#### PROMPT P15: Middleware de Proteção

```
Crie middleware.ts do BlackBelt v2:
- Intercepta TODAS as rotas exceto /(auth)/* e /api/*
- Verifica se existe token no cookie/header
- Decodifica token e extrai role
- Mapeia role → route group permitido:
  admin → /(admin)/*
  professor → /(professor)/*
  aluno_adulto → /(main)/*
  aluno_teen → /(teen)/*
  aluno_kids → /(kids)/*
  responsavel → /(parent)/*
- Se role não match com a rota: redirect para dashboard correto
- Se sem token: redirect para /login
- Config matcher que exclui _next, static, favicon, api
Teste manual: login como admin, tenta acessar /(main) → redirect.
```

---

## FASE 3 — CORE: TURMAS & PRESENÇA

O coração operacional: turmas, matrículas, check-in, grade horária.

---

#### PROMPT P16: Services: Turmas + Horários

```
Crie para o BlackBelt v2:
lib/api/turmas.service.ts:
- list(academyId, filters?) → Class[]
- getById(id) → Class with enrolled students
- create(data) → Class
- update(id, data) → Class
- delete(id) → void
- getByProfessor(professorId) → Class[]
lib/api/horarios.service.ts:
- getGrade(academyId, unitId?) → WeeklySchedule
- checkConflict(professorId, schedule) → ConflictResult
lib/mocks/turmas.mock.ts:
- 8 turmas (2 por modalidade: BJJ, Judô, Karate, MMA)
- Cada turma com 5-15 alunos matriculados
- Horários que cobrem seg-sab, manhã/tarde/noite
lib/mocks/horarios.mock.ts:
- Grade semanal completa
- 1 conflito proposital para testar validação
```

---

#### PROMPT P17: Services: Check-in + QR

```
Crie para o BlackBelt v2:
lib/api/checkin.service.ts:
- doCheckin(studentId, classId, method) → Attendance
- getHistory(studentId, dateRange?) → Attendance[]
- getStats(studentId) → AttendanceStats
- getTodayByClass(classId) → Attendance[] (para chamada do professor)
lib/api/qrcode.service.ts:
- generateQR(classId, expiresIn) → { qrData, expiresAt }
- validateQR(qrData, studentId) → { valid, attendance? }
lib/mocks/ correspondentes com:
- 90 dias de histórico de presença
- Stats pré-calculadas (frequência semanal, streak, total)
- QR mock que sempre valida
```

---

#### PROMPT P18: Tela: Grade Horária (Aluno)

```
Crie app/(main)/turmas/page.tsx do BlackBelt v2:
- Visão semanal (seg-sab) como grade/calendar
- Cada slot mostra: modalidade, horário, professor, vagas
- Turmas do aluno destacadas com cor
- Click no slot abre modal com detalhes
- Filtro por modalidade e por unidade
- Badge de "Sua turma" vs "Disponível"
- Skeleton loading durante fetch
- EmptyState se sem turmas disponíveis
Mobile: lista por dia (hoje primeiro). Desktop: grid semanal.
Use turmas.service e horarios.service.
```

---

#### PROMPT P19: Tela: Check-in do Aluno (FAB)

```
Crie o sistema de check-in do BlackBelt v2:
components/checkin/FABCheckin.tsx:
- Floating Action Button fixo no bottom-right
- Só aparece quando tem aula ativa (horário compatível)
- Click abre modal com 2 opções: QR Code ou Manual
- QR: abre câmera (placeholder, Capacitor futuro)
- Manual: confirma check-in com botão
- Feedback: Toast de sucesso + animação
- Se já fez check-in hoje: botão desabilitado com "Já presente"
app/(main)/checkin/page.tsx:
- Histórico de presenças (lista por mês)
- Stats: frequência semanal, streak, total
- Calendar heatmap (verde = presente, vazio = faltou)
Integre FABCheckin no layout do (main).
```

---

#### PROMPT P20: Tela: Turma Ativa (Professor)

```
Crie app/(professor)/turma-ativa/page.tsx do BlackBelt v2:
- Visão fullscreen "Modo Aula"
- Mostra: nome da turma, horário, modalidade
- Lista de alunos matriculados com:
  - Avatar + nome
  - Badge de faixa
  - Toggle de presença (checkbox grande, touch-friendly)
  - Indicador "Chegou via QR" se já fez check-in
- Botão "Gerar QR Code" (gera QR para alunos escanearem)
- Contador: X/Y presentes
- Botão "Encerrar Aula" (salva chamada, fecha modo)
- Confirm modal antes de encerrar
Crie lib/api/turma-ativa.service.ts + mock correspondente.
Design: fundo escuro, elementos grandes, zero distração.
```

---

#### PROMPT P21: Shells de Navegação

```
Crie os shells de navegação completos do BlackBelt v2:
components/shell/AdminShell.tsx:
- Sidebar fixa (desktop) com: Dashboard, Turmas, Alunos, Financeiro, Relatórios, Config
- Header com: search, notificações, avatar+menu
- Sidebar colapsável (tablet)
- Mobile: bottom drawer
components/shell/ProfessorShell.tsx:
- Bottom nav: Home, Turmas, Alunos, Mensagens, Perfil
- Header context-aware (nome da turma quando em turma ativa)
components/shell/MainShell.tsx (adulto):
- Bottom nav: Home, Turmas, Progresso, Conteúdo, Perfil
- FABCheckin integrado
components/shell/TeenShell.tsx:
- Bottom nav + XP progress bar no topo
- Visual gamificado (cores mais vibrantes)
components/shell/KidsShell.tsx:
- Bottom nav simplificado (3 tabs com ícones grandes)
- Visual lúdico
components/shell/ParentShell.tsx:
- Bottom nav: Filhos, Presenças, Mensagens, Pagamentos, Perfil
- Seletor de filho no header
Todos responsivos. Lucide icons. Tailwind only.
```

---

## FASE 4 — DASHBOARDS

A home de cada perfil. Cada dashboard mostra o que é mais relevante para aquele usuário.

---

#### PROMPT P22: Service: Admin Dashboard

```
Crie lib/api/admin.service.ts do BlackBelt v2:
- getDashboard(academyId) → AdminDashboardDTO:
  - totalAlunos, alunosAtivos, novosEsteMes
  - totalTurmas, turmasHoje
  - receitaMensal, inadimplencia
  - presencaMedia (%)
  - ultimosCheckins (5)
  - proximasAulas (3)
  - alertas (pagamentos vencidos, turmas lotadas)
- getMetrics(academyId, period) → metricas detalhadas
lib/mocks/admin.mock.ts com dados realistas para uma academia
de 120 alunos, 8 turmas, 4 professores.
```

---

#### PROMPT P23: Tela: Admin Dashboard

```
Crie app/(admin)/dashboard/page.tsx do BlackBelt v2:
Row 1 (KPIs): 4 cards em grid
- Alunos Ativos (número + trend arrow)
- Receita Mensal (R$ + % vs mês anterior)
- Presença Média (% + indicador cor)
- Inadimplência (% + alerta se > 10%)
Row 2: Gráfico de presença (Recharts AreaChart, últimos 30 dias)
Row 3: 2 colunas
- Próximas aulas (lista com horário, turma, professor)
- Alertas ativos (pagamentos, turmas, sistema)
Row 4: Últimos check-ins (tabela com aluno, turma, horário)
Skeleton loading em cada seção independente.
Responsive: mobile empilha tudo vertical.
```

---

#### PROMPT P24: Tela: Professor Dashboard

```
Crie app/(professor)/dashboard/page.tsx do BlackBelt v2:
Hero: Próxima aula com countdown + botão "Iniciar Aula"
Se aula em andamento: card de "Aula Ativa" com link direto
Section: Minhas Turmas (cards com alunos, horário, presença média)
Section: Meus Alunos (grid com avatar, nome, faixa, última presença)
Section: Mensagens recentes (preview das últimas 3)
Quick actions: Lançar presença, Avaliar aluno, Nova mensagem
Service: lib/api/professor.service.ts + mock
Dashboard focado em ação, não em dados.
```

---

#### PROMPT P25: Tela: Aluno Adulto Dashboard

```
Crie app/(main)/dashboard/page.tsx do BlackBelt v2:
Hero: Próxima aula (modalidade, horário, professor, local)
Se nenhuma hoje: "Sem aulas hoje. Descanse bem!"
Card: Progresso de faixa (barra visual com % para próxima)
Card: Frequência do mês (X/Y aulas, calendar mini heatmap)
Card: Streak de presença (dias consecutivos)
Section: Conteúdo recomendado (2-3 vídeos sugeridos)
Section: Últimas conquistas
FAB de check-in visível se tem aula agora
Design clean, minimalista, foco no que importa hoje.
```

---

#### PROMPT P26: Tela: Teen Dashboard (Gamificado)

```
Crie app/(teen)/dashboard/page.tsx do BlackBelt v2:
Header com XP bar (level + progress para próximo level)
Card hero: "Sua Jornada" com avatar grande + faixa animada
Section: Conquistas Recentes (badges brilhantes com animação)
Section: Ranking (posição na academia, top 5 com avatares)
Section: Desafios ativos (ex: "3 aulas esta semana = badge!")
Section: Próxima aula + check-in
Visual: mais cores, mais animações, badges com glow.
Use lib/api/xp.service.ts + lib/api/ranking.service.ts + mocks.
```

---

#### PROMPT P27: Tela: Parent Dashboard

```
Crie app/(parent)/dashboard/page.tsx do BlackBelt v2:
Seletor de filho no topo (se 2+ dependentes)
Para cada filho mostra:
- Card: foto + nome + faixa + idade
- Presença do mês (X/Y com indicador visual)
- Última aula comparecida
- Próxima aula agendada
- Status do pagamento (em dia / pendente / atrasado)
Section: Notificações (professor mandou mensagem, promoção, etc)
Quick actions: Ver presenças, Mensagens, Pagamentos
Use lib/api/parent.service.ts + mock.
Tom visual: confiável, informativo, sem gamificação.
```

---

## FASE 5 — PEDAGÓGICO & SOCIAL

Features de engajamento e retenção: evolução de faixa, avaliações, conquistas, mensagens, gamificação.

---

#### PROMPT P28: Services: Pedagógico

```
Crie para o BlackBelt v2:
lib/api/professor-pedagogico.service.ts:
- getProgressoAluno(studentId) → ProgressoDTO (histórico de faixas, avaliações, presença)
- avaliar(studentId, classId, criteria, score) → Evaluation
- promoverFaixa(studentId, toBelt) → Progression (valida regras via rules.ts)
- getAlunosDaTurma(classId) → StudentWithProgress[]
lib/api/evolucao.service.ts:
- getMeuProgresso(studentId) → visão do aluno sobre seu progresso
- getHistoricoFaixas(studentId) → Progression[]
- getRequisitoProximaFaixa(studentId) → requirements + completion %
Mocks com dados de 30 alunos, distribuição realista de faixas.
```

---

#### PROMPT P29: Tela: Progresso do Aluno

```
Crie app/(main)/progresso/page.tsx do BlackBelt v2:
Timeline visual de faixas (branca → atual, futuras em cinza)
Card: Faixa Atual com data de promoção e tempo nela
Card: Próxima Faixa com requisitos:
- Presença mínima: X/Y aulas (progress bar)
- Avaliação técnica: score/100 (progress bar)
- Tempo mínimo na faixa atual: X meses
Section: Histórico de avaliações (tabela: data, professor, critério, nota)
Section: Gráfico de evolução (Recharts LineChart: avaliações ao longo do tempo)
Crie versão equivalente para /(teen) com visual gamificado.
```

---

#### PROMPT P30: Services: Conquistas + XP

```
Crie para o BlackBelt v2:
lib/api/conquistas.service.ts:
- listByAluno(studentId) → Achievement[] (conquistadas)
- listAvailable(studentId) → Achievement[] (possíveis)
- grant(studentId, type, granterId) → Achievement
lib/api/xp.service.ts:
- getXP(studentId) → { xp, level, nextLevelXP, rank }
- getLeaderboard(academyId, period?) → RankedStudent[]
lib/api/ranking.service.ts:
- getByAcademia(academyId) → RankedStudent[]
- getByTurma(classId) → RankedStudent[]
Mocks: achievements reais de artes marciais:
- Primeira aula, 10 aulas, 50 aulas, 100 aulas
- Streak 7 dias, 30 dias, 90 dias
- Promoção de faixa (por cor)
- Avaliação nota máxima
XP system: check-in=10xp, avaliação=25xp, promoção=100xp
```

---

#### PROMPT P31: Tela: Conquistas + Ranking

```
Crie app/(main)/conquistas/page.tsx do BlackBelt v2:
Tab 1 - Minhas Conquistas:
- Grid de badges (icon + nome + data)
- Conquistadas com cor cheia, não conquistadas em cinza
- Click abre modal com descrição e critério
Tab 2 - Ranking:
- Top 10 da academia (avatar, nome, XP, level)
- Posição do usuário destacada
- Filtro: geral / por turma / por faixa
Versão teen: mesma funcionalidade, visual com animações,
glow effects nos badges, confetti quando conquista nova.
Versão kids: badges como personagens, visual colorido.
```

---

#### PROMPT P32: Services + Tela: Mensagens

```
Crie para o BlackBelt v2:
lib/api/mensagens.service.ts:
- getConversations(userId) → Conversation[] (lista de chats)
- getMessages(conversationId, page?) → Message[]
- send(toId, content) → Message
- markRead(conversationId) → void
lib/mocks/mensagens.mock.ts: 5 conversas com 10-20 mensagens cada
app/(professor)/mensagens/page.tsx:
- Lista de conversas (avatar, nome, preview, hora, unread badge)
- Click abre chat
- Chat: bubbles, input na base, send button
- Scroll to bottom, timestamps agrupados por dia
app/(main)/mensagens/page.tsx: mesma UI, visão do aluno
Regra: aluno só inicia com professor da turma.
Professor vê todos alunos das turmas.
Mobile-first: chat fullscreen no mobile.
```

---

#### PROMPT P33: Services + Tela: Notificações

```
Crie para o BlackBelt v2:
lib/api/notificacoes.service.ts:
- list(userId, page?) → Notification[]
- markRead(ids) → void
- markAllRead() → void
- getPreferences(userId) → NotificationPrefs
- updatePreferences(userId, prefs) → void
Tipos: nova_mensagem, aula_em_breve, promocao_faixa, conquista,
pagamento_vencido, avaliacao_recebida
components/shell/NotificationBell.tsx:
- Ícone sino com badge count (não lidas)
- Click abre dropdown com lista
- "Marcar todas como lidas"
- Click na notificação navega para o contexto certo
Integre no header de todos os shells.
```

---

## FASE 6 — CONTEÚDO

Vídeos educacionais, séries, playlists. Streaming de conteúdo filtrado por nível de faixa.

---

#### PROMPT P34: Services: Conteúdo

```
Crie para o BlackBelt v2:
lib/api/content.service.ts:
- listVideos(academyId, filters?) → Video[] (filtros: belt, modality, search)
- getVideo(id) → VideoDetail (com related videos)
- getSeries(academyId) → Series[]
- getSeriesById(id) → SeriesDetail (com episódios)
lib/api/playlists.service.ts:
- getUserPlaylists(userId) → Playlist[]
- create(name, videoIds?) → Playlist
- addVideo(playlistId, videoId) → void
- removeVideo(playlistId, videoId) → void
Mocks: 30 vídeos distribuídos em:
- 3 séries (Fundamentos, Intermediário, Avançado)
- Thumbnails placeholder (cor por faixa)
- Durações: 5-45min
- Belt levels distribuídos
```

---

#### PROMPT P35: Tela: Biblioteca de Conteúdo

```
Crie app/(main)/conteudo/page.tsx do BlackBelt v2:
Filtro por faixa (badges clicáveis, filtro visual)
Filtro por modalidade (dropdown)
Search bar com busca instantânea
Grid de VideoCards:
- Thumbnail com overlay de duração
- Badge de faixa (cor correspondente)
- Título + professor
- Progress bar se já assistiu parcialmente
Seção "Séries" com carrossel horizontal
Seção "Continuar Assistindo" (se tiver progresso)
Conteúdo bloqueado (faixa superior) aparece com cadeado + tooltip
Mobile: 1 coluna. Tablet: 2. Desktop: 3-4.
```

---

#### PROMPT P36: Tela: Video Player

```
Crie app/(main)/conteudo/[id]/page.tsx do BlackBelt v2:
Player area (placeholder para video real — div preta com controles mock):
- Play/pause, volume, fullscreen, progress bar
- Speed selector (0.5x, 1x, 1.5x, 2x)
Info area:
- Título, professor, duração, faixa, modalidade
- Descrição expansível
- Botão "Adicionar à playlist"
Related videos (grid lateral no desktop, abaixo no mobile)
Se parte de uma série: navegação prev/next episódio
Salvar progresso de visualização (mock: em memória)
```

---

#### PROMPT P37: Admin: Gestão de Conteúdo

```
Crie app/(admin)/conteudo/page.tsx do BlackBelt v2:
Tabela de vídeos com: thumbnail mini, título, faixa, views, data
Ações: editar, excluir (confirm modal)
Botão "Novo Vídeo": modal com form
- Título, descrição, URL, faixa, modalidade, duração
Gestão de Séries:
- Lista de séries com drag-and-drop de episódios (simplificado)
- Criar série + adicionar vídeos
Filtros: por faixa, por modalidade, search
Crie lib/api/admin-content.service.ts + mock.
```

---

## FASE 7 — FINANCEIRO

Planos, assinaturas, faturas, cobranças. Monetização funcional.

---

#### PROMPT P38: Services: Financeiro

```
Crie para o BlackBelt v2:
lib/api/planos.service.ts:
- list(academyId) → Plan[]
- getById(id) → Plan
- create(data) → Plan
- update(id, data) → Plan
lib/api/subscriptions.service.ts:
- getByStudent(studentId) → Subscription
- create(studentId, planId) → Subscription
- cancel(subscriptionId) → void
- changePlan(subscriptionId, newPlanId) → Subscription
lib/api/faturas.service.ts:
- list(filters) → Invoice[]
- getById(id) → Invoice
- markPaid(id) → Invoice
- generateMonthly(academyId) → Invoice[]
Mocks: 3 planos (Mensal R$150, Trimestral R$400, Anual R$1400),
50 alunos com subscriptions, 6 meses de histórico de faturas.
```

---

#### PROMPT P39: Tela: Admin Financeiro

```
Crie app/(admin)/financeiro/page.tsx do BlackBelt v2:
KPIs: Receita mensal, Inadimplência %, Alunos pagantes, MRR
Gráfico: Receita x Inadimplência (últimos 6 meses)
Tabela de faturas com:
- Aluno, plano, valor, vencimento, status (pago/pendente/atrasado)
- Filtros: status, período, plano
- Ação: marcar como pago
Seção: Planos (cards com preço, features, qtd assinantes)
Botão: Gerar cobranças do mês (confirm modal)
Highlight: faturas vencidas em vermelho.
```

---

#### PROMPT P40: Tela: Pagamentos (Aluno/Parent)

```
Crie para o BlackBelt v2:
app/(main)/perfil/pagamentos/page.tsx (aluno adulto):
- Plano atual (nome, preço, próximo vencimento)
- Botão "Trocar plano"
- Histórico de faturas (tabela: mês, valor, status, link boleto)
- Alerta se tem fatura vencida
app/(parent)/pagamentos/page.tsx (responsável):
- Seletor de filho
- Para cada filho: mesmas info + botão pagar
- Consolidação: total mensal de todos os filhos
Design: claro, direto, sem confusão sobre valores.
```

---

#### PROMPT P41: Admin: Relatórios

```
Crie app/(admin)/relatorios/page.tsx do BlackBelt v2:
Relatórios disponíveis:
1. Presença por turma (período selecionável)
2. Evolução de alunos (promoções de faixa)
3. Financeiro consolidado (receita, inadimplência)
4. Retenção (alunos ativos vs churn)
5. Performance de professores (presença das turmas)
Cada relatório: filtros + preview na tela + botão "Exportar"
Export placeholder (PDF/Excel — implementação real na Fase 8)
Gráficos: Recharts (bar, line, pie conforme o relatório)
Crie lib/api/relatorios.service.ts + mock com dados de 6 meses.
```

---

## FASE 8 — SUPABASE REAL

Migrações SQL, Row Level Security, Edge Functions. Transição de mocks para backend real.

---

#### PROMPT P42: Migrações SQL: Schema Completo

```
Crie supabase/migrations/ do BlackBelt v2 com as migrações:
001_auth_profiles.sql:
- profiles (id, user_id FK, role, display_name, avatar, created_at, updated_at)
- RLS: owner read/write
002_tenants.sql:
- academies (id, name, slug UNIQUE, owner_id FK, plan, created_at)
- units (id, academy_id FK, name, address, created_at)
- memberships (id, profile_id FK, academy_id FK, role, status, created_at)
- RLS: member read, admin write
003_classes.sql:
- modalities, classes, class_enrollments
- Indexes em academy_id, professor_id, schedule
- RLS por membership
004_attendance.sql:
- attendance table with UNIQUE(student_id, class_id, date)
005_pedagogic.sql:
- progressions, evaluations
006_content.sql:
- videos, series, series_videos, playlists, playlist_videos
007_social.sql:
- achievements, messages, notifications
008_financial.sql:
- plans, subscriptions, invoices
009_seed.sql:
- Seed data de demo (mesmos dados dos mocks)
Todas com: UUID PK, timestamps, RLS policies, indexes críticos.
```

---

#### PROMPT P43: Row Level Security Completo

```
Crie/revise as RLS policies do BlackBelt v2:
Para CADA tabela, defina policies explícitas:
- SELECT: quem pode ler e com qual filtro
- INSERT: quem pode criar
- UPDATE: quem pode editar e quais campos
- DELETE: quem pode deletar (restritivo)
Padrão base:
- Todo SELECT filtra por academy_id do token
- Admin: acesso total dentro da academy
- Professor: turmas vinculadas
- Aluno: dados próprios
- Responsável: dados dos dependentes
Use auth.uid() e app_metadata para role.
Crie função helper: is_member_of(academy_id) RETURNS boolean.
Crie função helper: get_academy_id() RETURNS uuid.
Teste: usuário A não pode ver dados da academy B.
```

---

#### PROMPT P44: Edge Functions

```
Crie supabase/functions/ do BlackBelt v2:
generate-qr/index.ts:
- Gera QR code para check-in de aula
- Valida que quem pede é professor da turma
- QR expira em 5 minutos
process-checkin/index.ts:
- Valida QR, cria attendance record
- Verifica duplicata (1 por aluno por aula por dia)
- Retorna sucesso + conquistas desbloqueadas
promote-belt/index.ts:
- Valida regras de promoção (presença mínima, avaliação)
- Cria progression record
- Dispara notificação + achievement
generate-invoices/index.ts:
- Cron mensal: gera faturas para subscriptions ativas
- Calcula pro-rata se necessário
Todas com: error handling, logging, rate limiting.
```

---

#### PROMPT P45: Migração Mock → Real

```
Para o BlackBelt v2, atualize TODOS os services para funcionar
com Supabase real:
Para CADA um dos 41 services em lib/api/:
1. Importe createClient de @supabase/supabase-js
2. No branch else do isMock():
   - Use supabase.from('table').select/insert/update/delete
   - Aplique filtros corretos (academy_id sempre)
   - Trate erros com handleServiceError
   - Retorne dados tipados (cast para DTO)
3. Teste cada service com NEXT_PUBLIC_USE_MOCK=false
Crie lib/supabase/client.ts:
- createBrowserClient() para client components
- createServerClient() para server components/API routes
Crie types gerados: pnpm supabase gen types typescript > lib/supabase/database.types.ts
Valide que o toggle mock/real funciona perfeitamente.
```

---

#### PROMPT P46: Supabase Realtime (Notifications)

```
Configure Supabase Realtime no BlackBelt v2:
lib/supabase/realtime.ts:
- subscribeToNotifications(userId, callback) → unsubscribe
- subscribeToMessages(conversationId, callback) → unsubscribe
- subscribeToAttendance(classId, callback) → updates de check-in live
Integre no NotificationBell: count atualiza em tempo real
Integre no chat de mensagens: novas mensagens aparecem instantâneas
Integre na turma ativa do professor: check-ins aparecem ao vivo
Cleanup: unsubscribe em useEffect return.
Fallback: se Realtime falhar, polling a cada 30s.
```

---

## FASE 9 — MOBILE & PWA

Empacotamento nativo com Capacitor, Service Worker, Push Notifications.

---

#### PROMPT P47: PWA: Service Worker + Manifest

```
Configure PWA completo no BlackBelt v2:
public/manifest.json:
- name, short_name, description, theme_color (#C62828)
- Icons: 192x192, 512x512 (gere placeholders)
- Splash screens por plataforma
- display: standalone, orientation: portrait
public/sw.js (Service Worker):
- Cache: shell (HTML/CSS/JS), assets estáticos, fontes
- Network-first para API calls
- Cache-first para assets
- Offline fallback page
components/pwa/InstallPrompt.tsx:
- Detecta se pode instalar
- Banner sutil com "Instalar BlackBelt"
- Dismiss persist em localStorage
Registre SW no root layout.
```

---

#### PROMPT P48: Capacitor: Setup iOS + Android

```
Configure Capacitor no BlackBelt v2:
capacitor.config.ts:
- appId: com.blackbelt.app
- appName: BlackBelt
- webDir: out (ou .next conforme build)
- plugins: SplashScreen, StatusBar, PushNotifications, Haptics, Camera
Instale:
- @capacitor/core, @capacitor/cli
- @capacitor/ios, @capacitor/android
- @capacitor/splash-screen, @capacitor/status-bar
- @capacitor/push-notifications, @capacitor/haptics, @capacitor/camera
scripts/capacitor-setup.sh:
- Build web
- npx cap sync
- Configurações específicas iOS (Privacy Manifest, entitlements)
- Configurações específicas Android (permissions, icons)
Crie resources/ com splash screens e icons.
```

---

#### PROMPT P49: Push Notifications

```
Implemente push notifications no BlackBelt v2:
lib/notifications/push.ts:
- requestPermission() → token
- registerToken(userId, token, platform) → salva no Supabase
- Listener para notificações recebidas
supabase/functions/send-push/index.ts:
- Recebe: userId, title, body, data
- Busca token do usuário
- Envia via FCM (Android) ou APNs (iOS)
Triggers automáticos:
- Aula em 30min → push para alunos matriculados
- Nova mensagem → push para destinatário
- Fatura vencendo → push para aluno/responsável
- Conquista desbloqueada → push para aluno
Web fallback: Web Push API para usuários no browser.
```

---

#### PROMPT P50: QR Code Scanner Nativo

```
Implemente scanner real no BlackBelt v2:
components/checkin/QRScanner.tsx:
- Usa @capacitor/camera no nativo
- Fallback: HTML5 getUserMedia no web
- UI: viewfinder overlay, flash toggle, cancel button
- Ao detectar QR: chama validateQR do service
- Feedback: vibração (Haptics) + toast de sucesso/erro
Integre no FABCheckin:
- Se nativo: abre scanner real
- Se web: abre câmera do browser
- Se desktop: mostra instruções alternativas (código manual)
Teste: professor gera QR, aluno escaneia, attendance é criada.
```

---

## FASE 10 — POLISH & LAUNCH

Performance, acessibilidade, SEO, documentação final, e publicação.

---

#### PROMPT P51: Performance + Acessibilidade

```
Otimize o BlackBelt v2 para produção:
Performance:
- Rode Lighthouse em todas as páginas principais
- next/image em todas as imagens
- Dynamic imports para componentes pesados (Recharts, QRScanner)
- Prefetch em links de navegação
- Verifique bundle size (alvo: < 150KB gzip initial)
- Implemente React Suspense boundaries
Acessibilidade (WCAG 2.1 AA):
- Todos os inputs com label + aria-describedby
- Focus management em modais
- Color contrast ratio >= 4.5:1
- Skip navigation link
- Aria-live regions para toasts e notificações
- Tab navigation funcional em toda a app
- Screen reader test nos fluxos principais
SEO:
- Metadata em todas as páginas (title, description)
- Open Graph tags
- robots.txt + sitemap.xml (páginas públicas)
Me dê um checklist com o resultado de cada item.
```

---

#### PROMPT P52: Store Metadata + Go-Live

```
Prepare o BlackBelt v2 para publicação:
docs/STORE_METADATA.md:
- App Store: nome, subtítulo, descrição (curta + longa), keywords, categoria
- Google Play: mesmos campos + feature graphic specs
- Screenshots: lista de telas necessárias por device
- Privacy Policy URL
- Support URL
docs/STORE_REVIEW_CREDENTIALS.md:
- Credenciais de demo para reviewer
- Fluxos para testar (login, check-in, ver turmas, ver progresso)
Checklist de deploy:
- [ ] Variáveis de ambiente configuradas (Vercel + GitHub Secrets)
- [ ] Domínio customizado configurado
- [ ] SSL ativo
- [ ] Sentry conectado e testado
- [ ] Supabase em plano adequado
- [ ] RLS testado com usuários reais
- [ ] Backup de banco configurado
- [ ] Monitoring ativo
- [ ] E2E tests passando
- [ ] Build de produção sem warnings
- [ ] Capacitor builds testados em devices reais
- [ ] App Store Connect / Google Play Console configurados
GO LIVE.
```

---

## Resumo Executivo

| Fase | Prompts | Deliverables | Dependência |
|------|---------|-------------|-------------|
| 0 - Domínio | P01–P05 | Entidades, types, regras, testes | Nenhuma |
| 1 - Scaffold | P06–P10 | Repo, configs, UI primitivos, CI/CD | Fase 0 |
| 2 - Auth | P11–P15 | Login, registro, perfis, middleware | Fase 1 |
| 3 - Core | P16–P21 | Turmas, check-in, shells de nav | Fase 2 |
| 4 - Dashboards | P22–P27 | Home de cada perfil | Fase 3 |
| 5 - Social | P28–P33 | Progresso, conquistas, mensagens | Fase 4 |
| 6 - Conteúdo | P34–P37 | Vídeos, séries, player | Fase 4 |
| 7 - Financeiro | P38–P41 | Planos, pagamentos, relatórios | Fase 4 |
| 8 - Supabase | P42–P46 | Migrações, RLS, Realtime | Fases 5–7 |
| 9 - Mobile | P47–P50 | PWA, Capacitor, push, QR | Fase 8 |
| 10 - Launch | P51–P52 | Performance, a11y, stores, go-live | Fase 9 |

---

> **52 prompts. 10 fases. Zero improv.**
> Cada prompt é executado em sequência. Cada fase entrega valor funcional.
> O projeto nasce com disciplina e termina publicado.
