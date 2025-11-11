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
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreLabel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "Excellent"
    if (percentage >= 75) return "Bon"
    if (percentage >= 50) return "Moyen"
    return "À améliorer"
  }

  return (
    <div className="space-y-6">
      {data.map((item, index) => {
        const percentage = (item.score / item.maxScore) * 100
        const scoreColor = getScoreColor(item.score, item.maxScore)
        const scoreLabel = getScoreLabel(item.score, item.maxScore)

        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.area}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary dark:text-primary/90">
                  {item.score}/{item.maxScore}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                    percentage >= 90
                      ? "bg-green-500"
                      : percentage >= 75
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                >
                  {scoreLabel}
                </span>
              </div>
            </div>
            <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${scoreColor} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Conformité: {percentage.toFixed(1)}%
            </div>
          </div>
        )
      })}
    </div>
  )
}
