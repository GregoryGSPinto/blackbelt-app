# BlackBelt Store Metadata Master

Data da auditoria: 2026-04-01
Base: estado real do código + material já existente em `docs/store/`

## Identidade verificada

| Item | Valor | Fonte | Status |
|---|---|---|---|
| App name | `BlackBelt` | `capacitor.config.ts`, `ios/App/App/Info.plist` | `verificado no código` |
| Bundle ID iOS | `app.blackbelt.academy` | `ios/App/App.xcodeproj/project.pbxproj` | `verificado no código` |
| Package Android | `app.blackbelt.academy` | `android/app/build.gradle` | `verificado no código` |
| Version app | `1.0.0` | `package.json` | `verificado no código` |
| iOS marketing version | `1.0` | `ios/App/App.xcodeproj/project.pbxproj` | `verificado no código` |
| iOS build number | `1` | `ios/App/App.xcodeproj/project.pbxproj` | `verificado no código` |
| Android versionName | `1.0` | `android/app/build.gradle` | `verificado no código` |
| Android versionCode | `1` | `android/app/build.gradle` | `verificado no código` |

## URLs públicas

| Finalidade | URL | Base | Status |
|---|---|---|---|
| Marketing / app web | `https://blackbeltv2.vercel.app` | `capacitor.config.ts`, `lib/config/legal.ts` | `verificado no código` |
| Privacy policy | `https://blackbeltv2.vercel.app/privacidade` | `lib/config/legal.ts`, rota pública | `verificado no código` |
| Terms | `https://blackbeltv2.vercel.app/termos` | `lib/config/legal.ts`, rota pública | `verificado no código` |
| Support | `https://blackbeltv2.vercel.app/contato` | `lib/config/legal.ts`, rota pública | `verificado no código` |
| Delete account | `https://blackbeltv2.vercel.app/excluir-conta` | `lib/config/legal.ts`, rota pública | `verificado no código` |

## Apple

### Campos prontos para colar

Subtitle:

```text
Gestão de Academias Marciais
```

Promotional Text:

```text
Gerencie sua academia de artes marciais com BlackBelt: check-in, graduações, financeiro, turmas e conteúdo em vídeo.
```

Keywords:

```text
academia,artes marciais,bjj,jiu-jitsu,judo,karate,mma,gestao,presenca,alunos,faixas,graduacao
```

Primary Category:

```text
Business
```

Secondary Category:

```text
Education
```

Age Rating draft:

```text
12+
```

Support URL:

```text
https://blackbeltv2.vercel.app/contato
```

Marketing URL:

```text
https://blackbeltv2.vercel.app
```

Privacy Policy URL:

```text
https://blackbeltv2.vercel.app/privacidade
```

Review Notes:

```text
BlackBelt is a B2B SaaS app for martial arts academy management. It is sold to academy owners and used by academy staff, students, and guardians through role-based access.

Login is required because all data is academy-specific.

Review account:
Email: REPLACE_WITH_REAL_REVIEW_EMAIL
Password: REPLACE_WITH_REAL_REVIEW_PASSWORD

This account must have administrator access to a demo academy with students, classes, attendance, invoices, and video content already populated.

Important notes:
- BlackBelt does not sell digital goods to end users inside the app.
- The BlackBelt subscription is a B2B SaaS contract sold outside the app to academy owners.
- Student billing shown in the app is an operational feature used by the academy to manage its own charges to students.
- If QR check-in is not practical during review, please use the manual check-in flow.
```

## Google Play

### Campos prontos para colar

App name:

```text
BlackBelt
```

Short description:

```text
Gestão de academias de artes marciais com alunos, turmas, check-in e financeiro.
```

Full description:

```text
BlackBelt é uma plataforma de gestão para academias de artes marciais. O app centraliza a operação da academia em um único ambiente com acesso por perfil.

Recursos atuais verificados no produto:
- dashboard operacional com indicadores
- gestão de alunos e responsáveis
- gestão de turmas e presença
- check-in manual e por QR code
- financeiro da academia para acompanhar cobranças e faturas
- biblioteca de conteúdo em vídeo
- perfis dedicados para admin, professor, aluno, responsável e outros papéis operacionais

O BlackBelt é vendido como SaaS B2B para academias. O app não é um fluxo de compra para consumidor final. A cobrança da assinatura do BlackBelt para a academia acontece fora do app. Já o financeiro exibido no produto é uma ferramenta operacional da própria academia para gerir suas cobranças aos alunos.

O produto também mantém páginas públicas de privacidade, termos, suporte e exclusão de conta.
```

Category:

```text
Business
```

Contact email:

```text
REPLACE_WITH_REAL_SUPPORT_EMAIL
```

Contact phone:

```text
REPLACE_WITH_REAL_SUPPORT_PHONE
```

Website:

```text
https://blackbeltv2.vercel.app
```

Privacy Policy:

```text
https://blackbeltv2.vercel.app/privacidade
```

Account deletion URL:

```text
https://blackbeltv2.vercel.app/excluir-conta
```

App access notes:

```text
The app requires authentication because it is a role-based management platform for martial arts academies.

Provide a review account with administrator access and preloaded sample data.
```

## Declarações de monetização fiéis ao produto

Use esta formulação nas duas lojas sempre que houver campo livre:

```text
BlackBelt is a B2B SaaS platform sold to martial arts academies. The BlackBelt subscription is purchased outside the app by the academy owner. Billing features visible inside the app are operational tools used by the academy to manage its own charges to students; they are not in-app purchases of BlackBelt itself.
```

## Restrições de honestidade

- Não declarar push notifications como funcionalidade pronta se Firebase/APNs ainda não estiver configurado.
- Não prometer compra in-app.
- Não prometer funcionamento offline robusto.
- Não prometer reviewer demo account até que a conta exista e tenha sido validada.
