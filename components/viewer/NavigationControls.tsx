"use client"

import { ChevronLeft, ChevronRight, Home, Search, ZoomIn, Maximize2, FileDown, Focus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CLAUGER_COLORS } from "@/lib/design/clauger-colors"
import { ZoomControls } from "./ZoomControls"

import type { ZoomLevel } from "@/lib/design/clauger-colors"

interface NavigationControlsProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onZoom?: () => void
  onDownloadPDF?: () => void
  onSearch?: () => void
  zoomLevel?: ZoomLevel
  onZoomIn?: () => void
  onZoomOut?: () => void
  onToggleFocus?: () => void
}

export default function NavigationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onZoom,
  onDownloadPDF,
  onSearch,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onToggleFocus,
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
        className="sticky top-0 z-40 px-3 md:px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b"
        style={{
          background: CLAUGER_COLORS.navigation.headerBg,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderColor: CLAUGER_COLORS.navigation.headerBorder,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Ligne 1: Navigation principale */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg transition-all w-10 h-10 justify-center md:w-auto md:px-3"
                style={{ color: CLAUGER_COLORS.navigation.buttonColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                  e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <Home className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">Accueil</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              style={{
                backgroundColor: CLAUGER_COLORS.tooltip.background,
                color: CLAUGER_COLORS.tooltip.text,
              }}
            >
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
                  className="w-10 h-10 rounded-lg transition-all flex items-center justify-center disabled:cursor-not-allowed"
                  style={{
                    color: CLAUGER_COLORS.navigation.buttonColor,
                    opacity: currentPage === 1 ? 0.3 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                      e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                style={{
                  backgroundColor: CLAUGER_COLORS.tooltip.background,
                  color: CLAUGER_COLORS.tooltip.text,
                }}
              >
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
                  className="w-10 h-10 rounded-lg transition-all flex items-center justify-center disabled:cursor-not-allowed"
                  style={{
                    color: CLAUGER_COLORS.navigation.buttonColor,
                    opacity: currentPage === totalPages ? 0.3 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                      e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                style={{
                  backgroundColor: CLAUGER_COLORS.tooltip.background,
                  color: CLAUGER_COLORS.tooltip.text,
                }}
              >
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
                  className="flex items-center gap-2 rounded-lg transition-all w-10 h-10 justify-center lg:w-auto lg:px-3"
                  style={{ color: CLAUGER_COLORS.navigation.buttonColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  aria-label="Rechercher dans le rapport"
                  aria-keyshortcuts="Control+K Meta+K"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden lg:inline text-sm">
                    Rechercher
                  </span>
                  <kbd
                    className="hidden lg:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-mono rounded"
                    style={{
                      backgroundColor: CLAUGER_COLORS.tooltip.kbdBackground,
                      color: CLAUGER_COLORS.tooltip.kbdText,
                    }}
                  >
                    {isMac ? '⌘' : 'Ctrl'}K
                  </kbd>
                </button>
              </TooltipTrigger>
              <TooltipContent
                style={{
                  backgroundColor: CLAUGER_COLORS.tooltip.background,
                  color: CLAUGER_COLORS.tooltip.text,
                }}
              >
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
                  className="w-10 h-10 rounded-lg transition-all flex items-center justify-center"
                  style={{ color: CLAUGER_COLORS.navigation.buttonColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  aria-label="Télécharger en PDF"
                >
                  <FileDown className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                style={{
                  backgroundColor: CLAUGER_COLORS.tooltip.background,
                  color: CLAUGER_COLORS.tooltip.text,
                }}
              >
                <p>Télécharger en PDF</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Zoom Controls */}
          {zoomLevel !== undefined && onZoomIn && onZoomOut && (
            <ZoomControls
              zoomLevel={zoomLevel}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
            />
          )}

          {/* Lightbox Zoom - Visible sur mobile */}
          {onZoom && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onZoom}
                  className="w-10 h-10 rounded-lg transition-all flex items-center justify-center"
                  style={{ color: CLAUGER_COLORS.navigation.buttonColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  aria-label="Ouvrir le zoom lightbox"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                style={{
                  backgroundColor: CLAUGER_COLORS.tooltip.background,
                  color: CLAUGER_COLORS.tooltip.text,
                }}
              >
                <p>Zoom détaillé</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Mode Focus */}
          {onToggleFocus && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleFocus}
                  className="w-10 h-10 rounded-lg transition-all flex items-center justify-center"
                  style={{ color: CLAUGER_COLORS.navigation.buttonColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  aria-label="Mode focus"
                >
                  <Focus className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                style={{
                  backgroundColor: CLAUGER_COLORS.tooltip.background,
                  color: CLAUGER_COLORS.tooltip.text,
                }}
              >
                <p>Mode focus (F)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Plein écran - Caché sur mobile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => document.documentElement.requestFullscreen()}
                className="w-10 h-10 rounded-lg transition-all hidden sm:flex items-center justify-center"
                style={{ color: CLAUGER_COLORS.navigation.buttonColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
                  e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                aria-label="Plein écran"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              style={{
                backgroundColor: CLAUGER_COLORS.tooltip.background,
                color: CLAUGER_COLORS.tooltip.text,
              }}
            >
              <p>Mode plein écran (F11)</p>
            </TooltipContent>
          </Tooltip>

          <ThemeToggle />
        </div>

        {/* Barre de progression - Desktop uniquement */}
        <div className="hidden lg:block w-full mt-2">
          <div
            className="w-full rounded-full h-2 overflow-hidden"
            style={{ backgroundColor: CLAUGER_COLORS.progress.background }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: CLAUGER_COLORS.progress.fill,
              }}
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
