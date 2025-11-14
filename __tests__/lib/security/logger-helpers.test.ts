import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { logError, logStorageError, logPerformance } from '@/lib/security/logger-helpers'
import { logger } from '@/lib/security/secure-logger'
import { loggerConfig } from '@/lib/security/logger-config'

describe('Logger Helpers', () => {
  let errorSpy: jest.SpiedFunction<typeof logger.error>
  let infoSpy: jest.SpiedFunction<typeof logger.info>

  beforeEach(() => {
    // Spy on logger methods
    errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {})
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('logError', () => {
    it('should log Error instances with stack trace', () => {
      const error = new Error('Test error message')
      const context = { component: 'TestComponent', userId: '123' }

      logError('Operation failed', error, context)

      expect(errorSpy).toHaveBeenCalledWith('Operation failed', {
        component: 'TestComponent',
        userId: '123',
        errorMessage: 'Test error message',
        errorStack: expect.stringContaining('Error: Test error message'),
      })
    })

    it('should log non-Error values as strings', () => {
      const error = 'Simple error string'

      logError('String error occurred', error)

      expect(errorSpy).toHaveBeenCalledWith('String error occurred', {
        errorMessage: 'Simple error string',
        errorStack: undefined,
      })
    })

    it('should log null/undefined errors', () => {
      logError('Null error', null)

      expect(errorSpy).toHaveBeenCalledWith('Null error', {
        errorMessage: 'null',
        errorStack: undefined,
      })
    })

    it('should handle errors without context', () => {
      const error = new Error('No context error')

      logError('Error without context', error)

      expect(errorSpy).toHaveBeenCalledWith('Error without context', {
        errorMessage: 'No context error',
        errorStack: expect.any(String),
      })
    })

    it('should merge context with error details', () => {
      const error = new Error('Merge test')
      const context = {
        operation: 'fetch',
        url: '/api/data',
        status: 500
      }

      logError('API request failed', error, context)

      expect(errorSpy).toHaveBeenCalledWith('API request failed', {
        operation: 'fetch',
        url: '/api/data',
        status: 500,
        errorMessage: 'Merge test',
        errorStack: expect.any(String),
      })
    })
  })

  describe('logStorageError', () => {
    it('should log localStorage operation errors with key', () => {
      const error = new Error('QuotaExceededError')

      logStorageError('save', error, 'user-preferences')

      expect(errorSpy).toHaveBeenCalledWith('localStorage save failed', {
        operation: 'save',
        key: 'user-preferences',
        error: 'QuotaExceededError',
      })
    })

    it('should handle errors without key', () => {
      const error = new Error('Storage unavailable')

      logStorageError('read', error)

      expect(errorSpy).toHaveBeenCalledWith('localStorage read failed', {
        operation: 'read',
        key: undefined,
        error: 'Storage unavailable',
      })
    })

    it('should log non-Error values as strings', () => {
      logStorageError('clear', 'Storage is disabled')

      expect(errorSpy).toHaveBeenCalledWith('localStorage clear failed', {
        operation: 'clear',
        key: undefined,
        error: 'Storage is disabled',
      })
    })

    it('should handle all common localStorage operations', () => {
      const operations = ['save', 'load', 'remove', 'clear', 'parse']

      operations.forEach(operation => {
        jest.clearAllMocks()
        logStorageError(operation, new Error('Test'), 'test-key')

        expect(errorSpy).toHaveBeenCalledWith(
          `localStorage ${operation} failed`,
          expect.objectContaining({ operation })
        )
      })
    })
  })

  describe('logPerformance', () => {
    const originalLogPerformance = loggerConfig.logPerformance

    afterEach(() => {
      // Restore original value
      loggerConfig.logPerformance = originalLogPerformance
    })

    it('should log performance when enabled', () => {
      loggerConfig.logPerformance = true

      logPerformance('Database query', 123.45)

      expect(infoSpy).toHaveBeenCalledWith('Performance: Database query', {
        durationMs: 123.45,
        operation: 'Database query',
      })
    })

    it('should include additional context when provided', () => {
      loggerConfig.logPerformance = true
      const context = {
        query: 'SELECT * FROM users',
        rowCount: 42
      }

      logPerformance('SQL execution', 250, context)

      expect(infoSpy).toHaveBeenCalledWith('Performance: SQL execution', {
        query: 'SELECT * FROM users',
        rowCount: 42,
        durationMs: 250,
        operation: 'SQL execution',
      })
    })

    it('should NOT log when performance logging is disabled', () => {
      loggerConfig.logPerformance = false

      logPerformance('Slow operation', 5000)

      expect(infoSpy).not.toHaveBeenCalled()
    })

    it('should handle zero duration', () => {
      loggerConfig.logPerformance = true

      logPerformance('Instant operation', 0)

      expect(infoSpy).toHaveBeenCalledWith('Performance: Instant operation', {
        durationMs: 0,
        operation: 'Instant operation',
      })
    })

    it('should handle negative duration (clock skew)', () => {
      loggerConfig.logPerformance = true

      logPerformance('Clock skew operation', -5)

      expect(infoSpy).toHaveBeenCalledWith('Performance: Clock skew operation', {
        durationMs: -5,
        operation: 'Clock skew operation',
      })
    })

    it('should handle very large durations', () => {
      loggerConfig.logPerformance = true

      logPerformance('Very slow operation', 999999.99)

      expect(infoSpy).toHaveBeenCalledWith('Performance: Very slow operation', {
        durationMs: 999999.99,
        operation: 'Very slow operation',
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle typical React component error scenario', () => {
      const error = new Error('Failed to fetch data')
      error.stack = 'Error: Failed to fetch data\n    at ComponentName.tsx:42:10'

      logError('Data loading failed', error, {
        component: 'UserProfile',
        userId: 'user-123',
        endpoint: '/api/users/123'
      })

      expect(errorSpy).toHaveBeenCalledWith('Data loading failed', {
        component: 'UserProfile',
        userId: 'user-123',
        endpoint: '/api/users/123',
        errorMessage: 'Failed to fetch data',
        errorStack: expect.stringContaining('ComponentName.tsx:42:10'),
      })
    })

    it('should handle typical localStorage scenario', () => {
      const quotaError = new Error('QuotaExceededError: DOM Exception 22')

      logStorageError('save', quotaError, 'analytics-events')

      expect(errorSpy).toHaveBeenCalledWith('localStorage save failed', {
        operation: 'save',
        key: 'analytics-events',
        error: 'QuotaExceededError: DOM Exception 22',
      })
    })

    it('should handle typical performance tracking scenario', () => {
      loggerConfig.logPerformance = true

      const startTime = performance.now()
      // Simulate some work
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      logPerformance('Search index loading', duration, {
        vocabularySize: 1500,
        indexSize: '2.5MB'
      })

      expect(infoSpy).toHaveBeenCalledWith('Performance: Search index loading', {
        vocabularySize: 1500,
        indexSize: '2.5MB',
        durationMs: expect.any(Number),
        operation: 'Search index loading',
      })
    })
  })
})
