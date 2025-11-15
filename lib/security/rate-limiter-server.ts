interface RateLimitConfig {
  requests: number
  window: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/chat': { requests: 10, window: 60 },
  '/api/*': { requests: 100, window: 60 },
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startCleanup()
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const entries = Array.from(this.store.entries())
      for (const [key, entry] of entries) {
        if (entry.resetAt < now) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  public async increment(key: string, windowSeconds: number): Promise<RateLimitEntry> {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || entry.resetAt < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + windowSeconds * 1000,
      }
      this.store.set(key, newEntry)
      return newEntry
    }

    entry.count += 1
    this.store.set(key, entry)
    return entry
  }

  public cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

const rateLimiter = new InMemoryRateLimiter()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
  retryAfter?: number
}

export async function checkRateLimit(
  identifier: string,
  path: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[path] || RATE_LIMITS['/api/*']
  const key = `ratelimit:${identifier}:${path}`

  const entry = await rateLimiter.increment(key, config.window)
  const now = Date.now()
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000)

  const allowed = entry.count <= config.requests
  const remaining = Math.max(0, config.requests - entry.count)

  return {
    allowed,
    remaining,
    reset: resetSeconds,
    retryAfter: allowed ? undefined : resetSeconds,
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
    ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
  }
}
