"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { CLAUGER_COLORS } from "@/lib/design/clauger-colors"
import { ProgressBar } from "./ProgressBar"
import { ResumeBadge } from "./ResumeBadge"

interface Page {
  id: number
  src: string
  alt: string
  title: string
  blurDataURL?: string
  width?: number
  height?: number
}

interface ThumbnailSidebarProps {
  pages: Page[]
  currentPage: number
  onSelectPage: (page: number) => void
  resumePageId?: number | null
}

export default function ThumbnailSidebar({
  pages,
  currentPage,
  onSelectPage,
  resumePageId,
}: ThumbnailSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sur mobile, fermer la sidebar après sélection
  const handleSelectPage = (page: number) => {
    onSelectPage(page)
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  // Bouton hamburger flottant pour mobile
  if (isMobile && !isMobileOpen) {
    return (
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-20 left-4 z-40 p-4 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg transition-all active:scale-95"
        aria-label="Ouvrir le menu des pages"
      >
        <Menu className="w-6 h-6" />
      </button>
    )
  }

  // Overlay pour mobile
  const overlay = isMobile && isMobileOpen && (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
      onClick={() => setIsMobileOpen(false)}
      aria-hidden="true"
    />
  )

  // Bouton collapse pour desktop uniquement
  if (isCollapsed && !isMobile) {
    return (
      <div
        className="flex flex-col items-center py-4 w-14 border-r"
        style={{
          backgroundColor: CLAUGER_COLORS.sidebar.background,
          borderColor: CLAUGER_COLORS.sidebar.border,
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg transition-all"
          style={{
            color: CLAUGER_COLORS.navigation.buttonColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
            e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
          }}
          aria-label="Ouvrir le panneau des miniatures"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <>
      {overlay}
      <aside
        className={`
          flex flex-col z-50 border-r transition-all duration-300 ease-in-out
          ${isMobile
            ? 'fixed inset-y-0 left-0 transform' + (isMobileOpen ? ' translate-x-0' : ' -translate-x-full')
            : ''
          }
        `}
        style={{
          backgroundColor: CLAUGER_COLORS.sidebar.background,
          borderColor: CLAUGER_COLORS.sidebar.border,
          width: isMobile ? '320px' : '280px',
        }}
        aria-label="Miniatures des pages"
      >
        <ProgressBar currentPage={currentPage} totalPages={pages.length} />

        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: CLAUGER_COLORS.sidebar.border }}
        >
          <h2 className="text-sm font-semibold" style={{ color: CLAUGER_COLORS.navigation.buttonColor }}>
            Pages
          </h2>
          <button
            onClick={() => isMobile ? setIsMobileOpen(false) : setIsCollapsed(true)}
            className="p-2 rounded-lg transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{
              color: CLAUGER_COLORS.navigation.buttonColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = CLAUGER_COLORS.navigation.buttonBgHover
              e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColorHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = CLAUGER_COLORS.navigation.buttonColor
            }}
            aria-label={isMobile ? "Fermer le menu" : "Masquer le panneau"}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-3" role="navigation" aria-label="Pages du rapport">
          {pages.map((page) => {
            const isActive = page.id === currentPage
            const isNearby = Math.abs(page.id - currentPage) <= 3
            const isResumePage = resumePageId && page.id === resumePageId && page.id !== currentPage

            return (
              <button
                key={page.id}
                onClick={() => handleSelectPage(page.id)}
                className="w-full group relative overflow-hidden transition-all duration-200 min-h-[48px]"
                style={{
                  border: `2px solid ${isActive ? CLAUGER_COLORS.thumbnail.borderActive : 'transparent'}`,
                  borderRadius: '8px',
                  backgroundColor: isActive ? CLAUGER_COLORS.thumbnail.backgroundActive : 'transparent',
                  boxShadow: isActive
                    ? `0 0 0 4px ${CLAUGER_COLORS.thumbnail.shadowActive}`
                    : 'none',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = CLAUGER_COLORS.thumbnail.borderHover
                    e.currentTarget.style.boxShadow = `0 4px 12px ${CLAUGER_COLORS.thumbnail.shadowHover}`
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
                aria-label={`Aller à la page ${page.id}`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  <Image
                    src={page.src}
                    alt={`Miniature de la page ${page.id}`}
                    fill
                    sizes="(max-width: 768px) 320px, 280px"
                    className="object-cover"
                    loading={isNearby ? "eager" : "lazy"}
                    quality={50}
                    placeholder={page.blurDataURL ? "blur" : "empty"}
                    blurDataURL={page.blurDataURL}
                  />
                  {isResumePage && <ResumeBadge />}
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 p-2 text-xs font-medium text-center"
                  style={{
                    backgroundColor: isActive ? CLAUGER_COLORS.interactive.primary : 'rgba(255, 255, 255, 0.9)',
                    color: isActive ? '#FFFFFF' : CLAUGER_COLORS.navigation.buttonColor,
                  }}
                >
                  {page.id}
                </div>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
