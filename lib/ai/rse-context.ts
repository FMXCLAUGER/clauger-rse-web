import fs from 'fs'
import path from 'path'
import { logError } from '@/lib/security'

/**
 * Interfaces pour le contexte RSE structuré
 */

export interface RSESection {
  title: string
  content: string
  score?: number
  subsections?: RSESection[]
}

export interface RSEScore {
  category: string
  score: number
  maxScore: number
  notes?: string
}

export interface RSEContext {
  summary: string
  globalScore: number
  sections: RSESection[]
  scores: RSEScore[]
  recommendations: string[]
  metadata: {
    company: string
    year: number
    reportPages: number
    analysts: string
  }
}

/**
 * Parser pour l'analyse experte RSE
 */
export class RSEContextParser {
  private static readonly ANALYSIS_PATH = path.join(
    process.cwd(),
    'public/data/rse-analysis.md'
  )

  /**
   * Charge et parse le fichier d'analyse RSE complet
   */
  static async loadFullAnalysis(): Promise<string> {
    try {
      const content = fs.readFileSync(this.ANALYSIS_PATH, 'utf-8')
      return content
    } catch (error) {
      logError('RSE analysis markdown loading failed', error, { file: 'analyse-rse.md' })
      return ''
    }
  }

  /**
   * Parse l'analyse et extrait les sections structurées
   */
  static async parseAnalysis(): Promise<RSEContext> {
    const content = await this.loadFullAnalysis()

    if (!content) {
      return this.getEmptyContext()
    }

    // Extract executive summary
    const summaryMatch = content.match(/## RÉSUMÉ EXÉCUTIF([\s\S]*?)(?=\n##\s|\n---\n##|$)/)
    const summary = summaryMatch ? summaryMatch[1].trim() : ''

    // Extract global score
    const globalScoreMatch = content.match(/Notation globale\s*:\s*\*\*(\d+)\/100\*\*/)
    const globalScore = globalScoreMatch ? parseInt(globalScoreMatch[1], 10) : 0

    // Extract main sections
    const sections = this.extractSections(content)

    // Extract detailed scores
    const scores = this.extractScores(content)

    // Extract recommendations
    const recommendations = this.extractRecommendations(content)

    return {
      summary,
      globalScore,
      sections,
      scores,
      recommendations,
      metadata: {
        company: 'Clauger',
        year: 2025,
        reportPages: 36,
        analysts: 'Experts RSE indépendants'
      }
    }
  }

  /**
   * Extract main sections from document
   */
  private static extractSections(content: string): RSESection[] {
    const sections: RSESection[] = []

    // Regex pour capturer les sections de niveau 1 (## titre)
    const sectionRegex = /^##\s+([IVXLCDM]+\.\s+.+?)$/gm
    const matches = Array.from(content.matchAll(sectionRegex))

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const nextMatch = matches[i + 1]

      const startIndex = match.index!
      const endIndex = nextMatch ? nextMatch.index! : content.length
      const sectionContent = content.slice(startIndex, endIndex)

      const title = match[1].trim()
      const subsections = this.extractSubsections(sectionContent)

      sections.push({
        title,
        content: sectionContent,
        subsections
      })
    }

    return sections
  }

  /**
   * Extract subsections from a section
   */
  private static extractSubsections(sectionContent: string): RSESection[] {
    const subsections: RSESection[] = []

    // Regex pour capturer les sous-sections (###)
    const subsectionRegex = /^###\s+(.+?)$/gm
    const matches = Array.from(sectionContent.matchAll(subsectionRegex))

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const nextMatch = matches[i + 1]

      const startIndex = match.index!
      const endIndex = nextMatch ? nextMatch.index! : sectionContent.length
      const content = sectionContent.slice(startIndex, endIndex).trim()

      const title = match[1].trim()

      // Extract score if present (format **Note : X/10**)
      const scoreMatch = content.match(/\*\*Note\s*:\s*(\d+(?:[.,]\d+)?)\s*\/\s*10\*\*/)
      const score = scoreMatch ? parseFloat(scoreMatch[1].replace(',', '.')) : undefined

      subsections.push({
        title,
        content,
        score
      })
    }

    return subsections
  }

  /**
   * Extract all scores from document
   */
  private static extractScores(content: string): RSEScore[] {
    const scores: RSEScore[] = []

    // Recherche de tous les patterns de notation
    const scoreRegex = /\*\*Note\s*:\s*(\d+(?:[.,]\d+)?)\s*\/\s*10\*\*/g
    const subsectionTitles = Array.from(content.matchAll(/^###\s+(.+?)$/gm))

    let match
    let scoreIndex = 0

    while ((match = scoreRegex.exec(content)) !== null) {
      const score = parseFloat(match[1].replace(',', '.'))

      // Find the corresponding subsection title
      let category = 'Non catégorisé'
      for (const titleMatch of subsectionTitles) {
        if (titleMatch.index! < match.index!) {
          category = titleMatch[1].trim()
        } else {
          break
        }
      }

      scores.push({
        category,
        score,
        maxScore: 10
      })

      scoreIndex++
    }

    return scores
  }

  /**
   * Extract recommendations from document
   */
  private static extractRecommendations(content: string): string[] {
    const recommendations: string[] = []

    // Search for recommendations section
    const recoMatch = content.match(/##\s+.*RECOMMANDATIONS.*([\s\S]*?)(?=\n##\s|$)/i)

    if (recoMatch) {
      const recoContent = recoMatch[1]

      // Extract list items (- or *)
      const items = recoContent.match(/^[\s]*[-*]\s+\*\*(.+?)\*\*\s*:(.+?)$/gm)

      if (items) {
        items.forEach(item => {
          const cleanItem = item.replace(/^[\s]*[-*]\s+/, '').trim()
          recommendations.push(cleanItem)
        })
      }
    }

    return recommendations
  }

  /**
   * Retourne un contexte vide en cas d'erreur
   */
  private static getEmptyContext(): RSEContext {
    return {
      summary: '',
      globalScore: 0,
      sections: [],
      scores: [],
      recommendations: [],
      metadata: {
        company: 'Clauger',
        year: 2025,
        reportPages: 36,
        analysts: 'Experts RSE indépendants'
      }
    }
  }

  /**
   * Recherche dans le contenu RSE par mot-clé
   */
  static searchInContext(context: RSEContext, query: string): RSESection[] {
    const results: RSESection[] = []

    // Return empty array for empty queries
    if (!query || query.trim() === '') {
      return results
    }

    const queryLower = query.toLowerCase()

    for (const section of context.sections) {
      if (
        section.title.toLowerCase().includes(queryLower) ||
        section.content.toLowerCase().includes(queryLower)
      ) {
        results.push(section)
      }

      // Search in subsections
      if (section.subsections) {
        for (const subsection of section.subsections) {
          if (
            subsection.title.toLowerCase().includes(queryLower) ||
            subsection.content.toLowerCase().includes(queryLower)
          ) {
            results.push(subsection)
          }
        }
      }
    }

    return results
  }

  /**
   * Format context for Claude (inject into prompt)
   */
  static formatForClaude(context: RSEContext, maxLength?: number): string {
    let formatted = `# RAPPORT RSE CLAUGER ${context.metadata.year}\n\n`
    formatted += `## Résumé Exécutif\n${context.summary}\n\n`
    formatted += `**Notation globale : ${context.globalScore}/100**\n\n`

    // Add main sections
    for (const section of context.sections) {
      formatted += `## ${section.title}\n`
      formatted += `${section.content}\n\n`
    }

    // Truncate if necessary
    if (maxLength && formatted.length > maxLength) {
      formatted = formatted.slice(0, maxLength) + '\n\n[... Contenu tronqué ...]'
    }

    return formatted
  }
}
