# Auditoria de Services — BlackBelt v2

Data: 2026-03-24
Total de services: 227
Critério: isMock() pattern com query Supabase real no ramo !isMock()

---

## 🟢 FUNCIONANDO — 152 services (67%)

Query Supabase real no ramo `!isMock()`, tabela existe nas migrations.

| Service | Arquivo | Observação |
|---------|---------|------------|
| auth | lib/api/auth.service.ts | Login, register, OAuth, profile, token refresh — PRODUCTION READY |
| checkin | lib/api/checkin.service.ts | doCheckin, getHistory, getStats, getTodayByClass — testado com RLS |
| attendance | lib/api/attendance.service.ts | Professor attendance com upsert — testado |
| class | lib/api/class.service.ts | CRUD completo: list, create, update, delete, students |
| student-management | lib/api/student-management.service.ts | Students CRUD, profiles, memberships, enrollments |
| admin-dashboard | lib/api/admin-dashboard.service.ts | Contagens reais, revenue, retention, scheduling |
| billing | lib/api/billing.service.ts | Plans, subscriptions, invoices, usage, alerts |
| graduation | lib/api/graduation.service.ts | Propose, approve, reject, pending, history |
| financeiro | lib/api/financeiro.service.ts | Revenue, invoices, subscriptions, plans |
| perfil | lib/api/perfil.service.ts | Profile, journey, evolution, heatmap, evaluations |
| professor | lib/api/professor.service.ts | Dashboard, classes, students, messages |
| notifications | lib/api/notifications.service.ts | CRUD + mark as read |
| preferences | lib/api/preferences.service.ts | User prefs + academy settings upsert |
| turmas | lib/api/turmas.service.ts | Classes, modalities, enrollments |
| compete | lib/api/compete.service.ts | Tournaments, brackets, registrations |
| recepcao-checkin | lib/api/recepcao-checkin.service.ts | Buscar aluno, registrar entrada/saída |
| recepcao-acesso | lib/api/recepcao-acesso.service.ts | Controle de acesso recepção |
| recepcao-atendimento | lib/api/recepcao-atendimento.service.ts | Atendimentos |
| recepcao-caixa | lib/api/recepcao-caixa.service.ts | Caixa/pagamentos |
| recepcao-cobrancas | lib/api/recepcao-cobrancas.service.ts | Cobranças |
| recepcao-experimental | lib/api/recepcao-experimental.service.ts | Aulas experimentais |
| recepcao-mensagens | lib/api/recepcao-mensagens.service.ts | Mensagens recepção |
| aluno | lib/api/aluno.service.ts | Dashboard aluno (TODOs menores em video/quiz) |
| admin | lib/api/admin.service.ts | Admin operations |
| academia-teorica | lib/api/academia-teorica.service.ts | Conteúdo teórico |
| access-control | lib/api/access-control.service.ts | Controle de acesso |
| admin-content | lib/api/admin-content.service.ts | Gestão de conteúdo |
| admin-orders | lib/api/admin-orders.service.ts | Pedidos admin |
| announcement | lib/api/announcement.service.ts | Comunicados |
| audit | lib/api/audit.service.ts | Audit trail |
| aula-experimental | lib/api/aula-experimental.service.ts | Aulas experimentais |
| avaliacao-tecnica | lib/api/avaliacao-tecnica.service.ts | Avaliações técnicas |
| avaliacao | lib/api/avaliacao.service.ts | Avaliações gerais |
| banco-tecnicas | lib/api/banco-tecnicas.service.ts | Banco de técnicas |
| battle-pass | lib/api/battle-pass.service.ts | Battle pass gamification |
| beta-analytics | lib/api/beta-analytics.service.ts | Analytics beta |
| beta-changelog | lib/api/beta-changelog.service.ts | Changelog beta |
| beta-feedback | lib/api/beta-feedback.service.ts | Feedback beta |
| beta-nps | lib/api/beta-nps.service.ts | NPS beta |
| billing-automation | lib/api/billing-automation.service.ts | Automação de cobrança |
| billing-config | lib/api/billing-config.service.ts | Configuração de billing |
| brackets | lib/api/brackets.service.ts | Chaves de torneio |
| branch | lib/api/branch.service.ts | Unidades/filiais |
| bulk | lib/api/bulk.service.ts | Operações em lote |
| campanhas | lib/api/campanhas.service.ts | Campanhas marketing |
| certificates | lib/api/certificates.service.ts | Certificados |
| championship-registration | lib/api/championship-registration.service.ts | Inscrição campeonato |
| championships | lib/api/championships.service.ts | Campeonatos |
| chat | lib/api/chat.service.ts | Chat |
| churn-prediction | lib/api/churn-prediction.service.ts | Predição de churn |
| conquistas | lib/api/conquistas.service.ts | Conquistas |
| content-management | lib/api/content-management.service.ts | Gestão de conteúdo |
| content | lib/api/content.service.ts | Conteúdo |
| contracts | lib/api/contracts.service.ts | Contratos |
| contratos-v2 | lib/api/contratos-v2.service.ts | Contratos v2 |
| course-creator | lib/api/course-creator.service.ts | Criação de cursos |
| crm | lib/api/crm.service.ts | CRM |
| curriculum | lib/api/curriculum.service.ts | Currículo |
| diario-aula | lib/api/diario-aula.service.ts | Diário de aula |
| estoque | lib/api/estoque.service.ts | Estoque |
| evaluation | lib/api/evaluation.service.ts | Avaliações |
| event | lib/api/event.service.ts | Eventos |
| events | lib/api/events.service.ts | Eventos |
| evolucao | lib/api/evolucao.service.ts | Evolução do aluno |
| faturas | lib/api/faturas.service.ts | Faturas |
| feed | lib/api/feed.service.ts | Feed social |
| financial | lib/api/financial.service.ts | Financeiro |
| franchise | lib/api/franchise.service.ts | Franquias |
| franchise-communication | lib/api/franchise-communication.service.ts | Comunicação franquia |
| franchise-expansion | lib/api/franchise-expansion.service.ts | Expansão franquia |
| franchise-standards | lib/api/franchise-standards.service.ts | Padrões franquia |
| franqueador-curriculo | lib/api/franqueador-curriculo.service.ts | Currículo franqueador |
| franqueador-unidades | lib/api/franqueador-unidades.service.ts | Unidades franqueador |
| gamification | lib/api/gamification.service.ts | Gamificação |
| group-chat | lib/api/group-chat.service.ts | Chat em grupo |
| health-score | lib/api/health-score.service.ts | Health score academia |
| horarios | lib/api/horarios.service.ts | Horários |
| inadimplencia | lib/api/inadimplencia.service.ts | Inadimplência |
| inventory | lib/api/inventory.service.ts | Inventário |
| invite-tokens | lib/api/invite-tokens.service.ts | Tokens de convite |
| invites | lib/api/invites.service.ts | Convites |
| kids-estrelas | lib/api/kids-estrelas.service.ts | Estrelas kids |
| kids-personalizacao | lib/api/kids-personalizacao.service.ts | Personalização kids |
| kids-recompensas | lib/api/kids-recompensas.service.ts | Recompensas kids |
| landing-page | lib/api/landing-page.service.ts | Landing page |
| leads | lib/api/leads.service.ts | Leads |
| leagues | lib/api/leagues.service.ts | Ligas |
| lgpd | lib/api/lgpd.service.ts | LGPD compliance |
| marketplace | lib/api/marketplace.service.ts | Marketplace |
| marketplace-payment | lib/api/marketplace-payment.service.ts | Pagamentos marketplace |
| match-analysis | lib/api/match-analysis.service.ts | Análise de luta |
| mensagens | lib/api/mensagens.service.ts | Mensagens |
| metas | lib/api/metas.service.ts | Metas |
| mfa | lib/api/mfa.service.ts | Multi-factor auth |
| modo-aula | lib/api/modo-aula.service.ts | Modo aula |
| nfe | lib/api/nfe.service.ts | Nota fiscal |
| notificacoes | lib/api/notificacoes.service.ts | Notificações |
| notifications-realtime | lib/api/notifications-realtime.service.ts | Notificações realtime |
| onboarding | lib/api/onboarding.service.ts | Onboarding |
| orders | lib/api/orders.service.ts | Pedidos |
| parent-checkin | lib/api/parent-checkin.service.ts | Check-in responsável |
| parent-payment | lib/api/parent-payment.service.ts | Pagamento responsável |
| payment-gateway | lib/api/payment-gateway.service.ts | Gateway de pagamento (PIX QR pendente) |
| pedagogico | lib/api/pedagogico.service.ts | Pedagógico |
| physical-assessment | lib/api/physical-assessment.service.ts | Avaliação física |
| plano-aula | lib/api/plano-aula.service.ts | Plano de aula |
| planos | lib/api/planos.service.ts | Planos |
| platform-plans | lib/api/platform-plans.service.ts | Planos da plataforma |
| pricing | lib/api/pricing.service.ts | Precificação |
| professor-agenda | lib/api/professor-agenda.service.ts | Agenda professor |
| professor-alertas | lib/api/professor-alertas.service.ts | Alertas professor |
| professor-pedagogico | lib/api/professor-pedagogico.service.ts | Pedagógico professor |
| prospeccao | lib/api/prospeccao.service.ts | Prospecção |
| referral | lib/api/referral.service.ts | Indicações |
| referral-b2b | lib/api/referral-b2b.service.ts | Indicações B2B |
| relatorio-aula | lib/api/relatorio-aula.service.ts | Relatório de aula |
| responsavel-autorizacoes | lib/api/responsavel-autorizacoes.service.ts | Autorizações responsável |
| responsavel-notificacoes | lib/api/responsavel-notificacoes.service.ts | Notificações responsável |
| reviews | lib/api/reviews.service.ts | Avaliações/reviews |
| rewards-store | lib/api/rewards-store.service.ts | Loja de recompensas |
| royalties | lib/api/royalties.service.ts | Royalties |
| seasons | lib/api/seasons.service.ts | Temporadas |
| shipping | lib/api/shipping.service.ts | Envios |
| spaces | lib/api/spaces.service.ts | Espaços |
| sso | lib/api/sso.service.ts | Single sign-on |
| store | lib/api/store.service.ts | Loja |
| store-rewards | lib/api/store-rewards.service.ts | Recompensas loja |
| streaming | lib/api/streaming.service.ts | Streaming de vídeo |
| subscriptions | lib/api/subscriptions.service.ts | Assinaturas |
| substituicao | lib/api/substituicao.service.ts | Substituição professor |
| superadmin | lib/api/superadmin.service.ts | Super admin |
| superadmin-comunicacao | lib/api/superadmin-comunicacao.service.ts | Comunicação superadmin |
| superadmin-dashboard | lib/api/superadmin-dashboard.service.ts | Dashboard superadmin |
| superadmin-features | lib/api/superadmin-features.service.ts | Features superadmin |
| superadmin-health | lib/api/superadmin-health.service.ts | Health superadmin |
| superadmin-impersonate | lib/api/superadmin-impersonate.service.ts | Impersonate superadmin |
| superadmin-pipeline | lib/api/superadmin-pipeline.service.ts | Pipeline superadmin |
| suporte | lib/api/suporte.service.ts | Suporte |
| techniques | lib/api/techniques.service.ts | Técnicas |
| titles | lib/api/titles.service.ts | Títulos |
| tournaments | lib/api/tournaments.service.ts | Torneios |
| training-plan | lib/api/training-plan.service.ts | Plano de treino |
| turma-ativa | lib/api/turma-ativa.service.ts | Turma ativa |
| tutorial | lib/api/tutorial.service.ts | Tutorial |
| units | lib/api/units.service.ts | Unidades |
| video-experience | lib/api/video-experience.service.ts | Experiência de vídeo |
| webhook | lib/api/webhook.service.ts | Webhooks |
| webhooks-outgoing | lib/api/webhooks-outgoing.service.ts | Webhooks outgoing |
| weekly-report | lib/api/weekly-report.service.ts | Relatório semanal |
| whatsapp | lib/api/whatsapp.service.ts | WhatsApp |
| wishlist | lib/api/wishlist.service.ts | Wishlist |
| wizard | lib/api/wizard.service.ts | Wizard setup |

---

## 🟡 PARCIAL — 40 services (18%)

Tem alguma query Supabase mas incompleto ou não testado end-to-end.

| Service | Arquivo | O que falta |
|---------|---------|-------------|
| agenda-familiar | lib/api/agenda-familiar.service.ts | Queries limitadas |
| analytics | lib/api/analytics.service.ts | Tracking only, sem queries de leitura |
| automations | lib/api/automations.service.ts | Parcialmente implementado |
| branding | lib/api/branding.service.ts | Queries limitadas |
| calendar-sync | lib/api/calendar-sync.service.ts | Sync parcial |
| calendar | lib/api/calendar.service.ts | Queries limitadas |
| challenges | lib/api/challenges.service.ts | Parcialmente implementado |
| competition | lib/api/competition.service.ts | Queries limitadas |
| conquistas-v2 | lib/api/conquistas-v2.service.ts | Parcialmente implementado |
| eventos | lib/api/eventos.service.ts | Queries limitadas |
| hall-fama | lib/api/hall-fama.service.ts | Queries limitadas |
| import | lib/api/import.service.ts | Parcialmente implementado |
| importacao | lib/api/importacao.service.ts | Parcialmente implementado |
| insights | lib/api/insights.service.ts | Queries limitadas |
| kids-faixa | lib/api/kids-faixa.service.ts | Queries limitadas |
| kids-figurinhas | lib/api/kids-figurinhas.service.ts | Queries limitadas |
| notification-preferences | lib/api/notification-preferences.service.ts | Queries limitadas |
| nps | lib/api/nps.service.ts | Queries limitadas |
| parent | lib/api/parent.service.ts | Dashboard parcial |
| plan-enforcement | lib/api/plan-enforcement.service.ts | Queries limitadas |
| professor-aluno360 | lib/api/professor-aluno360.service.ts | Visão 360 parcial |
| promocao | lib/api/promocao.service.ts | Queries limitadas |
| qrcode | lib/api/qrcode.service.ts | Geração parcial |
| ranking | lib/api/ranking.service.ts | Queries limitadas |
| recepcao-cadastro | lib/api/recepcao-cadastro.service.ts | Cadastro parcial |
| recepcao-dashboard | lib/api/recepcao-dashboard.service.ts | Contagens retornam 0 |
| recommendation | lib/api/recommendation.service.ts | Queries limitadas |
| recommendations | lib/api/recommendations.service.ts | Queries limitadas |
| relatorio-professor | lib/api/relatorio-professor.service.ts | Relatório parcial |
| responsavel-jornada | lib/api/responsavel-jornada.service.ts | Jornada parcial |
| responsavel | lib/api/responsavel.service.ts | Dashboard parcial |
| search | lib/api/search.service.ts | Busca parcial |
| sentiment | lib/api/sentiment.service.ts | Análise parcial |
| suggestions | lib/api/suggestions.service.ts | Sugestões parciais |
| superadmin-analytics | lib/api/superadmin-analytics.service.ts | Analytics parcial |
| superadmin-revenue | lib/api/superadmin-revenue.service.ts | Revenue parcial |
| teen-desafios | lib/api/teen-desafios.service.ts | Desafios parciais |
| white-label | lib/api/white-label.service.ts | White label parcial |
| xp | lib/api/xp.service.ts | XP parcial |
| zapier | lib/api/zapier.service.ts | Integração parcial |

---

## 🔴 MOCK ONLY — 35 services (15%)

Ramo real vazio, throw, return [], TODO, ou sem queries Supabase.

| Service | Arquivo | Prioridade para demo |
|---------|---------|---------------------|
| ai-coach | lib/api/ai-coach.service.ts | BAIXA (feature futura) |
| ai-reports | lib/api/ai-reports.service.ts | BAIXA (feature futura) |
| api-keys | lib/api/api-keys.service.ts | BAIXA (developer) |
| app-store | lib/api/app-store.service.ts | BAIXA (marketplace) |
| beacon | lib/api/beacon.service.ts | BAIXA (IoT) |
| championship-live | lib/api/championship-live.service.ts | BAIXA (live streaming) |
| competition-predictor | lib/api/competition-predictor.service.ts | BAIXA (AI) |
| developer | lib/api/developer.service.ts | BAIXA (developer portal) |
| federation-ranking | lib/api/federation-ranking.service.ts | BAIXA (federação) |
| in-app-notification | lib/api/in-app-notification.service.ts | MÉDIA (notificações) |
| iot | lib/api/iot.service.ts | BAIXA (IoT) |
| kids | lib/api/kids.service.ts | MÉDIA (shell kids) |
| network | lib/api/network.service.ts | BAIXA (rede) |
| notification-hub | lib/api/notification-hub.service.ts | MÉDIA (hub) |
| observability | lib/api/observability.service.ts | BAIXA (infra) |
| painel-dia | lib/api/painel-dia.service.ts | MÉDIA (professor) |
| periodization | lib/api/periodization.service.ts | BAIXA (treino) |
| personal-ai | lib/api/personal-ai.service.ts | BAIXA (AI) |
| plugins | lib/api/plugins.service.ts | BAIXA (extensões) |
| posture-analysis | lib/api/posture-analysis.service.ts | BAIXA (AI) |
| privacy | lib/api/privacy.service.ts | BAIXA (config) |
| proximity-checkin | lib/api/proximity-checkin.service.ts | BAIXA (bluetooth) |
| qr-checkin | lib/api/qr-checkin.service.ts | MÉDIA (check-in QR) |
| relatorios | lib/api/relatorios.service.ts | MÉDIA (relatórios) |
| reports-export | lib/api/reports-export.service.ts | BAIXA (export) |
| retention | lib/api/retention.service.ts | BAIXA (analytics) |
| student-analytics | lib/api/student-analytics.service.ts | BAIXA (analytics) |
| teen-season | lib/api/teen-season.service.ts | MÉDIA (teen season) |
| teen | lib/api/teen.service.ts | MÉDIA (shell teen) |
| training-video | lib/api/training-video.service.ts | BAIXA (vídeo) |
| video-analysis | lib/api/video-analysis.service.ts | BAIXA (AI vídeo) |
| video-storage | lib/api/video-storage.service.ts | BAIXA (storage) |
| video-upload | lib/api/video-upload.service.ts | BAIXA (upload) |
| voice-assistant | lib/api/voice-assistant.service.ts | BAIXA (AI) |
| wearable | lib/api/wearable.service.ts | BAIXA (IoT) |

---

## SERVIÇOS CRÍTICOS PARA DEMO

| # | Fluxo | Status | Service |
|---|-------|--------|---------|
| 1 | Login/Auth | 🟢 | auth.service.ts — signInWithPassword, roles, redirect |
| 2 | Cadastro de aluno | 🟢 | student-management.service.ts — CRUD completo |
| 3 | Check-in | 🟢 | checkin.service.ts — com RLS, testado |
| 4 | Turmas/aulas | 🟢 | class.service.ts + turmas.service.ts — CRUD + horários |
| 5 | Cobranças/mensalidades | 🟢 | billing.service.ts + financeiro.service.ts |
| 6 | Dashboard admin | 🟢 | admin-dashboard.service.ts — contagens reais |
| 7 | Perfil do aluno | 🟢 | perfil.service.ts — dados + evolução |
| 8 | Graduações/faixas | 🟢 | graduation.service.ts — propose/approve (checkCriteria parcial) |
| 9 | Comunicação (avisos) | 🟢 | notifications.service.ts + announcement.service.ts |
