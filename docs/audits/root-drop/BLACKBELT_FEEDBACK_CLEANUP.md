# BLACKBELT v2 — REMOVER FEEDBACK FLUTUANTE + VARREDURA VISUAL EM TODOS OS PERFIS
## 3 Agentes — Limpar, Verificar, Deployar

> **PROBLEMA:** O botão "Feedback" vermelho flutuante ainda aparece no canto inferior direito
> em TODOS os perfis. O fix anterior removeu do SidebarFeedback mas outro componente
> (provavelmente BetaWidgets ou outro wrapper) ainda renderiza o FAB.
>
> **OBJETIVO:** Remover COMPLETAMENTE qualquer botão/FAB flutuante de feedback em TODO o app.
> Verificar CADA um dos 9 perfis. O feedback deve existir APENAS como item no sidebar.

---

## AGENTE 1 — CAÇAR E DESTRUIR O FAB

**Missão:** Encontrar TODAS as instâncias de botão Feedback flutuante e remover.

### 1.1 Busca exaustiva

```bash
echo "=== BUSCA TOTAL POR FEEDBACK ==="

# 1. Qualquer componente que renderiza "Feedback" com position fixed/absolute
echo "--- Fixed/Absolute ---"
grep -rn "fixed\|absolute" components/ app/ --include='*.tsx' | grep -i "feedback\|Feedback" | head -20

# 2. BetaWidgets — provavelmente renderiza o FAB
echo ""
echo "--- BetaWidgets ---"
cat components/beta/BetaWidgets.tsx 2>/dev/null || echo "NÃO ENCONTRADO"

# 3. Todos os arquivos que importam componente de Feedback
echo ""
echo "--- Imports de Feedback ---"
grep -rn "import.*Feedback\|import.*feedback\|FeedbackFAB\|FeedbackButton\|FloatingFeedback" components/ app/ --include='*.tsx' | head -20

# 4. Qualquer z-index alto com feedback
echo ""
echo "--- Z-index alto com feedback ---"
grep -rn "z-\[.*\].*[Ff]eedback\|z-40.*[Ff]eedback\|z-50.*[Ff]eedback\|z-80.*[Ff]eedback" components/ app/ --include='*.tsx' | head -10

# 5. O layout root — pode ter componente de feedback
echo ""
echo "--- Layout root ---"
grep -n "Feedback\|feedback\|BetaWidget\|FloatingButton" app/layout.tsx | head -10

# 6. Providers — pode ter feedback wrapper
echo ""
echo "--- Providers ---"
grep -n "Feedback\|feedback" app/providers.tsx 2>/dev/null | head -10

# 7. SidebarFeedback — verificar se o FAB foi realmente removido
echo ""
echo "--- SidebarFeedback atual ---"
grep -n "fixed\|absolute\|FAB\|Mobile\|mobile\|lg:hidden\|float" components/shared/SidebarFeedback.tsx | head -10

# 8. Buscar em TUDO com regex amplo
echo ""
echo "--- Qualquer botão flutuante ---"
grep -rn "fixed.*bottom\|fixed.*right\|position.*fixed" components/ app/ --include='*.tsx' | grep -iv "sidebar\|modal\|drawer\|overlay\|sheet\|toast\|notification" | head -20
```

### 1.2 Remover TODAS as instâncias encontradas

Para CADA arquivo que renderiza um botão Feedback com `fixed`, `absolute`, ou `z-[80]`:
- Se é um componente dedicado (FeedbackFAB.tsx, FloatingFeedback.tsx) → **DELETAR o arquivo**
- Se está inline dentro de outro componente (BetaWidgets.tsx, layout.tsx) → **REMOVER as linhas do FAB**
- Se é o SidebarFeedback.tsx → **MANTER apenas o botão do sidebar** (sem FAB mobile)

### 1.3 Verificar BetaWidgets especificamente

```bash
cat components/beta/BetaWidgets.tsx
```

Se BetaWidgets renderiza um componente de Feedback:
- Remover a renderização do Feedback de BetaWidgets
- Ou remover o BetaWidgets do layout.tsx se ele só servir para isso

### 1.4 Verificar que o Feedback do sidebar funciona

Após remover o FAB, garantir que o botão "Feedback" no sidebar de CADA shell ainda funciona:

```bash
grep -rn "SidebarFeedback\|Feedback" components/shell/ --include='*.tsx' | head -20
```

Se algum shell NÃO tem o SidebarFeedback no sidebar → adicionar.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "fix: remover botão feedback flutuante de todo o app — manter apenas no sidebar"
```

---

## AGENTE 2 — VARREDURA VISUAL EM TODOS OS 9 PERFIS

**Missão:** Verificar que NENHUM perfil tem botão flutuante, banner invasivo, ou elemento visual quebrado.

### 2.1 Verificar CADA shell

```bash
echo "=== VARREDURA DE CADA SHELL ==="

for SHELL in AdminShell SuperAdminShell ProfessorShell RecepcaoShell MainShell TeenShell KidsShell ParentShell FranqueadorShell; do
  echo ""
  echo "═══ $SHELL ═══"

  FILE=$(find components/shell -name "${SHELL}.tsx" | head -1)
  if [ -z "$FILE" ]; then
    echo "  ❌ ARQUIVO NÃO ENCONTRADO"
    continue
  fi

  # Verificar sidebar sticky
  STICKY=$(grep -c "sticky\|h-screen" "$FILE")
  echo "  Sidebar sticky: $([ $STICKY -gt 0 ] && echo '✅' || echo '❌')"

  # Verificar botão Sair
  SAIR=$(grep -c "Sair\|logout\|performLogout" "$FILE")
  echo "  Botão Sair: $([ $SAIR -gt 0 ] && echo '✅' || echo '❌')"

  # Verificar SidebarFeedback
  FEEDBACK=$(grep -c "SidebarFeedback\|Feedback" "$FILE")
  echo "  Feedback no sidebar: $([ $FEEDBACK -gt 0 ] && echo '✅' || echo '⚠️ FALTANDO')"

  # Verificar fixed/absolute (não deveria ter exceto mobile overlay)
  FIXED=$(grep -c "fixed\|absolute" "$FILE" | head -1)
  echo "  Fixed elements: $FIXED (verificar se são apenas mobile overlay/drawer)"

  # Verificar ProfileSwitcher
  SWITCHER=$(grep -c "ProfileSwitcher\|ShellHeader\|Header" "$FILE")
  echo "  ProfileSwitcher/Header: $([ $SWITCHER -gt 0 ] && echo '✅' || echo '⚠️')"
done
```

### 2.2 Verificar que NÃO existe nenhum botão flutuante em NENHUM lugar

```bash
echo ""
echo "=== BOTÕES FLUTUANTES RESTANTES ==="

# Buscar qualquer fixed button que NÃO seja modal/drawer/sidebar
grep -rn "fixed.*button\|fixed.*btn\|fixed.*z-" components/ --include='*.tsx' | grep -iv "modal\|drawer\|sidebar\|overlay\|sheet\|toast\|backdrop\|mobile.*menu\|inset-y\|transition-transform" | head -15

# Buscar FABs (Floating Action Buttons)
grep -rn "FAB\|fab\|floating.*action\|floating.*button" components/ app/ --include='*.tsx' | head -10

# Buscar bottom-right fixed elements
grep -rn "bottom.*right.*fixed\|fixed.*bottom.*right\|right-4.*bottom\|bottom-4.*right" components/ app/ --include='*.tsx' | head -10
```

Se encontrar QUALQUER botão flutuante que não seja modal/drawer → REMOVER.

### 2.3 Verificar banner "Instalar"

```bash
echo ""
echo "=== BANNER INSTALAR ==="
grep -rn "InstallPrompt\|InstallBanner\|Instalar.*BlackBelt\|install.*prompt\|beforeinstallprompt" app/ components/ --include='*.tsx' | head -10

# Verificar se foi removido do layout
grep -n "InstallPrompt\|InstallBanner" app/layout.tsx
```

Se ainda existir referência no layout ou em qualquer componente renderizado globalmente → REMOVER.

```bash
pnpm typecheck && pnpm build
git add -A && git commit -m "audit: varredura visual em 9 perfis — zero botões flutuantes, zero banners invasivos"
```

---

## AGENTE 3 — BUILD, DEPLOY, VERIFICAÇÃO FINAL

### 3.1 Build limpo

```bash
pnpm typecheck && pnpm build
```

### 3.2 Verificação final

```bash
echo "════════════════════════════════════════"
echo "VERIFICAÇÃO FINAL"
echo "════════════════════════════════════════"

# Zero fixed feedback buttons
FIXED_FEEDBACK=$(grep -rn "fixed" components/ app/ --include='*.tsx' | grep -i "feedback" | grep -v "node_modules\|.next" | wc -l)
echo "Botões feedback flutuantes: $FIXED_FEEDBACK (deve ser 0)"

# Zero install banners in layout
INSTALL_LAYOUT=$(grep -c "InstallPrompt\|InstallBanner" app/layout.tsx 2>/dev/null)
echo "Install banners no layout: $INSTALL_LAYOUT (deve ser 0)"

# Todos os shells com sticky sidebar
STICKY_COUNT=$(grep -rl "sticky.*top-0\|h-screen.*sticky" components/shell/ --include='*.tsx' | wc -l)
SHELL_COUNT=$(find components/shell -name '*Shell.tsx' | wc -l)
echo "Shells com sidebar sticky: $STICKY_COUNT/$SHELL_COUNT"

# Todos os shells com botão Sair
SAIR_COUNT=$(grep -rl "Sair\|logout" components/shell/ --include='*.tsx' | wc -l)
echo "Shells com botão Sair: $SAIR_COUNT/$SHELL_COUNT"

echo ""
echo "Build: $(pnpm build 2>&1 | tail -1)"
```

### 3.3 Commit, push, deploy

```bash
git add -A
git commit -m "clean: zero botões flutuantes em todo o app — feedback só no sidebar, install removido, sidebar sticky em todos os shells"
git push origin main
npx vercel --prod --force --yes
```

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_FEEDBACK_CLEANUP.md nesta pasta. Execute os 3 agentes NA ORDEM:

AGENTE 1: Buscar EXAUSTIVAMENTE qualquer botão Feedback flutuante em TODO o codebase. Verificar BetaWidgets, layout.tsx, providers, SidebarFeedback, TUDO. Remover TODAS as instâncias de FAB. Manter feedback APENAS como item no sidebar. Commit.

AGENTE 2: Varredura em CADA um dos 9 shells — verificar sidebar sticky, botão Sair, SidebarFeedback, ProfileSwitcher. Buscar QUALQUER botão flutuante restante. Verificar banner Instalar. Remover tudo que flutua. Commit.

AGENTE 3: Build limpo, verificação final com contagem, commit, push, deploy com vercel --prod --force --yes.

Zero botões flutuantes ao final. Zero banners invasivos. Comece agora.
```
