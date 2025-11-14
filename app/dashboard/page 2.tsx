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

  const tabs = [
    { id: "environment" as Tab, label: "Environnement", icon: Leaf, color: "text-green-600" },
    { id: "social" as Tab, label: "Social", icon: Users, color: "text-blue-600" },
    { id: "governance" as Tab, label: "Gouvernance", icon: Scale, color: "text-purple-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
              aria-label="Exporter tous les dashboards"
            >
              <Download className="w-5 h-5" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
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

        {/* Environment Tab */}
        {activeTab === "environment" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Émissions totales 2025
                  </span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  1,480 <span className="text-lg">tCO2e</span>
                </p>
                <p className="text-sm text-green-600 mt-1">-24.8% vs 2020</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Énergie renouvelable
                  </span>
                  <Leaf className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">58.6%</p>
                <p className="text-sm text-gray-500 mt-1">Objectif 2025: 70%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Taux de recyclage
                  </span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">67.8%</p>
                <p className="text-sm text-green-600 mt-1">+12.3% vs 2020</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Évolution des émissions CO2"
                description="Émissions par scope (2020-2025)"
                icon={<TrendingUp className="w-6 h-6" />}
              >
                <EmissionsChart data={environmentData.emissions} />
              </ChartCard>

              <ChartCard
                title="Consommation énergétique"
                description="Par site et part renouvelable"
                icon={<Leaf className="w-6 h-6" />}
              >
                <EnergyChart data={environmentData.energy} />
              </ChartCard>

              <ChartCard
                title="Gestion des déchets"
                description="Répartition par type de traitement"
                icon={<TrendingUp className="w-6 h-6" />}
              >
                <WasteChart data={environmentData.waste} />
              </ChartCard>

              <ChartCard
                title="Progression objectifs"
                description="Cibles environnementales 2025"
                icon={<Leaf className="w-6 h-6" />}
              >
                <TargetsProgress data={environmentData.targets} />
              </ChartCard>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === "social" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Effectifs totaux
                  </span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(1523)}
                </p>
                <p className="text-sm text-blue-600 mt-1">+22.3% vs 2020</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Femmes au CA
                  </span>
                  <Users className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">33.3%</p>
                <p className="text-sm text-gray-500 mt-1">508 femmes</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Formation/employé
                  </span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">20.5h</p>
                <p className="text-sm text-blue-600 mt-1">+62% vs 2020</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Évolution des effectifs"
                description="Répartition hommes/femmes (2020-2025)"
                icon={<Users className="w-6 h-6" />}
              >
                <WorkforceChart data={socialData.workforce} />
              </ChartCard>

              <ChartCard
                title="Pyramide des âges"
                description="Distribution par tranche d'âge"
                icon={<Users className="w-6 h-6" />}
              >
                <AgeDistributionChart data={socialData.ageDistribution} />
              </ChartCard>

              <ChartCard
                title="Heures de formation"
                description="Évolution et moyenne par employé"
                icon={<TrendingUp className="w-6 h-6" />}
              >
                <TrainingChart data={socialData.training} />
              </ChartCard>

              <ChartCard
                title="Accidents du travail"
                description="Nombre et taux de fréquence"
                icon={<TrendingUp className="w-6 h-6" />}
              >
                <AccidentsChart data={socialData.accidents} />
              </ChartCard>
            </div>
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === "governance" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Budget RSE 2025
                  </span>
                  <Scale className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(8100000)}
                </p>
                <p className="text-sm text-purple-600 mt-1">+18% vs 2024</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Conformité CSRD
                  </span>
                  <Scale className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">92%</p>
                <p className="text-sm text-green-600 mt-1">Certifié</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Indépendants CA
                  </span>
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">41.7%</p>
                <p className="text-sm text-gray-500 mt-1">5 membres</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Composition du conseil"
                description="Diversité et expertise"
                icon={<Scale className="w-6 h-6" />}
              >
                <BoardCompositionChart data={governanceData.board} />
              </ChartCard>

              <ChartCard
                title="Budget par pilier"
                description="Répartition des investissements RSE"
                icon={<TrendingUp className="w-6 h-6" />}
              >
                <BudgetChart data={governanceData.budget} />
              </ChartCard>

              <div className="lg:col-span-2">
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
