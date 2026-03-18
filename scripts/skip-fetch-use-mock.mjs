/**
 * Replace the try-fetch-catch-mock pattern with direct mock calls.
 * Instead of trying to fetch an API that doesn't exist (causing slow timeouts),
 * go straight to mock data.
 *
 * Pattern to replace:
 *   try {
 *     const res = await fetch(...);
 *     if (!res.ok) throw ...;
 *     return res.json();
 *   } catch {
 *     console.warn(...);
 *     const { mockXxx } = await import('...');
 *     return mockXxx(...);
 *   }
 *
 * Becomes:
 *   // API not yet implemented — use mock
 *   const { mockXxx } = await import('...');
 *   return mockXxx(...);
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
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

  // Match the try-fetch-catch-mock pattern
  // This regex matches:
  //   try {
  //     [optional lines like const params, etc.]
  //     const res = await fetch(...);
  //     if (!res.ok) throw ...;
  //     return [await] res.json();
  //   } catch {
  //     console.warn(...);
  //     const { mockFunc } = await import('mockPath');
  //     return [await] mockFunc(args);
  //   }

  const pattern = /try\s*\{[^}]*?(?:const\s+\w+\s*=[^;]*;\s*)*const\s+res\s*=\s*await\s+fetch\([^)]+\);\s*\n\s*if\s*\(!res\.ok\)\s*throw[^;]+;\s*\n\s*return\s+(?:await\s+)?res\.json\(\);\s*\n\s*\}\s*catch\s*(?:\([^)]*\))?\s*\{\s*\n\s*console\.warn\([^)]+\);\s*\n\s*(const\s*\{\s*\w+\s*\}\s*=\s*await\s+import\([^)]+\);\s*\n\s*return\s+(?:await\s+)?\w+\([^)]*\);)\s*\n\s*\}/g;

  let fixCount = 0;

  content = content.replace(pattern, (match, mockBlock) => {
    fixCount++;
    return `// API not yet implemented — use mock\n    ${mockBlock.trim()}`;
  });

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    totalFixed += fixCount;
    totalFiles++;
    if (fixCount > 0) {
      console.log(`  ✓ ${file}: ${fixCount} fetch(es) replaced with direct mock`);
    }
  }
}

console.log(`\nDone! Replaced ${totalFixed} fetch calls with direct mock in ${totalFiles} files.`);
