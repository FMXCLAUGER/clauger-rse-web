"use client"

interface Target {
  name: string
  target: number
  actual: number
  unit: string
}

interface TargetsProgressProps {
  data: Target[]
}

export function TargetsProgress({ data }: TargetsProgressProps) {
  const getProgressColor = (actual: number, target: number) => {
    const progress = Math.abs(actual / target) * 100
    if (progress >= 90) return "bg-[#10B981]"
    if (progress >= 70) return "bg-[#F8B500]"
    return "bg-[#EF4444]"
  }

  const getProgressPercentage = (actual: number, target: number) => {
    return Math.min(Math.abs(actual / target) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {data.map((item, index) => {
        const progressPercentage = getProgressPercentage(item.actual, item.target)
        const progressColor = getProgressColor(item.actual, item.target)

        return (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#333333] dark:text-gray-100">
                {item.name}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums">
                  {item.actual > 0 ? "+" : ""}
                  {item.actual}
                  {item.unit}
                </span>
                <span className="text-sm text-[#666666] dark:text-gray-400">
                  / {item.target > 0 ? "+" : ""}
                  {item.target}
                  {item.unit}
                </span>
              </div>
            </div>
            <div className="relative w-full h-3 bg-[#E5E7EB] dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#666666] dark:text-gray-400 font-medium">
              <span>Progression: {progressPercentage.toFixed(1)}%</span>
              <span>
                {progressPercentage >= 90 ? "✓ Objectif atteint" : "En cours"}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
