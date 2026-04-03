# BLACKBELT APP — ORGANIZAÇÃO DO REPOSITÓRIO
## Limpar raiz, mover docs, estrutura profissional
## Data: 02/04/2026

---

> **DIRETÓRIO:** `cd ~/Projetos/blackbelt-app`
> **REGRA:** Este prompt só MOVE arquivos. NÃO altera conteúdo. NÃO deleta nada.
> **BUILD:** Verificar `pnpm typecheck && pnpm build` no final.

---

## BLOCO ÚNICO — REORGANIZAR

### PASSO 1: Diagnóstico — ver o que tem na raiz

```bash
echo "=== ARQUIVOS .md/.txt/.sql NA RAIZ ==="
ls -1 *.md *.txt *.sql 2>/dev/null | sort

echo ""
echo "=== PASTAS NA RAIZ ==="
ls -d */ 2>/dev/null | sort

echo ""
echo "=== TOTAL DE ARQUIVOS NA RAIZ (excluindo pastas e dotfiles) ==="
ls -1p | grep -v / | grep -v "^\." | wc -l
```

### PASSO 2: Criar estrutura de docs

```bash
mkdir -p docs/audits
mkdir -p docs/store
mkdir -p docs/guides
mkdir -p docs/reports
```

### PASSO 3: Mover relatórios e auditorias

```bash
# Auditorias → docs/audits/
for f in \
  AUDITORIA_FECHAMENTO_CORE_2026-03-31.md \
  AUDITORIA_USABILIDADE_BB.md \
  AUDIT_SERVICES.md \
  BLACKBELT_CHECKLIST_RESULTADO_V4_FINAL.md \
  BLACKBELT_STORE_AUDIT.md \
  BLACKBELT_VIDEO_TEST_REPORT.md \
  CHECKLIST_USABILIDADE_MESTRE_COMPLETO.md \
  TESTE_MANUAL_10_FLUXOS.md \
  REMAINING_SERVICES.md; do
  [ -f "$f" ] && git mv "$f" docs/audits/ && echo "  ✅ $f → docs/audits/"
done

# Relatórios → docs/reports/
for f in \
  MARKET_READINESS_REPORT.md \
  RELATORIO_FECHAMENTO_2026-03-31.md \
  MEGA_SIMULATION_REPORT.txt \
  BLACKBELT-MEGA-SIMULACAO.md; do
  [ -f "$f" ] && git mv "$f" docs/reports/ && echo "  ✅ $f → docs/reports/"
done

# Guias e instruções → docs/guides/
for f in \
  INSTRUCOES_FINAIS.md \
  INSTRUCOES_MIGRATIONS.md \
  INSTRUCOES_USABILIDADE.md \
  MOBILE_BUILD.md \
  NEEDS_JWT_KEY.md; do
  [ -f "$f" ] && git mv "$f" docs/guides/ && echo "  ✅ $f → docs/guides/"
done

# SQL avulso → docs/guides/
[ -f "MIGRATION_MASTER_PARA_RODAR.sql" ] && git mv MIGRATION_MASTER_PARA_RODAR.sql docs/guides/ && echo "  ✅ MIGRATION_MASTER_PARA_RODAR.sql → docs/guides/"
```

### PASSO 4: Mover pastas soltas

```bash
# reports/ (se existe na raiz) → mesclar com docs/reports/
if [ -d "reports" ] && [ "$(ls -A reports 2>/dev/null)" ]; then
  # Mover conteúdo para docs/reports/, mantendo estrutura
  cp -r reports/* docs/reports/ 2>/dev/null
  git rm -r reports/ 2>/dev/null
  git add docs/reports/
  echo "  ✅ reports/ → docs/reports/"
fi

# test-results/ → adicionar ao .gitignore (não deve estar no repo)
if [ -d "test-results" ]; then
  # Verificar se tem conteúdo importante
  echo "  ⚠️  test-results/ encontrado — verificando conteúdo:"
  ls test-results/ 2>/dev/null | head -5
  # Remover do git (manter local se quiser)
  git rm -r --cached test-results/ 2>/dev/null
  echo "  ✅ test-results/ removido do git"
fi

# Adicionar test-results ao .gitignore se não está
if ! grep -q "test-results" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Test results (generated)" >> .gitignore
  echo "test-results/" >> .gitignore
  echo "  ✅ test-results/ adicionado ao .gitignore"
fi

# ios-privacy-manifest/ → mover para ios/ (se pertence lá)
if [ -d "ios-privacy-manifest" ]; then
  # Copiar conteúdo para ios/
  cp -r ios-privacy-manifest/* ios/App/App/ 2>/dev/null || cp -r ios-privacy-manifest/* ios/ 2>/dev/null
  git rm -r ios-privacy-manifest/ 2>/dev/null
  git add ios/
  echo "  ✅ ios-privacy-manifest/ → ios/"
fi

# native-patches/ → mover para scripts/ (são patches de build)
if [ -d "native-patches" ]; then
  mkdir -p scripts/native-patches
  git mv native-patches/* scripts/native-patches/ 2>/dev/null
  rmdir native-patches 2>/dev/null || git rm -r native-patches/ 2>/dev/null
  echo "  ✅ native-patches/ → scripts/native-patches/"
fi

# scaffolds/ → mover para docs/ (são templates de referência, não código de produção)
if [ -d "scaffolds" ]; then
  git mv scaffolds/ docs/scaffolds/ 2>/dev/null && echo "  ✅ scaffolds/ → docs/scaffolds/"
fi
```

### PASSO 5: Verificar se algum .md de prompt ficou na raiz

```bash
# Prompts de Claude Code que foram colocados na raiz
for f in \
  BLACKBELT_APP_STORE_READY.md \
  BLACKBELT_ZERO_BARREIRAS_STORES.md \
  BLACKBELT_VERCEL_DOMINIO.md \
  BLACKBELT_DOMINIO_BLACKBELTS.md \
  BLACKBELT_MONETIZACAO_STORE_SAFE.md; do
  if [ -f "$f" ]; then
    mkdir -p docs/prompts
    git mv "$f" docs/prompts/ 2>/dev/null && echo "  ✅ $f → docs/prompts/"
  fi
done
```

### PASSO 6: Verificar resultado

```bash
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  RESULTADO DA REORGANIZAÇÃO                           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "=== RAIZ (deve ter só config + README + LICENSE) ==="
ls -1p | grep -v / | grep -v "^\." | sort
echo ""

echo "=== TOTAL DE ARQUIVOS NA RAIZ ==="
TOTAL=$(ls -1p | grep -v / | grep -v "^\." | wc -l | tr -d ' ')
echo "$TOTAL arquivos"
echo ""

echo "=== PASTAS NA RAIZ ==="
ls -d */ 2>/dev/null | sort
echo ""

echo "=== docs/ ORGANIZADO ==="
find docs -type f | head -40
echo ""

# Verificar que NÃO ficou nenhum .md de relatório/auditoria na raiz
STRAY_MD=$(ls -1 *.md 2>/dev/null | grep -v "README\|CONTRIBUTING\|CODEOWNERS\|CHANGELOG\|SECURITY" | wc -l | tr -d ' ')
if [ "$STRAY_MD" = "0" ]; then
  echo "✅ Zero arquivos .md avulsos na raiz"
else
  echo "⚠️  Ainda tem $STRAY_MD arquivo(s) .md na raiz:"
  ls -1 *.md 2>/dev/null | grep -v "README\|CONTRIBUTING\|CODEOWNERS\|CHANGELOG\|SECURITY"
fi
```

### PASSO 7: Verificar que nada quebrou

```bash
# Verificar se algum import referencia arquivos movidos
# (arquivos .md não são importados pelo código, mas verificar mesmo assim)
grep -rn "AUDITORIA_\|INSTRUCOES_\|BLACKBELT_STORE_AUDIT\|MIGRATION_MASTER\|MARKET_READINESS\|MEGA_SIMULATION" app/ components/ lib/ scripts/ --include="*.ts" --include="*.tsx" --include="*.mjs" | grep -v node_modules | head -10

# Build
pnpm typecheck && pnpm build
```

### PASSO 8: Commit

```bash
git add -A && git commit -m "chore: reorganizar repositório — mover docs/relatórios da raiz para docs/

Estrutura:
- docs/audits/ — auditorias e checklists
- docs/reports/ — relatórios de progresso e simulação
- docs/guides/ — instruções, migrations, mobile build
- docs/store/ — metadata e documentos para stores
- docs/prompts/ — prompts de Claude Code
- docs/scaffolds/ — templates de referência
- scripts/native-patches/ — patches nativos
- test-results/ — adicionado ao .gitignore
- ios-privacy-manifest/ — movido para ios/

Raiz limpa: apenas config, README, LICENSE e CONTRIBUTING."

git push origin main
```

---

## COMANDO DE RETOMADA

```
Retome a reorganização do repositório BlackBelt. Verifique com git log --oneline -3 se o commit de reorganização já foi feito. Se não, execute desde o PASSO 1. O objetivo é: raiz limpa com apenas arquivos de config, todos os .md de relatório/auditoria dentro de docs/.
```

---

## FIM DO PROMPT
