"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import { useSwipeable } from "react-swipeable"
import { PAGES, TOTAL_PAGES } from "@/lib/constants"
import { reportPageSchema } from "@/lib/validations/searchParams"
import NavigationControls from "./NavigationControls"
import ThumbnailSidebar from "./ThumbnailSidebar"
import ImageLightbox from "@/components/lightbox/ImageLightbox"
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation"
import { toast } from "sonner"

interface ReportViewerProps {
  initialPage: number
}

export default function ReportViewer({ initialPage }: ReportViewerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const pageParam = searchParams.get("page")
  const result = reportPageSchema.safeParse({ page: pageParam || String(initialPage) })
  const currentPage = result.success ? result.data.page : initialPage
  const currentImage = PAGES[currentPage - 1]

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > TOTAL_PAGES) return
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(page))
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const nextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES) goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  useKeyboardNavigation(prevPage, nextPage)

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPage < TOTAL_PAGES) {
        nextPage()
        toast.success(`Page ${currentPage + 1}/${TOTAL_PAGES}`, {
          duration: 1000,
          position: 'bottom-center',
        })
      } else {
        toast.info('Dernière page', {
          duration: 800,
          position: 'bottom-center',
        })
      }
    },
    onSwipedRight: () => {
      if (currentPage > 1) {
        prevPage()
        toast.success(`Page ${currentPage - 1}/${TOTAL_PAGES}`, {
          duration: 1000,
          position: 'bottom-center',
        })
      } else {
        toast.info('Première page', {
          duration: 800,
          position: 'bottom-center',
        })
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 30,
    preventScrollOnSwipe: true,
    swipeDuration: 500,
  })

  useEffect(() => {
    const adjacentPages = [currentPage - 1, currentPage + 1].filter(
      (p) => p >= 1 && p <= TOTAL_PAGES
    )

    adjacentPages.forEach((page) => {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.as = "image"
      link.href = PAGES[page - 1].src
      document.head.appendChild(link)
    })
  }, [currentPage])

  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-950">
      <ThumbnailSidebar
        pages={PAGES}
        currentPage={currentPage}
        onSelectPage={goToPage}
      />

      <div className="flex-1 flex flex-col">
        <NavigationControls
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          onPrev={prevPage}
          onNext={nextPage}
          onZoom={() => setLightboxOpen(true)}
          onSearch={() => {
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: true,
              ctrlKey: true,
              bubbles: true
            })
            document.dispatchEvent(event)
          }}
        />

        <main id="main-content" className="flex-1 relative bg-gray-200 dark:bg-gray-900 p-4 md:p-8 overflow-auto">
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            Page {currentPage} sur {TOTAL_PAGES}
          </div>

          <div {...swipeHandlers} className="relative w-full h-full flex items-center justify-center touch-pan-y">
            <div className="relative max-w-full max-h-full">
              <button
                onClick={() => setLightboxOpen(true)}
                className="relative block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                aria-label="Agrandir l'image"
              >
                <Image
                  src={currentImage.src}
                  alt={`Page ${currentPage} du rapport RSE Clauger 2025`}
                  width={currentImage.width || 1200}
                  height={currentImage.height || 1600}
                  className="w-auto h-auto max-w-full max-h-[calc(100vh-200px)] object-contain shadow-2xl dark:shadow-gray-800 cursor-zoom-in"
                  priority={currentPage <= 2}
                  quality={85}
                  placeholder={currentImage.blurDataURL ? "blur" : "empty"}
                  blurDataURL={currentImage.blurDataURL}
                />
              </button>
            </div>
          </div>
        </main>
      </div>

      <ImageLightbox
        slides={PAGES.map((page) => ({
          src: page.src,
          alt: page.alt,
          width: page.width,
          height: page.height,
          blurDataURL: page.blurDataURL,
        }))}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        index={currentPage - 1}
      />
    </div>
  )
}
