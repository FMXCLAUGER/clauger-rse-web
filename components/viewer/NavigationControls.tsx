"use client"

import { ChevronLeft, ChevronRight, Home, Search, ZoomIn, Maximize2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

interface NavigationControlsProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onZoom?: () => void
  onSearch?: () => void
}

export default function NavigationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onZoom,
  onSearch,
}: NavigationControlsProps) {
  const progress = (currentPage / totalPages) * 100
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  return (
    <header
      role="navigation"
      aria-label="Navigation du rapport"
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="hidden md:inline text-sm font-medium">Accueil</span>
        </Link>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>

          <div className="text-sm font-medium min-w-[100px] text-center text-gray-900 dark:text-gray-100">
            Page <span className="text-primary dark:text-primary/90 font-bold">{currentPage}</span> / {totalPages}
          </div>

          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary dark:bg-primary/90 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentPage}
            aria-valuemin={1}
            aria-valuemax={totalPages}
            aria-label={`Progression: page ${currentPage} sur ${totalPages}`}
          />
        </div>

        {onSearch && (
          <button
            onClick={onSearch}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            aria-label="Rechercher dans le rapport"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="hidden lg:inline text-sm text-gray-600 dark:text-gray-300">
              Rechercher
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
              {isMac ? '⌘' : 'Ctrl'}K
            </kbd>
          </button>
        )}

        <ThemeToggle />

        {onZoom && (
          <button
            onClick={onZoom}
            className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Agrandir l'image"
          >
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        )}

        <button
          onClick={() => document.documentElement.requestFullscreen()}
          className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Plein écran"
        >
          <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>
    </header>
  )
}
