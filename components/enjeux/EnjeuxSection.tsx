"use client"

import { useState } from "react"
import { ArrowRight, Leaf, Users, Scale } from "lucide-react"
import { RAPPORT_DATA } from "@/lib/constants"
import { EnjeuxDetailModal } from "./EnjeuxDetailModal"
import { CircularGauge180 } from "./CircularGauge180"

const getIconComponent = (id: string) => {
  switch (id) {
    case "environnement":
      return Leaf
    case "social":
      return Users
    case "gouvernance":
      return Scale
    default:
      return Leaf
  }
}

export function EnjeuxSection() {
  const [selectedEnjeu, setSelectedEnjeu] = useState<string | null>(null)

  return (
    <>
      <section className="py-20 bg-[#F9FAFB] dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-4 text-[#333333] dark:text-gray-100">
            Nos 3 Enjeux Durables
          </h2>
          <p className="text-center text-[#666666] dark:text-gray-400 mb-12 text-lg">
            Une démarche structurée autour de piliers clés
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {RAPPORT_DATA.enjeux.map((enjeu) => {
              const IconComponent = getIconComponent(enjeu.id)

              return (
                <div
                  key={enjeu.id}
                  className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-10 border-2 border-[rgba(0,136,204,0.1)] dark:border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,136,204,0.15)] hover:scale-[1.03] hover:border-[#0088CC] transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[320px] md:min-h-[360px] lg:min-h-[400px] flex flex-col"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(0, 136, 204, 0.05), transparent)`,
                  }}
                >
                  <div className="flex items-center justify-center mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl p-4 shadow-lg group-hover:rotate-[5deg] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${enjeu.colorHex}, ${enjeu.accentColorHex})`,
                        boxShadow: `0 4px 12px ${enjeu.colorHex}4D`,
                      }}
                    >
                      <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h3 className="font-montserrat text-2xl font-bold mb-3 text-center text-[#333333] dark:text-gray-100">
                    {enjeu.title}
                  </h3>

                  <p className="text-[#666666] dark:text-gray-400 mb-6 text-[15px] leading-[1.6] text-center flex-grow">
                    {enjeu.subtitle}
                  </p>

                  <div className="flex flex-col items-center gap-6 mt-auto">
                    <CircularGauge180 value={enjeu.note} maxValue={10} size={140} strokeWidth={8} />

                    <button
                      onClick={() => setSelectedEnjeu(enjeu.id)}
                      className="group/btn w-full flex items-center justify-center gap-2 px-6 py-2.5 text-[#0088CC] border-2 border-[#0088CC] rounded-lg hover:bg-[#0088CC] hover:text-white hover:translate-x-1 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#0088CC] focus-visible:ring-offset-2"
                    >
                      <span className="font-medium">En savoir plus</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )
            })}
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
