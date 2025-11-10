"use client"

import { ChevronLeft, ChevronRight, Home, Maximize2 } from "lucide-react"
import Link from "next/link"

interface NavigationControlsProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export default function NavigationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: NavigationControlsProps) {
  const progress = (currentPage / totalPages) * 100

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="hidden md:inline text-sm font-medium">Accueil</span>
        </Link>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-sm font-medium min-w-[100px] text-center">
            Page <span className="text-primary font-bold">{currentPage}</span> / {totalPages}
          </div>

          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={() => document.documentElement.requestFullscreen()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Plein écran"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
