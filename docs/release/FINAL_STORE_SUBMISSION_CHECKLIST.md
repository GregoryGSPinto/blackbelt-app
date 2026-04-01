# Final Store Submission Checklist

Data da auditoria: 2026-04-01
Base: repositório local + builds e inspeções executadas nesta sessão

## Resumo executivo

- Apple App Store: `NO-GO`
- Google Play: `NO-GO`
- Motivo central: a submissão ainda não está segura nem comprovada. O mobile continua dependente de shell remoto, o release Android falha na assinatura e a prontidão iOS/App Review não foi provada.

## Inventário de submissão

| Item | Onde foi encontrado | Status | Risco Apple | Risco Google | Ação necessária |
|---|---|---|---|---|---|
| App name `BlackBelt` | `capacitor.config.ts`, `ios/App/App/Info.plist` | `verificado no código` | Baixo | Baixo | Nenhuma |
| Bundle/package `app.blackbelt.academy` | iOS/Android configs | `verificado no código` | Baixo | Baixo | Manter consistente em todos os materiais |
| Version `1.0.0 / 1.0 / 1` | `package.json`, iOS, Android | `verificado no código` | Médio | Médio | Sincronizar com health endpoint |
| Shell remoto via Vercel | `capacitor.config.ts`, `scripts/prepare-capacitor-web.mjs` | `bloqueado` | Crítico | Alto | Empacotar bundle local real |
| Privacy policy pública | rota `/privacidade` | `verificado no código` | Baixo | Baixo | Validar conteúdo final publicado |
| Terms públicos | rota `/termos` | `verificado no código` | Baixo | Baixo | Nenhuma |
| Support público | rota `/contato` | `verificado no código` | Médio | Médio | Trocar telefone/email para contatos reais |
| Delete account público | rota `/excluir-conta` | `verificado no código` | Médio | Médio | Alinhar comportamento real com UI/API |
| Login obrigatório | rotas auth + docs | `verificado no código` | Alto | Alto | Preparar review account real |
| Criação de conta | `/cadastro`, `/cadastrar-academia` | `verificado no código` | Médio | Médio | Garantir coerência com política |
| Câmera/fotos/Face ID | `ios/App/App/Info.plist`, componentes nativos | `verificado no código` | Médio | Médio | Manter descrições coerentes na store |
| Push notifications | libs nativas, sem Firebase files | `pendente` | Médio | Médio | Configurar ou não prometer |
| Analytics/monitoring | Google Analytics, PostHog, Sentry | `verificado no código` | Alto | Alto | Declarar corretamente em privacy/data safety |
| Deep links | `.well-known/*` com placeholders | `bloqueado` | Alto | Alto | Preencher Team ID e SHA-256 |
| Build iOS archive | não provado | `bloqueado` | Crítico | N/A | Gerar archive real |
| Build Android AAB | `bundleRelease` falhou | `bloqueado` | N/A | Crítico | Corrigir assinatura |
| Screenshots | `docs/screenshots`, `docs/store-screenshots` | `verificado no repositório` | Baixo | Baixo | Revisar fidelidade ao produto atual |
| Feature graphic | `docs/store-assets/feature-graphic.png` | `verificado no repositório` | N/A | Baixo | Confirmar uso final |

## Top 10 blockers

1. Shell remoto/web wrapper no mobile.
2. `bundleRelease` falhando na assinatura Android.
3. Archive iOS não provado.
4. Fluxo de exclusão de conta incoerente.
5. Telefone de suporte placeholder.
6. Email de suporte sem prova operacional.
7. Deep links com placeholders.
8. Review account ainda não existe de forma comprovada.
9. Health endpoint com versão divergente.
10. Gate de produção do Play Console não verificado.

## Ordem mestra exata

1. Corrigir o empacotamento mobile para eliminar o redirect remoto durante review.
2. Corrigir a assinatura Android até gerar AAB de release real.
3. Configurar signing iOS e provar archive no Xcode.
4. Unificar exclusão de conta entre UI, API e texto legal.
5. Trocar telefone placeholder por número real.
6. Confirmar email de suporte funcional e acessível.
7. Preencher Apple Team ID e Android SHA-256 nos arquivos de deep link.
8. Criar contas reais de review com dados demo e sem OTP/2FA.
9. Revisar screenshots e metadata para prometer apenas o que está realmente funcionando.
10. Rodar `pnpm build:mobile`.
11. Rodar `pnpm cap:sync`.
12. Gerar archive iOS no Xcode.
13. Rodar `cd android && ./gradlew clean bundleRelease`.
14. Se o Play Console exigir, abrir closed testing com 12 testers por 14 dias.
15. Preencher App Store Connect e Play Console com os textos de [STORE_METADATA_MASTER.md](/Users/user_pc/Projetos/black_belt_v2/docs/release/STORE_METADATA_MASTER.md).
16. Submeter Google no track permitido.
17. Submeter Apple somente após build processado e App Review Info completo.

## Comandos exatos de build

### Base comum

```bash
pnpm build:mobile
pnpm cap:sync
```

### iOS

```bash
pnpm cap:ios
```

Depois no Xcode:
`Product -> Archive -> Distribute App -> App Store Connect`

### Android

```bash
cd android
./gradlew clean bundleRelease
ls -la app/build/outputs/bundle/release/
```

## Apple checklist

- [ ] Eliminar shell remoto
- [ ] Provar archive iOS
- [ ] Configurar signing/time Apple
- [ ] Preencher AASA com Team ID real
- [ ] Criar review account real
- [ ] Colar Review Notes
- [ ] Preencher App Privacy coerente com PostHog/Sentry/GA e dados de conta
- [ ] Confirmar contacts reais
- [ ] Submeter

## Google checklist

- [ ] Fazer `bundleRelease` passar
- [ ] Confirmar gate de closed testing vs production
- [ ] Preencher `assetlinks.json` com fingerprint real
- [ ] Criar review account real
- [ ] Preencher Data Safety coerente com integrações reais
- [ ] Preencher App Access
- [ ] Confirmar ads = `No`, se continuar sem ads
- [ ] Confirmar target audience e content rating
- [ ] Submeter no track correto

## Tabela final de prontidão

| Item | Apple status | Google status | Owner | Ação | Blocker? | Pronto para submissão? |
|---|---|---|---|---|---|---|
| Shell mobile | `bloqueado` | `bloqueado` | Engenharia | Remover dependência de redirect remoto | Sim | Não |
| Build release | `bloqueado` | `bloqueado` | Engenharia | Provar archive/AAB | Sim | Não |
| Credenciais review | `pendente` | `pendente` | Produto/Ops | Criar contas reais | Sim | Não |
| Privacy/legal URLs | `verificado` | `verificado` | Produto | Validar publicação final | Não | Parcial |
| Delete account | `bloqueado` | `bloqueado` | Engenharia/Produto | Unificar regra e comunicação | Sim | Não |
| Support contacts | `bloqueado` | `bloqueado` | Ops | Trocar placeholders | Sim | Não |
| Deep links | `bloqueado` | `bloqueado` | Engenharia | Preencher placeholders | Sim | Não |
| Data safety/privacy forms | `pendente` | `pendente` | Produto | Preencher consoles com base no código | Sim | Não |
| Screenshots/assets | `parcial` | `parcial` | Produto/Design | Confirmar aderência ao app atual | Não | Parcial |
| Console gates | `pendente externo` | `pendente externo` | Release | Confirmar App Store Connect / Play Console | Sim | Não |

## Go / No-Go final

- Apple: `NO-GO`
- Google: `NO-GO`
