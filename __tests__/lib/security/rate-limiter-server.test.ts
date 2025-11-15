import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limiter-server'

describe('Rate Limiter Server', () => {
  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      const identifier = 'test-user-1'
      const path = '/api/chat'

      const result = await checkRateLimit(identifier, path)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
      expect(result.retryAfter).toBeUndefined()
    })

    it('should block requests over limit', async () => {
      const identifier = 'test-user-2'
      const path = '/api/chat'

      for (let i = 0; i < 10; i++) {
        await checkRateLimit(identifier, path)
      }

      const result = await checkRateLimit(identifier, path)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should use default limit for unknown paths', async () => {
      const identifier = 'test-user-3'
      const path = '/api/unknown'

      const result = await checkRateLimit(identifier, path)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
    })

    it('should isolate limits per identifier', async () => {
      const user1 = 'test-user-4'
      const user2 = 'test-user-5'
      const path = '/api/chat'

      for (let i = 0; i < 10; i++) {
        await checkRateLimit(user1, path)
      }

      const result = await checkRateLimit(user2, path)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })
  })

  describe('getRateLimitHeaders', () => {
    it('should return correct headers when allowed', () => {
      const result = {
        allowed: true,
        remaining: 5,
        reset: 30,
      }

      const headers = getRateLimitHeaders(result)

      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBe('5')
      expect(headers['X-RateLimit-Reset']).toBe('30')
      expect(headers['Retry-After']).toBeUndefined()
    })

    it('should include Retry-After when blocked', () => {
      const result = {
        allowed: false,
        remaining: 0,
        reset: 45,
        retryAfter: 45,
      }

      const headers = getRateLimitHeaders(result)

      expect(headers['Retry-After']).toBe('45')
    })
  })
})
