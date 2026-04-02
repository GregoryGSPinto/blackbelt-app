# BlackBelt v2 — Build Mobile

## Pre-requisitos
- Node 18+, pnpm
- iOS: macOS + Xcode 15+ + CocoaPods
- Android: Android Studio + SDK 34

## Gerar projetos nativos (primeira vez)
```bash
pnpm build:mobile
npx cap add ios
npx cap add android
npx cap sync
```

## Build subsequente
```bash
pnpm build:mobile
npx cap sync
npx cap open ios      # abre no Xcode
npx cap open android  # abre no Android Studio
```

## App Store / Play Store
- iOS: Archive no Xcode → Upload to App Store Connect
- Android: Build → Generate Signed Bundle → Upload no Play Console

## Deep Links
- iOS: Substituir `TEAM_ID` em `public/.well-known/apple-app-site-association` pelo Apple Team ID real
- Android: Preencher `sha256_cert_fingerprints` em `public/.well-known/assetlinks.json` apos assinar o APK

## Credenciais de Review
- Email: roberto@guerreiros.com
- Senha: BlackBelt@2026
- Perfil: Admin da academia "Guerreiros do Tatame"
