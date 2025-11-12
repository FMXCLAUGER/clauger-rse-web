"use client"

interface ComplianceItem {
  area: string
  score: number
  maxScore: number
}

interface ComplianceScoreProps {
  data: ComplianceItem[]
}

export function ComplianceScore({ data }: ComplianceScoreProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "bg-[#10B981]"
    if (percentage >= 75) return "bg-[#F8B500]"
    return "bg-[#EF4444]"
  }

  const getScoreLabel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "Excellent"
    if (percentage >= 75) return "Bon"
    if (percentage >= 50) return "Moyen"
    return "À améliorer"
  }

  const getBadgeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "bg-[#10B981]"
    if (percentage >= 75) return "bg-[#F8B500]"
    return "bg-[#EF4444]"
  }

  return (
    <div className="space-y-6">
      {data.map((item, index) => {
        const percentage = (item.score / item.maxScore) * 100
        const scoreColor = getScoreColor(item.score, item.maxScore)
        const scoreLabel = getScoreLabel(item.score, item.maxScore)
        const badgeColor = getBadgeColor(item.score, item.maxScore)

        return (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#333333] dark:text-gray-100">
                {item.area}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums">
                  {item.score}/{item.maxScore}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${badgeColor}`}
                >
                  {scoreLabel}
                </span>
              </div>
            </div>
            <div className="relative w-full h-3 bg-[#E5E7EB] dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${scoreColor} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-[#666666] dark:text-gray-400 font-medium">
              Conformité: {percentage.toFixed(1)}%
            </div>
          </div>
        )
      })}
    </div>
  )
}
