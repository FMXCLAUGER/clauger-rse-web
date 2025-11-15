import { knowledgeBase } from './knowledge-base'
import { SemanticChunker } from './semantic-chunker'
import type { OCRData } from '@/lib/search/types'
import { logger, logError } from '@/lib/security'
import fs from 'fs'
import path from 'path'

/**
 * Options pour la construction du contexte
 */
export interface ContextBuilderOptions {
  includeFullAnalysis?: boolean
  includeOCRData?: boolean
  includeScores?: boolean
  includeRecommendations?: boolean
  searchQuery?: string
  currentPage?: number
  maxContextLength?: number
}

/**
 * Contexte construit pour Claude
 */
export interface BuiltContext {
  systemContext: string
  relevantSections: string[]
  metadata: {
    sources: string[]
    contextLength: number
    estimatedTokens: number
  }
}

/**
 * Constructeur de contexte intelligent pour Claude
 * Combine l'analyse experte RSE, les données OCR, et les métadonnées
 */
export class ContextBuilder {
  /**
   * Construit le contexte complet pour une requête utilisateur
   */
  static async buildContext(
    userQuery: string,
    options: ContextBuilderOptions = {}
  ): Promise<BuiltContext> {
    const {
      includeFullAnalysis = true,
      includeOCRData = false,
      includeScores = true,
      includeRecommendations = false,
      searchQuery,
      currentPage,
      maxContextLength = 180000 // ~45K tokens (Claude supporte 200K)
    } = options

    const sources: string[] = []
    const relevantSections: string[] = []
    let systemContext = ''

    // 1. Ajouter l'analyse experte complète (source principale)
    if (includeFullAnalysis) {
      const fullAnalysis = await knowledgeBase.getFullAnalysisText()
      systemContext += fullAnalysis + '\n\n'
      sources.push('Analyse experte RSE Clauger 2025')
    }

    // 2. Ajouter les scores si demandé
    if (includeScores) {
      const scores = await knowledgeBase.getScores()
      relevantSections.push(scores)
      sources.push('Scores RSE détaillés')
    }

    // 3. Ajouter les recommandations si demandé
    if (includeRecommendations) {
      const recommendations = await knowledgeBase.getRecommendations()
      relevantSections.push(recommendations)
      sources.push('Recommandations RSE')
    }

    // 4. Recherche contextuelle si query fournie
    if (searchQuery) {
      const searchResults = await knowledgeBase.search(searchQuery)
      relevantSections.push(searchResults)
      sources.push(`Recherche: "${searchQuery}"`)
    }

    // 5. Ajouter les données OCR de la page actuelle si pertinent
    if (includeOCRData && currentPage) {
      const ocrData = await this.loadOCRData()
      const pageData = ocrData.pages.find(p => p.pageNumber === currentPage)

      if (pageData) {
        relevantSections.push(`\n## Contenu de la page ${currentPage} du rapport\n${pageData.text}`)
        sources.push(`Page ${currentPage} du rapport PDF`)
      }
    }

    // 6. Combiner toutes les sections
    const fullContext = systemContext + relevantSections.join('\n\n---\n\n')

    // 7. Tronquer si nécessaire
    let finalContext = fullContext
    if (fullContext.length > maxContextLength) {
      logger.warn('Context truncated to fit token limit', {
        originalLength: fullContext.length,
        truncatedLength: maxContextLength,
        reduction: fullContext.length - maxContextLength
      })
      finalContext = fullContext.slice(0, maxContextLength) + '\n\n[... Contexte tronqué pour limites de tokens ...]'
    }

    return {
      systemContext: finalContext,
      relevantSections,
      metadata: {
        sources,
        contextLength: finalContext.length,
        estimatedTokens: Math.ceil(finalContext.length / 4)
      }
    }
  }

  /**
   * Construit un contexte simplifié (pour réponses rapides)
   */
  static async buildLightContext(userQuery: string): Promise<BuiltContext> {
    return this.buildContext(userQuery, {
      includeFullAnalysis: false,
      includeScores: true,
      includeRecommendations: true,
      searchQuery: userQuery,
      maxContextLength: 50000 // ~12K tokens
    })
  }

  /**
   * Construit un contexte pour une page spécifique du rapport
   */
  static async buildPageContext(pageNumber: number): Promise<BuiltContext> {
    return this.buildContext('', {
      includeFullAnalysis: true,
      includeOCRData: true,
      currentPage: pageNumber,
      includeScores: false,
      includeRecommendations: false
    })
  }

  /**
   * Détecte les intentions de la question utilisateur
   */
  static analyzeIntent(userQuery: string): {
    needsScores: boolean
    needsRecommendations: boolean
    needsSearch: boolean
    keywords: string[]
  } {
    const queryLower = userQuery.toLowerCase()

    const needsScores =
      queryLower.includes('score') ||
      queryLower.includes('notation') ||
      queryLower.includes('note') ||
      queryLower.includes('évaluation') ||
      queryLower.includes('combien')

    const needsRecommendations =
      queryLower.includes('recommandation') ||
      queryLower.includes('conseil') ||
      queryLower.includes('améliorer') ||
      queryLower.includes('suggestion') ||
      queryLower.includes('action')

    const needsSearch =
      queryLower.includes('où') ||
      queryLower.includes('trouve') ||
      queryLower.includes('page') ||
      queryLower.includes('section')

    // Extraction de mots-clés pertinents
    const keywords = this.extractKeywords(userQuery)

    return {
      needsScores,
      needsRecommendations,
      needsSearch,
      keywords
    }
  }

  /**
   * Extrait les mots-clés d'une question
   */
  private static extractKeywords(query: string): string[] {
    const stopWords = [
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'de',
      'du',
      'et',
      'ou',
      'pour',
      'dans',
      'sur',
      'avec',
      'sans',
      'est',
      'sont',
      'a',
      'ont',
      'que',
      'qui',
      'quoi',
      'comment',
      'pourquoi',
      'quand'
    ]

    const words = query
      .toLowerCase()
      .replace(/[^\wÀ-ÿ\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))

    return Array.from(new Set(words)) // Dédupliquation
  }

  /**
   * Construit un contexte adaptatif basé sur l'intention
   */
  static async buildAdaptiveContext(
    userQuery: string,
    currentPage?: number
  ): Promise<BuiltContext> {
    const intent = this.analyzeIntent(userQuery)

    return this.buildContext(userQuery, {
      includeFullAnalysis: true,
      includeOCRData: !!currentPage,
      includeScores: intent.needsScores,
      includeRecommendations: intent.needsRecommendations,
      searchQuery: intent.needsSearch ? userQuery : undefined,
      currentPage
    })
  }

  static async buildOptimizedContext(
    userQuery: string,
    currentPage?: number,
    complexity?: 'simple' | 'medium' | 'complex'
  ): Promise<BuiltContext> {
    if (complexity === 'complex') {
      return this.buildAdaptiveContext(userQuery, currentPage)
    }

    const sources: string[] = []
    const relevantSections: string[] = []

    const fullAnalysis = await knowledgeBase.getFullAnalysisText()
    const scores = await knowledgeBase.getScores()
    const recommendations = await knowledgeBase.getRecommendations()

    if (complexity === 'simple') {
      sources.push('Contexte optimisé (semantic chunking - simple)')

      const { context: optimizedContext, metadata } = await SemanticChunker.optimizeContext(
        fullAnalysis,
        userQuery,
        'simple'
      )

      relevantSections.push(optimizedContext)
      relevantSections.push(scores)

      sources.push('Scores RSE')
      sources.push(`Réduction tokens: -${metadata.reduction}%`)
    } else if (complexity === 'medium') {
      sources.push('Contexte optimisé (semantic chunking - medium)')

      const { context: optimizedContext, metadata } = await SemanticChunker.optimizeContext(
        fullAnalysis,
        userQuery,
        'medium'
      )

      relevantSections.push(optimizedContext)
      relevantSections.push(scores)
      relevantSections.push(recommendations)

      sources.push('Scores + Recommandations RSE')
      sources.push(`Réduction tokens: -${metadata.reduction}%`)
    }

    if (currentPage) {
      const ocrData = await this.loadOCRData()
      const pageData = ocrData.pages.find(p => p.pageNumber === currentPage)

      if (pageData) {
        relevantSections.push(`\n## Contenu de la page ${currentPage} du rapport\n${pageData.text}`)
        sources.push(`Page ${currentPage} du rapport PDF`)
      }
    }

    const finalContext = relevantSections.join('\n\n---\n\n')

    return {
      systemContext: finalContext,
      relevantSections,
      metadata: {
        sources,
        contextLength: finalContext.length,
        estimatedTokens: Math.ceil(finalContext.length / 4)
      }
    }
  }

  /**
   * Charge les données OCR
   */
  private static async loadOCRData(): Promise<OCRData> {
    try {
      if (typeof window === 'undefined') {
        const filePath = path.join(process.cwd(), 'public', 'data', 'ocr', 'pages.json')

        if (!fs.existsSync(filePath)) {
          throw new Error(`OCR file not found: ${filePath}`)
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(fileContent)
      }

      const response = await fetch('/data/ocr/pages.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.ok}`)
      }
      return await response.json()
    } catch (error) {
      logError('OCR data loading failed for context builder', error)
      return {
        metadata: {
          totalPages: 0,
          successful: 0,
          failed: 0,
          language: 'fra',
          avgConfidence: 0,
          processingTime: 0,
          timestamp: new Date().toISOString()
        },
        pages: []
      }
    }
  }

  /**
   * Génère un résumé du contexte construit (pour debug)
   */
  static summarizeContext(context: BuiltContext): string {
    return `
Contexte construit:
- Sources: ${context.metadata.sources.join(', ')}
- Longueur: ${context.metadata.contextLength} caractères
- Tokens estimés: ${context.metadata.estimatedTokens}
- Sections pertinentes: ${context.relevantSections.length}
    `.trim()
  }
}
