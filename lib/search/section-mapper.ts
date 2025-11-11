import { SOMMAIRE } from "@/lib/constants"

type Section = "intro" | "environnement" | "social" | "gouvernance" | "all"

export const PAGE_SECTION_MAP: Record<number, Section> = {
  // Intro pages (1-10)
  1: "intro",
  2: "intro",
  3: "intro",
  4: "intro",
  5: "intro",
  6: "intro",
  7: "intro",
  8: "intro",
  9: "intro",
  10: "intro",

  // Environnement (11-23)
  11: "environnement",
  12: "environnement",
  13: "environnement",
  14: "environnement",
  15: "environnement",
  16: "environnement",
  17: "environnement",
  18: "environnement",
  19: "environnement",
  20: "environnement",
  21: "environnement",
  22: "environnement",
  23: "environnement",

  // Social (24-31)
  24: "social",
  25: "social",
  26: "social",
  27: "social",
  28: "social",
  29: "social",
  30: "social",
  31: "social",

  // Gouvernance (32-36)
  32: "gouvernance",
  33: "gouvernance",
  34: "gouvernance",
  35: "gouvernance",
  36: "gouvernance",
}

export const SECTIONS = [
  { id: "all" as Section, label: "Toutes les sections", icon: "📄", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "intro" as Section, label: "Introduction", icon: "📖", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "environnement" as Section, label: "Environnement", icon: "🌍", color: "bg-green-100 dark:bg-green-900" },
  { id: "social" as Section, label: "Social", icon: "👥", color: "bg-orange-100 dark:bg-orange-900" },
  { id: "gouvernance" as Section, label: "Gouvernance", icon: "⚖️", color: "bg-purple-100 dark:bg-purple-900" },
] as const

export function getPageSection(pageNumber: number): Section {
  return PAGE_SECTION_MAP[pageNumber] || "intro"
}

export function filterResultsBySection(
  results: any[],
  activeSection: Section
): any[] {
  if (activeSection === "all") return results

  return results.filter((result) => {
    const pageSection = getPageSection(result.pageNumber)
    return pageSection === activeSection
  })
}
