// Mock analytics config module
const isAnalyticsEnabled = jest.fn(() => true)
const getAnalyticsConfig = jest.fn(() => ({
  enabled: true,
  enableConsoleLog: false,
  enableLocalStorage: true,
  enableVercelAnalytics: false,
  maxStoredEvents: 1000,
  storageKey: 'clauger_analytics_events',
}))

module.exports = {
  isAnalyticsEnabled,
  isLocalStorageAvailable: () => true,
  getAnalyticsConfig,
  STORAGE_KEYS: {
    EVENTS: 'clauger_analytics_events',
    SUMMARY: 'clauger_analytics_summary',
    SESSION_ID: 'clauger_session_id',
    SESSION_START: 'clauger_session_start',
  },
  MAX_EVENT_AGE_MS: 30 * 24 * 60 * 60 * 1000,
}
