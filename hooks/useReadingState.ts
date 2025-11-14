"use client"

import { useState, useEffect, useCallback } from "react"
import type { ZoomLevel } from "@/lib/design/clauger-colors"
import { logStorageError } from "@/lib/security/logger-helpers"

interface ReadingState {
  lastPage: number
  zoomLevel: ZoomLevel
  sidebarCollapsed: boolean
  timestamp: number
}

const STORAGE_KEY = "clauger-reading-state"

export function useReadingState(currentPage: number, currentZoom: ZoomLevel, currentSidebarCollapsed: boolean) {
  const [savedState, setSavedState] = useState<ReadingState | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const state: ReadingState = JSON.parse(saved)
          setSavedState(state)
        } catch (error) {
          logStorageError('parse', error, 'readingState')
        }
      }
    } catch (error) {
      logStorageError('load', error, 'readingState')
    }
  }, [])

  const saveState = useCallback((page?: number, zoom?: ZoomLevel, sidebarCollapsed?: boolean) => {
    if (typeof window === "undefined") return

    const state: ReadingState = {
      lastPage: page ?? currentPage,
      zoomLevel: zoom ?? currentZoom,
      sidebarCollapsed: sidebarCollapsed ?? currentSidebarCollapsed,
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      setSavedState(state)
    } catch (error) {
      logStorageError('save', error, 'readingState')
    }
  }, [currentPage, currentZoom, currentSidebarCollapsed])

  const clearState = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      logStorageError('clear', error, 'readingState')
    }
    setSavedState(null)
  }, [])

  const hasResumePoint = savedState !== null && savedState.lastPage > 1

  return {
    savedState,
    saveState,
    clearState,
    hasResumePoint,
  }
}
