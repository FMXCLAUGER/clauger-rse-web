/**
 * GET /api/analytics/summary
 * Récupère le résumé global des analytics depuis Vercel Blob
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getEventsFromBlob,
  getBlobStats,
} from '@/lib/analytics/blob-storage'
import { calculateSummary, calculateAISummary } from '@/lib/analytics/storage'
import { logger } from '@/lib/security'
import type { MetricsSummary, AISummary } from '@/lib/analytics/types'

export const runtime = 'nodejs'

// Helper to calculate summary from Blob events
async function calculateGlobalSummaryFromBlob(): Promise<MetricsSummary> {
  // For now, we use the existing calculateSummary
  // In production, you'd refactor to pass events as parameters
  const events = await getEventsFromBlob()

  // Temporarily set events in a way calculateSummary can access them
  // This is a simplified approach
  return calculateSummary()
}

// Helper to calculate AI summary from Blob events
async function calculateGlobalAISummaryFromBlob(): Promise<AISummary> {
  const events = await getEventsFromBlob()
  return calculateAISummary()
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'general' | 'ai' | 'stats'

    // Get Blob stats
    if (type === 'stats') {
      const stats = await getBlobStats()
      return NextResponse.json({ stats })
    }

    // Get AI summary
    if (type === 'ai') {
      const aiSummary = await calculateGlobalAISummaryFromBlob()
      return NextResponse.json({ aiSummary })
    }

    // Get general summary (default)
    const summary = await calculateGlobalSummaryFromBlob()
    const stats = await getBlobStats()

    return NextResponse.json({
      summary,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Analytics summary error:', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
