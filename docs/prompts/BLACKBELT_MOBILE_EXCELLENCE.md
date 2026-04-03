# BLACKBELT APP — MOBILE EXCELLENCE
## Landing + Login + Páginas Públicas: Perfeição no Mobile
## Data: 03/04/2026

---

> **CONTEXTO:**
> O BlackBelt no desktop está bom. No mobile está inferior —
> logo espremido, emojis nos KPIs, dados fake no preview,
> header com links de dev, footer com linguagem técnica,
> link "Site" abrindo superadmin.
>
> Este prompt resolve TUDO de uma vez.
>
> **REGRAS:** NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR.
> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`

---

## BLOCO 01 — AUDITORIA MOBILE COMPLETA
### Ver o estado real de TODAS as páginas públicas

```bash
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  AUDITORIA MOBILE — PÁGINAS PÚBLICAS                     ║"
echo "╚════════════════════════════════════════════════════════════╝"

# 1. Header/Navbar público
echo ""
echo "=== NAVBAR PÚBLICO ==="
find components -name "*Navbar*" -o -name "*navbar*" -o -name "*Header*" -o -name "*header*" | grep -v shell | grep -v node_modules | head -10
find app -name "*layout*" -path "*public*" | head -5

# Qual navbar as páginas públicas usam?
grep -rn "Navbar\|NavBar\|Header\|PublicHeader\|LandingNav" app/ --include="*.tsx" -l | grep -v node_modules | grep -v "(admin\|professor\|teen\|kids\|parent\|recepcao\|franqueador\|superadmin\|main)" | head -10

# 2. Links no header — encontrar "Onboarding", "Developers", "Status"
echo ""
echo "=== LINKS PROBLEMÁTICOS NO HEADER ==="
grep -rn "Onboarding\|Developers\|developers\|Status\|status" components/ --include="*.tsx" | grep -i "nav\|header\|link\|href\|menu\|item" | head -15

# 3. Footer público
echo ""
echo "=== FOOTER ==="
find components -name "*Footer*" -o -name "*footer*" | grep -v node_modules | head -10
grep -rn "Superficies\|operacionais\|Mobile companion\|pontos de integracao\|integracao publica" app/ components/ --include="*.tsx" | head -10

# 4. Link "Site"
echo ""
echo "=== LINK SITE ==="
grep -rn '"Site"\|>Site<\|href.*site' components/ app/ --include="*.tsx" | grep -v node_modules | head -10

# 5. Landing page mobile
echo ""
echo "=== LANDING PAGE ==="
LANDING=$(find app -maxdepth 3 -name "page.tsx" | grep -v "login\|admin\|professor\|dashboard\|teen\|kids\|parent\|recepcao\|franqueador\|superadmin\|cadastr\|termos\|priv\|contato\|excluir" | head -1)
echo "Landing: $LANDING"

# Componentes da landing
grep -rn "import" "$LANDING" 2>/dev/null | head -20
find features -path "*landing*" -o -path "*site*" -o -path "*Landing*" | head -10

# 6. Emojis no preview mobile da landing
echo ""
echo "=== EMOJIS NA LANDING ==="
LANDING_COMP=$(find features -path "*landing*" -name "*.tsx" 2>/dev/null | head -1)
[ -z "$LANDING_COMP" ] && LANDING_COMP=$(find components -path "*landing*" -name "*.tsx" 2>/dev/null | head -1)
echo "Landing component: $LANDING_COMP"
grep -n "👥\|💰\|📊\|🏋️\|👨\|🎓\|45\|15.800\|15\.8k" "$LANDING_COMP" 2>/dev/null | head -15

# 7. Dados fake na landing (45 alunos, R$ 15.800)
echo ""
echo "=== DADOS FAKE ==="
grep -rn "45.*aluno\|15.800\|15\.8k\|João Pedro.*5 min\|Maria Clara.*12 min\|Lucas Teen.*18 min" features/ components/ --include="*.tsx" | grep -v node_modules | head -10

# 8. URL blackbelts.com.br
echo ""
echo "=== URLs ANTIGAS ==="
grep -rn "blackbeltv2\.vercel\.app" app/ components/ features/ --include="*.tsx" | grep -v node_modules | wc -l

# 9. Cadastro de academia
echo ""
echo "=== CADASTRO ACADEMIA ==="
find app -path "*cadastr*academ*" -name "page.tsx" | head -5

# 10. Hamburger menu mobile
echo ""
echo "=== MENU MOBILE ==="
grep -rn "hamburger\|Hamburger\|menu-toggle\|MenuToggle\|mobile.*menu\|MobileMenu\|isOpen\|setIsOpen\|menuOpen" components/ --include="*.tsx" | grep -i "nav\|header" | head -10
```

```bash
git add -A 2>/dev/null
# Não commitar auditoria — apenas ver o resultado
```

---

## BLOCO 02 — HEADER/NAVBAR PÚBLICO LIMPO
### Remover links de dev, deixar profissional

**Encontrar e editar o componente navbar público:**

```bash
# O componente está em um destes locais:
find components -name "*Navbar*" -o -name "*navbar*" -o -name "*PublicNav*" -o -name "*LandingNav*" | head -5
find components/landing -name "*.tsx" 2>/dev/null | head -10
```

**O navbar público deve ter APENAS:**

```tsx
// MOBILE: Logo (esquerda) + Hamburger (direita)
// DESKTOP: Logo (esquerda) + [Funcionalidades, Preços] (centro) + [Entrar, Cadastrar] (direita)

// === MOBILE ===
<header className="sticky top-0 z-50 w-full" style={{ background: 'var(--bb-depth-1)', borderBottom: '1px solid var(--bb-glass-border)' }}>
  <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
    {/* Logo */}
    <Link href="/">
      <BlackBeltLogo variant="navbar" height={28} />
    </Link>
    
    {/* Desktop nav */}
    <nav className="hidden md:flex items-center gap-6">
      <a href="#funcionalidades" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Funcionalidades</a>
      <a href="#precos" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Preços</a>
      <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Entrar</Link>
      <Link href="/cadastrar-academia" className="h-9 px-4 rounded-lg flex items-center text-sm font-medium text-white" style={{ background: 'var(--bb-brand)' }}>
        Cadastrar
      </Link>
    </nav>
    
    {/* Mobile hamburger */}
    <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
      {menuOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  </div>
  
  {/* Mobile menu dropdown */}
  {menuOpen && (
    <div className="md:hidden border-t px-4 py-4 space-y-3" style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-1)' }}>
      <a href="#funcionalidades" className="block text-sm py-2" style={{ color: 'var(--bb-ink-60)' }}>Funcionalidades</a>
      <a href="#precos" className="block text-sm py-2" style={{ color: 'var(--bb-ink-60)' }}>Preços</a>
      <Link href="/login" className="block text-sm py-2 font-medium" style={{ color: 'var(--bb-ink-80)' }}>Entrar</Link>
      <Link href="/cadastrar-academia" className="block h-11 rounded-lg flex items-center justify-center text-sm font-medium text-white" style={{ background: 'var(--bb-brand)' }}>
        Cadastrar academia
      </Link>
    </div>
  )}
</header>
```

**REMOVER do navbar:** Onboarding, Developers, Status, Mobile companion, qualquer link técnico.

**Link "Site":** Remover completamente do header — se existir em algum nav, está apontando errado pro superadmin. O logo clicável já leva pra home.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: header público limpo — remover links de dev, navbar profissional"
git push origin main
```

---

## BLOCO 03 — FOOTER PROFISSIONAL
### Remover linguagem técnica, footer de produto maduro

**Encontrar o footer:**
```bash
find components -name "*Footer*" -o -name "*footer*" | head -5
grep -rn "Superficies\|operacionais\|Mobile companion" components/ app/ features/ --include="*.tsx" -l | head -5
```

**Substituir o footer inteiro por versão profissional:**

```tsx
<footer style={{ borderTop: '1px solid var(--bb-glass-border)', background: 'var(--bb-depth-1)' }}>
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
      {/* Coluna 1 */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--bb-ink-80)' }}>Produto</h4>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          <li><a href="#funcionalidades" className="hover:underline">Funcionalidades</a></li>
          <li><Link href="/precos" className="hover:underline">Planos</Link></li>
          <li><Link href="/changelog" className="hover:underline">Novidades</Link></li>
        </ul>
      </div>
      {/* Coluna 2 */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--bb-ink-80)' }}>Suporte</h4>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          <li><Link href="/contato" className="hover:underline">Contato</Link></li>
          <li><Link href="/ajuda" className="hover:underline">Central de ajuda</Link></li>
        </ul>
      </div>
      {/* Coluna 3 */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--bb-ink-80)' }}>Legal</h4>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          <li><Link href="/termos" className="hover:underline">Termos de Uso</Link></li>
          <li><Link href="/privacidade" className="hover:underline">Privacidade</Link></li>
          <li><Link href="/excluir-conta" className="hover:underline">Excluir conta</Link></li>
        </ul>
      </div>
      {/* Coluna 4 */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--bb-ink-80)' }}>Empresa</h4>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          <li><Link href="/sobre" className="hover:underline">Sobre</Link></li>
          <li><Link href="/blog" className="hover:underline">Blog</Link></li>
        </ul>
      </div>
    </div>
    {/* Bottom bar */}
    <div className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>© 2026 BlackBelt. Todos os direitos reservados.</p>
      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Vespasiano, MG — Brasil</p>
    </div>
  </div>
</footer>
```

**REMOVER completamente:** "Superfícies públicas operacionais", "Mobile companion", "pontos de integração pública", "App autenticado e superfícies operacionais públicas", qualquer referência a blackbelts.com.br.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: footer profissional — remover linguagem técnica, 4 colunas limpas"
git push origin main
```

---

## BLOCO 04 — LANDING PAGE MOBILE: HERO + PREVIEW
### Logo, espaçamento, emojis, dados fake

**Diagnóstico:**
```bash
# Encontrar o componente de landing
LANDING_COMP=$(find features -path "*landing*" -name "*.tsx" 2>/dev/null | head -1)
[ -z "$LANDING_COMP" ] && LANDING_COMP=$(find components -path "*landing*" -name "*.tsx" 2>/dev/null | head -1)
echo "Landing component: $LANDING_COMP"
cat "$LANDING_COMP" | head -100
```

**Problemas a corrigir no mobile:**

1. **Logo colide com o título no mobile:**
```bash
# O logo e o "Sua academia funcionando no automático" estão sem espaçamento
# Adicionar pt-20 sm:pt-0 no hero section para dar espaço pra status bar + navbar
```

A hero section precisa de:
```tsx
<section className="relative min-h-[80vh] flex items-center justify-center px-4 pt-20 sm:pt-0">
  {/* conteúdo centralizado */}
</section>
```

2. **Emojis nos KPIs do preview (👥 💰 📊 🏋️):**
```bash
# Encontrar os emojis no preview do dashboard
grep -n "👥\|💰\|📊\|🏋️\|🎓" "$LANDING_COMP" | head -10
```

Substituir por ícones Lucide:
```
👥 → <Users size={16} />
💰 → <DollarSign size={16} />
📊 → <BarChart3 size={16} />
🏋️ → <Dumbbell size={16} />
🎓 → <GraduationCap size={16} />
```

3. **Dados fake antigos (45 alunos, R$ 15.800):**
```bash
grep -n "45\|15.800\|15\.8k" "$LANDING_COMP" | head -10
```

Atualizar pra dados mais realistas:
```
45 alunos → 127 alunos
R$ 15.800 → R$ 24.800
87% presença → 83% presença
3 turmas → 12 turmas
```

Manter consistência com o preview do login (que já usa 127 alunos, 83%, R$ 24.8k).

4. **Nomes dos check-ins devem ser os mesmos do login:**
```
João Pedro → Lucas Oliveira
Maria Clara → Ana Costa
Lucas Teen → Pedro Henrique + Mariana Silva
```

5. **O texto "Sem cartão de crédito. Cancele quando quiser." está bom** — manter.

6. **Botão WhatsApp no mobile:** Verificar se não está cobrindo conteúdo importante. Se cobrir, adicionar `mb-20` no container principal.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: landing mobile — logo spacing, Lucide icons, dados realistas 127 alunos"
git push origin main
```

---

## BLOCO 05 — PÁGINAS PÚBLICAS: CADASTRO + TERMOS + PRIVACIDADE
### Consistência visual em todas as páginas acessíveis sem login

**Auditar cada página pública:**
```bash
echo "=== PÁGINAS PÚBLICAS ==="
for path in cadastrar-academia termos privacidade excluir-conta contato sobre ajuda; do
  PAGE=$(find app -path "*$path*" -name "page.tsx" | head -1)
  if [ -n "$PAGE" ]; then
    echo "✅ /$path → $PAGE"
  else
    echo "❌ /$path → NÃO ENCONTRADO"
  fi
done
```

**Para cada página:**
1. Verificar que usa o header/footer público limpo (não o de dev)
2. Verificar que inputs têm h-12, rounded-xl
3. Verificar que não tem emojis em labels/placeholders
4. Verificar que funciona no mobile (padding, max-width)
5. Verificar que links apontam pros lugares certos

**Página de cadastro de academia** (`/cadastrar-academia`):
```bash
CADASTRO=$(find app -path "*cadastr*academ*" -name "page.tsx" | head -1)
echo "Cadastro: $CADASTRO"
wc -l "$CADASTRO"
# Verificar quantos steps tem
grep -c "step\|Step\|etapa" "$CADASTRO"
```

Garantir:
- Steps indicator limpo (1 Academia → 2 Detalhes → 3 Admin → 4 Plano → 5 Confirmação)
- Cada step funciona sem erro
- Inputs responsivos no mobile
- Botões "Próximo" e "Voltar" com touch targets 44px
- O header do cadastro deve ser o mesmo navbar público limpo (não ter "Developers", "Status")

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: páginas públicas — consistência visual, header/footer limpos"
git push origin main
```

---

## BLOCO 06 — TESTE FINAL + VERIFICAÇÃO + TAG

```bash
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  VERIFICAÇÃO MOBILE FINAL                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Header limpo
echo ""
echo "=== HEADER ==="
HEADER_DEV_LINKS=$(grep -rn "Onboarding\|Developers\|developers\|Mobile companion" components/ --include="*.tsx" | grep -i "nav\|header\|href\|link\|menu" | grep -v node_modules | wc -l | tr -d ' ')
echo "Links de dev no header: $HEADER_DEV_LINKS (deve ser 0)"

# Footer limpo
echo ""
echo "=== FOOTER ==="
FOOTER_TECH=$(grep -rn "Superficies\|operacionais\|Mobile companion\|pontos de integracao\|integracao publica" app/ components/ features/ --include="*.tsx" | grep -v node_modules | wc -l | tr -d ' ')
echo "Linguagem técnica no footer: $FOOTER_TECH (deve ser 0)"

# Link Site
echo ""
echo "=== LINK SITE ==="
SITE_LINK=$(grep -rn 'href.*"/superadmin"\|href.*site.*superadmin' components/ --include="*.tsx" | grep -v node_modules | wc -l | tr -d ' ')
echo "Link Site→SuperAdmin: $SITE_LINK (deve ser 0)"

# Emojis na landing
echo ""
echo "=== EMOJIS LANDING ==="
LANDING_COMP=$(find features -path "*landing*" -name "*.tsx" 2>/dev/null | head -1)
[ -z "$LANDING_COMP" ] && LANDING_COMP=$(find components -path "*landing*" -name "*.tsx" 2>/dev/null | head -1)
EMOJIS_LANDING=$(grep -c "👥\|💰\|📊\|🏋️\|🎓\|👨" "$LANDING_COMP" 2>/dev/null || echo "0")
echo "Emojis na landing: $EMOJIS_LANDING (deve ser 0)"

# Dados fake antigos
echo ""
echo "=== DADOS FAKE ANTIGOS ==="
OLD_DATA=$(grep -rn "\"45\"\|15\.800\|15\.8k" features/ components/ --include="*.tsx" | grep -v node_modules | grep -v "test\|mock\|Mock" | wc -l | tr -d ' ')
echo "Dados fake (45 alunos/15.800): $OLD_DATA (deve ser 0)"

# URLs antigas
echo ""
echo "=== URLs ==="
OLD_URLS=$(grep -rn "blackbeltv2\.vercel\.app" app/ components/ features/ --include="*.tsx" | grep -v node_modules | wc -l | tr -d ' ')
echo "blackbelts.com.br: $OLD_URLS"

# Build
echo ""
pnpm typecheck && echo "✅ TypeScript" || echo "❌ TypeScript"
pnpm build && echo "✅ Build" || echo "❌ Build"

echo ""
echo "=== ROTAS PARA TESTAR MANUALMENTE ==="
echo "  https://blackbelts.com.br/ → landing (mobile: logo não colide)"
echo "  https://blackbelts.com.br/login → login (mobile: preview escondido)"
echo "  https://blackbelts.com.br/cadastrar-academia → cadastro (5 steps)"
echo "  https://blackbelts.com.br/termos → termos"
echo "  https://blackbelts.com.br/privacidade → privacidade"
echo "  https://blackbelts.com.br/excluir-conta → exclusão"
echo "  https://blackbelts.com.br/contato → contato"
echo "  Hamburger menu → SÓ Funcionalidades, Preços, Entrar, Cadastrar"
echo "  Footer → SÓ Produto, Suporte, Legal, Empresa"
```

```bash
git add -A && git commit -m "chore: verificação mobile final"
git push origin main

git tag -a v6.1.0-mobile-excellence -m "BlackBelt App v6.1.0 — Mobile Excellence
- fix: header público limpo (zero links de dev)
- fix: footer profissional (zero linguagem técnica)
- fix: link Site não abre mais superadmin
- fix: landing mobile — logo spacing, Lucide icons nos KPIs
- fix: dados atualizados 127 alunos, R$ 24.8k (consistência login/landing)
- fix: cadastro academia — header/footer limpos
- fix: todas páginas públicas consistentes"

git push origin v6.1.0-mobile-excellence
```

---

## COMANDO DE RETOMADA

```
Retome o prompt MOBILE EXCELLENCE do BlackBelt. git log --oneline -5 pra ver onde parou. Objetivo: header sem links de dev, footer sem linguagem técnica, landing mobile com Lucide icons e dados realistas, todas páginas públicas consistentes. NUNCA delete isMock(). CSS var(--bb-*).
```

---

## FIM DO PROMPT
