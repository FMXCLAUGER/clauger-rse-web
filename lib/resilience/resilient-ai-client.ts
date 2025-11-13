import { logger } from '@/lib/security/secure-logger'

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  monitoringPeriod: number
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
}

export interface ResilienceConfig {
  circuitBreaker: CircuitBreakerConfig
  retry: RetryConfig
}

export interface ResilienceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  retriedRequests: number
  circuitOpens: number
  circuitCloses: number
  averageLatency: number
  p95Latency: number
  latencies: number[]
}

interface FailureRecord {
  timestamp: number
  error: string
}

export class ResilientAIClient {
  private config: ResilienceConfig
  private state: CircuitState = CircuitState.CLOSED
  private failures: FailureRecord[] = []
  private lastStateChange: number = Date.now()
  private metrics: ResilienceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    circuitOpens: 0,
    circuitCloses: 0,
    averageLatency: 0,
    p95Latency: 0,
    latencies: []
  }

  constructor(config?: Partial<ResilienceConfig>) {
    this.config = {
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 60000,
        ...config?.circuitBreaker
      },
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitter: true,
        ...config?.retry
      }
    }
  }

  public getCircuitState(): CircuitState {
    return this.state
  }

  public getMetrics(): ResilienceMetrics {
    return { ...this.metrics }
  }

  private calculateP95(latencies: number[]): number {
    if (latencies.length === 0) return 0
    const sorted = [...latencies].sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * 0.95) - 1
    return sorted[index] || 0
  }

  private updateMetrics(latency: number): void {
    this.metrics.latencies.push(latency)

    if (this.metrics.latencies.length > 1000) {
      this.metrics.latencies = this.metrics.latencies.slice(-1000)
    }

    this.metrics.averageLatency =
      this.metrics.latencies.reduce((sum, l) => sum + l, 0) / this.metrics.latencies.length

    this.metrics.p95Latency = this.calculateP95(this.metrics.latencies)
  }

  private cleanOldFailures(): void {
    const cutoff = Date.now() - this.config.circuitBreaker.monitoringPeriod
    this.failures = this.failures.filter(f => f.timestamp > cutoff)
  }

  private recordFailure(error: Error): void {
    this.failures.push({
      timestamp: Date.now(),
      error: error.message
    })
    this.cleanOldFailures()
    this.metrics.failedRequests++
  }

  private recordSuccess(): void {
    this.failures = []
    this.metrics.successfulRequests++
  }

  private changeState(newState: CircuitState): void {
    const oldState = this.state
    this.state = newState
    this.lastStateChange = Date.now()

    if (newState === CircuitState.OPEN) {
      this.metrics.circuitOpens++
    } else if (newState === CircuitState.CLOSED && oldState === CircuitState.HALF_OPEN) {
      this.metrics.circuitCloses++
    }

    logger.info('Circuit breaker state changed', {
      from: oldState,
      to: newState,
      failureCount: this.failures.length,
      totalRequests: this.metrics.totalRequests
    })
  }

  private checkCircuitState(): void {
    if (this.state === CircuitState.OPEN) {
      const timeSinceOpen = Date.now() - this.lastStateChange
      if (timeSinceOpen >= this.config.circuitBreaker.resetTimeout) {
        this.changeState(CircuitState.HALF_OPEN)
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.cleanOldFailures()
      if (this.failures.length >= this.config.circuitBreaker.failureThreshold) {
        this.changeState(CircuitState.OPEN)
      }
    }
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = this.config.retry.initialDelay *
      Math.pow(this.config.retry.backoffMultiplier, attempt)

    const cappedDelay = Math.min(baseDelay, this.config.retry.maxDelay)

    if (this.config.retry.jitter) {
      const jitterFactor = 0.25
      const jitterRange = cappedDelay * jitterFactor
      const jitter = (Math.random() * jitterRange * 2) - jitterRange
      return Math.max(0, cappedDelay + jitter)
    }

    return cappedDelay
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public async executeWithResilience<T>(
    operation: () => Promise<T>,
    operationId: string
  ): Promise<T> {
    this.metrics.totalRequests++
    this.checkCircuitState()

    if (this.state === CircuitState.OPEN) {
      const error = new Error('Circuit breaker is OPEN - rejecting request')
      logger.warn('Request rejected by circuit breaker', {
        operationId,
        state: this.state,
        failureCount: this.failures.length
      })
      throw error
    }

    let lastError: Error | null = null
    const maxAttempts = this.config.retry.maxRetries + 1
    const startTime = Date.now()

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) {
        this.metrics.retriedRequests++
        const delay = this.calculateDelay(attempt - 1)

        logger.info('Retrying request', {
          operationId,
          attempt: attempt + 1,
          maxAttempts,
          delayMs: Math.round(delay)
        })

        await this.sleep(delay)

        this.checkCircuitState()
        if (this.state !== CircuitState.CLOSED && this.state !== CircuitState.HALF_OPEN) {
          logger.warn('Circuit opened during retry - aborting', {
            operationId,
            attempt: attempt + 1
          })
          break
        }
      }

      try {
        const result = await operation()
        const latency = Date.now() - startTime
        this.updateMetrics(latency)
        this.recordSuccess()

        if (this.state === CircuitState.HALF_OPEN) {
          this.changeState(CircuitState.CLOSED)
        }

        if (attempt > 0) {
          logger.info('Request succeeded after retry', {
            operationId,
            attempt: attempt + 1,
            latencyMs: latency
          })
        }

        return result
      } catch (error: any) {
        lastError = error
        this.recordFailure(error)
        this.checkCircuitState()

        if (this.state === CircuitState.HALF_OPEN) {
          this.changeState(CircuitState.OPEN)
        }

        logger.warn('Request failed', {
          operationId,
          attempt: attempt + 1,
          maxAttempts,
          error: error.message,
          circuitState: this.state
        })

        if (attempt === maxAttempts - 1) {
          logger.error('Request failed after all retries', {
            operationId,
            totalAttempts: attempt + 1,
            circuitState: this.state,
            error: error.message
          })
        }
      }
    }

    const latency = Date.now() - startTime
    this.updateMetrics(latency)

    throw lastError || new Error('Operation failed after retries')
  }

  public resetCircuit(): void {
    this.changeState(CircuitState.CLOSED)
    this.failures = []
    logger.info('Circuit breaker manually reset')
  }

  public getStats(): string {
    const successRate = this.metrics.totalRequests > 0
      ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2)
      : '0.00'

    return `
Resilience Stats:
  State: ${this.state}
  Total Requests: ${this.metrics.totalRequests}
  Successful: ${this.metrics.successfulRequests} (${successRate}%)
  Failed: ${this.metrics.failedRequests}
  Retried: ${this.metrics.retriedRequests}
  Circuit Opens: ${this.metrics.circuitOpens}
  Circuit Closes: ${this.metrics.circuitCloses}
  Avg Latency: ${Math.round(this.metrics.averageLatency)}ms
  P95 Latency: ${Math.round(this.metrics.p95Latency)}ms
  Recent Failures: ${this.failures.length}
    `.trim()
  }
}
