import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import type { BuiltContext, ContextBuilderOptions } from '@/lib/ai/context-builder'
import type { OCRData } from '@/lib/search/types'

// Mock dependencies with explicit implementations
jest.mock('@/lib/ai/knowledge-base', () => {
  return {
    knowledgeBase: {
      getFullAnalysisText: jest.fn(),
      getScores: jest.fn(),
      getRecommendations: jest.fn(),
      search: jest.fn(),
    },
  }
})

jest.mock('@/lib/ai/semantic-chunker', () => {
  return {
    SemanticChunker: {
      optimizeContext: jest.fn(),
    },
  }
})

jest.mock('@/lib/security', () => {
  return {
    logger: {
      warn: jest.fn(),
      debug: jest.fn(),
    },
    logError: jest.fn(),
  }
})

// DO NOT import here - will be imported in describe block after mocks are set up

const MOCK_FULL_ANALYSIS = `# Analyse RSE Clauger 2025

## Performance Environnementale
Les émissions de scope 1 et 2 ont diminué de 28% par rapport à 2020.

## Performance Sociale
Le score social atteint 7.4/10.

## Performance Gouvernance
La gouvernance a obtenu un score de 6.2/10.`

const MOCK_SCORES = `# Scores RSE Clauger

**Score global : 70/100**

## Scores détaillés par catégorie

- **Environnement** : 75/100
- **Social** : 74/100
- **Gouvernance** : 62/100`

const MOCK_RECOMMENDATIONS = `# Recommandations RSE

1. Augmenter le parc de véhicules électriques
2. Renforcer la formation continue des employés
3. Améliorer la transparence du conseil d'administration`

const MOCK_SEARCH_RESULTS = `# Résultats de recherche pour : "émissions"

## 1. Performance Environnementale
Les émissions de scope 1 et 2 ont diminué de 28% par rapport à 2020.`

const MOCK_OCR_DATA: OCRData = {
  metadata: {
    totalPages: 3,
    successful: 3,
    failed: 0,
    language: 'fra',
    avgConfidence: 0.95,
    processingTime: 1000,
    timestamp: '2024-01-01T00:00:00Z',
  },
  pages: [
    {
      id: 1,
      pageNumber: 1,
      filename: 'page1.jpg',
      text: 'Contenu de la page 1 du rapport RSE',
      confidence: 0.95,
    },
    {
      id: 2,
      pageNumber: 2,
      filename: 'page2.jpg',
      text: 'Contenu de la page 2 avec des données détaillées',
      confidence: 0.93,
    },
    {
      id: 3,
      pageNumber: 3,
      filename: 'page3.jpg',
      text: 'Contenu de la page 3 avec conclusions',
      confidence: 0.96,
    },
  ],
}

describe('ContextBuilder', () => {
  // Import modules inside describe so mocks are applied
  let ContextBuilder: typeof import('@/lib/ai/context-builder').ContextBuilder
  let knowledgeBase: typeof import('@/lib/ai/knowledge-base').knowledgeBase
  let SemanticChunker: typeof import('@/lib/ai/semantic-chunker').SemanticChunker
  let logger: typeof import('@/lib/security').logger

  let mockFetch: jest.Mock

  beforeAll(async () => {
    // Import after mocks are set up
    const contextBuilderModule = await import('@/lib/ai/context-builder')
    ContextBuilder = contextBuilderModule.ContextBuilder

    const knowledgeBaseModule = await import('@/lib/ai/knowledge-base')
    knowledgeBase = knowledgeBaseModule.knowledgeBase

    const semanticChunkerModule = await import('@/lib/ai/semantic-chunker')
    SemanticChunker = semanticChunkerModule.SemanticChunker

    const securityModule = await import('@/lib/security')
    logger = securityModule.logger
  })

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock implementations
    ;(knowledgeBase.getFullAnalysisText as jest.Mock).mockResolvedValue(MOCK_FULL_ANALYSIS)
    ;(knowledgeBase.getScores as jest.Mock).mockResolvedValue(MOCK_SCORES)
    ;(knowledgeBase.getRecommendations as jest.Mock).mockResolvedValue(MOCK_RECOMMENDATIONS)
    ;(knowledgeBase.search as jest.Mock).mockResolvedValue(MOCK_SEARCH_RESULTS)
    ;(SemanticChunker.optimizeContext as jest.Mock).mockResolvedValue({
      context: '# Optimized Context\n\nRelevant sections only',
      metadata: {
        chunksUsed: 3,
        originalTokens: 1000,
        optimizedTokens: 300,
        reduction: 70,
      },
    })

    // Mock global fetch
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_OCR_DATA,
    } as Response)
    global.fetch = mockFetch as any
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('buildContext', () => {
    describe('Basic Context Construction', () => {
      it('should build context with default options', async () => {
        const result = await ContextBuilder.buildContext('test query')

        expect(result).toMatchObject({
          systemContext: expect.any(String),
          relevantSections: expect.any(Array),
          metadata: {
            sources: expect.any(Array),
            contextLength: expect.any(Number),
            estimatedTokens: expect.any(Number),
          },
        })
      })

      it('should include full analysis by default', async () => {
        const result = await ContextBuilder.buildContext('test query')

        // Verify the mock data is being used (which proves the mock was called)
        expect(result.systemContext).toContain(MOCK_FULL_ANALYSIS)
        expect(result.metadata.sources).toContain('Analyse experte RSE Clauger 2025')
      })

      it('should include scores by default', async () => {
        const result = await ContextBuilder.buildContext('test query')

        expect(knowledgeBase.getScores).toHaveBeenCalled()
        expect(result.relevantSections).toContain(MOCK_SCORES)
        expect(result.metadata.sources).toContain('Scores RSE détaillés')
      })

      it('should exclude recommendations by default', async () => {
        const result = await ContextBuilder.buildContext('test query')

        expect(knowledgeBase.getRecommendations).not.toHaveBeenCalled()
        expect(result.relevantSections).not.toContain(MOCK_RECOMMENDATIONS)
      })

      it('should not include OCR data by default', async () => {
        const result = await ContextBuilder.buildContext('test query')

        expect(mockFetch).not.toHaveBeenCalled()
      })

      it('should not perform search by default', async () => {
        const result = await ContextBuilder.buildContext('test query')

        expect(knowledgeBase.search).not.toHaveBeenCalled()
      })
    })

    describe('Option: includeFullAnalysis', () => {
      it('should include full analysis when option is true', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeFullAnalysis: true,
        })

        expect(knowledgeBase.getFullAnalysisText).toHaveBeenCalled()
        expect(result.systemContext).toContain(MOCK_FULL_ANALYSIS)
      })

      it('should exclude full analysis when option is false', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeFullAnalysis: false,
        })

        expect(knowledgeBase.getFullAnalysisText).not.toHaveBeenCalled()
        expect(result.systemContext).not.toContain(MOCK_FULL_ANALYSIS)
      })
    })

    describe('Option: includeScores', () => {
      it('should include scores when option is true', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeScores: true,
        })

        expect(knowledgeBase.getScores).toHaveBeenCalled()
        expect(result.relevantSections).toContain(MOCK_SCORES)
      })

      it('should exclude scores when option is false', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeScores: false,
        })

        expect(knowledgeBase.getScores).not.toHaveBeenCalled()
        expect(result.relevantSections).not.toContain(MOCK_SCORES)
      })
    })

    describe('Option: includeRecommendations', () => {
      it('should include recommendations when option is true', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeRecommendations: true,
        })

        expect(knowledgeBase.getRecommendations).toHaveBeenCalled()
        expect(result.relevantSections).toContain(MOCK_RECOMMENDATIONS)
        expect(result.metadata.sources).toContain('Recommandations RSE')
      })

      it('should exclude recommendations when option is false', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeRecommendations: false,
        })

        expect(knowledgeBase.getRecommendations).not.toHaveBeenCalled()
      })
    })

    describe('Option: searchQuery', () => {
      it('should perform search when searchQuery is provided', async () => {
        const result = await ContextBuilder.buildContext('test', {
          searchQuery: 'émissions',
        })

        expect(knowledgeBase.search).toHaveBeenCalledWith('émissions')
        expect(result.relevantSections).toContain(MOCK_SEARCH_RESULTS)
        expect(result.metadata.sources).toContain('Recherche: "émissions"')
      })

      it('should not perform search when searchQuery is undefined', async () => {
        const result = await ContextBuilder.buildContext('test', {
          searchQuery: undefined,
        })

        expect(knowledgeBase.search).not.toHaveBeenCalled()
      })

      it('should not perform search when searchQuery is empty string', async () => {
        const result = await ContextBuilder.buildContext('test', {
          searchQuery: '',
        })

        expect(knowledgeBase.search).not.toHaveBeenCalled()
      })
    })

    describe('Option: includeOCRData and currentPage', () => {
      it('should include OCR data for specified page', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: true,
          currentPage: 2,
        })

        expect(mockFetch).toHaveBeenCalledWith('/data/ocr/pages.json')
        expect(result.relevantSections.some((s) => s.includes('Contenu de la page 2'))).toBe(true)
        expect(result.metadata.sources).toContain('Page 2 du rapport PDF')
      })

      it('should not include OCR data when includeOCRData is false', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: false,
          currentPage: 2,
        })

        expect(mockFetch).not.toHaveBeenCalled()
      })

      it('should not include OCR data when currentPage is undefined', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: true,
          currentPage: undefined,
        })

        expect(mockFetch).not.toHaveBeenCalled()
      })

      it('should handle missing page in OCR data', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: true,
          currentPage: 99,
        })

        expect(mockFetch).toHaveBeenCalled()
        expect(result.relevantSections.some((s) => s.includes('page 99'))).toBe(false)
      })

      it('should format OCR page content correctly', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: true,
          currentPage: 1,
        })

        const pageSection = result.relevantSections.find((s) => s.includes('page 1'))
        expect(pageSection).toContain('## Contenu de la page 1 du rapport')
        expect(pageSection).toContain('Contenu de la page 1 du rapport RSE')
      })
    })

    describe('Context Truncation', () => {
      it('should not truncate when context is within limit', async () => {
        const result = await ContextBuilder.buildContext('test', {
          maxContextLength: 100000,
        })

        expect(logger.warn).not.toHaveBeenCalled()
        expect(result.systemContext).not.toContain('[... Contexte tronqué')
      })

      it('should truncate context when exceeding maxContextLength', async () => {
        const result = await ContextBuilder.buildContext('test', {
          maxContextLength: 100,
        })

        expect(logger.warn).toHaveBeenCalledWith('Context truncated to fit token limit', {
          originalLength: expect.any(Number),
          truncatedLength: 100,
          reduction: expect.any(Number),
        })
        expect(result.systemContext).toContain('[... Contexte tronqué pour limites de tokens ...]')
        expect(result.metadata.contextLength).toBe(100 + 51) // 100 + length of '\n\n' + truncation message
      })

      it('should truncate at correct position', async () => {
        const veryLongAnalysis = 'A'.repeat(500)
        ;(knowledgeBase.getFullAnalysisText as jest.Mock).mockResolvedValue(veryLongAnalysis)

        const result = await ContextBuilder.buildContext('test', {
          maxContextLength: 200,
          includeScores: false,
        })

        expect(result.metadata.contextLength).toBeLessThanOrEqual(260) // 200 + truncation message
        expect(result.systemContext.length).toBeLessThanOrEqual(260)
      })

      it('should respect custom maxContextLength', async () => {
        const result = await ContextBuilder.buildContext('test', {
          maxContextLength: 50000,
        })

        if (result.systemContext.includes('[... Contexte tronqué')) {
          expect(result.metadata.contextLength).toBeLessThanOrEqual(50060)
        }
      })
    })

    describe('Metadata Calculation', () => {
      it('should calculate contextLength correctly', async () => {
        const result = await ContextBuilder.buildContext('test')

        expect(result.metadata.contextLength).toBe(result.systemContext.length)
      })

      it('should estimate tokens correctly', async () => {
        const result = await ContextBuilder.buildContext('test')

        const expectedTokens = Math.ceil(result.systemContext.length / 4)
        expect(result.metadata.estimatedTokens).toBe(expectedTokens)
      })

      it('should aggregate all sources', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeFullAnalysis: true,
          includeScores: true,
          includeRecommendations: true,
          searchQuery: 'emissions',
        })

        expect(result.metadata.sources).toEqual([
          'Analyse experte RSE Clauger 2025',
          'Scores RSE détaillés',
          'Recommandations RSE',
          'Recherche: "emissions"',
        ])
      })
    })

    describe('Context Formatting', () => {
      it('should combine system context and relevant sections', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeFullAnalysis: true,
          includeScores: true,
        })

        expect(result.systemContext).toContain(MOCK_FULL_ANALYSIS)
        expect(result.systemContext).toContain(MOCK_SCORES)
      })

      it('should separate sections with dividers', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeFullAnalysis: true,
          includeScores: true,
          includeRecommendations: true,
        })

        const dividerCount = (result.systemContext.match(/\n\n---\n\n/g) || []).length
        expect(dividerCount).toBeGreaterThan(0)
      })

      it('should add full analysis to system context first', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeFullAnalysis: true,
          includeScores: true,
        })

        const analysisIndex = result.systemContext.indexOf(MOCK_FULL_ANALYSIS)
        const scoresIndex = result.systemContext.indexOf(MOCK_SCORES)
        expect(analysisIndex).toBeLessThan(scoresIndex)
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty query', async () => {
        const result = await ContextBuilder.buildContext('')

        expect(result).toBeDefined()
        expect(result.metadata.sources.length).toBeGreaterThan(0)
      })

      it('should handle all options disabled', async () => {
        const result = await ContextBuilder.buildContext('test', {
          includeFullAnalysis: false,
          includeScores: false,
          includeRecommendations: false,
          includeOCRData: false,
        })

        expect(result.systemContext).toBe('')
        expect(result.relevantSections).toEqual([])
        expect(result.metadata.sources).toEqual([])
      })

      it('should handle OCR fetch failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
        } as Response)

        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: true,
          currentPage: 1,
        })

        expect(result).toBeDefined()
        expect(result.relevantSections.some((s) => s.includes('page 1'))).toBe(false)
      })

      it('should handle OCR fetch exception', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'))

        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: true,
          currentPage: 1,
        })

        expect(result).toBeDefined()
      })

      it('should handle empty OCR pages array', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            metadata: MOCK_OCR_DATA.metadata,
            pages: [],
          }),
        } as Response)

        const result = await ContextBuilder.buildContext('test', {
          includeOCRData: true,
          currentPage: 1,
        })

        expect(result.relevantSections.some((s) => s.includes('page 1'))).toBe(false)
      })
    })
  })

  describe('buildLightContext', () => {
    it('should call buildContext with correct options', async () => {
      const result = await ContextBuilder.buildLightContext('test query')

      expect(knowledgeBase.getFullAnalysisText).not.toHaveBeenCalled()
      expect(knowledgeBase.getScores).toHaveBeenCalled()
      expect(knowledgeBase.getRecommendations).toHaveBeenCalled()
      expect(knowledgeBase.search).toHaveBeenCalledWith('test query')
    })

    it('should use reduced max context length', async () => {
      const veryLongAnalysis = 'A'.repeat(100000)
      ;(knowledgeBase.getScores as jest.Mock).mockResolvedValue(veryLongAnalysis)

      const result = await ContextBuilder.buildLightContext('test')

      if (result.systemContext.includes('[... Contexte tronqué')) {
        expect(result.metadata.contextLength).toBeLessThanOrEqual(50060) // 50000 + truncation message
      }
    })

    it('should include search results', async () => {
      const result = await ContextBuilder.buildLightContext('émissions carbone')

      expect(result.relevantSections).toContain(MOCK_SEARCH_RESULTS)
    })

    it('should return valid context structure', async () => {
      const result = await ContextBuilder.buildLightContext('test')

      expect(result).toMatchObject({
        systemContext: expect.any(String),
        relevantSections: expect.any(Array),
        metadata: expect.any(Object),
      })
    })
  })

  describe('buildPageContext', () => {
    it('should build context for specific page', async () => {
      const result = await ContextBuilder.buildPageContext(2)

      expect(mockFetch).toHaveBeenCalledWith('/data/ocr/pages.json')
      expect(result.relevantSections.some((s) => s.includes('page 2'))).toBe(true)
    })

    it('should include full analysis', async () => {
      const result = await ContextBuilder.buildPageContext(1)

      expect(knowledgeBase.getFullAnalysisText).toHaveBeenCalled()
      expect(result.systemContext).toContain(MOCK_FULL_ANALYSIS)
    })

    it('should exclude scores and recommendations', async () => {
      const result = await ContextBuilder.buildPageContext(1)

      expect(knowledgeBase.getScores).not.toHaveBeenCalled()
      expect(knowledgeBase.getRecommendations).not.toHaveBeenCalled()
    })

    it('should handle page 1', async () => {
      const result = await ContextBuilder.buildPageContext(1)

      expect(result.relevantSections.some((s) => s.includes('page 1'))).toBe(true)
    })

    it('should handle last page', async () => {
      const result = await ContextBuilder.buildPageContext(3)

      expect(result.relevantSections.some((s) => s.includes('page 3'))).toBe(true)
    })
  })

  describe('analyzeIntent', () => {
    describe('needsScores Detection', () => {
      it('should detect score-related queries', () => {
        expect(ContextBuilder.analyzeIntent('quel est le score ?').needsScores).toBe(true)
        expect(ContextBuilder.analyzeIntent('quelle notation avez-vous ?').needsScores).toBe(true)
        expect(ContextBuilder.analyzeIntent('quelle est la note RSE ?').needsScores).toBe(true)
        expect(ContextBuilder.analyzeIntent('évaluation environnementale').needsScores).toBe(true)
        expect(ContextBuilder.analyzeIntent('combien de points ?').needsScores).toBe(true)
      })

      it('should not detect scores in unrelated queries', () => {
        expect(ContextBuilder.analyzeIntent('quelles sont les actions ?').needsScores).toBe(false)
        expect(ContextBuilder.analyzeIntent('comment améliorer ?').needsScores).toBe(false)
      })
    })

    describe('needsRecommendations Detection', () => {
      it('should detect recommendation-related queries', () => {
        expect(ContextBuilder.analyzeIntent('quelles recommandations ?').needsRecommendations).toBe(
          true
        )
        expect(ContextBuilder.analyzeIntent('donnez-moi des conseils').needsRecommendations).toBe(
          true
        )
        expect(ContextBuilder.analyzeIntent('comment améliorer ?').needsRecommendations).toBe(true)
        expect(ContextBuilder.analyzeIntent('quelles suggestions ?').needsRecommendations).toBe(
          true
        )
        expect(ContextBuilder.analyzeIntent('plan d\'action').needsRecommendations).toBe(true)
      })

      it('should not detect recommendations in unrelated queries', () => {
        expect(ContextBuilder.analyzeIntent('quel est le score ?').needsRecommendations).toBe(
          false
        )
        expect(ContextBuilder.analyzeIntent('données environnementales').needsRecommendations).toBe(
          false
        )
      })
    })

    describe('needsSearch Detection', () => {
      it('should detect search-related queries', () => {
        expect(ContextBuilder.analyzeIntent('où trouve-t-on cette info ?').needsSearch).toBe(true)
        expect(ContextBuilder.analyzeIntent('quelle page contient ?').needsSearch).toBe(true)
        expect(ContextBuilder.analyzeIntent('dans quelle section ?').needsSearch).toBe(true)
      })

      it('should not detect search in unrelated queries', () => {
        expect(ContextBuilder.analyzeIntent('quel est le score ?').needsSearch).toBe(false)
        expect(ContextBuilder.analyzeIntent('comment améliorer ?').needsSearch).toBe(false)
      })
    })

    describe('Keywords Extraction', () => {
      it('should extract meaningful keywords', () => {
        const result = ContextBuilder.analyzeIntent('émissions carbone environnement')

        expect(result.keywords).toContain('émissions')
        expect(result.keywords).toContain('carbone')
        expect(result.keywords).toContain('environnement')
      })

      it('should filter stopwords', () => {
        const result = ContextBuilder.analyzeIntent('le score de la performance dans les émissions')

        expect(result.keywords).not.toContain('le')
        expect(result.keywords).not.toContain('de')
        expect(result.keywords).not.toContain('la')
        expect(result.keywords).not.toContain('dans')
        expect(result.keywords).not.toContain('les')
      })

      it('should filter short words', () => {
        const result = ContextBuilder.analyzeIntent('a et ou de un du le la')

        expect(result.keywords).toEqual([])
      })

      it('should deduplicate keywords', () => {
        const result = ContextBuilder.analyzeIntent('score score score performance')

        const scoreCount = result.keywords.filter((k) => k === 'score').length
        expect(scoreCount).toBe(1)
      })

      it('should handle accented characters', () => {
        const result = ContextBuilder.analyzeIntent('évaluation émissions référence')

        expect(result.keywords).toContain('évaluation')
        expect(result.keywords).toContain('émissions')
        expect(result.keywords).toContain('référence')
      })

      it('should handle empty query', () => {
        const result = ContextBuilder.analyzeIntent('')

        expect(result.keywords).toEqual([])
        expect(result.needsScores).toBe(false)
        expect(result.needsRecommendations).toBe(false)
        expect(result.needsSearch).toBe(false)
      })

      it('should handle special characters', () => {
        const result = ContextBuilder.analyzeIntent('performance (RSE) & environnement - 2025!')

        expect(result.keywords).toContain('performance')
        expect(result.keywords).toContain('environnement')
      })
    })

    describe('Combined Intent Detection', () => {
      it('should detect multiple intents', () => {
        const result = ContextBuilder.analyzeIntent(
          'quel est le score et quelles recommandations ?'
        )

        expect(result.needsScores).toBe(true)
        expect(result.needsRecommendations).toBe(true)
      })

      it('should handle complex queries', () => {
        const result = ContextBuilder.analyzeIntent(
          'où trouve la section sur les émissions et quel score ?'
        )

        expect(result.needsScores).toBe(true)
        expect(result.needsSearch).toBe(true)
      })
    })
  })

  describe('buildAdaptiveContext', () => {
    it('should include scores when intent detected', async () => {
      const result = await ContextBuilder.buildAdaptiveContext('quel est le score RSE ?')

      expect(knowledgeBase.getScores).toHaveBeenCalled()
      expect(result.relevantSections).toContain(MOCK_SCORES)
    })

    it('should include recommendations when intent detected', async () => {
      const result = await ContextBuilder.buildAdaptiveContext('quelles recommandations ?')

      expect(knowledgeBase.getRecommendations).toHaveBeenCalled()
      expect(result.relevantSections).toContain(MOCK_RECOMMENDATIONS)
    })

    it('should perform search when intent detected', async () => {
      const result = await ContextBuilder.buildAdaptiveContext('où trouve cette information ?')

      expect(knowledgeBase.search).toHaveBeenCalledWith('où trouve cette information ?')
    })

    it('should include OCR data when page provided', async () => {
      const result = await ContextBuilder.buildAdaptiveContext('test query', 2)

      expect(mockFetch).toHaveBeenCalled()
      expect(result.relevantSections.some((s) => s.includes('page 2'))).toBe(true)
    })

    it('should not include OCR data when page not provided', async () => {
      const result = await ContextBuilder.buildAdaptiveContext('test query')

      expect(result.relevantSections.some((s) => s.includes('Contenu de la page'))).toBe(false)
    })

    it('should always include full analysis', async () => {
      const result = await ContextBuilder.buildAdaptiveContext('simple query')

      expect(knowledgeBase.getFullAnalysisText).toHaveBeenCalled()
    })
  })

  describe('buildOptimizedContext', () => {

    describe('Simple Complexity', () => {
      it('should use semantic chunking for simple queries', async () => {
        const result = await ContextBuilder.buildOptimizedContext('score', undefined, 'simple')

        expect(SemanticChunker.optimizeContext).toHaveBeenCalledWith(
          MOCK_FULL_ANALYSIS,
          'score',
          'simple'
        )
        expect(result.metadata.sources).toContain(
          'Contexte optimisé (semantic chunking - simple)'
        )
      })

      it('should include scores for simple queries', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'simple')

        expect(knowledgeBase.getScores).toHaveBeenCalled()
        expect(result.relevantSections).toContain(MOCK_SCORES)
      })

      it('should not include recommendations for simple queries', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'simple')

        // Recommendations are fetched but not included in the result for simple queries
        expect(result.relevantSections).not.toContain(MOCK_RECOMMENDATIONS)
      })

      it('should include reduction percentage in sources', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'simple')

        expect(result.metadata.sources).toContain('Réduction tokens: -70%')
      })
    })

    describe('Medium Complexity', () => {
      it('should use semantic chunking for medium queries', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'medium')

        expect(SemanticChunker.optimizeContext).toHaveBeenCalledWith(
          MOCK_FULL_ANALYSIS,
          'test',
          'medium'
        )
        expect(result.metadata.sources).toContain(
          'Contexte optimisé (semantic chunking - medium)'
        )
      })

      it('should include scores and recommendations for medium queries', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'medium')

        expect(knowledgeBase.getScores).toHaveBeenCalled()
        expect(knowledgeBase.getRecommendations).toHaveBeenCalled()
        expect(result.relevantSections).toContain(MOCK_SCORES)
        expect(result.relevantSections).toContain(MOCK_RECOMMENDATIONS)
      })
    })

    describe('Complex Complexity', () => {
      it('should delegate to buildAdaptiveContext for complex queries', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', 2, 'complex')

        expect(SemanticChunker.optimizeContext).not.toHaveBeenCalled()
        expect(knowledgeBase.getFullAnalysisText).toHaveBeenCalled()
      })

      it('should include page data for complex queries', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', 2, 'complex')

        expect(mockFetch).toHaveBeenCalled()
      })
    })

    describe('OCR Data Integration', () => {
      it('should include OCR data when currentPage provided', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', 1, 'simple')

        expect(mockFetch).toHaveBeenCalled()
        expect(result.relevantSections.some((s) => s.includes('page 1'))).toBe(true)
      })

      it('should not include OCR data when currentPage not provided', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'simple')

        expect(mockFetch).not.toHaveBeenCalled()
      })

      it('should handle OCR data for all complexity levels', async () => {
        await ContextBuilder.buildOptimizedContext('test', 1, 'simple')
        await ContextBuilder.buildOptimizedContext('test', 1, 'medium')

        expect(mockFetch).toHaveBeenCalledTimes(2)
      })
    })

    describe('Context Formatting', () => {
      it('should join sections with dividers', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'simple')

        expect(result.systemContext).toContain('---')
      })

      it('should calculate metadata correctly', async () => {
        const result = await ContextBuilder.buildOptimizedContext('test', undefined, 'simple')

        expect(result.metadata.contextLength).toBe(result.systemContext.length)
        expect(result.metadata.estimatedTokens).toBe(Math.ceil(result.systemContext.length / 4))
      })
    })
  })

  describe('summarizeContext', () => {
    it('should generate summary with all metadata', () => {
      const context: BuiltContext = {
        systemContext: 'Test context content',
        relevantSections: ['Section 1', 'Section 2'],
        metadata: {
          sources: ['Source A', 'Source B'],
          contextLength: 1000,
          estimatedTokens: 250,
        },
      }

      const summary = ContextBuilder.summarizeContext(context)

      expect(summary).toContain('Source A, Source B')
      expect(summary).toContain('1000 caractères')
      expect(summary).toContain('250')
      expect(summary).toContain('2')
    })

    it('should handle single source', () => {
      const context: BuiltContext = {
        systemContext: 'Test',
        relevantSections: [],
        metadata: {
          sources: ['Single Source'],
          contextLength: 100,
          estimatedTokens: 25,
        },
      }

      const summary = ContextBuilder.summarizeContext(context)

      expect(summary).toContain('Single Source')
      expect(summary).toContain('100 caractères')
    })

    it('should handle no sources', () => {
      const context: BuiltContext = {
        systemContext: 'Test',
        relevantSections: [],
        metadata: {
          sources: [],
          contextLength: 50,
          estimatedTokens: 12,
        },
      }

      const summary = ContextBuilder.summarizeContext(context)

      expect(summary).toContain('Sources:')
      expect(summary).toContain('50 caractères')
    })

    it('should handle no relevant sections', () => {
      const context: BuiltContext = {
        systemContext: 'Test',
        relevantSections: [],
        metadata: {
          sources: ['Source'],
          contextLength: 100,
          estimatedTokens: 25,
        },
      }

      const summary = ContextBuilder.summarizeContext(context)

      expect(summary).toContain('Sections pertinentes: 0')
    })

    it('should format output correctly', () => {
      const context: BuiltContext = {
        systemContext: 'Test',
        relevantSections: ['A', 'B', 'C'],
        metadata: {
          sources: ['S1', 'S2'],
          contextLength: 500,
          estimatedTokens: 125,
        },
      }

      const summary = ContextBuilder.summarizeContext(context)

      expect(summary).toContain('Contexte construit:')
      expect(summary).toContain('- Sources:')
      expect(summary).toContain('- Longueur:')
      expect(summary).toContain('- Tokens estimés:')
      expect(summary).toContain('- Sections pertinentes:')
    })
  })
})
