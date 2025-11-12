import fs from 'fs'
import path from 'path'

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
    '../Analyse RSE/ANALYSE_EXHAUSTIVE_RSE_CLAUGER_2025.md'
  )

  /**
   * Charge et parse le fichier d'analyse RSE complet
   */
  static async loadFullAnalysis(): Promise<string> {
    try {
      const content = fs.readFileSync(this.ANALYSIS_PATH, 'utf-8')
      return content
    } catch (error) {
      console.error('Erreur lors du chargement de l\'analyse RSE:', error)
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

    // Extraction du résumé exécutif
    const summaryMatch = content.match(/## RÉSUMÉ EXÉCUTIF([\s\S]*?)(?=\n##\s|\n---\n##|$)/)
    const summary = summaryMatch ? summaryMatch[1].trim() : ''

    // Extraction de la notation globale
    const globalScoreMatch = content.match(/Notation globale\s*:\s*\*\*(\d+)\/100\*\*/)
    const globalScore = globalScoreMatch ? parseInt(globalScoreMatch[1], 10) : 0

    // Extraction des sections principales
    const sections = this.extractSections(content)

    // Extraction des scores détaillés
    const scores = this.extractScores(content)

    // Extraction des recommandations
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
   * Extrait les sections principales du document
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
   * Extrait les sous-sections d'une section
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

      // Extraction du score si présent (format **Note : X/10**)
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
   * Extrait tous les scores du document
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

      // Trouver le titre de la sous-section correspondante
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
   * Extrait les recommandations du document
   */
  private static extractRecommendations(content: string): string[] {
    const recommendations: string[] = []

    // Recherche de la section recommandations
    const recoMatch = content.match(/##\s+.*RECOMMANDATIONS.*([\s\S]*?)(?=\n##\s|$)/i)

    if (recoMatch) {
      const recoContent = recoMatch[1]

      // Extraction des items de liste (- ou *)
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
    const queryLower = query.toLowerCase()

    for (const section of context.sections) {
      if (
        section.title.toLowerCase().includes(queryLower) ||
        section.content.toLowerCase().includes(queryLower)
      ) {
        results.push(section)
      }

      // Recherche dans les sous-sections
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
   * Formatte le contexte pour Claude (injection dans le prompt)
   */
  static formatForClaude(context: RSEContext, maxLength?: number): string {
    let formatted = `# RAPPORT RSE CLAUGER ${context.metadata.year}\n\n`
    formatted += `## Résumé Exécutif\n${context.summary}\n\n`
    formatted += `**Notation globale : ${context.globalScore}/100**\n\n`

    // Ajouter les sections principales
    for (const section of context.sections) {
      formatted += `## ${section.title}\n`
      formatted += `${section.content}\n\n`
    }

    // Tronquer si nécessaire
    if (maxLength && formatted.length > maxLength) {
      formatted = formatted.slice(0, maxLength) + '\n\n[... Contenu tronqué ...]'
    }

    return formatted
  }
}
