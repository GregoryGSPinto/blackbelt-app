# AUDITORIA DE USABILIDADE — BLACKBELT v2
## Relatório Completo de Auditoria do Checklist Mestre

> **Data:** 2026-03-27
> **Método:** Análise estática do código-fonte via grep/find/cat
> **Escopo:** BlackBelt v2 (52 itens em 13 blocos)

---

## BLOCO 1 — ARQUITETURA DE IDENTIDADE

### 1.1 Separação conta vs pessoa vs perfil vs vínculo
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/types/domain.ts:149` — interface Profile (id, user_id, role, display_name, avatar)
- `lib/supabase/helpers.ts:60-76` — memberships table queries
- `supabase/migrations/017_go_live_fixes.sql` — profiles_role_check, memberships_role_check
**O que existe:** Profile com `user_id` + `role`. Tabela `memberships` com `academy_id` vinculando perfil a academia. Enum `MembershipStatus` (Active, Inactive, Suspended, Pending).
**O que falta:** Não existe entidade `Person`/`Pessoa` separada de Profile. Não existe `FamilyLink` ou `family_links`. Profile está acoplado diretamente ao `user_id` (Supabase Auth) sem camada intermediária de pessoa física. Impossível representar "pessoa sem conta" (ex: criança, cônjuge).

---

### 1.2 Múltiplos perfis na mesma conta
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/contexts/AuthContext.tsx:30,39,52,85-127` — profiles array, selectProfile, activeProfile
- `app/(auth)/selecionar-perfil/page.tsx` — tela de seleção de perfil
**O que existe:** AuthContext carrega array de `profiles` para o user logado. Função `selectProfile(profileId)` para trocar perfil ativo. Página `/selecionar-perfil` para escolha quando há múltiplos perfis. ActiveRole salvo em cookie para persistir entre refreshes.

---

### 1.3 Troca rápida de contexto (sem logout)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `components/shared/ProfileSwitcher.tsx` — componente de troca de perfil
- `components/shell/ShellHeader.tsx:18,313` — integrado no header principal
- `components/shell/TeenShell.tsx:11,323`
- `components/shell/SuperAdminShell.tsx:9,356`
- `components/shell/RecepcaoShell.tsx:11,265`
- `components/shell/ProfessorShell.tsx:11,403`
**O que existe:** ProfileSwitcher integrado em todos os shells principais. Permite trocar de perfil (role) sem logout.
**O que falta:** Não existe seletor de dependentes para o Responsável (selectChild/seletorFilho). Responsável não consegue trocar entre "ver como Pedro" vs "ver como Ana".

---

### 1.4 Evolução de ciclo de vida (sem recriar conta)
**Status:** ❌ NÃO EXISTE
**Arquivos encontrados:** Nenhum relevante.
**O que falta:** Não existe função `evolve_profile`, `changeRole`, `transition` ou similar. Não há migração SQL para evolução de role. Transições Kids→Teen→Adulto ou Aluno→Professor exigiriam criação manual de novo perfil.

---

## BLOCO 2 — CENTRAL DA FAMÍLIA

### 2.1 Área do Responsável completa
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `app/(parent)/parent/page.tsx` — dashboard principal
- `app/(parent)/parent/agenda/page.tsx` — agenda familiar
- `app/(parent)/parent/autorizacoes/page.tsx` — autorizações
- `app/(parent)/parent/checkin/page.tsx` — check-in
- `app/(parent)/parent/checkout/[planId]/page.tsx` — checkout
- `app/(parent)/parent/configuracoes/page.tsx` — configurações (tab "Meus Filhos")
- `app/(parent)/parent/jornada/[id]/page.tsx` — jornada do filho
- `app/(parent)/parent/mensagens/page.tsx` — mensagens
- `app/(parent)/parent/notificacoes/page.tsx` — notificações
- `app/(parent)/parent/pagamentos/page.tsx` — pagamentos
- `app/(parent)/parent/perfil/page.tsx` — perfil
- `app/(parent)/parent/presencas/page.tsx` — presenças dos filhos
- `app/(parent)/parent/relatorios/page.tsx` — relatórios
- `lib/api/responsavel.service.ts` — GuardianDashboardDTO, GuardianChildDTO
- `lib/api/responsavel-autorizacoes.service.ts`
- `lib/api/responsavel-jornada.service.ts`
- `lib/api/responsavel-notificacoes.service.ts`
**O que existe:** Dashboard completo com 14 páginas. Seletor de filhos (tab configurações). Serviços dedicados com isMock(). Todas as seções esperadas estão presentes: agenda, pagamentos, mensagens, autorizações, relatórios, configurações.

---

### 2.2 Responsável cria perfil Kids (sem email)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/responsavel.service.ts:45-68` — GuardianChildDTO com dados do filho
- `app/(parent)/parent/configuracoes/page.tsx:30,212-221` — tab "Meus Filhos"
- `app/api/students/create/route.ts` — API de criação de aluno (com suporte a guardian)
**O que existe:** Modelo de dados GuardianChildDTO. Tab "Meus Filhos" nas configurações do responsável. API de criação de aluno suporta vínculo com guardian.
**O que falta:** Não há formulário dedicado "Adicionar Filho" no painel do responsável. Não há validação de idade 5-12 anos. Não há suporte a PIN de 4 dígitos.

---

### 2.3 Responsável cria perfil Teen (com controle parental)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/responsavel-autorizacoes.service.ts:19-30` — ParentalPermission, ControleParental interfaces
- `app/(parent)/parent/autorizacoes/page.tsx` — página de autorizações
- `lib/mocks/responsavel-autorizacoes.mock.ts`
**O que existe:** Interfaces ControleParental e ParentalPermission com key/label/enabled/description. Página de autorizações com tipos: evento, viagem, foto, saída sozinho, contato emergência.
**O que falta:** Não há fluxo de criação de perfil Teen. Não há controle can_change_email/can_change_password. Não há suspensão temporária (suspended_until).

---

### 2.4 Ativação por convite para Teen
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/invites.service.ts` — InviteDTO com status: pending/accepted/expired/cancelled
- `app/(auth)/convite/[token]/page.tsx` — aceitar convite por token
- `app/(admin)/admin/convites/page.tsx` — gestão de convites (admin)
- `app/api/emails/invite/route.ts` — envio de email de convite
- `lib/api/auth.service.ts:138-150` — suporte a inviteToken no signup
**O que existe:** Sistema completo de convites com envio, aceite, cancelamento, reenvio. Status lifecycle (pending→accepted/expired/cancelled). Página de aceite por token.
**O que falta:** Convite é genérico (staff). Não é específico para ativação de Teen. Não há convite via WhatsApp ou link direto.

---

### 2.5 Cadastro "Criar Família" (fluxo único)
**Status:** ❌ NÃO EXISTE
**Arquivos encontrados:** Nenhum.
**O que falta:** Não existe wizard de 6 etapas para criação familiar. Não há fluxo unificado responsável → dependentes → turma → financeiro → convites.

---

### 2.6 Vínculo de responsável principal e secundário
**Status:** ❌ NÃO EXISTE
**Arquivos encontrados:** Nenhum relevante.
**O que falta:** Não existe distinção entre responsável principal/secundário. Não há campos is_primary_guardian, is_financial_responsible, can_authorize, receives_notifications.

---

### 2.7 Cobrança familiar (financeiro por família)
**Status:** ❌ NÃO EXISTE
**Arquivos encontrados:** Nenhum relevante (apenas comentário em mock NPS: "Poderiam ter plano familia").
**O que falta:** Não existe agrupamento de cobrança por família. Não há separação aluno ≠ pagador ≠ responsável. Não há plano família com desconto.

---

## BLOCO 3 — PERMISSÕES E AUTONOMIA POR FAIXA ETÁRIA

### 3.1 Permissões separadas por faixa etária (Kids vs Teen vs Adulto)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/responsavel-autorizacoes.service.ts:19-30` — ParentalPermission
- `components/shell/KidsShell.tsx` — shell dedicado Kids (simplificado)
- `components/shell/TeenShell.tsx` — shell dedicado Teen
- `lib/types/domain.ts:11-22` — Roles separados (AlunoAdulto, AlunoTeen, AlunoKids)
**O que existe:** Roles distintos para Kids/Teen/Adulto. Shells separados com UIs diferentes. ParentalPermission interface.
**O que falta:** Não há sistema de permissões granular programático (canAccess/hasPermission). As restrições são implícitas pela separação de shells, não configuráveis.

---

### 3.2 Autonomia parcial do Teen (configurável por academia)
**Status:** ❌ NÃO EXISTE
**Arquivos encontrados:** Nenhum.
**O que falta:** Não existe configuração por academia para definir o que o Teen pode fazer (check-in sozinho, ver pagamentos, alterar dados, ranking geral).

---

## BLOCO 4 — CADASTRO E ONBOARDING

### 4.1 Admin/Owner cadastrar aluno direto pelo painel
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/api/students/create/route.ts` — API completa: auth → profile → membership → student → enrollment → guardian
- `app/(admin)/admin/alunos/page.tsx` — listagem de alunos com ações
- `app/(admin)/admin/alunos/[id]/page.tsx` — detalhe do aluno
- `lib/api/class.service.ts:133` — addStudent a turma
**O que existe:** API route completa para criação de aluno com todo o fluxo (auth, profile, membership, student, enrollment, guardian). Listagem de alunos no admin.
**O que falta:** Não há fluxo de senha temporária (needs_password_change). Não foi encontrado botão "Cadastrar Aluno" direto no painel admin (a criação parece ser via API/wizard).

---

### 4.2 Admin cadastrar staff com fluxo unificado
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `app/(admin)/admin/equipe/page.tsx` — página de gestão de equipe
- `lib/api/invites.service.ts` — listStaff, sendInvite, cancelInvite, resendInvite
- `app/(admin)/admin/convites/page.tsx` — gestão de convites
**O que existe:** Página de equipe para admin. Service com listStaff (filtra por admin/professor/receptionist), sendInvite (com role e unitIds), cancelInvite, resendInvite. Gestão completa de convites.

---

### 4.3 Cadastro rápido para recepção (30 segundos)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/(recepcao)/recepcao/cadastro/page.tsx` — página de cadastro na recepção
- `lib/api/recepcao-dashboard.service.ts:27` — tipo 'cadastro_incompleto' em pendências
- `lib/mocks/recepcao-dashboard.mock.ts:33` — mock "Cadastro incompleto" com ação "Completar"
**O que existe:** Recepção tem página de cadastro dedicada. Sistema reconhece cadastros incompletos como pendência.
**O que falta:** Não foi encontrado fluxo "rápido" com apenas Nome + Telefone. Não há salvamento de rascunho explícito.

---

### 4.4 Cadastro de aluno experimental (visitante)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/api/trial.service.ts` — TrialStudent, TrialStatus, TrialSource (walk_in, website, instagram, etc.)
- `app/(admin)/admin/experimental/page.tsx` — listagem de experimentais
- `app/(admin)/admin/experimental/novo/page.tsx` — novo experimental
- `app/(admin)/admin/experimental/[id]/page.tsx` — detalhe
- `app/(admin)/admin/experimental/config/page.tsx` — configurações
- `app/(admin)/admin/aula-experimental/page.tsx` — aula experimental
- `app/(public)/aula-experimental/page.tsx` — formulário público
- `app/(main)/dashboard/trial/page.tsx` — dashboard trial do aluno
- `app/(main)/dashboard/trial/feedback/page.tsx` — feedback do trial
**O que existe:** Sistema completo: formulário público, gestão admin, detalhe, config, dashboard trial, feedback. TrialStudent com source (walk_in, referral, etc.), experience_level, health info, trial_classes_limit, conversion tracking, rating/feedback.

---

### 4.5 Rascunho de cadastro (estados de perfil)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/types/domain.ts:38-43` — MembershipStatus: Active, Inactive, Suspended, Pending
- `lib/types/domain.ts:55` — InvoiceStatus: Draft, Open, Paid, Void, Uncollectible
- `lib/types/event.ts:9` — EventStatus: draft, published, cancelled, completed
**O que existe:** MembershipStatus com 4 estados. InvoiceStatus com Draft. EventStatus com draft.
**O que falta:** Não existe lifecycle completo de perfil (draft → pendente → convidado → ativo → suspenso → arquivado). Membership tem Pending mas não Draft/Invited/Archived.

---

### 4.6 Importação de alunos em massa (CSV/Excel)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/(admin)/admin/alunos/page.tsx:176-184` — download de "Planilha Modelo" CSV
- `app/(admin)/admin/wizard/page.tsx:82,505` — importMethod com opção 'csv'
- `lib/utils/export-csv.ts` — exportToCSV utility
**O que existe:** Template CSV para download com campos (Nome, Email, Telefone, CPF, Data Nascimento, Faixa, Turma, Plano). Wizard com opção de importação CSV. Export CSV funcional.
**O que falta:** Não há papaparse/SheetJS no package.json. Não foi encontrado parser CSV para upload de fato. A importação no wizard pode ser apenas UI sem backend.

---

### 4.7 Wizard de setup da academia/box (primeiro login)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `components/onboarding/OnboardingWizard.tsx` — componente wizard com steps
- `app/(admin)/admin/setup-wizard/page.tsx` — página do setup wizard
- `lib/analytics/posthog.ts:59` — evento ONBOARDING_COMPLETED
- `components/onboarding/FirstStepsChecklist.tsx` — checklist de primeiros passos
**O que existe:** OnboardingWizard com steps guiados. Página dedicada. Tracking de completion via PostHog. FirstStepsChecklist no dashboard admin.

---

### 4.8 Wizard de matrícula inteligente
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/(admin)/admin/wizard/page.tsx` — wizard com importMethod (csv/manual/later)
**O que existe:** Página wizard no admin com opções de cadastro (CSV, manual, depois).
**O que falta:** Não há componente MatriculaWizard/EnrollmentWizard dedicado com stepper e progresso visual. O wizard parece mais focado em setup do que em matrícula individual.

---

### 4.9 Duplicação inteligente para irmãos
**Status:** ❌ NÃO EXISTE
**Arquivos encontrados:** Nenhum relevante.
**O que falta:** Não existe reaproveitamento de endereço, responsável ou pagador ao cadastrar segundo filho. Cada cadastro é independente.

---

### 4.10 Entrada pela store clara (primeira tela)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/page.tsx` — landing page com profiles (Admin, Professor, Aluno, Teen, Kids, Responsável)
- `app/(auth)/cadastro/page.tsx` — cadastro
- `app/(public)/g/[slug]/page.tsx` — página da academia por slug
**O que existe:** Landing page menciona os perfis como cards de marketing. Página de cadastro existe. Página de academia por slug público.
**O que falta:** Não há seletor explícito "Sou academia" / "Sou aluno" / "Sou responsável" / "Tenho convite" / "Já tenho conta" como fluxo de entrada.

---

### 4.11 Busca de academia/box
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/(public)/g/[slug]/page.tsx` — acesso por slug da academia
- `lib/api/prospeccao.service.ts:212` — buscarAcademias (superadmin)
- `lib/api/superadmin.service.ts:249` — filtro por nome
**O que existe:** Acesso à academia por slug público (/g/[slug]). Busca de academias no SuperAdmin.
**O que falta:** Não há busca de academia por nome/cidade/código para o aluno. Não há geolocation para encontrar academias próximas. A busca existente é administrativa (SuperAdmin), não pública.

---

## BLOCO 5 — HOME POR PAPEL ORIENTADA POR TAREFA

### 5.1 Dashboard Admin orientado por tarefa
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `app/(admin)/admin/page.tsx` — dashboard completo
- `lib/api/admin-dashboard.service.ts` — DashboardData com KPIs
- `lib/api/painel-dia.service.ts` — DailyBriefingDTO
- `lib/api/churn-prediction.service.ts` — AlunoRisco, ChurnMetrics
- `lib/api/pedagogico.service.ts` — PedagogicoDashboardDTO
- `lib/api/trial.service.ts` — TrialMetrics
- `components/onboarding/FirstStepsChecklist.tsx`
- `components/reports/ReportViewer.tsx`
**O que existe:** Dashboard robusto com: greeting contextual, KPIs com countUp, gráficos Recharts, DailyBriefing (ações do dia), alunos em risco (churn), métricas pedagógicas, trial metrics, relatório mensal, checklist de primeiros passos.

---

### 5.2 Dashboard Professor orientado por tarefa
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `app/(professor)/professor/page.tsx` — dashboard com AulaHoje, AlunoDestaque, GraduacaoPendente
- `lib/api/video-experience.service.ts` — getDuvidasPendentes
- `lib/api/trial.service.ts` — listTrialStudents
**O que existe:** Aulas de hoje com status (concluida/em_andamento/proxima/agendada), alunos destaque (mais_treinou/completou_serie/em_risco), graduações pendentes, dúvidas de alunos, alunos trial.

---

### 5.3 Dashboard Responsável orientado por tarefa
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `app/(parent)/parent/page.tsx` — dashboard com ChildMock, MensalidadeMock, ComunicadoMock
**O que existe:** Seleção de filhos, presenças por filho, mensalidades com status (em_dia/pendente/atrasado), comunicados, próximas aulas, ações rápidas.

---

### 5.4 Dashboard Aluno/Atleta orientado por tarefa
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `app/(main)/dashboard/page.tsx` — AlunoDashboardDTO
- `app/(main)/dashboard/conquistas/page.tsx` — conquistas
- `app/(main)/dashboard/turmas/page.tsx` — turmas
- `app/(main)/dashboard/perfil/page.tsx` — perfil
- `app/(main)/dashboard/perfil/pagamentos/page.tsx` — pagamentos
- `app/(main)/dashboard/meu-progresso/page.tsx` — progresso
**O que existe:** Dashboard com próxima aula, formatação de tempo até aula, mapeamento de faixas com cores, dia da semana (heatmap), sub-páginas: conquistas, turmas, perfil, pagamentos, progresso.

---

### 5.5 Ações rápidas em todos os perfis
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `components/shared/QuickActions.tsx` — componente genérico com role-based actions e badges
**O que existe:** Componente QuickActions com props: role, badges, onAction. Cards clicáveis contextuais por perfil.

---

## BLOCO 6 — ONBOARDING E TUTORIAL

### 6.1 Tutorial diferente por papel
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/tutorials/definitions.ts` — ROLE_TUTORIAL_MAP com 9 tutoriais
- `components/tutorial/TutorialProvider.tsx` — provider com spotlight
- `components/tutorial/TutorialFAB.tsx` — botão flutuante para tutorial
- `components/shell/HelpSection.tsx` — seção de ajuda com reset tutorial
- `components/shared/TutorialSettings.tsx` — configurações de tutorial
**O que existe:** Tutorial dedicado para cada papel: superadmin, admin, professor, aluno_adulto, aluno_teen, aluno_kids, responsavel, recepcao, franqueador. Cada um com steps, emoji, estimativa de minutos, completionItems. Sistema de spotlight overlay com progresso persistido.

---

### 6.2 Tutorial contextual (dicas por tela)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `components/tutorial/TutorialProvider.tsx` — spotlight overlay por step
- `components/support/SupportWidget.tsx:164-180` — FAQ contextual por role (responsavel)
**O que existe:** Tutorial spotlight com targetSelector por tela/elemento. SupportWidget com FAQ contextual (ex: "Como ver o progresso do meu filho?").
**O que falta:** Não há tooltips de ajuda no primeiro uso de cada feature (ContextualHelp). O tutorial é sequencial (wizard), não contextual por tela individual.

---

### 6.3 Empty states inteligentes (com CTA)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `components/shared/EmptyStates.tsx` — múltiplos EmptyStateCard com icon, title, description, actionLabel, onAction
- `components/shared/EmptyState.tsx` — componente genérico reusável
- `components/ui/EmptyState.tsx` — variantes: default, search, error, first-time
**O que existe:** Três componentes de empty state. Variantes para diferentes contextos. CTAs com ações diretas. Usado em múltiplas páginas.

---

## BLOCO 7 — OPERAÇÃO E BUSCA

### 7.1 Status visual de cadastro incompleto
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/recepcao-dashboard.service.ts:27` — tipo 'cadastro_incompleto'
- `lib/mocks/recepcao-dashboard.mock.ts:33` — "Roberto Alves - falta documento e foto"
**O que existe:** Dashboard da recepção mostra pendências incluindo cadastros incompletos com ação "Completar".
**O que falta:** Não há badges/indicadores de incompletude na listagem de alunos do admin. Indicador existe apenas na recepção.

---

### 7.2 Painel de inconsistências operacionais
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/(recepcao)/recepcao/page.tsx:79-201` — seção de pendências com contagem e lista
- `lib/api/recepcao-dashboard.service.ts:56` — PendenciaRecepcao[]
- `lib/tutorials/definitions.ts:534` — targetSelector: '#dashboard-pendencias'
**O que existe:** Recepção tem seção "Pendências" com contagem, ícone, cor (vermelho), lista ordenável com ação direta por pendência.
**O que falta:** Não há painel dedicado "Corrigir Pendências" no admin. Não há análise de qualidade de dados (DataQuality/dataHealth).

---

### 7.3 Busca global operacional (Ctrl+K)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `components/shared/CommandPalette.tsx` — busca global com globalSearch, getCommands
- `lib/api/search.service.ts` — SearchResultGroup: alunos, turmas, videos, leads, comunicados, paginas
- `components/shell/AdminShell.tsx:9,590` — integrado no admin
- `components/shell/ProfessorShell.tsx:15,611` — integrado no professor
**O que existe:** CommandPalette com busca em alunos, turmas, vídeos, leads, comunicados, páginas. Resultados categorizados por grupo. Comandos rápidos. Integrado em AdminShell e ProfessorShell.

---

### 7.4 Timeline única do aluno/atleta
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `app/(admin)/admin/pedagogico/page.tsx:115,380,522-531` — Timeline Pedagógica
- `app/(admin)/admin/alunos/[id]/page.tsx` — detalhe do aluno
- `app/(professor)/professor/alunos/[id]/page.tsx` — detalhe do aluno (professor)
**O que existe:** Timeline pedagógica no dashboard admin. Página de detalhe do aluno com histórico.
**O que falta:** Não há timeline unificada combinando matrícula + presença + graduações + pagamentos + competições em uma única visualização cronológica.

---

## BLOCO 8 — COMUNICAÇÃO

### 8.1 Comunicação segmentada (por turma, faixa etária, status)
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/types/announcement.ts:22,52` — target_audience: AnnouncementAudience
- `components/video/VideoUploader.tsx:106` — audiência para vídeos
- `lib/mocks/announcement.mock.ts:17,36` — target_audience: 'all'
**O que existe:** Comunicados têm target_audience. Vídeos têm seletor de audiência.
**O que falta:** Segmentação fina por turma, faixa etária, status de pagamento não foi encontrada. Os mocks mostram apenas target_audience: 'all'.

---

### 8.2 Comunicação orientada por vínculo (aviso kids vai pro pai)
**Status:** ❌ NÃO EXISTE
**Arquivos encontrados:** Nenhum relevante.
**O que falta:** Não existe lógica resolveRecipients que redireciona notificação de criança para o responsável. Não há notify_parent/notificar_responsavel.

---

### 8.3 Templates de mensagem com variáveis
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/mocks/whatsapp.mock.ts:17-41` — 21+ templates com variáveis {nome}, {valor}, {data}, etc.
- Categorias: cobrança (vencendo, vencida, 7d, 15d, link, confirmação), aula (lembrete amanhã, hoje, cancelada, reposição), aniversário
**O que existe:** Sistema completo de templates WhatsApp com variáveis dinâmicas. Múltiplas categorias. Templates de sistema (isSystem: true).

---

### 8.4 Lembretes automáticos de inadimplência
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/email-templates/payment-reminder.ts` — email de lembrete de pagamento (3 dias antes)
- `lib/mocks/whatsapp.mock.ts:17-21` — templates: cobranca_vencendo, vencida, atrasada_7d, atrasada_15d
- `lib/mocks/automations.mock.ts` — automações de cobrança
- `lib/reports/financial-report.ts:60-63` — overdue_list com days_overdue
**O que existe:** Email de lembrete pré-vencimento. Templates WhatsApp para escalation (vencendo → vencida → 7d → 15d). Automações configuráveis. Relatório financeiro com lista de inadimplentes.

---

### 8.5 Mensagem automática de aniversário
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/mocks/whatsapp.mock.ts:40-41` — templates: aniversario, aniversario_academia
- `lib/mocks/whatsapp.mock.ts:82-83` — automações: aniversario_aluno, aniversario_academia
- `lib/types/notification.ts:12` — tipo 'aniversario'
- `lib/mocks/feed.mock.ts:181` — birthdays no feed
- `lib/mocks/automations.mock.ts:11` — automação "Aniversário" com push + whatsapp
**O que existe:** Template de aniversário do aluno e aniversário de academia (mesversário). Automações disparando às 8h. Tipo de notificação 'aniversario'. Aniversariantes no feed.

---

### 8.6 Centro de notificações com filtro e ação direta
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `components/shell/NotificationCenter.tsx` — centro de notificações com markAsRead, filtro por priority/tab
- `components/notifications/NotificationBell.tsx` — bell com contagem de não lidas
- `components/shell/NotificationBell.tsx` — versão no shell
**O que existe:** NotificationCenter com filtro por tab/prioridade. markAsRead funcional. Contagem de não lidas. Badge no bell.

---

## BLOCO 9 — CHECK-IN E PRESENÇA

### 9.1 Check-in com regra por perfil
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/admin-dashboard.service.ts:25,66,118,135` — attendance/check_in
- `lib/api/recepcao-dashboard.service.ts:54,96` — checkinsHoje
- `lib/api/access-control.service.ts:21,138` — method: qr_code/proximity/manual
- `supabase/functions/process-checkin/index.ts` — edge function de check-in
- `app/(recepcao)/recepcao/checkin/page.tsx` — check-in pela recepção
- `app/(parent)/parent/checkin/page.tsx` — check-in pelo responsável
**O que existe:** Sistema de check-in com múltiplos métodos (QR, proximity, manual). Edge function processando check-in. Check-in pela recepção e pelo responsável.
**O que falta:** Não há regras diferenciadas por perfil (kids mediado pelo pai, teen com ou sem autonomia, visitante com validação).

---

### 9.2 Check-in por QR code
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/native/camera-scanner.ts:3-14` — scanQRCode com @capacitor/camera
- `supabase/functions/generate-qr/index.ts` — geração de QR code
- `supabase/functions/process-checkin/index.ts:28,31` — processamento com method 'qr_code'
- `lib/types/enums.ts:49` — CheckinMethod: qr_code
- `lib/types/domain.ts:64` — QrCode = 'qr_code'
**O que existe:** Fluxo completo: geração de QR (edge function), scan via câmera (Capacitor), processamento do check-in via edge function. Tipo qr_code no enum.

---

### 9.3 Check-in por geolocation
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/proximity-checkin.service.ts` — detectProximity (BLE-based), autoCheckin
- `lib/api/access-control.service.ts:21` — method 'proximity'
- `app/(admin)/admin/iot/page.tsx:229` — exibe método "Proximidade"
- `app/(admin)/admin/acesso/page.tsx:130` — exibe método "Proximidade"
**O que existe:** Check-in por proximidade BLE (Bluetooth Low Energy). Service com detectProximity e autoCheckin. Exibição no painel de IoT e acesso.
**O que falta:** Não é geolocation (GPS/haversine) mas sim BLE proximity. Não há validação de distância GPS da academia.

---

## BLOCO 10 — DOCUMENTOS E AUTORIZAÇÕES

### 10.1 Autorização digital para eventos/competições
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/api/responsavel-autorizacoes.service.ts:7-17` — Autorizacao com tipos: evento, viagem, foto, saida_sozinho, contato_emergencia
- `app/(parent)/parent/autorizacoes/page.tsx` — página de autorizações
- `lib/mocks/responsavel-autorizacoes.mock.ts` — dados mock
- `components/legal/ParentalConsent.tsx` — componente de consentimento parental
**O que existe:** Sistema de autorizações com 5 tipos. Status: pendente/autorizado/negado. Página no painel do responsável. Componente de consentimento parental.

---

### 10.2 Documentos por núcleo familiar
**Status:** ⚠️ PARCIAL
**Arquivos encontrados:**
- `lib/api/contracts.service.ts` — service de contratos
- `lib/contracts/default-student-template.ts` — template de contrato de aluno
- `lib/contracts/default-software-template.ts` — template de contrato software
- `app/(admin)/admin/contratos/page.tsx` — gestão de contratos (admin)
- `app/(main)/dashboard/contrato/page.tsx` — contrato do aluno
- `app/(superadmin)/superadmin/contratos/page.tsx` — contratos (superadmin)
**O que existe:** Sistema de contratos com templates, gestão admin, visualização pelo aluno. Contrato de aluno com cláusulas LGPD e proteção de menores.
**O que falta:** Documentos são por aluno/contrato individual, não organizados por núcleo familiar. Não há atestados médicos ou certificados gerenciáveis.

---

## BLOCO 11 — MOBILE E CAPACITOR

### 11.1 Mobile-first (botões 44px+, fluxos curtos, safe areas)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `components/shell/TeenShell.tsx:365` — env(safe-area-inset-bottom)
- `components/shell/RecepcaoShell.tsx:307` — env(safe-area-inset-bottom)
- `components/shell/KidsShell.tsx:269` — env(safe-area-inset-bottom)
- `components/shell/MainShell.tsx:359` — env(safe-area-inset-bottom)
- `components/shared/OfflineBanner.tsx:32` — env(safe-area-inset-top)
- `components/auth/PasswordInput.tsx:37` — h-12 (48px)
- `components/auth/PhoneInput.tsx:90` — h-12
- `components/auth/NameInput.tsx:78` — h-12
- `components/auth/DateInput.tsx:198` — h-12
**O que existe:** Safe areas implementadas em todos os shells mobile. Inputs com h-12 (48px, acima do mínimo 44px). Design mobile-first consistente.

---

### 11.2 Recursos nativos Capacitor (câmera, push, share, biometria)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `package.json:48-57` — @capacitor/app, browser, camera, cli, clipboard, core, haptics, keyboard, network, preferences
- `lib/native/biometric-checkin.ts:14-30` — BiometricAuth (check-in biométrico)
- `lib/native/push-notifications.ts` — PushNotifications
- `lib/native/camera-scanner.ts:10-14` — Camera (scan QR)
- `lib/native/offline-cache.ts` — Network listener
- `lib/native/index.ts` — exports consolidados
**O que existe:** 10 plugins Capacitor no package.json. Módulos nativos: push notifications, camera (QR scan), biometria, network, offline cache. Haptics e clipboard disponíveis.

---

### 11.3 Offline leve (cache agenda, fila check-ins, sync)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `lib/offline/db.ts` — IndexedDB via idb (blackbelt-offline, version 2)
- `lib/offline/checkin-queue.ts` — fila de check-ins offline com IndexedDB + SyncManager
- `lib/offline/sync.ts` — sync com source 'offline_sync'
- `lib/native/offline-cache.ts:4,10,31` — navigator.onLine, Network listener
- `components/pwa/ServiceWorkerRegistrar.tsx` — registro de service worker
- `components/shared/OfflineBanner.tsx` — indicador visual offline
**O que existe:** IndexedDB para cache offline. Fila de check-ins que enfileira quando offline e sincroniza quando volta. Service Worker com SyncManager. Detecção de status online/offline (nativo + web). Banner visual de offline.

---

## BLOCO 12 — RECEPÇÃO PREMIUM

### 12.1 Modo recepção forte
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `app/(recepcao)/recepcao/page.tsx` — dashboard recepção com pendências
- `app/(recepcao)/recepcao/acesso/page.tsx` — controle de acesso
- `app/(recepcao)/recepcao/agenda/page.tsx` — agenda do dia
- `app/(recepcao)/recepcao/atendimento/page.tsx` — atendimento
- `app/(recepcao)/recepcao/cadastro/page.tsx` — cadastro
- `app/(recepcao)/recepcao/caixa/page.tsx` — caixa
- `app/(recepcao)/recepcao/checkin/page.tsx` — check-in
- `app/(recepcao)/recepcao/cobrancas/page.tsx` — cobranças
- `app/(recepcao)/recepcao/configuracoes/page.tsx` — configurações
- `app/(recepcao)/recepcao/experimentais/page.tsx` — experimentais
- `app/(recepcao)/recepcao/mensagens/page.tsx` — mensagens
**O que existe:** 11 páginas dedicadas à recepção cobrindo: dashboard com pendências, cadastro, check-in, acesso, agenda, caixa, cobranças, atendimento, experimentais, mensagens, configurações.

---

## BLOCO 13 — MEDIÇÃO E OBSERVABILIDADE

### 13.1 Medição de usabilidade (PostHog/Sentry + eventos trackados)
**Status:** ✅ EXISTE
**Arquivos encontrados:**
- `sentry.client.config.ts` — Sentry client init
- `sentry.server.config.ts` — Sentry server init
- `lib/analytics/posthog.ts:59` — ONBOARDING_COMPLETED event
- `lib/api/beta-analytics.service.ts` — trackFeatureUsage
- `.env.example:35-43` — NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST
**O que existe:** Sentry configurado (client + server). PostHog com chaves configuráveis. Eventos trackados: ONBOARDING_COMPLETED, trackFeatureUsage. Beta analytics service.

---

## RESUMO

| Status | Contagem | Percentual |
|--------|----------|------------|
| ✅ EXISTE | 24/52 | 46% |
| ⚠️ PARCIAL | 21/52 | 40% |
| ❌ NÃO EXISTE | 7/52 | 14% |
| 🔇 N/A | 0/52 | 0% |

### Detalhamento por bloco:

| Bloco | ✅ | ⚠️ | ❌ |
|-------|-----|-----|-----|
| 1 — Identidade | 1 | 2 | 1 |
| 2 — Família | 1 | 3 | 3 |
| 3 — Permissões | 0 | 1 | 1 |
| 4 — Cadastro/Onboarding | 3 | 6 | 2 |
| 5 — Home por Papel | 5 | 0 | 0 |
| 6 — Tutorial | 2 | 1 | 0 |
| 7 — Operação/Busca | 1 | 3 | 0 |
| 8 — Comunicação | 4 | 1 | 1 |
| 9 — Check-in | 1 | 2 | 0 |
| 10 — Documentos | 1 | 1 | 0 |
| 11 — Mobile | 3 | 0 | 0 |
| 12 — Recepção | 1 | 0 | 0 |
| 13 — Observabilidade | 1 | 0 | 0 |

---

## TOP 10 GAPS MAIS CRÍTICOS (ordenados por impacto no usuário final)

1. **2.5 — Cadastro "Criar Família" (fluxo único)** — Sem wizard familiar, cada membro precisa ser cadastrado individualmente. Para academias com muitos alunos kids/teen, isso multiplica o trabalho da recepção e causa frustração dos pais.

2. **8.2 — Comunicação orientada por vínculo (aviso kids vai pro pai)** — Sem resolveRecipients, avisos sobre crianças não chegam automaticamente ao responsável. Em caso de emergência ou evento, a comunicação pode falhar.

3. **2.6 — Vínculo de responsável principal e secundário** — Sem distinção principal/secundário, não se sabe quem recebe cobrança, quem autoriza eventos, quem é notificado. Gera confusão operacional e financeira.

4. **2.7 — Cobrança familiar (financeiro por família)** — Sem agrupamento por família, pais com 2+ filhos recebem cobranças separadas. Impossível oferecer desconto família ou visão consolidada.

5. **1.4 — Evolução de ciclo de vida** — Kids que fazem 13 anos precisam de novo cadastro ao invés de transição automática. Perde-se histórico de estrelas, presença, conquistas. Mesmo problema para aluno→professor.

6. **3.2 — Autonomia parcial do Teen configurável** — Academias não conseguem definir o que cada teen pode ou não fazer. Todas operam com o mesmo nível de restrição, sem flexibilidade.

7. **4.9 — Duplicação inteligente para irmãos** — Ao cadastrar segundo filho, precisa redigitar endereço, responsável, dados financeiros. Desperdício de tempo e fonte de erros.

8. **9.1 — Check-in com regra por perfil** — Check-in trata todos os perfis iguais. Kids não tem check-in mediado pelo responsável, visitante não tem validação especial.

9. **1.1 — Separação conta vs pessoa vs perfil** — Sem entidade Pessoa separada, impossível representar "pessoa sem conta" (criança sem email, cônjuge que busca filho). Limita toda a arquitetura familiar.

10. **4.10 — Entrada pela store clara** — Usuário que baixa o app não sabe por onde começar. Não há "Sou academia" / "Sou aluno" / "Tenho convite". Primeira impressão confusa pode causar abandono.

---

## OBSERVAÇÕES FINAIS

### Pontos fortes do BlackBelt v2:
- **Dashboards por papel** (Bloco 5) — 100% implementado, todos os perfis têm home orientada por tarefa
- **Mobile e Capacitor** (Bloco 11) — 100% implementado, safe areas, plugins nativos, offline
- **Recepção** (Bloco 12) — 11 páginas dedicadas, operação completa
- **Tutoriais por papel** (6.1) — 9 tutoriais diferentes, cobertura total de perfis
- **Sistema de trial** (4.4) — completo com source tracking, conversion funnel, feedback

### Maiores áreas de débito:
- **Família** (Bloco 2) — maior gap. Modelo familiar incompleto afeta cadastro, financeiro, comunicação
- **Permissões** (Bloco 3) — controle por faixa etária é implícito (shells separados), não configurável
- **Cadastro** (Bloco 4) — muitos fluxos parciais, falta polimento em importação CSV e matrícula guiada
