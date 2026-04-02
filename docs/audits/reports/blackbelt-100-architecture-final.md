# BlackBelt Final Architecture Report

## 1. Arquitetura anterior

O antigo `black_belt_v2` operava como um appzão Next.js que misturava site comercial, produto autenticado, APIs, mobile shell, docs operacionais e governança em um único repositório/deploy.

## 2. Arquitetura final

Topologia-alvo definida:

- `blackbelt-site`
- `blackbelt-app`
- `blackbelt-infra-private`

## 3. Repositórios definidos

- `blackbelt-app`: este repositório local foi reposicionado conceitualmente e em metadados.
- `blackbelt-site`: scaffold local preparado em `scaffolds/blackbelt-site`.
- `blackbelt-infra-private`: scaffold local preparado em `scaffolds/blackbelt-infra-private`.

## 4. Domínios definidos

- `blackbelt.com` e `www.blackbelt.com`: site
- `app.blackbelt.com`: app autenticado
- `api.blackbelt.com`: borda operacional / integrações
- `help.blackbelt.com`: ajuda
- `docs.blackbelt.com`: docs públicas/técnicas
- `status.blackbelt.com`: status
- `admin.blackbelt.com`: opcional, apenas se painel interno exigir separação real

## 5. Árvore do blackbelt-app

```text
blackbelt-app/
  app/
  components/
  features/
    auth/
    billing/
    finance/
    onboarding/
    platform-center/
    site/
  lib/
  supabase/
  tests/
  e2e/
  scripts/
  docs/
  ios/
  android/
  scaffolds/
    blackbelt-site/
    blackbelt-infra-private/
```

## 6. Estrutura preparada para blackbelt-site

Preparada em `scaffolds/blackbelt-site` com README, `package.json` e workflow base.

## 7. Estrutura preparada para blackbelt-infra-private

Preparada em `scaffolds/blackbelt-infra-private` com README e workflow base.

## 8. Decisões arquiteturais tomadas

- o repositório atual converge para `blackbelt-app`
- entradas estratégicas de rota foram delegadas para `features/`
- `app/` começa a voltar a ser camada de rotas
- foi introduzido um guard de arquitetura em CI
- governança GitHub foi elevada com templates, CODEOWNERS e CONTRIBUTING

## 9. Decisões de deploy

- site e app devem ter deploys separados
- `app/api` permanece como borda temporária até eventual extração para `api.blackbelt.com`
- mobile continua como extensão operacional do `blackbelt-app` via Capacitor

## 10. Decisões de billing

- venda do SaaS BlackBelt pertence ao site comercial
- billing SaaS do produto pertence ao domínio `features/billing`
- financeiro da academia e cobrança aos alunos pertencem ao domínio `features/finance`

## 11. Decisões de governança GitHub

- `CONTRIBUTING.md`
- `CODEOWNERS`
- `PULL_REQUEST_TEMPLATE.md`
- issue templates
- workflow CI com job `architecture`

## 12. Arquivos/pastas movidos

- `app/page.tsx` virou wrapper para `features/site/pages/landing-page.tsx`
- `app/(auth)/login/page.tsx` virou wrapper para `features/auth/pages/login-page.tsx`
- `app/(public)/cadastrar-academia/page.tsx` virou wrapper para `features/onboarding/pages/register-academia-page.tsx`

## 13. Imports/configs ajustados

- `package.json` renomeado para `blackbelt-app`
- `features/auth/services/auth.service.ts` criado
- `features/billing/services/*` criado
- `features/finance/services/student-billing.service.ts` criado
- `features/onboarding/services/onboarding.service.ts` criado
- `features/platform-center/services/platform-center.service.ts` criado

## 14. Status do typecheck

`pnpm typecheck` passou.

## 15. Status dos testes

`pnpm test` passou com `147/147` testes.

## 16. Status do build

`pnpm build` passou. Permanecem warnings pré-existentes de Sentry/ESLint e um aviso de uso dinâmico em `/api/student/current`, sem bloquear o build.

## 17. O que foi executado localmente

- auditoria estrutural do repositório
- reposicionamento do repo como `blackbelt-app`
- criação de scaffolds de `site` e `infra-private`
- extração inicial de entradas de rota para `features/`
- criação de guardas e governança

## 18. O que foi executado no GitHub remoto

Autenticação GitHub confirmada via `gh auth status`. Operações remotas de rename/criação ainda não executadas neste relatório.

## 19. O que ainda depende de ação externa

- renomear/criar repositórios remotos
- apontar domínios e subdomínios
- separar deploy de site e app
- migrar docs e automações privadas para o repositório privado

## 20. Nota final de maturidade arquitetural do BlackBelt

7.5/10 após esta execução local. A topologia-alvo ficou explícita e operacionalmente preparável, mas a migração completa do conteúdo público e das rotas restantes para `features/` ainda precisa continuar em ondas disciplinadas.
