/**
 * Vercel Blob Storage Layer for Global Analytics
 * Stores analytics events in a JSON blob
 */

import { put, head, del } from '@vercel/blob'
import { logger } from '@/lib/security'
import type {
  AnalyticsEvent,
  MetricsSummary,
  AISummary,
} from './types'

// Blob configuration
const BLOB_PATH = 'analytics/events.json'
const MAX_EVENTS = 10000 // Maximum events to store

// Fallback for when Blob is not available (local dev without token)
let cachedEvents: AnalyticsEvent[] = []

/**
 * Fetch events from Blob storage
 */
export async function getEventsFromBlob(): Promise<AnalyticsEvent[]> {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      logger.warn('BLOB_READ_WRITE_TOKEN not found, using cache')
      return cachedEvents
    }

    // Try to fetch the blob
    const blobUrl = `https://${process.env.VERCEL_URL || 'localhost'}/.well-known/vercel/blob/${BLOB_PATH}`

    const response = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (!response.ok) {
      // Blob doesn't exist yet, return empty array
      return []
    }

    const events: AnalyticsEvent[] = await response.json()
    cachedEvents = events // Update cache
    return events
  } catch (error) {
    logger.error('Failed to fetch events from Blob:', { error: String(error) })
    return cachedEvents // Return cached events as fallback
  }
}

/**
 * Save events to Blob storage
 */
export async function saveEventsToBlob(events: AnalyticsEvent[]): Promise<boolean> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      logger.warn('BLOB_READ_WRITE_TOKEN not found, caching locally')
      cachedEvents = events
      return true
    }

    // Limit events (FIFO)
    const eventsToSave = events.length > MAX_EVENTS
      ? events.slice(-MAX_EVENTS)
      : events

    // Upload to Blob
    const blob = await put(BLOB_PATH, JSON.stringify(eventsToSave), {
      access: 'public',
      contentType: 'application/json',
    })

    cachedEvents = eventsToSave
    return true
  } catch (error) {
    logger.error('Failed to save events to Blob:', { error: String(error) })
    return false
  }
}

/**
 * Add a single event to Blob storage
 */
export async function saveEventToBlob(event: AnalyticsEvent): Promise<boolean> {
  try {
    // Get existing events
    const existingEvents = await getEventsFromBlob()

    // Add new event
    const updatedEvents = [...existingEvents, event]

    // Save back
    return await saveEventsToBlob(updatedEvents)
  } catch (error) {
    logger.error('Failed to save event to Blob:', { error: String(error) })
    return false
  }
}

/**
 * Get filtered events from Blob
 */
export async function getFilteredEventsFromBlob(filters: {
  eventType?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<AnalyticsEvent[]> {
  try {
    let events = await getEventsFromBlob()

    // Apply filters
    if (filters.eventType) {
      events = events.filter(e => e.eventType === filters.eventType)
    }

    if (filters.startDate) {
      const startTime = filters.startDate.getTime()
      events = events.filter(e => new Date(e.timestamp).getTime() >= startTime)
    }

    if (filters.endDate) {
      const endTime = filters.endDate.getTime()
      events = events.filter(e => new Date(e.timestamp).getTime() <= endTime)
    }

    // Apply limit
    if (filters.limit && filters.limit > 0) {
      events = events.slice(-filters.limit)
    }

    return events
  } catch (error) {
    logger.error('Failed to filter events from Blob:', { error: String(error) })
    return []
  }
}

/**
 * Clean up old events from Blob
 */
export async function cleanupOldEventsInBlob(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
  try {
    const events = await getEventsFromBlob()
    const cutoffTime = Date.now() - maxAgeMs

    const filteredEvents = events.filter(
      e => new Date(e.timestamp).getTime() >= cutoffTime
    )

    const removedCount = events.length - filteredEvents.length

    if (removedCount > 0) {
      await saveEventsToBlob(filteredEvents)
    }

    return removedCount
  } catch (error) {
    logger.error('Failed to cleanup events in Blob:', { error: String(error) })
    return 0
  }
}

/**
 * Clear all events from Blob
 */
export async function clearAllEventsInBlob(): Promise<boolean> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      cachedEvents = []
      return true
    }

    await del(BLOB_PATH)
    cachedEvents = []
    return true
  } catch (error) {
    logger.error('Failed to clear events from Blob:', { error: String(error) })
    return false
  }
}

/**
 * Get Blob storage stats
 */
export async function getBlobStats(): Promise<{
  totalEvents: number
  oldestEvent: string | null
  newestEvent: string | null
  estimatedSize: number
}> {
  try {
    const events = await getEventsFromBlob()

    return {
      totalEvents: events.length,
      oldestEvent: events.length > 0 ? events[0].timestamp : null,
      newestEvent: events.length > 0 ? events[events.length - 1].timestamp : null,
      estimatedSize: JSON.stringify(events).length,
    }
  } catch (error) {
    logger.error('Failed to get Blob stats:', { error: String(error) })
    return {
      totalEvents: 0,
      oldestEvent: null,
      newestEvent: null,
      estimatedSize: 0,
    }
  }
}
