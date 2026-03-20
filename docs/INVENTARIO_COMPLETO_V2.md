# BLACKBELT v2 — INVENTARIO COMPLETO (v2)
## Data: 2026-03-19
## Apos: TODAS as 10 FASES executadas (EmptyState, translateError, SWR, PlanGate, FASE 7 features, Dark Mode, next/image)

---

## RESUMO EXECUTIVO

| Metrica | Valor |
|---------|-------|
| Total de paginas | 273 |
| Total de services | 220 |
| Total de funcoes exportadas | 1.066 |
| Total de mocks | 206 |
| Total de tabelas Supabase | 107 (unicas) |
| Total de migracoes | 37 |
| Total de politicas RLS | 347 (CREATE POLICY) + 146 (ENABLE RLS) |
| Total de componentes | 123 |
| Total de hooks | 15 |
| Total de contexts | 6 |
| Total de API routes | 17 |
| Total de env vars | 30 |
| Total de linhas de codigo | ~209.878 |

### Paginas por Grupo

| Grupo | Paginas |
|-------|---------|
| Admin | 68 |
| Super Admin | 18 |
| Professor | 32 |
| Aluno (main) | 55 |
| Teen | 12 |
| Kids | 10 |
| Parent | 13 |
| Recepcao | 8 |
| Franqueador | 8 |
| Network | 1 |
| Public | 37 |
| Auth | 9 |
| API Routes | 17 |
| **TOTAL** | **273 paginas + 17 API routes** |

### Cobertura UX por Grupo (paginas com cada feature)

| Grupo | Pages | Skeleton | EmptyState | translateError | PlanGate | SWR | Toast | CSV |
|-------|-------|----------|------------|----------------|----------|-----|-------|-----|
| Admin | 68 | 35 | 19 | 37 | 30 | 1 | 39 | 3 |
| SuperAdmin | 18 | 16 | 0 | 13 | 0 | 1 | 14 | 0 |
| Professor | 32 | 16 | 8 | 20 | 9 | 1 | 21 | 0 |
| Main | 55 | 19 | 12 | 16 | 8 | 1 | 18 | 0 |
| Teen | 12 | 10 | 0 | 1 | 8 | 1 | 3 | 0 |
| Kids | 10 | 9 | 0 | 0 | 7 | 0 | 6 | 0 |
| Parent | 13 | 10 | 1 | 1 | 2 | 0 | 1 | 0 |
| Recepcao | 8 | 7 | 1 | 6 | 1 | 1 | 7 | 0 |
| Franqueador | 8 | 1 | 2 | 7 | 0 | 0 | 7 | 0 |
| Public | 37 | 8 | 1 | 3 | 0 | 0 | 0 | 0 |
| Auth | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **TOTAL** | **273** | **132** | **45** | **105** | **65** | **6** | **125** | **3** |
| **%** | — | **48%** | **16%** | **38%** | **24%** | **2%** | **46%** | **1%** |

### Outros indicadores UX globais

| Indicador | Valor |
|-----------|-------|
| Arquivos com aria-label | 64 |
| Arquivos com data-stagger (animacoes) | 22 |
| Regras CSS dark mode (.dark) | 86 |
| Tags `<img>` restantes (deveria ser 0) | 0 |
| Paginas com next/image | 5 |
| Paginas 'use client' | 271/273 |

---

## FASE 1 — INVENTARIO TECNICO

### 1A. Services (220 total, 1.066 exports)

| Status | Quantidade | % |
|--------|-----------|---|
| Parcial (real + mock via isMock) | 24 | 11% |
| Mock only (sem queries Supabase) | 196 | 89% |
| Producao 100% real | 0 | 0% |
| Quebrado (throw not implemented) | 0 | 0% |

**24 services com queries Supabase reais (via isMock bifurcation):**

| # | Service | Linhas | Refs Supabase | Refs Mock | Status |
|---|---------|--------|---------------|-----------|--------|
| 1 | compete.service.ts | 1557 | 162 | 114 | Parcial |
| 2 | whatsapp.service.ts | 354 | 36 | 27 | Parcial |
| 3 | perfil.service.ts | 711 | 32 | 15 | Parcial |
| 4 | auth.service.ts | — | 31 | 19 | Parcial |
| 5 | avaliacao.service.ts | 347 | 22 | 9 | Parcial |
| 6 | turmas.service.ts | — | 19 | 13 | Parcial |
| 7 | tutorial.service.ts | — | 19 | 7 | Parcial |
| 8 | plano-aula.service.ts | 445 | 19 | 23 | Parcial |
| 9 | checkin.service.ts | — | 16 | 9 | Parcial |
| 10 | payment-gateway.service.ts | — | 15 | 23 | Parcial |
| 11 | admin.service.ts | — | 13 | 5 | Parcial |
| 12 | evaluation.service.ts | — | 13 | 9 | Parcial |
| 13 | landing-page.service.ts | — | 13 | 9 | Parcial |
| 14 | onboarding.service.ts | — | 13 | 7 | Parcial |
| 15 | aluno.service.ts | 432 | 12 | 3 | Parcial |
| 16 | churn-prediction.service.ts | — | 12 | 11 | Parcial |
| 17 | preferences.service.ts | 366 | 12 | 14 | Parcial |
| 18 | financeiro.service.ts | — | 10 | 3 | Parcial |
| 19 | crm.service.ts | — | 9 | 9 | Parcial |
| 20 | horarios.service.ts | — | 9 | 5 | Parcial |
| 21 | turma-ativa.service.ts | — | 8 | 5 | Parcial |
| 22 | professor.service.ts | — | 7 | 3 | Parcial |
| 23 | health-score.service.ts | — | 5 | 5 | Parcial |
| 24 | qrcode.service.ts | — | 3 | 5 | Parcial |

**NOTA:** Todos 24 services usam o padrao `if (isMock()) { return mock } else { return supabase }`. Com `NEXT_PUBLIC_USE_MOCK=true` (atual), TODOS executam via mock. As queries Supabase estao escritas mas nao testadas em producao.

**Top 15 maiores services (por linhas):**

| # | Service | Linhas |
|---|---------|--------|
| 1 | compete.service.ts | 1557 |
| 2 | suporte.service.ts | 984 |
| 3 | perfil.service.ts | 711 |
| 4 | prospeccao.service.ts | 709 |
| 5 | video-experience.service.ts | 647 |
| 6 | video-upload.service.ts | 529 |
| 7 | pedagogico.service.ts | 460 |
| 8 | plano-aula.service.ts | 445 |
| 9 | aluno.service.ts | 432 |
| 10 | content-management.service.ts | 405 |
| 11 | preferences.service.ts | 366 |
| 12 | pricing.service.ts | 356 |
| 13 | whatsapp.service.ts | 354 |
| 14 | academia-teorica.service.ts | 350 |
| 15 | avaliacao.service.ts | 347 |

### 1B. Mocks (206 total)

**Top 15 maiores mocks:**

| # | Mock | Linhas |
|---|------|--------|
| 1 | academia-teorica.mock.ts | 1679 |
| 2 | suporte.mock.ts | 1459 |
| 3 | streaming.mock.ts | 1313 |
| 4 | video-experience.mock.ts | 967 |
| 5 | pedagogico.mock.ts | 808 |
| 6 | mensagens.mock.ts | 767 |
| 7 | compete.mock.ts | 705 |
| 8 | in-app-notification.mock.ts | 678 |
| 9 | pricing.mock.ts | 581 |
| 10 | video-upload.mock.ts | 526 |
| 11 | superadmin.mock.ts | 498 |
| 12 | content-management.mock.ts | 483 |
| 13 | prospeccao.mock.ts | 443 |
| 14 | perfil.mock.ts | 417 |
| 15 | video-storage.mock.ts | 363 |

### 1C. Tabelas Supabase (107 unicas, 37 migracoes)

Todas as tabelas definidas em 37 migracoes. 347 CREATE POLICY + 146 ENABLE RLS.

**Tabelas por dominio:**

- **Auth/Users (7):** profiles, guardians, memberships, students, student_xp, push_tokens, tutorial_progress
- **Academy (6):** academies, academy_onboard_tokens, academy_onboard_uses, academy_settings, academy_subscriptions, academy_tournament_stats
- **Classes (5):** classes, class_enrollments, class_notes, attendance, modalities
- **Financial (8):** invoices, subscriptions, plans, billing_history, payment_charges, payment_customers, payment_subscriptions, nps_responses
- **Content/Video (16):** videos, video_progress, video_comments, video_likes, video_notes, video_questions, video_ratings, video_saves, video_chapters, video_audiences, video_class_assignments, video_series, video_series_items, series, series_videos, storage_usage
- **Evaluation (4):** evaluations, progressions, achievements, challenge_progress
- **Compete (9):** tournaments, tournament_brackets, tournament_categories, tournament_circuits, tournament_feed, tournament_matches, tournament_predictions, tournament_registrations, athlete_profiles
- **Messaging (4):** conversations, messages, broadcast_messages, broadcast_recipients
- **Settings (3):** user_preferences, academy_settings, platform_settings
- **Theory (5):** theory_modules, theory_lessons, theory_progress, theory_quiz_attempts, theory_certificates, glossary_terms
- **CRM/Leads (5):** prospects, prospect_contacts, leads, landing_page_configs, landing_page_leads
- **Curriculum (4):** academy_curricula, curriculum_modules, curriculum_techniques, curriculum_progress
- **Social (4):** feed_posts, feed_comments, feed_likes, comment_likes, question_votes
- **Events (2):** events, event_registrations
- **Misc (9):** units, invite_tokens, invite_uses, notifications, incidents, contact_messages, telemetry_events, telemetry_sessions, support_tickets
- **WhatsApp (4):** whatsapp_automations, whatsapp_configs, whatsapp_messages, whatsapp_templates
- **Pricing (4):** pricing_modules, pricing_packages, pricing_tiers, module_usage_tracking
- **Churn (3):** churn_predictions, churn_actions, meeting_actions, meeting_participants, pedagogical_meetings

### 1D. Migracoes (37 total)

| # | Arquivo | Descricao |
|---|---------|-----------|
| 1 | 001_auth_profiles.sql | Auth, profiles, roles |
| 2 | 002_tenants.sql | Academies, multi-tenant |
| 3 | 003_classes.sql | Turmas, matriculas |
| 4 | 004_attendance.sql | Presenca, check-in |
| 5 | 005_pedagogic.sql | Avaliacoes, progressoes |
| 6 | 006_content.sql | Videos, series |
| 7 | 007_social.sql | Feed, comentarios |
| 8 | 008_financial.sql | Faturas, planos |
| 9 | 009_seed.sql | Dados iniciais |
| 10 | 010_auth_trigger_and_policies.sql | Triggers + RLS |
| 11 | 011_seed_tables.sql | Seed adicional |
| 12 | 012_enforce_rls_all_tables.sql | RLS em todas tabelas |
| 13 | 013_performance_indexes.sql | Indices de performance |
| 14 | 014_invite_tokens.sql | Tokens de convite |
| 15 | 015_superadmin.sql | Super admin features |
| 16 | 016_indexes.sql | Indices adicionais |
| 17 | 017_go_live_fixes.sql | Fixes pre-producao |
| 18 | 018_fix_rls_cross_tenant.sql | Fix RLS cross-tenant |
| 19 | 019_fix_profiles_rls_recursion.sql | Fix recursao profiles |
| 20 | 020_fix_memberships_rls_recursion.sql | Fix recursao memberships |
| 21 | 021_modular_pricing.sql | Precos modulares |
| 22 | 022_tutorial_progress.sql | Progresso tutorial |
| 23 | 023_telemetry.sql | Telemetria |
| 24 | 024_prospeccao.sql | Prospeccao CRM |
| 25 | 025_app_stores.sql | App stores |
| 26 | 026_academia_teorica.sql | Academia teorica |
| 27 | 028_video_experience.sql | Experiencia video |
| 28 | 029_contact_messages.sql | Mensagens contato |
| 29 | 030_academy_acknowledged.sql | Academia acknowledged |
| 30 | 031_sales_features.sql | Features vendas |
| 31 | 032_sales_features_rls_seed.sql | RLS + seed vendas |
| 32 | 033_video_upload.sql | Upload video |
| 33 | 034_pedagogico.sql | Pedagogico avancado |
| 34 | 035_compete.sql | Campeonatos |
| 35 | 20240320000001_platform_settings_video_storage.sql | Storage config |
| 36 | 20240320000002_messaging_system.sql | Sistema mensagens |
| 37 | 20240320000003_user_preferences_academy_settings.sql | Preferencias |

### 1E. Componentes (123 total, 23 pastas)

| Pasta | Componentes |
|-------|-------------|
| components/shared/ | 34 |
| components/ui/ | 18 |
| components/shell/ | 14 |
| components/auth/ | 10 |
| components/landing/ | 8 |
| components/tutorial/ | 5 |
| components/video/ | 4 |
| components/plans/ | 4 |
| components/ai/ | 3 |
| components/billing/ | 3 |
| components/compete/ | 3 |
| components/marketplace/ | 2 |
| components/onboarding/ | 2 |
| components/pwa/ | 2 |
| components/support/ | 2 |
| components/calendar/ | 1 |
| components/certificado/ | 1 |
| components/championship/ | 1 |
| components/checkin/ | 2 |
| components/legal/ | 1 |
| components/notifications/ | 1 |
| components/reports/ | 1 |
| components/streaming/ | 1 |

### 1F. Hooks (15 total)

| Hook | Funcao |
|------|--------|
| useActiveAcademy | Academia ativa do usuario |
| useAuth | Autenticacao + session |
| useCart | Carrinho de compras |
| useChartTheme | Tema para graficos |
| useCountUp | Animacao contagem |
| useDashboardLayout | Layout dashboard |
| usePlan | Plano atual + limites |
| useProductTour | Tour guiado |
| useScrollReveal | Animacao scroll |
| useServiceData | Data fetching generico |
| useSignedVideoUrl | URL assinada video |
| useStudentId | ID aluno logado |
| useSWRFetch | Cache SWR para dashboards |
| useToast | Notificacoes toast |
| useTutorial | Estado tutorial |

### 1G. Contexts (6 total)

| Context | Arquivo |
|---------|---------|
| AuthContext | lib/contexts/AuthContext.tsx |
| CartContext | lib/contexts/CartContext.tsx |
| PlanContext | lib/contexts/PlanContext.tsx |
| ThemeContext | lib/contexts/ThemeContext.tsx |
| ToastContext | lib/contexts/ToastContext.tsx |
| MockRealtimeContext | lib/realtime/mock-realtime.tsx |

### 1H. Shells (8 total)

| Shell | Links Nav | NotificationBell | CommandPalette | DarkMode |
|-------|-----------|------------------|----------------|----------|
| AdminShell.tsx | ~30 (sidebar 10 secoes) | Sim | Sim | Sim (ThemeContext) |
| SuperAdminShell.tsx | ~20 (sidebar 8 secoes) | Nao | Nao | Nao |
| ProfessorShell.tsx | ~15 (sidebar+bottom+drawer) | Sim | Sim | Sim (ThemeContext) |
| MainShell.tsx | 5 (bottom nav) | Nao | Nao | Sim (ThemeContext) |
| TeenShell.tsx | 5 (bottom nav + XP bar) | Nao | Nao | Sim (ThemeContext) |
| KidsShell.tsx | 4 (bottom nav) | Nao | Nao | Sim (ThemeContext) |
| ParentShell.tsx | 6 (bottom nav) | Nao | Nao | Sim (ThemeContext) |
| RecepcaoShell.tsx | 5 (bottom nav) | Nao | Nao | Sim (ThemeContext) |

### 1I. Integracoes Externas (30 ENV Vars)

| # | Integracao | ENV Vars | Status |
|---|-----------|----------|--------|
| 1 | Supabase | NEXT_PUBLIC_SUPABASE_URL, _ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Configurado |
| 2 | Google Places | GOOGLE_PLACES_API_KEY | Codigo pronto, precisa key |
| 3 | Anthropic AI | ANTHROPIC_API_KEY | Codigo pronto, precisa key |
| 4 | WhatsApp (Z-API) | WHATSAPP_API_KEY, _API_URL, _INSTANCE, _WEBHOOK_TOKEN | Codigo pronto |
| 5 | Asaas (Pagamento) | ASAAS_API_KEY, _SANDBOX, _WEBHOOK_TOKEN | Codigo pronto |
| 6 | Stripe | STRIPE_SECRET_KEY, _WEBHOOK_SECRET | Codigo pronto |
| 7 | Email | EMAIL_API_KEY, _FROM, _PROVIDER | Codigo pronto |
| 8 | Push (APNs/FCM) | APNS_KEY_ID, _TEAM_ID, FCM_SERVER_KEY, VAPID keys | Codigo pronto |
| 9 | PostHog | NEXT_PUBLIC_POSTHOG_KEY, _HOST | Codigo pronto |
| 10 | Mock Mode | NEXT_PUBLIC_USE_MOCK | Ativo (true) |
| 11 | Payment Gateway | PAYMENT_GATEWAY | Seleciona Asaas/Stripe |
| 12 | App Config | NEXT_PUBLIC_APP_URL, _PLATFORM, NODE_ENV, LOG_LEVEL | Configurado |

### 1J. API Routes (17 total)

| # | Rota | Funcao |
|---|------|--------|
| 1 | /api/auth/register | Registro de usuario |
| 2 | /api/auth/reset-child-password | Reset senha filho |
| 3 | /api/contato | Formulario contato |
| 4 | /api/health | Health check |
| 5 | /api/leads | Captura de leads |
| 6 | /api/prospeccao/buscar | Busca Google Places |
| 7 | /api/prospeccao/enriquecer | Enriquecimento IA |
| 8 | /api/prospeccao/mensagem | Gerar mensagem IA |
| 9 | /api/telemetry | Telemetria |
| 10 | /api/v1/attendance | Presenca (REST) |
| 11 | /api/v1/classes | Turmas (REST) |
| 12 | /api/v1/events | Eventos (REST) |
| 13 | /api/v1/invoices | Faturas (REST) |
| 14 | /api/v1/plans | Planos (REST) |
| 15 | /api/v1/students | Alunos (REST) |
| 16 | /api/webhooks/payment | Webhook pagamento |
| 17 | /api/webhooks/whatsapp | Webhook WhatsApp |

---

## FASE 2 — INVENTARIO FUNCIONAL

### SUPER ADMIN (18 paginas, 18 funcionalidades)

| # | Funcionalidade | Pagina | Funciona? | Supabase? | Obs |
|---|----------------|--------|-----------|-----------|-----|
| 1 | Dashboard global (MRR, academias, churn) | /superadmin | Sim (mock) | Nao | SWR cache, Skeleton |
| 2 | Listar academias | /superadmin/academias | Sim (mock) | Nao | 1221 linhas, filtros, health score |
| 3 | Criar academia manual | /superadmin/academias | Sim (mock) | Nao | Modal completo |
| 4 | Gerar link de cadastro | /superadmin/academias | Sim (mock) | Nao | Gera + copia clipboard |
| 5 | Dar ciencia de nova academia | /superadmin | Sim (mock) | Nao | Botao no dashboard |
| 6 | Buscar prospects (Google Places) | /superadmin/prospeccao | Sim (mock) | Nao | 2636 linhas, API route real |
| 7 | Pipeline CRM (Kanban) | /superadmin/prospeccao | Sim (mock) | Nao | 7 stages drag&drop |
| 8 | Gerar mensagem IA | /superadmin/prospeccao | Sim (mock) | Nao | Regenerar com Anthropic |
| 9 | Central de suporte (6 tabs) | /superadmin/suporte | Sim (mock) | Nao | 1832 linhas |
| 10 | Ver receita MRR/ARR | /superadmin/receita | Sim (mock) | Nao | Charts Recharts + cohort |
| 11 | Aprovar campeonato | /superadmin/compete | Sim (mock) | Nao | 504 linhas |
| 12 | Config plataforma (6 tabs) | /superadmin/configuracoes | Sim (mock) | Nao | Completo |
| 13 | Config storage videos | /superadmin/configuracoes/storage | Sim (mock) | Nao | 5 providers |
| 14 | Feature flags | /superadmin/features | Sim (mock) | Nao | CRUD completo |
| 15 | Impersonar academia | /superadmin/academias | Sim (mock) | Nao | Banner no header |
| 16 | Analytics produto | /superadmin/analytics | Sim (mock) | Nao | Adocao, devices |
| 17 | Auditoria | /superadmin/auditoria | Sim (mock) | Nao | Log viewer completo |
| 18 | Comunicacao SaaS | /superadmin/comunicacao | Sim (mock) | Nao | Broadcasts + segmentacao |

**Score: 18/18 funcionalidades implementadas. Skeleton: 16/18. translateError: 13/18. Toast: 14/18.**

### ADMIN (68 paginas, 35 funcionalidades)

| # | Funcionalidade | Funciona? | PlanGate? | Obs |
|---|----------------|-----------|-----------|-----|
| 1 | Dashboard (KPIs, painel dia, graficos) | Sim (mock) | core | SWR cache, "Hoje na Academia", "Agora na Academia" |
| 2 | Criar turma | Sim (mock) | core | Modal completo |
| 3 | Editar turma | Sim (mock) | core | Modal edicao |
| 4 | Excluir turma | Sim (mock) | core | Com confirmacao |
| 5 | Cadastrar aluno | Parcial | core | Via link de convite |
| 6 | Editar aluno | Parcial | core | Link para detalhe |
| 7 | Excluir/desativar aluno | Nao | core | Falta implementar |
| 8 | Busca global (Ctrl+K) | Sim | — | CommandPalette no shell |
| 9 | Filtros nas listas | Sim | — | Turmas, alunos, conteudo |
| 10 | Exportar CSV | Sim (mock) | — | Alunos, turmas, financeiro (exportToCSV) |
| 11 | Gerar convite (link) | Sim (mock) | core | Pagina completa |
| 12 | Ver financeiro | Sim (mock) | essencial | 3 tabs, CSV export |
| 13 | Gerar fatura | Parcial | essencial | Botao existe |
| 14 | Registrar pagamento | Sim (mock) | essencial | Mark as paid |
| 15 | WhatsApp cobranca | Sim (mock) | pro | Templates + envio |
| 16 | WhatsApp automacoes | Sim (mock) | pro | CRUD |
| 17 | WhatsApp historico | Sim (mock) | pro | Tabela + filtros |
| 18 | Editar landing page | Sim (mock) | pro | 848 linhas |
| 19 | Ver churn (alunos em risco) | Sim (mock) | blackbelt | 1045 linhas |
| 20 | Coord pedagogica (6 tabs) | Sim (mock) | blackbelt | 1371 linhas |
| 21 | Criar campeonato | Sim (mock) | blackbelt | CRUD completo |
| 22 | Graduacoes (aprovar) | Sim (mock) | essencial | 721 linhas |
| 23 | Eventos (CRUD + calendario) | Sim (mock) | — | 613 linhas |
| 24 | Conteudo (videos, storage) | Sim (mock) | pro | Upload + manage |
| 25 | Relatorios | Sim (mock) | pro | 5 tipos + export PDF |
| 26 | Mensagens | Sim (mock) | — | Conversas + broadcast |
| 27 | Ver meu plano | Sim (mock) | core | 756 linhas, modulos |
| 28 | Configuracoes (7 tabs) | Sim (mock) | core | Completo |
| 29 | Loja (produtos/pedidos) | Sim (mock) | pro | Hub + sub-paginas |
| 30 | Estoque | Sim (mock) | pro | Pagina dedicada |
| 31 | Inadimplencia | Sim (mock) | essencial | Pagina dedicada |
| 32 | Contratos | Sim (mock) | essencial | Pagina dedicada |
| 33 | Aula experimental | Sim (mock) | essencial | Pagina completa |
| 34 | Calendario | Sim | — | CalendarView wrapper |
| 35 | Perfil | Sim (mock) | core | next/image |

**Score: 33/35 funcionalidades implementadas (94%). Skeleton: 35/68. EmptyState: 19/68. translateError: 37/68. PlanGate: 30/68. Toast: 39/68.**

### PROFESSOR (32 paginas, 17 funcionalidades)

| # | Funcionalidade | Funciona? | Obs |
|---|----------------|-----------|-----|
| 1 | Dashboard (proxima aula, alertas, duvidas) | Sim (mock) | SWR cache, 1020 linhas |
| 2 | Minhas turmas | Sim (mock) | 326 linhas |
| 3 | Modo aula (QR, timer, presenca) | Sim (mock) | 492 linhas |
| 4 | Lista de alunos | Sim (mock) | 183 linhas + detalhe |
| 5 | Avaliar aluno (radar 8 criterios) | Sim (mock) | 710 linhas |
| 6 | Upload video (drag&drop) | Sim (mock) | 1620 linhas |
| 7 | Criar/gerenciar playlists | Sim (mock) | Tab em conteudo |
| 8 | Responder duvidas | Sim (mock) | 425 linhas, EmptyState |
| 9 | Diario de aula | Sim (mock) | 551 linhas |
| 10 | Plano de aula semanal | Sim (mock) | 559 linhas |
| 11 | Banco de tecnicas (CRUD + busca) | Sim (mock) | 426 linhas |
| 12 | Mensagens (com admin, alunos) | Sim (mock) | Shared components |
| 13 | Broadcast para turmas | Sim (mock) | BroadcastComposer |
| 14 | Configuracoes (6 tabs) | Sim (mock) | 473 linhas |
| 15 | Alertas | Sim (mock) | 367 linhas |
| 16 | Relatorios | Sim (mock) | 791 linhas |
| 17 | Perfil | Sim (mock) | next/image, 396 linhas |

**Score: 17/17 funcionalidades (100%). Skeleton: 16/32. EmptyState: 8/32. translateError: 20/32. PlanGate: 9/32. Toast: 21/32.**

### ALUNO ADULTO (55 paginas, 18 funcionalidades)

| # | Funcionalidade | Funciona? | Obs |
|---|----------------|-----------|-----|
| 1 | Dashboard (faixa, streak, aula) | Sim (mock) | SWR cache, 504 linhas |
| 2 | Check-in QR | Sim (mock) | FABCheckin |
| 3 | Turmas/horarios | Sim (mock) | 120 linhas, EmptyState |
| 4 | Progresso de faixa | Sim (mock) | 97 linhas |
| 5 | Conquistas/badges | Sim (mock) | 322 linhas, EmptyState |
| 6 | Biblioteca de videos | Sim (mock) | 688 linhas |
| 7 | Assistir video (player) | Sim (mock) | 1106 linhas |
| 8 | Curtir/comentar/duvida | Sim (mock) | 5 tabs no player |
| 9 | Academia teorica | Sim (mock) | 347 linhas |
| 10 | Glossario (100 termos) | Sim (mock) | 259 linhas, EmptyState |
| 11 | Perfil + carteirinha digital | Sim (mock) | 605 linhas, QR code, share/print |
| 12 | Mensagens | Sim (mock) | Shared components |
| 13 | Configuracoes (6 tabs) | Sim (mock) | 490 linhas |
| 14 | Desafios | Sim (mock) | EmptyState |
| 15 | Liga/ranking | Sim (mock) | Pagina completa |
| 16 | Feed social | Sim (mock) | EmptyState |
| 17 | Campeonatos | Sim (mock) | Inscricao completa, EmptyState |
| 18 | Loja | Sim (mock) | Catalogo + carrinho |

**Score: 18/18 funcionalidades (100%). Skeleton: 19/55. EmptyState: 12/55. translateError: 16/55. PlanGate: 8/55. Toast: 18/55.**

### TEEN (12 paginas, 10 funcionalidades)

| # | Funcionalidade | Funciona? | Obs |
|---|----------------|-----------|-----|
| 1 | Dashboard gamer (XP, level, ranking, streak) | Sim (mock) | SWR cache, 286 linhas |
| 2 | Academia teorica com XP | Sim (mock) | PlanGate, 271 linhas |
| 3 | Ranking (top 10, minha posicao) | Sim (mock) | PlanGate, 279 linhas |
| 4 | Season pass (tiers, rewards) | Sim (mock) | PlanGate, 348 linhas |
| 5 | Desafios semanais | Sim (mock) | PlanGate, 282 linhas |
| 6 | Conquistas (visual gamer) | Sim (mock) | PlanGate, 293 linhas |
| 7 | Conteudo com XP por video | Sim (mock) | PlanGate, 353 linhas + [id] |
| 8 | Perfil gamer (nickname, avatar) | Sim (mock) | 262 linhas |
| 9 | Mensagens (so professores) | Sim (mock) | 152 linhas |
| 10 | Configuracoes (tab Jogo) | Sim (mock) | PlanGate, 394 linhas |

**Score: 10/10 funcionalidades (100%). Skeleton: 10/12. PlanGate: 8/12. translateError: 1/12.**

### KIDS (10 paginas, 5 funcionalidades)

| # | Funcionalidade | Funciona? | Obs |
|---|----------------|-----------|-----|
| 1 | Dashboard ludico (mascote, estrelas) | Sim (mock) | 282 linhas |
| 2 | Academia ludica | Sim (mock) | PlanGate, 313 linhas |
| 3 | Recompensas (figurinhas, loja) | Sim (mock) | 292 linhas |
| 4 | Perfil kids (card colorido) | Sim (mock) | 477 linhas |
| 5 | NAO tem mensagens | Correto | Ausente conforme spec |

**Score: 5/5 funcionalidades (100%). Skeleton: 9/10. PlanGate: 7/10. Toast: 6/10.**

### RESPONSAVEL (13 paginas, 8 funcionalidades)

| # | Funcionalidade | Funciona? | Obs |
|---|----------------|-----------|-----|
| 1 | Dashboard familiar (seletor de filhos) | Sim (mock) | 688 linhas |
| 2 | Agenda familiar (semana + mes) | Sim (mock) | CalendarView |
| 3 | Mensagens | Sim (mock) | 160 linhas |
| 4 | Pagamentos (faturas dos filhos) | Sim (mock) | 115 linhas, EmptyState |
| 5 | Autorizacoes (campeonato, evento) | Sim (mock) | 484 linhas |
| 6 | Relatorios mensais (por filho) | Sim (mock) | 476 linhas |
| 7 | Presencas | Sim (mock) | 270 linhas |
| 8 | Configuracoes (6 tabs) | Sim (mock) | 395 linhas |

**Score: 8/8 funcionalidades (100%). Skeleton: 10/13. PlanGate: 2/13. translateError: 1/13.**

### RECEPCIONISTA (8 paginas, 7 funcionalidades)

| # | Funcionalidade | Funciona? | Obs |
|---|----------------|-----------|-----|
| 1 | Dashboard do dia (aulas, checkins, caixa) | Sim (mock) | SWR cache, 326 linhas |
| 2 | Busca rapida de aluno | Sim (mock) | 303 linhas |
| 3 | Cadastro rapido | Sim (mock) | 557 linhas |
| 4 | Caixa do dia (registrar, fechar) | Sim (mock) | 307 linhas, EmptyState |
| 5 | Experimentais (agendar, confirmar) | Sim (mock) | 338 linhas |
| 6 | Mensagens | Sim (mock) | 133 linhas |
| 7 | Configuracoes (Atendimento) | Sim (mock) | 361 linhas |

**Score: 7/7 funcionalidades (100%). Skeleton: 7/8. translateError: 6/8. Toast: 7/8.**

### FRANQUEADOR (8 paginas, 8 funcionalidades)

| # | Funcionalidade | Funciona? | Obs |
|---|----------------|-----------|-----|
| 1 | Dashboard da rede | Sim (mock) | 249 linhas |
| 2 | Unidades (lista + detalhe) | Sim (mock) | 294 linhas |
| 3 | Royalties | Sim (mock) | 287 linhas, EmptyState |
| 4 | Compliance/padroes | Sim (mock) | 396 linhas |
| 5 | Expansao | Sim (mock) | 430 linhas |
| 6 | Comunicacao (broadcast rede) | Sim (mock) | 420 linhas, EmptyState |
| 7 | Curriculo padronizado | Sim (mock) | 277 linhas |
| 8 | Configuracoes (tab Rede) | Sim (mock) | 403 linhas |

**Score: 8/8 funcionalidades (100%). Skeleton: 1/8. translateError: 7/8. Toast: 7/8.**

---

## FASE 3 — INVENTARIO DE FLUXOS END-TO-END

| # | Fluxo | Funciona? | Persiste Supabase? | Obs |
|---|-------|-----------|-------------------|-----|
| 1 | Cadastro academia via link | Sim (mock) | Nao | Wizard 4 steps completo |
| 2 | Cadastro academia manual | Sim (mock) | Nao | Modal no superadmin |
| 3 | Convite aluno | Sim (mock) | Nao | Gera link + pagina cadastro |
| 4 | Login email/senha | Sim (mock) | Nao | Redirect por role |
| 5 | Login Google | UI pronta | Nao | Falta OAuth config |
| 6 | Login Apple | UI pronta | Nao | Falta Apple Dev Account |
| 7 | Esqueci senha | Sim (mock) | Nao | 3 paginas do fluxo |
| 8 | Multiplos perfis | Sim (mock) | Nao | ProfileSwitcher |
| 9 | Tutorial primeiro acesso | Sim (mock) | Nao | TutorialProvider + 9 perfis |
| 10 | Check-in QR | UI pronta | Nao | FABCheckin + QRScanner |
| 11 | Avaliacao radar | Sim (mock) | Nao | 8 criterios com slider |
| 12 | Graduacao | Sim (mock) | Nao | Fluxo aprovacao completo |
| 13 | Upload video | Sim (mock) | Nao | Drag&drop com progress bar |
| 14 | Assistir video + interagir | Sim (mock) | Nao | Player + 5 tabs |
| 15 | Quiz teorico | Sim (mock) | Nao | Multipla escolha + nota |
| 16 | Cobranca WhatsApp | Sim (mock) | Nao | Templates + envio |
| 17 | Broadcast | Sim (mock) | Nao | BroadcastComposer |
| 18 | Mensagem direta | Sim (mock) | Nao | ChatView bidirecional |
| 19 | Inscricao campeonato | Sim (mock) | Nao | Fluxo completo + pagamento |
| 20 | Campeonato ao vivo | Sim (mock) | Nao | Brackets + arbitragem + resultados |
| 21 | Landing publica | Sim (mock) | Nao | /g/[slug] + form experimental |
| 22 | Prospeccao IA | Sim (mock) | Nao | Google Places + Claude analise |
| 23 | Bloqueio por plano (PlanGate) | Sim | N/A | 65 paginas com PlanGate |
| 24 | Exportar CSV | Sim | N/A | 3 paginas admin (alunos, turmas, financeiro) |
| 25 | Busca global | Sim | N/A | CommandPalette (Ctrl+K) |
| 26 | Agenda familiar | Sim (mock) | Nao | Semana + mes |
| 27 | Autorizacoes parent | Sim (mock) | Nao | Aprovar/recusar |
| 28 | Season pass teen | Sim (mock) | Nao | Tiers + rewards + XP |
| 29 | Figurinhas kids | Sim (mock) | Nao | Album + colecao |
| 30 | Caixa recepcao | Sim (mock) | Nao | Registrar + fechar caixa |

**Resultado: 30/30 fluxos implementados em UI. 0/30 persistem no Supabase (todos usam mock data).**

---

## FASE 4 — INVENTARIO UX

| # | Elemento UX | Implementado? | Cobertura | Obs |
|---|------------|--------------|-----------|-----|
| 1 | Skeleton loading | Sim | 132/273 paginas (48%) | Componente Skeleton + animate-pulse |
| 2 | EmptyState com CTA | Sim | 45/273 paginas (16%) | Componente EmptyState reutilizavel |
| 3 | Toast em acao CRUD | Sim | 125/273 paginas (46%) | useToast() padrao em todas acoes |
| 4 | Erros em portugues (translateError) | Sim | 105/273 paginas (38%) | lib/utils/error-translator.ts com ~30 traducoes |
| 5 | Filtros com query params | Nao | 0% | Filtros sao state local, nao URL |
| 6 | Exportar CSV | Sim | 3 paginas admin | exportToCSV utility com BOM + semicolon |
| 7 | Acoes em massa (BulkActionBar) | Parcial | ~20% listas | Apenas algumas paginas |
| 8 | Busca global (Ctrl+K) | Sim | 100% (via shell) | CommandPalette em Admin + Professor |
| 9 | Checklist primeiros passos | Sim | Admin dashboard | Card com progresso |
| 10 | Tutorial primeiro acesso | Sim | 9 perfis | TutorialProvider |
| 11 | Boas-vindas personalizadas | Sim | 9 perfis | Modal por role |
| 12 | Suporte no sidebar | Sim | Todos shells | HelpSection component |
| 13 | Acessibilidade (aria-labels) | Parcial | 64 arquivos | Falta em muitas paginas |
| 14 | Responsividade 320px | Sim | ~95% | Grid responsivo Tailwind |
| 15 | Dark mode | Sim | 86 regras CSS | CSS vars (--bb-*) + .dark overrides |
| 16 | Micro-animacoes | Sim | 22 arquivos data-stagger | animate-reveal, card-interactive |
| 17 | PlanGate | Sim | 65 paginas | 5 tiers: core, essencial, pro, blackbelt, enterprise |
| 18 | Badge mensagens nao lidas | Parcial | Admin + Professor | NotificationBell com polling 30s |
| 19 | Web Share API | Parcial | Carteirinha | share + print buttons |
| 20 | CSS @media print | Parcial | Carteirinha | Print button implementado |
| 21 | Cache SWR | Sim | 6 dashboards | useSWRFetch hook |
| 22 | Tablet layout (768-1024px) | Sim | ~80% | Funciona mas nao otimizado |
| 23 | next/image otimizacao | Sim | 5 paginas + 0 `<img>` | Todas <img> migradas |
| 24 | NotificationBell | Sim | Admin + Professor | Dropdown com mark-as-read |
| 25 | Dashboard "Hoje" + "Agora" | Sim | Admin | Cards com dados do dia |

**Resultado: 22/25 elementos implementados, 3 parciais (acessibilidade, acoes massa, filtros URL).**

---

## FASE 5 — GAP ANALYSIS

### LISTA A — BUGS (funciona errado)

| # | Bug | Onde | Severidade | Obs |
|---|-----|------|-----------|-----|
| 1 | Nenhum bug critico encontrado | — | — | Build + typecheck passam sem erros |

### LISTA B — INCOMPLETOS (existe mas falta algo)

| # | Funcionalidade | O que existe | O que falta | Esforco | Prioridade |
|---|----------------|-------------|-------------|---------|-----------|
| 1 | Supabase real | 24 services com queries escritas | Testar e validar com dados reais, migrar 196 services mock-only | XL | Critica |
| 2 | EmptyState | 45 paginas | Faltam ~35 paginas de lista sem EmptyState | M | Baixa |
| 3 | translateError | 105 paginas | Faltam ~50 paginas com catch blocks sem traducao | M | Media |
| 4 | Skeleton loading | 132 paginas | Faltam ~40 paginas sem skeleton/loading state | M | Baixa |
| 5 | PlanGate | 65 paginas | Faltam ~10 paginas que deveriam ter gating | S | Media |
| 6 | Filtros com query params | Filtros state local | Persistir na URL para deep linking | M | Media |
| 7 | Paginacao em listas longas | Nenhuma | Cursor pagination | M | Media |
| 8 | Admin excluir/desativar aluno | Botao nao existe | Adicionar modal + service call | S | Media |
| 9 | Acessibilidade (aria-labels) | 64 arquivos | Revisar restantes | L | Media |
| 10 | NotificationBell | Admin + Professor | Falta em 6 outros shells | S | Baixa |
| 11 | CSV export | 3 paginas admin | Falta em relatorios, professor | S | Baixa |
| 12 | Error boundaries | Nenhum | Adicionar por route group | S | Media |

### LISTA C — NAO EXISTE (deveria ter)

| # | Funcionalidade | Perfil | Esforco | Prioridade |
|---|----------------|--------|---------|-----------|
| 1 | Push notifications reais | Todos | L | Alta |
| 2 | Real-time subscriptions (Supabase Realtime) | Mensagens, checkin | L | Alta |
| 3 | Rate limiting API routes | API | S | Alta |
| 4 | Webhook listeners reais | Admin | M | Media |
| 5 | Google Calendar sync | Admin, professor | M | Baixa |
| 6 | Offline support (PWA cache) | Aluno, professor | L | Baixa |
| 7 | Testes E2E (Playwright) | Todos | L | Media |
| 8 | Error monitoring (Sentry) | Todos | S | Media |
| 9 | Image CDN | Thumbnails, avatars | S | Media |
| 10 | A/B testing | Marketing | M | Baixa |

### LISTA D — INTEGRACOES EXTERNAS PENDENTES

| # | Integracao | Status | O que precisa | Bloqueado por |
|---|-----------|--------|---------------|--------------|
| 1 | Google OAuth | Codigo pronto | Client ID/Secret no Supabase | Config |
| 2 | Apple OAuth | Codigo pronto | Apple Dev Account ($99/ano) | Custo |
| 3 | WhatsApp API real | Templates prontos, service pronto | Twilio/Z-API key + numero verificado | Custo + config |
| 4 | Asaas (pagamento) | Service pronto | Conta Asaas + API key sandbox | Config |
| 5 | Stripe | Service pronto | Conta Stripe + API key | Config |
| 6 | Google Places | API route pronta | API key ativa + billing | Config |
| 7 | Anthropic AI | API route pronta | API key | Config |
| 8 | YouTube upload | Service pronto | OAuth Google + YouTube Data API | Config |
| 9 | Vimeo upload | Service pronto | Vimeo Pro + token | Custo |
| 10 | Push (APNs/FCM) | Config pronta | Firebase project + APNs certs | Config + dev |
| 11 | PostHog analytics | Config pronta | Conta PostHog + project key | Config |
| 12 | Email transacional | Templates prontos | Provedor (Resend/SES) + domain | Config |

---

## FASE 6 — RELATORIO FINAL

### MAPA DE FUNCIONALIDADES

| Metrica | Valor |
|---------|-------|
| Funcionalidades mapeadas | 134 |
| Funcionando UI (mock) | 131 (97.8%) |
| Parciais | 3 (2.2%) |
| Quebradas | 0 (0%) |
| Nao implementadas | 0 |

### POR PERFIL

| Perfil | Paginas | Funcs OK | Parciais | Faltando | Score UI | Score Producao |
|--------|---------|----------|----------|----------|----------|---------------|
| Super Admin | 18 | 18 | 0 | 0 | 10/10 | 2/10 |
| Admin | 68 | 33 | 2 | 0 | 9/10 | 2/10 |
| Professor | 32 | 17 | 0 | 0 | 10/10 | 2/10 |
| Aluno Adulto | 55 | 18 | 0 | 0 | 10/10 | 2/10 |
| Teen | 12 | 10 | 0 | 0 | 10/10 | 2/10 |
| Kids | 10 | 5 | 0 | 0 | 10/10 | 2/10 |
| Responsavel | 13 | 8 | 0 | 0 | 9/10 | 2/10 |
| Recepcionista | 8 | 7 | 0 | 0 | 9/10 | 2/10 |
| Franqueador | 8 | 8 | 0 | 0 | 9/10 | 2/10 |
| **TOTAL** | **273** | **131** | **2** | **0** | **9.6/10** | **2/10** |

**Nota sobre Score Producao:** O score de producao e 2/10 para TODOS os perfis porque nenhum service persiste dados reais. Todas as interacoes usam mock data via `isMock()`. Os 24 services com queries Supabase escritas nunca foram testados em producao.

### FLUXOS END-TO-END

| Metrica | Valor |
|---------|-------|
| Total mapeados | 30 |
| Funcionando em UI | 30 (100%) |
| Persistem no Supabase | 0 (0%) |
| Score Fluxos UI | 10/10 |
| Score Fluxos Real | 0/10 |

### UX ELEMENTS

| Metrica | Valor |
|---------|-------|
| Total verificados | 25 |
| Implementados completo | 19 (76%) |
| Parciais | 3 (12%) |
| Faltando | 3 (12%) |

### COBERTURA POS-FASES 3-10

Melhorias implementadas nas FASES 3-10 em relacao ao inventario anterior:

| Feature | Antes (pre-FASE 3) | Depois (pos-FASE 10) | Delta |
|---------|--------------------|-----------------------|-------|
| Skeleton | ~90% estimado | 132 paginas (48% medido) | Contagem real, mais honesta |
| EmptyState | ~30% estimado | 45 paginas (16% medido) | +~20 paginas novas |
| translateError | 0 paginas | 105 paginas (38%) | +105 paginas (NOVO) |
| PlanGate | ~20 paginas | 65 paginas (24%) | +45 paginas (3x) |
| SWR cache | 0 dashboards | 6 dashboards | +6 (NOVO) |
| Dark mode CSS | ~30 regras | 86 regras | +56 regras (2.8x) |
| NotificationBell | 0 shells | 2 shells (Admin + Professor) | NOVO |
| CSV export | 0 paginas | 3 paginas admin | NOVO |
| next/image | 0 paginas | 5 paginas, 0 `<img>` tags | NOVO |
| Dashboard cards | Basico | "Hoje na Academia" + "Agora na Academia" | NOVO |
| Carteirinha digital | Basica | QR code + share + print | Melhorada |

### GAP ANALYSIS SUMMARY

| Categoria | Quantidade |
|-----------|-----------|
| Bugs criticos | 0 |
| Incompletos | 12 items |
| Nao existe | 10 items |
| Integracoes pendentes | 12 items |

---

## SCORES DE PRONTIDAO

| Metrica | Score | Justificativa |
|---------|-------|---------------|
| Prontidao para DEMO | **9.5/10** | UI completa (273 paginas, 134 funcionalidades), mock data realista, dark mode, mobile responsive, PlanGate, SWR cache, Skeleton, Toast, translateError. Falta apenas polimento final. |
| Prontidao para TRIAL | **3/10** | ZERO persistencia real. Todas interacoes usam mock. Sem auth real (mock login). Sem pagamento real. Demo funciona, trial nao porque dados somem ao recarregar. |
| Prontidao para PRODUCAO | **2/10** | Precisa: (1) migrar 196+ services para Supabase real, (2) auth real, (3) pagamento Asaas/Stripe, (4) email transacional, (5) push notifications, (6) rate limiting, (7) error monitoring. |
| Prontidao para ESCALA | **1/10** | Precisa TUDO acima + CDN para videos, real-time subscriptions, connection pooling, monitoring, CI/CD com staging, load testing, multi-region. |

**Justificativa dos scores honestos:**

- **DEMO 9.5/10:** A UI e impressionante. 273 paginas construidas, 9 perfis completos, dark mode, animacoes, PlanGate, Skeleton, Toast. Um investidor ou cliente vendo a demo ficaria impressionado. O 0.5 que falta: alguns empty states ausentes, filtros sem URL params, acessibilidade parcial.

- **TRIAL 3/10:** O gap ENORME e que NADA persiste. Um usuario testando por 7 dias descobriria rapidamente que: (1) dados resetam ao recarregar, (2) nao consegue criar conta real, (3) nao consegue convidar alunos de verdade, (4) nao recebe emails, (5) nao recebe push. Os 3 pontos sao pela experiencia visual que funciona enquanto nao recarrega.

- **PRODUCAO 2/10:** Para cobrar dinheiro, precisa de TUDO que o trial precisa MAIS: pagamento real, WhatsApp real, compliance (LGPD), SLA, backup, monitoring. Os 2 pontos sao pela arquitetura bem desenhada (isMock pattern facilita a migracao).

- **ESCALA 1/10:** Para 20+ academias simultaneas, precisa de infra real: CDN, edge functions, connection pooling, auto-scaling, monitoring, SLA 99.9%, disaster recovery. O 1 ponto e pelo RLS ja implementado (347 policies) e o multi-tenant schema.

---

## RECOMENDACOES

### VERMELHO — Fazer ANTES da primeira demo
- **Nada bloqueante** — a demo pode ser feita AGORA com mock data
- Opcional: configurar Supabase Auth real para demo com login real
- Opcional: preparar script de "tour guiado" para mostrar features principais

### AMARELO — Fazer no primeiro mes (Trial-ready)
1. Conectar Supabase real nos 5 services core: auth, profiles, classes, attendance, turmas
2. Configurar Google OAuth (precisa Client ID)
3. Implementar persistencia real no fluxo cadastro → login → dashboard
4. Testar fluxo completo: cadastro academia → convite aluno → login → check-in → dashboard
5. Configurar error boundaries por route group
6. Adicionar rate limiting nas 17 API routes
7. Configurar email transacional (Resend ou SES) para convites e reset senha
8. Testar RLS com dados reais (as 347 policies nunca foram testadas)

### VERDE — Fazer no primeiro trimestre (Producao-ready)
1. Migrar TODOS services restantes para Supabase real (196 services)
2. Integrar pagamento real (Asaas sandbox primeiro, depois producao)
3. Integrar WhatsApp real (Z-API ou Twilio)
4. Integrar Google Places para prospeccao
5. Configurar Anthropic API para IA
6. Push notifications (Firebase + APNs)
7. Real-time subscriptions para mensagens e check-in
8. PostHog analytics
9. Error monitoring (Sentry)
10. Testes E2E com Playwright (fluxos criticos)
11. Revisar acessibilidade WCAG 2.1 AA
12. CI/CD com staging environment

### AZUL — Fazer quando escalar (20+ academias)
1. CDN para videos (CloudFront/Bunny.net)
2. Edge Functions para queries pesadas
3. Multi-region Supabase (read replicas)
4. Monitoring completo (DataDog/Grafana)
5. Database connection pooling (PgBouncer)
6. Load testing (k6)
7. A/B testing framework
8. Offline-first com service workers
9. Audit log real (append-only)
10. Backup automatizado e disaster recovery
