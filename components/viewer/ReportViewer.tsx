"use client"

import { useCallback, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import { PAGES, TOTAL_PAGES } from "@/lib/constants"
import NavigationControls from "./NavigationControls"
import ThumbnailSidebar from "./ThumbnailSidebar"
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation"

interface ReportViewerProps {
  initialPage: number
}

export default function ReportViewer({ initialPage }: ReportViewerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = parseInt(searchParams.get("page") || String(initialPage), 10)
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
    <div className="flex h-full bg-gray-100">
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
        />

        <div className="flex-1 relative bg-gray-200 p-4 md:p-8 overflow-auto">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-full max-h-full">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={1200}
                height={1600}
                className="w-auto h-auto max-w-full max-h-[calc(100vh-200px)] object-contain shadow-2xl"
                priority={currentPage <= 2}
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
