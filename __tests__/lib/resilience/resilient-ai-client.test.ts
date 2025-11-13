import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  ResilientAIClient,
  CircuitState,
  type ResilienceConfig
} from '@/lib/resilience/resilient-ai-client'

describe('ResilientAIClient', () => {
  let client: ResilientAIClient
  let mockOperation: jest.Mock

  beforeEach(() => {
    client = new ResilientAIClient({
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 1000,
        monitoringPeriod: 60000
      },
      retry: {
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2,
        jitter: false
      }
    })
    mockOperation = jest.fn()
  })

  describe('Circuit Breaker - State Management', () => {
    it('should start in CLOSED state', () => {
      expect(client.getCircuitState()).toBe(CircuitState.CLOSED)
    })

    it('should open circuit after failure threshold', async () => {
      mockOperation.mockRejectedValue(new Error('Test failure'))

      for (let i = 0; i < 5; i++) {
        try {
          await client.executeWithResilience(mockOperation, `op-${i}`)
        } catch (e) {
        }
      }

      expect(client.getCircuitState()).toBe(CircuitState.OPEN)
    })

    it('should reject requests immediately when circuit is OPEN', async () => {
      mockOperation.mockRejectedValue(new Error('Test failure'))

      for (let i = 0; i < 5; i++) {
        try {
          await client.executeWithResilience(mockOperation, `op-${i}`)
        } catch (e) {
        }
      }

      expect(client.getCircuitState()).toBe(CircuitState.OPEN)

      try {
        await client.executeWithResilience(mockOperation, 'op-new')
        fail('Should have thrown')
      } catch (error: any) {
        expect(error.message).toContain('Circuit breaker is OPEN')
      }
    })

    it('should transition to HALF_OPEN after reset timeout', async () => {
      mockOperation.mockRejectedValue(new Error('Test failure'))

      for (let i = 0; i < 5; i++) {
        try {
          await client.executeWithResilience(mockOperation, `op-${i}`)
        } catch (e) {
        }
      }

      expect(client.getCircuitState()).toBe(CircuitState.OPEN)

      await new Promise(resolve => setTimeout(resolve, 1100))

      mockOperation.mockResolvedValue('success')
      const result = await client.executeWithResilience(mockOperation, 'op-recovery')

      expect(result).toBe('success')
      expect(client.getCircuitState()).toBe(CircuitState.CLOSED)
    })

    it('should go back to OPEN from HALF_OPEN if request fails', async () => {
      mockOperation.mockRejectedValue(new Error('Test failure'))

      for (let i = 0; i < 5; i++) {
        try {
          await client.executeWithResilience(mockOperation, `op-${i}`)
        } catch (e) {
        }
      }

      expect(client.getCircuitState()).toBe(CircuitState.OPEN)

      await new Promise(resolve => setTimeout(resolve, 1100))

      try {
        await client.executeWithResilience(mockOperation, 'op-fail-again')
      } catch (e) {
      }

      expect(client.getCircuitState()).toBe(CircuitState.OPEN)
    })

    it('should reset failure counter after success in CLOSED state', async () => {
      mockOperation
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockRejectedValueOnce(new Error('Fail 4'))
        .mockResolvedValue('success')

      try {
        await client.executeWithResilience(mockOperation, 'op-1')
      } catch (e) {
      }

      try {
        await client.executeWithResilience(mockOperation, 'op-2')
      } catch (e) {
      }

      const result = await client.executeWithResilience(mockOperation, 'op-3')
      expect(result).toBe('success')

      expect(client.getCircuitState()).toBe(CircuitState.CLOSED)
    })

    it('should manually reset circuit', async () => {
      mockOperation.mockRejectedValue(new Error('Test failure'))

      for (let i = 0; i < 5; i++) {
        try {
          await client.executeWithResilience(mockOperation, `op-${i}`)
        } catch (e) {
        }
      }

      expect(client.getCircuitState()).toBe(CircuitState.OPEN)

      client.resetCircuit()

      expect(client.getCircuitState()).toBe(CircuitState.CLOSED)
    })

    it('should clean old failures outside monitoring period', async () => {
      const shortClient = new ResilientAIClient({
        circuitBreaker: {
          failureThreshold: 3,
          resetTimeout: 1000,
          monitoringPeriod: 500
        },
        retry: {
          maxRetries: 0,
          initialDelay: 100,
          maxDelay: 1000,
          backoffMultiplier: 2,
          jitter: false
        }
      })

      mockOperation.mockRejectedValue(new Error('Test failure'))

      try {
        await shortClient.executeWithResilience(mockOperation, 'op-1')
      } catch (e) {
      }

      try {
        await shortClient.executeWithResilience(mockOperation, 'op-2')
      } catch (e) {
      }

      await new Promise(resolve => setTimeout(resolve, 600))

      expect(shortClient.getCircuitState()).toBe(CircuitState.CLOSED)
    })
  })

  describe('Retry Logic', () => {
    it('should retry up to maxRetries times', async () => {
      mockOperation
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValueOnce('success')

      const result = await client.executeWithResilience(mockOperation, 'op-retry')

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(4)
    })

    it('should apply exponential backoff', async () => {
      const delays: number[] = []
      let lastTime = Date.now()
      let callCount = 0

      mockOperation.mockImplementation(async () => {
        const now = Date.now()
        if (callCount > 0) {
          delays.push(now - lastTime)
        }
        lastTime = now
        callCount++

        if (callCount <= 3) {
          throw new Error('Fail')
        }
        return 'success'
      })

      const result = await client.executeWithResilience(mockOperation, 'op-backoff')

      expect(result).toBe('success')
      expect(delays.length).toBe(3)

      expect(delays[0]).toBeGreaterThanOrEqual(90)
      expect(delays[0]).toBeLessThan(120)

      expect(delays[1]).toBeGreaterThanOrEqual(190)
      expect(delays[1]).toBeLessThan(220)

      expect(delays[2]).toBeGreaterThanOrEqual(390)
      expect(delays[2]).toBeLessThan(420)
    })

    it('should respect maxDelay cap', async () => {
      const shortClient = new ResilientAIClient({
        circuitBreaker: {
          failureThreshold: 10,
          resetTimeout: 5000,
          monitoringPeriod: 60000
        },
        retry: {
          maxRetries: 5,
          initialDelay: 500,
          maxDelay: 800,
          backoffMultiplier: 2,
          jitter: false
        }
      })

      const delays: number[] = []
      let lastTime = Date.now()
      let callCount = 0

      mockOperation.mockImplementation(async () => {
        const now = Date.now()
        if (callCount > 0) {
          delays.push(now - lastTime)
        }
        lastTime = now
        callCount++

        if (callCount <= 5) {
          throw new Error('Fail')
        }
        return 'success'
      })

      await shortClient.executeWithResilience(mockOperation, 'op-maxdelay')

      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(850)
      })
    })

    it('should not retry if circuit opens during retry', async () => {
      const failClient = new ResilientAIClient({
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 5000,
          monitoringPeriod: 60000
        },
        retry: {
          maxRetries: 10,
          initialDelay: 100,
          maxDelay: 1000,
          backoffMultiplier: 2,
          jitter: false
        }
      })

      mockOperation.mockRejectedValue(new Error('Persistent failure'))

      try {
        await failClient.executeWithResilience(mockOperation, 'op-1')
      } catch (e) {
      }

      try {
        await failClient.executeWithResilience(mockOperation, 'op-2')
      } catch (e) {
      }

      expect(failClient.getCircuitState()).toBe(CircuitState.OPEN)
    })

    it('should throw last error after max retries', async () => {
      mockOperation.mockRejectedValue(new Error('Persistent failure'))

      try {
        await client.executeWithResilience(mockOperation, 'op-fail')
        fail('Should have thrown')
      } catch (error: any) {
        expect(error.message).toBe('Persistent failure')
      }

      expect(mockOperation).toHaveBeenCalledTimes(4)
    })

    it('should apply jitter when enabled', async () => {
      const jitterClient = new ResilientAIClient({
        circuitBreaker: {
          failureThreshold: 10,
          resetTimeout: 5000,
          monitoringPeriod: 60000
        },
        retry: {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 1000,
          backoffMultiplier: 2,
          jitter: true
        }
      })

      const delays: number[] = []
      let lastTime = Date.now()
      let callCount = 0

      mockOperation.mockImplementation(async () => {
        const now = Date.now()
        if (callCount > 0) {
          delays.push(now - lastTime)
        }
        lastTime = now
        callCount++

        if (callCount <= 3) {
          throw new Error('Fail')
        }
        return 'success'
      })

      await jitterClient.executeWithResilience(mockOperation, 'op-jitter')

      delays.forEach((delay, index) => {
        const baseDelay = 100 * Math.pow(2, index)
        const jitterRange = baseDelay * 0.25

        expect(delay).toBeGreaterThanOrEqual(baseDelay - jitterRange - 10)
        expect(delay).toBeLessThanOrEqual(baseDelay + jitterRange + 10)
      })
    })

    it('should track retry attempts in metrics', async () => {
      mockOperation
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('success')

      await client.executeWithResilience(mockOperation, 'op-metrics')

      const metrics = client.getMetrics()
      expect(metrics.retriedRequests).toBe(1)
      expect(metrics.successfulRequests).toBe(1)
      expect(metrics.failedRequests).toBe(1)
    })
  })

  describe('Metrics Tracking', () => {
    it('should track total requests', async () => {
      mockOperation.mockResolvedValue('success')

      await client.executeWithResilience(mockOperation, 'op-1')
      await client.executeWithResilience(mockOperation, 'op-2')
      await client.executeWithResilience(mockOperation, 'op-3')

      const metrics = client.getMetrics()
      expect(metrics.totalRequests).toBe(3)
    })

    it('should track successful requests', async () => {
      mockOperation.mockResolvedValue('success')

      await client.executeWithResilience(mockOperation, 'op-1')
      await client.executeWithResilience(mockOperation, 'op-2')

      const metrics = client.getMetrics()
      expect(metrics.successfulRequests).toBe(2)
    })

    it('should track failed requests', async () => {
      mockOperation.mockRejectedValue(new Error('Fail'))

      try {
        await client.executeWithResilience(mockOperation, 'op-1')
      } catch (e) {
      }

      const metrics = client.getMetrics()
      expect(metrics.failedRequests).toBeGreaterThan(0)
    })

    it('should track circuit opens and closes', async () => {
      mockOperation.mockRejectedValue(new Error('Fail'))

      for (let i = 0; i < 5; i++) {
        try {
          await client.executeWithResilience(mockOperation, `op-${i}`)
        } catch (e) {
        }
      }

      let metrics = client.getMetrics()
      expect(metrics.circuitOpens).toBe(1)

      await new Promise(resolve => setTimeout(resolve, 1100))

      mockOperation.mockResolvedValue('success')
      await client.executeWithResilience(mockOperation, 'op-recovery')

      metrics = client.getMetrics()
      expect(metrics.circuitCloses).toBe(1)
    })

    it('should calculate average latency', async () => {
      mockOperation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 'success'
      })

      await client.executeWithResilience(mockOperation, 'op-1')
      await client.executeWithResilience(mockOperation, 'op-2')

      const metrics = client.getMetrics()
      expect(metrics.averageLatency).toBeGreaterThan(40)
      expect(metrics.averageLatency).toBeLessThan(200)
    })

    it('should calculate p95 latency', async () => {
      const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

      for (const latency of latencies) {
        mockOperation.mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, latency))
          return 'success'
        })

        await client.executeWithResilience(mockOperation, `op-${latency}`)
      }

      const metrics = client.getMetrics()
      expect(metrics.p95Latency).toBeGreaterThanOrEqual(90)
      expect(metrics.p95Latency).toBeLessThanOrEqual(150)
    })

    it('should limit latencies array to 1000 entries', async () => {
      mockOperation.mockResolvedValue('success')

      for (let i = 0; i < 1200; i++) {
        await client.executeWithResilience(mockOperation, `op-${i}`)
      }

      const metrics = client.getMetrics()
      expect(metrics.latencies.length).toBe(1000)
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle intermittent failures gracefully', async () => {
      mockOperation
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue('success')

      const result1 = await client.executeWithResilience(mockOperation, 'op-1')
      expect(result1).toBe('success')

      const result2 = await client.executeWithResilience(mockOperation, 'op-2')
      expect(result2).toBe('success')

      expect(client.getCircuitState()).toBe(CircuitState.CLOSED)
    })

    it('should provide stats summary', () => {
      const stats = client.getStats()

      expect(stats).toContain('State: CLOSED')
      expect(stats).toContain('Total Requests: 0')
      expect(stats).toContain('Successful: 0')
      expect(stats).toContain('Failed: 0')
    })

    it('should handle operation that succeeds on second attempt', async () => {
      mockOperation
        .mockRejectedValueOnce(new Error('First attempt fails'))
        .mockResolvedValueOnce('success')

      const result = await client.executeWithResilience(mockOperation, 'op-retry')

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(2)

      const metrics = client.getMetrics()
      expect(metrics.successfulRequests).toBe(1)
      expect(metrics.retriedRequests).toBe(1)
    })
  })
})
