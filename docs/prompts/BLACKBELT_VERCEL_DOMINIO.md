# BLACKBELT APP — CONFIGURAR VERCEL PARA DOMÍNIO blackbelts.com.br
## Prompt rápido e focado — rodar ANTES do prompt de domínio
## Data: 02/04/2026

---

> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`
> **DOMÍNIO NOVO:** `blackbelts.com.br`
> **DEPLOY ATUAL:** `blackbeltv2.vercel.app`
> **REGRAS:** NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR.

---

## BLOCO ÚNICO — PREPARAR VERCEL + CÓDIGO PARA DOMÍNIO PRÓPRIO

### PASSO 1: Verificar estado atual do vercel.json

```bash
echo "=== ESTADO ATUAL ==="
cat vercel.json 2>/dev/null || echo "vercel.json NÃO existe — será criado"
echo ""
echo "=== NEXT.CONFIG ==="
cat next.config.mjs | head -40
echo ""
echo "=== ENV EXAMPLE ==="
grep -i "url\|domain\|host\|site" .env.example 2>/dev/null || echo "Nenhuma variável de URL no .env.example"
echo ""
echo "=== CAPACITOR CONFIG ==="
grep "blackbelt" capacitor.config.ts
echo ""
echo "=== MANIFEST ==="
cat public/manifest.json 2>/dev/null | head -20 || cat public/site.webmanifest 2>/dev/null | head -20 || echo "Nenhum manifest encontrado"
echo ""
echo "=== LAYOUT METADATA ==="
grep -n "metadataBase\|blackbelt\|vercel" app/layout.tsx | head -10
echo ""
echo "=== TOTAL DE REFERÊNCIAS AO DEPLOY ANTIGO ==="
grep -rn "blackbeltv2\.vercel\.app" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" --include="*.html" --include="*.xml" --include="*.svg" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l
echo ""
echo "=== REFERÊNCIAS A blackbelt.com (FANTASMA) ==="
grep -rn "blackbelt\.com\b" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v "blackbelts\.com\.br" | grep -v "blackbeltv2\.vercel\.app" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l
echo ""
echo "=== EMAILS FANTASMA ==="
grep -rn "@blackbelt\.\(app\|com\)" . --include="*.tsx" --include="*.ts" --include="*.md" --include="*.json" | grep -v node_modules | grep -v ".git" | wc -l
```

### PASSO 2: Criar/atualizar vercel.json

**Se o arquivo vercel.json JÁ existe:** fazer MERGE — NÃO sobrescrever. Adicionar os blocos de headers e redirects ao JSON existente.

**Se NÃO existe:** criar com o conteúdo abaixo.

O vercel.json FINAL deve conter (merge com conteúdo existente se houver):

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

### PASSO 3: Substituir TODAS as URLs no código

**Substituição em massa — 3 passadas:**

```bash
echo "=== PASSADA 1: blackbeltv2.vercel.app → blackbelts.com.br ==="

find . \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.md" -o -name "*.mjs" -o -name "*.html" -o -name "*.xml" -o -name "*.svg" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/pnpm-lock*" \
  -exec grep -l "blackbeltv2\.vercel\.app" {} \; | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's|blackbeltv2\.vercel\.app|blackbelts.com.br|g' "$file"
  else
    sed -i 's|blackbeltv2\.vercel\.app|blackbelts.com.br|g' "$file"
  fi
  echo "  ✅ $file"
done

echo ""
echo "=== PASSADA 2: blackbelt.com (fantasma) → blackbelts.com.br ==="

# Tratar com cuidado — só substituir onde NÃO é parte de outro domínio
find . \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.md" -o -name "*.mjs" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/pnpm-lock*" \
  -exec grep -l "blackbelt\.com" {} \; | while read file; do
  # Só processar se tem blackbelt.com que NÃO é blackbelts.com.br
  if grep -q 'blackbelt\.com[^.]' "$file" 2>/dev/null || grep -q 'blackbelt\.com"' "$file" 2>/dev/null || grep -q "blackbelt\.com'" "$file" 2>/dev/null || grep -q 'blackbelt\.com/' "$file" 2>/dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # app.blackbelt.com → blackbelts.com.br
      sed -i '' 's|app\.blackbelt\.com|blackbelts.com.br|g' "$file"
      # https://blackbelt.com" → https://blackbelts.com.br"
      sed -i '' 's|blackbelt\.com"|blackbelts.com.br"|g' "$file"
      # https://blackbelt.com' → https://blackbelts.com.br'
      sed -i '' "s|blackbelt\.com'|blackbelts.com.br'|g" "$file"
      # https://blackbelt.com/ → https://blackbelts.com.br/
      sed -i '' 's|blackbelt\.com/|blackbelts.com.br/|g' "$file"
      # blackbelt.com (fim de linha ou espaço)
      sed -i '' 's|blackbelt\.com |blackbelts.com.br |g' "$file"
    else
      sed -i 's|app\.blackbelt\.com|blackbelts.com.br|g' "$file"
      sed -i 's|blackbelt\.com"|blackbelts.com.br"|g' "$file"
      sed -i "s|blackbelt\.com'|blackbelts.com.br'|g" "$file"
      sed -i 's|blackbelt\.com/|blackbelts.com.br/|g' "$file"
      sed -i 's|blackbelt\.com |blackbelts.com.br |g' "$file"
    fi
    echo "  ✅ $file (blackbelt.com → blackbelts.com.br)"
  fi
done

echo ""
echo "=== PASSADA 3: emails @blackbelt.app/@blackbelt.com → gmail ==="

find . \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.md" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -exec grep -l "@blackbelt\." {} \; | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's|suporte@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i '' 's|contato@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i '' 's|dpo@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i '' 's|support@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i '' 's|info@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i '' 's|suporte@blackbelt\.com|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i '' 's|contato@blackbelt\.com|gregoryguimaraes12@gmail.com|g' "$file"
  else
    sed -i 's|suporte@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i 's|contato@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i 's|dpo@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i 's|support@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i 's|info@blackbelt\.app|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i 's|suporte@blackbelt\.com|gregoryguimaraes12@gmail.com|g' "$file"
    sed -i 's|contato@blackbelt\.com|gregoryguimaraes12@gmail.com|g' "$file"
  fi
  echo "  ✅ $file (emails)"
done
```

### PASSO 4: Atualizar arquivos específicos manualmente

**capacitor.config.ts** — verificar e corrigir:
```bash
grep "blackbelt" capacitor.config.ts
# O fallback URL deve ser https://blackbelts.com.br
# Se ainda tem blackbelt.com ou blackbeltv2.vercel.app, corrigir
```

**app/layout.tsx** — garantir metadataBase:
```bash
# Verificar se metadataBase existe
grep "metadataBase" app/layout.tsx

# Se NÃO existe, adicionar dentro do export const metadata:
# metadataBase: new URL('https://blackbelts.com.br'),

# Se existe mas aponta pro lugar errado, corrigir
```

**PWA manifest** — atualizar start_url e scope:
```bash
# Verificar
cat public/manifest.json 2>/dev/null || cat public/site.webmanifest 2>/dev/null

# Garantir que:
# "start_url": "/"
# "scope": "/"
# "id": "/"
# NÃO precisa ter domínio completo — paths relativos funcionam
# Mas se tem domínio absoluto, deve ser blackbelts.com.br
```

**robots.txt** — atualizar sitemap URL:
```bash
cat public/robots.txt 2>/dev/null

# Se tem Sitemap: https://blackbeltv2.vercel.app/sitemap.xml
# Trocar para: Sitemap: https://blackbelts.com.br/sitemap.xml
```

**.env.example** — atualizar exemplos:
```bash
# Verificar
grep -i "url\|domain\|host" .env.example 2>/dev/null

# Garantir que exemplos mostram:
# NEXT_PUBLIC_APP_URL=https://blackbelts.com.br
# Se outros existem, atualizar também
```

### PASSO 5: Verificação final

```bash
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  VERIFICAÇÃO — DOMÍNIO blackbelts.com.br              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# URLs antigas (deve ser 0)
OLD=$(grep -rn "blackbeltv2\.vercel\.app" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" --include="*.html" --include="*.xml" --include="*.svg" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
echo "blackbeltv2.vercel.app: $OLD (deve ser 0)"

# Domínios fantasma (deve ser 0)
GHOST=$(grep -rn "blackbelt\.com\b" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v "blackbelts\.com\.br" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
echo "blackbelt.com fantasma: $GHOST (deve ser 0)"

# Emails fantasma (deve ser 0)
EMAILS=$(grep -rn "@blackbelt\.\(app\|com\)" . --include="*.tsx" --include="*.ts" --include="*.md" --include="*.json" | grep -v "gregoryguimaraes12@gmail.com" | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
echo "Emails fantasma: $EMAILS (deve ser 0)"

# Novas referências (deve ser > 0)
NEW=$(grep -rn "blackbelts\.com\.br" . --include="*.tsx" --include="*.ts" --include="*.json" --include="*.md" --include="*.mjs" | grep -v node_modules | grep -v ".git" | grep -v "pnpm-lock" | wc -l | tr -d ' ')
echo "blackbelts.com.br: $NEW referências"

# vercel.json tem redirects
grep -q "blackbeltv2.vercel.app" vercel.json 2>/dev/null && echo "✅ Redirect configurado" || echo "❌ FALTA redirect"

# Security headers
grep -q "X-Frame-Options" vercel.json 2>/dev/null && echo "✅ Security headers" || echo "❌ FALTAM headers"

# Build
echo ""
pnpm typecheck && echo "✅ TypeScript limpo" || echo "❌ TypeScript com erros"
pnpm build && echo "✅ Build limpo" || echo "❌ Build falhou"

echo ""
if [ "$OLD" = "0" ] && [ "$GHOST" = "0" ] && [ "$EMAILS" = "0" ] && [ "$NEW" -gt "0" ]; then
  echo "🎯 CÓDIGO 100% ATUALIZADO PARA blackbelts.com.br"
else
  echo "⚠️  Ainda há referências para corrigir — veja acima"
fi
```

### PASSO 6: Commit + Push

```bash
git add -A && git commit -m "feat: domínio blackbelts.com.br — vercel.json + substituição global de URLs + security headers

- Redirect 301: blackbeltv2.vercel.app → blackbelts.com.br
- Redirect 301: www.blackbelts.com.br → blackbelts.com.br  
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options
- Zero referências a domínios/emails fantasma
- capacitor.config.ts atualizado
- metadataBase atualizado
- PWA manifest atualizado"

git push origin main
```

---

## AÇÕES MANUAIS DO GREGORY (DEPOIS DO PUSH)

```
1. VERCEL — Adicionar domínio:
   → vercel.com/dashboard → projeto → Settings → Domains
   → Add: blackbelts.com.br
   → Add: www.blackbelts.com.br

2. VERCEL — Environment Variables:
   → Settings → Environment Variables
   → Adicionar/atualizar: NEXT_PUBLIC_APP_URL = https://blackbelts.com.br

3. REGISTRO.BR — Configurar DNS:
   → registro.br → blackbelts.com.br → DNS → Configurar endereçamento
   → Adicionar registro A: (vazio) → 76.76.21.21
   → Adicionar registro CNAME: www → cname.vercel-dns.com
   → Salvar

4. SUPABASE — Redirect URLs:
   → supabase.com/dashboard → projeto tdplmmodmumryzdosmpv
   → Auth → URL Configuration
   → Site URL: https://blackbelts.com.br
   → Redirect URLs: adicionar https://blackbelts.com.br/**
   → MANTER https://blackbeltv2.vercel.app/** (backward compat)
   → MANTER http://localhost:3000/** (dev)

5. GOOGLE OAUTH (se configurado):
   → console.cloud.google.com → APIs & Services → Credentials
   → OAuth Client → Authorized redirect URIs:
      adicionar https://blackbelts.com.br/auth/callback
   → Authorized JavaScript origins:
      adicionar https://blackbelts.com.br

6. TESTAR:
   □ https://blackbelts.com.br → deve carregar
   □ https://www.blackbelts.com.br → redirecionar para blackbelts.com.br
   □ https://blackbeltv2.vercel.app → redirecionar para blackbelts.com.br
   □ https://blackbelts.com.br/login → deve carregar
   □ https://blackbelts.com.br/privacidade → deve carregar
   □ Login com admin@guerreiros.com / BlackBelt@2026
```

---

## COMANDO DE RETOMADA

```
Retome a configuração do domínio blackbelts.com.br. Verifique com git log --oneline -3 se o commit de domínio já foi feito. Se não, execute o prompt desde o PASSO 1. O objetivo é: vercel.json com redirects e headers, ZERO referências a blackbeltv2.vercel.app ou blackbelt.com no código, TUDO apontando para blackbelts.com.br.
```

---

## FIM DO PROMPT
