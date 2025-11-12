"use client"

import { useEffect, useState } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Search, ArrowLeft, Zap, Filter, Download, Clock, Sparkles, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RecherchePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Ouvrir automatiquement la modale de recherche au chargement
    const timer = setTimeout(() => {
      // Simuler l'appui sur la touche '/'
      const event = new KeyboardEvent('keydown', { key: '/' })
      document.dispatchEvent(event)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleOpenSearch = () => {
    const event = new KeyboardEvent('keydown', { key: '/' })
    document.dispatchEvent(event)
  }

  const demoSearches = [
    { query: "développement durable", description: "Recherche simple" },
    { query: "RSE AND gouvernance", description: "Opérateurs booléens" },
    { query: "\"énergie renouvelable\"", description: "Expression exacte" },
    { query: "climat OR environnement", description: "Recherche OU" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary/90 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à l&apos;accueil</span>
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-3xl mb-6 animate-in fade-in zoom-in duration-500">
              <Search className="w-10 h-10 text-primary dark:text-primary/90" />
            </div>
            <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Moteur de Recherche Intelligent
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Recherche plein texte avec OCR, FlexSearch et recherche avancée
            </p>

            <button
              onClick={handleOpenSearch}
              className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-xl animate-in fade-in zoom-in duration-700 delay-200"
            >
              <Search className="w-5 h-5" />
              Ouvrir la recherche
              <kbd className="ml-2 px-2 py-1 bg-white/20 rounded text-sm font-mono">
                /
              </kbd>
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-12 animate-in fade-in duration-700 delay-300">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold">Fonctionnalité opérationnelle</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-in fade-in slide-in-from-left duration-700 delay-400">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                    Recherche Ultra-Rapide
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    FlexSearch indexe 11 pages avec données OCR pour des résultats instantanés (&lt;50ms)
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">FlexSearch</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Lazy Loading</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-in fade-in slide-in-from-right duration-700 delay-400">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                    Recherche Avancée
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Opérateurs booléens (AND/OR/NOT), expressions exactes, fuzzy search avec tolérance aux fautes
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">AND OR</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">"exact"</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-in fade-in slide-in-from-left duration-700 delay-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Filter className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                    Filtres par Section
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Filtrez les résultats par section du rapport (Gouvernance, Environnemental, Social, etc.)
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">6 sections</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Smart mapping</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-in fade-in slide-in-from-right duration-700 delay-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                    Export & Partage
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Exportez les résultats en JSON, CSV, Markdown ou Text. Partagez vos recherches par URL.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">4 formats</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">URL sharing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Searches */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-600">
            <h2 className="font-montserrat text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              Exemples de recherche
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {demoSearches.map((demo, index) => (
                <Link
                  key={index}
                  href={`/?q=${encodeURIComponent(demo.query)}`}
                  className="group p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-mono text-sm text-primary dark:text-primary/90 mb-1 group-hover:font-semibold transition-all">
                        {demo.query}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {demo.description}
                      </div>
                    </div>
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Features List */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl p-8 animate-in fade-in duration-700 delay-700">
            <h3 className="font-semibold text-xl mb-6 text-gray-900 dark:text-gray-100">
              Fonctionnalités disponibles
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                "Raccourcis clavier (/, Cmd+K, Esc)",
                "Autocomplétion intelligente",
                "Historique de recherche",
                "Surlignage des résultats",
                "Miniatures des pages",
                "Score de pertinence",
                "Navigation clavier (↑↓↵)",
                "Indicateurs de performance",
                "Mode sombre",
                "Responsive mobile"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-primary/90 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in duration-700 delay-800">
            <button
              onClick={handleOpenSearch}
              className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              Essayer maintenant
            </button>
            <Link
              href="/rapport?page=1"
              className="inline-flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/90 transition-all hover:scale-105"
            >
              Consulter le rapport
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
