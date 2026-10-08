interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimitRecord>();

/**
 * Limitador de tasa simple en memoria por clave (ej. IP o IP + slug)
 */
export function checkRateLimit(
  key: string,
  limit = 20,
  windowSeconds = 60
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = cache.get(key);

  if (!record || now > record.resetAt) {
    cache.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetIn: windowSeconds,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetIn: Math.ceil((record.resetAt - now) / 1000),
  };
}
