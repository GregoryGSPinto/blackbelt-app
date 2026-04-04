// ============================================================
// BlackBelt v2 — Rate Limiter (F8)
// Rate limiter em memoria baseado em IP + endpoint.
// Usa Map (suficiente para Vercel serverless).
// Em producao pesada: migrar para Upstash Redis.
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Numero maximo de requisicoes na janela. Padrao: 60 */
  limit?: number;
  /** Tamanho da janela em ms. Padrao: 60000 (1 minuto) */
  windowMs?: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Limpar entradas expiradas periodicamente para evitar memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Verifica rate limit para um identificador (ex: IP + endpoint).
 * Retorna { success: true } se dentro do limite, { success: false } se excedeu.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 60;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  // Cleanup periodico
  cleanup();

  const entry = rateLimitMap.get(identifier);

  // Primeira requisicao ou janela expirada
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  // Limite excedido
  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  // Incrementar contador
  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
