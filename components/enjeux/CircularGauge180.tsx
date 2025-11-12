"use client"

import { useEffect, useState, useRef } from "react"

interface CircularGauge180Props {
  value: number
  maxValue?: number
  size?: number
  strokeWidth?: number
  animated?: boolean
}

export function CircularGauge180({
  value,
  maxValue = 10,
  size = 140,
  strokeWidth = 8,
  animated = true
}: CircularGauge180Props) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const gaugeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    const currentRef = gaugeRef.current

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [animated, hasAnimated, value])

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
      setDisplayValue(Number(newValue.toFixed(1)))

      if (currentStep >= steps) {
        clearInterval(timer)
        setHasAnimated(true)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, value, hasAnimated])

  const getScoreColor = (score: number): string => {
    if (score < 5) return "#EF4444"
    if (score < 7) return "#F8B500"
    return "#10B981"
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.5
  const percentage = (displayValue / maxValue) * 100
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength

  const scoreColor = getScoreColor(displayValue)

  return (
    <div ref={gaugeRef} className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size / 2 + strokeWidth + 10}
        className="overflow-visible"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(180 ${size / 2} ${size / 2})`}
          className="dark:stroke-gray-700"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(180 ${size / 2} ${size / 2})`}
          className="transition-all duration-[1500ms] ease-out"
          style={{
            transition: animated ? "stroke-dashoffset 1.5s ease-out, stroke 0.3s ease" : "none"
          }}
        />
      </svg>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <div
          className="text-5xl font-bold tabular-nums"
          style={{ color: scoreColor }}
        >
          {displayValue.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
          / {maxValue}
        </div>
      </div>
    </div>
  )
}
