/**
 * Analytics Module - Barrel Export
 *
 * Exports all analytics functionality for easy importing:
 * import { trackMessageSent, AnalyticsStorage, AnalyticsEvent } from '@/lib/analytics'
 */

// Types
export type {
  EventType,
  EventCategory,
  EventSeverity,
  BaseEvent,
  MessageSentEvent,
  CacheMetricsEvent,
  ThinkingActivatedEvent,
  ResponseCompletedEvent,
  RateLimitExceededEvent,
  SessionStartedEvent,
  SessionEndedEvent,
  ErrorOccurredEvent,
  ContextBuiltEvent,
  AnalyticsEvent,
  StoredMetrics,
  MetricsSummary,
  AnalyticsConfig,
  MetricsExport
} from './types'

// Configuration
export { getAnalyticsConfig } from './config'

// Storage
export {
  saveEvent,
  getEvents,
  calculateSummary,
  exportMetrics,
  clearAllEvents,
  clearOldEvents,
  getSummary,
  saveSummary
} from './storage'
export type { EventFilters } from './storage'

// Tracker (main interface)
export {
  trackMessageSent,
  trackCacheMetrics,
  trackThinkingActivated,
  trackResponseCompleted,
  trackRateLimitExceeded,
  trackSessionStarted,
  trackSessionEnded,
  trackError,
  trackContextBuilt,
  trackResilienceMetrics
} from './tracker'
