"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { RAPPORT_DATA } from "@/lib/constants"
import { EnjeuxDetailModal } from "./EnjeuxDetailModal"

export function EnjeuxSection() {
  const [selectedEnjeu, setSelectedEnjeu] = useState<string | null>(null)

  return (
    <>
      <section className="py-20 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
            Nos 3 Enjeux Durables
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Une démarche structurée autour de piliers clés
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {RAPPORT_DATA.enjeux.map((enjeu) => (
              <div
                key={enjeu.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div
                  className={`w-20 h-20 ${enjeu.color} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}
                >
                  {enjeu.icon}
                </div>

                <h3 className="font-montserrat text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                  {enjeu.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {enjeu.subtitle}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-3xl font-bold text-primary dark:text-primary/90">
                      {enjeu.note}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Note / 10
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEnjeu(enjeu.id)}
                    className="text-sm text-primary dark:text-primary/90 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    En savoir plus
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnjeuxDetailModal
        isOpen={selectedEnjeu !== null}
        onClose={() => setSelectedEnjeu(null)}
        enjeuxId={selectedEnjeu}
      />
    </>
  )
}
