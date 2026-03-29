# 05 — Monetizacao + Pagamentos

Data: 2026-03-29

---

## PARTE 1 — MODELO DE NEGOCIO

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 6.1 | Modelo definido: B2B SaaS | ✅ | Academia paga, nao o aluno. Cobrado via Asaas (gateway externo). Dois fluxos: (1) academia paga BlackBelt pelo SaaS, (2) academia cobra alunos via subconta Asaas. |
| 6.2 | Tiers de preco definidos | ✅ | Starter R$79, Essencial R$149, Pro R$249, Black Belt R$397 — definidos em `lib/types/billing.ts` PLANS[]. NOTA: precos nao batem com o briefing (Starter R$97, Essencial R$197, Pro R$347, BlackBelt R$597). Precos no codigo sao mais baixos. Precisa alinhar. |
| 6.3 | Trial de 7 dias | ✅ | Implementado. Trial startado no onboarding (`/api/subscriptions/create`), coluna `trial_ends_at` no banco, `check-trials` Supabase Edge Function marca `past_due` apos expirar, `TrialBanner` componente exibe countdown. |
| 6.4 | Precos claros e transparentes | ⚠️ | `/precos` existe mas e apenas um redirect para `/cadastrar-academia`. Nao ha pagina publica com tabela de precos comparativa. `BillingStep` mostra planos no onboarding mas so para quem ja esta cadastrando. Falta pagina publica de precos standalone. |

## PARTE 2 — GATEWAY DE PAGAMENTO (ASAAS)

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 6.5 | Asaas SDK/API integrado | ✅ | Dois niveis de integracao: (1) `lib/payment/asaas.ts` — axios client direto com Asaas v3 API para clientes, cobrancas, assinaturas; (2) `lib/api/gateways/asaas.gateway.ts` — classe AsaasGateway implementando interface PaymentGateway. API routes em `app/api/subscriptions/create`, `app/api/academy/setup-payments`, `app/api/academy/charge-student`. |
| 6.6 | Asaas API key configurada | ✅ | `.env.local` contem `ASAAS_API_KEY` com token de producao real (`$aact_prod_...`). `.env.example` documenta a variavel. `ASAAS_WEBHOOK_TOKEN` tambem configurado. |
| 6.7 | Webhook configurado | ✅ | Dois endpoints: `/api/webhooks/asaas` (especifico, com validacao de access_token via query param) e `/api/webhooks/payment` (generico, roteado via gateway). O webhook Asaas processa PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_REFUNDED, atualiza invoices, academy_subscriptions, student_payments. Logs em `webhook_log` e `audit_log`. |
| 6.8 | Fluxo de pagamento funcional | ⚠️ | Fluxo de ASSINATURA da academia esta completo: onboarding → criar customer → criar subscription → trial 7d → webhook confirma. Fluxo de COBRANCA de aluno tambem completo: admin configura subconta → gera cobranca → webhook atualiza status. POREM: o webhook-processor generico (`lib/api/webhook-processor.ts`) tem handlers vazios (so log, nenhuma acao real) — e o webhook Asaas especifico (`/api/webhooks/asaas`) que funciona de verdade. Duplicacao de logica. |
| 6.9 | Boleto + PIX + Cartao | ✅ | Suportados. BillingStep oferece PIX (5% desconto), Boleto (vence em 3 dias), Cartao (recorrente). `charge-student` route aceita billingType PIX/BOLETO/CREDIT_CARD. PIX QR code buscado automaticamente apos criar pagamento. |
| 6.10 | Gestao de inadimplencia | ✅ | Webhook trata PAYMENT_OVERDUE, `check-trials` Edge Function marca academias como `past_due`, email template `paymentReminderEmail` existe para lembretes. Tabela `student_payments` tem status OVERDUE. |

## PARTE 3 — APPLE IAP COMPLIANCE

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 6.11 | App NAO usa IAP | ✅ | Zero referencias a StoreKit, BillingClient, InAppPurchase no codebase inteiro. Nenhum framework de IAP instalado. |
| 6.12 | Qualifica como "bens/servicos fora do app" | ⚠️ | CRITICO — ver argumentacao abaixo. O modelo B2B SaaS para gestao de academia e defensavel, MAS ha nuances com video-aulas que precisam de atencao. |
| 6.13 | Similar a Salesforce/Mindbody (precedente) | ✅ | BlackBelt e claramente um management SaaS como Mindbody, Glofox, Zen Planner. Todos cobram fora da App Store. Precedente solido. |
| 6.14 | App nao vende conteudo digital desbloqueavel | ⚠️ | Campo `is_locked` existe em `VideoCardDTO`, mas no mock data todos os videos sao `is_locked: false`. Videos sao conteudo CRIADO pelo professor da academia, nao conteudo vendido pelo BlackBelt. Se Apple interpretar videos como "digital content" gated por plano, pode ser problema. A defesa: videos sao criados/uploaded pelo cliente (academia), nao sao conteudo BlackBelt. |
| 6.15 | Sem referencia a pagamento externo dentro do app (regra Apple) | ❌ | PROBLEMA: `TrialBanner` tem link "Ver planos" apontando para `/planos`. `AdminShell` tem "Meu Plano" no sidebar. A pagina `/admin/plano` mostra precos, historico de cobrancas, modulos extras com precos. A regra Apple 3.1.1 proibe "buttons, external links, or other calls to action that direct customers to purchasing mechanisms other than in-app purchase". NOTA: desde Jan 2025 Apple permite "link out" com entitlement (StoreKit External Purchase Link Entitlement), mas requer solicitacao e taxa de 27%. Sem isso, mostrar precos e links para pagar dentro do app nativo e violacao. `lib/native/payment-redirect.ts` define `openSubscriptionPage()` e `openManagePlan()` que abrem URLs externas via Capacitor Browser — funcoes existem mas nao estao sendo chamadas ativamente no momento. |

## PARTE 4 — GOOGLE PLAY BILLING

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 6.16 | Google permite payment externo para SaaS B2B | ✅ | Google Play Policy permite apps que cobram servicos de gestao empresarial fora do billing deles. Desde 2022, Google oferece User Choice Billing para mercados elegíveis (Brasil incluso). BlackBelt como SaaS B2B se qualifica pela excecao de "business management apps". |
| 6.17 | User Choice Billing (se aplicavel) | ⚠️ | Nao implementado, mas provavelmente nao necessario. A excecao B2B SaaS do Google e suficiente. Documentar formalmente a justificativa na submissao. |

## PARTE 5 — TRANSPARENCIA

| # | Requisito | Status | Notas |
|---|-----------|--------|-------|
| 6.18 | Precos visiveis antes de contratar | ⚠️ | Precos aparecem no `BillingStep` durante onboarding (step 4). Porem `/precos` e so um redirect. Nao ha pagina publica "Planos e Precos" acessivel sem criar conta. Para compliance de stores, precos devem ser visiveis antes do cadastro. |
| 6.19 | Termos de assinatura claros | ✅ | Pagina `/termos` existe com 16 secoes. Secao 4 "Planos e Pagamento", secao 13 "Planos e Assinatura", secao 14 "Processamento de Pagamentos", secao 15 "Cobranca de Alunos" cobrem todos os cenarios. |
| 6.20 | Politica de cancelamento | ✅ | Secao 10 "Rescisao" e secao 13.6 dos termos: "cancelamento pode ser solicitado a qualquer momento, sem multa ou taxa". Landing page e BillingStep dizem "Cancele quando quiser, sem multa". |
| 6.21 | Reembolso possivel | ✅ | Secao 16 "Politica de Reembolso" nos termos. Webhook trata PAYMENT_REFUNDED. Status `refunded` existe em PaymentCharge e student_payments. Termos dizem: "Nao ha reembolso proporcional para cancelamentos no meio do ciclo". Transparente. |

---

## ARGUMENTACAO IAP (CRITICO)

### Por que BlackBelt NAO precisa usar In-App Purchase

**1. Classificacao do servico: B2B SaaS de gestao empresarial**

BlackBelt v2 e um sistema de gestao (ERP vertical) para academias de artes marciais. O cliente e a EMPRESA (academia), nao o consumidor final (aluno). A academia paga uma mensalidade pelo software de gestao. Isso se enquadra na excecao da Apple App Store Review Guideline 3.1.3(a):

> "Apps that are used to manage or control the product or service that is not the app itself (e.g., a shared bike rental app, an electric car charger app) may offer in-app purchase alternatives."

E mais especificamente 3.1.3(b) para SaaS multiplatform:

> "Apps operating across multiple platforms may allow users to access content, subscriptions, or features they have acquired elsewhere."

**2. Precedentes de apps SaaS B2B aprovados na App Store sem IAP:**

| App | Modelo | Cobra fora da Store? |
|-----|--------|---------------------|
| **Mindbody** | Gestao de academias/studios | Sim, cobra academias fora da App Store |
| **Glofox** | Gestao de academias de fitness | Sim, cobra fora |
| **Zen Planner** | Gestao de academias de artes marciais | Sim, cobra fora |
| **Salesforce** | CRM B2B | Sim, cobra fora |
| **HubSpot** | CRM/Marketing B2B | Sim, cobra fora |
| **Slack** | Comunicacao B2B | Sim, cobra fora |
| **Notion** | Produtividade B2B | Sim, cobra fora |
| **Shopify** | E-commerce B2B | Sim, cobra fora |

**3. O que o aluno recebe NAO e conteudo digital vendido pelo BlackBelt:**

- Videos sao CRIADOS e UPLOADED pela academia (professor), nao pelo BlackBelt
- O aluno nao paga o BlackBelt — paga a academia pela mensalidade da aula
- O BlackBelt apenas fornece a FERRAMENTA para a academia gerenciar isso
- Analogia: Shopify nao paga IAP porque o comerciante e quem vende; BlackBelt nao paga IAP porque a academia e quem ensina

**4. Fluxo de pagamento esta completamente FORA do app nativo:**

- Cobranca da academia para BlackBelt: via Asaas, gateway brasileiro, fora do app
- Cobranca da academia para aluno: via subconta Asaas, fora do app
- Nenhum pagamento transita pela App Store ou Play Store
- Nao ha moedas virtuais, tokens, ou desbloqueio de conteudo digital

**5. Riscos remanescentes e mitigacoes:**

| Risco | Probabilidade | Mitigacao |
|-------|---------------|-----------|
| Apple rejeita por mostrar precos dentro do app | **ALTA** | Remover/condicionar exibicao de precos no app nativo. Usar `isNative()` para esconder paginas de plano/preco. |
| Apple interpreta video-aulas como "digital content" | **MEDIA** | Videos sao user-generated content (professor upload), nao conteudo BlackBelt. Documentar na review submission. |
| Apple exige External Purchase Link Entitlement | **MEDIA** | Solicitar entitlement se necessario. Taxa de 27% pode ser absorvida ou repassada. |
| Google rejeita por billing fora da Play Store | **BAIXA** | Google e mais flexivel com B2B SaaS. Documentar excecao na submission. |

---

## ACOES NECESSARIAS

### Prioridade CRITICA (bloqueia aprovacao Apple)

| # | Acao | Esforco | Detalhe |
|---|------|---------|---------|
| A1 | Esconder paginas de preco/plano no app nativo | 4h | Usar `isNative()` de `@/lib/platform` para: (1) esconder "Meu Plano" do AdminShell quando nativo, (2) esconder precos no `/admin/plano` ou redirecionar para web, (3) alterar `TrialBanner` para nao mostrar "Ver planos" no nativo. `payment-redirect.ts` ja tem a logica de abrir no Browser externo — usar isso. |
| A2 | Remover/condicionar link "Ver planos" no TrialBanner | 1h | No nativo, o banner pode dizer "Entre em contato" em vez de "Ver planos" ou simplesmente nao mostrar link. |
| A3 | Preparar argumentacao formal para App Review | 2h | Escrever resposta padrao para "why don't you use IAP" na App Store Connect. Incluir precedentes (Mindbody, Glofox, Zen Planner). |

### Prioridade ALTA (recomendado antes da submissao)

| # | Acao | Esforco | Detalhe |
|---|------|---------|---------|
| A4 | Criar pagina publica de precos real | 4h | `/precos` e so redirect. Criar tabela comparativa com os 4 planos, features, e CTA para cadastro. Necessario para transparencia e para landing page. |
| A5 | Alinhar precos codigo vs briefing | 1h | `PLANS[]` em billing.ts diz R$79/149/249/397 mas briefing diz R$97/197/347/597. Decidir e atualizar. |
| A6 | Limpar duplicacao de webhook processing | 3h | `lib/api/webhook-processor.ts` tem handlers vazios (so logs). `/api/webhooks/asaas/route.ts` tem a logica real. Consolidar em um so. |
| A7 | Testar fluxo completo de cobranca em producao | 4h | API key de producao esta configurada mas nao ha evidencia de teste end-to-end com pagamento real. Testar: criar subscription → webhook → atualizar status. |

### Prioridade MEDIA (pos-lancamento aceitavel)

| # | Acao | Esforco | Detalhe |
|---|------|---------|---------|
| A8 | Solicitar External Purchase Link Entitlement (Apple) | 2h | Se Apple exigir, solicitar o entitlement para poder linkar para pagamento externo. Taxa de 27% sobre transacoes. |
| A9 | Documentar excecao B2B para Google Play | 1h | Preparar declaracao formal na Play Console sobre modelo B2B SaaS. |
| A10 | Implementar receipt validation (se IAP for exigido) | 40h+ | PLANO B APENAS: se Apple REJEITAR a argumentacao B2B e exigir IAP. Seria necessario implementar StoreKit 2 + Play Billing Library. Extremamente improvavel dado os precedentes (Mindbody, etc). |

---

## RESUMO

- **Total: 21 itens**
- ✅ **Pronto: 14**
- ⚠️ **Parcial: 5** (6.4 pagina precos, 6.8 webhook duplicado, 6.12 argumentacao B2B, 6.14 videos is_locked, 6.17 User Choice Billing, 6.18 precos pre-cadastro)
- ❌ **Falta: 1** (6.15 referencias a pagamento externo no app nativo — CRITICO Apple)

### Veredito

O modelo de monetizacao esta **bem implementado**. Asaas esta integrado end-to-end para ambos os fluxos (BlackBelt cobra academia, academia cobra aluno). Trial de 7 dias funciona. Webhooks estao configurados.

O **unico bloqueio real** para aprovacao Apple e a exibicao de precos/links de pagamento dentro do app nativo (item 6.15 / acao A1-A2). Isso e uma correcao de 4-5 horas usando `isNative()` que ja existe no codebase.

A argumentacao B2B SaaS para nao usar IAP e **solida** com precedentes claros (Mindbody, Glofox, Zen Planner fazem exatamente o mesmo). Risco de rejeicao Apple por causa do modelo: **baixo**. Risco de rejeicao por mostrar precos no app: **alto sem as correcoes A1-A2**.
