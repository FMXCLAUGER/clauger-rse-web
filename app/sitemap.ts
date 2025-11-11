import { MetadataRoute } from "next"
import { TOTAL_PAGES } from "@/lib/constants"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rse.clauger.com"

  const reportPages = Array.from({ length: TOTAL_PAGES }, (_, i) => ({
    url: `${baseUrl}/rapport?page=${i + 1}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/rapport`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...reportPages,
  ]
}
