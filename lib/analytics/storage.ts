/**
 * Gestion du stockage local des événements analytics
 * Permet de sauvegarder, récupérer et analyser les métriques
 */

import type {
  AnalyticsEvent,
  MetricsSummary,
  MetricsExport,
  EventType,
  EventCategory,
  ResponseCompletedEvent,
  CacheMetricsEvent,
  ThinkingActivatedEvent,
} from './types'
import { STORAGE_KEYS, MAX_EVENT_AGE_MS } from './config'
import { isLocalStorageAvailable } from './config'

/**
 * Filtres pour la récupération des événements
 */
export interface EventFilters {
  eventType?: EventType
  category?: EventCategory
  startDate?: Date
  endDate?: Date
}

/**
 * Sauvegarde un événement dans le localStorage
 * @param event L'événement à sauvegarder
 * @returns true si la sauvegarde a réussi
 */
export function saveEvent(event: AnalyticsEvent): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('[Analytics] localStorage non disponible')
    return false
  }

  try {
    const existingEvents = getEvents()
    const updatedEvents = [...existingEvents, event]

    // Limite le nombre d'événements stockés
    const config = { maxStoredEvents: 1000 }
    if (updatedEvents.length > config.maxStoredEvents) {
      updatedEvents.shift()
    }

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents))
    return true
  } catch (error) {
    console.error('[Analytics] Erreur lors de la sauvegarde:', error)
    return false
  }
}

/**
 * Récupère les événements du localStorage avec filtres optionnels
 * @param filters Filtres à appliquer
 * @returns Liste des événements correspondants
 */
export function getEvents(filters?: EventFilters): AnalyticsEvent[] {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS)
    if (!raw) {
      return []
    }

    let events: AnalyticsEvent[] = JSON.parse(raw)

    // Application des filtres
    if (filters) {
      if (filters.eventType) {
        events = events.filter((e) => e.eventType === filters.eventType)
      }

      if (filters.category) {
        events = events.filter((e) => e.eventCategory === filters.category)
      }

      if (filters.startDate) {
        const startTime = filters.startDate.getTime()
        events = events.filter((e) => new Date(e.timestamp).getTime() >= startTime)
      }

      if (filters.endDate) {
        const endTime = filters.endDate.getTime()
        events = events.filter((e) => new Date(e.timestamp).getTime() <= endTime)
      }
    }

    return events
  } catch (error) {
    console.error('[Analytics] Erreur lors de la récupération:', error)
    return []
  }
}

/**
 * Calcule le percentile d'un tableau de nombres
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)] || 0
}

/**
 * Calcule un résumé des métriques à partir des événements stockés
 * @returns Résumé des métriques
 */
export function calculateSummary(): MetricsSummary {
  const events = getEvents()

  // Cache metrics
  const cacheEvents = events.filter(
    (e) => e.eventType === 'chat.cache.metrics'
  ) as CacheMetricsEvent[]

  const cacheHits = cacheEvents.filter((e) => e.properties.cacheHit).length
  const cacheMisses = cacheEvents.filter((e) => !e.properties.cacheHit).length
  const totalCacheEvents = cacheHits + cacheMisses
  const cacheHitRate = totalCacheEvents > 0 ? (cacheHits / totalCacheEvents) * 100 : 0
  const totalCacheSavings = cacheEvents.reduce(
    (sum, e) => sum + e.properties.estimatedSavings,
    0
  )

  // Thinking metrics
  const thinkingEvents = events.filter(
    (e) => e.eventType === 'chat.thinking.activated'
  ) as ThinkingActivatedEvent[]

  const thinkingActivations = thinkingEvents.filter((e) => e.properties.enabled).length
  const totalMessages = events.filter((e) => e.eventType === 'chat.message.sent').length
  const thinkingActivationRate =
    totalMessages > 0 ? (thinkingActivations / totalMessages) * 100 : 0

  // Response metrics for thinking tokens
  const responseEvents = events.filter(
    (e) => e.eventType === 'chat.response.completed'
  ) as ResponseCompletedEvent[]

  const thinkingResponseEvents = responseEvents.filter((e) => e.properties.thinkingUsed)
  const avgThinkingTokens =
    thinkingResponseEvents.length > 0
      ? thinkingResponseEvents.reduce(
          (sum, e) => sum + (e.properties.thinkingTokens || 0),
          0
        ) / thinkingResponseEvents.length
      : 0

  // Performance metrics
  const responseTimes = responseEvents.map((e) => e.properties.duration)
  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0

  const p50ResponseTime = percentile(responseTimes, 50)
  const p95ResponseTime = percentile(responseTimes, 95)
  const p99ResponseTime = percentile(responseTimes, 99)

  // Usage metrics
  const sessionEvents = events.filter((e) => e.eventType === 'chat.session.ended')
  const totalSessions = sessionEvents.length
  const avgMessagesPerSession =
    totalSessions > 0 ? totalMessages / totalSessions : 0

  const totalTokensUsed = responseEvents.reduce(
    (sum, e) => sum + e.properties.totalTokens,
    0
  )

  // Error metrics
  const totalErrors = events.filter((e) => e.eventType === 'chat.error.occurred').length
  const totalRequests = totalMessages
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0

  // Rate limiting metrics
  const rateLimitExceededCount = events.filter(
    (e) => e.eventType === 'chat.rate_limit.exceeded'
  ).length

  return {
    // Cache
    totalCacheHits: cacheHits,
    totalCacheMisses: cacheMisses,
    cacheHitRate,
    totalCacheSavings,

    // Thinking
    thinkingActivations,
    thinkingActivationRate,
    avgThinkingTokens,

    // Performance
    avgResponseTime,
    p50ResponseTime,
    p95ResponseTime,
    p99ResponseTime,

    // Usage
    totalMessages,
    totalSessions,
    avgMessagesPerSession,
    totalTokensUsed,

    // Errors
    totalErrors,
    errorRate,

    // Rate Limiting
    rateLimitExceededCount,
  }
}

/**
 * Exporte toutes les métriques au format MetricsExport
 * @returns Export complet des métriques
 */
export function exportMetrics(): MetricsExport {
  const events = getEvents()
  const summary = calculateSummary()

  // Détermine la période couverte
  const timestamps = events.map((e) => new Date(e.timestamp).getTime())
  const start =
    timestamps.length > 0
      ? new Date(Math.min(...timestamps)).toISOString()
      : new Date().toISOString()
  const end =
    timestamps.length > 0
      ? new Date(Math.max(...timestamps)).toISOString()
      : new Date().toISOString()

  return {
    exportDate: new Date().toISOString(),
    period: {
      start,
      end,
    },
    summary,
    events,
  }
}

/**
 * Supprime les événements plus anciens que maxAge
 * @param maxAge Age maximum en millisecondes (défaut: 30 jours)
 * @returns Nombre d'événements supprimés
 */
export function clearOldEvents(maxAge: number = MAX_EVENT_AGE_MS): number {
  if (!isLocalStorageAvailable()) {
    return 0
  }

  try {
    const events = getEvents()
    const cutoffTime = Date.now() - maxAge

    const filteredEvents = events.filter(
      (e) => new Date(e.timestamp).getTime() >= cutoffTime
    )

    const removedCount = events.length - filteredEvents.length

    if (removedCount > 0) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filteredEvents))
    }

    return removedCount
  } catch (error) {
    console.error('[Analytics] Erreur lors du nettoyage:', error)
    return 0
  }
}

/**
 * Supprime tous les événements du localStorage
 */
export function clearAllEvents(): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.EVENTS)
    localStorage.removeItem(STORAGE_KEYS.SUMMARY)
  } catch (error) {
    console.error('[Analytics] Erreur lors de la suppression:', error)
  }
}

/**
 * Sauvegarde le résumé des métriques dans le localStorage
 * @param summary Le résumé à sauvegarder
 */
export function saveSummary(summary: MetricsSummary): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SUMMARY, JSON.stringify(summary))
  } catch (error) {
    console.error('[Analytics] Erreur lors de la sauvegarde du résumé:', error)
  }
}

/**
 * Récupère le résumé sauvegardé ou le calcule si nécessaire
 * @returns Résumé des métriques
 */
export function getSummary(): MetricsSummary {
  if (!isLocalStorageAvailable()) {
    return calculateSummary()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUMMARY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (error) {
    console.error('[Analytics] Erreur lors de la récupération du résumé:', error)
  }

  // Fallback: calcule et sauvegarde
  const summary = calculateSummary()
  saveSummary(summary)
  return summary
}
