"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Leaf, Users, Scale, TrendingUp, Download } from "lucide-react"
import { ChartCard } from "@/components/dashboard/ChartCard"
import { EmissionsChart } from "@/components/dashboard/charts/EmissionsChart"
import { EnergyChart } from "@/components/dashboard/charts/EnergyChart"
import { WasteChart } from "@/components/dashboard/charts/WasteChart"
import { TargetsProgress } from "@/components/dashboard/charts/TargetsProgress"
import { WorkforceChart } from "@/components/dashboard/charts/WorkforceChart"
import { AgeDistributionChart } from "@/components/dashboard/charts/AgeDistributionChart"
import { TrainingChart } from "@/components/dashboard/charts/TrainingChart"
import { AccidentsChart } from "@/components/dashboard/charts/AccidentsChart"
import { BoardCompositionChart } from "@/components/dashboard/charts/BoardCompositionChart"
import { BudgetChart } from "@/components/dashboard/charts/BudgetChart"
import { ComplianceScore } from "@/components/dashboard/charts/ComplianceScore"
import { ExportModal } from "@/components/export/ExportModal"
import {
  environmentData,
  socialData,
  governanceData,
  formatNumber,
  formatCurrency,
} from "@/lib/data/rse-data"

type Tab = "environment" | "social" | "governance"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("environment")
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const tabs = [
    { id: "environment" as Tab, label: "Environnement", icon: Leaf, color: "text-green-600" },
    { id: "social" as Tab, label: "Social", icon: Users, color: "text-blue-600" },
    { id: "governance" as Tab, label: "Gouvernance", icon: Scale, color: "text-purple-600" },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950">
      <div className="container mx-auto px-6 md:px-8 lg:px-10 py-8 max-w-[1440px]">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary/90 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à l'accueil</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Tableau de Bord RSE 2025
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualisations interactives des indicateurs de performance ESG
              </p>
            </div>
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
              aria-label="Exporter tous les dashboards"
            >
              <Download className="w-5 h-5" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          activeTab={activeTab}
        />

        {/* Tabs */}
        <div className="relative mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 via-gray-50 dark:from-gray-950 dark:via-gray-950 to-transparent pointer-events-none z-10" />
          <div className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all whitespace-nowrap snap-start min-w-[160px] justify-center ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : ""}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 via-gray-50 dark:from-gray-950 dark:via-gray-950 to-transparent pointer-events-none z-10" />
        </div>

        {/* Environment Tab */}
        {activeTab === "environment" && (
          <div id="dashboard-content" className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6 mb-6">
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Émissions totales 2025
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-[#10B981]/70 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">
                  1,480 <span className="text-base font-medium text-[#666666] dark:text-gray-400">tCO2e</span>
                </p>
                <p className="text-sm font-medium text-success mt-2">-24.8% vs 2020</p>
              </div>
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Énergie renouvelable
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-[#10B981]/70 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">58.6%</p>
                <p className="text-sm font-medium text-[#666666] dark:text-gray-400 mt-2">Objectif 2025: 70%</p>
              </div>
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Taux de recyclage
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-[#10B981]/70 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">67.8%</p>
                <p className="text-sm font-medium text-success mt-2">+12.3% vs 2020</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <ChartCard
                  title="Évolution des émissions CO2"
                  description="Émissions par scope (2020-2025)"
                  icon={<TrendingUp className="w-6 h-6" />}
                >
                  <EmissionsChart data={environmentData.emissions} />
                </ChartCard>
              </div>

              <div className="lg:col-span-6">
                <ChartCard
                  title="Consommation énergétique"
                  description="Par site et part renouvelable"
                  icon={<Leaf className="w-6 h-6" />}
                >
                  <EnergyChart data={environmentData.energy} />
                </ChartCard>
              </div>

              <div className="lg:col-span-6">
                <ChartCard
                  title="Gestion des déchets"
                  description="Répartition par type de traitement"
                  icon={<TrendingUp className="w-6 h-6" />}
                >
                  <WasteChart data={environmentData.waste} />
                </ChartCard>
              </div>

              <div className="lg:col-span-6">
                <ChartCard
                  title="Progression objectifs"
                  description="Cibles environnementales 2025"
                  icon={<Leaf className="w-6 h-6" />}
                >
                  <TargetsProgress data={environmentData.targets} />
                </ChartCard>
              </div>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === "social" && (
          <div id="dashboard-content" className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6 mb-6">
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Effectifs totaux
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[#0088CC]/70 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">
                  {formatNumber(1523)}
                </p>
                <p className="text-sm font-medium text-primary mt-2">+22.3% vs 2020</p>
              </div>
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Femmes au CA
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[#0088CC]/70 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">33.3%</p>
                <p className="text-sm font-medium text-[#666666] dark:text-gray-400 mt-2">508 femmes</p>
              </div>
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Formation/employé
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[#0088CC]/70 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">20.5h</p>
                <p className="text-sm font-medium text-primary mt-2">+62% vs 2020</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <ChartCard
                  title="Évolution des effectifs"
                  description="Répartition hommes/femmes (2020-2025)"
                  icon={<Users className="w-6 h-6" />}
                >
                  <WorkforceChart data={socialData.workforce} />
                </ChartCard>
              </div>

              <div className="lg:col-span-6">
                <ChartCard
                  title="Pyramide des âges"
                  description="Distribution par tranche d'âge"
                  icon={<Users className="w-6 h-6" />}
                >
                  <AgeDistributionChart data={socialData.ageDistribution} />
                </ChartCard>
              </div>

              <div className="lg:col-span-6">
                <ChartCard
                  title="Heures de formation"
                  description="Évolution et moyenne par employé"
                  icon={<TrendingUp className="w-6 h-6" />}
                >
                  <TrainingChart data={socialData.training} />
                </ChartCard>
              </div>

              <div className="lg:col-span-6">
                <ChartCard
                  title="Accidents du travail"
                  description="Nombre et taux de fréquence"
                  icon={<TrendingUp className="w-6 h-6" />}
                >
                  <AccidentsChart data={socialData.accidents} />
                </ChartCard>
              </div>
            </div>
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === "governance" && (
          <div id="dashboard-content" className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6 mb-6">
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Budget RSE 2025
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-[#F8B500]/70 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">
                  {formatCurrency(8100000)}
                </p>
                <p className="text-sm font-medium text-secondary mt-2">+18% vs 2024</p>
              </div>
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Conformité CSRD
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-[#10B981]/70 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">92%</p>
                <p className="text-sm font-medium text-success mt-2">Certifié</p>
              </div>
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-[#E5E7EB] dark:border-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,136,204,0.15)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#666666] dark:text-gray-400 uppercase tracking-wider">
                    Indépendants CA
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-[#F8B500]/70 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-[2.25rem] font-bold text-[#0088CC] dark:text-[#0099DD] tabular-nums leading-none">41.7%</p>
                <p className="text-sm font-medium text-[#666666] dark:text-gray-400 mt-2">5 membres</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <ChartCard
                  title="Composition du conseil"
                  description="Diversité et expertise"
                  icon={<Scale className="w-6 h-6" />}
                >
                  <BoardCompositionChart data={governanceData.board} />
                </ChartCard>
              </div>

              <div className="lg:col-span-6">
                <ChartCard
                  title="Budget par pilier"
                  description="Répartition des investissements RSE"
                  icon={<TrendingUp className="w-6 h-6" />}
                >
                  <BudgetChart data={governanceData.budget} />
                </ChartCard>
              </div>

              <div className="lg:col-span-12">
                <ChartCard
                  title="Scores de conformité"
                  description="Standards et certifications"
                  icon={<Scale className="w-6 h-6" />}
                >
                  <ComplianceScore data={governanceData.compliance} />
                </ChartCard>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Données extraites du Rapport RSE Clauger 2025
          </p>
          <Link
            href="/rapport?page=1"
            className="inline-flex items-center gap-2 text-primary dark:text-primary/90 hover:underline font-medium"
          >
            Consulter le rapport complet →
          </Link>
        </div>
      </div>
    </div>
  )
}
