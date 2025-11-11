import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, BookOpen, Search } from "lucide-react"
import { RAPPORT_DATA, PAGES } from "@/lib/constants"
import { JsonLd } from "@/components/seo/JsonLd"
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/jsonld"
import { EnjeuxSection } from "@/components/enjeux/EnjeuxSection"

export default function HomePage() {
  const heroImage = PAGES[0]

  return (
    <>
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebSiteSchema()} />
      <main id="main-content" className="min-h-screen dark:bg-gray-950">
      <section className="relative h-dvh bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={heroImage.src}
            alt="Couverture du rapport RSE Clauger 2025"
            fill
            className="object-cover object-center"
            priority
            quality={85}
            placeholder={heroImage.blurDataURL ? "blur" : "empty"}
            blurDataURL={heroImage.blurDataURL}
          />
        </div>

        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <div className="mb-8 inline-block">
            <span className="text-sm font-semibold tracking-wider uppercase bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              1er Rapport Durable
            </span>
          </div>

          <h1 className="font-montserrat text-5xl md:text-7xl font-bold mb-6">
            {RAPPORT_DATA.title}
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl">
            {RAPPORT_DATA.baseline}
          </p>

          <div className="flex items-center gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20">
              <div className="text-6xl font-bold text-white">{RAPPORT_DATA.notation.global}</div>
              <div className="text-sm text-white/80 mt-1">Note globale / 100</div>
            </div>
            <div className="text-left text-sm text-white/80">
              <div>Niveau : <span className="font-semibold text-white">Structuré</span></div>
              <div className="text-xs mt-1">Émergent → Intermédiaire</div>
            </div>
          </div>

          <Link
            href="/rapport?page=1"
            className="group inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all hover:scale-105 hover:shadow-2xl"
          >
            Explorer le rapport
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
            Chiffres Clés 2024
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Notre engagement en chiffres
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary dark:text-primary/90 mb-2">
                {RAPPORT_DATA.kpis.collaborateurs.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Collaborateurs</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary dark:text-primary/90 mb-2">
                {RAPPORT_DATA.kpis.experienceAnnees}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Années d&apos;expérience</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary dark:text-primary/90 mb-2">
                {(RAPPORT_DATA.kpis.emissionsCarbone / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">teqCO₂ (Bilan carbone)</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary dark:text-primary/90 mb-2">
                {(RAPPORT_DATA.kpis.budgetFormation / 1000).toFixed(0)}k€
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Budget formation</div>
            </div>
          </div>
        </div>
      </section>

      <EnjeuxSection />

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Accès Rapides
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/rapport?page=1"
              className="group bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                <BookOpen className="w-8 h-8 text-primary dark:text-primary/90" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Voir le rapport complet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Naviguez dans les 36 pages du rapport</p>
            </Link>

            <Link
              href="/dashboard"
              className="group bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-secondary/10 dark:bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 dark:group-hover:bg-secondary/30 transition-colors">
                <BarChart3 className="w-8 h-8 text-secondary dark:text-secondary/90" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Tableaux de bord</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visualisations interactives des données</p>
            </Link>

            <Link
              href="/recherche"
              className="group bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 dark:group-hover:bg-accent/30 transition-colors">
                <Search className="w-8 h-8 text-accent dark:text-accent/90" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Rechercher</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recherche full-text dans tout le rapport</p>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-primary dark:bg-gray-900 text-white py-12 border-t border-primary-foreground/10 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="font-montserrat text-2xl font-bold mb-2">Clauger</h3>
            <p className="text-white/80 dark:text-gray-300 text-sm">
              {RAPPORT_DATA.baseline}
            </p>
          </div>
          <div className="text-sm text-white/60 dark:text-gray-400">
            © 2025 Clauger. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
    </>
  )
}
