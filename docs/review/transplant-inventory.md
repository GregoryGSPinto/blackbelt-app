# Inventario Pre-Transplante PrimalWOD → BlackBelt v2

**Data:** 2026-03-29
**Status:** Inventario completo — pronto para execucao dos 8 agentes

---

## 1. Estrutura de Rotas

80+ paginas mapeadas em `app/`. Grupos principais:
- `(admin)/admin/` — 50+ paginas (financeiro, alunos, contratos, config, etc.)
- `(superadmin)/superadmin/` — analytics, planos, contratos, config, etc.
- `(professor)/professor/` — dashboard, turmas, alunos, perfil, config
- `(recepcao)/recepcao/` — dashboard, checkin, atendimento, config
- `(main)/dashboard/` — aluno adulto (contrato, treinos, etc.)
- `(teen)/teen/` — dashboard teen, perfil, config
- `(kids)/kids/` — dashboard kids, perfil, config
- `(parent)/responsavel/` — dashboard responsavel
- `(franqueador)/franqueador/` — dashboard franqueador, config
- `(public)/` — landing, cadastro, compete, termos, privacidade
- `(auth)/` — login, register, recuperar-senha

## 2. Shells e Layouts

8 shells + ShellHeader:
- `AdminShell.tsx`, `ProfessorShell.tsx`, `MainShell.tsx` (aluno)
- `TeenShell.tsx`, `KidsShell.tsx`, `ParentShell.tsx`
- `RecepcaoShell.tsx`, `SuperAdminShell.tsx`
- `ShellHeader.tsx` — header compartilhado

12 layouts em `app/` (um por grupo de rotas + root).

## 3. Services

200+ services em `lib/api/`. Todos com `isMock()` branching.

## 4. Mocks

200+ mocks em `lib/mocks/`. Cobertura completa.

## 5. Migrations

20 migrations em `supabase/migrations/`. Ultima: `084_plans.sql`.

## 6. Toggles / Switches

**RESULTADO: Nenhum componente dedicado Toggle/Switch em `components/ui/`.**
- Apenas `translate-x-` encontrado em `BeltProgress.tsx` e `BeltPromotionCeremony.tsx` (centralizacao, nao toggle)
- Agente 1 precisa verificar se toggles inline existem em paginas individuais

## 7. ProfileSwitcher

**EXISTE:** `components/shared/ProfileSwitcher.tsx`
- Usado em TODOS os 8 shells + ShellHeader
- Agente 7 deve validar funcionalidade, nao criar do zero

## 8. Tour / Onboarding

**RESULTADO: Nenhum sistema de tour/tutorial existe.**
- Nenhum `has_seen_tour`, `first_visit`, ou componente de tour encontrado
- Agente 5 cria do zero

## 9. Contratos

Paginas existentes:
- `app/(admin)/admin/contratos/page.tsx`
- `app/(superadmin)/superadmin/contratos/page.tsx`
- `app/(main)/dashboard/contrato/page.tsx`
- Services: `contracts.service.ts`, `contratos-v2.service.ts`
- Agente 4 deve melhorar formatacao e adicionar download PDF

## 10. Guardian / Responsavel

- Nenhuma tabela `guardian_links` encontrada
- Mocks de responsavel existem: `responsavel.mock.ts`, `responsavel-jornada.mock.ts`, etc.
- Services: `responsavel.service.ts`, `responsavel-autorizacoes.service.ts`, etc.
- `parent-checkin.service.ts` e `pre-checkin.service.ts` existem
- Agente 6 cria tabela `guardian_links` e implementa auth modal

## 11. Financeiro / Baixa Manual

**RESULTADO: Nenhum campo `manual_payment` ou "baixa manual" existe.**
- `payment_method` existe apenas em orders/compete (loja e competicoes)
- Agente 3 adiciona campos e funcionalidade de baixa manual nas faturas

## 12. Configuracoes por Perfil

| Perfil | Perfil Page | Config Page |
|--------|-------------|-------------|
| superadmin | ❌ | ✅ config + storage |
| admin | ✅ perfil | ✅ config (audit-log, dados-bancarios, marca, pagamento, sso) |
| professor | ✅ perfil | ✅ config |
| recepcao | ❌ | ✅ config |
| aluno | ❌ | ❌ |
| teen | ✅ perfil | ✅ config |
| kids | ✅ perfil | ✅ config |
| responsavel | ❌ | ❌ |
| franqueador | ❌ | ✅ config |

**Faltando:** aluno (perfil + config), responsavel (perfil + config), superadmin (perfil), recepcao (perfil), franqueador (perfil)

## 13. Accent Color / Tema

**RESULTADO: Nenhum `useAccentColor` hook ou `accent_color` campo existe.**
- Agente 7 cria do zero

## 14. Botao Login

**JA CORRIGIDO** em sessao anterior.
- `app/(auth)/login/page.tsx` — "Entrando..." agora so aparece durante submissao real
- `canSubmit` valida campos preenchidos
- Agente 1 pode pular esta parte

## 15. PDF Downloads

- `lib/reports/financial-pdf.ts` — usa jsPDF para relatorios financeiros
- `lib/utils/export.ts` — menciona jsPDF
- `html2pdf.js` NAO esta instalado
- Agente 4 instala html2pdf.js para contratos

## Build Status

```
pnpm typecheck — ZERO erros
pnpm build — ZERO erros (verificado 2026-03-29)
```

---

## Plano de Execucao

| Agente | Tarefa | Dependencias |
|--------|--------|--------------|
| 1 | Toggle switch CSS fix (login ja feito) | Nenhuma |
| 2 | Profile settings compartilhado + paginas faltando + migration | Nenhuma |
| 3 | Baixa manual de pagamento | Nenhuma |
| 4 | Contratos formatacao + download PDF | html2pdf.js |
| 5 | Tour auto-trigger primeiro acesso | Migration do Agente 2 (has_seen_tour) |
| 6 | Responsavel pre-checkin + auth modal | Migration do Agente 2 (guardian_pin_hash) |
| 7 | Accent color + ProfileSwitcher | Migration do Agente 2 (accent_color) |
| 8 | Varredura final | Todos anteriores |
