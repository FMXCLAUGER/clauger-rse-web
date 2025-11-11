"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Download } from "lucide-react"
import { ChartSkeleton } from "./ChartSkeleton"

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
    <Card className={`${className} hover:shadow-lg transition-shadow`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="text-primary dark:text-primary/90">{icon}</div>}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {onExport && !isLoading && (
            <button
              type="button"
              onClick={onExport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Exporter le graphique"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <ChartSkeleton height={loadingHeight} /> : children}
      </CardContent>
    </Card>
  )
}
