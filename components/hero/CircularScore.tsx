"use client"

import { useEffect, useState } from "react"

interface CircularScoreProps {
  score: number
  maxScore?: number
  size?: number
  strokeWidth?: number
}

export function CircularScore({
  score,
  maxScore = 100,
  size = 200,
  strokeWidth = 12
}: CircularScoreProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (displayScore / maxScore) * 100
  const strokeDashoffset = circumference - (progress / 100) * circumference

  useEffect(() => {
    if (hasAnimated) return

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    const increment = score / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const newScore = Math.min(increment * currentStep, score)
      setDisplayScore(Math.round(newScore))

      if (currentStep >= steps) {
        clearInterval(timer)
        setHasAnimated(true)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [score, hasAnimated])

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "#10B981" }
    if (score >= 60) return { label: "Bon", color: "#0088CC" }
    if (score >= 40) return { label: "Moyen", color: "#F8B500" }
    return { label: "À améliorer", color: "#EF4444" }
  }

  const scoreLevel = getScoreLevel(displayScore)

  return (
    <div className="relative group">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,136,204,0.15)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,136,204,0.25)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="none"
                className="dark:stroke-gray-700"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#scoreGradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0088CC" />
                  <stop offset="100%" stopColor="#F8B500" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">
                {displayScore}
              </div>
              <div className="text-lg text-gray-500 dark:text-gray-400">
                / {maxScore}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: scoreLevel.color }}
            >
              {scoreLevel.label}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
              Score Global
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
