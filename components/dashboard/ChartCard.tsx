"use client"

import { ReactNode } from "react"
import { Download } from "lucide-react"
import { ChartSkeleton } from "./ChartSkeleton"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  onExport?: () => void
  className?: string
  isLoading?: boolean
  loadingHeight?: number
}

export function ChartCard({
  title,
  description,
  icon,
  children,
  onExport,
  className = "",
  isLoading = false,
  loadingHeight = 300,
}: ChartCardProps) {
  return (
    <article
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-[#E5E7EB] dark:border-gray-700",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        "hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all duration-300",
        "overflow-hidden h-full flex flex-col",
        className
      )}
    >
      <header className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                <div className="text-white">{icon}</div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[#333333] dark:text-gray-100 leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-[#666666] dark:text-gray-400 mt-1.5 leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>
          {onExport && !isLoading && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#666666] dark:text-gray-400 hover:text-primary dark:hover:text-primary/90 hover:bg-[#F0F9FF] dark:hover:bg-gray-900 rounded-lg transition-all ml-2 flex-shrink-0"
              aria-label="Exporter le graphique"
            >
              <Download className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </header>
      <div className="px-6 pb-6 pt-2 flex-1">
        {isLoading ? <ChartSkeleton height={loadingHeight} /> : children}
      </div>
    </article>
  )
}
