"use client"

import { CLAUGER_COLORS } from "@/lib/design/clauger-colors"

interface ProgressBarProps {
  currentPage: number
  totalPages: number
}

export function ProgressBar({ currentPage, totalPages }: ProgressBarProps) {
  const percentage = Math.round((currentPage / totalPages) * 100)
  const progressHeight = `${percentage}%`

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: CLAUGER_COLORS.sidebar.border }}>
      <div className="flex items-center gap-3">
        <div
          className="relative w-1 h-12 rounded-full overflow-hidden"
          style={{ backgroundColor: CLAUGER_COLORS.progress.background }}
        >
          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-300 ease-out"
            style={{
              height: progressHeight,
              background: `linear-gradient(to top, ${CLAUGER_COLORS.progress.gradientEnd}, ${CLAUGER_COLORS.progress.gradientStart})`,
            }}
          />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: CLAUGER_COLORS.progress.text }}>
            Page {currentPage}/{totalPages}
          </p>
          <p className="text-xs" style={{ color: CLAUGER_COLORS.progress.text }}>
            {percentage}%
          </p>
        </div>
      </div>
    </div>
  )
}
