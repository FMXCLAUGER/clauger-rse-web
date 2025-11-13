import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock ESM modules before any imports that use them
jest.mock('nanoid')
jest.mock('@vercel/analytics')

// Mock analytics config to enable localStorage in tests
jest.mock('@/lib/analytics/config', () => ({
  isAnalyticsEnabled: () => true,
  isLocalStorageAvailable: () => true,
  getAnalyticsConfig: () => ({
    enabled: true,
    enableConsoleLog: false,
    enableLocalStorage: true,
    enableVercelAnalytics: false,
    maxStoredEvents: 1000,
    storageKey: 'clauger_analytics_events',
  }),
  STORAGE_KEYS: {
    EVENTS: 'clauger_analytics_events',
    SUMMARY: 'clauger_analytics_summary',
    SESSION_ID: 'clauger_session_id',
    SESSION_START: 'clauger_session_start',
  },
  MAX_EVENT_AGE_MS: 30 * 24 * 60 * 60 * 1000,
}))

import { trackResilienceMetrics } from '@/lib/analytics/tracker'
import type { ResilienceMetricsEvent } from '@/lib/analytics/types'

// Mock localStorage
const localStorageMock = (() => {
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

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('trackResilienceMetrics', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('should track resilience metrics with CLOSED circuit state', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'CLOSED',
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

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    expect(stored).toBeTruthy()

    const events = JSON.parse(stored!)
    expect(events.length).toBe(1)

    const event = events[0]
    expect(event.eventType).toBe('chat.resilience.metrics')
    expect(event.eventCategory).toBe('resilience')
    expect(event.severity).toBe('info')
    expect(event.properties).toEqual(metrics)
  })

  it('should track resilience metrics with OPEN circuit state (warning)', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'OPEN',
      circuitOpens: 1,
      circuitCloses: 0,
      totalRetries: 15,
      retriedRequests: 5,
      totalRequests: 20,
      successfulRequests: 15,
      failedRequests: 5,
      successRate: 75.0,
      averageLatency: 500,
      p95Latency: 1000,
      recentFailureCount: 5,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.severity).toBe('warning')
    expect(event.properties.circuitState).toBe('OPEN')
  })

  it('should track resilience metrics with HALF_OPEN circuit state', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'HALF_OPEN',
      circuitOpens: 1,
      circuitCloses: 0,
      totalRetries: 8,
      retriedRequests: 3,
      totalRequests: 50,
      successfulRequests: 48,
      failedRequests: 2,
      successRate: 96.0,
      averageLatency: 200,
      p95Latency: 400,
      recentFailureCount: 1,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.severity).toBe('info')
    expect(event.properties.circuitState).toBe('HALF_OPEN')
  })

  it('should set warning severity for low success rate (<90%)', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'CLOSED',
      circuitOpens: 0,
      circuitCloses: 0,
      totalRetries: 25,
      retriedRequests: 10,
      totalRequests: 100,
      successfulRequests: 85,
      failedRequests: 15,
      successRate: 85.0, // < 90%
      averageLatency: 300,
      p95Latency: 600,
      recentFailureCount: 3,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.severity).toBe('warning')
  })

  it('should set info severity for high success rate (>=90%)', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'CLOSED',
      circuitOpens: 0,
      circuitCloses: 0,
      totalRetries: 10,
      retriedRequests: 4,
      totalRequests: 100,
      successfulRequests: 95,
      failedRequests: 5,
      successRate: 95.0, // >= 90%
      averageLatency: 180,
      p95Latency: 350,
      recentFailureCount: 0,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.severity).toBe('info')
  })

  it('should include requestId when provided', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'CLOSED',
      circuitOpens: 0,
      circuitCloses: 0,
      totalRetries: 0,
      retriedRequests: 0,
      totalRequests: 50,
      successfulRequests: 50,
      failedRequests: 0,
      successRate: 100.0,
      averageLatency: 120,
      p95Latency: 250,
      recentFailureCount: 0,
    }

    trackResilienceMetrics(metrics, 'test-request-123')

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.requestId).toBe('test-request-123')
  })

  it('should track multiple circuit opens', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'OPEN',
      circuitOpens: 3,
      circuitCloses: 2,
      totalRetries: 50,
      retriedRequests: 20,
      totalRequests: 200,
      successfulRequests: 170,
      failedRequests: 30,
      successRate: 85.0,
      averageLatency: 400,
      p95Latency: 800,
      recentFailureCount: 10,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.properties.circuitOpens).toBe(3)
    expect(event.properties.circuitCloses).toBe(2)
  })

  it('should track zero retries for perfect reliability', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'CLOSED',
      circuitOpens: 0,
      circuitCloses: 0,
      totalRetries: 0,
      retriedRequests: 0,
      totalRequests: 1000,
      successfulRequests: 1000,
      failedRequests: 0,
      successRate: 100.0,
      averageLatency: 100,
      p95Latency: 200,
      recentFailureCount: 0,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.properties.totalRetries).toBe(0)
    expect(event.properties.successRate).toBe(100.0)
    expect(event.severity).toBe('info')
  })

  it('should track high latency metrics', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'CLOSED',
      circuitOpens: 0,
      circuitCloses: 0,
      totalRetries: 5,
      retriedRequests: 2,
      totalRequests: 100,
      successfulRequests: 98,
      failedRequests: 2,
      successRate: 98.0,
      averageLatency: 2500,
      p95Latency: 5000,
      recentFailureCount: 0,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    expect(event.properties.averageLatency).toBe(2500)
    expect(event.properties.p95Latency).toBe(5000)
  })

  it('should have valid event structure', () => {
    const metrics: ResilienceMetricsEvent['properties'] = {
      circuitState: 'CLOSED',
      circuitOpens: 0,
      circuitCloses: 0,
      totalRetries: 3,
      retriedRequests: 1,
      totalRequests: 50,
      successfulRequests: 49,
      failedRequests: 1,
      successRate: 98.0,
      averageLatency: 150,
      p95Latency: 300,
      recentFailureCount: 0,
    }

    trackResilienceMetrics(metrics)

    const stored = localStorageMock.getItem('clauger_analytics_events')
    const events = JSON.parse(stored!)
    const event = events[0]

    // Check event structure
    expect(event).toHaveProperty('eventId')
    expect(event).toHaveProperty('sessionId')
    expect(event).toHaveProperty('eventType')
    expect(event).toHaveProperty('eventCategory')
    expect(event).toHaveProperty('severity')
    expect(event).toHaveProperty('timestamp')
    expect(event).toHaveProperty('metadata')
    expect(event).toHaveProperty('properties')

    // Check timestamp is ISO 8601
    expect(() => new Date(event.timestamp)).not.toThrow()
  })
})
