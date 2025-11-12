"use client"

import { CLAUGER_COLORS } from "@/lib/design/clauger-colors"

export function ResumeBadge() {
  return (
    <div
      className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold z-10 animate-pulse"
      style={{
        backgroundColor: CLAUGER_COLORS.resume.background,
        color: CLAUGER_COLORS.resume.text,
        animationDuration: '2s',
      }}
    >
      Reprendre
    </div>
  )
}
