# Apple Submission Runbook

Data da auditoria: 2026-04-01
Status atual: `NO-GO`

## O que foi verificado

| Item | Evidência | Status |
|---|---|---|
| Nome exibido `BlackBelt` | `ios/App/App/Info.plist` | `verificado no código` |
| Bundle ID `app.blackbelt.academy` | `ios/App/App.xcodeproj/project.pbxproj` | `verificado no código` |
| Version `1.0` / build `1` | `ios/App/App.xcodeproj/project.pbxproj` | `verificado no código` |
| Permissões de câmera/fotos/Face ID | `ios/App/App/Info.plist` | `verificado no código` |
| Privacy manifest existe | `ios/App/App/PrivacyInfo.xcprivacy` | `verificado no código` |
| Privacy policy pública existe | rota `/privacidade` | `verificado no código` |
| Terms públicos existem | rota `/termos` | `verificado no código` |
| Support público existe | rota `/contato` e `/suporte` | `verificado no código` |
| Delete account público existe | rota `/excluir-conta` | `verificado no código` |

## Blockers Apple

1. O app ainda é empacotado como shell remoto. `capacitor.config.ts` e `scripts/prepare-capacitor-web.mjs` mostram isso claramente.
2. O archive para App Store Connect não foi provado.
3. `DEVELOPMENT_TEAM` e signing operacional não estão provados no projeto.
4. Credenciais reais de review não existem no repositório; só há rascunho.
5. AASA continua com placeholder em `public/.well-known/apple-app-site-association`.
6. O fluxo de exclusão de conta está incoerente entre API e UI.
7. O telefone público é placeholder e o email de suporte não foi provado operacionalmente.

## Ordem exata para Apple

1. Corrigir o empacotamento mobile para que o app não dependa de redirect remoto durante review.
2. Unificar o comportamento de exclusão de conta e alinhar texto legal, UI e backend.
3. Substituir telefone placeholder e confirmar email de suporte funcional.
4. Preencher o Apple Team ID em `public/.well-known/apple-app-site-association`.
5. Criar e validar a conta real de review sem OTP/2FA.
6. Configurar conta Apple Developer, time, certificados e provisioning profiles.
7. Atualizar metadados finais no App Store Connect usando [STORE_METADATA_MASTER.md](/Users/user_pc/Projetos/black_belt_v2/docs/release/STORE_METADATA_MASTER.md).
8. Rodar o build mobile web:

```bash
pnpm build:mobile
```

9. Sincronizar o projeto nativo:

```bash
pnpm cap:sync
```

10. Abrir o projeto iOS:

```bash
pnpm cap:ios
```

11. No Xcode:
Selecionar `Any iOS Device (arm64)` -> `Product` -> `Archive` -> `Distribute App` -> `App Store Connect`.

12. Aguardar o processing do build no App Store Connect.
13. Preencher `App Review Information`, `App Privacy`, rating e metadata.
14. Selecionar o build processado.
15. Submeter para review.

## App Review Notes prontas

Usar o texto em [STORE_METADATA_MASTER.md](/Users/user_pc/Projetos/black_belt_v2/docs/release/STORE_METADATA_MASTER.md) e substituir as credenciais placeholder por contas reais.

## Privacy Nutrition Label draft

Baseado no código atual:

| Categoria | Declaração draft |
|---|---|
| Tracking | `No` |
| Data linked to user | Nome, email, telefone, fotos, user ID |
| Data not linked to user | Product interaction, crash data, performance data, device ID |
| Purposes | App functionality, analytics |

## Itens que dependem do App Store Connect

- Criar o app caso ainda não exista
- Confirmar availability do nome
- Completar age rating
- Inserir review contact info
- Inserir demo account
- Confirmar export compliance
- Selecionar build processado

## Go / No-Go

- Hoje: `NO-GO`
- Go apenas quando:
  - o app deixar de ser shell remoto
  - o archive for gerado com sucesso
  - houver credenciais reais de review
  - exclusão de conta estiver coerente
  - contatos públicos forem reais
