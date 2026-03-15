# BLACKBELT v2 — Master Roadmap Part 2

> Do MVP ao Produto Competitivo de Mercado
> Fases 11–20 · 50 Prompts Executáveis · IA · Escala · Integrações · Monetização
>
> Autor: Gregory Gonçalves Silveira Pinto
> Data: Março 2026 | Pré-requisito: Fases 0–10 concluídas

---

## Contexto

As Fases 0–10 entregam o BlackBelt v2 como MVP funcional: auth, turmas, presença, dashboards, pedagógico, social, conteúdo, financeiro básico, Supabase, mobile e publicação nas stores. Este documento leva o produto do MVP para um SaaS competitivo de mercado com inteligência artificial, escala multi-tenant real, integrações de pagamento, comunicação, e features avançadas de operação.

---

## Visão Geral das Fases 11–20

| Fase | Nome | Foco | Prompts | Resultado |
|------|------|------|---------|-----------|
| 11 | Inteligência v1 | Analytics avançados, predições, insights | P53–P57 | Dados viram decisões |
| 12 | Pagamentos Reais | Gateway (Stripe/Asaas), boleto, PIX, webhook | P58–P62 | Receita real entrando |
| 13 | Comunicação | WhatsApp, email transacional, push avançado | P63–P67 | Engajamento automatizado |
| 14 | Multi-Tenant Pro | Onboarding self-service, planos plataforma, white-label | P68–P72 | Escala B2B |
| 15 | Operações Avançadas | Estoque, espaço físico, contratos, eventos | P73–P77 | Academia completa digital |
| 16 | Social & Comunidade | Feed, torneios, desafios, live, entre academias | P78–P82 | Rede de artes marciais |
| 17 | Inteligência v2 | Coach IA, recomendação de treino, NLP, chatbot | P83–P87 | IA como diferencial |
| 18 | Internacionalização | i18n, moedas, fuso horário, compliance LGPD/GDPR | P88–P92 | Mercado global |
| 19 | Enterprise | API pública, webhooks, SSO, audit log, SLA | P93–P97 | Grandes redes |
| 20 | Growth & Otimização | Landing page, SEO, referral, A/B test, observabilidade | P98–P102 | Máquina de crescimento |

---

## FASE 11 — INTELIGÊNCIA v1

Analytics avançados, predições baseadas em dados, insights automáticos para admin e professor. Os dados que já existem no sistema passam a gerar valor.

---

#### PROMPT P53: Service de Analytics Avançado

```
Crie para o BlackBelt v2:
lib/api/analytics.service.ts:
- getRetentionCohort(academyId, months) → CohortData[]
  Análise de retenção: % de alunos ativos por mês de entrada
- getChurnRisk(academyId) → ChurnRiskDTO[]
  Lista alunos com risco de abandono (sem presença 7+ dias, queda de frequência)
- getRevenueForecasting(academyId, months) → ForecastDTO
  Projeção de receita baseada em tendência (MRR, churn rate, growth rate)
- getProfessorPerformance(academyId) → ProfessorMetricsDTO[]
  Métricas por professor: presença média das turmas, retenção, avaliações
- getClassOccupancy(academyId) → OccupancyDTO[]
  Taxa de ocupação por turma (matriculados vs capacidade vs presentes)

lib/mocks/analytics.mock.ts com 12 meses de dados históricos.
Todos os DTOs tipados, alinhados com domain.ts.
```

---

#### PROMPT P54: Dashboard Analytics (Admin)

```
Crie app/(admin)/analytics/page.tsx do BlackBelt v2:
Tab 1 — Retenção:
- Cohort chart (Recharts heatmap ou table com cores)
- Taxa de retenção mês a mês
- Comparativo período anterior
Tab 2 — Churn Risk:
- Lista de alunos em risco (avatar, nome, dias sem presença, tendência)
- Filtro: risco alto/médio/baixo
- Ação: "Enviar mensagem" direto da lista
Tab 3 — Receita:
- Gráfico de projeção (linha real + linha projetada tracejada)
- MRR atual, MRR projetado 3 meses
- Indicadores: growth rate, churn rate
Tab 4 — Performance:
- Ranking de professores por presença média das turmas
- Gráfico comparativo de avaliações por professor
Tab 5 — Ocupação:
- Heatmap semanal (dia x horário, cor = ocupação)
- Turmas subutilizadas (<50%) destacadas
Mobile: tabs viram dropdown. Gráficos responsivos.
```

---

#### PROMPT P55: Insights Automáticos

```
Crie lib/api/insights.service.ts do BlackBelt v2:
- generateInsights(academyId) → Insight[]
Cada Insight tem: type, severity (info/warning/critical), title, description, actionUrl, data

Tipos de insight gerados automaticamente:
- CHURN_ALERT: "5 alunos não vieram há 10+ dias" → link para lista
- REVENUE_DROP: "Receita caiu 15% vs mês anterior" → link para financeiro
- CLASS_FULL: "Turma BJJ Avançado está 95% lotada" → link para turma
- CLASS_EMPTY: "Turma Karate Kids tem só 2 alunos" → sugestão de ação
- BELT_READY: "3 alunos atendem requisitos para promoção" → link para pedagógico
- PAYMENT_OVERDUE: "12 faturas vencidas há 5+ dias" → link para faturas
- ATTENDANCE_RECORD: "Presença geral subiu 20% este mês" → celebração
- PROFESSOR_HIGHLIGHT: "Prof. Silva tem 95% de presença média" → destaque

Crie components/shared/InsightCard.tsx (icon por severity, click navega).
Integre no Admin Dashboard como seção "Insights" no topo.
```

---

#### PROMPT P56: Relatórios PDF Exportáveis

```
Crie lib/api/reports-export.service.ts do BlackBelt v2:
- generatePresencaReport(academyId, period) → Blob (PDF)
- generateFinanceiroReport(academyId, period) → Blob (PDF)
- generateAlunoReport(studentId) → Blob (PDF individual)
- generateRankingReport(academyId) → Blob (PDF)

Cada PDF contém:
- Header: logo placeholder + nome da academia + período
- Corpo: tabelas formatadas + gráficos como imagem
- Footer: data de geração + "Gerado por BlackBelt"

Para gerar no client-side, use jsPDF + html2canvas:
- pnpm add jspdf html2canvas
- Renderize um componente hidden, capture como canvas, gere PDF

Crie componentes de template em components/reports/:
- ReportPresenca.tsx (tabela por turma)
- ReportFinanceiro.tsx (receita, inadimplência, gráfico)
- ReportAluno.tsx (dados pessoais, presença, avaliações, conquistas)

Integre botão "Exportar PDF" em:
- Admin relatórios
- Perfil do aluno (professor view)
```

---

#### PROMPT P57: Métricas do Aluno Aprimoradas

```
Evolua app/(main)/progresso/page.tsx do BlackBelt v2:
Nova seção: "Sua Performance"
- Gráfico radar (Recharts RadarChart): técnica, disciplina, presença, evolução
- Comparativo: seu score vs média da turma (overlay no radar)
- Gráfico de frequência mensal (últimos 6 meses, BarChart)
- Streak máximo histórico
- Tempo total de treino estimado (presenças × duração média da aula)

Nova seção: "Recomendações"
- Baseado nas avaliações mais baixas: "Foque em técnica esta semana"
- Baseado na frequência: "Você treina 2x/semana. Para progredir mais rápido, tente 3x."
- Baseado no conteúdo: sugestão de vídeo alinhado com a avaliação mais fraca

Crie lib/api/student-analytics.service.ts + mock.
Versão teen: adicione comparativo com ranking e badges de milestone.
```

---

## FASE 12 — PAGAMENTOS REAIS

Integração com gateway de pagamento real. Receita entrando automaticamente.

---

#### PROMPT P58: Integração Stripe/Asaas (Service Layer)

```
Crie lib/api/payment-gateway.service.ts do BlackBelt v2:
Interface agnóstica de gateway (Strategy Pattern):
- PaymentGateway interface:
  - createCustomer(data) → ExternalCustomerId
  - createSubscription(customerId, planId) → ExternalSubscriptionId
  - cancelSubscription(subscriptionId) → void
  - generateInvoice(subscriptionId) → ExternalInvoiceId
  - getPaymentLink(invoiceId) → { url, expiresAt }
  - processWebhook(payload, signature) → WebhookEvent

Implementações:
- lib/api/gateways/asaas.gateway.ts (Asaas — PIX, boleto, cartão)
- lib/api/gateways/stripe.gateway.ts (Stripe — cartão, PIX via Stripe)
- lib/api/gateways/mock.gateway.ts (mock para dev)

Seleção via env: PAYMENT_GATEWAY=asaas|stripe|mock
Crie lib/types/payment.ts com todos os DTOs de pagamento.
```

---

#### PROMPT P59: Webhook Handler

```
Crie app/api/webhooks/payment/route.ts do BlackBelt v2:
- POST handler que recebe webhooks do gateway de pagamento
- Valida assinatura (HMAC) antes de processar
- Eventos tratados:
  - payment.confirmed → marca Invoice como paid, atualiza Subscription
  - payment.overdue → marca Invoice como overdue, notifica aluno/responsável
  - payment.refunded → marca Invoice como refunded
  - subscription.cancelled → atualiza status, notifica admin
  - subscription.renewed → gera próxima Invoice

Crie lib/api/webhook-processor.ts:
- processPaymentWebhook(event) → atualiza banco + dispara notificações
- Idempotência: salva webhook_id processado para evitar duplicatas

Logging: toda entrada de webhook é logada (structured logger).
Retorno: sempre 200 (mesmo se erro interno, para evitar retry infinito).
```

---

#### PROMPT P60: Checkout e Pagamento (Frontend)

```
Crie para o BlackBelt v2:
app/(main)/planos/page.tsx:
- Grid de planos disponíveis (cards com preço, features, popular badge)
- Botão "Assinar" → redirect para checkout
- Plano atual destacado se já é assinante

app/(main)/checkout/[planId]/page.tsx:
- Resumo do plano selecionado
- Opções de pagamento: PIX, Boleto, Cartão
- PIX: mostra QR code + código copiável + countdown de expiração
- Boleto: mostra código de barras + botão copiar + PDF
- Cartão: form de cartão (ou redirect para gateway)
- Tela de sucesso após confirmação
- Tela de erro com retry

app/(parent)/checkout/[planId]/page.tsx:
- Mesmo fluxo, com seletor de filho

Integre com payment-gateway.service.ts.
Design: clean, confiável, sem distração. Segurança visual.
```

---

#### PROMPT P61: Gestão de Cobranças (Admin)

```
Evolua app/(admin)/financeiro/page.tsx do BlackBelt v2:
Nova tab: "Cobranças Automáticas"
- Toggle: cobrança automática ON/OFF por academia
- Configuração: dia do vencimento (1-28), dias para lembrete, dias para bloqueio
- Preview: "Se ativar, 45 cobranças serão geradas dia 05/próximo mês"

Nova tab: "Gateway"
- Status da conexão com gateway (Asaas/Stripe)
- Últimos webhooks recebidos (log com status)
- Botão "Reprocessar webhook" para falhas

Evolua tabela de faturas:
- Coluna "Método" (PIX/Boleto/Cartão)
- Coluna "Gateway ID" (link externo)
- Ação: "Reenviar cobrança" (gera novo link de pagamento)
- Ação: "Estornar" (com confirm modal)

Crie lib/api/billing-config.service.ts + mock.
```

---

#### PROMPT P62: Régua de Cobrança Automatizada

```
Crie supabase/functions/billing-cron/index.ts do BlackBelt v2:
Cron diário que executa:
1. Gera faturas para assinaturas com vencimento amanhã (se não existir)
2. Envia lembrete 3 dias antes do vencimento (push + email placeholder)
3. Envia notificação no dia do vencimento
4. Marca como overdue após D+1
5. Envia alerta de inadimplência para admin após D+5
6. (Opcional) Bloqueia acesso após D+10 se configurado

Crie lib/api/billing-automation.service.ts:
- getBillingConfig(academyId) → config de régua
- previewNextBilling(academyId) → simulação do que será gerado
- runBillingCycle(academyId) → executa manualmente (admin)

Crie testes para a lógica da régua (edge cases: pro-rata, cancelamento mid-cycle).
```

---

## FASE 13 — COMUNICAÇÃO

WhatsApp, email transacional, push avançado. Comunicação automatizada com alunos.

---

#### PROMPT P63: Service de Notificação Multicanal

```
Crie lib/api/notification-hub.service.ts do BlackBelt v2:
Interface unificada de envio:
- NotificationChannel: push | email | whatsapp | sms | in_app
- sendNotification(userId, channel[], template, data) → NotificationResult
- Templates pré-definidos:
  - aula_em_breve: "Sua aula de {modalidade} começa em 30min"
  - fatura_vencendo: "Sua fatura de R${valor} vence em {dias} dias"
  - promocao_faixa: "Parabéns! Você foi promovido para faixa {cor}!"
  - mensagem_professor: "{professor} enviou uma mensagem"
  - conquista_nova: "Você desbloqueou: {conquista}!"
  - boas_vindas: "Bem-vindo ao {academia}! Sua jornada começa agora."
  - inatividade: "Sentimos sua falta! Volte a treinar."

Implementações por canal:
- lib/api/channels/push.channel.ts (usa push.ts existente)
- lib/api/channels/email.channel.ts (Resend/SendGrid via API)
- lib/api/channels/whatsapp.channel.ts (Evolution API / Twilio)
- lib/api/channels/sms.channel.ts (placeholder)
- lib/api/channels/in-app.channel.ts (salva em notifications table)

Seleção de canal por preferência do usuário + fallback chain.
```

---

#### PROMPT P64: Integração WhatsApp (Evolution API)

```
Crie lib/api/channels/whatsapp.channel.ts do BlackBelt v2:
Integração com Evolution API (self-hosted, gratuito):
- sendMessage(phoneNumber, template, data) → { messageId, status }
- sendMedia(phoneNumber, mediaUrl, caption) → { messageId }
- getMessageStatus(messageId) → status
- receiveWebhook(payload) → IncomingMessage

app/api/webhooks/whatsapp/route.ts:
- Recebe mensagens incoming
- Parse: se aluno respondeu, cria Message no sistema
- Se comando (/presença, /horário, /fatura): responde automaticamente

Templates WhatsApp (pré-aprovados pelo Meta):
- Lembrete de aula
- Cobrança de fatura
- Notificação de promoção
- Resposta a mensagem do professor

Crie lib/types/whatsapp.ts com DTOs.
Config via env: WHATSAPP_API_URL, WHATSAPP_API_KEY, WHATSAPP_INSTANCE.
```

---

#### PROMPT P65: Email Transacional

```
Crie lib/api/channels/email.channel.ts do BlackBelt v2:
Integração com Resend (ou SendGrid):
- sendEmail(to, template, data) → { id, status }

Templates HTML responsivos em lib/email-templates/:
- welcome.tsx (React Email ou HTML string)
- invoice.tsx
- password-reset.tsx
- class-reminder.tsx
- achievement.tsx
- monthly-report.tsx (resumo mensal do aluno para responsável)

Cada template:
- Header com logo BlackBelt
- Conteúdo dinâmico
- Botão CTA que linka para o app
- Footer com unsubscribe link
- Responsivo (mobile + desktop)

Config via env: EMAIL_PROVIDER=resend|sendgrid, EMAIL_API_KEY, EMAIL_FROM.
```

---

#### PROMPT P66: Preferências de Notificação

```
Crie app/(main)/perfil/notificacoes/page.tsx do BlackBelt v2:
Tela de preferências por canal × tipo:
Grid/tabela:
- Linhas: cada tipo de notificação (aula, fatura, mensagem, conquista, etc)
- Colunas: Push, Email, WhatsApp, In-App
- Toggle ON/OFF em cada célula
- "Silenciar tudo" toggle master
- Horário de silêncio (não incomodar entre 22h-7h)

Crie versão equivalente para:
- Professor: configurar quais notificações de alunos recebe
- Admin: configurar defaults da academia
- Parent: configurar por filho

Crie lib/api/notification-preferences.service.ts + mock.
Salva preferências no perfil do usuário.
```

---

#### PROMPT P67: Automações de Comunicação

```
Crie app/(admin)/automacoes/page.tsx do BlackBelt v2:
Sistema de automações configuráveis:
Lista de automações pré-definidas (toggle ON/OFF cada uma):
1. Boas-vindas: enviar mensagem quando aluno se matricula
2. Lembrete de aula: 30min antes, push + whatsapp
3. Falta detectada: se aluno não veio na aula regular, enviar no dia seguinte
4. Inatividade 7 dias: mensagem de incentivo
5. Inatividade 14 dias: mensagem do professor + alerta admin
6. Aniversário: mensagem de parabéns
7. Fatura vencendo: 3 dias antes, no dia, D+1, D+5
8. Promoção de faixa: notificar aluno + responsável + registrar no feed
9. Conquista nova: push + in-app
10. Relatório mensal: email para responsáveis no dia 1

Cada automação mostra: descrição, canais, última execução, status.
Crie lib/api/automations.service.ts + mock.
```

---

## FASE 14 — MULTI-TENANT PRO

Onboarding self-service de novas academias. Planos da plataforma. White-label.

---

#### PROMPT P68: Onboarding Self-Service

```
Crie o fluxo de onboarding para novas academias no BlackBelt v2:
app/(public)/cadastrar-academia/page.tsx:
Step 1: Dados da academia (nome, CNPJ, endereço, telefone)
Step 2: Dados do administrador (nome, email, senha)
Step 3: Escolha do plano da plataforma (free/pro/enterprise)
Step 4: Confirmação + criação automática

Ao finalizar:
- Cria Academy + Unit + Profile (admin) + Membership
- Gera slug único a partir do nome
- Envia email de boas-vindas
- Redirect para /(admin)/admin com wizard de setup inicial

app/(admin)/setup-wizard/page.tsx:
Step 1: Upload de logo (placeholder → Supabase Storage)
Step 2: Configurar modalidades oferecidas
Step 3: Criar primeira turma
Step 4: Convidar primeiro professor (email)
Step 5: "Tudo pronto!" → redirect para dashboard

Crie lib/api/onboarding.service.ts + mock.
```

---

#### PROMPT P69: Planos da Plataforma

```
Crie o sistema de planos da plataforma BlackBelt v2:
Três tiers:
- Free: 1 unidade, 30 alunos, 3 turmas, sem relatórios, sem automações
- Pro (R$199/mês): 3 unidades, 200 alunos, ilimitado turmas, relatórios, automações
- Enterprise (R$499/mês): ilimitado tudo, white-label, API, suporte prioritário

lib/api/platform-plans.service.ts:
- getCurrentPlan(academyId) → PlatformPlan
- getUsage(academyId) → UsageDTO (alunos, turmas, unidades vs limites)
- upgradePlan(academyId, planId) → redirect para checkout
- checkLimit(academyId, resource) → { allowed, current, limit }

Enforcement:
- Middleware que verifica limites antes de criar aluno/turma/unidade
- UI: quando perto do limite, mostrar banner "Upgrade para Pro"
- Quando atinge limite: modal "Você atingiu o limite do plano Free"

Crie app/(admin)/plano-plataforma/page.tsx com comparativo de planos e uso atual.
```

---

#### PROMPT P70: White-Label

```
Crie o sistema de white-label do BlackBelt v2:
lib/api/branding.service.ts:
- getBranding(academyId) → BrandingDTO
- updateBranding(academyId, data) → BrandingDTO

BrandingDTO:
- logoUrl: string | null
- primaryColor: string (hex)
- accentColor: string (hex)
- academyName: string
- customDomain: string | null (enterprise only)
- faviconUrl: string | null
- loginBackground: string | null

app/(admin)/configuracoes/marca/page.tsx:
- Upload de logo
- Color picker para cor primária e accent
- Preview em tempo real (mini mockup do app com as cores)
- Custom domain field (enterprise only, instrução de DNS)

Implementação:
- CSS variables injetadas via style tag no RootLayout baseado no branding
- Logo do header/sidebar vem do branding
- Tela de login usa as cores e logo da academia
- Fallback: tema padrão BlackBelt se sem branding

Crie middleware que detecta custom domain e resolve academy_id.
```

---

#### PROMPT P71: Gestão de Unidades

```
Crie app/(admin)/unidades/page.tsx do BlackBelt v2:
CRUD de unidades (multi-sede):
- Lista de unidades com: nome, endereço, qtd turmas, qtd alunos
- Criar nova unidade (modal com form)
- Editar unidade
- Desativar unidade (soft delete, não exclui dados)

Cada unidade pode ter:
- Horário de funcionamento
- Endereço completo
- Telefone
- Professores vinculados
- Turmas vinculadas

Regras:
- Turma pertence a 1 unidade
- Professor pode atuar em N unidades
- Aluno pode frequentar N unidades (se matriculado em turma daquela unidade)
- Admin vê consolidado de todas as unidades

Crie lib/api/units.service.ts + mock.
Adicione seletor de unidade no header do Admin (filtra todo o dashboard).
```

---

#### PROMPT P72: Convite e Gestão de Staff

```
Crie app/(admin)/equipe/page.tsx do BlackBelt v2:
Lista de membros da equipe: nome, role, unidade(s), status, último acesso
Ações: convidar, editar role, desativar, reativar

Fluxo de convite:
1. Admin clica "Convidar membro"
2. Modal: email, role (professor/admin), unidade(s)
3. Sistema envia email com link de convite
4. Convidado clica no link → cadastro pré-preenchido
5. Ao finalizar → membership criada automaticamente

lib/api/invites.service.ts:
- sendInvite(email, role, unitIds) → Invite
- getActiveInvites(academyId) → Invite[]
- acceptInvite(inviteToken) → Profile + Membership
- cancelInvite(inviteId) → void
- resendInvite(inviteId) → void

Invite expira em 7 dias. Reenvio gera novo token.
```

---

## FASE 15 — OPERAÇÕES AVANÇADAS

Features operacionais que uma academia real precisa além do core.

---

#### PROMPT P73: Gestão de Estoque

```
Crie app/(admin)/estoque/page.tsx do BlackBelt v2:
Inventário de produtos da academia:
- Quimonos (por tamanho/cor)
- Faixas (por cor)
- Equipamentos (luvas, caneleiras, etc)
- Materiais (tatame, saco de pancada, etc)

Para cada item:
- Nome, categoria, quantidade atual, estoque mínimo, preço de venda
- Histórico de movimentações (entrada/saída/venda)
- Alerta quando abaixo do mínimo

Venda direta:
- Vincular venda a um aluno
- Adicionar ao financeiro (Invoice avulsa ou junto na mensalidade)

Crie lib/api/inventory.service.ts + mock + domain types.
Insight automático: "Estoque de quimonos M abaixo do mínimo (2 restantes)".
```

---

#### PROMPT P74: Gestão de Espaços e Salas

```
Crie app/(admin)/espacos/page.tsx do BlackBelt v2:
Cadastro de espaços físicos por unidade:
- Nome (ex: "Tatame Principal", "Sala de Musculação", "Sala 2")
- Capacidade máxima
- Equipamentos disponíveis
- Fotos (placeholder)

Vinculação turma → espaço:
- Cada turma é alocada em um espaço
- Conflito: 2 turmas no mesmo espaço no mesmo horário = erro
- Validação integrada com horarios.service

Visualização:
- Timeline por espaço (quem usa quando)
- Ocupação por dia/semana
- Mapa visual simplificado (grid de espaços com status: livre/ocupado/manutenção)

Crie lib/api/spaces.service.ts + mock.
Integre validação de conflito no CRUD de turmas.
```

---

#### PROMPT P75: Contratos Digitais

```
Crie app/(admin)/contratos/page.tsx do BlackBelt v2:
Templates de contrato:
- Matrícula (aluno adulto)
- Matrícula menor (responsável assina)
- Professor (vínculo de prestação de serviço)

Fluxo:
1. Admin seleciona template + aluno
2. Sistema preenche dados automaticamente (nome, CPF, plano, valores)
3. Preview do contrato gerado
4. Envia para assinatura digital (email/whatsapp)
5. Aluno/responsável abre link, lê, assina (canvas signature)
6. Contrato assinado salvo no sistema (PDF)

Crie lib/api/contracts.service.ts:
- generateContract(templateId, studentId) → ContractDTO
- sendForSignature(contractId) → { signatureUrl }
- submitSignature(contractId, signatureData) → SignedContractDTO
- getContracts(studentId) → Contract[]

Mock: gera PDF placeholder com os dados preenchidos.
```

---

#### PROMPT P76: Gestão de Eventos e Seminários

```
Crie app/(admin)/eventos/page.tsx do BlackBelt v2:
CRUD de eventos:
- Nome, data, horário, local (unidade ou externo)
- Tipo: seminário, workshop, graduação, competição, evento social
- Capacidade, preço (grátis ou pago)
- Inscrições abertas/fechadas
- Descrição, imagem (placeholder)

Inscrição:
- Aluno vê eventos em app/(main)/eventos/page.tsx
- Botão "Inscrever-se" (vagas disponíveis visíveis)
- Se pago: redirect para checkout
- Confirmação por email/push

Para o admin:
- Lista de inscritos com check-in no dia
- Export de lista (PDF/Excel)
- Enviar comunicado para inscritos

Crie lib/api/events.service.ts + mock.
Integre no calendário do aluno e no dashboard do admin.
```

---

#### PROMPT P77: Agenda Pessoal do Professor

```
Crie app/(professor)/agenda/page.tsx do BlackBelt v2:
Visão semanal/mensal da agenda do professor:
- Aulas fixas (turmas regulares)
- Aulas particulares (agendáveis)
- Eventos
- Indisponibilidades (férias, folga)

Aulas particulares:
- Professor define horários disponíveis
- Aluno solicita horário
- Professor aprova/rejeita
- Limitado por plano da academia (free: 0, pro: ilimitado)

Crie lib/api/professor-agenda.service.ts:
- getAgenda(professorId, week) → AgendaDTO
- setAvailability(professorId, slots) → void
- requestPrivateLesson(studentId, professorId, slot) → LessonRequest
- approveLesson(requestId) → PrivateLesson
- rejectLesson(requestId, reason) → void

Integre com Google Calendar (sync bidirecional — Phase 18 placeholder).
```

---

## FASE 16 — SOCIAL & COMUNIDADE

Feed de atividades, torneios, desafios, e comunidade entre academias.

---

#### PROMPT P78: Feed de Atividades

```
Crie app/(main)/feed/page.tsx do BlackBelt v2:
Feed tipo Instagram/LinkedIn da academia:
Tipos de post:
- achievement: "João conquistou faixa azul!" (automático)
- class_photo: professor posta foto da turma
- event: "Seminário de Jiu-Jitsu dia 15/04"
- milestone: "A academia completou 500 check-ins este mês!"
- coach_tip: professor compartilha dica técnica
- student_post: aluno compartilha progresso (opcional, moderado)

Cada post: avatar, autor, timestamp, conteúdo, imagem opcional, likes, comentários.
Ações: curtir, comentar, compartilhar (copiar link).
Filtros: todos, conquistas, turma, eventos.

Crie lib/api/feed.service.ts:
- getFeed(academyId, page, filter?) → Post[]
- createPost(data) → Post (professor/admin only para posts manuais)
- likePost(postId) → void
- commentPost(postId, content) → Comment
- getPosts automáticos são gerados por triggers (promoção, conquista, etc)

Mobile: scroll infinito. Desktop: sidebar com trending/destaque.
```

---

#### PROMPT P79: Sistema de Desafios

```
Crie app/(main)/desafios/page.tsx do BlackBelt v2:
Desafios semanais/mensais da academia:
- Título, descrição, período, meta, recompensa (XP + badge)
- Tipos:
  - Presença: "Venha 4x esta semana"
  - Streak: "7 dias consecutivos"
  - Social: "Traga um amigo para aula experimental"
  - Conteúdo: "Assista 3 vídeos da série Fundamentos"
  - Avaliação: "Tire nota 80+ na próxima avaliação"

Para cada desafio:
- Progress bar pessoal (X/Y)
- Ranking de quem está mais perto de completar
- Badge desbloqueado ao completar
- Countdown para fim do desafio

Admin cria desafios em app/(admin)/desafios/page.tsx:
- Template de desafios pré-definidos
- Customização de meta e recompensa
- Ativação/desativação

Crie lib/api/challenges.service.ts + mock.
```

---

#### PROMPT P80: Torneios Internos

```
Crie app/(admin)/torneios/page.tsx do BlackBelt v2:
Organização de torneios internos:
- Criar torneio: nome, data, modalidade, categorias (peso/faixa/idade)
- Inscrição: alunos se inscrevem por categoria
- Chaveamento: geração automática de chaves (single elimination)
- Resultados: input de resultados por luta
- Ranking: pontuação por academia (para torneios entre academias)

app/(main)/torneios/page.tsx:
- Lista de torneios disponíveis
- Inscrição
- Visualização de chave (bracket view)
- Seus resultados

Crie lib/api/tournaments.service.ts:
- create(data) → Tournament
- enroll(tournamentId, studentId, categoryId) → Enrollment
- generateBracket(tournamentId, categoryId) → Bracket
- submitResult(matchId, winnerId, method) → Match
- getRanking(tournamentId) → RankingDTO[]

Bracket view: componente visual de chaveamento (SVG ou HTML grid).
```

---

#### PROMPT P81: Aula Experimental / Indicação

```
Crie fluxo de aula experimental no BlackBelt v2:
app/(public)/aula-experimental/page.tsx:
- Form: nome, email, telefone, modalidade interesse, como conheceu
- Submit → cria lead no sistema
- Redirect → agradecimento + próximos passos

app/(admin)/leads/page.tsx:
- Lista de leads (nome, contato, interesse, data, status)
- Status: novo, contatado, agendado, compareceu, matriculou, desistiu
- Pipeline visual (kanban simplificado)
- Ações: agendar aula, enviar WhatsApp, converter em aluno

Sistema de indicação:
- Aluno compartilha link com código pessoal
- Lead que vem por indicação é tagueado
- Se matricular: aluno ganha XP bonus + badge "Embaixador"
- Admin vê ranking de quem mais indicou

Crie lib/api/leads.service.ts + lib/api/referral.service.ts + mocks.
```

---

#### PROMPT P82: Chat em Grupo (Turma)

```
Evolua o sistema de mensagens do BlackBelt v2:
Novo tipo: chat em grupo por turma.
- Cada turma tem automaticamente um grupo
- Membros: professor + alunos matriculados
- Professor pode enviar mensagens para toda a turma
- Alunos podem responder (se habilitado pelo professor)
- Professor pode silenciar aluno individualmente

app/(professor)/mensagens/page.tsx:
- Nova tab: "Turmas" com lista de grupos
- Chat de grupo com bolhas de diferentes autores
- Botão "Enviar para turma" com preview

app/(main)/mensagens/page.tsx:
- Grupos aparecem na lista de conversas com badge de turma
- Read receipts por mensagem (quem viu)

Evolua lib/api/mensagens.service.ts:
- getGroupMessages(classId, page) → Message[]
- sendGroupMessage(classId, content) → Message
- muteGroupMember(classId, studentId) → void

Crie testes para regras de permissão de grupo.
```

---

## FASE 17 — INTELIGÊNCIA v2

IA como diferencial competitivo. Coach virtual, recomendações, NLP.

---

#### PROMPT P83: Coach IA (Backend)

```
Crie lib/api/ai-coach.service.ts do BlackBelt v2:
Integração com Claude API (Anthropic) para coach virtual:
- getTrainingSuggestion(studentId) → string
  Analisa: frequência, avaliações, faixa, histórico → sugere foco
- analyzePerformance(studentId) → PerformanceAnalysis
  Insights textuais sobre evolução do aluno
- generateClassPlan(professorId, classId) → ClassPlan
  Sugere plano de aula baseado no nível dos alunos da turma
- answerQuestion(studentId, question) → string
  Chatbot que responde dúvidas sobre técnicas, regras, treino

Prompt engineering:
- System prompt com contexto do domínio (artes marciais, faixas, pedagógico)
- User context injetado (dados do aluno, turma, academia)
- Output formatado (JSON para structured data, texto para insights)

Config: ANTHROPIC_API_KEY, AI_MODEL=claude-sonnet-4-20250514
Rate limiting: max 10 requests/hora por aluno, 50/hora por professor.
Mock: respostas pré-definidas sem chamar API real.
```

---

#### PROMPT P84: Coach IA (Frontend)

```
Crie components/ai/CoachChat.tsx do BlackBelt v2:
Widget de chat com o Coach IA:
- Floating button no canto (ícone de coach/brain)
- Click abre drawer lateral (mobile: fullscreen bottom sheet)
- Chat com bubbles (user + coach)
- Typing indicator enquanto IA processa
- Sugestões rápidas: "Como melhorar minha guarda?", "Plano de treino", "Dica do dia"

Integre em:
- app/(main)/: coach para alunos (dicas, treino, dúvidas)
- app/(professor)/: coach para professores (plano de aula, análise de turma)

Contexto automático:
- Aluno: "Sou faixa {cor}, treino {modalidade} há {tempo}, frequência {x/semana}"
- Professor: "Turma {nome}, {N} alunos, nível médio {faixa}, próxima aula {data}"

Histórico de conversa salvo em memória (não persiste entre sessões).
```

---

#### PROMPT P85: Recomendação de Conteúdo

```
Crie lib/api/recommendations.service.ts do BlackBelt v2:
Sistema de recomendação de vídeos/conteúdo:
- getRecommendations(studentId) → Video[]
  Algoritmo baseado em:
  1. Faixa atual (conteúdo compatível)
  2. Avaliações mais baixas (reforçar pontos fracos)
  3. Histórico de visualização (não repetir)
  4. Popularidade na mesma faixa (o que outros da mesma faixa assistem)
  5. Professor sugeriu (flag manual)

- getSimilarContent(videoId) → Video[]
  Baseado em: mesma série, mesmo professor, mesma faixa, mesma modalidade

- getPersonalizedFeed(studentId) → ContentFeed
  Mix: recomendados + novos + trending + "complete a série"

Integre no dashboard do aluno (seção "Para Você").
Integre na página de vídeo (seção "Relacionados" melhorada).
Crie mock com lógica simplificada (sem ML real, regras de scoring).
```

---

#### PROMPT P86: Análise de Sentimento (Mensagens)

```
Crie lib/api/sentiment.service.ts do BlackBelt v2:
Análise básica de sentimento em mensagens do sistema:
- analyzeSentiment(message) → { score: -1..1, label: positive|neutral|negative }
- flagConcerningMessage(messageId) → void (alerta admin)
- getSentimentTrend(academyId, period) → TrendDTO

Uso prático:
- Se aluno manda mensagem negativa para professor → alerta discreto para admin
- Dashboard admin: "Sentimento geral da academia: 78% positivo"
- Trend: satisfação subindo ou caindo ao longo dos meses

Implementação:
- v1: keyword-based (lista de palavras positivas/negativas em PT-BR)
- v2 (futuro): Claude API para análise mais precisa
- Sempre opt-in por academia (LGPD compliance)

Integre insight: "Satisfação dos alunos caiu 10% este mês — verifique mensagens recentes".
```

---

#### PROMPT P87: Geração de Relatório com IA

```
Crie lib/api/ai-reports.service.ts do BlackBelt v2:
Relatórios narrativos gerados por IA:
- generateMonthlyNarrative(academyId, month) → string
  "Em março, a academia teve crescimento de 12% em novos alunos...
   O professor Silva se destacou com 95% de presença média...
   Atenção: 5 alunos estão em risco de churn..."

- generateStudentReport(studentId) → string
  "João está na faixa azul há 4 meses. Sua frequência é de 3x/semana,
   acima da média da turma. Pontos fortes: técnica (88/100).
   Recomendação: focar em disciplina (72/100) para evoluir."

- generateClassReport(classId, month) → string
  Resumo da turma para o professor.

Integre como opção nos relatórios do admin:
- Botão "Gerar relatório com IA" → loading → texto renderizado
- Opção de exportar como parte do PDF

Use Claude API. Mock: textos pré-escritos.
```

---

## FASE 18 — INTERNACIONALIZAÇÃO

i18n, moedas, fuso horário, compliance.

---

#### PROMPT P88: Setup de i18n

```
Configure internacionalização no BlackBelt v2:
Instale: pnpm add next-intl
Idiomas iniciais: pt-BR (default), en-US, es

Estrutura:
messages/pt-BR.json
messages/en-US.json
messages/es.json

Configuração:
- next-intl provider no root layout
- Middleware para detecção de idioma (header Accept-Language + cookie)
- Seletor de idioma no perfil do usuário

Extraia TODAS as strings hardcoded do projeto para os arquivos de mensagem.
Organize por namespace: common, auth, dashboard, classes, financial, etc.

Para cada idioma, traduza:
- Todas as labels de UI
- Mensagens de erro
- Textos de empty state
- Placeholders de input
- Tooltips e helper texts
```

---

#### PROMPT P89: Moeda e Formatação Regional

```
Crie lib/utils/i18n-format.ts do BlackBelt v2:
- formatCurrency(value, currency, locale) → "R$ 150,00" ou "$150.00"
- formatDate(date, locale, format?) → "15/03/2026" ou "03/15/2026"
- formatTime(date, locale) → "14:30" ou "2:30 PM"
- formatNumber(value, locale) → "1.234" ou "1,234"
- formatPhone(phone, country) → "+55 (31) 99999-9999"
- getBeltName(belt, locale) → "Azul" ou "Blue" ou "Azul"

Crie lib/types/regional.ts:
- Currency enum: BRL, USD, EUR
- Timezone handling: academy.timezone define o fuso
- Horários de aula exibidos no fuso da academia, não do browser

Atualize TODOS os componentes que exibem: dinheiro, data, hora, números.
Atualize formatação de fatura (R$, US$, €).
```

---

#### PROMPT P90: Compliance LGPD

```
Crie features de compliance LGPD no BlackBelt v2:
app/(main)/perfil/privacidade/page.tsx:
- Meus dados: lista completa do que o sistema armazena sobre o usuário
- Exportar meus dados: botão que gera JSON/PDF com todos os dados pessoais
- Excluir minha conta: fluxo de exclusão com confirmação dupla + período de arrependimento (30 dias)
- Consentimentos: lista de consentimentos dados (marketing, analytics, comunicação)
- Revogar consentimentos individualmente

Crie lib/api/privacy.service.ts:
- getMyData(userId) → UserDataExport (JSON com todos os dados)
- requestDeletion(userId) → DeletionRequest (agenda exclusão em 30 dias)
- cancelDeletion(userId) → void
- getConsents(userId) → Consent[]
- updateConsent(userId, type, granted) → void

Banner de cookies no primeiro acesso.
Termos de uso e política de privacidade: app/(public)/termos e app/(public)/privacidade.
Registro de consentimento com timestamp para auditoria.
```

---

#### PROMPT P91: Fuso Horário Multi-Timezone

```
Configure suporte a múltiplos fusos horários no BlackBelt v2:
- Cada academy tem um timezone (ex: America/Sao_Paulo)
- Todas as datas no banco são UTC
- Conversão para timezone da academia acontece na UI
- Se aluno viaja, ele vê horário da academia (não do seu browser)

Crie lib/utils/timezone.ts:
- toAcademyTime(utcDate, academyTimezone) → Date
- toUTC(localDate, academyTimezone) → Date
- formatInAcademyTime(utcDate, academyTimezone, locale) → string
- isClassHappeningNow(classSchedule, academyTimezone) → boolean
- getNextClassTime(classSchedule, academyTimezone) → Date

Atualize TODOS os componentes que exibem horários:
- Grade horária
- Próxima aula
- Histórico de presença
- Timestamps de mensagens
- Datas de fatura
```

---

#### PROMPT P92: Multi-Idioma nos Emails e Templates

```
Atualize todos os email templates e notificações do BlackBelt v2 para suportar i18n:
- Cada template existe em pt-BR, en-US, es
- Idioma selecionado baseado no perfil do usuário
- Fallback: idioma da academia → pt-BR

Atualize lib/api/notification-hub.service.ts:
- Resolver idioma do destinatário antes de enviar
- Selecionar template correto
- Formatar datas/valores no idioma certo

Atualize templates WhatsApp:
- Templates precisam ser aprovados por idioma no Meta
- Manter mapeamento: template_name → { pt: "xxx", en: "yyy", es: "zzz" }

Atualize PDFs de relatório e contrato:
- Header/footer no idioma da academia
- Formatação de moeda/data regional
```

---

## FASE 19 — ENTERPRISE

API pública, webhooks, SSO, audit log, SLA. Para redes grandes de academias.

---

#### PROMPT P93: API Pública (REST)

```
Crie app/api/v1/ do BlackBelt v2:
API REST pública para integrações externas:
Endpoints:
- /api/v1/students (CRUD)
- /api/v1/classes (CRUD)
- /api/v1/attendance (read + create)
- /api/v1/invoices (read)
- /api/v1/plans (read)
- /api/v1/events (read)

Autenticação: API Key por academia (header X-API-Key)
Rate limiting: 100 req/min por key
Paginação: cursor-based (next_cursor)
Filtros: query params padronizados (?status=active&limit=20)
Respostas: JSON:API-like (data, meta, links)
Versionamento: /v1/ no path

Crie lib/api/api-keys.service.ts:
- generateApiKey(academyId) → { key, secret }
- revokeApiKey(keyId) → void
- listApiKeys(academyId) → ApiKey[]
- validateApiKey(key) → { academyId, permissions }

Crie app/(admin)/integrações/api/page.tsx:
- Listar API keys
- Gerar nova key (mostra uma vez, depois hash)
- Revogar key
- Documentação inline dos endpoints
```

---

#### PROMPT P94: Webhooks Outgoing

```
Crie sistema de webhooks outgoing do BlackBelt v2:
Admin configura URLs para receber eventos:
- student.created, student.updated
- attendance.created
- invoice.created, invoice.paid, invoice.overdue
- progression.created (promoção de faixa)
- subscription.created, subscription.cancelled

lib/api/webhooks-outgoing.service.ts:
- registerWebhook(academyId, url, events[]) → Webhook
- listWebhooks(academyId) → Webhook[]
- deleteWebhook(webhookId) → void
- testWebhook(webhookId) → TestResult

Delivery:
- POST com payload JSON + signature HMAC-SHA256
- Retry: 3 tentativas com backoff (1min, 5min, 30min)
- Log de delivery com status (success, failed, pending)
- Dead letter queue após 3 falhas

app/(admin)/integrações/webhooks/page.tsx:
- Lista de webhooks configurados
- Adicionar novo
- Log de entregas recentes (status, timestamp, response code)
- Botão "Testar" que envia payload de exemplo
```

---

#### PROMPT P95: SSO (Single Sign-On)

```
Crie suporte a SSO no BlackBelt v2 (Enterprise only):
Providers:
- Google Workspace
- Microsoft Azure AD
- SAML 2.0 genérico

lib/api/sso.service.ts:
- getSSOConfig(academyId) → SSOConfig | null
- initSSOLogin(provider, academyId) → { redirectUrl }
- handleSSOCallback(provider, code) → { user, profile, tokens }
- linkSSOAccount(userId, provider, externalId) → void
- unlinkSSOAccount(userId, provider) → void

app/(admin)/configuracoes/sso/page.tsx:
- Toggle SSO on/off
- Configurar provider (client ID, secret, tenant)
- Testar conexão
- Mapear roles: grupo do provider → role no BlackBelt
- Opção: "Forçar login via SSO" (desabilita login com senha)

Login page:
- Se academia tem SSO: mostrar botão "Entrar com [provider]"
- Se SSO forçado: esconder formulário de email/senha
```

---

#### PROMPT P96: Audit Log

```
Crie sistema de audit log do BlackBelt v2:
Registra TODA ação sensível no sistema:
- Auth: login, logout, password_change, mfa_enable
- CRUD: create, update, delete em qualquer entidade
- Financial: payment, refund, plan_change
- Admin: role_change, invite, deactivate, config_change
- Access: content_view, report_export, data_export

Schema:
audit_logs(id, academy_id, actor_id, action, entity_type, entity_id, 
  old_data JSONB, new_data JSONB, ip_address, user_agent, created_at)

lib/api/audit.service.ts:
- log(action, entityType, entityId, oldData?, newData?) → void (fire-and-forget)
- search(academyId, filters) → AuditLog[] (paginado)
- getEntityHistory(entityType, entityId) → AuditLog[]

app/(admin)/configuracoes/audit-log/page.tsx:
- Timeline de ações com filtros (tipo, ator, período, entidade)
- Click expande: mostra diff do old_data → new_data
- Export (CSV)
- Retenção configurável (30/90/365 dias)

Integre chamadas de audit.log() em TODOS os services existentes (create, update, delete).
```

---

#### PROMPT P97: Multi-Academy Admin (Rede)

```
Crie app/(network)/page.tsx do BlackBelt v2:
Dashboard de rede (para quem administra múltiplas academias):
- Visão consolidada: total alunos, receita, presença de TODAS as academias
- Comparativo entre academias (tabela + gráficos)
- Ranking de academias por métrica
- Drill-down: click na academia abre o dashboard individual

lib/api/network.service.ts:
- getNetworkDashboard(ownerId) → NetworkDashboardDTO
- getAcademyComparison(academyIds, metric) → ComparisonDTO
- getNetworkFinancials(ownerId) → ConsolidatedFinancials
- transferStudent(studentId, fromAcademy, toAcademy) → void

Funcionalidades:
- Transferir aluno entre academias da rede
- Professor compartilhado (atua em N academias)
- Plano corporativo (1 assinatura para toda a rede)
- Template de turma replicável entre academias

Acesso: owner que possui 2+ academias.
```

---

## FASE 20 — GROWTH & OTIMIZAÇÃO

Landing page, SEO, referral, A/B testing, observabilidade de produção.

---

#### PROMPT P98: Landing Page Pública

```
Crie app/(public)/page.tsx do BlackBelt v2:
Landing page de marketing da plataforma:
Hero: headline + subheadline + CTA "Cadastre sua academia grátis"
Seção: 3-4 features principais com ícones e descrição
Seção: Planos e preços (Free/Pro/Enterprise)
Seção: Depoimentos (placeholder com citação + nome + academia)
Seção: "Como funciona" (3 steps visuais)
Seção: FAQ (accordion)
Footer: links, redes sociais, copyright

Design: premium, dark theme, animações de scroll (CSS only).
100% SSG (static generation) para SEO.
Mobile-first, responsivo, LCP < 2s.

Crie também:
- app/(public)/sobre/page.tsx
- app/(public)/contato/page.tsx (form → salva como lead)
- app/(public)/blog/page.tsx (placeholder para futuro CMS)
```

---

#### PROMPT P99: SEO Avançado

```
Otimize SEO do BlackBelt v2:
Metadata dinâmica:
- generateMetadata() em CADA page.tsx com title, description, og tags
- Títulos: "BlackBelt | [Page Name]" padrão
- Descriptions únicas por página
- OG images (placeholder genérica por enquanto)

Arquivos:
- app/robots.ts → gera robots.txt dinâmico
- app/sitemap.ts → gera sitemap.xml com todas as páginas públicas
- app/manifest.ts → Web App Manifest atualizado

Structured data (JSON-LD):
- Organization (homepage)
- SoftwareApplication (landing page)
- FAQPage (FAQ)
- BreadcrumbList (navegação)

Performance:
- Todas as imagens com next/image
- Font optimization com next/font/google (Inter)
- Preconnect para Supabase e CDN
```

---

#### PROMPT P100: Sistema de Referral

```
Crie sistema de indicação entre academias no BlackBelt v2:
Fluxo:
1. Academia (admin) compartilha link com código: blackbelt.com/r/CODIGO
2. Nova academia se cadastra pelo link
3. Ao ativar plano Pro: academia que indicou ganha 1 mês grátis
4. Dashboard mostra: indicações feitas, convertidas, créditos ganhos

lib/api/referral-b2b.service.ts:
- getReferralCode(academyId) → string
- getReferralStats(academyId) → ReferralStatsDTO
- applyReferralCredit(academyId) → void
- trackReferralClick(code) → void

app/(admin)/indicar/page.tsx:
- Código de indicação copiável
- Link compartilhável (WhatsApp, email)
- Stats: X indicações, Y convertidas, Z meses de crédito
- Lista de academias indicadas (status)

Banner no dashboard: "Indique uma academia e ganhe 1 mês grátis!"
```

---

#### PROMPT P101: Observabilidade de Produção

```
Configure observabilidade completa do BlackBelt v2:
Sentry (ativação real):
- Instale @sentry/nextjs
- Configure sentry.client.config.ts e sentry.server.config.ts (ativar stubs)
- Source maps upload no build
- Error boundaries em cada route group
- Performance tracing (transactions)
- Session replay (1% sample)

Logging:
- Estruturado em JSON para todos os API routes
- Correlation ID por request
- Log de performance de queries Supabase
- Alertas: error rate > 1%, latency > 2s, 5xx > 0

Uptime monitoring:
- /api/health endpoint (checks: app ok, supabase ok, latency)
- Integração com UptimeRobot ou similar (external)

Dashboard de status:
- app/(admin)/sistema/page.tsx
- Últimos erros (Sentry feed)
- Tempo de resposta médio
- Uptime
```

---

#### PROMPT P102: Documentação Técnica Final

```
Crie documentação técnica completa do BlackBelt v2:
docs/ARCHITECTURE.md:
- Visão geral da arquitetura
- Diagrama de componentes (mermaid)
- Stack com justificativas
- Padrões adotados (contract-first, mock-driven, etc)
- Decisões de trade-off

docs/API.md:
- Documentação da API pública v1
- Exemplos de request/response
- Autenticação
- Rate limits
- Webhooks

docs/DEPLOYMENT.md:
- Como fazer deploy (Vercel + Supabase)
- Variáveis de ambiente necessárias
- Checklist de produção
- Rollback procedure

docs/CONTRIBUTING.md:
- Como contribuir
- Padrões de código
- Fluxo de PR
- Convenção de commits

Atualize README.md com overview atualizado do projeto completo.
Atualize CLAUDE.md com todas as novas convenções e services.

FIM DO ROADMAP — BlackBelt v2 é agora um produto SaaS completo e competitivo.
```

---

## Resumo Executivo

| Fase | Prompts | Deliverables | Dependência |
|------|---------|-------------|-------------|
| 11 - Inteligência v1 | P53–P57 | Analytics, insights, relatórios PDF, métricas | Fases 0–10 |
| 12 - Pagamentos | P58–P62 | Gateway real, webhook, checkout, régua cobrança | Fase 11 |
| 13 - Comunicação | P63–P67 | WhatsApp, email, preferências, automações | Fase 12 |
| 14 - Multi-Tenant Pro | P68–P72 | Onboarding, planos plataforma, white-label, convites | Fase 13 |
| 15 - Operações | P73–P77 | Estoque, espaços, contratos, eventos, agenda | Fase 14 |
| 16 - Social | P78–P82 | Feed, desafios, torneios, leads, chat grupo | Fase 15 |
| 17 - IA v2 | P83–P87 | Coach IA, recomendação, sentimento, relatório IA | Fase 16 |
| 18 - i18n | P88–P92 | Multi-idioma, moedas, LGPD, timezone | Fase 17 |
| 19 - Enterprise | P93–P97 | API pública, webhooks, SSO, audit, rede | Fase 18 |
| 20 - Growth | P98–P102 | Landing, SEO, referral, observabilidade, docs | Fase 19 |

---

> **50 prompts. 10 fases. Do MVP ao SaaS competitivo.**
> Inteligência artificial, pagamentos reais, escala multi-tenant, e comunidade.
> O BlackBelt deixa de ser app e vira plataforma.
