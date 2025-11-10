"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Page {
  id: number
  src: string
  alt: string
  title: string
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

  if (isCollapsed) {
    return (
      <div className="bg-white border-r border-gray-200 flex flex-col items-center py-4 w-12">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Ouvrir le panneau des miniatures"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <aside className="bg-white border-r border-gray-200 w-56 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold">Pages</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Masquer le panneau"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pages.map((page) => {
          const isActive = page.id === currentPage
          const isNearby = Math.abs(page.id - currentPage) <= 3

          return (
            <button
              key={page.id}
              onClick={() => onSelectPage(page.id)}
              className={`
                w-full group relative rounded-lg overflow-hidden transition-all
                ${isActive ? "ring-2 ring-primary shadow-lg scale-105" : "hover:ring-2 hover:ring-gray-300"}
              `}
            >
              <div className="relative aspect-[3/4] bg-gray-100">
                <Image
                  src={page.src}
                  alt={page.alt}
                  fill
                  sizes="200px"
                  className="object-cover"
                  loading={isNearby ? "eager" : "lazy"}
                  quality={50}
                />
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </div>

              <div
                className={`
                  absolute bottom-0 left-0 right-0 p-2 text-xs font-medium text-center
                  ${isActive ? "bg-primary text-white" : "bg-white/90 text-gray-700"}
                `}
              >
                {page.id}
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
