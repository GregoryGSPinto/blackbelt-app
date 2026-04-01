# Final Store Submission Checklist

Data: 2026-04-01
Estado final após correções desta sessão

## Resumo executivo

- Android release pipeline: `corrigida e provada`
- iOS project/signing path: `reduzida ao mínimo externo`
- Exclusão de conta: `coerente`
- Support phone placeholder: `removido do app`
- Health/versionamento: `sincronizado`
- Deep links: `prontos para geração final por script`

## Comandos executáveis

### Runtime mobile atual validado

```bash
pnpm build:mobile
pnpm cap:sync
```

### Export local experimental para Capacitor

```bash
pnpm build:mobile:local
```

Status:

- este comando prova o blocker estrutural do projeto hoje
- ele falha por causa de `app/api/*` dinâmicas acopladas ao runtime Next

### Android release

```bash
cd android
./gradlew clean bundleRelease
```

### iOS archive

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

### Deep links

```bash
APPLE_DEVELOPMENT_TEAM=<TEAM_ID> \
ANDROID_RELEASE_SHA256='<REAL_SHA256>' \
node scripts/generate-mobile-association-files.mjs
```

## O que passou

- `pnpm build:mobile`
- `pnpm cap:sync`
- `pnpm typecheck`
- `./gradlew clean bundleRelease` com signing explícito
- `xcodebuild -showBuildSettings` com `APPLE_DEVELOPMENT_TEAM`

## O que falhou

- `pnpm build:mobile:local`
  - quebra porque `output: export` não suporta as `app/api/*` dinâmicas atuais
- `xcodebuild archive`
  - quebra por falta de provisioning profile/conta Apple, não por erro do projeto

## Veredito por loja

- Apple: `NO-GO`
- Google: `NO-GO`

## Gate final

| Item | Apple | Google |
|---|---|---|
| Team ID / profiles reais | obrigatório | n/a |
| Keystore oficial final | n/a | obrigatório |
| Review credentials reais | obrigatório | obrigatório |
| Phone real de suporte | recomendável | obrigatório para listing |
| Deep link values finais | obrigatório | obrigatório |
| Runtime local sem `server.url` | blocker crítico | risco operacional relevante |
