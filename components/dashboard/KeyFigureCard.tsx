"use client"

import { useEffect, useState } from "react"
import { LucideIcon } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"
import { cn } from "@/lib/utils"

interface KeyFigureCardProps {
  icon: LucideIcon
  title: string
  value: number
  unit?: string
  delay?: number
  sparklineData?: { value: number }[]
  formatter?: (value: number) => string
}

export function KeyFigureCard({
  icon: Icon,
  title,
  value,
  unit,
  delay = 0,
  sparklineData,
  formatter = (val) => val.toLocaleString(),
}: KeyFigureCardProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 })
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!isVisible || hasAnimated) return

    const duration = 1500
    const steps = 60
    const stepDuration = duration / steps
    const increment = value / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const newValue = Math.min(increment * currentStep, value)
      setDisplayValue(Math.round(newValue))

      if (currentStep >= steps) {
        clearInterval(timer)
        setHasAnimated(true)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, isVisible, hasAnimated])

  return (
    <div
      ref={ref}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:-translate-y-2 hover:border-[#0088CC] hover:shadow-[0_12px_32px_rgba(0,136,204,0.2)]",
        "opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center
            bg-gradient-to-br from-[#0088CC] to-[#F8B500]
            transition-transform duration-[600ms] ease-out
            group-hover:rotate-[360deg]"
        >
          <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#0088CC]" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-semibold text-[#333333] dark:text-gray-300">
            {title}
          </div>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-[#0088CC] dark:text-[#0099DD]">
              {formatter(displayValue)}
            </span>
            {unit && (
              <span className="text-lg text-[#666666] dark:text-gray-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-full h-[60px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0088CC" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0088CC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0088CC"
                  strokeWidth={2}
                  dot={false}
                  fill={`url(#gradient-${title})`}
                  fillOpacity={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
