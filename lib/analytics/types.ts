/**
 * Types pour le système d'analytics custom
 * Compatible avec Vercel Analytics pour l'export
 */

// =============================================================================
// EVENT TYPES
// =============================================================================

export type EventType =
  // Message events
  | 'chat.message.sent'
  | 'chat.message.received'
  | 'chat.response.completed'

  // Cache events
  | 'chat.cache.hit'
  | 'chat.cache.miss'
  | 'chat.cache.metrics'

  // Thinking mode events
  | 'chat.thinking.activated'
  | 'chat.thinking.completed'

  // Rate limit events
  | 'chat.rate_limit.checked'
  | 'chat.rate_limit.exceeded'

  // Session events
  | 'chat.session.started'
  | 'chat.session.ended'

  // Error events
  | 'chat.error.occurred'
  | 'chat.error.recovered'

  // Context events
  | 'chat.context.built'
  | 'chat.intent.analyzed'

export type EventCategory =
  | 'chat'
  | 'cache'
  | 'thinking'
  | 'rate_limit'
  | 'session'
  | 'error'
  | 'performance'

export type EventSeverity = 'info' | 'warning' | 'error'

// =============================================================================
// BASE EVENT INTERFACE
// =============================================================================

export interface BaseEvent {
  // Identification
  eventId: string
  sessionId: string
  requestId?: string

  // Classification
  eventType: EventType
  eventCategory: EventCategory
  severity: EventSeverity

  // Timing
  timestamp: string // ISO 8601
  duration?: number // milliseconds

  // Metadata
  metadata?: {
    userAgent?: string
    page?: string
    model?: string
  }
}

// =============================================================================
// SPECIFIC EVENT TYPES
// =============================================================================

export interface MessageSentEvent extends BaseEvent {
  eventType: 'chat.message.sent'
  eventCategory: 'chat'
  properties: {
    queryLength: number
    messageCount: number
    currentPage?: number
    // Phase 2: Model routing analytics
    modelUsed?: string
    complexityScore?: number
    estimatedCost?: number
  }
}

export interface CacheMetricsEvent extends BaseEvent {
  eventType: 'chat.cache.metrics'
  eventCategory: 'cache'
  properties: {
    cacheHit: boolean
    cacheReadTokens: number
    cacheCreationTokens: number
    cacheReadPercentage: number
    inputTokens: number
    totalInputTokens: number
    estimatedSavings: number // en $
  }
}

export interface ThinkingActivatedEvent extends BaseEvent {
  eventType: 'chat.thinking.activated'
  eventCategory: 'thinking'
  properties: {
    enabled: boolean
    budgetTokens: number
    queryLength: number
    hasIndicator: boolean
    complexityScore: number
  }
}

export interface ResponseCompletedEvent extends BaseEvent {
  eventType: 'chat.response.completed'
  eventCategory: 'performance'
  properties: {
    responseLength: number
    inputTokens: number
    outputTokens: number
    totalTokens: number
    thinkingUsed: boolean
    thinkingTokens?: number
    duration: number
    tokensPerSecond: number
  }
}

export interface RateLimitExceededEvent extends BaseEvent {
  eventType: 'chat.rate_limit.exceeded'
  eventCategory: 'rate_limit'
  properties: {
    retryAfter: number
    remainingTokens: number
    requestCount: number
  }
}

export interface SessionStartedEvent extends BaseEvent {
  eventType: 'chat.session.started'
  eventCategory: 'session'
  properties: {
    url: string
    currentPage?: number
  }
}

export interface SessionEndedEvent extends BaseEvent {
  eventType: 'chat.session.ended'
  eventCategory: 'session'
  properties: {
    duration: number
    messageCount: number
    userMessageCount: number
    assistantMessageCount: number
    thinkingUsed: boolean
    cacheHits: number
    errors: number
  }
}

export interface ErrorOccurredEvent extends BaseEvent {
  eventType: 'chat.error.occurred'
  eventCategory: 'error'
  severity: 'error'
  properties: {
    errorType: string
    errorStatus?: number
    errorMessage: string
    phase: string
  }
}

export interface ContextBuiltEvent extends BaseEvent {
  eventType: 'chat.context.built'
  eventCategory: 'performance'
  properties: {
    sources: string[]
    sourceCount: number
    contextLength: number
    estimatedTokens: number
    buildDuration: number
    includeFullAnalysis: boolean
    includeScores: boolean
    includeRecommendations: boolean
  }
}

// =============================================================================
// UNION TYPE FOR ALL EVENTS
// =============================================================================

export type AnalyticsEvent =
  | MessageSentEvent
  | CacheMetricsEvent
  | ThinkingActivatedEvent
  | ResponseCompletedEvent
  | RateLimitExceededEvent
  | SessionStartedEvent
  | SessionEndedEvent
  | ErrorOccurredEvent
  | ContextBuiltEvent

// =============================================================================
// METRICS STORAGE
// =============================================================================

export interface StoredMetrics {
  events: AnalyticsEvent[]
  summary: MetricsSummary
  lastUpdated: string
}

export interface MetricsSummary {
  // Cache
  totalCacheHits: number
  totalCacheMisses: number
  cacheHitRate: number
  totalCacheSavings: number // en $

  // Thinking
  thinkingActivations: number
  thinkingActivationRate: number
  avgThinkingTokens: number

  // Performance
  avgResponseTime: number
  p50ResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number

  // Usage
  totalMessages: number
  totalSessions: number
  avgMessagesPerSession: number
  totalTokensUsed: number

  // Errors
  totalErrors: number
  errorRate: number

  // Rate Limiting
  rateLimitExceededCount: number
}

// =============================================================================
// ANALYTICS CONFIG
// =============================================================================

export interface AnalyticsConfig {
  enabled: boolean
  enableConsoleLog: boolean
  enableLocalStorage: boolean
  enableVercelAnalytics: boolean
  maxStoredEvents: number
  storageKey: string
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export interface MetricsExport {
  exportDate: string
  period: {
    start: string
    end: string
  }
  summary: MetricsSummary
  events: AnalyticsEvent[]
}
