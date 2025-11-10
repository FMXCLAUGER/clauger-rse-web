import Link from "next/link"
import { ArrowRight, BarChart3, BookOpen, Search } from "lucide-react"
import { RAPPORT_DATA } from "@/lib/constants"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="relative h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white">
        <div className="absolute inset-0 bg-[url('/images/rapport/page 1.png')] bg-cover bg-center opacity-20" />

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

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-4">
            Chiffres Clés 2024
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Notre engagement en chiffres
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">
                {RAPPORT_DATA.kpis.collaborateurs.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600">Collaborateurs</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">
                {RAPPORT_DATA.kpis.experienceAnnees}+
              </div>
              <div className="text-sm text-gray-600">Années d&apos;expérience</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">
                {(RAPPORT_DATA.kpis.emissionsCarbone / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-gray-600">teqCO₂ (Bilan carbone)</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">
                {(RAPPORT_DATA.kpis.budgetFormation / 1000).toFixed(0)}k€
              </div>
              <div className="text-sm text-gray-600">Budget formation</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-4">
            Nos 3 Enjeux Durables
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Une démarche structurée autour de piliers clés
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {RAPPORT_DATA.enjeux.map((enjeu) => (
              <div
                key={enjeu.id}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className={`w-20 h-20 ${enjeu.color} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                  {enjeu.icon}
                </div>

                <h3 className="font-montserrat text-2xl font-bold mb-3">
                  {enjeu.title}
                </h3>

                <p className="text-gray-600 mb-4 text-sm">
                  {enjeu.subtitle}
                </p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-3xl font-bold text-primary">{enjeu.note}</div>
                    <div className="text-xs text-gray-500">Note / 10</div>
                  </div>

                  <Link
                    href={`/dashboard/${enjeu.id}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    En savoir plus
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-12">
            Accès Rapides
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/rapport?page=1"
              className="group bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Voir le rapport complet</h3>
              <p className="text-sm text-gray-600">Naviguez dans les 36 pages du rapport</p>
            </Link>

            <Link
              href="/dashboard"
              className="group bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Tableaux de bord</h3>
              <p className="text-sm text-gray-600">Visualisations interactives des données</p>
            </Link>

            <Link
              href="/recherche"
              className="group bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Rechercher</h3>
              <p className="text-sm text-gray-600">Recherche full-text dans tout le rapport</p>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="font-montserrat text-2xl font-bold mb-2">Clauger</h3>
            <p className="text-white/80 text-sm">
              {RAPPORT_DATA.baseline}
            </p>
          </div>
          <div className="text-sm text-white/60">
            © 2025 Clauger. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  )
}
