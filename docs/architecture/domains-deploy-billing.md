# Domains, Deploy and Billing Boundaries

## Domínios

- `blackbelts.com.br`: site comercial e aquisição
- `blackbelts.com.br (www)`: alias do site
- `blackbelts.com.br`: aplicação autenticada
- `blackbelts.com.br/api`: webhooks, integrações, health, endpoints operacionais
- `blackbelts.com.br/ajuda`: central de ajuda
- `blackbelts.com.br/docs`: documentação pública e técnica
- `blackbelts.com.br/status`: status page
- `blackbelts.com.br/admin`: opcional, apenas se o painel interno for separado do app

## Deploy

- `blackbelt-site`: Vercel, otimizado para marketing, SEO e páginas legais
- `blackbelt-app`: Vercel para web autenticada e rotas Next; Capacitor para iOS/Android
- `blackbelts.com.br/api`: inicialmente pode coexistir no Next app via `app/api`, mas com namespace/documentação explícitos para futura extração
- `blackbelts.com.br/status`: provider de status externo
- `blackbelts.com.br/ajuda`: docs/helpdesk externo ou site estático dedicado

## Billing

- cobrança do BlackBelt para a academia: SaaS, contrato, trial, plano, invoice do software, ownership do produto
- cobrança da academia para seus alunos: operação diária da academia, mensalidades, inadimplência, check-in mínimo, bolsa, Gympass/TotalPass, cobrança manual/externa

## Regra de Arquitetura

- SaaS billing do BlackBelt fica em `features/billing`
- cobrança operacional da academia fica em `features/finance`
- páginas públicas que vendem o produto saem para `blackbelt-site`
- `blackbelts.com.br` só deve expor onboarding/autenticação e produto autenticado
