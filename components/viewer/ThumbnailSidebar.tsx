"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"

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
}

export default function ThumbnailSidebar({
  pages,
  currentPage,
  onSelectPage,
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
      <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 w-14">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Ouvrir le panneau des miniatures"
        >
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
      </div>
    )
  }

  return (
    <>
      {overlay}
      <aside
        className={`
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isMobile
            ? 'fixed inset-y-0 left-0 w-80 transform' + (isMobileOpen ? ' translate-x-0' : ' -translate-x-full')
            : 'w-56'
          }
        `}
        aria-label="Miniatures des pages"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pages</h2>
          <button
            onClick={() => isMobile ? setIsMobileOpen(false) : setIsCollapsed(true)}
            className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label={isMobile ? "Fermer le menu" : "Masquer le panneau"}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-3" role="navigation" aria-label="Pages du rapport">
          {pages.map((page) => {
            const isActive = page.id === currentPage
            const isNearby = Math.abs(page.id - currentPage) <= 3

            return (
              <button
                key={page.id}
                onClick={() => handleSelectPage(page.id)}
                className={`
                  w-full group relative rounded-lg overflow-hidden transition-all min-h-[48px]
                  ${isActive ? "ring-2 ring-primary dark:ring-primary/90 shadow-lg scale-105" : "hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600"}
                `}
                aria-label={`Aller à la page ${page.id}`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={page.src}
                    alt={`Miniature de la page ${page.id}`}
                    fill
                    sizes="(max-width: 768px) 320px, 200px"
                    className="object-cover"
                    loading={isNearby ? "eager" : "lazy"}
                    quality={50}
                    placeholder={page.blurDataURL ? "blur" : "empty"}
                    blurDataURL={page.blurDataURL}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20" />
                  )}
                </div>

                <div
                  className={`
                    absolute bottom-0 left-0 right-0 p-2 text-xs font-medium text-center
                    ${isActive ? "bg-primary dark:bg-primary/90 text-white" : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200"}
                  `}
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
