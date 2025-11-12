"use client"

import { useState, useEffect, useCallback } from "react"
import type { ZoomLevel } from "@/lib/design/clauger-colors"

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

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const state: ReadingState = JSON.parse(saved)
        setSavedState(state)
      } catch (error) {
        console.error("Failed to parse reading state:", error)
      }
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    setSavedState(state)
  }, [currentPage, currentZoom, currentSidebarCollapsed])

  const clearState = useCallback(() => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
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
