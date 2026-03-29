# AGENTE 06 — ENGENHEIRO DE PERFORMANCE
## Relatório de Auditoria de Performance

**Data:** 2026-03-29
**Projeto:** BlackBelt v2

---

## 1. Queries Supabase — select('*')

### Status: ⚠️ PADRÃO GENERALIZADO

| Métrica | Valor |
|---------|-------|
| Services com select('*') | 196/239 (82%) |
| Instâncias de select('*') | 472 |

### Análise
O padrão `select('*')` é usado sistematicamente no projeto. Embora o Supabase SDK retorne dados tipados e o overhead seja moderado com RLS filtering, para escala enterprise a seleção explícita de colunas reduz:
- Payload de rede (especialmente em mobile/3G)
- Carga no banco de dados
- Tempo de serialização/deserialização

### Recomendação
Substituir gradualmente os `select('*')` em queries de alto tráfego:
- `auth.service.ts` — Login (4 instâncias)
- `attendance.service.ts` — Check-in diário
- `aluno.service.ts` — Dashboard do aluno
- `admin-dashboard.service.ts` — Dashboard admin

**Nota:** 78 services já usam `select('col1, col2, ...')` com colunas explícitas — bom padrão.

---

## 2. N+1 Queries

### Status: ⚠️ RISCO CONTROLADO

| Métrica | Valor |
|---------|-------|
| Services com loops | 60 |
| Services com async em loops | 43 |
| N+1 confirmados | 0 (padrão: pre-fetch com join) |

### Análise
O código usa um padrão seguro: busca dados com joins do Supabase e processa localmente em loops. Não foram encontrados N+1 queries reais (queries dentro de loops), mas o padrão de loops com dados pre-fetched pode evoluir para N+1 se a estrutura mudar.

---

## 3. Otimização de Imagens

### Status: ⚠️ 15 `<img>` tags

| Componente | Tipo | Status |
|-----------|------|--------|
| `next/image` imports | 6 arquivos | ✅ Usado corretamente |
| `<img>` tags (HTML) | 15 instâncias | ⚠️ Substituir por next/image |

### Arquivos com `<img>` tags
- `components/beta/BetaFeedbackFAB.tsx`
- `app/(admin)/admin/loja/produtos/page.tsx`
- `app/(admin)/admin/loja/page.tsx`
- `app/(superadmin)/superadmin/beta/page.tsx`
- + 11 outros arquivos

---

## 4. Dynamic Imports (Lazy Loading)

### Status: ✅ EXCELENTE

| Métrica | Valor |
|---------|-------|
| Arquivos com dynamic imports | 158 |
| Páginas com lazy loading | 20+ |

Padrão bem implementado em todo o projeto. Componentes pesados como dashboards, gráficos e modais usam `next/dynamic` para code splitting.

---

## 5. Debounce em Busca

### Status: ❌ IMPLEMENTAÇÃO MÍNIMA

| Métrica | Valor |
|---------|-------|
| Arquivos com debounce | 4 |
| Inputs de busca estimados | 100+ |
| Cobertura | ~4% |

### Arquivos com debounce
- `components/auth/EmailInput.tsx` ✅
- `components/shared/CommandPalette.tsx` ✅
- `app/(recepcao)/recepcao/atendimento/page.tsx` ✅
- `app/(recepcao)/recepcao/checkin/page.tsx` ✅

### Recomendação
Criar hook `useDebounce(value, ms)` e aplicar em todos os inputs de busca (300-500ms).

---

## 6. Memoização

### Status: ✅ COBERTURA MODERADA

| Métrica | Valor |
|---------|-------|
| Componentes com memo | 42 |
| Total de ocorrências | 174 (useMemo + useCallback + React.memo) |
| Cobertura | 24% dos componentes |

### Recomendação
Priorizar memoização em:
- Componentes de listagem com muitos itens
- Handlers passados como props para componentes filhos
- Cálculos derivados em dashboards

---

## 7. Paginação

### Status: ✅ BOA COBERTURA

| Métrica | Valor |
|---------|-------|
| Services com .limit() | 118 instâncias |
| Services com .range() | 7 instâncias |
| Services paginados | 73 arquivos |

A maioria das queries de listagem inclui limites, prevenindo full table scans.

---

## 8. PWA / Offline

### Status: ✅ IMPLEMENTADO

| Componente | Status |
|-----------|--------|
| Service Worker | ✅ Registrado via ServiceWorkerRegistrar |
| IndexedDB | ✅ 4 stores (checkins, feedback, classes, profile) |
| Offline sync | ✅ Queue de checkins pendentes |
| Install prompt | ✅ Com delay de 30s |
| Offline banner | ✅ OfflineBanner + OfflineIndicator |

---

## 9. Bundle Size

### Status: ✅ SEM PROBLEMAS

- 0 imports de lodash (evitado corretamente)
- Sem `import * as` de bibliotecas grandes
- Tree-shaking funcional
- Dynamic imports para code splitting

---

## 10. Score de Performance

| Critério | Peso | Score | Justificativa |
|----------|------|-------|---------------|
| Queries select('*') | 25% | 40 | 82% services com over-fetch |
| N+1 Queries | 15% | 85 | Padrão seguro, risco controlado |
| Imagens | 10% | 65 | 15 img tags, 6 next/image |
| Dynamic Imports | 10% | 95 | 158 arquivos com lazy loading |
| Debounce | 10% | 20 | Apenas 4 de 100+ inputs |
| Memoização | 10% | 60 | 24% cobertura |
| Paginação | 10% | 85 | 73 services paginados |
| PWA/Offline | 5% | 90 | Bem implementado |
| Bundle Size | 5% | 95 | Sem problemas |

### **Score Final: 62/100**

---

## 11. Top 5 Ações Prioritárias

1. **CRÍTICO:** Substituir `select('*')` por colunas explícitas nos top 20 services de alto tráfego
2. **ALTO:** Criar `useDebounce` hook e aplicar em todos os inputs de busca
3. **MÉDIO:** Converter 15 `<img>` tags para `next/image` com width/height
4. **MÉDIO:** Aumentar memoização em componentes de listagem pesada
5. **BAIXO:** Migrar de `.limit()` + offset para `.range()` cursor-based pagination
