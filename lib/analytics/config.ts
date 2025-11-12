/**
 * Configuration pour le système d'analytics
 * Gère les paramètres globaux et les valeurs par défaut
 */

import type { AnalyticsConfig } from './types'

/**
 * Configuration par défaut du système d'analytics
 */
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  enableConsoleLog: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  enableVercelAnalytics: true,
  maxStoredEvents: 1000,
  storageKey: 'clauger_analytics_events',
}

/**
 * Durée de conservation des événements (30 jours)
 */
export const MAX_EVENT_AGE_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Clés de configuration pour le localStorage
 */
export const STORAGE_KEYS = {
  EVENTS: 'clauger_analytics_events',
  SUMMARY: 'clauger_analytics_summary',
  SESSION_ID: 'clauger_session_id',
  SESSION_START: 'clauger_session_start',
} as const

/**
 * Récupère la configuration d'analytics actuelle
 * Merge les valeurs par défaut avec les variables d'environnement
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  return {
    ...DEFAULT_ANALYTICS_CONFIG,
    enabled:
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
      DEFAULT_ANALYTICS_CONFIG.enabled,
    enableVercelAnalytics:
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED !== 'false' &&
      DEFAULT_ANALYTICS_CONFIG.enableVercelAnalytics,
  }
}

/**
 * Vérifie si l'analytics est activé
 */
export function isAnalyticsEnabled(): boolean {
  return getAnalyticsConfig().enabled
}

/**
 * Vérifie si le localStorage est disponible
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const test = '__storage_test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}
