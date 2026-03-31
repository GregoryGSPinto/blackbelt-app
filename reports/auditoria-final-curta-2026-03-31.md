# Auditoria Final Curta — 2026-03-31

## Pendências reais encontradas
- `typecheck` dependia do estado da pasta `.next/types` e podia falhar fora da ordem correta de build.
- Páginas críticas de configuração por papel ainda usavam `MOCK_PROFILE_ID`.
- `admin/convites` ainda dependia de academia hardcoded.
- `admin/notificacoes` ainda caía silenciosamente em `admin-1` quando o contexto real faltava.

## Migrations pendentes ou não
- Auditoria via `pnpm exec supabase migration list` no projeto `tdplmmodmumryzdosmpv` mostrou alinhamento completo entre local e remoto.
- Resultado: **nenhuma migration pendente** para os artefatos versionados do repositório.

## Hardcodes remanescentes críticos
- Corrigidos nesta rodada:
  - `app/(superadmin)/superadmin/configuracoes/page.tsx`
  - `app/(professor)/professor/configuracoes/page.tsx`
  - `app/(parent)/parent/configuracoes/page.tsx`
  - `app/(main)/dashboard/configuracoes/page.tsx`
  - `app/(recepcao)/recepcao/configuracoes/page.tsx`
  - `app/(teen)/teen/configuracoes/page.tsx`
  - `app/(kids)/kids/configuracoes/page.tsx`
  - `app/(admin)/admin/convites/page.tsx`
  - `app/(admin)/admin/notificacoes/page.tsx`
- Ainda existem hardcodes fora do recorte desta execução em áreas menos diretamente críticas ao fluxo de conta/operação, por exemplo `admin/whatsapp`, `admin/graduacoes`, `admin/auditoria`, `admin/site`, `admin/pedagogico`.

## Fluxos sem smoke real antes desta rodada
- login/logout multi-perfil
- financeiro/admin
- central da plataforma/superadmin

## Riscos de maturidade ainda abertos
- Smoke real de onboarding, cadastro de aluno, vínculo responsável-dependente e check-in não foi executado nesta rodada.
- Não houve write real seguro contra Asaas nesta execução.
- `supabase status` local falhou por ausência de Docker local, então não houve stack Supabase local rodando para validação isolada.
