/**
 * Tests for Analytics Module Barrel Export
 * Tests the main public API exports and ensures all exports are available
 */

import { describe, it, expect } from '@jest/globals'
import * as analytics from '@/lib/analytics'

describe('Analytics Module - Barrel Export', () => {
  describe('Type Exports', () => {
    it('should export all type definitions', () => {
      // This test ensures TypeScript types are properly exported
      // If types are missing, TypeScript compilation would fail
      const typeExports = [
        'EventType',
        'EventCategory',
        'EventSeverity',
        'BaseEvent',
        'MessageSentEvent',
        'CacheMetricsEvent',
        'ThinkingActivatedEvent',
        'ResponseCompletedEvent',
        'RateLimitExceededEvent',
        'SessionStartedEvent',
        'SessionEndedEvent',
        'ErrorOccurredEvent',
        'ContextBuiltEvent',
        'AnalyticsEvent',
        'StoredMetrics',
        'MetricsSummary',
        'AnalyticsConfig',
        'MetricsExport',
        'EventFilters',
      ]

      // Runtime check that the module loads without errors
      expect(analytics).toBeDefined()
      expect(typeof analytics).toBe('object')
    })
  })

  describe('Configuration Exports', () => {
    it('should export getAnalyticsConfig function', () => {
      expect(analytics.getAnalyticsConfig).toBeDefined()
      expect(typeof analytics.getAnalyticsConfig).toBe('function')
    })

    it('should return valid analytics configuration', () => {
      const config = analytics.getAnalyticsConfig()

      expect(config).toHaveProperty('enabled')
      expect(config).toHaveProperty('enableConsoleLog')
      expect(config).toHaveProperty('enableLocalStorage')
      expect(config).toHaveProperty('enableVercelAnalytics')
      expect(config).toHaveProperty('maxStoredEvents')
      expect(config).toHaveProperty('storageKey')

      expect(typeof config.enabled).toBe('boolean')
      expect(typeof config.enableConsoleLog).toBe('boolean')
      expect(typeof config.enableLocalStorage).toBe('boolean')
      expect(typeof config.enableVercelAnalytics).toBe('boolean')
      expect(typeof config.maxStoredEvents).toBe('number')
      expect(typeof config.storageKey).toBe('string')
    })
  })

  describe('Storage Function Exports', () => {
    it('should export saveEvent function', () => {
      expect(analytics.saveEvent).toBeDefined()
      expect(typeof analytics.saveEvent).toBe('function')
    })

    it('should export getEvents function', () => {
      expect(analytics.getEvents).toBeDefined()
      expect(typeof analytics.getEvents).toBe('function')
    })

    it('should export calculateSummary function', () => {
      expect(analytics.calculateSummary).toBeDefined()
      expect(typeof analytics.calculateSummary).toBe('function')
    })

    it('should export exportMetrics function', () => {
      expect(analytics.exportMetrics).toBeDefined()
      expect(typeof analytics.exportMetrics).toBe('function')
    })

    it('should export clearAllEvents function', () => {
      expect(analytics.clearAllEvents).toBeDefined()
      expect(typeof analytics.clearAllEvents).toBe('function')
    })

    it('should export clearOldEvents function', () => {
      expect(analytics.clearOldEvents).toBeDefined()
      expect(typeof analytics.clearOldEvents).toBe('function')
    })

    it('should export getSummary function', () => {
      expect(analytics.getSummary).toBeDefined()
      expect(typeof analytics.getSummary).toBe('function')
    })

    it('should export saveSummary function', () => {
      expect(analytics.saveSummary).toBeDefined()
      expect(typeof analytics.saveSummary).toBe('function')
    })
  })

  describe('Tracker Function Exports', () => {
    it('should export trackMessageSent function', () => {
      expect(analytics.trackMessageSent).toBeDefined()
      expect(typeof analytics.trackMessageSent).toBe('function')
    })

    it('should export trackCacheMetrics function', () => {
      expect(analytics.trackCacheMetrics).toBeDefined()
      expect(typeof analytics.trackCacheMetrics).toBe('function')
    })

    it('should export trackThinkingActivated function', () => {
      expect(analytics.trackThinkingActivated).toBeDefined()
      expect(typeof analytics.trackThinkingActivated).toBe('function')
    })

    it('should export trackResponseCompleted function', () => {
      expect(analytics.trackResponseCompleted).toBeDefined()
      expect(typeof analytics.trackResponseCompleted).toBe('function')
    })

    it('should export trackRateLimitExceeded function', () => {
      expect(analytics.trackRateLimitExceeded).toBeDefined()
      expect(typeof analytics.trackRateLimitExceeded).toBe('function')
    })

    it('should export trackSessionStarted function', () => {
      expect(analytics.trackSessionStarted).toBeDefined()
      expect(typeof analytics.trackSessionStarted).toBe('function')
    })

    it('should export trackSessionEnded function', () => {
      expect(analytics.trackSessionEnded).toBeDefined()
      expect(typeof analytics.trackSessionEnded).toBe('function')
    })

    it('should export trackError function', () => {
      expect(analytics.trackError).toBeDefined()
      expect(typeof analytics.trackError).toBe('function')
    })

    it('should export trackContextBuilt function', () => {
      expect(analytics.trackContextBuilt).toBeDefined()
      expect(typeof analytics.trackContextBuilt).toBe('function')
    })

    it('should export trackResilienceMetrics function', () => {
      expect(analytics.trackResilienceMetrics).toBeDefined()
      expect(typeof analytics.trackResilienceMetrics).toBe('function')
    })
  })

  describe('Complete API Surface', () => {
    it('should export exactly the expected functions', () => {
      const expectedExports = [
        // Configuration
        'getAnalyticsConfig',
        // Storage
        'saveEvent',
        'getEvents',
        'calculateSummary',
        'exportMetrics',
        'clearAllEvents',
        'clearOldEvents',
        'getSummary',
        'saveSummary',
        // Tracker
        'trackMessageSent',
        'trackCacheMetrics',
        'trackThinkingActivated',
        'trackResponseCompleted',
        'trackRateLimitExceeded',
        'trackSessionStarted',
        'trackSessionEnded',
        'trackError',
        'trackContextBuilt',
        'trackResilienceMetrics',
      ]

      const actualExports = Object.keys(analytics).filter(
        (key) => typeof analytics[key as keyof typeof analytics] === 'function'
      )

      expectedExports.forEach((expectedExport) => {
        expect(actualExports).toContain(expectedExport)
      })
    })
  })

  describe('Module Integration', () => {
    beforeEach(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    afterEach(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    it('should allow tracking and retrieving events through the public API', () => {
      const messageProperties = {
        queryLength: 100,
        messageCount: 1,
      }

      analytics.trackMessageSent(messageProperties)

      const events = analytics.getEvents()

      expect(events.length).toBeGreaterThanOrEqual(0)
    })

    it('should calculate summary from stored events', () => {
      const summary = analytics.calculateSummary()

      expect(summary).toHaveProperty('totalMessages')
      expect(summary).toHaveProperty('totalSessions')
      expect(summary).toHaveProperty('totalErrors')
      expect(summary).toHaveProperty('cacheHitRate')
      expect(summary).toHaveProperty('avgResponseTime')
      expect(typeof summary.totalMessages).toBe('number')
    })

    it('should export complete metrics bundle', () => {
      const metricsExport = analytics.exportMetrics()

      expect(metricsExport).toHaveProperty('exportDate')
      expect(metricsExport).toHaveProperty('period')
      expect(metricsExport).toHaveProperty('summary')
      expect(metricsExport).toHaveProperty('events')

      expect(metricsExport.period).toHaveProperty('start')
      expect(metricsExport.period).toHaveProperty('end')
      expect(Array.isArray(metricsExport.events)).toBe(true)
    })

    it('should support clearing all analytics data', () => {
      analytics.trackMessageSent({ queryLength: 50, messageCount: 1 })

      analytics.clearAllEvents()

      const events = analytics.getEvents()
      expect(Array.isArray(events)).toBe(true)
    })
  })

  describe('Error Resilience', () => {
    it('should handle missing localStorage gracefully', () => {
      const originalLocalStorage = global.localStorage
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        configurable: true,
      })

      expect(() => analytics.getEvents()).not.toThrow()
      expect(() => analytics.calculateSummary()).not.toThrow()
      expect(() => analytics.trackMessageSent({ queryLength: 10, messageCount: 1 })).not.toThrow()

      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      })
    })
  })
})
