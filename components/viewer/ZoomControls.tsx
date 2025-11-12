"use client"

import { ZoomOut, ZoomIn } from "lucide-react"
import { CLAUGER_COLORS, ZOOM_LEVELS, type ZoomLevel } from "@/lib/design/clauger-colors"

interface ZoomControlsProps {
  zoomLevel: ZoomLevel
  onZoomIn: () => void
  onZoomOut: () => void
}

export function ZoomControls({ zoomLevel, onZoomIn, onZoomOut }: ZoomControlsProps) {
  const canZoomIn = zoomLevel < ZOOM_LEVELS[ZOOM_LEVELS.length - 1]
  const canZoomOut = zoomLevel > ZOOM_LEVELS[0]

  return (
    <div className="flex items-center gap-1 border rounded-lg overflow-hidden" style={{ borderColor: CLAUGER_COLORS.sidebar.border }}>
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className="w-8 h-8 flex items-center justify-center transition-all disabled:cursor-not-allowed"
        style={{
          color: CLAUGER_COLORS.navigation.buttonColor,
          opacity: canZoomOut ? 1 : 0.3,
        }}
        onMouseEnter={(e) => {
          if (canZoomOut) {
            e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
            e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
          }
        }}
        onMouseLeave={(e) => {
          if (canZoomOut) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
          }
        }}
        aria-label="Zoom arrière"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div
        className="px-3 text-sm font-semibold min-w-[50px] text-center"
        style={{ color: CLAUGER_COLORS.interactive.primary }}
      >
        {zoomLevel}%
      </div>

      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className="w-8 h-8 flex items-center justify-center transition-all disabled:cursor-not-allowed"
        style={{
          color: CLAUGER_COLORS.navigation.buttonColor,
          opacity: canZoomIn ? 1 : 0.3,
        }}
        onMouseEnter={(e) => {
          if (canZoomIn) {
            e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
            e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
          }
        }}
        onMouseLeave={(e) => {
          if (canZoomIn) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
          }
        }}
        aria-label="Zoom avant"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  )
}
