# Pricing Module Audit Report

**Data:** 2026-03-29
**Status:** Modulo EXISTE mas com valores desatualizados e modelo diferente do especificado

---

## 1. Rota /superadmin/planos

- **Status:** EXISTE em `app/(superadmin)/superadmin/planos/page.tsx`
- **Problema:** Usa modelo de pricing modular (faixas + modulos + pacotes) em vez do modelo de planos tiered (Starter/Essencial/Pro/Black Belt/Enterprise)
- **Problema:** Titulo em ingles ("Pricing Management")
- **Problema:** Cores CSS hardcoded (#f59e0b, #22c55e, #ef4444, #3b82f6) em vez de var(--bb-*)
- **Acao:** Reescrever completamente para modelo de planos com CRUD

## 2. Sidebar SuperAdminShell

- **Status:** Item "Planos" EXISTE na linha 69, rota `/superadmin/planos`
- **Icone atual:** CreditCardIcon
- **Acao:** Manter (funcional, visivel)

## 3. Types de Planos

- **billing.ts (PLANS):** Precos DESATUALIZADOS — Starter R$97, Essencial R$197, Pro R$347, Black Belt R$597
- **module-access.ts (PLANS):** Precos DESATUALIZADOS — Starter R$97, Essencial R$197, Pro R$347, Black Belt R$497
- **platform-plans.service.ts (PLATFORM_PLANS):** Precos DESATUALIZADOS — mesmos valores antigos
- **Acao:** Atualizar TODOS para R$79/149/249/397/0(Enterprise)

## 4. Services

- **pricing.service.ts:** EXISTE, modelo modular (faixas/modulos/pacotes), isMock() OK
- **platform-plans.service.ts:** EXISTE, isMock() OK
- **plans.service.ts dedicado para SuperAdmin CRUD:** NAO EXISTE
- **Acao:** Criar plans.service.ts com CRUD para SuperAdmin

## 5. Mock Data

- **pricing.mock.ts:** EXISTE, valores desatualizados (R$97-597)
- **plans.mock.ts dedicado:** NAO EXISTE
- **Acao:** Criar plans.mock.ts com 5 planos nos valores corretos

## 6. Constants de Features

- **lib/constants/plan-features.ts:** NAO EXISTE
- **Acao:** Criar com 26 features categorizadas

## 7. Supabase Migration

- **021_modular_pricing.sql:** EXISTE (modelo modular)
- **Migration dedicada para tabela plans:** NAO EXISTE
- **Acao:** Criar migration para tabela plans

## 8. Valores Encontrados vs Esperados

| Plano | Atual (billing.ts) | Atual (module-access.ts) | Esperado |
|-------|--------------------|-----------------------|----------|
| Starter | R$ 97 | R$ 97 | R$ 79 |
| Essencial | R$ 197 | R$ 197 | R$ 149 |
| Pro | R$ 347 | R$ 347 | R$ 249 |
| Black Belt | R$ 597 | R$ 497 | R$ 397 |
| Enterprise | R$ 0 | R$ 0 | R$ 0 (Sob consulta) |

## 9. Decisao

Pagina EXISTE mas precisa de rewrite completo + atualizacao de valores em 4 arquivos + criacao de 5 arquivos novos.
Fluxo: Agente 2 (atualizar valores existentes) → Agente 3 (criar tipos/service/mock/page novos) → Agente 4 → Agente 5
