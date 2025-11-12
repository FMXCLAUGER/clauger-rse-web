import imageMetadata from '@/public/images-metadata.json'

export const TOTAL_PAGES = 36

export const RAPPORT_DATA = {
  title: "Rapport Durable Clauger 2025",
  baseline: "Passion - Innovation - Performance - Solidarité",
  notation: {
    global: 62,
    environnement: 4.8,
    social: 7.4,
    gouvernance: 6.2,
  },
  kpis: {
    collaborateurs: 3200,
    experienceAnnees: 50,
    emissionsCarbone: 718000,
    budgetFormation: 300000,
    trends: {
      collaborateurs: [
        { value: 2950 },
        { value: 3000 },
        { value: 3050 },
        { value: 3100 },
        { value: 3150 },
        { value: 3200 },
      ],
      experienceAnnees: [
        { value: 45 },
        { value: 46 },
        { value: 47 },
        { value: 48 },
        { value: 49 },
        { value: 50 },
      ],
      emissionsCarbone: [
        { value: 850000 },
        { value: 820000 },
        { value: 790000 },
        { value: 760000 },
        { value: 740000 },
        { value: 718000 },
      ],
      budgetFormation: [
        { value: 250000 },
        { value: 260000 },
        { value: 270000 },
        { value: 280000 },
        { value: 290000 },
        { value: 300000 },
      ],
    },
  },
  enjeux: [
    {
      id: "environnement",
      title: "Environnement",
      subtitle: "Préserver le climat, les ressources et la santé",
      icon: "🌍",
      note: 4.8,
      color: "bg-secondary",
    },
    {
      id: "social",
      title: "Politique Sociale",
      subtitle: "Une culture d'entreprise fondée sur l'humain",
      icon: "👥",
      note: 7.4,
      color: "bg-accent",
    },
    {
      id: "gouvernance",
      title: "Conduite des Affaires",
      subtitle: "Conformité et éthique",
      icon: "⚖️",
      note: 6.2,
      color: "bg-primary",
    },
  ],
}

export const PAGES = Array.from({ length: TOTAL_PAGES }, (_, i) => {
  const id = i + 1
  const key = `page-${id}` as keyof typeof imageMetadata
  const metadata = imageMetadata[key]

  return {
    id,
    src: metadata?.webp || `/images/rapport/page ${id}.png`,
    alt: `Page ${id} du rapport RSE`,
    title: `Page ${id}`,
    blurDataURL: metadata?.blurDataURL,
    width: metadata?.width,
    height: metadata?.height,
  }
})

export const SOMMAIRE = [
  { page: 2, title: "Le mot du président", section: "intro" },
  { page: 4, title: "La RSE chez Clauger", section: "intro" },
  { page: 6, title: "Présentation de la société", section: "intro" },
  { page: 10, title: "Nos grands enjeux durables", section: "intro" },
  { page: 11, title: "Enjeu Environnement", section: "environnement" },
  { page: 22, title: "Espace durables liés à nos solutions", section: "environnement" },
  { page: 24, title: "Enjeu Politique Sociale", section: "social" },
  { page: 32, title: "Enjeu Conduite des Affaires", section: "gouvernance" },
]
