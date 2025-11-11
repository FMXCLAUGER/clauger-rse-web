import type { Metadata } from "next"
import Link from "next/link"
import { Search, ArrowLeft, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Recherche - Rapport RSE Clauger 2025",
  description:
    "Recherche plein texte dans le Rapport RSE Clauger 2025 - Trouvez rapidement les informations dont vous avez besoin.",
}

export default function RecherchePage() {
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
              <Search className="w-12 h-12 text-primary dark:text-primary/90" />
            </div>
            <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Recherche dans le Rapport
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Moteur de recherche plein texte avec OCR en cours de développement
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
                  Le moteur de recherche sera disponible prochainement avec extraction OCR du texte des pages
                  et indexation complète pour des recherches instantanées.
                </p>
              </div>
            </div>

            <h2 className="font-montserrat text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Fonctionnalités prévues
            </h2>

            <div className="space-y-4">
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                  🔍 Recherche Plein Texte
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Extraction OCR automatique du texte de toutes les pages du rapport avec indexation
                  FlexSearch pour des résultats instantanés et pertinents.
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                  ⌨️ Raccourcis Clavier
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Accès rapide via le raccourci <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-sm">/</kbd> depuis n&apos;importe quelle page
                  pour lancer une recherche immédiate.
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                  💡 Surlignage Contextuel
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Mise en évidence automatique des termes recherchés sur les pages du rapport avec navigation
                  entre les occurrences trouvées.
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                  📊 Résultats Enrichis
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Prévisualisation des pages dans les résultats avec contexte de la recherche et navigation
                  directe vers les sections pertinentes.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-xl">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
                Technologies utilisées
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span><strong>Tesseract.js</strong> - Extraction OCR du texte des images</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span><strong>FlexSearch</strong> - Indexation et recherche haute performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span><strong>Fuse.js</strong> - Recherche floue pour tolérance aux fautes de frappe</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary/90 mt-1">✓</span>
                  <span><strong>React Highlight Words</strong> - Surlignage contextuel des résultats</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 p-6 bg-secondary/5 dark:bg-secondary/10 rounded-xl border border-secondary/20">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
                En attendant la recherche
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vous pouvez naviguer dans le rapport via:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-secondary dark:text-secondary/90 mt-1">→</span>
                  <span>Les miniatures dans la barre latérale du lecteur</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary dark:text-secondary/90 mt-1">→</span>
                  <span>Les boutons de navigation précédent/suivant</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary dark:text-secondary/90 mt-1">→</span>
                  <span>Les raccourcis clavier ← et → pour parcourir les pages</span>
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
