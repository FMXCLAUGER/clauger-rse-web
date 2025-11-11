export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Clauger",
    url: "https://rse.clauger.com",
    logo: "https://rse.clauger.com/logo.png",
    description: "Passion - Innovation - Performance - Solidarité",
    foundingDate: "1971",
    slogan: "Passion, Innovation, Performance, Solidarité",
  }
}

export function getReportSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Report",
    name: "Rapport RSE Clauger 2025",
    author: {
      "@type": "Organization",
      name: "Clauger",
    },
    datePublished: "2025-01-01",
    abstract:
      "Premier rapport durable de Clauger - Un engagement structuré autour de 3 piliers : Environnement, Social et Gouvernance",
    keywords: "RSE, Développement durable, Environnement, Social, Gouvernance, Clauger",
    inLanguage: "fr-FR",
  }
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rapport RSE Clauger 2025",
    url: "https://rse.clauger.com",
    description: "Premier rapport durable de Clauger",
    publisher: {
      "@type": "Organization",
      name: "Clauger",
    },
    inLanguage: "fr-FR",
  }
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
