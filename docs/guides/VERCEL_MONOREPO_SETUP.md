# Vercel — Setup Monorepo

## Projeto 1: blackbelt-web (app principal)
1. Vercel Dashboard → Import → GitHub → blackbelt-app
2. Root Directory: `apps/web`
3. Framework: Next.js
4. Build Command: `pnpm build`
5. Install Command: `pnpm install`
6. Domínios: `app.blackbelts.com.br`, `blackbeltv2.vercel.app`
7. Env vars: copiar todas do projeto atual

## Projeto 2: blackbelt-site (landing + público)
1. Vercel Dashboard → Import → GitHub → blackbelt-app
2. Root Directory: `apps/site`
3. Framework: Next.js
4. Build Command: `pnpm build`
5. Install Command: `pnpm install`
6. Domínios: `blackbelts.com.br`, `www.blackbelts.com.br`
7. Env vars: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_APP_URL

## DNS (Registro.br)
- A blackbelts.com.br → 216.198.79.1 (site)
- CNAME www → cname.vercel-dns.com (site)
- CNAME app → cname.vercel-dns.com (app)

## Nota importante
Os dois projetos Vercel apontam pro MESMO repo GitHub.
O Vercel usa o "Root Directory" pra saber qual app buildar.
