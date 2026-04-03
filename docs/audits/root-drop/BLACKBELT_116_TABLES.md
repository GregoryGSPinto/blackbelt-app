# BLACKBELT v2 — Criação das 116 Tabelas Faltantes

## CONTEXTO

O projeto tem 327 tabelas referenciadas em `lib/api/*.service.ts`.
A migration `054_missing_tables_final.sql` criou 14 delas.
Restam ~116 tabelas que existem nos services mas NÃO existem nas migrations.
Quando um service faz `.from('tabela_que_nao_existe')`, o `safeSupabaseQuery` retorna fallback vazio — não crasheia, mas a funcionalidade fica oca.

**Objetivo:** Criar TODAS as tabelas faltantes com estrutura correta baseada no uso real nos services.

---

## EXECUÇÃO — 6 BLOCOS SEQUENCIAIS

### BLOCO 0 — Levantamento Atualizado

```bash
# 1. Extrair TODAS as tabelas referenciadas nos services
grep -roh "\.from('[a-z_]*')" lib/api/*.service.ts 2>/dev/null | sort -u | sed "s/\.from('//;s/')//" > /tmp/service_tables.txt

# 2. Extrair TODAS as tabelas já criadas nas migrations
grep -roh "CREATE TABLE IF NOT EXISTS[[:space:]]*\(public\.\)\?[a-z_]*\|CREATE TABLE[[:space:]]*\(public\.\)\?[a-z_]*" supabase/migrations/*.sql 2>/dev/null | sed 's/CREATE TABLE\( IF NOT EXISTS\)\?[[:space:]]*//' | sed 's/public\.//' | sort -u > /tmp/migration_tables.txt

# 3. Diff — tabelas faltantes
comm -23 /tmp/service_tables.txt /tmp/migration_tables.txt > /tmp/missing_tables.txt
echo "Tabelas faltantes: $(wc -l < /tmp/missing_tables.txt)"
cat /tmp/missing_tables.txt
```

Salve a lista completa. Ela será o checklist dos próximos blocos.

---

### BLOCO 1 — Inferir Schema de Cada Tabela (NÃO PULE ESTE PASSO)

Para CADA tabela em `/tmp/missing_tables.txt`, faça:

```bash
# Para cada tabela, extrair TODAS as colunas usadas nos services
TABLE="nome_da_tabela"
grep -n "'$TABLE'" lib/api/*.service.ts | head -30
```

Analise os patterns:
- `.select('col1, col2, col3')` → essas são as colunas
- `.insert({ col1: val, col2: val })` → essas são as colunas + tipos inferidos
- `.update({ col1: val })` → colunas atualizáveis
- `.eq('col', val)` → coluna usada como filtro (provavelmente indexada)
- `.order('col')` → coluna de ordenação
- `.is('col', null)` → coluna nullable

Para cada tabela, determine:
1. Lista de colunas com tipos inferidos
2. Chave primária (default: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`)
3. Foreign keys (`academy_id`, `profile_id`, `user_id` → references profiles/academies)
4. Timestamps (`created_at`, `updated_at`)
5. Se tem `academy_id` → RLS policy por academy

**Regras de inferência de tipo:**
- `*_id` → `uuid REFERENCES tabela(id)` (a menos que seja óbvio que não)
- `*_at` → `timestamptz DEFAULT now()`
- `*_date` → `date`
- `name`, `title`, `description`, `*_name` → `text`
- `is_*`, `has_*`, `*_active`, `*_enabled` → `boolean DEFAULT false`
- `amount`, `price`, `value`, `total` → `numeric(12,2)`
- `count`, `quantity`, `*_count` → `integer DEFAULT 0`
- `status` → `text DEFAULT 'active'`
- `role` → `text`
- `type` → `text`
- `url`, `*_url`, `image_url`, `avatar_url` → `text`
- `email` → `text`
- `phone` → `text`
- `metadata`, `config`, `settings`, `data`, `payload` → `jsonb DEFAULT '{}'::jsonb`
- `notes`, `content`, `body`, `message` → `text`
- `order`, `position`, `sort_order` → `integer DEFAULT 0`
- `percentage`, `rate` → `numeric(5,2)`
- `duration`, `*_minutes`, `*_seconds` → `integer`

---

### BLOCO 2 — Migrations em Lotes (055 a 060)

Divida as ~116 tabelas em 6 arquivos de migration, agrupadas por domínio funcional:

| Migration | Domínio | Exemplo de tabelas |
|-----------|---------|-------------------|
| `055_tables_academy_config.sql` | Academy config, branding, plans, settings | academy_branding, academy_events, academy_plans, academy_settings, academy_configs... |
| `056_tables_financial.sql` | Financeiro, pagamentos, invoices, contratos | payment_methods, contracts, discounts, coupons, charges, transactions... |
| `057_tables_training.sql` | Treino, aulas, grade, attendance extras | training_plans, exercises, workout_logs, class_templates, reservations... |
| `058_tables_communication.sql` | Comunicação, mensagens, notificações extras | messages, conversations, chat_rooms, templates, campaigns... |
| `059_tables_gamification.sql` | Gamificação, conquistas, rankings, seasons | badges, challenges, quests, missions, rewards, streaks, leaderboards... |
| `060_tables_misc.sql` | Restantes: documentos, relatórios, integrações | documents, reports, integrations, webhooks, audit_logs, surveys... |

**Template para CADA tabela:**

```sql
-- ── {NomeDaTabela} ──
CREATE TABLE IF NOT EXISTS public.{nome_tabela} (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  -- ... colunas inferidas do BLOCO 1 ...
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.{nome_tabela} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{nome_tabela}_academy_isolation"
  ON public.{nome_tabela}
  FOR ALL
  USING (
    academy_id IN (
      SELECT m.academy_id FROM public.memberships m
      WHERE m.profile_id = (
        SELECT p.id FROM public.profiles p
        WHERE p.user_id = auth.uid()
        LIMIT 1
      )
    )
  );
```

**Exceções ao template:**
- Tabelas sem `academy_id` (ex: `superadmin_*`, tabelas globais) → RLS com `auth.uid()` direto ou policy permissiva para superadmin
- Tabelas de junção (ex: `student_badges`) → chave composta ou duas FKs como PK
- Tabelas que referenciam `profile_id` em vez de `academy_id` → ajustar policy

**IMPORTANTE:**
- Use `CREATE TABLE IF NOT EXISTS` em TODAS
- NUNCA use `DROP TABLE`
- SEMPRE habilite RLS
- SEMPRE crie pelo menos uma policy

---

### BLOCO 3 — Typecheck + Build

```bash
pnpm typecheck 2>&1
pnpm build 2>&1
```

ZERO erros obrigatório. Se houver erro, corrija antes de prosseguir.

---

### BLOCO 4 — Atualizar verify-schema.ts

Abra `scripts/verify-schema.ts` e adicione TODAS as novas tabelas à lista `EXPECTED_TABLES`. A lista final deve ter ~230+ tabelas (as 232 existentes + ~116 novas, descontando duplicatas).

---

### BLOCO 5 — Atualizar INSTRUCOES_MIGRATIONS.md

Adicione as novas migrations (055–060) à lista de execução no doc.

---

### BLOCO 6 — Commit + Push

```bash
git add supabase/migrations/055_*.sql supabase/migrations/056_*.sql supabase/migrations/057_*.sql supabase/migrations/058_*.sql supabase/migrations/059_*.sql supabase/migrations/060_*.sql scripts/verify-schema.ts INSTRUCOES_MIGRATIONS.md

git commit -m "feat: migrations 055-060 — ~116 tabelas faltantes com RLS

- 055: academy config (branding, events, plans, settings)
- 056: financial (payments, contracts, discounts)
- 057: training (plans, exercises, workouts, reservations)
- 058: communication (messages, conversations, campaigns)
- 059: gamification (badges, challenges, quests, rewards)
- 060: misc (documents, reports, integrations, webhooks)
- verify-schema.ts atualizado com todas as tabelas
- INSTRUCOES_MIGRATIONS.md atualizado
- Todas com CREATE IF NOT EXISTS + RLS + policies"

git push origin main --force
```

---

## REGRAS INVIOLÁVEIS

1. **NÃO invente colunas.** Só crie colunas que APARECEM nos services (`.select`, `.insert`, `.update`, `.eq`, `.order`, `.is`). Se o service só faz `.from('tabela').select('*')`, crie a tabela com `id`, `academy_id`, `created_at`, `updated_at` como mínimo e adicione colunas que aparecem em `.eq()` ou `.order()`.

2. **NÃO delete migrations existentes.** Só adicione novas (055–060).

3. **NÃO modifique services.** Este prompt é só sobre migrations SQL.

4. **NÃO crie tabelas que já existem.** Use `CREATE TABLE IF NOT EXISTS` como segurança, mas verifique antes: se a tabela está em `/tmp/migration_tables.txt`, NÃO a inclua.

5. **CADA migration deve ser executável independentemente** — sem dependências de ordem entre 055–060 (exceto referências a tabelas que já existem nas migrations 001–054).

6. **pnpm typecheck && pnpm build ZERO erros** antes do commit.

7. **Todas as tabelas com `academy_id` DEVEM ter a RLS policy de isolamento por academy** (template acima).

---

## VERIFICAÇÃO FINAL

Após o push, rode:

```bash
# Contar tabelas em migrations agora
grep -roh "CREATE TABLE IF NOT EXISTS[[:space:]]*\(public\.\)\?[a-z_]*\|CREATE TABLE[[:space:]]*\(public\.\)\?[a-z_]*" supabase/migrations/*.sql 2>/dev/null | sed 's/CREATE TABLE\( IF NOT EXISTS\)\?[[:space:]]*//' | sed 's/public\.//' | sort -u | wc -l

# Contar tabelas nos services
grep -roh "\.from('[a-z_]*')" lib/api/*.service.ts 2>/dev/null | sort -u | wc -l

# Diff final — deve ser ZERO
comm -23 /tmp/service_tables_new.txt /tmp/migration_tables_new.txt | wc -l
```

O diff final DEVE ser **zero**. Se não for zero, crie migration 061 com as restantes e repita o verificação.

Reporte o resultado final no formato:
```
ANTES:  X tabelas em migrations / Y nos services / Z faltantes
DEPOIS: X tabelas em migrations / Y nos services / 0 faltantes
```
