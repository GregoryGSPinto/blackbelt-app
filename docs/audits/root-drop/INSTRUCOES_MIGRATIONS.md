# Instruções para Executar Migrations

## Passo a Passo

### 1. Acesse o SQL Editor do Supabase

1. Abra https://supabase.com/dashboard
2. Selecione o projeto **tdplmmodmumryzdosmpv**
3. No menu lateral, clique em **SQL Editor**

### 2. Execute as Migrations em Ordem

As migrations estão em `supabase/migrations/`. Execute cada uma **na ordem numérica**:

| # | Arquivo | O que faz |
|---|---------|-----------|
| 001 | `001_auth_profiles.sql` | Tabela profiles |
| 002 | `002_tenants.sql` | Academies, units, memberships |
| 003 | `003_classes.sql` | Classes, class_enrollments |
| 004 | `004_attendance.sql` | Tabela attendance |
| 005 | `005_pedagogic.sql` | Progressions, evaluations |
| 006 | `006_content.sql` | Videos, series |
| 007 | `007_social.sql` | Messages, conversations, notifications |
| 008 | `008_financial.sql` | Plans, subscriptions, invoices |
| 009 | `009_seed.sql` | Dados iniciais |
| 010 | `010_auth_trigger_and_policies.sql` | Trigger auto-create profile + policies |
| 011–020 | Incrementais | Seeds, RLS, indexes, fixes |
| 021–042 | Features | Pricing, telemetry, compete, belt promotions |
| 050–051 | Enterprise | Consolidação enterprise |
| 053 | `053_auth_trigger_aluno_default.sql` | Trigger default role → aluno_adulto |
| 054 | `054_missing_tables_final.sql` | Tabelas faltantes (announcements, certificates, etc.) |
| 055 | `055_tables_academy_config.sql` | Academy branding, billing, plans, usage, insights, spaces (21 tabelas) |
| 056 | `056_tables_financial.sql` | Devedores, contratos, mensalidades, products, orders, royalties, estoque (18 tabelas) |
| 057 | `057_tables_training.sql` | Professors, agenda, curricula, diários, técnicas, belts, match analysis (27 tabelas) |
| 058 | `058_tables_communication.sql` | Campaign metrics, notification logs, guardian, family, suggestions (13 tabelas) |
| 059 | `059_tables_gamification.sql` | Battle pass, seasons, leagues, hall of fame, titles, rewards, teen desafios (16 tabelas) |
| 060 | `060_tables_misc.sql` | Courses, streaming, kids, video series, wishlist (20 tabelas) |

### 3. Como Executar Cada Migration

1. Abra o arquivo `.sql` no seu editor
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique **Run** (ou Ctrl+Enter)
5. Verifique se não houve erros
6. Se houver erro de "already exists", ignore (as migrations usam `IF NOT EXISTS`)

### 4. Verificar o Schema

Após executar todas as migrations, rode o script de verificação:

```bash
npx tsx scripts/verify-schema.ts
```

Isso mostra quais tabelas existem e quais estão faltando.

### 5. Seed de Dados

Após as migrations, execute o seed:

```bash
npx tsx scripts/seed-full-academy.ts
```

## Dicas

- **Erro "permission denied"**: Verifique se está usando o SQL Editor (que roda como superuser)
- **Erro "relation already exists"**: Normal, a migration é idempotente
- **Erro "column already exists"**: Normal, já foi aplicada antes
- Se uma migration falha por dependência, execute a anterior primeiro

## Ordem de Prioridade

Se quiser executar apenas o essencial primeiro:

1. `001` → `010` (core: auth, tenants, classes, attendance, content, social, financial)
2. `053` (auth trigger fix)
3. `054` (missing tables — 14 tabelas)
4. `055` → `060` (115 tabelas adicionais — todas referenciadas por services)
5. Seed script
6. Demais migrations conforme necessário
