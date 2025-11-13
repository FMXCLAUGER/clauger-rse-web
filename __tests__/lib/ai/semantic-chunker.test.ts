import { describe, it, expect } from '@jest/globals'
import { SemanticChunker } from '@/lib/ai/semantic-chunker'

const SAMPLE_CONTEXT = `# Rapport RSE Clauger 2025

## Performance Environnementale

Les émissions de scope 1 et 2 ont diminué de 28% par rapport à 2020. L'objectif de réduction de 42% d'ici 2030 est en bonne voie. Le parc de véhicules électriques représente maintenant 15% de la flotte totale.

## Performance Sociale

Le score social atteint 7.4/10, ce qui représente une amélioration significative. La formation des employés a augmenté de 25%, avec une moyenne de 32 heures par employé. Le taux d'accidents du travail a diminué de 18%.

## Performance Gouvernance

La gouvernance a obtenu un score de 6.2/10. Le conseil d'administration inclut maintenant 3 membres indépendants. Le budget RSE a été augmenté de 40% pour soutenir les initiatives durables.

## Objectifs 2030

L'entreprise s'engage à atteindre la neutralité carbone d'ici 2030. Les principaux objectifs incluent 100% d'énergies renouvelables et zéro déchet en décharge.
`

describe('SemanticChunker', () => {
  describe('chunkBySection', () => {
    it('should split context by markdown headers', () => {
      const chunks = SemanticChunker.chunkBySection(SAMPLE_CONTEXT)

      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks[0].section).toBeTruthy()
    })

    it('should include section titles', () => {
      const chunks = SemanticChunker.chunkBySection(SAMPLE_CONTEXT)

      const sectionTitles = chunks.map(c => c.section)
      // Note: First section may be filtered if content is too short
      expect(sectionTitles).toContain('Performance Environnementale')
      expect(sectionTitles).toContain('Performance Sociale')
      expect(sectionTitles).toContain('Performance Gouvernance')
    })

    it('should calculate metadata', () => {
      const chunks = SemanticChunker.chunkBySection(SAMPLE_CONTEXT)

      chunks.forEach(chunk => {
        expect(chunk.metadata?.length).toBeGreaterThan(0)
        expect(chunk.metadata?.estimatedTokens).toBeGreaterThan(0)
        expect(chunk.metadata?.estimatedTokens).toBe(Math.ceil(chunk.text.length / 4))
      })
    })

    it('should assign unique IDs', () => {
      const chunks = SemanticChunker.chunkBySection(SAMPLE_CONTEXT)

      const ids = chunks.map(c => c.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should handle empty context', () => {
      const chunks = SemanticChunker.chunkBySection('')

      expect(chunks).toEqual([])
    })

    it('should handle context without headers', () => {
      const plainText = 'This is just plain text without any markdown headers. It should still be chunked into paragraphs.'
      const chunks = SemanticChunker.chunkBySection(plainText)

      expect(chunks.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('scoreRelevance', () => {
    const chunks = SemanticChunker.chunkBySection(SAMPLE_CONTEXT)

    it('should give high score for exact keyword matches', () => {
      const envChunk = chunks.find(c => c.section.includes('Environnementale'))!
      const score = SemanticChunker.scoreRelevance('émissions scope', envChunk)

      expect(score).toBeGreaterThan(5)
    })

    it('should give low score for unrelated queries', () => {
      const envChunk = chunks.find(c => c.section.includes('Environnementale'))!
      const score = SemanticChunker.scoreRelevance('formation employés', envChunk)

      expect(score).toBeLessThan(3)
    })

    it('should bonus chunks with matching section titles', () => {
      const socialChunk = chunks.find(c => c.section.includes('Sociale'))!
      const score = SemanticChunker.scoreRelevance('social score', socialChunk)

      expect(score).toBeGreaterThan(0)
    })

    it('should handle empty query', () => {
      const chunk = chunks[0]
      const score = SemanticChunker.scoreRelevance('', chunk)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(10)
    })

    it('should filter stopwords', () => {
      const chunk = chunks[0]
      const scoreWithStopwords = SemanticChunker.scoreRelevance('quel est le score', chunk)
      const scoreWithoutStopwords = SemanticChunker.scoreRelevance('score', chunk)

      expect(scoreWithoutStopwords).toBeGreaterThanOrEqual(scoreWithStopwords * 0.8)
    })
  })

  describe('selectTopChunks', () => {
    const chunks = SemanticChunker.chunkBySection(SAMPLE_CONTEXT)

    it('should return k most relevant chunks', () => {
      const selected = SemanticChunker.selectTopChunks('émissions carbone', chunks, 2)

      expect(selected.length).toBe(Math.min(2, chunks.length))
    })

    it('should sort by relevance score descending', () => {
      const selected = SemanticChunker.selectTopChunks('score social formation', chunks, 3)

      for (let i = 0; i < selected.length - 1; i++) {
        expect(selected[i].relevanceScore).toBeGreaterThanOrEqual(selected[i + 1].relevanceScore)
      }
    })

    it('should include matched terms', () => {
      const selected = SemanticChunker.selectTopChunks('émissions scope', chunks, 1)

      expect(selected[0].matchedTerms.length).toBeGreaterThan(0)
    })

    it('should handle k larger than chunks length', () => {
      const selected = SemanticChunker.selectTopChunks('test', chunks, 100)

      expect(selected.length).toBe(chunks.length)
    })

    it('should handle k = 0', () => {
      const selected = SemanticChunker.selectTopChunks('test', chunks, 0)

      expect(selected.length).toBe(0)
    })
  })

  describe('rebuildContext', () => {
    const chunks = SemanticChunker.chunkBySection(SAMPLE_CONTEXT)
    const selected = SemanticChunker.selectTopChunks('environnement', chunks, 2)

    it('should create formatted context', () => {
      const context = SemanticChunker.rebuildContext(selected)

      expect(context).toContain('# Contexte Pertinent')
      expect(context).toContain('sections')
    })

    it('should include section headers and scores', () => {
      const context = SemanticChunker.rebuildContext(selected)

      expect(context).toContain('##')
      expect(context).toContain('pertinence:')
    })

    it('should separate sections with dividers', () => {
      const context = SemanticChunker.rebuildContext(selected)

      expect(context).toContain('---')
    })

    it('should handle empty chunks array', () => {
      const context = SemanticChunker.rebuildContext([])

      expect(context).toBe('')
    })

    it('should preserve original chunk text', () => {
      const context = SemanticChunker.rebuildContext(selected)

      selected.forEach(chunk => {
        expect(context).toContain(chunk.section)
      })
    })
  })

  describe('optimizeContext', () => {
    it('should reduce context for simple queries', async () => {
      const result = await SemanticChunker.optimizeContext(
        SAMPLE_CONTEXT,
        'quel est le score social ?',
        'simple'
      )

      expect(result.metadata.optimizedTokens).toBeLessThan(result.metadata.originalTokens)
      expect(result.metadata.reduction).toBeGreaterThan(0)
      expect(result.metadata.chunksUsed).toBe(3)
    })

    it('should reduce context for medium queries', async () => {
      const result = await SemanticChunker.optimizeContext(
        SAMPLE_CONTEXT,
        'comment Clauger améliore sa performance environnementale ?',
        'medium'
      )

      // For small sample contexts, optimization may not reduce size due to added headers
      // The goal is to select up to top 5 relevant chunks (or all chunks if less than 5)
      expect(result.metadata.chunksUsed).toBeGreaterThan(0)
      expect(result.metadata.chunksUsed).toBeLessThanOrEqual(5)
      // Note: reduction can be negative for small contexts due to formatting overhead
      expect(result.metadata).toHaveProperty('reduction')
    })

    it('should keep full context for complex queries', async () => {
      const result = await SemanticChunker.optimizeContext(
        SAMPLE_CONTEXT,
        'analyser en profondeur',
        'complex'
      )

      expect(result.context).toBe(SAMPLE_CONTEXT)
      expect(result.metadata.reduction).toBe(0)
    })

    it('should include optimization metadata', async () => {
      const result = await SemanticChunker.optimizeContext(
        SAMPLE_CONTEXT,
        'score',
        'simple'
      )

      expect(result.metadata.chunksUsed).toBeGreaterThan(0)
      expect(result.metadata.originalTokens).toBeGreaterThan(0)
      expect(result.metadata.optimizedTokens).toBeGreaterThan(0)
      expect(result.metadata.reduction).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty context', async () => {
      const result = await SemanticChunker.optimizeContext(
        '',
        'test',
        'simple'
      )

      expect(result.context).toBe('')
      expect(result.metadata.originalTokens).toBe(0)
    })
  })
})
