# BlackBelt Current-State Audit

## 1. Estado Atual

O repositório atual concentra, em um único deploy Next.js/Capacitor:

- site comercial e páginas institucionais em `app/(public)` e `app/page.tsx`
- aplicação autenticada multi-perfil em `app/(admin)`, `app/(main)`, `app/(professor)`, `app/(kids)`, `app/(teen)`, `app/(parent)`, `app/(recepcao)`, `app/(franqueador)`, `app/(superadmin)` e `app/(cockpit)`
- borda HTTP e integrações em `app/api` e `supabase/functions`
- mobile shell em `ios/`, `android/`, `capacitor.config.ts`
- operação, release e compliance misturados em `docs/`, `scripts/`, `.github/`, `supabase/`

## 2. Problemas da Arquitetura Atual

- Mistura comercial/produto/operação no mesmo repositório.
- `app/` acumula páginas com lógica de negócio, especialmente fluxos públicos e autenticados.
- `lib/api` concentra serviços de negócio demais, sem sinalizar claramente fronteiras por feature.
- Billing SaaS do BlackBelt e cobrança operacional da academia coexistem no mesmo espaço mental.
- Documentos públicos, documentação interna e material de publicação em lojas estão acoplados ao app.
- Governança GitHub existe, mas ainda não comunica topologia madura de produto.

## 3. Topologia Final Recomendada

- `blackbelt-site`: aquisição, planos, demo, contato, legal, suporte público, SEO.
- `blackbelt-app`: sistema autenticado, mobile shell, APIs do produto, Supabase, dashboards, operação da academia, central da plataforma.
- `blackbelt-infra-private`: IaC, runbooks, workflows privados, segredos, observabilidade operacional.

## 4. Plano de Migração Seguro

1. Reposicionar este repositório como `blackbelt-app`.
2. Extrair gradualmente as entradas públicas/comerciais para `blackbelt-site`.
3. Mover documentação e automações sensíveis para `blackbelt-infra-private`.
4. Deixar `app/` como camada de rotas/layouts e introduzir entrypoints em `features/`.
5. Preservar compatibilidade temporária com shims de import quando necessário.

## 5. Riscos de Migração

- quebra de imports em rotas grandes
- acoplamentos implícitos entre páginas públicas e serviços do app
- risco de confusão temporária enquanto coexistirem deploy único e topologia futura
- dependência externa para criação/renomeação remota de repositórios e domínios

## 6. Quick Wins

- renomear identidade local para `blackbelt-app`
- adicionar scaffolds locais de `blackbelt-site` e `blackbelt-infra-private`
- criar guardas de arquitetura no CI
- mover rotas estratégicas para `features/`
- padronizar governança com `CONTRIBUTING.md`, `CODEOWNERS`, templates e PR checklist
