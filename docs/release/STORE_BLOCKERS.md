# BlackBelt Store Blockers

Data: 2026-04-01
Estado base: código e builds validados nesta sessão

## Status atual

- Apple: `NO-GO`
- Google: `NO-GO`

## Blockers resolvidos no código

| Item | Resultado |
|---|---|
| `bundleRelease` não cai mais em `NullPointerException` | Agora falha com erro determinístico se faltar signing |
| Fluxo de exclusão de conta incoerente | Unificado para solicitação com janela de até 30 dias |
| Placeholder de telefone público exposto no app | Removido; telefone só aparece se `NEXT_PUBLIC_SUPPORT_PHONE` estiver definido |
| Versionamento divergente no health | `app/api/health/route.ts` agora usa `package.json` |
| `DEVELOPMENT_TEAM` não configurável | Projeto iOS agora aceita `APPLE_DEVELOPMENT_TEAM` |
| `PrivacyInfo.xcprivacy` só existia no filesystem | Agora está referenciado no target iOS |

## Blockers restantes

| # | Blocker | Tipo | Evidência | Como resolver |
|---|---|---|---|---|
| 1 | Runtime mobile de release ainda depende de `server.url` remoto | estrutural de código/produto | `pnpm build:mobile:local` falha porque `output: export` quebra com `app/api/*` dinâmicas | Separar as APIs do bundle web exportável ou abandonar o modelo Next App Router + `app/api` para o runtime mobile local |
| 2 | Apple Team ID real não foi fornecido | externo | `public/.well-known/apple-app-site-association` está em `APPLE_TEAM_ID_REQUIRED...` | Rodar `APPLE_DEVELOPMENT_TEAM=<TEAM_ID> node scripts/generate-mobile-association-files.mjs` |
| 3 | SHA-256 final do certificado Android não foi fixado como chave oficial de produção | externo | `public/.well-known/assetlinks.json` está em `ANDROID_RELEASE_SHA256_REQUIRED` | Definir a keystore oficial e rodar `ANDROID_RELEASE_SHA256=<SHA> node scripts/generate-mobile-association-files.mjs` |
| 4 | Conta/demo credentials de review não existem no ambiente real | externo | só existe template em `docs/release/STORE_REVIEW_CREDENTIALS_TEMPLATE.md` | Criar contas reais sem OTP/2FA e preencher o template |
| 5 | Archive iOS depende de conta/certificados/perfis Apple | externo | `xcodebuild archive` falhou por falta de provisioning profile | Entrar com Apple Developer válida e rodar archive com `-allowProvisioningUpdates` |
| 6 | Telefone real de suporte ainda não foi informado | externo | o app agora esconde telefone por padrão | Definir `NEXT_PUBLIC_SUPPORT_PHONE` antes do listing do Google Play |
| 7 | Email de suporte continua dependente de operação externa real | externo | default atual é `gregoryguimaraes12@gmail.com` | Garantir caixa ativa ou trocar para email comprovadamente funcional |

## Observação crítica

O maior blocker de Apple não é mais genérico. Ele está provado: o projeto hoje não consegue gerar bundle local exportável porque o runtime mobile ainda depende do mesmo app Next que contém `app/api/*` dinâmicas.
