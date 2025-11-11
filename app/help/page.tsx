import { Metadata } from "next"
import Link from "next/link"
import {
  Home,
  ArrowLeft,
  ArrowRight,
  Search,
  ZoomIn,
  Maximize2,
  Sun,
  Moon,
  Keyboard,
  HelpCircle,
  BookOpen,
  MessageCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Aide & Documentation",
  description: "Guide complet d'utilisation du visualiseur de rapport RSE Clauger 2025. Raccourcis clavier, fonctionnalités et FAQ.",
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 font-heading">
              Aide & Documentation
            </h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
        </div>
      </header>

      <main id="main-content" className="container mx-auto max-w-6xl px-4 py-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-6 h-6 text-primary" />
                Raccourcis Clavier
              </CardTitle>
              <CardDescription>
                Gagnez du temps avec ces raccourcis clavier pratiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Page précédente</span>
                  </div>
                  <Badge variant="outline">←</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Page suivante</span>
                  </div>
                  <Badge variant="outline">→</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Ouvrir la recherche</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline">Cmd</Badge>
                    <span className="text-gray-400">+</span>
                    <Badge variant="outline">K</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Fermer la recherche</span>
                  </div>
                  <Badge variant="outline">Esc</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Mode plein écran</span>
                  </div>
                  <Badge variant="outline">F11</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Navigation au clavier</span>
                  </div>
                  <Badge variant="outline">Tab</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Fonctionnalités
              </CardTitle>
              <CardDescription>
                Découvrez toutes les fonctionnalités du visualiseur de rapport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Recherche Full-Text
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Recherchez instantanément dans les 36 pages du rapport grâce à la technologie OCR et FlexSearch.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                    <li>Résultats en temps réel avec aperçu des extraits</li>
                    <li>Scores de pertinence et de confiance OCR</li>
                    <li>Navigation clavier (↑↓ pour naviguer, ↵ pour sélectionner)</li>
                    <li>Suggestions de recherche intelligentes</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <ZoomIn className="w-5 h-5 text-primary" />
                    Lightbox & Zoom
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Visualisez les pages en grand format avec zoom jusqu'à 3x.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                    <li>Cliquez sur n'importe quelle page pour l'agrandir</li>
                    <li>Zoom avec molette de souris ou boutons</li>
                    <li>Navigation tactile (swipe) sur mobile et tablette</li>
                    <li>Bande de vignettes en bas pour navigation rapide</li>
                    <li>Mode plein écran disponible</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <div className="flex">
                      <Sun className="w-5 h-5 text-amber-500" />
                      <Moon className="w-5 h-5 text-blue-500 -ml-2" />
                    </div>
                    Mode Sombre
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Basculez entre le mode clair et sombre pour un confort visuel optimal.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                    <li>Détection automatique des préférences système</li>
                    <li>Changement instantané sans rechargement</li>
                    <li>Optimisé pour réduire la fatigue oculaire</li>
                    <li>Préférence sauvegardée localement</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                    Navigation & Partage
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Naviguez facilement et partagez des pages spécifiques.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                    <li>Barre de progression visuelle</li>
                    <li>Sidebar avec vignettes de toutes les pages</li>
                    <li>URLs partageables (ex: /rapport?page=15)</li>
                    <li>Boutons précédent/suivant avec état désactivé aux extrémités</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Questions Fréquentes (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Comment naviguer entre les pages ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Utilisez les flèches ← et → du clavier, ou cliquez sur les boutons précédent/suivant dans la barre de navigation.
                    Vous pouvez également cliquer sur les vignettes dans la sidebar gauche pour accéder directement à une page.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    La recherche ne trouve pas certains mots, pourquoi ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    La recherche utilise l'OCR (reconnaissance optique de caractères) avec une précision moyenne de 67,8%.
                    Certains mots peuvent ne pas être détectés si la qualité de l'image est faible ou la police difficile à lire.
                    Le score de confiance OCR est affiché pour chaque résultat.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Puis-je utiliser le rapport hors ligne ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Actuellement, le rapport nécessite une connexion internet pour être consulté.
                    Une fonctionnalité PWA (Progressive Web App) avec support hors ligne est prévue dans une prochaine mise à jour (Phase 2).
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Comment partager une page spécifique avec un collègue ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    L'URL de chaque page est unique et partageable. Par exemple, pour partager la page 12, copiez l'URL{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                      /rapport?page=12
                    </code>{" "}
                    et envoyez-la à votre collègue.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Le rapport est-il accessible aux personnes en situation de handicap ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Oui ! Le rapport est conçu selon les standards WCAG 2.1 niveau AA. Il est entièrement navigable au clavier,
                    compatible avec les lecteurs d'écran (NVDA, JAWS, VoiceOver), et respecte les contrastes de couleurs recommandés.
                    Toutes les images ont des descriptions alternatives et les états de l'interface sont annoncés aux technologies d'assistance.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Quand seront disponibles les dashboards interactifs ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Les dashboards interactifs (Environnement, Social, Gouvernance) sont prévus pour la Phase 2 du projet.
                    Ils permettront de visualiser les données RSE avec des graphiques interactifs, des filtres et des exports PDF.
                    Consultez la page d'accueil ou la roadmap pour plus de détails.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    J'ai trouvé un bug ou j'ai une suggestion, que faire ?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nous serions ravis d'avoir vos retours ! Contactez-nous à{" "}
                    <a
                      href="mailto:support@clauger.com"
                      className="text-primary hover:underline"
                    >
                      support@clauger.com
                    </a>{" "}
                    ou ouvrez une issue sur notre dépôt GitHub si disponible.
                    Décrivez le problème de manière détaillée avec si possible des captures d'écran.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibilité</CardTitle>
              <CardDescription>
                Notre engagement pour une application inclusive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Le visualiseur de rapport RSE Clauger est conçu pour être accessible au plus grand nombre,
                  conformément aux standards internationaux WCAG 2.1 niveau AA.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span>Navigation complète au clavier</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span>Compatible lecteurs d'écran</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span>Contrastes de couleurs optimisés</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span>Textes alternatifs sur toutes les images</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span>Support des animations réduites</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span>Cibles tactiles ≥44px</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/rapport?page=1"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Consulter le rapport
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Rapport RSE Clauger 2025 - Version 1.0.0
          </p>
          <p className="mt-2">
            Pour toute question, contactez{" "}
            <a href="mailto:support@clauger.com" className="text-primary hover:underline">
              support@clauger.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
