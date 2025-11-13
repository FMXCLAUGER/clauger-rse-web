import { describe, it, expect } from '@jest/globals'
import { ModelRouter, CLAUDE_MODELS } from '@/lib/ai/model-router'
import type { Message } from 'ai'

describe('ModelRouter', () => {
  describe('analyzeComplexity', () => {
    it('should detect simple queries', () => {
      const queries = [
        'Quel est le score environnement ?',
        'Combien d\'émissions en 2024 ?',
        'Quelle est la note sociale ?',
        'Liste les objectifs',
        'Où se trouve cette information ?'
      ]

      queries.forEach(query => {
        const result = ModelRouter.analyzeComplexity(query)
        expect(result.level).toBe('simple')
        expect(result.score).toBeLessThan(3)
      })
    })

    it('should detect medium complexity queries', () => {
      const queries = [
        'Comment Clauger réduit ses émissions ?',
        'Pourquoi le score social est bon ?',
        'Expliquer la stratégie environnementale',
        'Quelle est la différence entre scope 1 et 2 ?'
      ]

      queries.forEach(query => {
        const result = ModelRouter.analyzeComplexity(query)
        expect(result.level).toBe('medium')
        expect(result.score).toBeGreaterThanOrEqual(3)
        expect(result.score).toBeLessThan(6)
      })
    })

    it('should detect complex queries', () => {
      const queries = [
        'Analyser en profondeur la stratégie ESG et comparer avec 2023',
        'Synthétiser les tendances carbone et projeter 2030',
        'Évaluer la performance globale et recommandation détaillée',
        'Comparer les scores avec les concurrents et analyser les écarts'
      ]

      queries.forEach(query => {
        const result = ModelRouter.analyzeComplexity(query)
        expect(result.level).toBe('complex')
        expect(result.score).toBeGreaterThanOrEqual(6)
      })
    })

    it('should increase score for long queries', () => {
      const shortQuery = 'Quel est le score ?'
      const longQuery = 'A' + 'a'.repeat(550)

      const shortResult = ModelRouter.analyzeComplexity(shortQuery)
      const longResult = ModelRouter.analyzeComplexity(longQuery)

      expect(longResult.score).toBeGreaterThan(shortResult.score)
      expect(longResult.reasons).toContain('Query très longue (>500 chars)')
    })

    it('should increase score for multiple questions', () => {
      const singleQ = 'Quel est le score ?'
      const multiQ = 'Quel est le score ? Comment il est calculé ? Pourquoi ce niveau ?'

      const singleResult = ModelRouter.analyzeComplexity(singleQ)
      const multiResult = ModelRouter.analyzeComplexity(multiQ)

      expect(multiResult.score).toBeGreaterThan(singleResult.score)
    })

    it('should handle empty query', () => {
      const result = ModelRouter.analyzeComplexity('')
      expect(result.level).toBe('simple')
      expect(result.score).toBeLessThanOrEqual(0)
    })

    it('should trim whitespace', () => {
      const result = ModelRouter.analyzeComplexity('   Quel est le score ?   ')
      expect(result.level).toBe('simple')
    })
  })

  describe('selectModel', () => {
    it('should select Haiku for simple queries', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quel est le score environnement ?' }
      ]

      const decision = ModelRouter.selectModel(messages)

      expect(decision.model.id).toBe(CLAUDE_MODELS.HAIKU.id)
      expect(decision.complexity.level).toBe('simple')
      expect(decision.potentialSavings).toBeGreaterThan(0)
    })

    it('should select Haiku for medium queries', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Comment Clauger améliore son bilan carbone ?' }
      ]

      const decision = ModelRouter.selectModel(messages)

      expect(decision.model.id).toBe(CLAUDE_MODELS.HAIKU.id)
      expect(decision.complexity.level).toBe('medium')
    })

    it('should select Sonnet for complex queries', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Analyser en profondeur l\'évolution ESG 2020-2025 et projeter 2030' }
      ]

      const decision = ModelRouter.selectModel(messages)

      expect(decision.model.id).toBe(CLAUDE_MODELS.SONNET.id)
      expect(decision.complexity.level).toBe('complex')
      expect(decision.potentialSavings).toBe(0)
    })

    it('should handle multi-turn conversations', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quel est le score ?' },
        { id: '2', role: 'assistant', content: 'Le score est 6.2/10' },
        { id: '3', role: 'user', content: 'Pourquoi ?' }
      ]

      const decision = ModelRouter.selectModel(messages)

      expect(decision.model).toBeDefined()
      expect(decision.estimatedInputTokens).toBeGreaterThan(0)
    })

    it('should provide reasoning for decision', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Analyser la stratégie' }
      ]

      const decision = ModelRouter.selectModel(messages)

      expect(decision.reasoning).toContain('score')
      expect(decision.complexity.reasons.length).toBeGreaterThan(0)
    })
  })

  describe('estimateTokens', () => {
    it('should estimate tokens correctly', () => {
      const text = 'a'.repeat(400)
      const tokens = ModelRouter.estimateTokens(text)

      expect(tokens).toBe(100)
    })

    it('should round up', () => {
      const text = 'a'.repeat(401)
      const tokens = ModelRouter.estimateTokens(text)

      expect(tokens).toBe(101)
    })

    it('should handle empty string', () => {
      const tokens = ModelRouter.estimateTokens('')
      expect(tokens).toBe(0)
    })
  })

  describe('calculateCost', () => {
    it('should calculate Haiku cost correctly', () => {
      const cost = ModelRouter.calculateCost(
        10000,
        1000,
        CLAUDE_MODELS.HAIKU
      )

      const expectedInputCost = (10000 / 1_000_000) * 0.80
      const expectedOutputCost = (1000 / 1_000_000) * 4.00
      const expected = expectedInputCost + expectedOutputCost

      expect(cost).toBeCloseTo(expected, 6)
    })

    it('should calculate Sonnet cost correctly', () => {
      const cost = ModelRouter.calculateCost(
        10000,
        1000,
        CLAUDE_MODELS.SONNET
      )

      const expectedInputCost = (10000 / 1_000_000) * 3.00
      const expectedOutputCost = (1000 / 1_000_000) * 15.00
      const expected = expectedInputCost + expectedOutputCost

      expect(cost).toBeCloseTo(expected, 6)
    })

    it('should show Haiku is cheaper than Sonnet', () => {
      const haikuCost = ModelRouter.calculateCost(10000, 1000, CLAUDE_MODELS.HAIKU)
      const sonnetCost = ModelRouter.calculateCost(10000, 1000, CLAUDE_MODELS.SONNET)

      expect(haikuCost).toBeLessThan(sonnetCost)
    })
  })

  describe('getModelById', () => {
    it('should return Haiku model', () => {
      const model = ModelRouter.getModelById('claude-3-5-haiku-20241022')
      expect(model).toBe(CLAUDE_MODELS.HAIKU)
    })

    it('should return Sonnet model', () => {
      const model = ModelRouter.getModelById('claude-sonnet-4-5-20250929')
      expect(model).toBe(CLAUDE_MODELS.SONNET)
    })

    it('should return null for unknown model', () => {
      const model = ModelRouter.getModelById('unknown-model')
      expect(model).toBeNull()
    })
  })

  describe('Cost Savings Analysis', () => {
    it('should show significant savings for simple queries', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quel est le score ?' }
      ]

      const decision = ModelRouter.selectModel(messages)

      expect(decision.model.id).toBe(CLAUDE_MODELS.HAIKU.id)
      expect(decision.potentialSavings).toBeGreaterThan(0)

      // Calculate savings as percentage of alternative cost
      const alternativeCost = decision.estimatedCost + decision.potentialSavings!
      const savingsPercentage = (decision.potentialSavings! / alternativeCost) * 100
      expect(savingsPercentage).toBeGreaterThan(50)
    })

    it('should calculate estimated cost for decision', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quel est le score ?' }
      ]

      const decision = ModelRouter.selectModel(messages)

      expect(decision.estimatedCost).toBeGreaterThan(0)
      expect(decision.estimatedCost).toBeLessThan(1)
    })
  })
})
