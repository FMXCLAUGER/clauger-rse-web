/**
 * GET /api/analytics/events
 * Récupère les événements analytics depuis Vercel Blob
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEventsFromBlob, getFilteredEventsFromBlob } from '@/lib/analytics/blob-storage'
import { logger } from '@/lib/security'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const eventType = searchParams.get('eventType')
    const limit = searchParams.get('limit')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // If no filters, return all events
    if (!eventType && !limit && !startDate && !endDate) {
      const events = await getEventsFromBlob()
      return NextResponse.json({ events, count: events.length })
    }

    // Apply filters
    const filters: {
      eventType?: string
      limit?: number
      startDate?: Date
      endDate?: Date
    } = {}

    if (eventType) {
      filters.eventType = eventType
    }

    if (limit) {
      filters.limit = parseInt(limit, 10)
    }

    if (startDate) {
      filters.startDate = new Date(startDate)
    }

    if (endDate) {
      filters.endDate = new Date(endDate)
    }

    const events = await getFilteredEventsFromBlob(filters)

    return NextResponse.json({
      events,
      count: events.length,
      filters,
    })
  } catch (error) {
    logger.error('Analytics events error:', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
