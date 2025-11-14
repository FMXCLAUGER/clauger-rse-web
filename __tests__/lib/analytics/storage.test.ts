import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Create mock functions before any imports
const mockLogStorageError = jest.fn()
const mockLoggerWarn = jest.fn()
const mockLoggerError = jest.fn()
const mockLoggerInfo = jest.fn()
const mockLoggerDebug = jest.fn()

const mockLogger = {
  warn: mockLoggerWarn,
  error: mockLoggerError,
  info: mockLoggerInfo,
  debug: mockLoggerDebug,
}

// Mock the SecureLogger module
jest.mock('@/lib/security/secure-logger', () => ({
  SecureLogger: jest.fn().mockImplementation(() => mockLogger),
  logger: mockLogger,
}))

// Mock the logger helpers module
jest.mock('@/lib/security/logger-helpers', () => ({
  logStorageError: mockLogStorageError,
  logError: jest.fn(),
  logPerformance: jest.fn(),
}))

// Mock the security index module
jest.mock('@/lib/security', () => ({
  logger: mockLogger,
  logStorageError: mockLogStorageError,
  logError: jest.fn(),
  logPerformance: jest.fn(),
}))

import {
  saveEvent,
  getEvents,
  calculateSummary,
  exportMetrics,
  clearOldEvents,
  clearAllEvents,
  saveSummary,
  getSummary,
} from '@/lib/analytics/storage'
import type {
  AnalyticsEvent,
  CacheMetricsEvent,
  ThinkingActivatedEvent,
  ResponseCompletedEvent,
  ResilienceMetricsEvent,
} from '@/lib/analytics/types'
import { STORAGE_KEYS, MAX_EVENT_AGE_MS } from '@/lib/analytics/config'

describe('analytics/storage', () => {
  let store: Record<string, string>

  beforeEach(() => {
    // Create a fresh store for each test
    store = {}

    // Ensure window exists for tests that need it
    if (typeof global.window === 'undefined') {
      (global as any).window = {}
    }

    // Create localStorage mock with proper closure over store
    const localStorageMock: Storage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key])
      },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() {
        return Object.keys(store).length
      },
    }

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    })

    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(1000000)

    // Reset mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    store = {}
  })

  // Helper functions to create test events
  const createCacheEvent = (cacheHit: boolean, estimatedSavings = 0.5): CacheMetricsEvent => ({
    eventId: 'cache-1',
    sessionId: 'session-1',
    eventType: 'chat.cache.metrics',
    eventCategory: 'cache',
    severity: 'info',
    timestamp: new Date(1000000).toISOString(),
    properties: {
      cacheHit,
      cacheReadTokens: 100,
      cacheCreationTokens: 50,
      cacheReadPercentage: 50,
      inputTokens: 200,
      totalInputTokens: 200,
      estimatedSavings,
    },
  })

  const createThinkingEvent = (enabled: boolean): ThinkingActivatedEvent => ({
    eventId: 'thinking-1',
    sessionId: 'session-1',
    eventType: 'chat.thinking.activated',
    eventCategory: 'thinking',
    severity: 'info',
    timestamp: new Date(1000000).toISOString(),
    properties: {
      enabled,
      budgetTokens: 1000,
      queryLength: 100,
      hasIndicator: true,
      complexityScore: 0.8,
    },
  })

  const createResponseEvent = (
    duration: number,
    thinkingUsed = false,
    thinkingTokens = 0
  ): ResponseCompletedEvent => ({
    eventId: 'response-1',
    sessionId: 'session-1',
    eventType: 'chat.response.completed',
    eventCategory: 'performance',
    severity: 'info',
    timestamp: new Date(1000000).toISOString(),
    duration,
    properties: {
      responseLength: 500,
      inputTokens: 200,
      outputTokens: 300,
      totalTokens: 500,
      thinkingUsed,
      thinkingTokens,
      duration,
      tokensPerSecond: 10,
    },
  })

  const createMessageEvent = (): AnalyticsEvent => ({
    eventId: 'message-1',
    sessionId: 'session-1',
    eventType: 'chat.message.sent',
    eventCategory: 'chat',
    severity: 'info',
    timestamp: new Date(1000000).toISOString(),
    properties: {
      queryLength: 100,
      messageCount: 1,
    },
  })

  const createSessionEndedEvent = (): AnalyticsEvent => ({
    eventId: 'session-1',
    sessionId: 'session-1',
    eventType: 'chat.session.ended',
    eventCategory: 'session',
    severity: 'info',
    timestamp: new Date(1000000).toISOString(),
    properties: {
      duration: 60000,
      messageCount: 5,
      userMessageCount: 3,
      assistantMessageCount: 2,
      thinkingUsed: true,
      cacheHits: 2,
      errors: 0,
    },
  })

  const createErrorEvent = (): AnalyticsEvent => ({
    eventId: 'error-1',
    sessionId: 'session-1',
    eventType: 'chat.error.occurred',
    eventCategory: 'error',
    severity: 'error',
    timestamp: new Date(1000000).toISOString(),
    properties: {
      errorType: 'API_ERROR',
      errorStatus: 500,
      errorMessage: 'Internal server error',
      phase: 'chat',
    },
  })

  const createRateLimitEvent = (): AnalyticsEvent => ({
    eventId: 'ratelimit-1',
    sessionId: 'session-1',
    eventType: 'chat.rate_limit.exceeded',
    eventCategory: 'rate_limit',
    severity: 'warning',
    timestamp: new Date(1000000).toISOString(),
    properties: {
      retryAfter: 60,
      remainingTokens: 0,
      requestCount: 100,
    },
  })

  const createResilienceEvent = (): ResilienceMetricsEvent => ({
    eventId: 'resilience-1',
    sessionId: 'session-1',
    eventType: 'chat.resilience.metrics',
    eventCategory: 'resilience',
    severity: 'info',
    timestamp: new Date(1000000).toISOString(),
    properties: {
      circuitState: 'CLOSED',
      circuitOpens: 2,
      circuitCloses: 2,
      totalRetries: 5,
      retriedRequests: 3,
      totalRequests: 100,
      successfulRequests: 95,
      failedRequests: 5,
      successRate: 95,
      averageLatency: 150,
      p95Latency: 300,
      recentFailureCount: 1,
    },
  })

  describe('saveEvent', () => {
    it('should save event to localStorage', () => {
      const event = createCacheEvent(true)
      const result = saveEvent(event)

      expect(result).toBe(true)
      expect(store[STORAGE_KEYS.EVENTS]).toBeDefined()
      const saved = JSON.parse(store[STORAGE_KEYS.EVENTS])
      expect(saved).toHaveLength(1)
      expect(saved[0]).toEqual(event)
    })

    it('should append multiple events', () => {
      const event1 = createCacheEvent(true)
      const event2 = createThinkingEvent(true)

      saveEvent(event1)
      saveEvent(event2)

      const saved = JSON.parse(store[STORAGE_KEYS.EVENTS])
      expect(saved).toHaveLength(2)
      expect(saved[0]).toEqual(event1)
      expect(saved[1]).toEqual(event2)
    })

    it('should limit events to maxStoredEvents (1000)', () => {
      // Fill with 1000 events
      for (let i = 0; i < 1000; i++) {
        saveEvent(createCacheEvent(true))
      }

      let saved = JSON.parse(store[STORAGE_KEYS.EVENTS])
      expect(saved).toHaveLength(1000)

      // Add one more
      const newEvent = createThinkingEvent(true)
      saveEvent(newEvent)

      saved = JSON.parse(store[STORAGE_KEYS.EVENTS])
      expect(saved).toHaveLength(1000)
      expect(saved[999]).toEqual(newEvent)
    })

    it('should return false when localStorage is unavailable', () => {
      // Make localStorage test fail
      Object.defineProperty(global.localStorage, 'setItem', {
        value: () => {
          throw new Error('localStorage not available')
        },
        writable: true,
        configurable: true,
      })

      const result = saveEvent(createCacheEvent(true))

      expect(result).toBe(false)
      // Logger is called but we don't test implementation details
    })

    it('should handle localStorage.setItem errors (quota exceeded)', () => {
      Object.defineProperty(global.localStorage, 'setItem', {
        value: (key: string, value: string) => {
          // Allow the test key to pass, but throw for actual storage
          if (key === '__storage_test__') {
            store[key] = value
            return
          }
          throw new Error('QuotaExceededError')
        },
        writable: true,
        configurable: true,
      })

      const result = saveEvent(createCacheEvent(true))

      expect(result).toBe(false)
      // Error is logged but we don't test implementation details
    })

    it('should handle JSON.parse errors when reading existing events', () => {
      store[STORAGE_KEYS.EVENTS] = 'invalid json'

      const result = saveEvent(createCacheEvent(true))

      // Should succeed after clearing invalid data - getEvents returns [] on error
      expect(result).toBe(true)
      // Error is logged for the invalid JSON but saveEvent succeeds
      const saved = JSON.parse(store[STORAGE_KEYS.EVENTS])
      expect(saved).toHaveLength(1)
    })
  })

  describe('getEvents', () => {
    beforeEach(() => {
      const events = [
        createCacheEvent(true),
        createThinkingEvent(true),
        createResponseEvent(1000),
        createMessageEvent(),
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)
    })

    it('should return all events without filters', () => {
      const events = getEvents()
      expect(events).toHaveLength(4)
    })

    it('should return empty array when no events exist', () => {
      delete store[STORAGE_KEYS.EVENTS]
      const events = getEvents()
      expect(events).toEqual([])
    })

    it('should filter by eventType', () => {
      const events = getEvents({ eventType: 'chat.cache.metrics' })
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('chat.cache.metrics')
    })

    it('should filter by category', () => {
      const events = getEvents({ category: 'cache' })
      expect(events).toHaveLength(1)
      expect(events[0].eventCategory).toBe('cache')
    })

    it('should filter by startDate', () => {
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(500000).toISOString() },
        { ...createThinkingEvent(true), timestamp: new Date(1500000).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const filtered = getEvents({ startDate: new Date(1000000) })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].eventType).toBe('chat.thinking.activated')
    })

    it('should filter by endDate', () => {
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(500000).toISOString() },
        { ...createThinkingEvent(true), timestamp: new Date(1500000).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const filtered = getEvents({ endDate: new Date(1000000) })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].eventType).toBe('chat.cache.metrics')
    })

    it('should filter by date range', () => {
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(500000).toISOString() },
        { ...createThinkingEvent(true), timestamp: new Date(1000000).toISOString() },
        { ...createResponseEvent(1000), timestamp: new Date(1500000).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const filtered = getEvents({
        startDate: new Date(900000),
        endDate: new Date(1200000),
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].eventType).toBe('chat.thinking.activated')
    })

    it('should combine multiple filters', () => {
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(1000000).toISOString() },
        { ...createCacheEvent(false), timestamp: new Date(2000000).toISOString() },
        { ...createThinkingEvent(true), timestamp: new Date(1500000).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const filtered = getEvents({
        eventType: 'chat.cache.metrics',
        startDate: new Date(1500000),
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].timestamp).toBe(new Date(2000000).toISOString())
    })

    it('should return empty array when localStorage is unavailable', () => {
      // Make localStorage test fail
      Object.defineProperty(global.localStorage, 'setItem', {
        value: () => {
          throw new Error('localStorage not available')
        },
        writable: true,
        configurable: true,
      })

      const events = getEvents()
      expect(events).toEqual([])
    })

    it('should handle JSON.parse errors', () => {
      store[STORAGE_KEYS.EVENTS] = 'invalid json'

      const events = getEvents()
      expect(events).toEqual([])
      // Error is logged but we don't test implementation details
    })

    it('should handle localStorage.getItem errors', () => {
      Object.defineProperty(global.localStorage, 'getItem', {
        value: (key: string) => {
          // Allow the test key to pass, but throw for actual storage
          if (key === '__storage_test__') {
            return store[key] || null
          }
          throw new Error('Storage error')
        },
        writable: true,
        configurable: true,
      })

      const events = getEvents()
      expect(events).toEqual([])
      // Error is logged but we don't test implementation details
    })
  })

  describe('calculateSummary', () => {
    it('should calculate cache metrics correctly', () => {
      const events = [
        createCacheEvent(true, 0.5),
        createCacheEvent(true, 0.3),
        createCacheEvent(false, 0),
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.totalCacheHits).toBe(2)
      expect(summary.totalCacheMisses).toBe(1)
      expect(summary.cacheHitRate).toBeCloseTo(66.67, 1)
      expect(summary.totalCacheSavings).toBe(0.8)
    })

    it('should calculate thinking metrics correctly', () => {
      const events = [
        createThinkingEvent(true),
        createThinkingEvent(true),
        createThinkingEvent(false),
        createMessageEvent(),
        createMessageEvent(),
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.thinkingActivations).toBe(2)
      expect(summary.totalMessages).toBe(2)
      expect(summary.thinkingActivationRate).toBe(100)
    })

    it('should calculate average thinking tokens', () => {
      const events = [
        createResponseEvent(1000, true, 500),
        createResponseEvent(1000, true, 300),
        createResponseEvent(1000, false, 0),
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.avgThinkingTokens).toBe(400)
    })

    it('should calculate performance metrics (percentiles)', () => {
      const events = [
        createResponseEvent(100),
        createResponseEvent(200),
        createResponseEvent(300),
        createResponseEvent(400),
        createResponseEvent(500),
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.avgResponseTime).toBe(300)
      expect(summary.p50ResponseTime).toBe(300)
      expect(summary.p95ResponseTime).toBe(500)
      expect(summary.p99ResponseTime).toBe(500)
    })

    it('should calculate usage metrics', () => {
      const events = [
        createMessageEvent(),
        createMessageEvent(),
        createSessionEndedEvent(),
        createResponseEvent(1000),
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.totalMessages).toBe(2)
      expect(summary.totalSessions).toBe(1)
      expect(summary.avgMessagesPerSession).toBe(2)
      expect(summary.totalTokensUsed).toBe(500)
    })

    it('should calculate error metrics', () => {
      const events = [
        createErrorEvent(),
        createErrorEvent(),
        createMessageEvent(),
        createMessageEvent(),
        createMessageEvent(),
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.totalErrors).toBe(2)
      expect(summary.errorRate).toBeCloseTo(66.67, 1)
    })

    it('should calculate rate limit metrics', () => {
      const events = [createRateLimitEvent(), createRateLimitEvent()]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.rateLimitExceededCount).toBe(2)
    })

    it('should calculate resilience metrics', () => {
      const events = [createResilienceEvent()]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.circuitBreakerOpens).toBe(2)
      expect(summary.totalRetries).toBe(5)
      expect(summary.resilienceSuccessRate).toBe(95)
      expect(summary.avgResilienceLatency).toBe(150)
      expect(summary.p95ResilienceLatency).toBe(300)
    })

    it('should handle empty events array', () => {
      store[STORAGE_KEYS.EVENTS] = JSON.stringify([])

      const summary = calculateSummary()

      expect(summary.totalCacheHits).toBe(0)
      expect(summary.totalMessages).toBe(0)
      expect(summary.avgResponseTime).toBe(0)
      expect(summary.cacheHitRate).toBe(0)
    })

    it('should handle missing resilience events', () => {
      const events = [createMessageEvent()]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const summary = calculateSummary()

      expect(summary.circuitBreakerOpens).toBe(0)
      expect(summary.totalRetries).toBe(0)
      expect(summary.resilienceSuccessRate).toBe(100)
    })
  })

  describe('exportMetrics', () => {
    it('should export metrics with summary and events', () => {
      const events = [createCacheEvent(true), createThinkingEvent(true)]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const exported = exportMetrics()

      expect(exported.exportDate).toBeDefined()
      expect(exported.period.start).toBeDefined()
      expect(exported.period.end).toBeDefined()
      expect(exported.summary).toBeDefined()
      expect(exported.events).toHaveLength(2)
    })

    it('should determine correct period from events', () => {
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(500000).toISOString() },
        { ...createThinkingEvent(true), timestamp: new Date(2000000).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const exported = exportMetrics()

      expect(exported.period.start).toBe(new Date(500000).toISOString())
      expect(exported.period.end).toBe(new Date(2000000).toISOString())
    })

    it('should handle empty events', () => {
      store[STORAGE_KEYS.EVENTS] = JSON.stringify([])

      const exported = exportMetrics()

      expect(exported.events).toHaveLength(0)
      expect(exported.period.start).toBeDefined()
      expect(exported.period.end).toBeDefined()
    })
  })

  describe('clearOldEvents', () => {
    it('should remove events older than maxAge', () => {
      const now = Date.now()
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString() },
        { ...createThinkingEvent(true), timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { ...createResponseEvent(1000), timestamp: new Date(now).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const removed = clearOldEvents()

      expect(removed).toBe(1)
      const remaining = JSON.parse(store[STORAGE_KEYS.EVENTS])
      expect(remaining).toHaveLength(2)
    })

    it('should use custom maxAge parameter', () => {
      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(now - 3 * oneDayMs).toISOString() },
        { ...createThinkingEvent(true), timestamp: new Date(now - 1 * oneDayMs).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const removed = clearOldEvents(2 * oneDayMs)

      expect(removed).toBe(1)
    })

    it('should return 0 when no events are old', () => {
      const events = [createCacheEvent(true)]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const removed = clearOldEvents()

      expect(removed).toBe(0)
    })

    it('should return 0 when localStorage is unavailable', () => {
      // Simulate SSR by setting window to undefined
      const originalWindow = global.window
      ;(global as any).window = undefined

      const removed = clearOldEvents()

      expect(removed).toBe(0)

      // Restore
      ;(global as any).window = originalWindow
    })

    it('should handle errors gracefully', () => {
      Object.defineProperty(global.localStorage, 'setItem', {
        value: (key: string, value: string) => {
          // Allow the test key to pass, but throw for actual storage
          if (key === '__storage_test__') {
            store[key] = value
            return
          }
          throw new Error('Write error')
        },
        writable: true,
        configurable: true,
      })

      const now = Date.now()
      const events = [
        { ...createCacheEvent(true), timestamp: new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString() },
      ]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const removed = clearOldEvents()

      expect(removed).toBe(0)
      // Error is logged but we don't test implementation details
    })

    it('should not update storage when no events removed', () => {
      const events = [createCacheEvent(true)]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const setItemSpy = jest.spyOn(global.localStorage, 'setItem')
      clearOldEvents()

      // Should only call setItem for isLocalStorageAvailable tests, not for actual storage update
      // isLocalStorageAvailable is called twice: once in clearOldEvents, once in getEvents
      expect(setItemSpy).toHaveBeenCalledTimes(2)
      expect(setItemSpy).toHaveBeenCalledWith('__storage_test__', '__storage_test__')
      expect(setItemSpy).not.toHaveBeenCalledWith(STORAGE_KEYS.EVENTS, expect.anything())
    })
  })

  describe('clearAllEvents', () => {
    it('should remove all events from localStorage', () => {
      store[STORAGE_KEYS.EVENTS] = JSON.stringify([createCacheEvent(true)])
      store[STORAGE_KEYS.SUMMARY] = JSON.stringify({ totalCacheHits: 1 })

      clearAllEvents()

      expect(store[STORAGE_KEYS.EVENTS]).toBeUndefined()
      expect(store[STORAGE_KEYS.SUMMARY]).toBeUndefined()
    })

    it('should work when storage is empty', () => {
      clearAllEvents()

      expect(store[STORAGE_KEYS.EVENTS]).toBeUndefined()
      expect(store[STORAGE_KEYS.SUMMARY]).toBeUndefined()
    })

    it('should handle localStorage unavailable', () => {
      // Simulate SSR by setting window to undefined
      const originalWindow = global.window
      ;(global as any).window = undefined

      clearAllEvents()
      // Should not throw

      // Restore
      ;(global as any).window = originalWindow
    })

    it('should handle errors gracefully', () => {
      Object.defineProperty(global.localStorage, 'removeItem', {
        value: (key: string) => {
          // Allow the test key to pass, but throw for actual storage
          if (key === '__storage_test__') {
            delete store[key]
            return
          }
          throw new Error('Remove error')
        },
        writable: true,
        configurable: true,
      })

      clearAllEvents()
      // Error is logged but we don't test implementation details
    })
  })

  describe('saveSummary', () => {
    it('should save summary to localStorage', () => {
      const summary = calculateSummary()
      saveSummary(summary)

      expect(store[STORAGE_KEYS.SUMMARY]).toBeDefined()
      const saved = JSON.parse(store[STORAGE_KEYS.SUMMARY])
      expect(saved).toEqual(summary)
    })

    it('should handle localStorage unavailable', () => {
      // Simulate SSR by setting window to undefined
      const originalWindow = global.window
      ;(global as any).window = undefined

      const summary = calculateSummary()
      saveSummary(summary)
      // Should not throw

      // Restore
      ;(global as any).window = originalWindow
    })

    it('should handle storage errors', () => {
      Object.defineProperty(global.localStorage, 'setItem', {
        value: (key: string, value: string) => {
          // Allow the test key to pass, but throw for actual storage
          if (key === '__storage_test__') {
            store[key] = value
            return
          }
          throw new Error('Storage full')
        },
        writable: true,
        configurable: true,
      })

      const summary = calculateSummary()
      saveSummary(summary)
      // Error is logged but we don't test implementation details
    })
  })

  describe('getSummary', () => {
    it('should return saved summary when available', () => {
      const summary = { totalCacheHits: 10, totalCacheMisses: 5 } as any
      store[STORAGE_KEYS.SUMMARY] = JSON.stringify(summary)

      const result = getSummary()

      expect(result).toEqual(summary)
    })

    it('should calculate and save summary when not available', () => {
      const events = [createCacheEvent(true)]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const result = getSummary()

      expect(result.totalCacheHits).toBe(1)
      expect(store[STORAGE_KEYS.SUMMARY]).toBeDefined()
    })

    it('should calculate summary when localStorage unavailable', () => {
      // Simulate SSR by setting window to undefined
      const originalWindow = global.window
      ;(global as any).window = undefined

      const result = getSummary()

      expect(result).toBeDefined()
      expect(result.totalCacheHits).toBe(0)

      // Restore
      ;(global as any).window = originalWindow
    })

    it('should handle JSON.parse errors', () => {
      store[STORAGE_KEYS.SUMMARY] = 'invalid json'
      const events = [createCacheEvent(true)]
      store[STORAGE_KEYS.EVENTS] = JSON.stringify(events)

      const result = getSummary()

      expect(result).toBeDefined()
      // Error is logged but we don't test implementation details
    })

    it('should fallback to calculation on retrieval error', () => {
      Object.defineProperty(global.localStorage, 'getItem', {
        value: (key: string) => {
          // Allow test key to pass
          if (key === '__storage_test__') {
            return store[key] || null
          }
          if (key === STORAGE_KEYS.SUMMARY) {
            throw new Error('Read error')
          }
          return store[key] || null
        },
        writable: true,
        configurable: true,
      })

      const result = getSummary()

      expect(result).toBeDefined()
      // Error is logged but we don't test implementation details
    })
  })

  describe('integration tests', () => {
    it('should handle complete analytics workflow', () => {
      // Save events
      saveEvent(createCacheEvent(true, 0.5))
      saveEvent(createCacheEvent(false, 0))
      saveEvent(createThinkingEvent(true))
      saveEvent(createResponseEvent(1500, true, 500))
      saveEvent(createMessageEvent())

      // Get and filter events
      const allEvents = getEvents()
      expect(allEvents).toHaveLength(5)

      const cacheEvents = getEvents({ eventType: 'chat.cache.metrics' })
      expect(cacheEvents).toHaveLength(2)

      // Calculate summary
      const summary = calculateSummary()
      expect(summary.totalCacheHits).toBe(1)
      expect(summary.totalCacheMisses).toBe(1)
      expect(summary.thinkingActivations).toBe(1)

      // Export metrics
      const exported = exportMetrics()
      expect(exported.events).toHaveLength(5)
      expect(exported.summary).toEqual(summary)

      // Clear old events
      clearOldEvents()

      // Clear all
      clearAllEvents()
      expect(getEvents()).toHaveLength(0)
    })

    it('should handle max events limit correctly', () => {
      // Add exactly 1000 events
      for (let i = 0; i < 1000; i++) {
        saveEvent(createCacheEvent(i % 2 === 0))
      }

      let events = getEvents()
      expect(events).toHaveLength(1000)

      // Add 10 more
      for (let i = 0; i < 10; i++) {
        saveEvent(createThinkingEvent(true))
      }

      events = getEvents()
      expect(events).toHaveLength(1000)

      // Verify newest events are kept
      const thinkingEvents = getEvents({ eventType: 'chat.thinking.activated' })
      expect(thinkingEvents).toHaveLength(10)
    })

    it('should persist data across multiple operations', () => {
      saveEvent(createCacheEvent(true))
      expect(getEvents()).toHaveLength(1)

      saveEvent(createThinkingEvent(true))
      expect(getEvents()).toHaveLength(2)

      const summary = calculateSummary()
      saveSummary(summary)

      const retrievedSummary = getSummary()
      expect(retrievedSummary).toEqual(summary)
    })
  })
})
