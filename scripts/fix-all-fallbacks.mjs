/**
 * Batch-fix all service files:
 * Replace empty catch-block fallbacks with mock data imports.
 *
 * Strategy:
 * 1. For each service file, find the mock module path from the isMock() blocks
 * 2. For each function, extract the mock function name + args from the isMock() block
 * 3. Replace the catch block's empty return with the mock import + call
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_DIR = join(__dirname, '..', 'lib', 'api');

const files = readdirSync(API_DIR).filter(f => f.endsWith('.service.ts'));

let totalFixed = 0;
let totalFiles = 0;

for (const file of files) {
  const filePath = join(API_DIR, file);
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Find all isMock() blocks: extract mock module path and mock function calls
  // Pattern: if (isMock()) { const { mockXxx } = await import('path'); return mockXxx(args); }
  // We need to find pairs: the isMock import+call, and the corresponding catch fallback

  // Step 1: Find all mock imports in isMock blocks
  // Regex to find: const { funcName } = await import('modulePath');
  const mockImportPattern = /const\s*\{\s*(\w+)\s*\}\s*=\s*await\s+import\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;/g;
  const mockImports = [];
  let m;
  while ((m = mockImportPattern.exec(content)) !== null) {
    mockImports.push({ funcName: m[1], modulePath: m[2], index: m.index });
  }

  if (mockImports.length === 0) continue;

  // Step 2: For each mock import, find the corresponding return statement to get args
  // Pattern: return [await] funcName(args);
  for (const imp of mockImports) {
    const afterImport = content.substring(imp.index);
    const returnMatch = afterImport.match(new RegExp(`return\\s+(?:await\\s+)?${imp.funcName}\\(([^)]*)\\)`));
    if (returnMatch) {
      imp.args = returnMatch[1];
    } else {
      imp.args = '';
    }
  }

  // Step 3: Find catch blocks with console.warn + empty returns that DON'T already have mock imports
  // We need to match the pattern:
  //   } catch {
  //     console.warn('[xxx]...');
  //     return []; (or return {...} as Type; or similar)
  //   }
  //
  // And NOT match blocks that already have `await import(` (already fixed)

  // Find all catch blocks
  const catchPattern = /(\} catch\s*(?:\([^)]*\))?\s*\{)\s*\n(\s*)(console\.warn\([^)]+\);)\s*\n\s*(return\s+(?:(?:\[\])|(?:\{[^}]*\}(?:\s*as\s+(?:unknown\s+as\s+)?\w+[\w<>\[\]]*)?)|(?:'[^']*'));\s*)\n(\s*\})/g;

  let fixCount = 0;
  let catchMatch;

  while ((catchMatch = catchPattern.exec(content)) !== null) {
    const fullMatch = catchMatch[0];
    const catchOpen = catchMatch[1];
    const indent = catchMatch[2];
    const warnLine = catchMatch[3];
    const returnLine = catchMatch[4];
    const catchClose = catchMatch[5];

    // Skip if already has mock import
    if (fullMatch.includes('await import(')) continue;
    // Skip void returns (no data)
    if (returnLine.trim() === 'return;') continue;

    // Find which function this catch block belongs to
    // Look backwards from the match position to find the enclosing function
    const beforeCatch = content.substring(0, catchMatch.index);

    // Find the nearest isMock block before this catch
    // The isMock block should be in the same function
    let bestMock = null;
    let bestDistance = Infinity;

    for (const imp of mockImports) {
      const distance = catchMatch.index - imp.index;
      if (distance > 0 && distance < bestDistance) {
        // Make sure there's no other function declaration between the mock import and this catch
        const between = content.substring(imp.index, catchMatch.index);
        const funcDeclCount = (between.match(/export\s+(?:async\s+)?function\s+\w+/g) || []).length;
        if (funcDeclCount <= 1) { // At most the function containing both
          bestMock = imp;
          bestDistance = distance;
        }
      }
    }

    if (!bestMock) continue;

    // Build replacement
    const updatedWarn = warnLine.replace('using fallback', 'using mock fallback');
    const replacement = `${catchOpen}\n${indent}${updatedWarn}\n${indent}const { ${bestMock.funcName} } = await import('${bestMock.modulePath}');\n${indent}return ${bestMock.funcName}(${bestMock.args});\n${catchClose}`;

    content = content.replace(fullMatch, replacement);
    fixCount++;
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    totalFixed += fixCount;
    totalFiles++;
    if (fixCount > 0) {
      console.log(`  ✓ ${file}: ${fixCount} fallback(s) fixed`);
    }
  }
}

console.log(`\nDone! Fixed ${totalFixed} fallback(s) across ${totalFiles} files.`);
