# BlackBelt Store Metadata Master

Data: 2026-04-01
Base: código validado nesta sessão

## Identidade verificada

| Campo | Valor |
|---|---|
| App name | `BlackBelt` |
| Bundle ID iOS | `app.blackbelt.academy` |
| Package Android | `app.blackbelt.academy` |
| Version app | `1.0.0` |
| iOS marketing version | `1.0.0` |
| iOS build number | `1` |
| Android versionName | `1.0.0` |
| Android versionCode | `1` |

## URLs públicas verificadas

| Finalidade | URL |
|---|---|
| App web / runtime atual | `https://blackbeltv2.vercel.app` |
| Privacy | `https://blackbeltv2.vercel.app/privacidade` |
| Terms | `https://blackbeltv2.vercel.app/termos` |
| Support | `https://blackbeltv2.vercel.app/contato` |
| Delete account | `https://blackbeltv2.vercel.app/excluir-conta` |

## Verdade do produto para loja

- O app tem login obrigatório.
- O runtime mobile validado hoje usa conteúdo remoto via `server.url`.
- O fluxo de exclusão de conta registra a solicitação e a exclusão definitiva ocorre em até 30 dias.
- Push notifications existem no código, mas não devem ser prometidas como prontas sem Firebase/APNs configurados.
- Analytics/monitoring detectados no código: Google Analytics, PostHog, Sentry.
- Permissões nativas detectadas: câmera, fotos, Face ID/biometria, push.
- Monetização correta: a assinatura BlackBelt é B2B e vendida fora do app; o financeiro dentro do produto é operação da academia para cobrar seus próprios alunos.

## Apple

Subtitle:

```text
Gestão de Academias Marciais
```

Keywords:

```text
academia,artes marciais,bjj,jiu-jitsu,judo,karate,mma,gestao,presenca,alunos,graduacao
```

Promotional Text:

```text
Gestão para academias de artes marciais com alunos, turmas, check-in, financeiro e conteúdo.
```

Review Notes:

```text
BlackBelt is a B2B SaaS app for martial arts academy management. Login is required because all data is academy-specific and role-based.

Important runtime note: the current validated mobile runtime connects to our hosted application backend at https://blackbeltv2.vercel.app.

Review account:
Email: REPLACE_WITH_REAL_REVIEW_EMAIL
Password: REPLACE_WITH_REAL_REVIEW_PASSWORD

This account must have administrator access to a demo academy with students, classes, attendance, invoices, and content already populated.

Business model:
- BlackBelt sells its SaaS subscription to academy owners outside the app.
- Billing screens inside the app are operational tools for the academy to manage its own charges to students.
- The app does not sell digital goods to end users inside the app.

Account deletion:
- Users can request account deletion inside the app or through https://blackbeltv2.vercel.app/excluir-conta.
- The request is registered immediately and final deletion occurs within up to 30 days, except where legal retention applies.
```

## Google Play

Short description:

```text
Gestão de academias de artes marciais com alunos, turmas, check-in e financeiro.
```

Full description:

```text
BlackBelt é um app de gestão para academias de artes marciais. O produto reúne operação acadêmica, alunos, responsáveis, turmas, presença, check-in, conteúdo e financeiro em um único ambiente com acesso por perfil.

Recursos verificados no código:
- dashboard operacional
- gestão de alunos e responsáveis
- turmas, presença e check-in
- financeiro operacional da academia
- biblioteca de conteúdo em vídeo
- perfis dedicados para admin, professor, aluno, responsável e outros papéis

O BlackBelt é vendido como SaaS B2B para academias. A assinatura do software é contratada fora do app pelo dono da academia. O financeiro visível no produto é uma ferramenta para a academia gerenciar as próprias cobranças aos alunos.
```

App Access:

```text
The app requires authentication because it is a role-based management platform for martial arts academies.

Provide a review account with administrator access and seeded demo data.
```

Contact email:

```text
REPLACE_WITH_REAL_SUPPORT_EMAIL
```

Contact phone:

```text
REPLACE_WITH_REAL_SUPPORT_PHONE
```

## Data safety / privacy truth

- Tracking cross-app: `No evidence found`
- Linked to user: nome, email, telefone, fotos, user ID
- Not linked: product interaction, crash data, performance data, device token
- Third parties present in code: Supabase, Sentry, PostHog, Google Analytics, Resend, Asaas/Stripe, Bunny

## Honest declarations

- Não declarar push como pronto se `google-services.json` e `GoogleService-Info.plist` não existirem.
- Não declarar offline robusto.
- Não declarar bundle local nativo completo.
- Não declarar deep links verificados até preencher Team ID e SHA-256 reais.
