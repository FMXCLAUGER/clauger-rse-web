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
  trend?: {
    value: number
    label: string
  }
}

export function KeyFigureCard({
  icon: Icon,
  title,
  value,
  unit,
  delay = 0,
  sparklineData,
  formatter = (val) => val.toLocaleString('fr-FR'),
  trend,
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

  const trendColor = trend
    ? trend.value > 0
      ? "text-success"
      : trend.value < 0
      ? "text-danger"
      : "text-text-light"
    : undefined

  return (
    <article
      ref={ref}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-[#E5E7EB] dark:border-gray-700 p-6",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:border-[#0088CC] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)]",
        "focus-within:ring-3 focus-within:ring-primary focus-within:ring-offset-2",
        "opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      }}
      aria-label={`${title}: ${formatter(value)}${unit || ""}`}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div
          className="relative w-12 h-12 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-[#0088CC] to-[#F8B500]
            transition-transform duration-500 ease-out
            group-hover:rotate-[360deg] group-hover:scale-110"
          aria-hidden="true"
        >
          <Icon className="w-6 h-6 text-white drop-shadow-sm" strokeWidth={2.5} />
        </div>

        <div className="space-y-2 w-full">
          <h3 className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
            {title}
          </h3>

          <div className="flex items-baseline justify-center gap-1.5">
            <span
              className="text-[2.5rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none"
              aria-live="polite"
            >
              {formatter(displayValue)}
            </span>
            {unit && (
              <span className="text-base font-medium text-[#666666] dark:text-gray-400">
                {unit}
              </span>
            )}
          </div>

          {trend && (
            <div className={cn("text-sm font-medium", trendColor)} aria-label={trend.label}>
              {trend.value > 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-full h-[60px] mt-1" role="img" aria-label={`Tendance de ${title}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0088CC" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0088CC" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0088CC"
                  strokeWidth={2.5}
                  dot={false}
                  fill={`url(#gradient-${title.replace(/\s+/g, "-")})`}
                  fillOpacity={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </article>
  )
}
