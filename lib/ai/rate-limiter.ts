import { logStorageError } from '@/lib/security'

interface RateLimiterState {
  tokens: number
  lastUpdate: number
}

interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
  remainingTokens?: number
}

export class RateLimiter {
  private readonly storageKey = 'clauger-rate-limit'
  private readonly rpm: number
  private readonly capacity: number

  constructor(requestsPerMinute: number = 50) {
    this.rpm = requestsPerMinute
    this.capacity = requestsPerMinute
  }

  async checkAndConsume(): Promise<RateLimitResult> {
    const state = this.getState()
    const now = Date.now()
    const elapsed = (now - state.lastUpdate) / 1000

    const tokensToAdd = elapsed * (this.rpm / 60)
    const newTokens = Math.min(this.capacity, state.tokens + tokensToAdd)

    if (newTokens >= 1) {
      this.setState({
        tokens: newTokens - 1,
        lastUpdate: now
      })

      return {
        allowed: true,
        remainingTokens: Math.floor(newTokens - 1)
      }
    }

    const tokensNeeded = 1 - newTokens
    const retryAfter = Math.ceil(tokensNeeded / (this.rpm / 60))

    return {
      allowed: false,
      retryAfter,
      remainingTokens: 0
    }
  }

  getRemainingCapacity(): number {
    const state = this.getState()
    const now = Date.now()
    const elapsed = (now - state.lastUpdate) / 1000
    const tokensToAdd = elapsed * (this.rpm / 60)
    return Math.floor(Math.min(this.capacity, state.tokens + tokensToAdd))
  }

  reset(): void {
    this.setState({
      tokens: this.capacity,
      lastUpdate: Date.now()
    })
  }

  private getState(): RateLimiterState {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const state = JSON.parse(stored)
        return {
          tokens: state.tokens ?? this.capacity,
          lastUpdate: state.lastUpdate ?? Date.now()
        }
      }
    } catch (error) {
      logStorageError('read', error, 'rateLimiterState')
    }

    return {
      tokens: this.capacity,
      lastUpdate: Date.now()
    }
  }

  private setState(state: RateLimiterState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state))
    } catch (error) {
      logStorageError('save', error, 'rateLimiterState')
    }
  }
}

export const chatRateLimiter = new RateLimiter(50)
