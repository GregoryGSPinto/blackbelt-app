# Apple Submission Runbook

Data: 2026-04-01
Estado atual: `NO-GO`

## O que já está pronto no projeto

- Bundle ID: `app.blackbelt.academy`
- Version/build: `1.0.0 (1)`
- `DEVELOPMENT_TEAM` injetável via `APPLE_DEVELOPMENT_TEAM`
- `PrivacyInfo.xcprivacy` presente no target
- `Info.plist` com câmera, fotos, Face ID
- páginas públicas de privacy, terms, support e delete account
- fluxo de exclusão alinhado para solicitação com até 30 dias

## O que foi provado nesta sessão

Comando:

```bash
APPLE_DEVELOPMENT_TEAM=ABCDE12345 xcodebuild -project ios/App/App.xcodeproj -scheme App -showBuildSettings | rg "DEVELOPMENT_TEAM|PRODUCT_BUNDLE_IDENTIFIER|MARKETING_VERSION|CURRENT_PROJECT_VERSION|CODE_SIGN_STYLE"
```

Resultado:

- `DEVELOPMENT_TEAM = ABCDE12345`
- `PRODUCT_BUNDLE_IDENTIFIER = app.blackbelt.academy`
- `MARKETING_VERSION = 1.0.0`
- `CURRENT_PROJECT_VERSION = 1`
- `CODE_SIGN_STYLE = Automatic`

Archive tentado:

```bash
APPLE_DEVELOPMENT_TEAM=<REAL_TEAM_ID> xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -destination generic/platform=iOS \
  -archivePath /tmp/BlackBelt.xcarchive \
  -allowProvisioningUpdates \
  archive
```

Falha objetiva atual:

- falta conta/certificado/profile Apple para `app.blackbelt.academy`

## Ordem exata

1. Definir `APPLE_DEVELOPMENT_TEAM` real.
2. Logar no Xcode com a conta Apple Developer correta.
3. Garantir que o App ID `app.blackbelt.academy` exista no portal Apple.
4. Rodar `pnpm build:mobile`.
5. Rodar `pnpm cap:sync`.
6. Rodar o comando de archive acima com `-allowProvisioningUpdates`.
7. Confirmar que o `.xcarchive` foi gerado.
8. Upload para App Store Connect.
9. Preencher review notes e credentials reais.
10. Submeter.

## Blockers restantes Apple

- Runtime mobile de release ainda depende de `server.url` remoto; o export local quebra por causa de `app/api/*` dinâmicas.
- Team ID real e provisioning profiles.
- Credenciais reais de review.
- `apple-app-site-association` ainda precisa do Team ID real.

## Veredito

- Apple: `NO-GO`
