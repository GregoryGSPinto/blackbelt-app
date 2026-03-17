# BLACKBELT v2 — MEGA PROMPT: 100 PASSOS PARA ENTERPRISE 10.0
# Executar UM por vez. Commit + push a cada 10.
# De 6.2 → 10.0. Do funcional ao impossível.

════════════════════════════════════════════════════════════════
INSTRUÇÕES PARA O CLAUDE CODE
════════════════════════════════════════════════════════════════

Leia este documento INTEIRO antes de começar.
Execute cada PROMPT numerado (P-001 a P-100) em SEQUÊNCIA.
A cada 10 prompts executados, faça:
  git add -A && git commit -m "batch: P-0X1 a P-0X0 — [descrição]" && git push

REGRAS GLOBAIS:
- Padrão isMock() + handleServiceError em TODOS os services
- ThemeContext em TODAS as páginas (--bb-depth-*, --bb-ink-*)
- ZERO cores hardcoded (#0A0A0E, bg-gray-900, etc)
- TypeScript strict — ZERO any
- pnpm build && pnpm typecheck DEVEM passar após CADA prompt
- Se um prompt quebrar o build, CORRIGIR antes de avançar
- Respeitar estrutura de pastas existente
- NÃO criar arquivos duplicados — reutilizar e expandir
- Mobile-first responsive em tudo

Comece agora com P-001.

════════════════════════════════════════════════════════════════
══  FASE 1: FUNDAÇÃO (P-001 a P-030)  ══
══  Nota: 6.2 → 7.8  ══
════════════════════════════════════════════════════════════════

────────────────────────────────────────
P-001: ADMIN DASHBOARD — REWRITE COMPLETO
────────────────────────────────────────
REESCREVER COMPLETAMENTE app/(admin)/admin/page.tsx.

Criar lib/types/admin-dashboard.ts:
- DashboardData com: greeting (nome, academy, quote motivacional, time_of_day), headlines (4 métricas: alunos ativos com trend, faturamento com trend, retenção com trend, aulas/semana com fill_rate), growth_chart (6 meses: labels, students[], revenue[], churn[]), retention (current%, previous%, at_risk count + names), today_schedule (aulas de hoje com professor, enrolled/capacity, confirmed, status), activity_feed (10+ items tipo check_in/signup/belt_promotion/payment/video_watched/quiz_completed/absence_alert/achievement), pending_promotions (aluno, faixa atual→sugerida, presenças, meses, quiz_avg, ready), financial_summary (revenue this/last month, pending, overdue_names), plan_usage (plano, 4 barras: students/profs/classes/storage com current/limit/alerts), streaming_summary (views_week, most_watched, completion_rate), quick_actions (6 botões com badge), academy_achievements (8 conquistas com progress)

Criar lib/api/admin-dashboard.service.ts e lib/mocks/admin-dashboard.mock.ts com dados completos da Guerreiros BJJ (172 alunos, R$47.890, 94.2% retenção, 24 aulas/semana).

A página tem 9 seções que fluem com scroll:
1. SAUDAÇÃO: "Boa noite, Roberto" + quote motivacional em itálico + data por extenso. Fade-in 0.5s.
2. HEADLINES: 4 cards com número GRANDE (text-3xl), ícone, variação (+7.5% verde), sparkline SVG 40x16px. Counter-up animation 0→valor em 1s. Grid 4col desktop, 2col mobile.
3. GRÁFICO CRESCIMENTO: Chart.js area chart 6 meses. Toggle Alunos/Receita. Linha anima 1.5s. Área com gradient fill. Texto "Tendência: +34% em 6 meses".
4. HOJE NA ACADEMIA: 2 colunas. Esquerda = schedule com aulas (● verde pulsando = em andamento, ○ = próxima), enrolled/capacity, progress bar por aula. Direita = activity feed com ícone colorido por tipo + timestamp relativo. Scroll interno max-height 400px.
5. ATENÇÃO NECESSÁRIA: Cards de alerta. Vermelho = inadimplentes (3 nomes + valores + dias atraso + botão "Enviar Lembrete"). Amarelo = risco evasão (8 alunos, últimas presenças + botão "Enviar Mensagem"). Roxo = graduações prontas (2 alunos com critérios + botão "Aprovar"). Se tudo ok: card verde "Tudo em dia!".
6. AÇÕES RÁPIDAS: grid 6 botões 100x100 com ícone grande + label + badge. Hover scale(1.05). Links: Novo Aluno, Gerar Link, Comunicado, Financeiro(badge:3), Meu Plano(badge:2), Conteúdo.
7. CONTEÚDO & RETENÇÃO: 2 colunas. Esquerda = streaming stats (347 views, 72% conclusão, mais assistido). Direita = SVG donut animado 0→94.2% em 1.5s com número grande no centro.
8. CONQUISTAS: scroll horizontal de badges. Desbloqueado = colorido + check. Em progresso = cinza + %. Bloqueado = cinza + 🔒. Progress ring SVG ao redor. 8 conquistas mock.
9. USO DO PLANO: mini card com 4 barras finas. Cores por threshold (verde/amarelo/vermelho). Link "Ver detalhes" e "Fazer Upgrade".

ANIMAÇÕES OBRIGATÓRIAS: fade-in saudação, counter-up headlines, sparklines draw, chart animate, donut fill, cards stagger slide-in, achievements bounce, bars grow. Usar CSS @keyframes + requestAnimationFrame + IntersectionObserver.

────────────────────────────────────────
P-002: SUPER ADMIN — LAYOUT + DASHBOARD
────────────────────────────────────────
Criar estrutura Super Admin completa:

1. app/(superadmin)/layout.tsx com SuperAdminShell — sidebar com accent DOURADO (amber). Items: Dashboard, Academias, Onboarding, Planos, Métricas, Configurações.
2. lib/types/superadmin.ts — Plan, AcademyFull, OnboardToken, PlatformStats, CreateAcademyPayload.
3. lib/api/superadmin.service.ts — listAcademies, getAcademy, createAcademy, updateAcademy, suspendAcademy, createOnboardToken, listOnboardTokens, validateOnboardToken, listPlans, getPlatformStats.
4. lib/mocks/superadmin.mock.ts — 3 planos (Starter R$97, Essencial R$197, Pro R$347, Black Belt R$597, Enterprise consulta), 3 academias (Guerreiros Pro ativa, Samurai Starter trial, Dragon Enterprise ativa), 3 onboard tokens, superadmin user super@blackbelt.app, stats (3 academias, 237 alunos, R$899 MRR).
5. app/(superadmin)/superadmin/page.tsx — Dashboard com 4 stat cards (academias, alunos totais, MRR, novos este mês), lista rápida de academias com status, ações rápidas.
6. Atualizar middleware: /superadmin/* só permite role 'superadmin'. Adicionar login mock super@blackbelt.app / BlackBelt@2026 → role superadmin → redirect /superadmin.

────────────────────────────────────────
P-003: SUPER ADMIN — CRUD ACADEMIAS
────────────────────────────────────────
Criar app/(superadmin)/superadmin/academias/page.tsx:
- Header "Academias" + botão "+ Nova Academia" + busca + filtros (Todas/Ativas/Trial/Suspensas)
- Tabela/cards: nome, plano, status, alunos(current/limit com progress bar), profs, MRR, ações (ver/editar/suspender)
- Modal "Nova Academia": nome, email dono, telefone, cidade/estado, plano(select), trial(7/15/30 dias), notas. Ao criar: gera onboard token + mostra link copiável + botão WhatsApp(wa.me template) + botão Email(mailto template).

Criar app/(superadmin)/superadmin/academias/[id]/page.tsx:
- Header com nome + status badge + plano. Ações: Editar, Suspender, Reativar, Deletar.
- 4 stat cards: alunos/limit, profs/limit, turmas, MRR.
- Seções: Info geral, Plano & limites, Admin/dono, Histórico.

────────────────────────────────────────
P-004: SUPER ADMIN — ONBOARDING + PLANOS
────────────────────────────────────────
Criar app/(superadmin)/superadmin/onboarding/page.tsx:
- Lista de onboard tokens: academy_name, plano, status(ativo/expirado/usado), usos, data criação, ações(copiar link/desativar).
- Botão "+ Novo Link" → mesmo fluxo do modal de Nova Academia.

Criar app/(superadmin)/superadmin/planos/page.tsx:
- Tabela dos 5 planos: nome, preço mensal/anual, limites (alunos/profs/turmas/storage), módulos (✅/❌), excedentes. Botão editar (modal com campos editáveis). Botão criar novo plano. Botão desativar.

────────────────────────────────────────
P-005: ONBOARDING PÚBLICO — /onboarding
────────────────────────────────────────
Criar app/onboarding/page.tsx (layout minimalista, SEM auth):
- Multi-step wizard:
  Step 1: Valida token da URL (?token=xxx). Se inválido: erro amigável + contato. Se válido: mostra nome academia + plano + trial.
  Step 2: Dados do dono (nome, email, telefone, senha, confirmar senha). Validações: email formato + único, senha min 8 chars + 1 maiúscula + 1 número.
  Step 3: Dados da academia (nome pré-preenchido editável, CNPJ opcional, telefone, endereço, cidade/estado, logo upload placeholder).
  Step 4: Confirmação. "✅ Academia configurada!" + resumo + próximos passos (cadastrar profs, criar turmas, gerar links) + botão "Acessar Painel Admin".
- Ao finalizar: mock cria academy + profile(admin) + registra uso do token. Redirect para /admin.
- Atualizar middleware: /onboarding é PÚBLICO.

────────────────────────────────────────
P-006: SISTEMA DE CONVITES — ADMIN
────────────────────────────────────────
Criar lib/types/invite.ts — InviteToken, InviteUse, CreateInvitePayload, InviteValidation.
Criar lib/api/invite.service.ts — generateToken, createInvite, listInvites, validateToken, useToken, getInviteUses, getInviteStats.
Criar lib/mocks/invite.mock.ts — 5 tokens (Link Geral aluno_adulto ilimitado, Turma Kids max 20 8 usados, Professores max 5 2 usados, Responsáveis ilimitado, Link Expirado teen inativo).

Criar app/(admin)/admin/convites/page.tsx:
- Stats topo: Total, Ativos, Usos este mês, Cadastros via link.
- Filtros: Todos/Ativos/Expirados/Por Role.
- Cards de convite: label, role, usos(current/max com progress bar), data criação, link copiável. Botões: Copiar(clipboard+toast), QR Code(canvas), Editar(modal), Desativar(confirm).
- Modal "Novo Link": role(select obrigatório), label, descrição, limite usos(toggle ilimitado/limitado), expiração(toggle sem/com date picker), turma vinculada(select), modalidade(select). Preview do que o usuário verá. Botões: Cancelar, Gerar Link. Ao gerar: mostra link grande + Copiar + WhatsApp + Email.
- Adicionar "🔗 Convites" no AdminShell sidebar.

────────────────────────────────────────
P-007: CADASTRO PÚBLICO — /cadastro
────────────────────────────────────────
Criar app/cadastro/page.tsx (layout minimalista, SEM auth):
- Pega ?token=xxx da URL. Chama validateToken.
- Se inválido: tela de erro amigável (link expirado/max usos/inativo/não encontrado) + "Entre em contato com sua academia" + botão "Ir para Login".
- Se válido: formulário de cadastro. Topo: logo academia + "Bem-vindo! Cadastro como [Role] na [Academia]". Campos locked(não editáveis): academia, role. Campos: nome completo, email, telefone, data nascimento, senha, confirmar senha. SE role=aluno_kids: + nome responsável + telefone responsável. SE role=responsavel: + nome filho + data nasc filho. SE turma pré-selecionada: turma locked. Checkbox aceitar termos. Botão "Criar Minha Conta". Link "Já tem conta? Fazer login".
- Validações: email formato + não duplicado, senha min 8 + maiúscula + número, nome min 3, telefone 11 dígitos, idade coerente com role.
- Ao submeter: mock cria profile com academy_id + role do token. Registra uso do token. Redirect login + toast "Conta criada!".
- Atualizar middleware: /cadastro é PÚBLICO.

────────────────────────────────────────
P-008: BILLING — PLANO & USO DO ADMIN
────────────────────────────────────────
Criar lib/types/billing.ts — PlanDefinition(5 planos com limites, excedentes por plano, módulos), UsageMetric, BillingSummary, Invoice, UsageAlert.
Criar lib/api/billing.service.ts — getPlans, getCurrentPlan, getBillingSummary, getUsageMetrics, getInvoices, getAlerts, requestUpgrade, requestDowngrade, getOverageProjection.
Criar lib/mocks/billing.mock.ts — Guerreiros Pro: alunos 172/200(86%), profs 12/15(80%), turmas 22/30(73%), storage 31.2/50GB(62%). Excedente fev: 8 alunos × R$1,90 = R$15,20. 3 faturas mock. 2 alertas warning.

Criar app/(admin)/admin/plano/page.tsx:
- Card plano atual (Pro ⭐, R$347/mês, módulos ✅/❌, botão Mudar para Anual 20%off, botão Upgrade).
- 4 barras de uso com cores por threshold: 0-79% verde, 80-89% amarelo+⚠️, 90-99% laranja+🔶, 100%+ vermelho+🔴 mostrando excedente em R$. Cada barra: ícone + label + current/limit + progress bar + status + preço excedente.
- Projeção de excedente do mês: tabela plano base + excedentes + total estimado + dica de upgrade.
- Comparação de planos: 5 colunas lado a lado. Plano atual com badge "Seu plano". Cada plano: preço, limites, módulos, excedentes. Botão Upgrade/Downgrade. Cálculo de economia se tem excedente.
- Histórico de faturas: tabela período/plano/base/excedente/total/status/PDF. Click expande detalhes do excedente.
- Alertas no topo: cards warning/critical com botão Upgrade e Dispensar.
- Adicionar "💰 Meu Plano" no AdminShell sidebar com badge de alertas.
- Integrar card resumo no dashboard admin (P-001 já prevê isso).

────────────────────────────────────────
P-009: PROFESSOR CONTENT MANAGEMENT
────────────────────────────────────────
Criar lib/types/content-management.ts — VideoSource, VideoInput, VideoFormData, SeriesFormData, TrailFormData, AcademicMaterial, ContentStats, QuizQuestionInput. 12 gradientes pré-definidos.
Criar lib/api/content-management.service.ts — extractVideoInfo(url parse YouTube/Vimeo/GDrive), createVideo, updateVideo, deleteVideo, listVideos(filtros), publishVideo, unpublishVideo, createSeries, updateSeries, deleteSeries, listSeries, createTrail, updateTrail, deleteTrail, setQuizForVideo, getQuizForVideo, createMaterial, updateMaterial, deleteMaterial, listMaterials, getContentStats, getVideoAnalytics.
Criar lib/mocks/content-management.mock.ts — usa os 15 vídeos existentes + 5 materiais acadêmicos + stats.

Criar app/(professor)/professor/conteudo/page.tsx com 5 TABS:
TAB VÍDEOS: stats mini (total/publicados/rascunhos/views), busca+filtros(publicado/rascunho/modalidade/faixa), cards de vídeo(thumbnail+título+série+faixa+views+quiz status, botões editar/quiz/preview/publicar/duplicar/excluir). Modal NOVO VÍDEO multi-step: Step1 colar link(YouTube/Vimeo/GDrive) → extrair info, Step2 dados(título editável, descrição, modalidade, faixa, tags, série, ordem, publicar toggle), Step3 quiz(1-5 perguntas, 3 opções cada, correta, dica timestamp), Step4 confirmação.
TAB PLAYLISTS: cards de série(título, vídeos count, duração, faixa, gradiente preview, lista episódios). Modal NOVA PLAYLIST: título, descrição, modalidade, faixa, categoria, gradiente(12 presets ou custom 2 cores), tags, publicar. Excluir série: move vídeos pra "sem série".
TAB TRILHAS: cards de trilha(nome, séries, vídeos total, certificado toggle). Modal NOVA TRILHA: nome, descrição, faixa, multi-select séries com drag order, certificado toggle.
TAB MATERIAL: cards(título, tipo, tamanho, série vinculada, downloads, status). Modal NOVO MATERIAL: título, descrição, tipo(PDF/doc/imagem/link/plano aula), arquivo upload ou link, modalidade, faixa, tags, vincular série, publicar.
TAB ANALYTICS: 4 stats (views/conclusões/quiz avg/tempo médio), top vídeos, vídeos com problema(quiz score baixo), atividade recente.

────────────────────────────────────────
P-010: AUTH REAL + SEED SUPABASE
────────────────────────────────────────
Substituir mock auth por Supabase Auth REAL mantendo mock como fallback:

1. Atualizar lib/api/auth.service.ts: se isMock() usa mock atual. Se real: Supabase signUp(email,password), signIn(email,password), signOut(), getSession(), refreshSession(). Cookie bb-token = JWT real do Supabase.
2. Atualizar middleware.ts: decodificar JWT real (Supabase) quando não mock. Extrair role de profile table (join via user_id).
3. Criar supabase/migrations/001_seed_users.sql: INSERT todos os usuários de teste no Supabase Auth + profiles. Senhas: BlackBelt@2026. Todos os 9 logins de teste + superadmin.
4. Criar supabase/migrations/002_seed_academy.sql: Academy Guerreiros BJJ com todos os dados.
5. Criar supabase/migrations/003_seed_classes.sql: 5 turmas com horários.
6. AuthContext: manter compatível com ambos modos. useAuth() retorna { user, role, academyId, loading, signIn, signOut }.

COMMIT BATCH 1: git add -A && git commit -m "batch: P-001 a P-010 — foundation: admin dashboard, super admin, billing, invites, content mgmt, auth" && git push

────────────────────────────────────────
P-011: MÓDULO FINANCEIRO COMPLETO
────────────────────────────────────────
Expandir lib/types/financial.ts: Mensalidade(id, student_id, academy_id, amount, due_date, status:pago/pendente/atrasado/isento, paid_at, payment_method, reference_month), FinancialSummary, FinancialChart.
Expandir lib/api/financial.service.ts: listMensalidades(academyId, filters), createMensalidade, updateStatus, markAsPaid, getFinancialSummary, getRevenueChart, getOverdueList, generateMonthlyBills.
Expandir lib/mocks/financial.mock.ts: 172 alunos × 3 meses de mensalidades. 3 inadimplentes. Revenue chart 6 meses.

Reescrever app/(admin)/admin/financeiro/page.tsx:
- Stats: receita mês, pendente, atrasado, pago.
- Gráfico receita 6 meses (Chart.js bar chart).
- Lista de mensalidades com filtros(mês, status, busca). Cada item: aluno + valor + vencimento + status badge. Ações: marcar pago, enviar lembrete.
- Aba Inadimplentes: lista com dias atraso + botão enviar cobrança.
- Aba Relatório: resumo mensal exportável.

────────────────────────────────────────
P-012: CHECK-IN / PRESENÇA REAL
────────────────────────────────────────
Criar lib/types/attendance.ts: Attendance(id, student_id, class_id, date, status:present/absent/justified, checked_in_at, method:manual/qrcode), AttendanceSummary, AttendanceHeatmap.
Criar lib/api/attendance.service.ts: checkIn, markAbsent, listAttendance(classId,date), getStudentAttendance(studentId,period), getAttendanceSummary(academyId), getHeatmap(studentId), getAbsentAlerts(academyId,days).
Criar lib/mocks/attendance.mock.ts: presença dos últimos 3 meses pra todos os alunos.

Criar app/(professor)/professor/presenca/page.tsx:
- Selecionar turma + data. Lista de alunos com toggle presente/ausente/justificado. Botão "Salvar Presença".
- QR Code por turma (gerar QR que aluno escaneia → auto check-in). Canvas QR inline.
- Histórico de presença por turma com calendário.

Criar componente HeatmapCalendar (tipo GitHub contributions): grid de quadrados coloridos representando frequência do aluno nos últimos 6 meses. Verde = presente, cinza = sem aula, vermelho = faltou.

────────────────────────────────────────
P-013: GRADUAÇÃO / FAIXAS
────────────────────────────────────────
Criar lib/types/graduation.ts: BeltPromotion(id, student_id, from_belt, to_belt, proposed_by, approved_by, status:pending/approved/rejected, criteria_met, proposed_at, approved_at), BeltCriteria(belt, min_attendance, min_months, min_quiz_avg), GraduationHistory.
Criar lib/api/graduation.service.ts: proposeProm, approveProm, rejectProm, listPending(academyId), getStudentHistory(studentId), checkCriteria(studentId,targetBelt), getCriteria(belt).
Criar lib/mocks/graduation.mock.ts: critérios por faixa (branca→azul: 120 presenças + 6 meses + quiz 70%, etc). Rafael e Luciana como pending.

Criar app/(admin)/admin/graduacoes/page.tsx:
- Lista de graduações pendentes com todos os critérios visuais (✅ atende / ❌ não atende). Botão Aprovar/Rejeitar.
- Histórico de graduações da academia (timeline).
- Certificado de graduação: componente que gera visual bonito com nome, faixa, data, professor, academia. Botão "Gerar PDF".

Adicionar "🥋 Graduações" no AdminShell sidebar.

────────────────────────────────────────
P-014: PERFIL DO ALUNO COMPLETO
────────────────────────────────────────
Reescrever a página de perfil do aluno com TODOS os dados:

app/(admin)/admin/alunos/[id]/page.tsx (admin vê qualquer aluno):
- Header: avatar(iniciais) + nome + faixa badge + email + telefone + desde quando treina.
- Seção Faixa: faixa atual + barra de progresso pra próxima + critérios (presenças X/120, meses X/6, quiz X/70%).
- Seção Frequência: HeatmapCalendar (6 meses) + stats (total presenças, média/semana, streak atual).
- Seção Streaming: vídeos assistidos + séries completas + quiz scores + horas assistidas.
- Seção Financeiro: últimas 3 mensalidades com status. Alerta se inadimplente.
- Seção Avaliações: notas do professor + evolução.
- Seção Histórico: timeline de eventos (graduações, marcos, avaliações).

Também acessível como app/(main)/dashboard/meu-progresso/page.tsx (o aluno vê seu próprio perfil).

────────────────────────────────────────
P-015: NOTIFICAÇÕES IN-APP
────────────────────────────────────────
Criar lib/types/notification.ts: Notification(id, user_id, type:alert/info/success/warning/billing, title, message, action_url, is_read, created_at), NotificationPreferences.
Criar lib/api/notification.service.ts: list(userId, unreadOnly?), markAsRead(id), markAllRead, dismiss(id), getUnreadCount, createNotification.
Criar lib/mocks/notification.mock.ts: 10 notificações por perfil.

Criar components/notifications/NotificationBell.tsx:
- Ícone de sino no header com badge vermelho (unread count).
- Click: dropdown com lista de notificações. Cada uma: ícone por tipo + título + mensagem truncada + timestamp + botão dismiss.
- "Marcar todas como lidas". "Ver todas →" link.
- Adicionar NotificationBell em TODOS os shells (Admin, Professor, Main, Teen, Kids, Parent).

Criar app/(admin)/admin/notificacoes/page.tsx: lista completa com filtros por tipo.

────────────────────────────────────────
P-016: EMPTY STATES PREMIUM
────────────────────────────────────────
Criar components/ui/EmptyState.tsx:
- Props: icon(emoji ou SVG), title, description, actionLabel, actionHref.
- Design: ícone grande (48px), título bold, descrição muted, botão CTA.
- Variantes: default, search(nada encontrado), error, first-time.

Aplicar EmptyState em TODAS as páginas que podem ficar vazias:
- Listas de alunos, turmas, vídeos, comunicados, convites, faturas, notificações, materiais, séries, trilhas, graduações.
- Cada empty state com mensagem contextual e CTA relevante.
- Ex turmas vazia: "Nenhuma turma criada ainda. [+ Criar Primeira Turma]"
- Ex vídeos: "Sua biblioteca está vazia. [+ Adicionar Primeiro Vídeo]"

Grep por "length === 0" e "!data" em todo app/ e garantir que NENHUMA tela fica em branco.

────────────────────────────────────────
P-017: LOADING + ERROR STATES
────────────────────────────────────────
Criar components/ui/PageSkeleton.tsx — skeleton genérico que imita layout real. Props: variant(dashboard/list/detail/form). Shimmer animation CSS.

Criar components/ui/ErrorBoundary.tsx — error boundary por seção (não por página). Mostra "Algo deu errado" + botão Tentar Novamente + log erro no console. NÃO mostra stack trace.

Criar components/ui/ErrorState.tsx — componente visual de erro. Props: title, description, onRetry.

Aplicar em TODAS as páginas:
- Skeleton enquanto loading=true
- ErrorBoundary envolvendo cada seção principal
- try/catch em todos os useEffect de dados

────────────────────────────────────────
P-018: TURMAS — CRUD COMPLETO
────────────────────────────────────────
Expandir módulo de turmas pra CRUD real:

lib/types/class.ts: Class(id, academy_id, name, modality, professor_id, schedule:DaySchedule[], capacity, enrolled_count, status, room, min_belt, max_belt, description), DaySchedule(day_of_week, start_time, end_time).
lib/api/class.service.ts: createClass, updateClass, deleteClass, listClasses, getClass, getClassStudents, addStudent, removeStudent, getSchedule.
lib/mocks/class.mock.ts: 5 turmas da Guerreiros com horários, alunos vinculados.

Reescrever app/(admin)/admin/turmas/page.tsx:
- Grid de cards por turma: nome, modalidade(badge cor), professor, horário visual(Mo/We/Fr 19:00), enrolled/capacity(progress bar), status.
- Modal Nova Turma: nome, modalidade(select), professor(select), dias/horários(multi-day picker com time), capacidade, sala, faixa min/max, descrição.
- Click na turma: página de detalhe com lista de alunos, presença, ações.

────────────────────────────────────────
P-019: COMUNICADOS — SISTEMA COMPLETO
────────────────────────────────────────
Expandir o comunicados existente:

lib/types/announcement.ts: Announcement(id, academy_id, title, content, author_id, status:draft/published/scheduled, target_audience:all/professors/students/parents/specific_class, scheduled_at, published_at, attachments, read_count, total_recipients), AnnouncementStats.
lib/api/announcement.service.ts: CRUD completo + publish + schedule + getStats + markAsRead.

Reescrever app/(admin)/admin/comunicados/page.tsx:
- Lista com filtros(status, público-alvo). Cards: título, preview do conteúdo, público, data, read_count/total.
- Editor rico: título + textarea com formatação básica (bold, italic, lists) + selecionar público-alvo(todos/profs/alunos/responsáveis/turma específica) + agendar ou publicar agora + anexar arquivo.
- Stats por comunicado: quantos leram, % de leitura.

Comunicados aparecem para os destinatários no dashboard e nas notificações.

────────────────────────────────────────
P-020: GESTÃO DE ALUNOS — ADMIN
────────────────────────────────────────
Reescrever app/(admin)/admin/alunos/page.tsx:
- Stats: total ativos, novos este mês, inativos, por faixa(mini donut chart).
- Filtros: busca por nome/email, faixa, modalidade, turma, status(ativo/inativo/pendente).
- Tabela/cards: avatar(iniciais+cor da faixa), nome, email, faixa badge, turmas, frequência%(último mês), mensalidade(status badge), ações(ver perfil/editar/desativar).
- Botão "+ Novo Aluno" → redireciona pra convites OU formulário manual.
- Exportar lista CSV.
- Bulk actions: selecionar vários → enviar comunicado / mudar turma.

COMMIT BATCH 2: git add -A && git commit -m "batch: P-011 a P-020 — modules: financial, attendance, graduation, notifications, classes, announcements, students" && git push

────────────────────────────────────────
P-021: PROFESSOR DASHBOARD SURREAL
────────────────────────────────────────
Reescrever app/(professor)/professor/page.tsx:
- Saudação: "Bom dia, André. Hoje você tem 3 aulas."
- Stats: alunos ativos nas minhas turmas, aulas hoje, avaliações pendentes, vídeos publicados.
- Minhas Aulas Hoje: timeline visual com horário, turma, enrolled/capacity, botão "Abrir Presença".
- Alunos em Destaque: quem mais treinou esta semana, quem completou série, quem tá em risco.
- Graduações Pendentes: alunos que atingiram critérios (link pra propor).
- Conteúdo: últimos vídeos publicados + views. Link "Gerenciar Conteúdo".
- Quick Actions: Abrir Presença, Nova Avaliação, Novo Vídeo, Ver Turmas.

────────────────────────────────────────
P-022: RESPONSÁVEL DASHBOARD COMPLETO
────────────────────────────────────────
Reescrever app/(parent)/parent/page.tsx:
- Saudação: "Olá, Patrícia!"
- Card por filho: Sophia(teen) + Helena(kids). Cada card: nome, faixa, turma, última presença, frequência do mês(mini bar), vídeos assistidos(count), próxima aula.
- Financeiro: mensalidades pendentes com botão pagar. Histórico.
- Comunicados: últimos da academia.
- Evolução: gráfico de presença dos filhos nos últimos 3 meses.
- Quick Actions: Ver Presença, Pagar Mensalidade, Falar com Professor.

────────────────────────────────────────
P-023: ALUNO ADULTO DASHBOARD REFINADO
────────────────────────────────────────
Refinar app/(main)/dashboard/page.tsx:
- Saudação + faixa atual visual (badge grande com cor).
- Stats: presenças este mês, streak dias seguidos, vídeos assistidos, quiz score médio.
- Próximas Aulas: 3 próximas com horário, turma, professor.
- Continuar Assistindo: card do último vídeo com progress bar.
- Minha Evolução: progress bar pra próxima faixa (presenças X/120, meses X/6, quiz X/70%).
- HeatmapCalendar (mini, últimos 3 meses).
- Conquistas do aluno: badges desbloqueados.
- Mensalidade: status do mês atual.

────────────────────────────────────────
P-024: TEEN DASHBOARD GAMIFICADO REFINADO
────────────────────────────────────────
Refinar app/(teen)/teen/page.tsx:
- Saudação com level + XP total + progress bar pro próximo level.
- Stats: XP semana, streak, posição ranking, vídeos assistidos.
- Desafios Semanais: 3 desafios com progress bars (ex: "Treine 3x esta semana" 2/3).
- Ranking da Turma: top 5 com avatar, nome, XP, posição.
- Continuar Assistindo: com XP reward badge.
- Conquistas: badges desbloqueáveis estilo gaming.
- Próxima Aula: card com countdown.

────────────────────────────────────────
P-025: KIDS DASHBOARD LÚDICO REFINADO
────────────────────────────────────────
Refinar app/(kids)/kids/page.tsx:
- Stars counter GIGANTE animado no topo.
- Mascote/emoji animado (bounce/float).
- "Suas Aventuras": próxima aula como "missão" com ícone divertido.
- Vídeos como "episódios" com estrelas reward.
- Progresso visual com "montanha" ou "caminho" (SVG) — cada etapa = serie completada.
- ZERO números negativos. TUDO positivo e encorajador.
- Fonte Nunito (rounded, kid-friendly).
- Animações em tudo (float, bounce, scale).

────────────────────────────────────────
P-026: BUSCA GLOBAL (CMD+K)
────────────────────────────────────────
Criar components/search/GlobalSearch.tsx:
- Cmd+K (Mac) / Ctrl+K (Windows) abre modal de busca.
- Input com ícone lupa + "Buscar alunos, turmas, vídeos...".
- Resultados agrupados por tipo: Alunos, Turmas, Vídeos, Comunicados, Páginas.
- Cada resultado: ícone + título + subtítulo + link. Click navega.
- Resultados recentes (últimos 5).
- Keyboard navigation (↑↓ Enter Esc).
- Disponível em TODOS os perfis (resultados filtrados por role).

Criar lib/api/search.service.ts: globalSearch(query, role, academyId).
Mock: busca por nome em alunos, turmas, vídeos.

Integrar em TODOS os shells (header, ao lado do NotificationBell).

────────────────────────────────────────
P-027: CALENDAR VIEW
────────────────────────────────────────
Criar components/calendar/CalendarView.tsx:
- Visualização semanal e mensal.
- Eventos = aulas + competições + feriados.
- Cores por modalidade (BJJ vermelho, Judô verde, etc).
- Click no evento: popup com detalhes.
- Responsivo: mobile mostra lista, desktop mostra grid.

Criar app/(admin)/admin/calendario/page.tsx: admin vê todas as aulas.
Criar app/(professor)/professor/calendario/page.tsx: professor vê suas aulas.
Adicionar "📅 Calendário" nos sidebars admin e professor.

────────────────────────────────────────
P-028: RETENÇÃO / CHURN ANALYTICS
────────────────────────────────────────
Criar app/(admin)/admin/retencao/page.tsx:
- Donut grande: retenção atual (94.2%) vs meta (95%).
- Gráfico de retenção últimos 12 meses (line chart).
- Lista de alunos em risco: nome, dias sem treinar, faixa, turma, tendência. Ordenado por urgência.
- Filtros: período, turma, modalidade.
- Ações por aluno: enviar mensagem, agendar conversa, marcar como contactado.
- Métricas: churn rate, tempo médio antes de cancelar, turma com mais evasão, motivos (mock).

Adicionar "🔄 Retenção" no AdminShell sidebar.

────────────────────────────────────────
P-029: SETTINGS / CONFIGURAÇÕES DA ACADEMIA
────────────────────────────────────────
Reescrever app/(admin)/admin/configuracoes/page.tsx:
- Dados da Academia: nome, CNPJ, endereço, telefone, email, logo(upload), cores da marca.
- Configurações de Turma: horário padrão, capacidade padrão, modalidades disponíveis.
- Configurações de Graduação: critérios por faixa(presenças, meses, quiz avg) — editáveis.
- Notificações: quais alertas enviar (ausência, mensalidade, graduação).
- Integrações: status das integrações (pagamento, WhatsApp, etc) — futuro, mostrar como "Em breve".
- Plano: link rápido pro /admin/plano.
- Exportar Dados: botão para exportar todos os dados (LGPD).

────────────────────────────────────────
P-030: RESPONSIVO + POLISH GERAL
────────────────────────────────────────
Audit de responsividade em TODAS as páginas:
1. Testar cada página em 3 breakpoints: 375px(mobile), 768px(tablet), 1280px(desktop).
2. Corrigir overflow horizontal em QUALQUER página.
3. Sidebar: collapsa em mobile, drawer com overlay.
4. Tabelas: scroll horizontal em mobile OU converter pra cards.
5. Modais: full-screen em mobile, centered em desktop.
6. Forms: inputs full-width em mobile.
7. Grids: 1col mobile, 2col tablet, 4col desktop.
8. Fonts: text-sm em mobile pra labels, text-base pra conteúdo.
9. Touch targets: mínimo 44x44px em mobile.
10. Safe areas: padding-bottom pra bottom nav em mobile.

COMMIT BATCH 3: git add -A && git commit -m "batch: P-021 a P-030 — dashboards surreal, search, calendar, retention, responsive polish" && git push

════════════════════════════════════════════════════════════════
══  FASE 2: VENDER (P-031 a P-060)  ══
══  Nota: 7.8 → 8.5  ══
════════════════════════════════════════════════════════════════

────────────────────────────────────────
P-031: LANDING PAGE MATADORA
────────────────────────────────────────
Criar app/(public)/page.tsx (reescrever landing):
- Hero: headline "O software que toda academia de artes marciais precisa" + sub "Gestão completa. Do tatame ao financeiro." + screenshot do dashboard + CTA "Começar Trial Grátis" + "Ver Planos".
- Seção Features: 6 cards (Turmas, Presença, Streaming, Financeiro, Graduação, Multi-perfil) com ícone + título + descrição curta.
- Seção Por Perfil: tabs (Admin/Professor/Aluno/Teen/Kids/Responsável) cada um mostrando screenshot + 3 bullets do que faz.
- Seção Social Proof: "Usado por X academias" + logos mock + depoimentos (3 cards com foto, nome, academia, quote).
- Seção Planos: pricing table dos 5 planos com CTA.
- Seção FAQ: 8 perguntas frequentes com accordion.
- Footer: logo + links + redes sociais + "Feito com 🥋 por BlackBelt".
- SEO: meta tags, Open Graph, Twitter Cards.
- Responsiva. Linda. Vende.

────────────────────────────────────────
P-032: PÁGINA DE PREÇOS PÚBLICA
────────────────────────────────────────
Criar app/(public)/precos/page.tsx:
- Toggle Mensal/Anual (mostra economia).
- 5 cards lado a lado: Starter, Essencial, Pro(destaque), Black Belt, Enterprise.
- Feature matrix completa: limites + módulos + suporte + excedentes.
- CTA por plano: "Começar Trial" / "Falar com Vendas" (enterprise).
- FAQ de billing (8 perguntas): trial, cancelamento, upgrade, excedente, NF, etc.
- Banner "7 dias grátis com acesso Black Belt completo".

────────────────────────────────────────
P-033: ONBOARDING WIZARD (PRIMEIRA VEZ)
────────────────────────────────────────
Criar components/onboarding/OnboardingWizard.tsx:
Quando admin loga pela PRIMEIRA VEZ (flag first_login):
Step 1: "Bem-vindo ao BlackBelt! 🥋" + breve intro.
Step 2: "Configure sua academia" — nome, logo, endereço.
Step 3: "Crie sua primeira turma" — form simplificado.
Step 4: "Convide um professor" — gerar link.
Step 5: "Gere links para alunos" — gerar link de convite.
Step 6: "Tudo pronto! 🎉" — resumo + "Acessar Dashboard".
- Progress bar no topo (1 de 6).
- Skip button em cada step (menos step 1).
- Dados salvos a cada step.
- Marca first_login=false ao completar.

────────────────────────────────────────
P-034: EMAIL TRANSACIONAL (RESEND)
────────────────────────────────────────
Criar lib/email/templates/: welcome.tsx, payment-reminder.tsx, payment-overdue.tsx, belt-promotion.tsx, weekly-summary.tsx, plan-alert.tsx. Cada template: HTML bonito com logo, cores da marca, responsive.
Criar lib/email/send.ts: sendEmail(to, template, data). Usa Resend API (ou mock em dev).
Integrar em: cadastro(welcome), mensalidade(reminder D-3, overdue D+3), graduação(promotion), semanal(summary), plano(alert 80%/90%/100%).
Em mock: log no console "[EMAIL] Para: X, Template: Y".

────────────────────────────────────────
P-035: RELATÓRIOS PDF
────────────────────────────────────────
Criar lib/reports/: monthly-report.ts, attendance-report.ts, financial-report.ts, student-report.ts, graduation-certificate.ts.
Usar @react-pdf/renderer ou jsPDF.
Cada relatório: header com logo academia + título + período, corpo com dados tabulares e gráficos simples, footer com data geração + página.
Botão "📄 Exportar PDF" em: dashboard admin(relatório mensal), presença(lista), financeiro(resumo), aluno(boletim), graduação(certificado).

────────────────────────────────────────
P-036: LOJA INTEGRADA — PRODUTOS
────────────────────────────────────────
Expandir módulo loja existente:
Reescrever app/(main)/loja/page.tsx + app/(admin)/admin/loja/page.tsx:
- Admin: CRUD de produtos (kimonos, faixas, rashguards, protetor bucal, etc). Cada produto: nome, descrição, preço, fotos(placeholder), estoque, categoria, tamanhos. Ativar/desativar.
- Aluno: catálogo visual com cards bonitos. Filtros por categoria. Detalhe do produto. Botão "Comprar" (mock — reserva + notifica admin).
- Carrinho simples (state). Checkout mock (gera pedido pendente).

────────────────────────────────────────
P-037: EVENTOS & COMPETIÇÕES
────────────────────────────────────────
Criar lib/types/event.ts: Event(id, academy_id, title, description, date, location, type:competition/seminar/graduation_ceremony/open_mat, max_participants, enrolled, modalities, min_belt, fee, status:upcoming/ongoing/completed/cancelled).
Criar app/(admin)/admin/eventos/page.tsx: CRUD de eventos. Card com data, título, tipo badge, inscritos/max, ações.
Criar seção de eventos nos dashboards de aluno/teen/kids: "Próximos Eventos" com card de inscrição.
Adicionar "🏆 Eventos" no AdminShell sidebar.

────────────────────────────────────────
P-038: AVALIAÇÕES DO PROFESSOR — COMPLETO
────────────────────────────────────────
Reescrever app/(professor)/professor/avaliacoes/page.tsx:
- Lista de alunos para avaliar. Filtro por turma.
- Formulário de avaliação por aluno: técnica(1-10), postura(1-10), evolução(1-10), comportamento(1-10), comentário texto. Radar chart SVG com as 4 notas.
- Histórico de avaliações por aluno (timeline).
- Bulk evaluation: avaliar turma inteira de uma vez.
- Avaliação aparece no perfil do aluno e no dashboard do responsável.

────────────────────────────────────────
P-039: HELP CENTER / DOCS
────────────────────────────────────────
Criar app/(public)/ajuda/page.tsx:
- Busca por tópico.
- Categorias: Primeiros Passos, Turmas, Presença, Financeiro, Streaming, Planos.
- Artigos com markdown renderizado.
- Mock: 10 artigos de ajuda.
- Acessível de dentro do app (ícone "?" no header).
- Chatbot futuro: placeholder "Em breve: assistente IA".

────────────────────────────────────────
P-040: TERMOS + PRIVACIDADE + SEO
────────────────────────────────────────
Criar app/(public)/termos/page.tsx: termos de uso completos (template BR).
Criar app/(public)/privacidade/page.tsx: política de privacidade LGPD-ready.
SEO audit: meta tags em TODAS as páginas públicas. Sitemap.xml. robots.txt. Open Graph. Structured data (JSON-LD) pra SaaS.

COMMIT BATCH 4: git add -A && git commit -m "batch: P-031 a P-040 — go-to-market: landing, pricing, onboarding, email, reports, store, events" && git push

────────────────────────────────────────
P-041 a P-050: INTEGRAÇÕES E PERFORMANCE
────────────────────────────────────────

P-041: GATEWAY DE PAGAMENTO
Integrar Stripe ou Pagar.me (mock primeiro):
- Checkout de plano (mensal/anual). Criar lib/payment/stripe.ts ou lib/payment/pagarme.ts.
- Checkout session → redirect → webhook confirmation.
- Portal do cliente (trocar cartão, cancelar).
- Em mock: simula todo o fluxo com delays.

P-042: COBRANÇAS DE MENSALIDADE DOS ALUNOS
Integrar pagamento de mensalidade:
- Admin configura valor por turma/plano.
- Geração automática de boleto/PIX no dia 1.
- Webhook de confirmação → marca como pago.
- Em mock: botão "Simular Pagamento".

P-043: PERFORMANCE — CORE WEB VITALS
Otimizar LCP, CLS, FID:
- next/image em todas as imagens.
- Dynamic imports pra componentes pesados (Chart.js, modais).
- Prefetch de rotas frequentes.
- Font optimization (display: swap).
- Bundle analysis: remover dependências não usadas.
- Target: LCP < 2.5s, CLS < 0.1, FID < 100ms.

P-044: CACHING + DATA FETCHING
Implementar SWR ou React Query:
- Cache de dados frequentes (turmas, alunos, plano).
- Revalidação automática.
- Optimistic updates em ações (mark as paid, check-in).
- Skeleton enquanto revalida (stale-while-revalidate).

P-045: SECURITY HEADERS + RATE LIMITING
- CSP headers via next.config.js.
- CORS configurado.
- Rate limiting em rotas de auth (Vercel Edge middleware).
- Input sanitization em todos os forms.
- XSS protection.
- Secure cookies (httpOnly, sameSite, secure).

P-046: IMAGE OPTIMIZATION + CDN
- next/image com sizes e priority.
- Placeholder blur pra imagens.
- Logo upload com resize server-side.
- Thumbnails de vídeo cached.
- Static assets via Vercel Edge Network.

P-047: REAL-TIME UPDATES
Supabase Realtime OU polling:
- Activity feed atualiza em tempo real.
- Notificações chegam sem refresh.
- Check-in atualiza presença live.
- Novo comunicado aparece imediatamente.
- Em mock: setTimeout simula updates a cada 30s.

P-048: BULK OPERATIONS
Operações em massa:
- Selecionar múltiplos alunos → enviar comunicado / mudar turma / gerar relatório.
- Selecionar múltiplos vídeos → mover pra série / publicar / despublicar.
- Marcar presença de turma inteira com 1 click.
- Gerar mensalidades em massa.

P-049: AUDIT LOG
Criar lib/types/audit.ts: AuditEntry(id, user_id, action, entity_type, entity_id, changes_json, ip, user_agent, created_at).
Registrar TODAS as ações importantes: login, create, update, delete, publish, approve, payment.
Criar app/(admin)/admin/auditoria/page.tsx: timeline de ações com filtros por tipo/user/período.

P-050: DATABASE OPTIMIZATION
Criar índices SQL para queries frequentes:
- profiles(academy_id, role)
- attendance(student_id, date)
- mensalidades(academy_id, status, reference_month)
- videos(academy_id, is_published)
- invite_tokens(token)
- notifications(user_id, is_read)
Analisar queries N+1 e otimizar com joins.

COMMIT BATCH 5: git add -A && git commit -m "batch: P-041 a P-050 — integrations: payment, performance, security, realtime, audit" && git push

────────────────────────────────────────
P-051 a P-060: COMUNICAÇÃO + DADOS
────────────────────────────────────────

P-051: PUSH NOTIFICATIONS (WEB)
Service worker + Web Push API:
- Solicitar permissão no primeiro login.
- Enviar push: lembrete de aula (1h antes), mensalidade vencendo (D-3), novo comunicado, graduação aprovada.
- Configurável por usuário em /configuracoes.

P-052: WHATSAPP INTEGRATION (EVOLUTION API)
Integrar com Evolution API ou WhatsApp Business API:
- Template: boas-vindas ao novo aluno.
- Template: lembrete de aula.
- Template: cobrança de mensalidade.
- Template: alerta de ausência pro responsável.
- Admin configura número do WhatsApp da academia.
- Em mock: simula envio com log.

P-053: ANALYTICS DASHBOARD AVANÇADO
Criar app/(admin)/admin/analytics/page.tsx:
- Gráficos: alunos por mês (12 meses), receita por mês, retenção por mês, presença média por turma, horários mais populares, modalidades mais procuradas.
- Filtros por período.
- Comparativo: este mês vs anterior vs mesmo mês ano passado.
- Exportar dados CSV.

P-054: ANALYTICS POR PROFESSOR
Criar app/(admin)/admin/analytics/professores/page.tsx:
- Ranking de professores por: retenção de alunos, presença média, avaliação média, conteúdo publicado.
- Comparativo entre professores.
- Útil pra bonificação e gestão.

P-055: ANALYTICS POR ALUNO
Expandir perfil do aluno com aba analytics:
- Evolução de frequência (gráfico 6 meses).
- Evolução de quiz scores.
- Tempo assistido por semana.
- Comparação com média da turma.

P-056: PREVISÃO DE CHURN (SIMPLES)
Criar algoritmo simples de risco de evasão:
- Score 0-100 baseado em: frequência recente, tendência de queda, tempo sem treinar, mensalidade atrasada, quiz scores caindo.
- Pesos: frequência 40%, tendência 25%, inadimplência 20%, engagement 15%.
- Classificação: baixo(0-30), médio(30-60), alto(60-80), crítico(80-100).
- Lista ordenada por risco no dashboard admin.

P-057: EXPORT UNIVERSAL
Botão "Exportar" em toda tabela/lista:
- Formatos: CSV, Excel (xlsx), PDF.
- Alunos, turmas, presença, financeiro, analytics.
- Usar SheetJS pra Excel, jsPDF pra PDF.
- Nome do arquivo: blackbelt_{tipo}_{data}.{ext}

P-058: IMPORT DE DADOS
Criar ferramenta de importação:
- Upload CSV de alunos (nome, email, faixa, turma).
- Preview com validação antes de importar.
- Mapeamento de colunas (drag match).
- Relatório de importação (X importados, Y erros).
- Útil pra academias migrando de outro sistema.

P-059: MULTI-FILIAL
Expandir modelo de dados pra filiais:
- Academy tem branch(es).
- Cada filial: nome, endereço, professores, turmas.
- Admin vê todas as filiais.
- Dashboard com filtro por filial.
- Apenas planos Black Belt + Enterprise.

P-060: WEBHOOKS + API BÁSICA
Criar sistema de webhooks:
- Admin configura URL de webhook.
- Eventos: new_student, check_in, payment, belt_promotion.
- Payload JSON padrão.
- Retry 3x em falha.
- Log de entregas.
Criar /api/v1/ com endpoints básicos (GET alunos, GET turmas, GET presença).
Documentação com Swagger/OpenAPI.

COMMIT BATCH 6: git add -A && git commit -m "batch: P-051 a P-060 — communication: push, whatsapp, analytics, churn prediction, export, webhooks" && git push

════════════════════════════════════════════════════════════════
══  FASE 3: PROFISSIONAL (P-061 a P-080)  ══
══  Nota: 8.5 → 9.2  ══
════════════════════════════════════════════════════════════════

P-061: PWA COMPLETA
Manifest.json completo. Service worker com cache strategy (stale-while-revalidate pra pages, cache-first pra assets). Offline: ver horários, dados salvos. Install prompt nativo. Splash screen. Icons 192 + 512.

P-062: TESTES — UNIT (VITEST)
Configurar Vitest. Escrever tests pra: todos os services (mock), utils (formatTime, formatCurrency), hooks (useAuth, useTheme). Target: 60% coverage nos services.

P-063: TESTES — E2E (PLAYWRIGHT)
Configurar Playwright. Fluxos: login → dashboard, admin CRUD turma, professor adiciona vídeo, aluno assiste vídeo + quiz. CI: roda em todo push.

P-064: MONITORAMENTO — SENTRY
Integrar Sentry: error tracking automático em prod. Performance monitoring. Source maps. Alerts por email. Dashboard de saúde.

P-065: ACESSIBILIDADE (A11Y)
Audit WCAG 2.1 AA: todos os forms com labels associados, keyboard navigation em todos os modais e dropdowns, screen reader support (aria-label, aria-describedby, role), contraste mínimo 4.5:1, focus indicators visíveis, skip to content link. Testar com Lighthouse.

P-066: I18N — PORTUGUÊS POLIDO
Extrair TODAS as strings hardcoded pra arquivo de tradução. Criar lib/i18n/pt-BR.ts com todas as strings. Usar hook useTranslation(). Preparar estrutura pra en-US e es-ES futuro. Datas e moedas formatadas com Intl.

P-067: DARK MODE POLISH FINAL
Audit completo de dark mode:
- Verificar TODAS as páginas em dark mode.
- Corrigir qualquer cor hardcoded restante.
- Testar contrastes em dark.
- Gradientes e overlays ajustados.
- Charts com paleta dark.
- Modais com backdrop correto.

P-068: ANIMATIONS POLISH
Adicionar animações onde falta:
- Page transitions (fade entre rotas).
- List item stagger (cards aparecem com delay).
- Button feedback (scale 0.98 on press).
- Loading → content transition (fade).
- Number animations em dashboards.
- Progress bar fill animations.
- Toast notifications slide-in.

P-069: CHAT INTERNO
Criar sistema de mensagens:
- Professor ↔ Aluno (1:1).
- Admin → Broadcast (todos).
- Responsável ↔ Professor.
- Interface: sidebar com conversas + área de mensagens.
- Real-time via Supabase Realtime ou polling.
- Persistência em banco.
- Badge de unread no sidebar.

P-070: CHECK-IN POR QR CODE REAL
Expandir check-in com QR:
- Cada turma gera QR único por dia.
- Aluno escaneia com câmera do celular.
- Validação: aluno está na turma + horário da aula.
- Confirmação visual + sonora.
- Professor vê check-ins em tempo real.
- Usar browser camera API (navigator.mediaDevices).

COMMIT BATCH 7: git add -A && git commit -m "batch: P-061 a P-070 — professional: PWA, tests, monitoring, a11y, i18n, chat, QR check-in" && git push

P-071: NF-E AUTOMÁTICA
Integrar emissão de NF-e:
- API de NF-e (Nota Carioca, Focus, ou mock).
- Emissão automática após pagamento confirmado.
- PDF da nota disponível no financeiro.
- Configuração: CNPJ, inscrição municipal, certificado.
- Em mock: gera PDF fake.

P-072: GOOGLE CALENDAR SYNC
Sincronizar aulas com Google Calendar:
- OAuth Google.
- Criar eventos pra cada aula do aluno.
- Atualizar quando turma muda horário.
- Remover quando aluno sai da turma.
- Em mock: botão "Sincronizar" com toast.

P-073: DASHBOARD WIDGETS CUSTOMIZÁVEIS
Admin escolhe quais widgets quer no dashboard:
- Drag & drop pra reordenar.
- Toggle pra mostrar/esconder seções.
- Salvar layout por usuário (localStorage ou DB).
- Presets: "Resumido" (só headlines), "Completo" (tudo), "Financeiro" (foco receita).

P-074: GAMIFICAÇÃO COMPLETA DO ALUNO
Expandir sistema de XP + conquistas:
- XP por: presença(+10), vídeo assistido(+5), quiz acertado(+3 por pergunta), série completa(+50), streak 7 dias(+100).
- Levels: 1-100 com nomes temáticos (Faixa Branca Level 1-10, Azul 11-25, etc).
- Leaderboard por turma e geral.
- Conquistas: 30 badges desbloqueáveis.
- Profile card com level + XP + badges (compartilhável).

P-075: GAMIFICAÇÃO DO PROFESSOR
XP e conquistas pra professor:
- XP por: aula dada(+10), avaliação feita(+5), vídeo publicado(+20), graduação proposta(+15).
- Conquistas: "100 aulas dadas", "50 vídeos", "Mestre avaliador".
- Ranking de professores (interno, só admin vê).

P-076: RELATÓRIO AUTOMÁTICO SEMANAL
Toda segunda-feira, gerar automaticamente:
- Email pro admin: resumo da semana (novos alunos, presença, receita, destaques).
- Email pro professor: presença das turmas, alunos em risco.
- Email pro responsável: frequência dos filhos.
- Usar templates de email do P-034.
- Em mock: gerar preview na tela.

P-077: MULTI-IDIOMA (EN-US + ES-ES)
Adicionar traduções:
- en-US pra todos os textos.
- es-ES pra todos os textos.
- Selector de idioma em configurações.
- Datas e moedas formatadas por locale.
- Rotas não mudam (apenas UI text).

P-078: LGPD COMPLIANCE
Implementar requisitos LGPD:
- Consentimento no cadastro (checkbox obrigatório).
- Política de privacidade acessível.
- Botão "Excluir meus dados" no perfil.
- Export de dados pessoais (JSON/PDF).
- Anonimização de dados excluídos.
- Log de consentimento.
- Cookie banner (se aplicável).

P-079: 2FA / MFA
Autenticação em 2 fatores:
- TOTP (Google Authenticator, Authy).
- Configuração em /configuracoes → Segurança.
- QR Code pra scan.
- Backup codes (10 códigos).
- Obrigatório pra superadmin.
- Opcional pra admin/professor.
- Supabase Auth MFA ou custom.

P-080: CAPACITOR — PWA TO NATIVE
Preparar Capacitor pra build nativo:
- capacitor.config.ts configurado.
- Plugins: Camera (QR), Push Notifications, Haptics, Status Bar.
- Splash screen + icons nativos.
- Deep links configurados.
- Build iOS + Android funcional (teste local).

COMMIT BATCH 8: git add -A && git commit -m "batch: P-071 a P-080 — enterprise: NF-e, calendar, gamification, i18n, LGPD, 2FA, Capacitor" && git push

════════════════════════════════════════════════════════════════
══  FASE 4: DOMÍNIO (P-081 a P-100)  ══
══  Nota: 9.2 → 10.0  ══
════════════════════════════════════════════════════════════════

P-081: APP STORE — IOS BUILD
Build final pra App Store:
- Icons 1024x1024.
- Screenshots pra review.
- App Store Connect metadata.
- Privacy manifest.
- Testar em simulador + device real.

P-082: PLAY STORE — ANDROID BUILD
Build final pra Play Store:
- Signing key.
- Screenshots.
- Play Console metadata.
- Privacy policy link.
- AAB bundle.

P-083: API PÚBLICA DOCUMENTADA
Criar /api/v1/ RESTful:
- Endpoints: /students, /classes, /attendance, /videos, /announcements.
- Auth via API key (Bearer token).
- Rate limiting: 100 req/min.
- Documentação Swagger UI em /api/docs.
- Versionamento (v1, v2 futuro).

P-084: ZAPIER INTEGRATION
Criar Zapier app ou webhooks compatíveis:
- Triggers: new_student, check_in, payment, belt_promotion.
- Actions: create_student, send_announcement.
- Templates: "Novo aluno → Google Sheets", "Pagamento → Slack".

P-085: ML — PREVISÃO DE CHURN AVANÇADA
Modelo de ML simples (TensorFlow.js ou regressão):
- Features: frequência tendência, dias sem treinar, inadimplência, quiz engagement, tempo no plano.
- Training: dados históricos (mock 1000 registros).
- Prediction: score 0-1 de probabilidade de cancelar.
- Explicabilidade: "Motivo principal: queda de frequência -40%".
- Atualização diária (cron ou Supabase function).

P-086: RECOMENDAÇÃO DE CONTEÚDO
Sistema de recomendação pra biblioteca:
- Baseado em: faixa do aluno, vídeos assistidos, quiz scores, turma.
- "Recomendado pra você" personalizado.
- "Reforce sua guarda" (baseado em quiz score baixo em guarda).
- Collaborative filtering simples (alunos parecidos assistiram X).

P-087: DASHBOARD RESPONSÁVEL — MÓDULO PAGAMENTO
Responsável paga mensalidade pelo app:
- Lista de mensalidades pendentes dos filhos.
- Checkout: PIX (QR Code), boleto, cartão.
- Comprovante de pagamento.
- Histórico de pagamentos.
- Recibo automático.

P-088: COMPETITION BRACKETS
Módulo de competição interno:
- Criar competição com categorias (peso, faixa, idade).
- Inscrição de alunos.
- Gerar chaves (single/double elimination).
- Registrar resultados.
- Ranking e medalhas.
- Compartilhar resultados.

P-089: WHITE LABEL
Preparar pra white-label:
- Cores da marca configuráveis por academia (CSS vars dinâmicas).
- Logo customizável.
- Domain custom (CNAME).
- Email from custom.
- Remover "BlackBelt" dos textos internos (usar nome da academia).

P-090: PERFORMANCE EXTREMA
Otimização final:
- Edge runtime em rotas críticas.
- Streaming SSR pra dashboards.
- Parallel data fetching (Promise.all).
- Lazy loading de tudo que não é above the fold.
- Lighthouse score > 90 em todas as páginas.
- Bundle < 200KB initial load.

COMMIT BATCH 9: git add -A && git commit -m "batch: P-081 a P-090 — dominance: app stores, API, ML, white-label, performance" && git push

P-091: SUPABASE EDGE FUNCTIONS
Migrar lógica server-side pra Edge Functions:
- generate-invoice (mensal).
- send-reminders (cron diário).
- calculate-churn-scores (cron diário).
- process-webhook (pagamento).
- generate-certificate (on-demand).

P-092: BACKUP + DISASTER RECOVERY
- Backup automático diário (Supabase).
- Point-in-time recovery configurado.
- Documented restore procedure.
- Teste de restore trimestral.
- Exportação completa de dados (admin).

P-093: STATUS PAGE
Criar página de status do sistema:
- Uptime monitor (UptimeRobot ou Checkly).
- Status dos serviços: App, API, Database, Payments, Email.
- Incident history.
- Subscribe to updates.
- URL: status.blackbelt.app.

P-094: CHANGELOG PÚBLICO
Criar página de changelog:
- Atualizações por versão.
- "Novo", "Melhorado", "Corrigido" tags.
- Data de release.
- Screenshots das novidades.
- In-app notification "Nova versão! Veja o que mudou".

P-095: ONBOARDING IN-APP TOURS
Criar product tours interativos:
- Primeiro acesso: tour guiado com tooltips apontando features.
- Highlight de novas features (após update).
- "Pular tour" + "Mostrar novamente" em configurações.
- Biblioteca: Shepherd.js ou custom.

P-096: REFERRAL SYSTEM
Sistema de indicação:
- Admin indica outra academia → ganha 1 mês grátis.
- Link de referral único.
- Dashboard de indicações (quantos indicados, convertidos).
- Desconto pro indicado (1 mês 50% off).

P-097: A/B TESTING FRAMEWORK
Preparar infra pra A/B tests:
- Feature flags (lib/features/flags.ts).
- Variantes por academia (A/B).
- Métricas de conversão por variante.
- Admin UI pra toggle features.

P-098: STRESS TEST + LOAD TEST
Criar scripts de load test (k6 ou similar):
- Simular 100 academias simultâneas.
- 1000 alunos fazendo check-in.
- 500 acessando dashboard.
- Identificar bottlenecks.
- Documentar limites.

P-099: DOCUMENTATION COMPLETA
Criar docs/: architecture.md, deployment.md, api.md, contributing.md, security.md.
README.md atualizado com: overview, tech stack, setup local, deploy, architecture diagram.
Inline code docs: JSDoc em todos os services públicos.

P-100: FINAL AUDIT + POLISH
Audit final completo:
- Rodar Lighthouse em TODAS as páginas. Target > 90.
- Rodar axe em TODAS as páginas. 0 critical/serious.
- Rodar bundle analyzer. Remover dead code.
- Verificar TODAS as rotas (0 404s).
- Verificar TODOS os perfis (login → dashboard → feature → logout).
- Verificar responsivo (3 breakpoints) em todas as páginas.
- Verificar dark mode em todas as páginas.
- Verificar i18n (PT/EN/ES) em todas as strings.
- Performance: < 3s load em todas as páginas.
- Segurança: 0 vulnerabilidades (npm audit).
- Documentação: README completo.
- Tag release: v2.0.0.

COMMIT BATCH 10 (FINAL): git add -A && git commit -m "batch: P-091 a P-100 — enterprise 10.0: edge functions, backup, status, referral, docs, final audit" && git push && git tag v2.0.0 && git push --tags

════════════════════════════════════════════════════════════════
FIM. BLACKBELT v2 @ 10.0. PLATAFORMA VERTICAL ENTERPRISE.
════════════════════════════════════════════════════════════════
