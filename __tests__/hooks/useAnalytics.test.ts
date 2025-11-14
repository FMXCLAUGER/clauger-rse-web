import { renderHook, waitFor } from '@testing-library/react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { act } from 'react'
import type { AnalyticsEvent, MetricsSummary } from '@/lib/analytics/types'

// Mock the analytics module
jest.mock('@/lib/analytics', () => ({
  getEvents: jest.fn(),
  calculateSummary: jest.fn(),
}))

// Mock the logger-helpers module
jest.mock('@/lib/security/logger-helpers', () => ({
  logError: jest.fn(),
}))

import { getEvents, calculateSummary } from '@/lib/analytics'
import { logError } from '@/lib/security/logger-helpers'

const mockGetEvents = getEvents as jest.MockedFunction<typeof getEvents>
const mockCalculateSummary = calculateSummary as jest.MockedFunction<typeof calculateSummary>
const mockLogError = logError as jest.MockedFunction<typeof logError>

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  const mockEvents: AnalyticsEvent[] = [
    {
      eventId: 'event-1',
      sessionId: 'session-1',
      eventType: 'chat.message.sent',
      eventCategory: 'chat',
      severity: 'info',
      timestamp: '2025-01-14T10:00:00.000Z',
      properties: {
        queryLength: 50,
        messageCount: 1,
      },
    },
    {
      eventId: 'event-2',
      sessionId: 'session-1',
      eventType: 'chat.response.completed',
      eventCategory: 'performance',
      severity: 'info',
      timestamp: '2025-01-14T10:00:01.000Z',
      properties: {
        responseLength: 200,
        inputTokens: 100,
        outputTokens: 150,
        totalTokens: 250,
        thinkingUsed: false,
        duration: 1000,
        tokensPerSecond: 150,
      },
    },
  ]

  const mockSummary: MetricsSummary = {
    totalCacheHits: 10,
    totalCacheMisses: 5,
    cacheHitRate: 0.67,
    totalCacheSavings: 0.25,
    thinkingActivations: 3,
    thinkingActivationRate: 0.3,
    avgThinkingTokens: 500,
    avgResponseTime: 1200,
    p50ResponseTime: 1000,
    p95ResponseTime: 2000,
    p99ResponseTime: 3000,
    totalMessages: 10,
    totalSessions: 2,
    avgMessagesPerSession: 5,
    totalTokensUsed: 5000,
    totalErrors: 1,
    errorRate: 0.1,
    rateLimitExceededCount: 0,
    circuitBreakerOpens: 0,
    totalRetries: 2,
    resilienceSuccessRate: 0.98,
    avgResilienceLatency: 150,
    p95ResilienceLatency: 300,
  }

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      mockGetEvents.mockReturnValue([])
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      // After initial render, useEffect runs synchronously and sets isLoading to false
      expect(result.current.isLoading).toBe(false)
      expect(result.current.events).toEqual([])
      expect(result.current.summary).toEqual(mockSummary)
    })

    it('should load analytics data on mount', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.events).toEqual(mockEvents)
      expect(result.current.summary).toEqual(mockSummary)
    })

    it('should call getEvents with undefined filters by default', () => {
      mockGetEvents.mockReturnValue([])
      mockCalculateSummary.mockReturnValue(mockSummary)

      renderHook(() => useAnalytics())

      expect(mockGetEvents).toHaveBeenCalledWith(undefined)
    })

    it('should call getEvents with provided filters', () => {
      mockGetEvents.mockReturnValue([])
      mockCalculateSummary.mockReturnValue(mockSummary)

      const filters = { eventType: 'chat.message.sent' as const }
      renderHook(() => useAnalytics(filters))

      expect(mockGetEvents).toHaveBeenCalledWith(filters)
    })
  })

  describe('data loading', () => {
    it('should load events and summary successfully', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      expect(result.current.events).toHaveLength(2)
      expect(result.current.events[0].eventId).toBe('event-1')
      expect(result.current.summary).toEqual(mockSummary)
      expect(mockGetEvents).toHaveBeenCalledTimes(1)
      expect(mockCalculateSummary).toHaveBeenCalledTimes(1)
    })

    it('should handle empty events array', () => {
      mockGetEvents.mockReturnValue([])
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(result.current.events).toEqual([])
      expect(result.current.summary).toEqual(mockSummary)
      expect(result.current.isLoading).toBe(false)
    })

    it('should set isLoading to false after loading', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      // Loading is set to false synchronously in useEffect
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle errors when loading analytics fails', () => {
      const error = new Error('Analytics loading failed')
      mockGetEvents.mockImplementation(() => {
        throw error
      })

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(mockLogError).toHaveBeenCalledWith(
        'Analytics data loading failed',
        error,
        { hook: 'useAnalytics' }
      )
      expect(result.current.isLoading).toBe(false)
      expect(result.current.events).toEqual([])
      expect(result.current.summary).toBeNull()
    })

    it('should handle errors when calculateSummary fails', () => {
      const error = new Error('Summary calculation failed')
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockImplementation(() => {
        throw error
      })

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(mockLogError).toHaveBeenCalledWith(
        'Analytics data loading failed',
        error,
        { hook: 'useAnalytics' }
      )
      expect(result.current.isLoading).toBe(false)
    })

    it('should set isLoading to false even when error occurs', () => {
      mockGetEvents.mockImplementation(() => {
        throw new Error('Test error')
      })

      const { result } = renderHook(() => useAnalytics())

      // Loading is set to false synchronously in useEffect finally block
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('auto-refresh functionality', () => {
    it('should refresh data every 5 seconds', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      renderHook(() => useAnalytics())

      expect(mockGetEvents).toHaveBeenCalledTimes(1)
      expect(mockCalculateSummary).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(mockGetEvents).toHaveBeenCalledTimes(2)
      expect(mockCalculateSummary).toHaveBeenCalledTimes(2)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(mockGetEvents).toHaveBeenCalledTimes(3)
      expect(mockCalculateSummary).toHaveBeenCalledTimes(3)
    })

    it('should update events and summary on each refresh', () => {
      const updatedEvents = [...mockEvents, {
        eventId: 'event-3',
        sessionId: 'session-2',
        eventType: 'chat.message.sent',
        eventCategory: 'chat',
        severity: 'info',
        timestamp: '2025-01-14T10:05:00.000Z',
        properties: {
          queryLength: 75,
          messageCount: 1,
        },
      }] as AnalyticsEvent[]

      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(result.current.events).toHaveLength(2)

      mockGetEvents.mockReturnValue(updatedEvents)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.events).toHaveLength(3)
      expect(result.current.events[2].eventId).toBe('event-3')
    })

    it('should continue refreshing even after errors', () => {
      mockGetEvents.mockImplementation(() => {
        throw new Error('Test error')
      })
      mockCalculateSummary.mockReturnValue(mockSummary)

      renderHook(() => useAnalytics())

      expect(mockGetEvents).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(mockGetEvents).toHaveBeenCalledTimes(2)
      expect(mockLogError).toHaveBeenCalledTimes(2)
    })
  })

  describe('filter changes', () => {
    it('should reload data when filters change', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { rerender } = renderHook(
        ({ filters }) => useAnalytics(filters),
        { initialProps: { filters: undefined } }
      )

      expect(mockGetEvents).toHaveBeenCalledWith(undefined)

      const newFilters = { eventType: 'chat.cache.metrics' as const }

      act(() => {
        rerender({ filters: newFilters })
      })

      expect(mockGetEvents).toHaveBeenCalledWith(newFilters)
    })

    it('should reset interval when filters change', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { rerender } = renderHook(
        ({ filters }) => useAnalytics(filters),
        { initialProps: { filters: undefined } }
      )

      expect(mockGetEvents).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      const newFilters = { eventType: 'chat.message.sent' as const }

      act(() => {
        rerender({ filters: newFilters })
      })

      // Should have been called again immediately on filter change
      expect(mockGetEvents).toHaveBeenCalledTimes(2)

      // Should restart the 5 second interval
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(mockGetEvents).toHaveBeenCalledTimes(3)
    })

    it('should handle filter changes with different event categories', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { rerender } = renderHook(
        ({ filters }) => useAnalytics(filters),
        { initialProps: { filters: { eventCategory: 'chat' as const } } }
      )

      expect(mockGetEvents).toHaveBeenCalledWith({ eventCategory: 'chat' })

      act(() => {
        rerender({ filters: { eventCategory: 'cache' as const } })
      })

      expect(mockGetEvents).toHaveBeenCalledWith({ eventCategory: 'cache' })
    })
  })

  describe('cleanup on unmount', () => {
    it('should clear interval on unmount', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { unmount } = renderHook(() => useAnalytics())

      expect(mockGetEvents).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(mockGetEvents).toHaveBeenCalledTimes(2)

      unmount()

      act(() => {
        jest.advanceTimersByTime(10000)
      })

      // Should not call getEvents after unmount
      expect(mockGetEvents).toHaveBeenCalledTimes(2)
    })

    it('should not update state after unmount', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result, unmount } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      const eventsBeforeUnmount = result.current.events

      unmount()

      mockGetEvents.mockReturnValue([])

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // State should remain unchanged after unmount
      expect(result.current.events).toBe(eventsBeforeUnmount)
    })
  })

  describe('integration with analytics module', () => {
    it('should work with complex event filters', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const filters = {
        eventType: 'chat.message.sent' as const,
        eventCategory: 'chat' as const,
        sessionId: 'session-1',
      }

      renderHook(() => useAnalytics(filters))

      expect(mockGetEvents).toHaveBeenCalledWith(filters)
      expect(mockCalculateSummary).toHaveBeenCalled()
    })

    it('should handle real-time updates with multiple event types', () => {
      const initialEvents = [mockEvents[0]]
      mockGetEvents.mockReturnValue(initialEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(result.current.events).toHaveLength(1)

      mockGetEvents.mockReturnValue(mockEvents)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.events).toHaveLength(2)
      expect(result.current.events[0].eventType).toBe('chat.message.sent')
      expect(result.current.events[1].eventType).toBe('chat.response.completed')
    })

    it('should maintain consistent data between events and summary', () => {
      mockGetEvents.mockReturnValue(mockEvents)
      mockCalculateSummary.mockReturnValue(mockSummary)

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(result.current.events).toEqual(mockEvents)
      expect(result.current.summary).toEqual(mockSummary)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
