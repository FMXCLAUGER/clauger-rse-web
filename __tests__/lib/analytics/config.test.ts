import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  DEFAULT_ANALYTICS_CONFIG,
  MAX_EVENT_AGE_MS,
  STORAGE_KEYS,
  getAnalyticsConfig,
  isAnalyticsEnabled,
  isLocalStorageAvailable,
} from '@/lib/analytics/config'

describe('analytics/config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('DEFAULT_ANALYTICS_CONFIG', () => {
    it('has enabled set to true', () => {
      expect(DEFAULT_ANALYTICS_CONFIG.enabled).toBe(true)
    })

    it('has enableLocalStorage set to true', () => {
      expect(DEFAULT_ANALYTICS_CONFIG.enableLocalStorage).toBe(true)
    })

    it('has enableVercelAnalytics set to true', () => {
      expect(DEFAULT_ANALYTICS_CONFIG.enableVercelAnalytics).toBe(true)
    })

    it('has maxStoredEvents set to 1000', () => {
      expect(DEFAULT_ANALYTICS_CONFIG.maxStoredEvents).toBe(1000)
    })

    it('has storageKey defined', () => {
      expect(DEFAULT_ANALYTICS_CONFIG.storageKey).toBe('clauger_analytics_events')
    })

    it('has all required properties', () => {
      expect(DEFAULT_ANALYTICS_CONFIG).toHaveProperty('enabled')
      expect(DEFAULT_ANALYTICS_CONFIG).toHaveProperty('enableConsoleLog')
      expect(DEFAULT_ANALYTICS_CONFIG).toHaveProperty('enableLocalStorage')
      expect(DEFAULT_ANALYTICS_CONFIG).toHaveProperty('enableVercelAnalytics')
      expect(DEFAULT_ANALYTICS_CONFIG).toHaveProperty('maxStoredEvents')
      expect(DEFAULT_ANALYTICS_CONFIG).toHaveProperty('storageKey')
    })
  })

  describe('MAX_EVENT_AGE_MS', () => {
    it('equals 30 days in milliseconds', () => {
      const expectedMs = 30 * 24 * 60 * 60 * 1000
      expect(MAX_EVENT_AGE_MS).toBe(expectedMs)
    })

    it('equals 2592000000 milliseconds', () => {
      expect(MAX_EVENT_AGE_MS).toBe(2592000000)
    })
  })

  describe('STORAGE_KEYS', () => {
    it('has EVENTS key', () => {
      expect(STORAGE_KEYS.EVENTS).toBe('clauger_analytics_events')
    })

    it('has SUMMARY key', () => {
      expect(STORAGE_KEYS.SUMMARY).toBe('clauger_analytics_summary')
    })

    it('has SESSION_ID key', () => {
      expect(STORAGE_KEYS.SESSION_ID).toBe('clauger_session_id')
    })

    it('has SESSION_START key', () => {
      expect(STORAGE_KEYS.SESSION_START).toBe('clauger_session_start')
    })

    it('all keys start with clauger_', () => {
      Object.values(STORAGE_KEYS).forEach(key => {
        expect(key).toMatch(/^clauger_/)
      })
    })
  })

  describe('getAnalyticsConfig', () => {
    it('returns config with default values', () => {
      const config = getAnalyticsConfig()
      expect(config.enabled).toBe(true)
      expect(config.enableLocalStorage).toBe(true)
    })

    it('merges with DEFAULT_ANALYTICS_CONFIG', () => {
      const config = getAnalyticsConfig()
      expect(config.maxStoredEvents).toBe(DEFAULT_ANALYTICS_CONFIG.maxStoredEvents)
      expect(config.storageKey).toBe(DEFAULT_ANALYTICS_CONFIG.storageKey)
    })

    it('respects NEXT_PUBLIC_ANALYTICS_ENABLED=false', () => {
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false'
      const config = getAnalyticsConfig()
      expect(config.enabled).toBe(false)
    })

    it('respects NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=false', () => {
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED = 'false'
      const config = getAnalyticsConfig()
      expect(config.enableVercelAnalytics).toBe(false)
    })

    it('enables analytics when env var not set', () => {
      delete process.env.NEXT_PUBLIC_ANALYTICS_ENABLED
      const config = getAnalyticsConfig()
      expect(config.enabled).toBe(true)
    })

    it('returns consistent config on multiple calls', () => {
      const config1 = getAnalyticsConfig()
      const config2 = getAnalyticsConfig()
      expect(config1).toEqual(config2)
    })
  })

  describe('isAnalyticsEnabled', () => {
    it('returns true by default', () => {
      expect(isAnalyticsEnabled()).toBe(true)
    })

    it('returns false when NEXT_PUBLIC_ANALYTICS_ENABLED=false', () => {
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false'
      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('returns true when NEXT_PUBLIC_ANALYTICS_ENABLED=true', () => {
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'
      expect(isAnalyticsEnabled()).toBe(true)
    })
  })

  describe('isLocalStorageAvailable', () => {
    it('returns boolean', () => {
      const result = isLocalStorageAvailable()
      expect(typeof result).toBe('boolean')
    })

    it.skip('returns false in Node.js environment', () => {
      const result = isLocalStorageAvailable()
      expect(result).toBe(false)
    })
  })
})
