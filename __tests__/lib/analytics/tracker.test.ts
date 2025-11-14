import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Create mock functions first
const mockNanoidFn = jest.fn(() => 'mock-id')
const mockTrackFn = jest.fn()
const mockLoggerDebugFn = jest.fn()
const mockIsAnalyticsEnabledFn = jest.fn(() => true)
const mockGetAnalyticsConfigFn = jest.fn(() => ({
  enabled: true,
  enableConsoleLog: false,
  enableLocalStorage: true,
  enableVercelAnalytics: false,
  maxStoredEvents: 1000,
  storageKey: 'clauger_analytics_events',
}))
const mockSaveEventFn = jest.fn(() => true)

// Mock ESM modules before any imports that use them
jest.mock('nanoid', () => ({
  nanoid: mockNanoidFn,
}))
jest.mock('@vercel/analytics', () => ({
  track: mockTrackFn,
}))
jest.mock('@/lib/security', () => ({
  logger: {
    debug: mockLoggerDebugFn,
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  logError: jest.fn(),
  logStorageError: jest.fn(),
}))

// Mock analytics config to enable localStorage in tests
jest.mock('@/lib/analytics/config', () => ({
  isAnalyticsEnabled: mockIsAnalyticsEnabledFn,
  isLocalStorageAvailable: () => true,
  getAnalyticsConfig: mockGetAnalyticsConfigFn,
  STORAGE_KEYS: {
    EVENTS: 'clauger_analytics_events',
    SUMMARY: 'clauger_analytics_summary',
    SESSION_ID: 'clauger_session_id',
    SESSION_START: 'clauger_session_start',
  },
  MAX_EVENT_AGE_MS: 30 * 24 * 60 * 60 * 1000,
}))

// Mock storage module
jest.mock('@/lib/analytics/storage', () => ({
  saveEvent: mockSaveEventFn,
}))

import {
  trackMessageSent,
  trackCacheMetrics,
  trackThinkingActivated,
  trackResponseCompleted,
  trackRateLimitExceeded,
  trackSessionStarted,
  trackSessionEnded,
  trackError,
  trackContextBuilt,
  trackResilienceMetrics,
  getSessionMetrics,
  resetSession,
} from '@/lib/analytics/tracker'

// Get mock functions
const mockNanoid = mockNanoidFn
const mockTrack = mockTrackFn
const mockSaveEvent = mockSaveEventFn
const mockLoggerDebug = mockLoggerDebugFn
const mockIsAnalyticsEnabled = mockIsAnalyticsEnabledFn
const mockGetAnalyticsConfig = mockGetAnalyticsConfigFn

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

describe('Analytics Tracker', () => {
  let eventIdCounter = 0

  beforeEach(() => {
    sessionStorageMock.clear()
    jest.clearAllMocks()
    eventIdCounter = 0

    // Setup nanoid to return predictable IDs
    mockNanoid.mockImplementation(() => `test-id-${++eventIdCounter}`)

    // Reset default mocks
    mockIsAnalyticsEnabled.mockReturnValue(true)
    mockGetAnalyticsConfig.mockReturnValue({
      enabled: true,
      enableConsoleLog: false,
      enableLocalStorage: true,
      enableVercelAnalytics: false,
      maxStoredEvents: 1000,
      storageKey: 'clauger_analytics_events',
    })
  })

  describe('Session Management', () => {
    it('should create new session ID on first call', () => {
      trackMessageSent({ queryLength: 10, messageCount: 1 })

      const sessionId = sessionStorageMock.getItem('clauger_session_id')
      expect(sessionId).toBeTruthy()
      expect(sessionId).toBe('test-id-2') // First ID for event, second for session
    })

    it('should reuse existing session ID', () => {
      sessionStorageMock.setItem('clauger_session_id', 'existing-session')

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'existing-session',
        })
      )
    })

    it('should store session start time', () => {
      trackMessageSent({ queryLength: 10, messageCount: 1 })

      const sessionStart = sessionStorageMock.getItem('clauger_session_start')
      expect(sessionStart).toBeTruthy()
      expect(() => new Date(sessionStart!)).not.toThrow()
    })

    it('should return session metrics', () => {
      const startTime = new Date('2024-01-01T10:00:00Z').toISOString()
      sessionStorageMock.setItem('clauger_session_id', 'test-session')
      sessionStorageMock.setItem('clauger_session_start', startTime)

      const metrics = getSessionMetrics()

      expect(metrics).not.toBeNull()
      expect(metrics?.sessionId).toBe('test-session')
      expect(metrics?.startTime).toBe(startTime)
      expect(metrics?.duration).toBeGreaterThan(0)
    })

    it('should return null when no session exists', () => {
      const metrics = getSessionMetrics()
      expect(metrics).toBeNull()
    })

    it('should reset session', () => {
      sessionStorageMock.setItem('clauger_session_id', 'test-session')
      sessionStorageMock.setItem('clauger_session_start', new Date().toISOString())

      resetSession()

      expect(sessionStorageMock.getItem('clauger_session_id')).toBeNull()
      expect(sessionStorageMock.getItem('clauger_session_start')).toBeNull()
    })
  })

  describe('trackMessageSent', () => {
    it('should track message sent event', () => {
      const properties = {
        queryLength: 150,
        messageCount: 5,
        currentPage: 2,
      }

      trackMessageSent(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.message.sent',
          eventCategory: 'chat',
          severity: 'info',
          properties,
        })
      )
    })

    it('should include model analytics when provided', () => {
      const properties = {
        queryLength: 150,
        messageCount: 5,
        modelUsed: 'gpt-4',
        complexityScore: 0.8,
        estimatedCost: 0.05,
      }

      trackMessageSent(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            modelUsed: 'gpt-4',
            complexityScore: 0.8,
            estimatedCost: 0.05,
          }),
        })
      )
    })

    it('should not track when analytics disabled', () => {
      mockIsAnalyticsEnabled.mockReturnValue(false)

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockSaveEvent).not.toHaveBeenCalled()
    })
  })

  describe('trackCacheMetrics', () => {
    it('should track cache hit', () => {
      const properties = {
        cacheHit: true,
        cacheReadTokens: 100,
        cacheCreationTokens: 0,
        cacheReadPercentage: 80,
        inputTokens: 125,
        totalInputTokens: 125,
        estimatedSavings: 0.002,
      }

      trackCacheMetrics(properties, 'request-123')

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.cache.metrics',
          eventCategory: 'cache',
          severity: 'info',
          requestId: 'request-123',
          properties,
        })
      )
    })

    it('should track cache miss', () => {
      const properties = {
        cacheHit: false,
        cacheReadTokens: 0,
        cacheCreationTokens: 100,
        cacheReadPercentage: 0,
        inputTokens: 100,
        totalInputTokens: 100,
        estimatedSavings: 0,
      }

      trackCacheMetrics(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            cacheHit: false,
            estimatedSavings: 0,
          }),
        })
      )
    })
  })

  describe('trackThinkingActivated', () => {
    it('should track thinking activation', () => {
      const properties = {
        enabled: true,
        budgetTokens: 10000,
        queryLength: 200,
        hasIndicator: true,
        complexityScore: 0.9,
      }

      trackThinkingActivated(properties, 'request-456')

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.thinking.activated',
          eventCategory: 'thinking',
          severity: 'info',
          requestId: 'request-456',
          properties,
        })
      )
    })

    it('should track thinking deactivation', () => {
      const properties = {
        enabled: false,
        budgetTokens: 0,
        queryLength: 50,
        hasIndicator: false,
        complexityScore: 0.2,
      }

      trackThinkingActivated(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            enabled: false,
          }),
        })
      )
    })
  })

  describe('trackResponseCompleted', () => {
    it('should track response completion', () => {
      const properties = {
        responseLength: 500,
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
        thinkingUsed: false,
        duration: 2500,
        tokensPerSecond: 80,
      }

      trackResponseCompleted(properties, 'request-789')

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.response.completed',
          eventCategory: 'performance',
          severity: 'info',
          requestId: 'request-789',
          duration: 2500,
          properties,
        })
      )
    })

    it('should track response with thinking tokens', () => {
      const properties = {
        responseLength: 500,
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 350,
        thinkingUsed: true,
        thinkingTokens: 50,
        duration: 3000,
        tokensPerSecond: 70,
      }

      trackResponseCompleted(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            thinkingUsed: true,
            thinkingTokens: 50,
          }),
        })
      )
    })
  })

  describe('trackRateLimitExceeded', () => {
    it('should track rate limit exceeded', () => {
      const properties = {
        retryAfter: 60,
        remainingTokens: 0,
        requestCount: 10,
      }

      trackRateLimitExceeded(properties, 'request-999')

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.rate_limit.exceeded',
          eventCategory: 'rate_limit',
          severity: 'warning',
          requestId: 'request-999',
          properties,
        })
      )
    })
  })

  describe('trackSessionStarted', () => {
    it('should track session start', () => {
      const properties = {
        url: '/chat',
        currentPage: 1,
      }

      trackSessionStarted(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.session.started',
          eventCategory: 'session',
          severity: 'info',
          properties,
        })
      )
    })
  })

  describe('trackSessionEnded', () => {
    it('should track session end', () => {
      const properties = {
        duration: 120000,
        messageCount: 10,
        userMessageCount: 5,
        assistantMessageCount: 5,
        thinkingUsed: true,
        cacheHits: 3,
        errors: 0,
      }

      trackSessionEnded(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.session.ended',
          eventCategory: 'session',
          severity: 'info',
          duration: 120000,
          properties,
        })
      )
    })

    it('should track session with errors', () => {
      const properties = {
        duration: 60000,
        messageCount: 5,
        userMessageCount: 3,
        assistantMessageCount: 2,
        thinkingUsed: false,
        cacheHits: 1,
        errors: 2,
      }

      trackSessionEnded(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            errors: 2,
          }),
        })
      )
    })
  })

  describe('trackError', () => {
    it('should track error', () => {
      const properties = {
        errorType: 'API_ERROR',
        errorStatus: 500,
        errorMessage: 'Internal server error',
        phase: 'response',
      }

      trackError(properties, 'request-error')

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.error.occurred',
          eventCategory: 'error',
          severity: 'error',
          requestId: 'request-error',
          properties,
        })
      )
    })

    it('should track error without status code', () => {
      const properties = {
        errorType: 'NETWORK_ERROR',
        errorMessage: 'Connection failed',
        phase: 'request',
      }

      trackError(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            errorType: 'NETWORK_ERROR',
            errorStatus: undefined,
          }),
        })
      )
    })
  })

  describe('trackContextBuilt', () => {
    it('should track context built', () => {
      const properties = {
        sources: ['source1.md', 'source2.md'],
        sourceCount: 2,
        contextLength: 5000,
        estimatedTokens: 1200,
        buildDuration: 150,
        includeFullAnalysis: true,
        includeScores: true,
        includeRecommendations: false,
      }

      trackContextBuilt(properties, 'request-context')

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.context.built',
          eventCategory: 'performance',
          severity: 'info',
          requestId: 'request-context',
          duration: 150,
          properties,
        })
      )
    })
  })

  describe('trackResilienceMetrics', () => {
    it('should track resilience metrics', () => {
      const properties = {
        circuitState: 'CLOSED' as const,
        circuitOpens: 0,
        circuitCloses: 0,
        totalRetries: 5,
        retriedRequests: 2,
        totalRequests: 100,
        successfulRequests: 98,
        failedRequests: 2,
        successRate: 98.0,
        averageLatency: 150,
        p95Latency: 300,
        recentFailureCount: 0,
      }

      trackResilienceMetrics(properties)

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'chat.resilience.metrics',
          eventCategory: 'resilience',
          severity: 'info',
          properties,
        })
      )
    })
  })

  describe('Event Structure', () => {
    it('should create event with all required fields', () => {
      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: expect.any(String),
          sessionId: expect.any(String),
          eventType: 'chat.message.sent',
          eventCategory: 'chat',
          severity: 'info',
          timestamp: expect.any(String),
          metadata: expect.objectContaining({
            userAgent: expect.any(String),
            page: expect.any(String),
          }),
        })
      )
    })

    it('should create valid ISO timestamp', () => {
      trackMessageSent({ queryLength: 10, messageCount: 1 })

      const event = mockSaveEvent.mock.calls[0][0]
      expect(() => new Date(event.timestamp)).not.toThrow()
    })

    it('should include requestId when provided', () => {
      trackCacheMetrics(
        {
          cacheHit: true,
          cacheReadTokens: 100,
          cacheCreationTokens: 0,
          cacheReadPercentage: 80,
          inputTokens: 125,
          totalInputTokens: 125,
          estimatedSavings: 0.002,
        },
        'custom-request-id'
      )

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'custom-request-id',
        })
      )
    })
  })

  describe('Integration with Storage', () => {
    it('should save event when localStorage enabled', () => {
      mockGetAnalyticsConfig.mockReturnValue({
        enabled: true,
        enableConsoleLog: false,
        enableLocalStorage: true,
        enableVercelAnalytics: false,
        maxStoredEvents: 1000,
        storageKey: 'clauger_analytics_events',
      })

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockSaveEvent).toHaveBeenCalledTimes(1)
    })

    it('should not save event when localStorage disabled', () => {
      mockGetAnalyticsConfig.mockReturnValue({
        enabled: true,
        enableConsoleLog: false,
        enableLocalStorage: false,
        enableVercelAnalytics: false,
        maxStoredEvents: 1000,
        storageKey: 'clauger_analytics_events',
      })

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockSaveEvent).not.toHaveBeenCalled()
    })
  })

  describe('Integration with Vercel Analytics', () => {
    it('should send to Vercel when enabled', () => {
      mockGetAnalyticsConfig.mockReturnValue({
        enabled: true,
        enableConsoleLog: false,
        enableLocalStorage: false,
        enableVercelAnalytics: true,
        maxStoredEvents: 1000,
        storageKey: 'clauger_analytics_events',
      })

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockTrack).toHaveBeenCalledWith(
        'chat.message.sent',
        expect.objectContaining({
          queryLength: 10,
          messageCount: 1,
        })
      )
    })

    it('should flatten array properties for Vercel', () => {
      mockGetAnalyticsConfig.mockReturnValue({
        enabled: true,
        enableConsoleLog: false,
        enableLocalStorage: false,
        enableVercelAnalytics: true,
        maxStoredEvents: 1000,
        storageKey: 'clauger_analytics_events',
      })

      trackContextBuilt({
        sources: ['file1.md', 'file2.md', 'file3.md'],
        sourceCount: 3,
        contextLength: 1000,
        estimatedTokens: 250,
        buildDuration: 100,
        includeFullAnalysis: true,
        includeScores: false,
        includeRecommendations: false,
      })

      expect(mockTrack).toHaveBeenCalledWith(
        'chat.context.built',
        expect.objectContaining({
          sources: 'file1.md,file2.md,file3.md',
        })
      )
    })

    it('should not send to Vercel when disabled', () => {
      mockGetAnalyticsConfig.mockReturnValue({
        enabled: true,
        enableConsoleLog: false,
        enableLocalStorage: true,
        enableVercelAnalytics: false,
        maxStoredEvents: 1000,
        storageKey: 'clauger_analytics_events',
      })

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockTrack).not.toHaveBeenCalled()
    })
  })

  describe('Console Logging', () => {
    it('should log when console logging enabled', () => {
      mockGetAnalyticsConfig.mockReturnValue({
        enabled: true,
        enableConsoleLog: true,
        enableLocalStorage: false,
        enableVercelAnalytics: false,
        maxStoredEvents: 1000,
        storageKey: 'clauger_analytics_events',
      })

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockLoggerDebug).toHaveBeenCalledWith(
        'Analytics event tracked',
        expect.objectContaining({
          eventType: 'chat.message.sent',
        })
      )
    })

    it('should not log when console logging disabled', () => {
      mockGetAnalyticsConfig.mockReturnValue({
        enabled: true,
        enableConsoleLog: false,
        enableLocalStorage: true,
        enableVercelAnalytics: false,
        maxStoredEvents: 1000,
        storageKey: 'clauger_analytics_events',
      })

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      expect(mockLoggerDebug).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle session storage errors gracefully', () => {
      // Mock sessionStorage to throw error
      const originalSetItem = sessionStorageMock.setItem
      sessionStorageMock.setItem = () => {
        throw new Error('Storage error')
      }

      trackMessageSent({ queryLength: 10, messageCount: 1 })

      // Should use fallback session ID
      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'anonymous-session',
        })
      )

      // Restore
      sessionStorageMock.setItem = originalSetItem
    })

    it('should handle missing requestId gracefully', () => {
      trackCacheMetrics({
        cacheHit: true,
        cacheReadTokens: 100,
        cacheCreationTokens: 0,
        cacheReadPercentage: 80,
        inputTokens: 125,
        totalInputTokens: 125,
        estimatedSavings: 0.002,
      })

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: undefined,
        })
      )
    })

    it('should handle empty properties gracefully', () => {
      trackMessageSent({ queryLength: 0, messageCount: 0 })

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            queryLength: 0,
            messageCount: 0,
          }),
        })
      )
    })
  })
})
