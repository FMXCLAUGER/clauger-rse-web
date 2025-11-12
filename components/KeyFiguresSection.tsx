"use client"

import { Users, Award, Leaf, GraduationCap } from "lucide-react"
import { KeyFigureCard } from "./dashboard/KeyFigureCard"

interface KeyFiguresSectionProps {
  kpis: {
    collaborateurs: number
    experienceAnnees: number
    emissionsCarbone: number
    budgetFormation: number
    trends: {
      collaborateurs: { value: number }[]
      experienceAnnees: { value: number }[]
      emissionsCarbone: { value: number }[]
      budgetFormation: { value: number }[]
    }
  }
}

export function KeyFiguresSection({ kpis }: KeyFiguresSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      <KeyFigureCard
        icon={Users}
        title="Collaborateurs"
        value={kpis.collaborateurs}
        unit="+"
        delay={0}
        sparklineData={kpis.trends.collaborateurs}
        formatter={(val) => val.toLocaleString()}
      />

      <KeyFigureCard
        icon={Award}
        title="Années d'expérience"
        value={kpis.experienceAnnees}
        unit="+"
        delay={100}
        sparklineData={kpis.trends.experienceAnnees}
      />

      <KeyFigureCard
        icon={Leaf}
        title="teqCO₂ (Bilan carbone)"
        value={kpis.emissionsCarbone}
        unit="k"
        delay={200}
        sparklineData={kpis.trends.emissionsCarbone}
        formatter={(val) => (val / 1000).toFixed(0)}
      />

      <KeyFigureCard
        icon={GraduationCap}
        title="Budget formation"
        value={kpis.budgetFormation}
        unit="k€"
        delay={300}
        sparklineData={kpis.trends.budgetFormation}
        formatter={(val) => (val / 1000).toFixed(0)}
      />
    </div>
  )
}
