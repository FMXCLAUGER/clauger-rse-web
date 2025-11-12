'use client'

import { useEffect, useState } from 'react'
import { getEvents, calculateSummary, type EventFilters } from '@/lib/analytics'
import type { AnalyticsEvent, MetricsSummary } from '@/lib/analytics/types'

export function useAnalytics(filters?: EventFilters) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const loadedEvents = getEvents(filters)
        const calculatedSummary = calculateSummary()

        setEvents(loadedEvents)
        setSummary(calculatedSummary)
      } catch (error) {
        console.error('[useAnalytics] Erreur chargement:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()

    // Refresh toutes les 5 secondes
    const interval = setInterval(loadAnalytics, 5000)
    return () => clearInterval(interval)
  }, [filters])

  return { events, summary, isLoading }
}
