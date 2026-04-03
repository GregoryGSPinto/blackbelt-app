# blackbelt-app

Repositório do produto autenticado BlackBelt.

## O que este repositório é

- `blackbeltv2.vercel.app`: app autenticado, auth, onboarding operacional e superfícies públicas do produto
- `blackbeltv2.vercel.app/api`: rotas `app/api`, webhooks e contratos HTTP do produto
- iOS/Android: companion móvel do mesmo app via Capacitor

## O que este repositório não é

- não é o site comercial principal
- não é o repositório privado de infraestrutura operacional

O site comercial vive em `blackbeltv2.vercel.app` e está representado aqui apenas por `scaffolds/blackbelt-site` e por rotas de redirecionamento em `app/(site-marketing)`.

## Fronteiras

- `app/(auth)`: login, cadastro, convite, recuperação de senha, seleção de perfil
- `app/(public-operational)`: onboarding público, legal, suporte, status, compete, marketplace, developers e demais superfícies públicas do produto
- `app/(site-marketing)`: rotas legadas que redirecionam para `blackbeltv2.vercel.app`
- `app/api`: backend HTTP do produto
- `app/(admin)`, `app/(main)`, `app/(teen)`, `app/(kids)`, `app/(parent)`, `app/(professor)`, `app/(recepcao)`, `app/(franqueador)`, `app/(superadmin)`: áreas autenticadas por papel
- `docs/`: documentação viva do produto autenticado
- `scaffolds/blackbelt-site`: scaffold do site comercial separado

## Como rodar

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Entrada local do app: `http://localhost:3000/login`

## Scripts principais

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm mobile:prepare`
- `pnpm architecture:check`
- `pnpm validate:env`
- `pnpm release:gates`

## Regras de contribuição

- não reintroduzir landing, blog ou pricing dentro do runtime principal do app
- novas superfícies públicas do produto entram em `app/(public-operational)`
- material de auditoria e relatórios vai para `docs/audits/`, nunca para a raiz
- mudanças de domínio e topologia devem manter o contrato `blackbeltv2.vercel.app` vs `blackbeltv2.vercel.app/api`
