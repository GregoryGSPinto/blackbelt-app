# Domains, Deploy and Billing Boundaries

## Domínios

- `blackbeltv2.vercel.app`: site comercial e aquisição
- `blackbeltv2.vercel.app (www)`: alias do site
- `blackbeltv2.vercel.app`: aplicação autenticada
- `blackbeltv2.vercel.app/api`: webhooks, integrações, health, endpoints operacionais
- `blackbeltv2.vercel.app/ajuda`: central de ajuda
- `blackbeltv2.vercel.app/docs`: documentação pública e técnica
- `blackbeltv2.vercel.app/status`: status page
- `blackbeltv2.vercel.app/admin`: opcional, apenas se o painel interno for separado do app

## Deploy

- `blackbelt-site`: Vercel, otimizado para marketing, SEO e páginas legais
- `blackbelt-app`: Vercel para web autenticada e rotas Next; Capacitor para iOS/Android
- `blackbeltv2.vercel.app/api`: inicialmente pode coexistir no Next app via `app/api`, mas com namespace/documentação explícitos para futura extração
- `blackbeltv2.vercel.app/status`: provider de status externo
- `blackbeltv2.vercel.app/ajuda`: docs/helpdesk externo ou site estático dedicado

## Billing

- cobrança do BlackBelt para a academia: SaaS, contrato, trial, plano, invoice do software, ownership do produto
- cobrança da academia para seus alunos: operação diária da academia, mensalidades, inadimplência, check-in mínimo, bolsa, Gympass/TotalPass, cobrança manual/externa

## Regra de Arquitetura

- SaaS billing do BlackBelt fica em `features/billing`
- cobrança operacional da academia fica em `features/finance`
- páginas públicas que vendem o produto saem para `blackbelt-site`
- `blackbeltv2.vercel.app` só deve expor onboarding/autenticação e produto autenticado
