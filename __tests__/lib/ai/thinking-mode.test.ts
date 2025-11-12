import { shouldUseThinking, getThinkingConfig, supportsThinking } from '@/lib/ai/thinking-mode'

describe('Extended Thinking Mode', () => {
  describe('shouldUseThinking', () => {
    it('should detect analysis keywords', () => {
      const queries = [
        'Analyser en profondeur les résultats',
        'Analyser détaillée des données',
        'Comparer avec les standards',
        'Pourquoi ce résultat plutôt que celui-là',
        'Évaluer la stratégie RSE'
      ]

      queries.forEach(query => {
        expect(shouldUseThinking(query)).toBe(true)
      })
    })

    it('should detect complexity words', () => {
      const query = 'Je voudrais analyser et comparer les résultats en détail'

      expect(shouldUseThinking(query)).toBe(true)
    })

    it('should detect long complex queries', () => {
      const query = 'A'.repeat(300) + ' questions multiples? Et aussi ceci? Et enfin cela?'

      expect(shouldUseThinking(query)).toBe(true)
    })

    it('should not trigger on simple queries', () => {
      const simpleQueries = [
        'Quel est le score RSE ?',
        'Bonjour',
        'Merci',
        'Afficher les recommandations'
      ]

      simpleQueries.forEach(query => {
        expect(shouldUseThinking(query)).toBe(false)
      })
    })

    it('should handle edge cases', () => {
      expect(shouldUseThinking('')).toBe(false)
      expect(shouldUseThinking('a')).toBe(false)
    })
  })

  describe('getThinkingConfig', () => {
    it('should return disabled for simple queries', () => {
      const config = getThinkingConfig('Quel est le score ?')

      expect(config.enabled).toBe(false)
      expect(config.budget_tokens).toBe(0)
    })

    it('should return basic budget for short complex queries', () => {
      const config = getThinkingConfig('Analyser en profondeur')

      expect(config.enabled).toBe(true)
      expect(config.budget_tokens).toBe(10000)
    })

    it('should return increased budget for medium queries', () => {
      const longQuery = 'A'.repeat(600) + ' analyser en profondeur'
      const config = getThinkingConfig(longQuery)

      expect(config.enabled).toBe(true)
      expect(config.budget_tokens).toBe(16000)
    })

    it('should return max budget for very long queries', () => {
      const veryLongQuery = 'A'.repeat(1200) + ' analyser en profondeur'
      const config = getThinkingConfig(veryLongQuery)

      expect(config.enabled).toBe(true)
      expect(config.budget_tokens).toBe(20000)
    })

    it('should increase budget for "approfondie" keyword', () => {
      // String with >500 chars, "analyser" keyword (triggers thinking), and "approfondie" keyword should trigger 16K budget
      const longQuery = 'A'.repeat(520) + ' analyser en profondeur et de manière approfondie'
      const config = getThinkingConfig(longQuery)

      expect(config.enabled).toBe(true)
      expect(config.budget_tokens).toBe(16000)
    })
  })

  describe('supportsThinking', () => {
    it('should return true for supported models', () => {
      expect(supportsThinking('claude-sonnet-4-5-20250929')).toBe(true)
      expect(supportsThinking('claude-opus-4')).toBe(true)
      expect(supportsThinking('claude-haiku-4-5')).toBe(true)
    })

    it('should return false for unsupported models', () => {
      expect(supportsThinking('gpt-4')).toBe(false)
      expect(supportsThinking('claude-2')).toBe(false)
      expect(supportsThinking('random-model')).toBe(false)
    })

    it('should handle partial model names', () => {
      expect(supportsThinking('claude-sonnet-4-5-20250929')).toBe(true)
      expect(supportsThinking('claude-opus-4-20250101')).toBe(true)
    })
  })

  describe('Integration scenarios', () => {
    it('should provide appropriate config for RSE analysis queries', () => {
      const queries = [
        'Analyser en profondeur les points faibles du rapport RSE de Clauger',
        'Comparer avec les standards du secteur les performances environnementales',
        'Évaluer la stratégie sociale et proposer des recommandations détaillées'
      ]

      queries.forEach(query => {
        const config = getThinkingConfig(query)
        expect(config.enabled).toBe(true)
        expect(config.budget_tokens).toBeGreaterThanOrEqual(10000)
      })
    })

    it('should not trigger thinking for simple info queries', () => {
      const queries = [
        'Quel est le score global ?',
        'Afficher les scores',
        'Merci pour ces informations'
      ]

      queries.forEach(query => {
        const config = getThinkingConfig(query)
        expect(config.enabled).toBe(false)
      })
    })
  })
})
