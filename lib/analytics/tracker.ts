/**
 * Interface principale de tracking des événements analytics
 * Fournit les méthodes pour tracker les différents types d'événements
 */

import { nanoid } from 'nanoid'
import { track } from '@vercel/analytics'
import type {
  AnalyticsEvent,
  MessageSentEvent,
  CacheMetricsEvent,
  ThinkingActivatedEvent,
  ResponseCompletedEvent,
  RateLimitExceededEvent,
  SessionStartedEvent,
  SessionEndedEvent,
  ErrorOccurredEvent,
  ContextBuiltEvent,
  ResilienceMetricsEvent,
  EventSeverity,
  EventType,
  EventCategory,
} from './types'
import { saveEvent } from './storage'
import { getAnalyticsConfig, isAnalyticsEnabled, STORAGE_KEYS } from './config'
import { logger, logError, logStorageError } from '@/lib/security'

/**
 * Récupère ou crée un ID de session
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server-session'
  }

  try {
    let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)
    if (!sessionId) {
      sessionId = nanoid()
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
      sessionStorage.setItem(STORAGE_KEYS.SESSION_START, new Date().toISOString())
    }
    return sessionId
  } catch {
    return 'anonymous-session'
  }
}

/**
 * Récupère les métadonnées communes
 */
function getCommonMetadata() {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server',
      page: 'server',
    }
  }

  return {
    userAgent: window.navigator.userAgent,
    page: window.location.pathname,
  }
}

/**
 * Envoie un événement vers Vercel Analytics
 */
function trackVercelAnalytics(event: AnalyticsEvent): void {
  if (!getAnalyticsConfig().enableVercelAnalytics) return

  try {
    // Vercel Analytics track() accepts Record<string, string | number | boolean | null>
    // We need to flatten the properties and convert arrays to comma-separated strings
    const flatProperties: Record<string, string | number | boolean | null> = {}

    for (const [key, value] of Object.entries(event.properties)) {
      if (Array.isArray(value)) {
        flatProperties[key] = value.join(',')
      } else if (value !== undefined) {
        flatProperties[key] = value as string | number | boolean | null
      }
    }

    track(event.eventType, flatProperties)
  } catch (error) {
    logError('Vercel Analytics tracking failed', error, { eventType: event.eventType })
  }
}

/**
 * Envoie un événement vers Vercel Analytics et le stocke localement
 */
function sendEvent(event: AnalyticsEvent): void {
  const config = getAnalyticsConfig()

  // Log en mode développement
  if (config.enableConsoleLog) {
    logger.debug('Analytics event tracked', { eventType: event.eventType, event })
  }

  // Sauvegarde locale
  if (config.enableLocalStorage) {
    saveEvent(event)
  }

  // Envoi vers Vercel Analytics
  if (config.enableVercelAnalytics && typeof window !== 'undefined') {
    trackVercelAnalytics(event)
  }
}

/**
 * Helper pour créer la base d'un event
 */
function createBaseEvent<T extends EventType>(
  eventType: T,
  category: EventCategory,
  severity: EventSeverity = 'info',
  requestId?: string
) {
  return {
    eventId: nanoid(),
    sessionId: getSessionId(),
    requestId,
    eventType,
    eventCategory: category,
    severity,
    timestamp: new Date().toISOString(),
    metadata: getCommonMetadata(),
  }
}

/**
 * Track un message envoyé par l'utilisateur
 */
export function trackMessageSent(properties: MessageSentEvent['properties']): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.message.sent' as const, 'chat'),
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track les métriques de cache
 */
export function trackCacheMetrics(
  properties: CacheMetricsEvent['properties'],
  requestId?: string
): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.cache.metrics' as const, 'cache', 'info', requestId),
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track l'activation du mode thinking
 */
export function trackThinkingActivated(
  properties: ThinkingActivatedEvent['properties'],
  requestId?: string
): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.thinking.activated' as const, 'thinking', 'info', requestId),
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track la complétion d'une réponse
 */
export function trackResponseCompleted(
  properties: ResponseCompletedEvent['properties'],
  requestId?: string
): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.response.completed' as const, 'performance', 'info', requestId),
    duration: properties.duration,
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track un dépassement de rate limit
 */
export function trackRateLimitExceeded(
  properties: RateLimitExceededEvent['properties'],
  requestId?: string
): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.rate_limit.exceeded' as const, 'rate_limit', 'warning', requestId),
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track le début d'une session
 */
export function trackSessionStarted(
  properties: SessionStartedEvent['properties']
): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.session.started' as const, 'session'),
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track la fin d'une session
 */
export function trackSessionEnded(
  properties: SessionEndedEvent['properties']
): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.session.ended' as const, 'session'),
    duration: properties.duration,
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track une erreur
 */
export function trackError(
  properties: ErrorOccurredEvent['properties'],
  requestId?: string
): void {
  if (!isAnalyticsEnabled()) return

  const baseEvent = createBaseEvent('chat.error.occurred' as const, 'error', 'error', requestId)
  const event = {
    ...baseEvent,
    severity: 'error' as const,
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track la construction du contexte
 */
export function trackContextBuilt(
  properties: ContextBuiltEvent['properties'],
  requestId?: string
): void {
  if (!isAnalyticsEnabled()) return

  const event = {
    ...createBaseEvent('chat.context.built' as const, 'performance', 'info', requestId),
    duration: properties.buildDuration,
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Track les métriques de résilience (Phase 3)
 */
export function trackResilienceMetrics(
  properties: ResilienceMetricsEvent['properties'],
  requestId?: string
): void {
  if (!isAnalyticsEnabled()) return

  const severity: EventSeverity =
    properties.circuitState === 'OPEN' ? 'warning' :
    properties.successRate < 90 ? 'warning' :
    'info'

  const event = {
    ...createBaseEvent('chat.resilience.metrics' as const, 'resilience', severity, requestId),
    properties,
  }

  sendEvent(event as AnalyticsEvent)
}

/**
 * Calcule les métriques de session en cours
 */
export function getSessionMetrics(): {
  sessionId: string
  duration: number
  startTime: string
} | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)
    const startTime = sessionStorage.getItem(STORAGE_KEYS.SESSION_START)

    if (!sessionId || !startTime) {
      return null
    }

    const duration = Date.now() - new Date(startTime).getTime()

    return {
      sessionId,
      duration,
      startTime,
    }
  } catch {
    return null
  }
}

/**
 * Réinitialise la session (utile pour les tests ou après logout)
 */
export function resetSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID)
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_START)
  } catch (error) {
    logStorageError('clear', error, 'analytics-session')
  }
}

/**
 * Export de toutes les fonctions de tracking
 */
export const analytics = {
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
}
