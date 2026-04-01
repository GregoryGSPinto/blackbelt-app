# BlackBelt Store Blockers

Data da auditoria: 2026-04-01
Escopo: estado real do repositório + comandos executados localmente

## Status geral

- Apple App Store: `NO-GO`
- Google Play: `NO-GO`

## Top blockers agora

| # | Blocker | Evidência | Apple | Google | Status | Ação necessária |
|---|---|---|---|---|---|---|
| 1 | O app mobile ainda é um shell remoto/web wrapper | `capacitor.config.ts` usa `server.url` e `scripts/prepare-capacitor-web.mjs` gera `out/index.html` que redireciona para `https://blackbeltv2.vercel.app` | Crítico | Alto | `bloqueado` | Trocar a estratégia de empacotamento para bundle local real antes de submeter à Apple; no Google também reduz risco de rejeição e instabilidade |
| 2 | Build Android de release não gera AAB assinada | `./gradlew bundleRelease` falhou em `:app:signReleaseBundle FAILED` com `NullPointerException` | Médio | Crítico | `bloqueado` | Corrigir assinatura Android e provar geração de `app-release.aab` |
| 3 | Prontidão de archive iOS não foi provada | `ios/App/App.xcodeproj/project.pbxproj` tem bundle/version, mas `DEVELOPMENT_TEAM` não foi encontrado e o archive não foi provado localmente | Crítico | N/A | `bloqueado` | Configurar time/certificados/perfis e gerar archive real no Xcode |
| 4 | Contato público ainda usa telefone placeholder | `lib/config/legal.ts` define `+55 11 99999-0000` | Alto | Alto | `bloqueado` | Substituir por telefone real antes de qualquer submissão |
| 5 | Email de suporte não está provado operacionalmente | `lib/config/legal.ts` usa `suporte@blackbelt.app`, mas a entrega depende de MX/caixa externa | Alto | Alto | `pendente externo` | Confirmar mailbox real; se não estiver pronto, usar email funcional validado |
| 6 | Deep links públicos têm placeholders | `public/.well-known/apple-app-site-association` e `public/.well-known/assetlinks.json` têm `REPLACE_WITH_*` | Alto | Alto | `bloqueado` | Preencher Apple Team ID e fingerprint SHA-256 do certificado de release |
| 7 | Fluxo de exclusão de conta está incoerente | `app/api/auth/delete-account/route.ts` agenda exclusão em 30 dias; `components/settings/DeleteAccountSection.tsx` comunica anonimização imediata via edge function | Alto | Alto | `bloqueado` | Unificar regra, UX, texto legal e implementação |
| 8 | Endpoint de health está com versão divergente do app | `app/api/health/route.ts` retorna `2.0.0`, enquanto `package.json`, Android e iOS estão em `1.0.0/1.0/1` | Médio | Médio | `pendente` | Sincronizar versionamento para não gerar inconsistência em revisão/operação |
| 9 | Credenciais de review/demo não estão provadas | Existe rascunho em `docs/store/STORE_REVIEW_CREDENTIALS.md`, mas sem prova de contas reais | Crítico | Crítico | `pendente externo` | Criar contas reais sem OTP/2FA e validar login fim a fim |
| 10 | Gate crítico do Play Console não é verificável no repo | Regra de teste fechado para conta pessoal nova só é confirmável no console | N/A | Crítico | `pendente externo` | Confirmar manualmente no console se produção está bloqueada por closed testing |

## Riscos adicionais relevantes

| Risco | Evidência | Status | Ação |
|---|---|---|---|
| Push notifications não estão prontas para prova em loja | ausência de `android/app/google-services.json` e `ios/.../GoogleService-Info.plist` | `pendente` | Configurar Firebase/APNs ou remover promessa de push da metadata |
| Analytics/telemetria exigem consistência com política e consoles | `components/analytics/GoogleAnalytics.tsx`, `lib/analytics/posthog.ts`, configs Sentry | `pendente` | Declarar corretamente em Apple Privacy e Google Data Safety |
| App Access é obrigatório por haver login | rotas autenticadas e docs de credenciais já existentes | `pendente externo` | Fornecer conta demo estável + instruções claras em inglês |
| URLs públicas ainda usam domínio Vercel | `blackbeltv2.vercel.app` espalhado em config e docs | `pendente` | Aceitável temporariamente, mas piora percepção de maturidade e estabilidade |

## Conclusão operacional

- Apple: não submeter enquanto o shell remoto existir, o archive não estiver provado e a exclusão de conta não estiver coerente.
- Google: não abrir produção enquanto `bundleRelease` continuar falhando e o gate de closed testing não estiver confirmado no console.
