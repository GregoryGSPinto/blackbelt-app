# Repo Split Mapping

## blackbelt-site

| Origem atual | Destino | Compatibilidade temporária |
| --- | --- | --- |
| `app/page.tsx` | `blackbelt-site/app/page.tsx` | manter landing espelhada temporariamente no app |
| `app/(public)/precos` | `blackbelt-site/app/planos` | redirect provisório no app |
| `app/(public)/sobre` | `blackbelt-site/app/sobre` | pode coexistir até troca de DNS |
| `app/(public)/contato` | `blackbelt-site/app/contato` | manter endpoint atual até extração do formulário |
| `app/(public)/privacidade` | `blackbelt-site/app/privacy` | manter cópia até publicação externa |
| `app/(public)/termos` | `blackbelt-site/app/terms` | manter cópia até publicação externa |
| `app/(public)/suporte` e `app/(public)/ajuda` | `blackbelt-site/app/support` e futura central `help.blackbelt.com` | linkar help center externo quando existir |
| `components/landing/*` | `blackbelt-site/components/marketing/*` | shims locais durante a extração |

## blackbelt-app

| Origem atual | Destino | Compatibilidade temporária |
| --- | --- | --- |
| repositório atual `black_belt_v2` | `blackbelt-app` | identidade local já reposicionada |
| `app/(auth)` | `blackbelt-app/app/(auth)` | rotas preservadas |
| `app/(admin)` `app/(main)` `app/(professor)` etc. | `blackbelt-app/app/*` | rotas preservadas |
| `lib/api/*` | `features/*/services` gradualmente | manter re-export temporário quando mover implementação |
| `components/auth`, `components/finance`, `components/onboarding`, `components/landing` | `features/*/components` ou `components/domain` gradualmente | migração incremental |
| `supabase/`, `tests/`, `e2e/`, `ios/`, `android/` | permanecem em `blackbelt-app` | sem ruptura |

## blackbelt-infra-private

| Origem atual | Destino | Compatibilidade temporária |
| --- | --- | --- |
| partes operacionais de `docs/DEPLOYMENT.md`, `docs/RELEASE_GUIDE.md`, `docs/SECURITY.md` | `blackbelt-infra-private/runbooks/*` | manter cópia sanitizada no app |
| `scripts/backup-db.sh`, scripts operacionais e de release | `blackbelt-infra-private/scripts/*` | deixar wrappers no app apenas quando usados por build local |
| `.github/workflows/release.yml`, deploy privado, automações sensíveis | `blackbelt-infra-private/.github/workflows/*` | documentar separação antes do corte |
| segredos e inventário de integração | `blackbelt-infra-private/docs/secrets/` | nunca manter segredo real no app |
