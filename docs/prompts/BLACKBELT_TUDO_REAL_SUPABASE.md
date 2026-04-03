# BLACKBELT APP — TUDO REAL NO SUPABASE: ZERO MOCK
## O Prompt Que Transforma Demo em Produto Real
## Data: 03/04/2026 | Repo: GregoryGSPinto/blackbelt-app

---

> **CONTEXTO CRÍTICO:**
>
> O BlackBelt tem ~240 services em `lib/api/`. A maioria tem branch `isMock()`
> que retorna dados fake. Quando `NEXT_PUBLIC_USE_MOCK=false`, os services
> tentam buscar no Supabase, mas muitas tabelas não existem ou estão vazias.
> Resultado: telas com "Planos indisponíveis", "Algo deu errado", dados vazios.
>
> **ESTE PROMPT RESOLVE ISSO DE VEZ:**
> 1. Verifica TODAS as tabelas que o código referencia
> 2. Cria as que faltam via migrations
> 3. Popula com dados realistas (seed)
> 4. Configura planos com enforcement de features
> 5. Garante que CADA tela carrega sem erro
>
> **SUPABASE PROJECT:** `tdplmmodmumryzdosmpv`
> **SUPABASE URL:** `https://tdplmmodmumryzdosmpv.supabase.co`
> **ACADEMY_ID (demo):** `809f2763-0096-4cfa-8057-b5b029cbc62f`
>
> **PRÉ-REQUISITO:** O `.env.local` DEVE ter:
> ```
> NEXT_PUBLIC_USE_MOCK=false
> NEXT_PUBLIC_SUPABASE_URL=https://tdplmmodmumryzdosmpv.supabase.co
> NEXT_PUBLIC_SUPABASE_ANON_KEY=<JWT anon key — NÃO sb_publishable>
> SUPABASE_SERVICE_ROLE_KEY=<service role key>
> ```
>
> **SE a anon key começa com `sb_publishable_`:** É o formato novo que
> QUEBRA o `@supabase/ssr`. Precisa usar a Legacy JWT key. No Supabase
> Dashboard → Settings → API Keys → scroll down → Legacy Keys → copiar
> a `anon` key que começa com `eyJ`.
>
> **REGRAS:**
> - NUNCA delete blocos `isMock()` — manter AMBOS os branches
> - `handleServiceError(error)` em todo catch
> - Se uma tabela não existe no Supabase: criar migration
> - Se uma tabela existe mas está vazia: popular com seed
> - Se um service falha: NUNCA travar a UI — retornar fallback vazio
> - CSS var(--bb-*). Toast PT-BR. Mobile-first.
>
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`

---

## BLOCO 01 — DIAGNÓSTICO: MAPA COMPLETO DO GAP
### Descobrir EXATAMENTE o que falta no Supabase

```bash
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  DIAGNÓSTICO: MOCK vs REAL                                ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Carregar env
set -a && source .env.local 2>/dev/null && set +a

# 1. Verificar conexão com Supabase
echo ""
echo "=== 1. CONEXÃO SUPABASE ==="
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null)
echo "HTTP Status: $RESPONSE"
if [ "$RESPONSE" != "200" ]; then
  echo "❌ NÃO CONECTOU ao Supabase — verificar env vars"
  echo "URL: $NEXT_PUBLIC_SUPABASE_URL"
  echo "Key começa com: $(echo $SUPABASE_SERVICE_ROLE_KEY | head -c 20)..."
  exit 1
fi
echo "✅ Conectado ao Supabase"

# 2. Listar TODAS as tabelas que existem no Supabase
echo ""
echo "=== 2. TABELAS EXISTENTES NO SUPABASE ==="
EXISTING_TABLES=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(k) for k in sorted(d.keys()) if isinstance(d,dict)]" 2>/dev/null)
EXISTING_COUNT=$(echo "$EXISTING_TABLES" | grep -c "." 2>/dev/null || echo "0")
echo "Total: $EXISTING_COUNT tabelas"
echo "$EXISTING_TABLES" | head -50

# 3. Listar TODAS as tabelas referenciadas no código
echo ""
echo "=== 3. TABELAS REFERENCIADAS NO CÓDIGO ==="
grep -roh "\.from(['\"][a-z_]*['\"])" lib/api/ app/api/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  sed "s/\.from(['\"]//;s/['\"])//" | sort -u > /tmp/bb_code_tables.txt
CODE_COUNT=$(wc -l < /tmp/bb_code_tables.txt | tr -d ' ')
echo "Total: $CODE_COUNT tabelas referenciadas"
cat /tmp/bb_code_tables.txt

# 4. Encontrar tabelas que o código usa mas NÃO existem no Supabase
echo ""
echo "=== 4. TABELAS FALTANTES (código usa, Supabase não tem) ==="
echo "$EXISTING_TABLES" > /tmp/bb_existing_tables.txt
MISSING=""
MISSING_COUNT=0
while IFS= read -r table; do
  if ! echo "$EXISTING_TABLES" | grep -qx "$table"; then
    echo "  ❌ $table"
    MISSING="$MISSING $table"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done < /tmp/bb_code_tables.txt
echo ""
echo "Total faltantes: $MISSING_COUNT"

# 5. Verificar tabelas existentes que estão VAZIAS
echo ""
echo "=== 5. TABELAS VAZIAS (existem mas sem dados) ==="
EMPTY_COUNT=0
for table in $(echo "$EXISTING_TABLES" | head -30); do
  COUNT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=id&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Prefer: count=exact" \
    -H "Range: 0-0" \
    -w "\n%{http_code}" 2>/dev/null | tail -1)
  BODY=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=id&limit=1" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null)
  if [ "$BODY" = "[]" ]; then
    echo "  ⚪ $table (vazia)"
    EMPTY_COUNT=$((EMPTY_COUNT + 1))
  fi
done
echo "Total vazias: $EMPTY_COUNT"

# 6. Verificar migrations existentes
echo ""
echo "=== 6. MIGRATIONS ==="
MIGRATION_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')
echo "Total: $MIGRATION_COUNT arquivos SQL"
ls supabase/migrations/*.sql 2>/dev/null | tail -10

# 7. Verificar planos
echo ""
echo "=== 7. PLANOS NO BANCO ==="
for table in platform_plans plans subscription_plans academy_plans pricing_plans; do
  RESULT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*&limit=5" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null)
  if echo "$RESULT" | grep -q "id"; then
    echo "  ✅ $table: $(echo $RESULT | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null) registros"
  fi
done

# 8. Verificar users no Auth
echo ""
echo "=== 8. USERS NO AUTH ==="
USERS=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null)
USER_COUNT=$(echo "$USERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('users',[])))" 2>/dev/null || echo "?")
echo "Total: $USER_COUNT users"

# 9. Verificar a anon key
echo ""
echo "=== 9. ANON KEY FORMAT ==="
if echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | grep -q "^sb_publishable"; then
  echo "⚠️  FORMATO NOVO (sb_publishable_) — pode quebrar @supabase/ssr"
  echo "   Precisa usar Legacy JWT key (começa com eyJ)"
elif echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | grep -q "^eyJ"; then
  echo "✅ Formato JWT — compatível"
else
  echo "❓ Formato desconhecido: $(echo $NEXT_PUBLIC_SUPABASE_ANON_KEY | head -c 20)..."
fi

# 10. Verificar NEXT_PUBLIC_USE_MOCK
echo ""
echo "=== 10. MOCK MODE ==="
echo "NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK"
if [ "$NEXT_PUBLIC_USE_MOCK" = "true" ]; then
  echo "⚠️  MOCK AINDA ATIVO — mudar para false"
fi

# Salvar diagnóstico
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  RESUMO                                                    ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Tabelas no código: $CODE_COUNT                            ║"
echo "║  Tabelas no Supabase: $EXISTING_COUNT                     ║"
echo "║  Tabelas faltantes: $MISSING_COUNT                        ║"
echo "║  Tabelas vazias: $EMPTY_COUNT                             ║"
echo "║  Migrations: $MIGRATION_COUNT                             ║"
echo "║  Users no Auth: $USER_COUNT                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
```

**Salvar diagnóstico:**
```bash
# Salvar resultado em arquivo para referência
# (o output do terminal acima já mostra tudo)

git add -A && git commit -m "diag: mapa completo mock vs real — tabelas faltantes e vazias" 2>/dev/null
```

---

## BLOCO 02 — CRIAR TABELAS FALTANTES
### Migration com TODAS as tabelas que o código usa e não existem

**Com base no diagnóstico do Bloco 01, criar UMA migration que cria TODAS as tabelas faltantes.**

Para CADA tabela faltante identificada:
1. Buscar no código como ela é usada: `grep -rn "from('NOME_TABELA')" lib/api/ app/api/`
2. Identificar as colunas: `grep -rn "NOME_TABELA" lib/types/ --include="*.ts"`
3. Criar o CREATE TABLE com as colunas corretas
4. Adicionar RLS com policy usando `get_my_academy_ids()` (se multi-tenant)
5. Adicionar indexes nas colunas mais filtradas

**Criar o arquivo de migration:**
```bash
# Próximo número de migration
NEXT_NUM=$(ls supabase/migrations/*.sql 2>/dev/null | sort | tail -1 | grep -o "[0-9]\+" | head -1)
NEXT_NUM=$((NEXT_NUM + 1))
MIGRATION_FILE="supabase/migrations/$(printf '%03d' $NEXT_NUM)_create_missing_tables.sql"

echo "Criando $MIGRATION_FILE..."
```

**A migration DEVE incluir estas tabelas essenciais (se não existirem):**

```sql
-- ============================================
-- TABELAS ESSENCIAIS QUE DEVEM EXISTIR
-- ============================================

-- 1. PLANOS DA PLATAFORMA (SuperAdmin gerencia)
CREATE TABLE IF NOT EXISTS platform_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- centavos
  price_yearly INTEGER NOT NULL DEFAULT 0, -- centavos
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  max_students INTEGER, -- null = ilimitado
  max_professors INTEGER,
  max_classes INTEGER,
  storage_gb INTEGER DEFAULT 1,
  has_video BOOLEAN DEFAULT false,
  has_ai BOOLEAN DEFAULT false,
  has_compete BOOLEAN DEFAULT false,
  has_api BOOLEAN DEFAULT false,
  has_franchise BOOLEAN DEFAULT false,
  has_whatsapp BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ASSINATURAS DAS ACADEMIAS
CREATE TABLE IF NOT EXISTS academy_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL,
  plan_id UUID REFERENCES platform_plans(id),
  plan_slug VARCHAR(50) NOT NULL DEFAULT 'trial',
  status VARCHAR(20) NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial','active','past_due','cancelled','suspended','expired')),
  trial_start TIMESTAMPTZ DEFAULT now(),
  trial_end TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  price_cents INTEGER DEFAULT 0,
  payment_method VARCHAR(30),
  asaas_subscription_id VARCHAR(255),
  asaas_customer_id VARCHAR(255),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

-- 3. USO/CONSUMO DA ACADEMIA (para enforcement de limites)
CREATE TABLE IF NOT EXISTS academy_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL UNIQUE,
  current_students INTEGER DEFAULT 0,
  current_professors INTEGER DEFAULT 0,
  current_classes INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para todas
ALTER TABLE platform_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_usage ENABLE ROW LEVEL SECURITY;

-- platform_plans: leitura pública (qualquer user logado vê os planos)
CREATE POLICY "plans_read" ON platform_plans FOR SELECT USING (true);
-- platform_plans: escrita só SuperAdmin (via service role)

-- academy_subscriptions: academy admin vê a sua
CREATE POLICY "sub_read" ON academy_subscriptions FOR SELECT USING (
  academy_id IN (SELECT public.get_my_academy_ids())
);

-- academy_usage: academy admin vê a sua
CREATE POLICY "usage_read" ON academy_usage FOR SELECT USING (
  academy_id IN (SELECT public.get_my_academy_ids())
);
```

**Para TODAS as outras tabelas faltantes identificadas no diagnóstico:**
- Seguir o mesmo padrão: CREATE TABLE IF NOT EXISTS + RLS + indexes
- Usar os types em `lib/types/` como referência para colunas
- Se não tem certeza do schema, criar com colunas mínimas (id, academy_id, created_at)

**Aplicar a migration:**
```bash
# Tentar via Supabase CLI
npx supabase db push 2>/dev/null

# Se não funcionar, aplicar via REST API
if [ $? -ne 0 ]; then
  echo "CLI falhou — aplicando via REST API..."
  SQL_CONTENT=$(cat "$MIGRATION_FILE")
  
  # Aplicar via pg endpoint se disponível
  curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"sql_text\": $(echo "$SQL_CONTENT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")}" 2>/dev/null
  
  # Se ainda não funcionar, criar script TypeScript
  if [ $? -ne 0 ]; then
    echo "REST falhou — criando script de aplicação..."
    cat > scripts/apply-migration.ts << 'APPLY'
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function apply() {
  const sql = readFileSync(process.argv[2] || 'supabase/migrations/latest.sql', 'utf-8');
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let applied = 0;
  let failed = 0;
  
  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_text: stmt + ';' });
      if (error) {
        if (error.message?.includes('already exists')) {
          console.log(`  ⏭️  Já existe`);
        } else {
          console.error(`  ❌ ${error.message?.substring(0, 100)}`);
          failed++;
        }
      } else {
        applied++;
      }
    } catch (e) {
      console.error(`  ❌ ${String(e).substring(0, 100)}`);
      failed++;
    }
  }
  
  console.log(`\n✅ ${applied} aplicadas, ❌ ${failed} falharam`);
}

apply().catch(console.error);
APPLY
    
    npx tsx scripts/apply-migration.ts "$MIGRATION_FILE"
  fi
fi

echo ""
echo "=== VERIFICAR TABELAS APÓS MIGRATION ==="
# Re-verificar as tabelas faltantes
```

**SE NENHUM MÉTODO FUNCIONAR para aplicar via código:**

Gerar o arquivo `docs/MIGRATION_MANUAL.md` com instruções claras:
```
Gregory, este SQL precisa ser rodado no Supabase Dashboard:
1. Abra https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo: supabase/migrations/XXX_create_missing_tables.sql
4. Clique Run
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: migration — criar todas tabelas faltantes referenciadas no código"
git push origin main
```

---

## BLOCO 03 — SEED: PLANOS + ACADEMIA + DADOS REALISTAS
### Popular o banco com dados que fazem o app parecer vivo

**Criar script de seed:**

```bash
cat > scripts/seed-production.ts << 'SEED_SCRIPT'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seed() {
  console.log('🌱 Iniciando seed...');

  // ========================================
  // 1. PLANOS DA PLATAFORMA
  // ========================================
  console.log('\n📋 Criando planos...');
  
  const plans = [
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Para academias iniciantes',
      price_monthly: 9700, // R$ 97
      price_yearly: 97000, // R$ 970 (12x com desconto)
      is_default: true,
      is_active: true,
      max_students: 50,
      max_professors: 2,
      max_classes: 5,
      storage_gb: 1,
      has_video: false,
      has_ai: false,
      has_compete: false,
      has_api: false,
      has_franchise: false,
      has_whatsapp: false,
      sort_order: 1,
    },
    {
      name: 'Essencial',
      slug: 'essencial',
      description: 'Para academias em crescimento',
      price_monthly: 19700, // R$ 197
      price_yearly: 197000,
      is_default: true,
      is_active: true,
      max_students: 150,
      max_professors: 5,
      max_classes: 15,
      storage_gb: 5,
      has_video: false,
      has_ai: false,
      has_compete: true,
      has_api: false,
      has_franchise: false,
      has_whatsapp: true,
      sort_order: 2,
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Mais popular — tudo que sua academia precisa',
      price_monthly: 34700, // R$ 347
      price_yearly: 347000,
      is_default: true,
      is_active: true,
      max_students: 500,
      max_professors: 15,
      max_classes: 50,
      storage_gb: 20,
      has_video: true,
      has_ai: true,
      has_compete: true,
      has_api: true,
      has_franchise: false,
      has_whatsapp: true,
      sort_order: 3,
    },
    {
      name: 'Black Belt',
      slug: 'black-belt',
      description: 'Para redes e academias grandes',
      price_monthly: 59700, // R$ 597
      price_yearly: 597000,
      is_default: true,
      is_active: true,
      max_students: 2000,
      max_professors: 50,
      max_classes: 200,
      storage_gb: 100,
      has_video: true,
      has_ai: true,
      has_compete: true,
      has_api: true,
      has_franchise: true,
      has_whatsapp: true,
      sort_order: 4,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Sob medida — contato comercial',
      price_monthly: 0, // sob consulta
      price_yearly: 0,
      is_default: true,
      is_active: true,
      max_students: null, // ilimitado
      max_professors: null,
      max_classes: null,
      storage_gb: 1000,
      has_video: true,
      has_ai: true,
      has_compete: true,
      has_api: true,
      has_franchise: true,
      has_whatsapp: true,
      sort_order: 5,
    },
  ];

  for (const plan of plans) {
    const { error } = await supabase
      .from('platform_plans')
      .upsert(plan, { onConflict: 'slug' });
    if (error) {
      console.log(`  ⚠️  ${plan.name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${plan.name}: R$ ${(plan.price_monthly / 100).toFixed(0)}/mês`);
    }
  }

  // ========================================
  // 2. VINCULAR ACADEMIA AO PLANO PRO (trial)
  // ========================================
  console.log('\n🏢 Vinculando academia ao plano...');
  
  const ACADEMY_ID = '809f2763-0096-4cfa-8057-b5b029cbc62f';
  
  // Buscar o plano Pro
  const { data: proPlan } = await supabase
    .from('platform_plans')
    .select('id')
    .eq('slug', 'pro')
    .single();
  
  if (proPlan) {
    const { error } = await supabase
      .from('academy_subscriptions')
      .upsert({
        academy_id: ACADEMY_ID,
        plan_id: proPlan.id,
        plan_slug: 'pro',
        status: 'trial',
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 dias
        price_cents: 34700,
      }, { onConflict: 'academy_id' });
    
    if (error) {
      console.log(`  ⚠️  Subscription: ${error.message}`);
    } else {
      console.log('  ✅ Academia vinculada ao plano Pro (trial 7 dias)');
    }
  }

  // ========================================
  // 3. USAGE DA ACADEMIA
  // ========================================
  console.log('\n📊 Configurando usage...');
  
  const { error: usageErr } = await supabase
    .from('academy_usage')
    .upsert({
      academy_id: ACADEMY_ID,
      current_students: 127,
      current_professors: 4,
      current_classes: 12,
      storage_used_mb: 245,
      last_calculated_at: new Date().toISOString(),
    }, { onConflict: 'academy_id' });
  
  if (usageErr) {
    console.log(`  ⚠️  Usage: ${usageErr.message}`);
  } else {
    console.log('  ✅ Usage configurado');
  }

  console.log('\n✅ Seed concluído!');
}

seed().catch(console.error);
SEED_SCRIPT
```

**Rodar o seed:**
```bash
npx tsx scripts/seed-production.ts
```

**Verificar:**
```bash
echo "=== PLANOS NO BANCO ==="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/platform_plans?select=name,slug,price_monthly,is_active&order=sort_order" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== SUBSCRIPTION DA ACADEMIA ==="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/academy_subscriptions?select=*&academy_id=eq.809f2763-0096-4cfa-8057-b5b029cbc62f" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | python3 -m json.tool 2>/dev/null
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: seed — planos, subscription, usage no Supabase real"
git push origin main
```

---

## BLOCO 04 — SERVICES: PLANOS E SUBSCRIPTION REAIS
### Conectar os services de planos ao Supabase (não mais mock)

**Diagnóstico:**
```bash
echo "=== SERVICES DE PLANOS ==="
grep -rn "platform.plans\|platform_plans\|platformPlans\|getPlans\|fetchPlans\|listPlans\|planos\|subscription\|assinatura" lib/api/ --include="*.ts" | head -30

echo ""
echo "=== SERVICES QUE USAM usoDescoberta ==="
grep -rn "usoDescoberta\|uso_descoberta\|discovery\|descoberta\|trial" lib/api/ app/ components/ --include="*.ts" --include="*.tsx" | head -20

echo ""
echo "=== COMPONENTES QUE MOSTRAM PLANOS ==="
grep -rn "Planos\|planos\|pricing\|Plans\|plans\|subscription\|Subscription" app/ components/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." | head -30
```

**Para CADA service de planos encontrado:**

1. **Garantir que o branch `!isMock()` busca do Supabase:**
```typescript
// Exemplo de service correto:
export async function getPlans(): Promise<Plan[]> {
  if (isMock()) {
    return mockPlans; // manter o mock branch
  }
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) {
      handleServiceError(error);
      return []; // fallback vazio, NUNCA throw
    }
    
    return data ?? [];
  } catch (err) {
    handleServiceError(err);
    return [];
  }
}
```

2. **Corrigir o bug `r.usoDescoberta is not iterable`:**
```bash
# Encontrar onde usoDescoberta é usado
grep -rn "usoDescoberta" lib/ app/ components/ --include="*.ts" --include="*.tsx"
```
O fix é garantir que o campo é sempre um array:
```typescript
// No service ou componente que consome:
const usoDescoberta = Array.isArray(data?.usoDescoberta) 
  ? data.usoDescoberta 
  : [];
```

3. **Service de subscription da academia:**
```typescript
export async function getAcademySubscription(academyId: string) {
  if (isMock()) {
    return mockSubscription;
  }
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('academy_subscriptions')
      .select('*, platform_plans(*)')
      .eq('academy_id', academyId)
      .single();
    
    if (error) {
      handleServiceError(error);
      return null;
    }
    
    return data;
  } catch (err) {
    handleServiceError(err);
    return null;
  }
}
```

4. **Componente de "Meu Plano" no Admin:**
   - Deve buscar a subscription da academia
   - Mostrar: nome do plano, status (trial/ativo), data de expiração
   - Se trial: "X dias restantes"
   - Botão "Ver planos" leva pra comparação de planos

5. **Página de planos do SuperAdmin:**
   - Listar todos os planos com `getPlans()`
   - Mostrar quantas academias usam cada plano
   - CRUD funcional

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: services de planos e subscription — Supabase real, zero mock"
git push origin main
```

---

## BLOCO 05 — ENFORCEMENT DE FEATURES POR PLANO
### O software OBEDECE o plano — restringe o que não está incluído

**Criar hook de verificação de plano:**

```typescript
// lib/hooks/usePlanFeatures.ts
'use client';

import { useState, useEffect } from 'react';
import { isMock } from '@/lib/api/utils';

interface PlanFeatures {
  planName: string;
  planSlug: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended' | 'expired';
  maxStudents: number | null;
  maxProfessors: number | null;
  maxClasses: number | null;
  hasVideo: boolean;
  hasAi: boolean;
  hasCompete: boolean;
  hasApi: boolean;
  hasFranchise: boolean;
  hasWhatsapp: boolean;
  trialDaysLeft: number | null;
  isTrialActive: boolean;
  canAccess: (feature: string) => boolean;
  isAtLimit: (resource: 'students' | 'professors' | 'classes') => boolean;
}

const FEATURE_MAP: Record<string, string> = {
  'video': 'hasVideo',
  'ai': 'hasAi',
  'compete': 'hasCompete',
  'api': 'hasApi',
  'franchise': 'hasFranchise',
  'whatsapp': 'hasWhatsapp',
};

export function usePlanFeatures(): PlanFeatures {
  const [features, setFeatures] = useState<PlanFeatures>({
    planName: 'Pro',
    planSlug: 'pro',
    status: 'trial',
    maxStudents: 500,
    maxProfessors: 15,
    maxClasses: 50,
    hasVideo: true,
    hasAi: true,
    hasCompete: true,
    hasApi: true,
    hasFranchise: false,
    hasWhatsapp: true,
    trialDaysLeft: 7,
    isTrialActive: true,
    canAccess: () => true,
    isAtLimit: () => false,
  });

  useEffect(() => {
    if (isMock()) return; // mock retorna tudo liberado
    
    async function loadPlan() {
      try {
        const res = await fetch('/api/academy/plan');
        if (!res.ok) return;
        const data = await res.json();
        
        const trialEnd = data.subscription?.trial_end ? new Date(data.subscription.trial_end) : null;
        const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
        const isTrialActive = data.subscription?.status === 'trial' && (trialDaysLeft ?? 0) > 0;
        
        // During trial, ALL features are unlocked
        const plan = data.plan;
        const allUnlocked = isTrialActive;
        
        setFeatures({
          planName: plan?.name ?? 'Sem plano',
          planSlug: plan?.slug ?? 'none',
          status: data.subscription?.status ?? 'expired',
          maxStudents: allUnlocked ? null : plan?.max_students ?? 50,
          maxProfessors: allUnlocked ? null : plan?.max_professors ?? 2,
          maxClasses: allUnlocked ? null : plan?.max_classes ?? 5,
          hasVideo: allUnlocked || plan?.has_video === true,
          hasAi: allUnlocked || plan?.has_ai === true,
          hasCompete: allUnlocked || plan?.has_compete === true,
          hasApi: allUnlocked || plan?.has_api === true,
          hasFranchise: allUnlocked || plan?.has_franchise === true,
          hasWhatsapp: allUnlocked || plan?.has_whatsapp === true,
          trialDaysLeft,
          isTrialActive,
          canAccess: (feature: string) => {
            if (allUnlocked) return true;
            const key = FEATURE_MAP[feature];
            return key ? (plan?.[key] === true) : true;
          },
          isAtLimit: (resource) => {
            if (allUnlocked) return false;
            const limits: Record<string, number | null> = {
              students: plan?.max_students,
              professors: plan?.max_professors,
              classes: plan?.max_classes,
            };
            const usage: Record<string, number> = {
              students: data.usage?.current_students ?? 0,
              professors: data.usage?.current_professors ?? 0,
              classes: data.usage?.current_classes ?? 0,
            };
            const limit = limits[resource];
            return limit !== null && limit !== undefined && usage[resource] >= limit;
          },
        });
      } catch {
        // Silently fail — keep defaults (all unlocked for trial)
      }
    }
    
    loadPlan();
  }, []);

  return features;
}
```

**Criar API route para buscar plano da academia:**

```typescript
// app/api/academy/plan/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Buscar academy_id do user
    const { data: profile } = await supabase
      .from('profiles')
      .select('academy_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!profile?.academy_id) {
      return NextResponse.json({ plan: null, subscription: null, usage: null });
    }

    // Buscar subscription com plano
    const { data: subscription } = await supabase
      .from('academy_subscriptions')
      .select('*, platform_plans(*)')
      .eq('academy_id', profile.academy_id)
      .single();

    // Buscar usage
    const { data: usage } = await supabase
      .from('academy_usage')
      .select('*')
      .eq('academy_id', profile.academy_id)
      .single();

    return NextResponse.json({
      plan: subscription?.platform_plans ?? null,
      subscription: subscription ? { ...subscription, platform_plans: undefined } : null,
      usage: usage ?? null,
    });
  } catch (err) {
    console.error('Error fetching plan:', err);
    return NextResponse.json({ plan: null, subscription: null, usage: null });
  }
}
```

**Criar componente de gate de feature:**

```tsx
// components/shared/FeatureGate.tsx
'use client';

import { usePlanFeatures } from '@/lib/hooks/usePlanFeatures';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  feature: 'video' | 'ai' | 'compete' | 'api' | 'franchise' | 'whatsapp';
  children: React.ReactNode;
}

export function FeatureGate({ feature, children }: FeatureGateProps) {
  const plan = usePlanFeatures();
  
  if (plan.canAccess(feature)) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--bb-depth-2)] bg-[var(--bb-depth-0)] p-8 text-center">
      <Lock className="h-8 w-8 text-[var(--bb-ink-4)] mb-3" />
      <h3 className="text-base font-semibold text-[var(--bb-ink-1)] mb-1">
        Recurso do plano {plan.planSlug === 'starter' ? 'Essencial' : 'Pro'}
      </h3>
      <p className="text-sm text-[var(--bb-ink-3)] mb-4">
        Este recurso não está disponível no seu plano atual ({plan.planName}).
      </p>
      <Link href="/admin/planos" 
        className="text-sm font-medium text-[var(--bb-brand)] hover:underline">
        Comparar planos
      </Link>
    </div>
  );
}
```

**Aplicar o FeatureGate nas páginas que dependem de features do plano:**

```bash
# Encontrar páginas de vídeo, IA, compete que devem ter gate
grep -rn "video\|Video\|conteudo\|Conteudo" app/ --include="*.tsx" -l | grep -v "\.test\." | head -10
grep -rn "ai\|AI\|coach\|Coach" app/ --include="*.tsx" -l | grep -v "\.test\." | head -10
grep -rn "compete\|Compete\|campeonato\|Campeonato" app/ --include="*.tsx" -l | grep -v "\.test\." | head -10
```

Para cada página que depende de feature do plano:
```tsx
import { FeatureGate } from '@/components/shared/FeatureGate';

// Wrappear o conteúdo:
export default function VideosPage() {
  return (
    <FeatureGate feature="video">
      {/* conteúdo original da página */}
    </FeatureGate>
  );
}
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: enforcement de features por plano — FeatureGate, usePlanFeatures, API route"
git push origin main
```

---

## BLOCO 06 — VARREDURA: ZERO TELAS COM ERRO
### Garantir que NENHUMA tela quebra com dados reais

```bash
echo "=== VARREDURA DE TELAS ==="

# 1. Encontrar TODOS os services que ainda podem falhar
grep -rn "from('" lib/api/ --include="*.ts" | sed "s/.*from('//;s/').*//" | sort -u > /tmp/bb_all_tables.txt
echo "Services referenciam $(wc -l < /tmp/bb_all_tables.txt | tr -d ' ') tabelas"

# 2. Encontrar services sem tratamento de erro adequado
grep -rn "\.from(" lib/api/ --include="*.ts" -l | while read f; do
  if ! grep -q "handleServiceError\|catch\|try" "$f"; then
    echo "  ⚠️  SEM try/catch: $f"
  fi
done

# 3. Verificar que TODOS os services têm fallback pra quando Supabase falha
grep -rn "\.from(" lib/api/ --include="*.ts" -l | while read f; do
  HAS_FALLBACK=$(grep -c "return \[\]\|return null\|return {}\|?? \[\]\|?? null" "$f")
  if [ "$HAS_FALLBACK" = "0" ]; then
    echo "  ⚠️  SEM fallback vazio: $f"
  fi
done | head -20
```

**Para CADA service sem fallback adequado:**
- Adicionar try/catch com handleServiceError
- Retornar fallback vazio ([], null, {}) em caso de erro
- NUNCA deixar o erro propagar pra UI sem tratamento

**Regra universal:**
```typescript
// TODO service de leitura deve seguir este padrão:
export async function getSomething(): Promise<Something[]> {
  if (isMock()) return mockData;
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('table').select('*');
    if (error) { handleServiceError(error); return []; }
    return data ?? [];
  } catch (err) {
    handleServiceError(err);
    return [];
  }
}
```

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: varredura completa — fallback em todos services, zero telas com erro"
git push origin main
```

---

## BLOCO 07 — VERIFICAÇÃO FINAL + TAG

```bash
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  VERIFICAÇÃO FINAL — TUDO REAL NO SUPABASE                ║"
echo "╚════════════════════════════════════════════════════════════╝"

set -a && source .env.local 2>/dev/null && set +a

# Mock mode
echo "NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK"

# Planos
PLANS=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/platform_plans?select=name&is_active=eq.true" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null)
PLAN_COUNT=$(echo "$PLANS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "Planos ativos: $PLAN_COUNT (deve ser 5)"

# Subscription
SUB=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/academy_subscriptions?select=plan_slug,status&limit=1" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null)
echo "Subscription: $SUB"

# Build
pnpm typecheck && echo "✅ TypeScript" || echo "❌ TypeScript"
pnpm build && echo "✅ Build" || echo "❌ Build"
```

```bash
git add -A && git commit -m "chore: verificação final — tudo real no Supabase"
git push origin main

git tag -a v7.0.0-supabase-real -m "BlackBelt App v7.0.0 — Tudo Real no Supabase
- feat: tabelas faltantes criadas via migration
- feat: 5 planos da plataforma no banco real
- feat: subscription da academia vinculada ao plano Pro (trial)
- feat: services de planos conectados ao Supabase
- feat: usePlanFeatures hook + FeatureGate component
- feat: enforcement de features por plano
- feat: API route /api/academy/plan
- fix: usoDescoberta is not iterable
- fix: fallback em todos services — zero telas com erro
- Zero mock em produção"

git push origin v7.0.0-supabase-real
```

---

## AÇÕES MANUAIS DO GREGORY (se migration não aplicou via código)

```
Se o BLOCO 02 não conseguiu aplicar a migration automaticamente:

1. Abra https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo de migration criado pelo Claude Code
4. Clique Run
5. Depois rode o seed: npx tsx scripts/seed-production.ts

Também verificar na Vercel:
- NEXT_PUBLIC_USE_MOCK = false (NÃO true)
- NEXT_PUBLIC_SUPABASE_ANON_KEY = começa com eyJ (NÃO sb_publishable_)
```

---

## COMANDO DE RETOMADA

```
Retome a execução do prompt TUDO REAL NO SUPABASE do BlackBelt App. Verifique o último commit com `git log --oneline -5`. O objetivo é: ZERO mock em produção. Planos reais no banco. Subscription da academia vinculada. FeatureGate restringindo features por plano. TODOS os services com fallback. Comece do próximo BLOCO.
```

---

## FIM DO MEGA PROMPT
