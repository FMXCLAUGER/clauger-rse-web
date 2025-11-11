import type { Metadata } from "next"
import Link from "next/link"
import { BarChart3, ArrowLeft, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Tableaux de Bord - Rapport RSE Clauger 2025",
  description:
    "Visualisations interactives des indicateurs de performance ESG (Environnement, Social, Gouvernance) du Rapport RSE Clauger 2025.",
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary/90 transition-colors mb-12"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à l&apos;accueil</span>
          </Link>

          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-3xl mb-8">
              <BarChart3 className="w-12 h-12 text-primary dark:text-primary/90" />
            </div>
            <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Tableaux de Bord Interactifs
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Visualisations détaillées des indicateurs de performance ESG en cours de développement
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl mb-8">
            <div className="flex items-start gap-4 mb-8 p-6 bg-accent/10 dark:bg-accent/20 rounded-xl border border-accent/20">
              <Calendar className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                  Fonctionnalité en développement - Phase 2
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Les tableaux de bord interactifs seront disponibles prochainement avec des visualisations
                  conformes aux standards CSRD pour un suivi en temps réel de vos indicateurs ESG.
                </p>
              </div>
            </div>

            <h2 className="font-montserrat text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Fonctionnalités prévues
            </h2>

            <div className="space-y-4">
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-secondary dark:text-secondary/90">
                  🌍 Dashboard Environnement
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Émissions carbone, consommation énergétique, déchets, objectifs climatiques avec
                  visualisations bullet charts et waterfall charts conformes CSRD.
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-accent dark:text-accent/90">
                  👥 Dashboard Social
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Effectifs, diversité, formation, satisfaction collaborateurs, santé & sécurité avec
                  indicateurs de progression vers les objectifs.
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-primary dark:text-primary/90">
                  ⚖️ Dashboard Gouvernance
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Composition des instances, conformité réglementaire, éthique des affaires, transparence
                  avec métriques de performance.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-xl">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
                Capacités techniques prévues
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span>Graphiques interactifs avec drill-down et filtres dynamiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span>Comparaison cibles vs. réalisations avec indicateurs de progression</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span>Export PDF/PNG et partage par email des visualisations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span>Mise à jour en temps réel des données (si backend connecté)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span>Visualisations conformes aux standards IBCS et CSRD</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rapport?page=1"
              className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-xl"
            >
              Consulter le rapport complet
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/90 transition-all hover:scale-105"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
