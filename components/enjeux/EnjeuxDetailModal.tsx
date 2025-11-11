"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { getEnjeuxDetail } from "@/lib/data/enjeux-details"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EnjeuxDetailModalProps {
  isOpen: boolean
  onClose: () => void
  enjeuxId: string | null
}

export function EnjeuxDetailModal({
  isOpen,
  onClose,
  enjeuxId,
}: EnjeuxDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !enjeuxId) return null

  const enjeuDetail = getEnjeuxDetail(enjeuxId)

  if (!enjeuDetail) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-3 md:p-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 md:w-5 md:h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">{getEnjeuxIcon(enjeuxId)}</div>
            <div className="flex-1">
              <h2
                id="modal-title"
                className="font-montserrat text-3xl font-bold mb-2 dark:text-white"
              >
                {enjeuDetail.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {enjeuDetail.description}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="font-montserrat text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Points Clés
              </h3>
              <ul className="space-y-2">
                {enjeuDetail.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-600 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="font-montserrat text-xl font-semibold mb-4 dark:text-white">
                Indicateurs Clés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enjeuDetail.kpis.map((kpi, index) => {
                  const Icon = kpi.icon
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        {kpi.trend && (
                          <Badge
                            variant={
                              kpi.trend === "up"
                                ? "success"
                                : kpi.trend === "down"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {kpi.trend === "up"
                              ? "↑"
                              : kpi.trend === "down"
                                ? "↓"
                                : "→"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {kpi.label}
                      </p>
                      <p className="text-2xl font-bold dark:text-white">
                        {kpi.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            <section>
              <h3 className="font-montserrat text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Actions Mises en Place
              </h3>
              <ul className="space-y-2">
                {enjeuDetail.actions.map((action, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="font-montserrat text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Défis et Axes d&apos;Amélioration
              </h3>
              <ul className="space-y-2">
                {enjeuDetail.challenges.map((challenge, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Link href={`/dashboard?tab=${enjeuDetail.dashboardTab}`}>
              <Button className="gap-2" onClick={onClose}>
                Voir le dashboard complet
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function getEnjeuxIcon(id: string): string {
  const icons: Record<string, string> = {
    environnement: "🌍",
    social: "👥",
    gouvernance: "⚖️",
  }
  return icons[id] || "📊"
}
