import { RSEContextParser, type RSEContext } from './rse-context'
import { logger, logError, logPerformance } from '@/lib/security'

/**
 * Gestionnaire de la base de connaissances RSE
 * Charge et met en cache le contexte pour l'API Claude
 */
export class RSEKnowledgeBase {
  private static instance: RSEKnowledgeBase
  private context: RSEContext | null = null
  private fullAnalysisText: string | null = null
  private loadingPromise: Promise<void> | null = null

  private constructor() {}

  /**
   * Singleton pour éviter les chargements multiples
   */
  static getInstance(): RSEKnowledgeBase {
    if (!RSEKnowledgeBase.instance) {
      RSEKnowledgeBase.instance = new RSEKnowledgeBase()
    }
    return RSEKnowledgeBase.instance
  }

  /**
   * Charge le contexte RSE (avec cache)
   */
  async loadContext(): Promise<RSEContext> {
    // Si déjà chargé, retourner le cache
    if (this.context) {
      return this.context
    }

    // Si en cours de chargement, attendre
    if (this.loadingPromise) {
      await this.loadingPromise
      return this.context!
    }

    // Charger le contexte
    this.loadingPromise = this._loadContextInternal()
    await this.loadingPromise
    this.loadingPromise = null

    return this.context!
  }

  /**
   * Chargement interne du contexte
   */
  private async _loadContextInternal(): Promise<void> {
    try {
      logger.debug('Loading RSE knowledge base context')
      const startTime = Date.now()

      this.context = await RSEContextParser.parseAnalysis()
      this.fullAnalysisText = await RSEContextParser.loadFullAnalysis()

      const loadTime = Date.now() - startTime
      logPerformance('RSE knowledge base loading', loadTime, {
        sectionsCount: this.context.sections.length,
        scoresCount: this.context.scores.length,
        recommendationsCount: this.context.recommendations.length
      })
    } catch (error) {
      logError('RSE knowledge base loading failed', error)
      throw error
    }
  }

  /**
   * Récupère le texte complet de l'analyse (pour injection Claude)
   */
  async getFullAnalysisText(): Promise<string> {
    if (!this.fullAnalysisText) {
      await this.loadContext()
    }
    return this.fullAnalysisText || ''
  }

  /**
   * Récupère le contexte structuré
   */
  async getStructuredContext(): Promise<RSEContext> {
    return await this.loadContext()
  }

  /**
   * Recherche dans le contexte RSE
   */
  async search(query: string): Promise<string> {
    const context = await this.loadContext()
    const results = RSEContextParser.searchInContext(context, query)

    if (results.length === 0) {
      return 'Aucun résultat trouvé dans l\'analyse RSE pour cette requête.'
    }

    // Formater les résultats
    let formatted = `# Résultats de recherche pour : "${query}"\n\n`
    results.forEach((result, index) => {
      formatted += `## ${index + 1}. ${result.title}\n`
      formatted += `${result.content}\n\n`
    })

    return formatted
  }

  /**
   * Récupère les scores RSE
   */
  async getScores(): Promise<string> {
    const context = await this.loadContext()

    let formatted = `# Scores RSE Clauger\n\n`
    formatted += `**Score global : ${context.globalScore}/100**\n\n`
    formatted += `## Scores détaillés par catégorie\n\n`

    context.scores.forEach(score => {
      formatted += `- **${score.category}** : ${score.score}/${score.maxScore}\n`
    })

    return formatted
  }

  /**
   * Récupère les recommandations
   */
  async getRecommendations(): Promise<string> {
    const context = await this.loadContext()

    let formatted = `# Recommandations RSE\n\n`

    if (context.recommendations.length === 0) {
      formatted += 'Aucune recommandation disponible.\n'
      return formatted
    }

    context.recommendations.forEach((reco, index) => {
      formatted += `${index + 1}. ${reco}\n`
    })

    return formatted
  }

  /**
   * Récupère une section spécifique
   */
  async getSection(sectionTitle: string): Promise<string> {
    const context = await this.loadContext()

    const section = context.sections.find(s =>
      s.title.toLowerCase().includes(sectionTitle.toLowerCase())
    )

    if (!section) {
      return `Section "${sectionTitle}" non trouvée.`
    }

    return `# ${section.title}\n\n${section.content}`
  }

  /**
   * Invalide le cache (pour rechargement)
   */
  invalidateCache(): void {
    this.context = null
    this.fullAnalysisText = null
    logger.debug('RSE knowledge base cache invalidated')
  }

  /**
   * Récupère les métadonnées
   */
  async getMetadata() {
    const context = await this.loadContext()
    return context.metadata
  }

  /**
   * Statistiques de la base de connaissances
   */
  async getStats() {
    const context = await this.loadContext()
    const fullText = await this.getFullAnalysisText()

    return {
      sections: context.sections.length,
      scores: context.scores.length,
      recommendations: context.recommendations.length,
      characters: fullText.length,
      estimatedTokens: Math.ceil(fullText.length / 4), // Estimation approximative
      metadata: context.metadata
    }
  }
}

/**
 * Instance singleton exportée
 */
export const knowledgeBase = RSEKnowledgeBase.getInstance()
