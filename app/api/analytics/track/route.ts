/**
 * POST /api/analytics/track
 * Enregistre un événement analytics dans Vercel Blob
 */

import { NextRequest, NextResponse } from 'next/server'
import { saveEventToBlob, cleanupOldEventsInBlob } from '@/lib/analytics/blob-storage'
import { logger } from '@/lib/security'
import type { AnalyticsEvent } from '@/lib/analytics/types'

export const runtime = 'nodejs' // Use Node.js runtime for Blob API

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const event: AnalyticsEvent = await request.json()

    // Validate event structure
    if (!event.eventId || !event.eventType || !event.timestamp) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      )
    }

    // Save event to Blob
    const success = await saveEventToBlob(event)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save event' },
        { status: 500 }
      )
    }

    // Trigger cleanup asynchronously (non-blocking)
    cleanupOldEventsInBlob().catch(err => {
      logger.error('Cleanup failed:', { error: String(err) })
    })

    return NextResponse.json(
      { success: true, eventId: event.eventId },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Analytics track error:', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
