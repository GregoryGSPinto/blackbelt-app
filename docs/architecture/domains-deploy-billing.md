# Domains, Deploy and Billing Boundaries

## Domínios

- `blackbelt.com`: site comercial e aquisição
- `www.blackbelt.com`: alias do site
- `app.blackbelt.com`: aplicação autenticada
- `api.blackbelt.com`: webhooks, integrações, health, endpoints operacionais
- `help.blackbelt.com`: central de ajuda
- `docs.blackbelt.com`: documentação pública e técnica
- `status.blackbelt.com`: status page
- `admin.blackbelt.com`: opcional, apenas se o painel interno for separado do app

## Deploy

- `blackbelt-site`: Vercel, otimizado para marketing, SEO e páginas legais
- `blackbelt-app`: Vercel para web autenticada e rotas Next; Capacitor para iOS/Android
- `api.blackbelt.com`: inicialmente pode coexistir no Next app via `app/api`, mas com namespace/documentação explícitos para futura extração
- `status.blackbelt.com`: provider de status externo
- `help.blackbelt.com`: docs/helpdesk externo ou site estático dedicado

## Billing

- cobrança do BlackBelt para a academia: SaaS, contrato, trial, plano, invoice do software, ownership do produto
- cobrança da academia para seus alunos: operação diária da academia, mensalidades, inadimplência, check-in mínimo, bolsa, Gympass/TotalPass, cobrança manual/externa

## Regra de Arquitetura

- SaaS billing do BlackBelt fica em `features/billing`
- cobrança operacional da academia fica em `features/finance`
- páginas públicas que vendem o produto saem para `blackbelt-site`
- `app.blackbelt.com` só deve expor onboarding/autenticação e produto autenticado
