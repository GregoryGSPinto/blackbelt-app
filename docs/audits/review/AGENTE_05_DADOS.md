# AGENTE 05 — ESPECIALISTA DE DADOS
## Relatório de Auditoria de Integridade de Dados

**Data:** 2026-03-29
**Projeto:** BlackBelt v2

---

## 1. Visão Geral do Schema

| Métrica | Valor |
|---------|-------|
| Total de tabelas | 185 |
| Migrations SQL | 53 arquivos |
| Tabelas com RLS | 170+ |
| Tabelas com academy_id | 156 (84%) |

### Categorias de Tabelas
| Categoria | Quantidade |
|-----------|------------|
| Auth & Multi-Tenancy | 6 |
| Classes & Attendance | 8 |
| Pedagógico | 13 |
| Financeiro | 19 |
| Vídeo & Conteúdo | 14 |
| Compete/Torneios | 10 |
| Social & Gamificação | 25 |
| Kids Module | 8 |
| Comunicação & Família | 10 |
| Configuração Plataforma | 18 |
| Produtos & Inventário | 7 |
| Treino & Relatórios | 10 |
| Técnicas & Conteúdo | 5 |
| Misc/Outros | 15 |

---

## 2. Timestamps (created_at / updated_at)

| Status | Quantidade | % |
|--------|------------|---|
| Com created_at + updated_at | ~90 | 49% |
| Apenas created_at | ~35 | 19% |
| Sem timestamps | ~20 | 11% |
| Com trigger update_updated_at | Seletivo | — |

### Tabelas Críticas sem updated_at
- `notifications`, `achievements`, `messages`
- Tabelas de torneio: tournament_circuits, categories, brackets, matches, feed
- Tabelas de gamificação: seasons, leagues, titles, rewards
- Tabelas de conteúdo: courses, streaming_*

---

## 3. Foreign Keys

### Status Geral: ✅ BOM (175/185 com FKs adequados)

### Tabelas sem FK adequado (10)
- `error_logs` — Sem academy_id, sem user_id FK
- `visitantes` — Sem FK references
- `referral_clicks` — Apenas code, sem FK
- `devedores` — aluno_id sem FK reference
- `orders` — user_id sem FK reference
- `messages` — Sem academy_id ❌
- `push_tokens` — Apenas user_id
- + 3 tabelas de referência/lookup

---

## 4. Índices

### Cobertura: 120/185 tabelas (65%)

### Índices Existentes (migrations 013, 016)
- ✅ attendance: student_id, class_id, checked_at, unique daily
- ✅ students: academy_id, belt
- ✅ classes: professor_id, modality_id, unit_id, academy_id
- ✅ invoices: due_date, status
- ✅ memberships: profile_id, academy_id, status

### Índices Faltando
- ❌ messages.academy_id
- ❌ messages.created_at
- ❌ products.academy_id
- ❌ courses.creator_id
- ❌ Tabelas de gamificação sem índice academy_id

---

## 5. Multi-Tenancy (academy_id)

### Cobertura: 156/185 tabelas (84%)

### Tabelas sem academy_id que PRECISAM
| Tabela | Risco | Recomendação |
|--------|-------|-------------|
| messages | ALTO | Adicionar academy_id + FK |
| orders | MÉDIO | Adicionar academy_id para isolamento |
| error_logs | BAIXO | Adicionar para contexto |
| push_tokens | BAIXO | Aceitável (user-scoped) |

### Tabelas sem academy_id (por design)
- `profiles` — User-level, multi-academy
- `notifications` — User-scoped
- `feed_likes`, `feed_comments` — Via feed_posts FK
- Tabelas de referência e lookup

---

## 6. Soft Delete

### Status: ❌ INCONSISTENTE
- **1 tabela** usa `deleted_at` (messaging_system)
- Restante: hard delete
- **Recomendação:** Padronizar — ou implementar em todas, ou remover da messaging_system

---

## 7. Seed Data

### Status: ⚠️ NOOP
- Migration `009_seed.sql` é um no-op:
```sql
RAISE NOTICE 'Migration 009: Seed skipped. Use onboarding flow for demo data.';
```
- Seeds reais via scripts: `seed-demo-data.ts`, `seed-full-academy.ts`, `seed-trial-students.ts`
- **9 perfis** disponíveis no schema: superadmin, admin, professor, recepcionista, aluno_adulto, aluno_teen, aluno_kids, responsavel, franqueador

---

## 8. Módulo Compete

### Status: ✅ COMPLETO

| Tabela | Status | Verificação |
|--------|--------|-------------|
| tournaments | ✅ | 9 statuses, lifecycle completo |
| tournament_circuits | ✅ | Agrupamento de séries |
| tournament_categories | ✅ | Peso/faixa/idade/gênero |
| tournament_registrations | ✅ | user_id NULLABLE para avulso |
| tournament_brackets | ✅ | seed_data JSONB para geração |
| tournament_matches | ✅ | next_match_id para avanço |
| athlete_profiles | ✅ | Stats de carreira |
| academy_tournament_stats | ✅ | Ranking por academia |
| tournament_predictions | ✅ | Bolão de palpites |
| tournament_feed | ✅ | Feed ao vivo |

### Funcionalidades Confirmadas
- ✅ **Bracket generation:** seed_data JSONB + next_match_id
- ✅ **Atleta avulso:** user_id NULLABLE em tournament_registrations
- ✅ **Formatos:** single_elimination, double_elimination, round_robin
- ✅ **Super Admin aprova:** status 'aguardando_aprovacao' → lifecycle

---

## 9. Score de Integridade de Dados

| Critério | Peso | Score | Justificativa |
|----------|------|-------|---------------|
| Foreign Keys | 20% | 85 | 175/185 com FKs adequados |
| Índices | 20% | 65 | 120/185 com índices |
| Multi-Tenancy | 20% | 84 | 156/185 com academy_id |
| Timestamps | 15% | 70 | 90/185 com created_at + updated_at |
| Compete Module | 10% | 98 | 10/10 tabelas, avulso funcional |
| Seed Data | 10% | 40 | No-op em migration, scripts externos |
| Consistência | 5% | 60 | Soft delete inconsistente |

### **Score Final: 75/100**

---

## 10. Recomendações Prioritárias

1. **ALTO:** Adicionar `academy_id` + FK na tabela `messages`
2. **ALTO:** Criar índices em messages.created_at, products.academy_id
3. **MÉDIO:** Adicionar `updated_at` + trigger nas 35 tabelas faltantes
4. **MÉDIO:** Padronizar soft delete (adicionar deleted_at em todas ou remover)
5. **BAIXO:** Criar seed SQL com dados de demo para todos os 9 perfis
6. **BAIXO:** Adicionar FK constraints em orders.user_id, devedores.aluno_id
