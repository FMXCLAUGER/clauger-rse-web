"use client"

import { ChevronLeft, ChevronRight, Home, Search, ZoomIn, Maximize2, FileDown } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavigationControlsProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onZoom?: () => void
  onDownloadPDF?: () => void
  onSearch?: () => void
}

export default function NavigationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onZoom,
  onDownloadPDF,
  onSearch,
}: NavigationControlsProps) {
  const progress = (currentPage / totalPages) * 100
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  return (
    <TooltipProvider>
      <header
        role="navigation"
        aria-label="Navigation du rapport"
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 md:px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm"
      >
        {/* Ligne 1: Navigation principale */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="flex items-center gap-2 text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition-colors min-w-[48px] min-h-[48px] p-3"
              >
                <Home className="w-6 h-6" />
                <span className="hidden md:inline text-sm font-medium">Accueil</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retour à la page d'accueil</p>
            </TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />

          <div className="flex items-center gap-2 md:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onPrev}
                  disabled={currentPage === 1}
                  className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Page précédente (←)</p>
              </TooltipContent>
            </Tooltip>

            <div className="text-sm font-medium min-w-[80px] sm:min-w-[100px] text-center text-gray-900 dark:text-gray-100 px-2">
              <span className="text-primary dark:text-primary/90 font-bold">{currentPage}</span>
              <span className="hidden xs:inline"> / {totalPages}</span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onNext}
                  disabled={currentPage === totalPages}
                  className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Page suivante (→)</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </div>

        {/* Ligne 2: Contrôles secondaires (responsive) */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Recherche - Visible sur mobile */}
          {onSearch && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onSearch}
                  className="flex items-center gap-2 px-4 py-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[48px] min-h-[48px]"
                  aria-label="Rechercher dans le rapport"
                  aria-keyshortcuts="Control+K Meta+K"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="hidden lg:inline text-sm text-gray-600 dark:text-gray-300">
                    Rechercher
                  </span>
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    {isMac ? '⌘' : 'Ctrl'}K
                  </kbd>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rechercher ({isMac ? '⌘' : 'Ctrl'}+K)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Télécharger PDF */}
          {onDownloadPDF && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDownloadPDF}
                  className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                  aria-label="Télécharger en PDF"
                >
                  <FileDown className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Télécharger en PDF</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Zoom - Visible sur mobile */}
          {onZoom && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onZoom}
                  className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                  aria-label="Agrandir l'image"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Agrandir l'image</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Plein écran - Caché sur mobile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => document.documentElement.requestFullscreen()}
                className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[48px] min-h-[48px] hidden sm:flex items-center justify-center"
                aria-label="Plein écran"
              >
                <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mode plein écran (F11)</p>
            </TooltipContent>
          </Tooltip>

          <ThemeToggle />
        </div>

        {/* Barre de progression - Desktop uniquement */}
        <div className="hidden lg:block w-full mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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
        </div>
      </header>
    </TooltipProvider>
  )
}
