"use client"

import { useState, useEffect, ReactNode } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { CLAUGER_COLORS } from "@/lib/design/clauger-colors"

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  children: ReactNode
}

export function FocusMode({
  isOpen,
  onClose,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  children,
}: FocusModeProps) {
  const [showControls, setShowControls] = useState(true)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleMouseMove = () => {
    setShowControls(true)
    if (hideTimeout) clearTimeout(hideTimeout)
    const timeout = setTimeout(() => setShowControls(false), 3000)
    setHideTimeout(timeout)
  }

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setShowControls(false), 3000)
      setHideTimeout(timeout)
      return () => {
        if (timeout) clearTimeout(timeout)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: CLAUGER_COLORS.focus.background }}
      onMouseMove={handleMouseMove}
    >
      {children}

      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-opacity duration-300"
        style={{
          backgroundColor: CLAUGER_COLORS.focus.overlayBg,
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-lg transition-all flex items-center justify-center disabled:cursor-not-allowed"
          style={{
            color: '#FFFFFF',
            opacity: currentPage === 1 ? 0.3 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }
          }}
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="px-4 text-white font-medium">
          <span className="font-bold">{currentPage}</span> / {totalPages}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-lg transition-all flex items-center justify-center disabled:cursor-not-allowed"
          style={{
            color: '#FFFFFF',
            opacity: currentPage === totalPages ? 0.3 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }
          }}
          aria-label="Page suivante"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="h-6 w-px bg-white/20 mx-2" />

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg transition-all flex items-center justify-center"
          style={{ color: '#FFFFFF' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          aria-label="Quitter le mode focus (Échap)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
