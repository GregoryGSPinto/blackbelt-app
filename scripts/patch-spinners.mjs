/**
 * Patches stuck-spinner pages to show "Em breve" (ComingSoon) instead of
 * infinite loading. Adds a 4-second timeout to the loading state.
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());

// Map of route → file path (relative to ROOT)
const PAGES = [
  // ADMIN
  'app/(admin)/admin/acesso/page.tsx',
  'app/(admin)/admin/acesso/proximidade/page.tsx',
  'app/(admin)/admin/analytics/churn/page.tsx',
  'app/(admin)/admin/analytics/professores/page.tsx',
  'app/(admin)/admin/automacoes/page.tsx',
  'app/(admin)/admin/campanhas/page.tsx',
  'app/(admin)/admin/comercial/page.tsx',
  'app/(admin)/admin/configuracoes/audit-log/page.tsx',
  'app/(admin)/admin/configuracoes/marca/page.tsx',
  'app/(admin)/admin/configuracoes/sso/page.tsx',
  'app/(admin)/admin/curriculo/page.tsx',
  'app/(admin)/admin/equipe/page.tsx',
  'app/(admin)/admin/espacos/page.tsx',
  'app/(admin)/admin/gamificacao/recompensas/page.tsx',
  'app/(admin)/admin/indicar/page.tsx',
  'app/(admin)/admin/integracoes/api/page.tsx',
  'app/(admin)/admin/integracoes/webhooks/page.tsx',
  'app/(admin)/admin/iot/page.tsx',
  'app/(admin)/admin/leads/page.tsx',
  'app/(admin)/admin/liga/page.tsx',
  'app/(admin)/admin/loja/pedidos/page.tsx',
  'app/(admin)/admin/loja/produtos/page.tsx',
  'app/(admin)/admin/marketplace/page.tsx',
  'app/(admin)/admin/mensagens/page.tsx',
  'app/(admin)/admin/plano-plataforma/page.tsx',
  'app/(admin)/admin/plugins/page.tsx',
  'app/(admin)/admin/relatorios/page.tsx',
  'app/(admin)/admin/royalties/page.tsx',
  'app/(admin)/admin/sistema/page.tsx',
  'app/(admin)/admin/substituicao/page.tsx',
  'app/(admin)/admin/tecnicas/page.tsx',
  'app/(admin)/admin/torneios/page.tsx',
  'app/(admin)/admin/unidades/page.tsx',
  'app/(admin)/admin/wizard/page.tsx',
  // PROFESSOR
  'app/(professor)/professor/agenda/page.tsx',
  'app/(professor)/professor/alunos/page.tsx',
  'app/(professor)/professor/analise-luta/page.tsx',
  'app/(professor)/professor/avaliacao-fisica/page.tsx',
  'app/(professor)/professor/duvidas/page.tsx',
  'app/(professor)/professor/mensagens/page.tsx',
  'app/(professor)/professor/periodizacao/page.tsx',
  'app/(professor)/professor/plano-treino/page.tsx',
  'app/(professor)/meus-cursos/page.tsx',
  'app/(professor)/meus-cursos/financeiro/page.tsx',
  'app/(professor)/plano-aula/page.tsx',
  'app/(professor)/turma-ativa/page.tsx',
  // ALUNO_ADULTO (main)
  'app/(main)/academia/glossario/page.tsx',
  'app/(main)/avaliacao-fisica/page.tsx',
  'app/(main)/battle-pass/page.tsx',
  'app/(main)/certificados/page.tsx',
  'app/(main)/comunidade/page.tsx',
  'app/(main)/curriculo/page.tsx',
  'app/(main)/desafios/page.tsx',
  'app/(main)/eventos/page.tsx',
  'app/(main)/feed/page.tsx',
  'app/(main)/hall-da-fama/page.tsx',
  'app/(main)/liga/page.tsx',
  'app/(main)/loja/desejos/page.tsx',
  'app/(main)/perfil/notificacoes/page.tsx',
  'app/(main)/perfil/privacidade/page.tsx',
  'app/(main)/periodizacao/page.tsx',
  'app/(main)/personal-ai/page.tsx',
  'app/(main)/plano-treino/page.tsx',
  'app/(main)/planos/page.tsx',
  'app/(main)/progresso/videos/page.tsx',
  'app/(main)/recompensas/page.tsx',
  'app/(main)/saude/page.tsx',
  'app/(main)/season/page.tsx',
  'app/(main)/tecnicas/page.tsx',
  'app/(main)/titulos/page.tsx',
  'app/(main)/torneios/page.tsx',
  // RESPONSAVEL
  'app/(parent)/parent/mensagens/page.tsx',
  // FRANQUEADOR
  'app/(franqueador)/franqueador/page.tsx',
  'app/(franqueador)/franqueador/comunicacao/page.tsx',
  'app/(franqueador)/franqueador/curriculo/page.tsx',
  'app/(franqueador)/franqueador/expansao/page.tsx',
  'app/(franqueador)/franqueador/padroes/page.tsx',
  'app/(franqueador)/franqueador/royalties/page.tsx',
  'app/(franqueador)/franqueador/unidades/page.tsx',
  // SUPERADMIN
  'app/(superadmin)/superadmin/beta/page.tsx',
  'app/(superadmin)/superadmin/configuracoes/storage/page.tsx',
];

// Determine back href based on route group
function getBackHref(filePath) {
  if (filePath.includes('(admin)')) return '/admin';
  if (filePath.includes('(professor)')) return '/professor';
  if (filePath.includes('(main)')) return '/dashboard';
  if (filePath.includes('(parent)')) return '/parent';
  if (filePath.includes('(franqueador)')) return '/franqueador';
  if (filePath.includes('(superadmin)')) return '/superadmin';
  return '/';
}

function getBackLabel(filePath) {
  if (filePath.includes('(admin)')) return 'Voltar ao Dashboard';
  if (filePath.includes('(professor)')) return 'Voltar ao Painel';
  if (filePath.includes('(main)')) return 'Voltar ao Dashboard';
  if (filePath.includes('(parent)')) return 'Voltar ao Painel';
  if (filePath.includes('(franqueador)')) return 'Voltar ao Dashboard';
  if (filePath.includes('(superadmin)')) return 'Voltar ao Painel';
  return 'Voltar';
}

let patched = 0;
let skipped = 0;
let missing = 0;

for (const relPath of PAGES) {
  const absPath = path.join(ROOT, relPath);

  if (!fs.existsSync(absPath)) {
    console.log(`⏭️  MISSING: ${relPath}`);
    missing++;
    continue;
  }

  let content = fs.readFileSync(absPath, 'utf8');

  // Already patched?
  if (content.includes('ComingSoon') || content.includes('comingSoonTimeout')) {
    console.log(`⏭️  ALREADY PATCHED: ${relPath}`);
    skipped++;
    continue;
  }

  // Check if page has a Spinner loading guard
  const hasSpinner = content.includes('<Spinner') || content.includes('Spinner');
  if (!hasSpinner) {
    console.log(`⏭️  NO SPINNER: ${relPath}`);
    skipped++;
    continue;
  }

  const backHref = getBackHref(relPath);
  const backLabel = getBackLabel(relPath);

  // Strategy: Add a timeout state + useEffect that sets it after 4 seconds.
  // Then modify the loading guard to show ComingSoon when timed out.

  // Step 1: Add ComingSoon import
  if (!content.includes("from '@/components/shared/ComingSoon'")) {
    // Add after last import
    const lastImportIdx = content.lastIndexOf('\nimport ');
    if (lastImportIdx >= 0) {
      const endOfLine = content.indexOf('\n', lastImportIdx + 1);
      const insertPos = content.indexOf('\n', endOfLine);
      content = content.slice(0, endOfLine + 1) +
        `import { ComingSoon } from '@/components/shared/ComingSoon';\n` +
        content.slice(endOfLine + 1);
    }
  }

  // Step 2: Add comingSoonTimeout state and useEffect
  // Find the first useState in the default export function
  const useStateMatch = content.match(/const \[(\w+), set\w+\] = useState/);
  if (useStateMatch) {
    const idx = content.indexOf(useStateMatch[0]);
    content = content.slice(0, idx) +
      `const [comingSoonTimeout, setComingSoonTimeout] = useState(false);\n  ` +
      content.slice(idx);
  }

  // Step 3: Add useEffect for timeout — find first useEffect and add before it
  const useEffectIdx = content.indexOf('useEffect(');
  if (useEffectIdx >= 0) {
    // Find the beginning of the line
    let lineStart = useEffectIdx;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') lineStart--;
    const indent = content.slice(lineStart, useEffectIdx);
    content = content.slice(0, lineStart) +
      `${indent}useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);\n` +
      content.slice(lineStart);
  }

  // Step 4: Replace the loading guard to include comingSoonTimeout check
  // Common patterns:
  // Pattern A: if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  // Pattern B: if (loading) { return (...) }
  // Pattern C: if (loading) return <SomeSkeleton />;

  // Replace Spinner-based loading guards
  const spinnerPatterns = [
    // One-liner with Spinner
    /if \(loading\)\s*return\s*<div[^>]*>\s*<Spinner\s*\/>\s*<\/div>;/,
    // One-liner with Spinner and size
    /if \(loading\)\s*return\s*<div[^>]*>\s*<Spinner[^/]*\/>\s*<\/div>;/,
    // Multi-line return with Spinner
    /if \(loading\)\s*\{\s*return\s*\(\s*<div[^>]*>\s*<Spinner\s*\/>\s*<\/div>\s*\);\s*\}/,
  ];

  let replaced = false;
  for (const pattern of spinnerPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern,
        `if (loading && comingSoonTimeout) return <ComingSoon backHref="${backHref}" backLabel="${backLabel}" />;\n  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;`
      );
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    // Try a more generic approach: find `if (loading)` followed by return with Spinner
    const genericPattern = /if \(loading\)\s*return\s*[^;]*<Spinner[^;]*;/;
    if (genericPattern.test(content)) {
      content = content.replace(genericPattern, (match) => {
        return `if (loading && comingSoonTimeout) return <ComingSoon backHref="${backHref}" backLabel="${backLabel}" />;\n  ${match}`;
      });
      replaced = true;
    }
  }

  if (!replaced) {
    console.log(`⚠️  COULD NOT PATCH (no matching pattern): ${relPath}`);
    skipped++;
    continue;
  }

  // Ensure useState is imported
  if (!content.includes('useState')) {
    content = content.replace("import { useEffect", "import { useEffect, useState");
  }

  // Ensure useEffect is imported
  if (!content.includes('useEffect')) {
    if (content.includes("import { useState")) {
      content = content.replace("import { useState", "import { useState, useEffect");
    } else {
      // Add import
      content = "import { useState, useEffect } from 'react';\n" + content;
    }
  }

  fs.writeFileSync(absPath, content, 'utf8');
  console.log(`✅ PATCHED: ${relPath}`);
  patched++;
}

console.log(`\n═══════════════════════════════════`);
console.log(`✅ Patched: ${patched}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Missing: ${missing}`);
console.log(`═══════════════════════════════════`);
