# BLACKBELT APP — DOMÍNIO PRÓPRIO: blackbelts.com.br
## Configurar DNS + Atualizar TODO o código + Deploy
## Data: 02/04/2026 | Domínio: blackbelts.com.br

---

> **INSTRUÇÕES DE EXECUÇÃO:**
>
> 1. Este prompt tem 4 BLOCOS sequenciais.
> 2. O BLOCO 01 é configuração manual do Gregory no Registro.br e Vercel.
> 3. Os BLOCOS 02-04 são para o Claude Code executar.
> 4. Cada bloco termina com: `pnpm typecheck && pnpm build` → commit → push
> 5. REGRAS: NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR.
>
> **DOMÍNIO:** `blackbelts.com.br`
> **DEPLOY ATUAL:** `blackbeltv2.vercel.app`
> **DEPLOY FINAL:** `blackbelts.com.br`
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`

---

## BLOCO 01 — CONFIGURAÇÃO DNS (AÇÃO MANUAL DO GREGORY)
### Apontar blackbelts.com.br para Vercel

**Este bloco NÃO é para o Claude Code. Gregory faz manualmente.**

### PASSO 1: Adicionar domínio no Vercel

1. Acesse https://vercel.com/dashboard
2. Clique no projeto **blackbeltv2** (ou blackbelt-app)
3. Vá em **Settings** → **Domains**
4. Clique **Add Domain**
5. Digite: `blackbelts.com.br`
6. Clique **Add**
7. O Vercel vai mostrar os registros DNS necessários. Anote-os.
8. Adicione também: `www.blackbelts.com.br` (redirect para o root)

O Vercel vai pedir um destes:

**Opção A — CNAME (recomendada se o Registro.br aceitar no root):**
```
Tipo: CNAME
Nome: @ (ou blackbelts.com.br)
Valor: cname.vercel-dns.com
```

**Opção B — A Record (mais comum para domínio root .com.br):**
```
Tipo: A
Nome: @ (ou deixar vazio)
Valor: 76.76.21.21
```

**Para o www:**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

### PASSO 2: Configurar DNS no Registro.br

1. Acesse https://registro.br → Login
2. Vá no domínio **blackbelts.com.br**
3. Clique em **Configurar endereçamento** (na seção DNS)
4. Se usar DNS do Registro.br (que é o caso):

**Adicionar registro A:**
```
Tipo: A
Nome: (deixar vazio — é o root)
Endereço IPv4: 76.76.21.21
```

**Adicionar registro CNAME para www:**
```
Tipo: CNAME
Nome: www
Destino: cname.vercel-dns.com
```

5. Salvar
6. Esperar propagação (pode levar 5 minutos a 48 horas, geralmente 15-30 min)

### PASSO 3: Verificar no Vercel

1. Volte em Vercel → Settings → Domains
2. O domínio deve mostrar status **Valid Configuration** com ✅
3. O Vercel gera SSL (HTTPS) automaticamente — pode levar alguns minutos
4. Teste acessando: https://blackbelts.com.br

### PASSO 4: Confirmar para o Claude Code

Quando `https://blackbelts.com.br` estiver funcionando:
```
O domínio blackbelts.com.br está apontando para o Vercel e funcionando com HTTPS. Execute o BLOCO 02 agora.
```

---

## BLOCO 02 — ATUALIZAR TODAS AS REFERÊNCIAS NO CÓDIGO
### Substituir blackbeltv2.vercel.app → blackbelts.com.br em TODO lugar

**Este bloco é para o Claude Code.**

**Diagnóstico primeiro — encontrar TUDO:**
```bash
echo "=== SCAN COMPLETO DE URLs ==="

# 1. Todas referências ao deploy antigo
grep -rn "blackbeltv2\.vercel\.app" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" --include="*.html" --include="*.xml" --include="*.plist" --include="*.svg" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock"

# 2. Contar total
echo ""
echo "Total de ocorrências:"
grep -rn "blackbeltv2\.vercel\.app" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" --include="*.html" --include="*.xml" --include="*.plist" --include="*.svg" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l

# 3. Referências a blackbelt.com (domínio que não é nosso)
grep -rn "blackbelt\.com\b" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v "blackbelts\.com\.br" | grep -v "blackbeltv2\.vercel\.app" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock"

# 4. Referências a @blackbelt.app ou @blackbelt.com (emails fantasma)
grep -rn "@blackbelt\." . --include="*.tsx" --include="*.ts" --include="*.md" --include="*.json" | grep -v node_modules | grep -v ".git"
```

**Substituição global — executar com cuidado:**

```bash
echo "=== SUBSTITUINDO URLs ==="

# Lista de extensões para processar
EXTENSIONS="tsx ts json md mjs html xml svg"

for ext in $EXTENSIONS; do
  # blackbeltv2.vercel.app → blackbelts.com.br
  find . -name "*.$ext" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/pnpm-lock*" -exec grep -l "blackbeltv2\.vercel\.app" {} \; | while read file; do
    sed -i.bak "s|blackbeltv2\.vercel\.app|blackbelts.com.br|g" "$file" && rm -f "$file.bak"
    echo "  ✅ $file"
  done

  # blackbelt.com (sem s, sem .br) → blackbelts.com.br
  # CUIDADO: só substituir se NÃO é parte de blackbeltv2.vercel.app ou blackbelts.com.br
  find . -name "*.$ext" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/pnpm-lock*" -exec grep -l "blackbelt\.com\b" {} \; | while read file; do
    # Verificar se tem blackbelt.com que NÃO é blackbelts.com.br
    if grep -q "blackbelt\.com[^.]" "$file" 2>/dev/null || grep -q "blackbelt\.com\"" "$file" 2>/dev/null || grep -q "blackbelt\.com/" "$file" 2>/dev/null; then
      sed -i.bak "s|blackbelt\.com\([^.]\)|blackbelts.com.br\1|g" "$file" && rm -f "$file.bak"
      sed -i.bak "s|blackbelt\.com\"|blackbelts.com.br\"|g" "$file" && rm -f "$file.bak"
      sed -i.bak "s|blackbelt\.com/|blackbelts.com.br/|g" "$file" && rm -f "$file.bak"
      echo "  ✅ $file (blackbelt.com → blackbelts.com.br)"
    fi
  done
done

# Emails: @blackbelt.app → gregoryguimaraes12@gmail.com
for ext in $EXTENSIONS; do
  find . -name "*.$ext" -not -path "*/node_modules/*" -not -path "*/.git/*" -exec grep -l "@blackbelt\.\(app\|com\)" {} \; | while read file; do
    sed -i.bak "s|suporte@blackbelt\.app|gregoryguimaraes12@gmail.com|g" "$file" && rm -f "$file.bak"
    sed -i.bak "s|contato@blackbelt\.app|gregoryguimaraes12@gmail.com|g" "$file" && rm -f "$file.bak"
    sed -i.bak "s|dpo@blackbelt\.app|gregoryguimaraes12@gmail.com|g" "$file" && rm -f "$file.bak"
    sed -i.bak "s|support@blackbelt\.app|gregoryguimaraes12@gmail.com|g" "$file" && rm -f "$file.bak"
    sed -i.bak "s|info@blackbelt\.app|gregoryguimaraes12@gmail.com|g" "$file" && rm -f "$file.bak"
    echo "  ✅ $file (emails)"
  done
done

echo ""
echo "=== SUBSTITUIÇÃO CONCLUÍDA ==="
```

**Arquivos que precisam de atenção especial:**

1. **`capacitor.config.ts`:**
```typescript
// ANTES:
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.blackbelt.com';

// DEPOIS:
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://blackbelts.com.br';
```

2. **`next.config.mjs`** — verificar images domains, headers CORS, etc:
```bash
grep -n "blackbelt" next.config.mjs
# Substituir todos para blackbelts.com.br
```

3. **Política de privacidade** (`app/(public)/privacidade/page.tsx`):
   - URL do site: `https://blackbelts.com.br`
   - Todos emails: `gregoryguimaraes12@gmail.com`

4. **Página `/excluir-conta`:**
   - URL pública: `https://blackbelts.com.br/excluir-conta`
   - Email: `gregoryguimaraes12@gmail.com`

5. **`ManageOnWebMessage.tsx`** (se existe do prompt anterior):
   - Trocar `blackbeltv2.vercel.app/conta` → `blackbelts.com.br/conta`

6. **Login page** — texto discreto no nativo:
   - Trocar `blackbeltv2.vercel.app` → `blackbelts.com.br`

7. **`docs/STORE_METADATA.md`:**
   - Support URL: `https://blackbelts.com.br/contato`
   - Marketing URL: `https://blackbelts.com.br`
   - Privacy Policy URL: `https://blackbelts.com.br/privacidade`

8. **`docs/APPLE_MONETIZATION_JUSTIFICATION.md`:**
   - Todas referências ao site

9. **`docs/STORE_REVIEW_CREDENTIALS.md`:**
   - Todas referências

10. **PWA manifest** (`public/manifest.json` ou `public/site.webmanifest`):
```bash
grep -n "blackbelt" public/manifest.json 2>/dev/null || grep -n "blackbelt" public/site.webmanifest 2>/dev/null
# Atualizar start_url, scope, etc.
```

11. **Meta tags / OG tags** (em layout.tsx ou head):
```bash
grep -rn "og:\|twitter:\|canonical\|metadataBase" app/layout.tsx app/metadata.ts 2>/dev/null | head -10
# Atualizar metadataBase para https://blackbelts.com.br
```

12. **Robots.txt e sitemap:**
```bash
cat public/robots.txt 2>/dev/null | head -5
cat public/sitemap.xml 2>/dev/null | head -5
# Atualizar URLs
```

13. **`.env.example`:**
```bash
grep "blackbelt" .env.example
# Atualizar exemplos de URL
```

**Verificação — ZERO referências antigas:**
```bash
echo "=== VERIFICAÇÃO FINAL ==="

# Deve retornar ZERO
OLD_REFS=$(grep -rn "blackbeltv2\.vercel\.app" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" --include="*.html" --include="*.xml" --include="*.svg" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
echo "Referências a blackbeltv2.vercel.app: $OLD_REFS (deve ser 0)"

GHOST_DOMAINS=$(grep -rn "blackbelt\.com\b" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v "blackbelts\.com\.br" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
echo "Referências a blackbelt.com (fantasma): $GHOST_DOMAINS (deve ser 0)"

GHOST_EMAILS=$(grep -rn "@blackbelt\.\(app\|com\)" . --include="*.tsx" --include="*.ts" --include="*.md" --include="*.json" | grep -v "gregoryguimaraes12@gmail.com" | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
echo "Emails fantasma: $GHOST_EMAILS (deve ser 0)"

# Confirmar novas referências
NEW_REFS=$(grep -rn "blackbelts\.com\.br" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
echo "Referências a blackbelts.com.br: $NEW_REFS (deve ser > 0)"

pnpm typecheck && pnpm build
```

```bash
git add -A && git commit -m "feat: domínio próprio blackbelts.com.br — substituir TODAS as URLs e emails"
git push origin main
```

---

## BLOCO 03 — VERCEL ENV + CORS + SECURITY HEADERS
### Configurar variáveis de ambiente e headers para o domínio novo

**Atualizar `vercel.json` (se existe) ou criar:**
```bash
cat vercel.json 2>/dev/null || echo "NÃO existe"
```

**Se existe, atualizar. Se não, criar:**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(self), microphone=(), geolocation=(self)" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "has": [{ "type": "host", "value": "blackbeltv2.vercel.app" }],
      "destination": "https://blackbelts.com.br",
      "permanent": true
    },
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "blackbeltv2.vercel.app" }],
      "destination": "https://blackbelts.com.br/:path*",
      "permanent": true
    },
    {
      "source": "/",
      "has": [{ "type": "host", "value": "www.blackbelts.com.br" }],
      "destination": "https://blackbelts.com.br",
      "permanent": true
    },
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "www.blackbelts.com.br" }],
      "destination": "https://blackbelts.com.br/:path*",
      "permanent": true
    }
  ]
}
```

**IMPORTANTE:** Esses redirects fazem:
- `blackbeltv2.vercel.app/*` → `blackbelts.com.br/*` (301 permanent)
- `www.blackbelts.com.br/*` → `blackbelts.com.br/*` (301 permanent)

Isso garante que URLs antigas nos screenshots, links compartilhados, e bookmarks continuem funcionando.

**Se o vercel.json já existe e tem conteúdo:**
- MERGE os headers e redirects acima com o conteúdo existente
- NÃO sobrescrever configs existentes — apenas adicionar

**Atualizar `next.config.mjs` — metadataBase e allowed domains:**

```bash
# Verificar config atual
grep -n "metadataBase\|images\|domains\|remotePatterns\|allowedOrigins" next.config.mjs | head -10
```

Se `metadataBase` não existe no layout ou config, adicionar no `app/layout.tsx`:
```typescript
export const metadata = {
  metadataBase: new URL('https://blackbelts.com.br'),
  // ... outros metadados existentes
};
```

**Atualizar `.env.example`:**
```bash
# Garantir que o exemplo reflete o domínio novo
grep "APP_URL\|SITE_URL\|PUBLIC_URL\|BASE_URL" .env.example

# Se existir, atualizar o exemplo:
# NEXT_PUBLIC_APP_URL=https://blackbelts.com.br
# NEXT_PUBLIC_SITE_URL=https://blackbelts.com.br
```

**LEMBRETE PARA O GREGORY (não é Claude Code):**
No Vercel Dashboard → Settings → Environment Variables:
- Adicionar/atualizar: `NEXT_PUBLIC_APP_URL=https://blackbelts.com.br`
- Adicionar/atualizar: `NEXT_PUBLIC_SITE_URL=https://blackbelts.com.br`
- Se existir `NEXTAUTH_URL` ou similar: `https://blackbelts.com.br`

**Atualizar Supabase Auth (redirect URLs):**
No Supabase Dashboard → Auth → URL Configuration:
- Site URL: `https://blackbelts.com.br`
- Redirect URLs: adicionar `https://blackbelts.com.br/**`
- Manter `https://blackbeltv2.vercel.app/**` também (backward compat)
- Manter `http://localhost:3000/**` (dev)

**Google OAuth (se configurado):**
No Google Cloud Console → APIs & Services → Credentials:
- Authorized redirect URIs: adicionar `https://blackbelts.com.br/auth/callback`
- Authorized JavaScript origins: adicionar `https://blackbelts.com.br`

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "feat: vercel.json — redirects, security headers, domínio blackbelts.com.br"
git push origin main
```

---

## BLOCO 04 — VERIFICAÇÃO FINAL + TAG

```bash
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  DOMÍNIO blackbelts.com.br — VERIFICAÇÃO FINAL             ║"
echo "╚══════════════════════════════════════════════════════════════╝"

PASS=0
FAIL=0

check() {
  if [ "$2" = "0" ]; then
    echo "✅ $1"
    PASS=$((PASS + 1))
  else
    echo "❌ $1"
    FAIL=$((FAIL + 1))
  fi
}

# URLs antigas
OLD=$(grep -rn "blackbeltv2\.vercel\.app" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
[ "$OLD" = "0" ] && check "Zero referências a blackbeltv2.vercel.app" "0" || check "AINDA TEM $OLD referências ao deploy antigo" "1"

# Domínios fantasma
GHOST=$(grep -rn "blackbelt\.com\b" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v "blackbelts\.com\.br" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
[ "$GHOST" = "0" ] && check "Zero domínios fantasma" "0" || check "AINDA TEM $GHOST domínios fantasma" "1"

# Emails
EMAILS=$(grep -rn "@blackbelt\.\(app\|com\)" . --include="*.tsx" --include="*.ts" --include="*.md" | grep -v "gregoryguimaraes12@gmail.com" | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
[ "$EMAILS" = "0" ] && check "Zero emails fantasma" "0" || check "AINDA TEM $EMAILS emails fantasma" "1"

# Novas referências existem
NEW=$(grep -rn "blackbelts\.com\.br" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
[ "$NEW" -gt "0" ] && check "Referências a blackbelts.com.br: $NEW" "0" || check "NENHUMA referência ao novo domínio" "1"

# Redirects
grep -q "blackbeltv2.vercel.app" vercel.json 2>/dev/null && check "Redirect do deploy antigo configurado" "0" || check "FALTA redirect no vercel.json" "1"

# Security headers
grep -q "X-Frame-Options" vercel.json 2>/dev/null && check "Security headers no vercel.json" "0" || check "FALTAM security headers" "1"

# Build
pnpm typecheck 2>&1 > /dev/null && check "TypeScript limpo" "0" || check "Erros TypeScript" "1"
pnpm build 2>&1 > /dev/null && check "Build limpo" "0" || check "Build falhou" "1"

echo ""
echo "Resultado: ✅ $PASS aprovados, ❌ $FAIL falhas"

if [ "$FAIL" = "0" ]; then
  echo "🎯 DOMÍNIO CONFIGURADO COM SUCESSO"
fi
```

**Tag:**
```bash
git add -A && git commit -m "chore: verificação final — domínio blackbelts.com.br 100% configurado"
git push origin main

git tag -a v5.3.0-custom-domain -m "BlackBelt App v5.3.0 — Domínio Próprio
- feat: blackbelts.com.br como domínio principal
- feat: redirects 301 de blackbeltv2.vercel.app
- feat: redirect www → root
- feat: security headers (HSTS, X-Frame-Options, CSP)
- fix: zero referências a domínios/emails fantasma
- docs: metadata atualizado com novo domínio"

git push origin v5.3.0-custom-domain
```

---

## CHECKLIST PÓS-DEPLOY (AÇÕES MANUAIS DO GREGORY)

Depois que o Claude Code terminar os blocos 02-04 e o push for feito:

```
□ Verificar https://blackbelts.com.br — deve carregar o app
□ Verificar https://www.blackbelts.com.br — deve redirecionar para blackbelts.com.br
□ Verificar https://blackbeltv2.vercel.app — deve redirecionar para blackbelts.com.br
□ Verificar https://blackbelts.com.br/privacidade — deve carregar
□ Verificar https://blackbelts.com.br/termos — deve carregar
□ Verificar https://blackbelts.com.br/excluir-conta — deve carregar
□ Verificar https://blackbelts.com.br/login — deve carregar
□ Testar login com admin@guerreiros.com / BlackBelt@2026
□ No Supabase: adicionar https://blackbelts.com.br/** nos redirect URLs
□ No Google Cloud Console: adicionar domínio novo no OAuth
□ No Vercel: confirmar que env NEXT_PUBLIC_APP_URL = https://blackbelts.com.br
```

---

## COMANDO DE RETOMADA

```
Retome a execução do prompt DOMÍNIO blackbelts.com.br. O BLOCO 01 é manual (DNS). Verifique o último commit com `git log --oneline -5` e continue do próximo BLOCO (02, 03 ou 04). Substitua TODAS as referências de blackbeltv2.vercel.app para blackbelts.com.br. NUNCA delete isMock().
```

---

## FIM DO PROMPT
