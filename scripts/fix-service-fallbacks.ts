/**
 * Script to fix all service files that return empty fallback data
 * instead of falling back to mock data when the API is not available.
 *
 * Pattern to fix:
 *   } catch {
 *     console.warn('[...] ... fallback');
 *     return [];  // or return { ... empty ... };
 *   }
 *
 * Should become:
 *   } catch {
 *     console.warn('[...] ... mock fallback');
 *     const { mockXxx } = await import('@/lib/mocks/xxx.mock');
 *     return mockXxx(...);
 *   }
 */

import * as fs from 'fs';
import * as path from 'path';

const API_DIR = path.join(__dirname, '..', 'lib', 'api');
const MOCKS_DIR = path.join(__dirname, '..', 'lib', 'mocks');

// Already fixed services - skip these
const SKIP_FILES = new Set([
  'admin-dashboard.service.ts',
  'relatorios.service.ts',
  'superadmin-dashboard.service.ts',
  'superadmin-analytics.service.ts',
  'superadmin-pipeline.service.ts',
  'superadmin-health.service.ts',
  'superadmin-features.service.ts',
  'superadmin-comunicacao.service.ts',
  'superadmin-revenue.service.ts',
  'recepcao-caixa.service.ts',
  'errors.ts',
  'auth.service.ts',
  'tutorial.service.ts',
]);

function getServiceFiles(): string[] {
  return fs.readdirSync(API_DIR)
    .filter(f => f.endsWith('.service.ts') && !SKIP_FILES.has(f));
}

function getMockFile(serviceName: string): string | null {
  // service: xxx.service.ts -> mock: xxx.mock.ts
  const mockName = serviceName.replace('.service.ts', '.mock.ts');
  const mockPath = path.join(MOCKS_DIR, mockName);
  if (fs.existsSync(mockPath)) return mockName;
  return null;
}

function getMockExports(mockFileName: string): string[] {
  const mockPath = path.join(MOCKS_DIR, mockFileName);
  const content = fs.readFileSync(mockPath, 'utf-8');
  const exports: string[] = [];
  const regex = /export\s+(?:async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  return exports;
}

function processService(fileName: string): { fixed: number; file: string } {
  const filePath = path.join(API_DIR, fileName);
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  const mockFile = getMockFile(fileName);
  if (!mockFile) {
    return { fixed: 0, file: fileName };
  }

  const mockExports = getMockExports(mockFile);
  const mockModulePath = `@/lib/mocks/${mockFile.replace('.ts', '')}`;

  // Find all isMock() blocks to understand which mock function maps to which service function
  // Pattern: the isMock() block imports { mockXxx } and calls it with certain args
  const mockImportRegex = /const\s*\{\s*(\w+)\s*\}\s*=\s*await\s+import\s*\(\s*['"]@\/lib\/mocks\/[^'"]+['"]\s*\)\s*;\s*\n\s*return\s+(?:await\s+)?(\w+)\(([^)]*)\)/g;

  // Build a map of mock function -> its call args from the isMock() blocks
  const mockCallMap: Map<string, string> = new Map();
  let importMatch;
  while ((importMatch = mockImportRegex.exec(content)) !== null) {
    const [, importedName, calledName, args] = importMatch;
    if (importedName === calledName) {
      mockCallMap.set(calledName, args);
    }
  }

  // Now find catch blocks with empty returns and replace them
  // Pattern: catch { or catch (e) {
  //   console.warn('[...] ... fallback' or 'using fallback');
  //   return []; or return { ... };
  // }

  let fixCount = 0;

  // Strategy: find each function, match its isMock block to get the mock function,
  // then fix the catch fallback

  // Simpler approach: find all catch blocks that have console.warn AND return empty data
  // and are NOT already using mock imports

  // Match: } catch { or } catch (e) { ... console.warn ... return ... }
  // But NOT blocks that already import from mocks

  const catchBlockRegex = /\} catch\s*(?:\([^)]*\))?\s*\{\s*\n\s*console\.warn\(\s*'([^']+)'\s*\);\s*\n\s*(return\s+(?:\[\]|{[^}]*}(?:\s*as\s+\w+)?|\{[^}]*\}\s*as\s+unknown\s+as\s+\w+);)/g;

  // For each catch block, find the enclosing function to determine which mock to use
  const lines = content.split('\n');

  // Find functions and their mock counterparts
  const funcRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  const functions: { name: string; args: string; index: number }[] = [];
  let funcMatch;
  while ((funcMatch = funcRegex.exec(content)) !== null) {
    functions.push({ name: funcMatch[1], args: funcMatch[2], index: funcMatch.index });
  }

  // For each function, find the mock function name (usually 'mock' + capitalize first letter)
  function findMockForFunction(funcName: string): string | null {
    // Try common patterns
    const mockName = 'mock' + funcName.charAt(0).toUpperCase() + funcName.slice(1);
    if (mockExports.includes(mockName)) return mockName;

    // Also check if it's directly in mockCallMap
    for (const [mock] of mockCallMap) {
      if (mock.toLowerCase().includes(funcName.toLowerCase().replace('get', '').replace('list', ''))) {
        return mock;
      }
    }

    return null;
  }

  // Process each function's catch block
  for (const func of functions) {
    const mockFunc = findMockForFunction(func.name);
    if (!mockFunc) continue;

    const mockArgs = mockCallMap.get(mockFunc) ?? '';

    // Find the function's body
    const funcEnd = functions.find(f => f.index > func.index)?.index ?? content.length;
    const funcBody = content.substring(func.index, funcEnd);

    // Find catch blocks with empty returns in this function
    const innerCatchRegex = /(\} catch\s*(?:\([^)]*\))?\s*\{\s*\n\s*)(console\.warn\(\s*'[^']+'\s*\);\s*\n\s*)(return\s+(?:\[\]|{[^}]*}(?:\s*as\s+(?:unknown\s+as\s+)?\w+)?);)/g;

    let catchMatch;
    while ((catchMatch = innerCatchRegex.exec(funcBody)) !== null) {
      const fullMatch = catchMatch[0];
      const catchStart = catchMatch[1];
      const warnLine = catchMatch[2];

      // Skip if it already has a mock import
      if (fullMatch.includes('await import(')) continue;

      // Build replacement
      const updatedWarn = warnLine.replace('using fallback', 'using mock fallback').replace('fallback —', 'mock fallback —');
      const replacement = `${catchStart}${updatedWarn}const { ${mockFunc} } = await import('${mockModulePath}');\n      return ${mockFunc}(${mockArgs});`;

      content = content.replace(fullMatch, replacement);
      fixCount++;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return { fixed: fixCount, file: fileName };
}

// Main
console.log('Fixing service fallbacks...\n');

const files = getServiceFiles();
let totalFixed = 0;

for (const file of files) {
  const result = processService(file);
  if (result.fixed > 0) {
    console.log(`  ✓ ${result.file}: ${result.fixed} fallback(s) fixed`);
    totalFixed += result.fixed;
  }
}

console.log(`\nDone! Fixed ${totalFixed} fallback(s) across ${files.length} service files.`);
