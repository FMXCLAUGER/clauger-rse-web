import { RateLimiter } from '@/lib/ai/rate-limiter'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    localStorage.clear()
    rateLimiter = new RateLimiter(10)
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Token Bucket Algorithm', () => {
    it('should allow requests within rate limit', async () => {
      const result = await rateLimiter.checkAndConsume()

      expect(result.allowed).toBe(true)
      expect(result.remainingTokens).toBeGreaterThanOrEqual(0)
    })

    it('should block requests when rate limit exceeded', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkAndConsume()
      }

      const result = await rateLimiter.checkAndConsume()

      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should refill tokens over time', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkAndConsume()
      }

      await new Promise(resolve => setTimeout(resolve, 7000))

      const result = await rateLimiter.checkAndConsume()

      expect(result.allowed).toBe(true)
    }, 10000)

    it('should return correct retry time when blocked', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkAndConsume()
      }

      const result = await rateLimiter.checkAndConsume()

      expect(result.retryAfter).toBeLessThan(10)
      expect(result.retryAfter).toBeGreaterThan(0)
    })
  })

  describe('State Persistence', () => {
    it('should persist state to localStorage', async () => {
      await rateLimiter.checkAndConsume()

      const stored = localStorage.getItem('clauger-rate-limit')
      expect(stored).not.toBeNull()

      const state = JSON.parse(stored!)
      expect(state.tokens).toBeDefined()
      expect(state.lastUpdate).toBeDefined()
    })

    it('should restore state from localStorage', async () => {
      await rateLimiter.checkAndConsume()

      const newLimiter = new RateLimiter(10)
      const capacity = newLimiter.getRemainingCapacity()

      expect(capacity).toBeLessThan(10)
    })

    it('should handle corrupted localStorage data', async () => {
      localStorage.setItem('clauger-rate-limit', 'invalid json')

      const newLimiter = new RateLimiter(10)
      const result = await newLimiter.checkAndConsume()

      expect(result.allowed).toBe(true)
    })
  })

  describe('Capacity Management', () => {
    it('should return correct remaining capacity', () => {
      const capacity = rateLimiter.getRemainingCapacity()

      expect(capacity).toBe(10)
    })

    it('should decrease capacity after consumption', async () => {
      await rateLimiter.checkAndConsume()

      const capacity = rateLimiter.getRemainingCapacity()

      expect(capacity).toBeLessThan(10)
      expect(capacity).toBeGreaterThanOrEqual(0)
    })

    it('should reset capacity correctly', () => {
      rateLimiter.checkAndConsume()
      rateLimiter.reset()

      const capacity = rateLimiter.getRemainingCapacity()

      expect(capacity).toBe(10)
    })
  })
})
