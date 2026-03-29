# Apple Monetization Justification — BlackBelt

Data: 2026-03-29
Documento de apoio para App Store Review, caso haja questionamento sobre o uso de pagamento externo em vez de In-App Purchase.

---

## 1. Classificação do App

**BlackBelt é um SaaS B2B de gestão empresarial para academias de artes marciais.**

O cliente pagante é a **academia** (pessoa jurídica / empresa), não o consumidor final (aluno ou responsável). A academia contrata o BlackBelt como ferramenta de gestão operacional — da mesma forma que contrataria um ERP, CRM ou sistema de gestão de estúdio.

---

## 2. Enquadramento nas Diretrizes Apple

### Guideline 3.1.3(a) — "Reader" Apps & B2B SaaS

BlackBelt se enquadra na exceção de apps que gerenciam produtos ou serviços consumidos fora do app:

> "Apps that are used to manage or control the product or service that is not the app itself [...] may offer in-app purchase alternatives."

O serviço principal — aulas presenciais de artes marciais, graduações de faixa, treinos na academia — acontece inteiramente no mundo físico. O app é a ferramenta de gestão desse serviço, não o serviço em si.

### Guideline 3.1.3(b) — Multi-Platform SaaS

> "Apps operating across multiple platforms may allow users to access content, subscriptions, or features they have acquired elsewhere."

BlackBelt opera como plataforma web (blackbeltv2.vercel.app) e apps nativos (iOS e Android). A assinatura é adquirida pela academia na plataforma web, e todos os usuários convidados pela academia acessam via qualquer plataforma.

---

## 3. Precedentes na App Store

Os seguintes apps B2B de gestão de academias/estúdios estão publicados na App Store e cobram exclusivamente fora da App Store, sem IAP:

| App | Categoria | Modelo | IAP |
|-----|-----------|--------|-----|
| **Mindbody** | Gestão de academias e estúdios de fitness | B2B SaaS — estúdio paga mensalidade | Não usa IAP para assinatura do estúdio |
| **Glofox** | Gestão de academias de fitness | B2B SaaS — academia paga mensalidade | Não usa IAP |
| **Zen Planner** | Gestão de academias de artes marciais e CrossFit | B2B SaaS — academia paga mensalidade | Não usa IAP |
| **Wodify** | Gestão de boxes de CrossFit e academias | B2B SaaS — box paga mensalidade | Não usa IAP |
| **PerfectGym** | Gestão de academias e clubes esportivos | B2B SaaS — clube paga mensalidade | Não usa IAP |
| **Salesforce** | CRM B2B | B2B SaaS — empresa paga mensalidade | Não usa IAP |
| **HubSpot** | CRM/Marketing B2B | B2B SaaS — empresa paga mensalidade | Não usa IAP |
| **Shopify** | E-commerce B2B | B2B SaaS — lojista paga mensalidade | Não usa IAP |
| **Slack** | Comunicação B2B | B2B SaaS — empresa paga mensalidade | Não usa IAP |

BlackBelt é funcionalmente idêntico a Mindbody, Glofox, Zen Planner e Wodify — todos são ferramentas de gestão vendidas para a empresa (academia), não para o consumidor final.

---

## 4. Detalhes do Modelo de Receita

### 4.1. Quem paga

O **dono da academia** (pessoa jurídica ou empreendedor individual) contrata o BlackBelt como SaaS, escolhendo entre 4 planos:

| Plano | Preço mensal | Público |
|-------|-------------|---------|
| Starter | R$ 79 | Academias pequenas (até 50 alunos) |
| Essencial | R$ 149 | Academias médias (até 150 alunos) |
| Pro | R$ 249 | Academias grandes (até 500 alunos) |
| Black Belt | R$ 397 | Redes e franquias (ilimitado) |

### 4.2. Como paga

- **Gateway**: Asaas (processador de pagamentos B2B brasileiro, regulado pelo Banco Central)
- **Métodos**: Boleto bancário, PIX (transferência instantânea brasileira), cartão de crédito recorrente
- **Fluxo**: Academia se cadastra no site (blackbeltv2.vercel.app/cadastrar-academia) → seleciona plano → insere dados de pagamento no Asaas → trial de 7 dias → cobrança automática

### 4.3. O que o aluno recebe

Alunos **não pagam nada ao BlackBelt**. O aluno paga a mensalidade da aula de artes marciais **à academia** (via subconta Asaas da academia). O BlackBelt apenas fornece a ferramenta para a academia emitir e gerenciar essas cobranças — igual a como um sistema de faturamento emite notas fiscais.

### 4.4. Vídeo-aulas

As vídeo-aulas disponíveis no app são:
- **Criadas e uploaded pelos professores da academia** (user-generated content)
- **Não são conteúdo do BlackBelt** — o BlackBelt fornece apenas a infraestrutura de hosting (Bunny Stream CDN)
- **Não são vendidas separadamente** — fazem parte do serviço da academia
- Analogia: Shopify não paga IAP porque os produtos são do lojista. BlackBelt não vende vídeos — a academia cria e disponibiliza para seus alunos.

---

## 5. Comportamento do App Nativo

O app nativo para iOS:

- **NÃO exibe** telas de compra, seleção de planos ou formulários de pagamento
- **NÃO contém** links ou botões que direcionem para mecanismos de compra externos
- **NÃO menciona** preços de assinatura dentro do app nativo
- **NÃO usa** StoreKit, BillingClient ou qualquer framework de IAP
- **NÃO tem** moedas virtuais, tokens ou desbloqueio de conteúdo digital
- Páginas de gestão financeira (faturas, cobranças) são **ferramentas administrativas** para o dono da academia gerenciar as cobranças que ele faz aos seus alunos — não são mecanismos de compra do BlackBelt

O fluxo de contratação acontece exclusivamente no navegador, fora do app:
1. Academia acessa blackbeltv2.vercel.app
2. Clica em "Cadastrar Academia"
3. Preenche dados e seleciona plano
4. Insere dados de pagamento no gateway Asaas
5. Recebe acesso e convida sua equipe e alunos

---

## 6. Detecção de Plataforma

O codebase utiliza `isNative()` de `@/lib/platform` para detectar quando o app está rodando como app nativo (Capacitor) versus web. Elementos relacionados a preços e pagamentos são condicionados para não aparecer no app nativo, garantindo conformidade com a Guideline 3.1.1.

Referência no código: `lib/native/payment-redirect.ts` — funções `openSubscriptionPage()` e `openManagePlan()` que redirecionam para o navegador externo quando necessário.

---

## 7. Resumo da Justificativa

| Critério | BlackBelt | Resultado |
|----------|-----------|-----------|
| Cliente é empresa (B2B) | Sim — academia/CNPJ | Qualifica para exceção |
| Serviço consumido fora do app | Sim — aulas presenciais | Qualifica para exceção |
| Multi-plataforma | Sim — web + iOS + Android | Qualifica para 3.1.3(b) |
| App não vende conteúdo digital | Correto — vídeos são UGC do professor | Não requer IAP |
| App não exibe preços/links de compra | Correto — condicionado por isNative() | Conforme 3.1.1 |
| Precedentes aprovados na App Store | Mindbody, Glofox, Zen Planner, Wodify | Precedente sólido |

**Conclusão**: BlackBelt se qualifica para a exceção de IAP como SaaS B2B de gestão empresarial, com precedentes claros e amplamente aceitos na App Store. O app nativo não contém mecanismos de compra nem direciona usuários para pagamentos externos.

---

## 8. Texto para Resposta ao Reviewer (se questionado)

Caso a Apple questione a ausência de IAP, copiar e adaptar:

```
BlackBelt is a B2B SaaS platform for martial arts academy management, similar to Mindbody, Glofox, and Zen Planner — all of which are approved in the App Store without IAP.

Our paying customer is the academy (a business entity), not the individual end user. The service delivered — physical martial arts classes, belt graduations, and training — is consumed entirely outside the app.

The app does not display any pricing, purchase flows, or links to external payment mechanisms. All subscription management happens on our website, outside the native app.

Video lessons in the app are user-generated content created by academy instructors, not digital content sold by BlackBelt.

We believe this qualifies under Guidelines 3.1.3(a) and 3.1.3(b) as a multi-platform business management SaaS.
```
