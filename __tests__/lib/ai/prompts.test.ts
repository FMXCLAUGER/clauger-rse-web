import {
  SYSTEM_PROMPT,
  CACHE_CONTROL_INSTRUCTION,
  WELCOME_MESSAGE,
  SUGGESTED_QUESTIONS,
  ERROR_MESSAGE,
  NO_CONTEXT_MESSAGE,
  buildSystemMessage,
  buildSystemMessageWithCaching,
  formatCitation,
  formatScore
} from '@/lib/ai/prompts'

describe('AI Prompts', () => {
  describe('SYSTEM_PROMPT', () => {
    it('should be a non-empty string', () => {
      expect(SYSTEM_PROMPT).toBeDefined()
      expect(typeof SYSTEM_PROMPT).toBe('string')
      expect(SYSTEM_PROMPT.length).toBeGreaterThan(0)
    })

    it('should mention Clauger RSE', () => {
      expect(SYSTEM_PROMPT).toContain('Clauger')
      expect(SYSTEM_PROMPT).toContain('RSE')
    })

    it('should include role section', () => {
      expect(SYSTEM_PROMPT).toContain('TON RÔLE')
    })

    it('should include context section', () => {
      expect(SYSTEM_PROMPT).toContain('CONTEXTE DE L\'ENTREPRISE')
      expect(SYSTEM_PROMPT).toContain('3 200+ collaborateurs')
      expect(SYSTEM_PROMPT).toContain('50+ ans d\'expérience')
    })

    it('should include responsibilities section', () => {
      expect(SYSTEM_PROMPT).toContain('TES RESPONSABILITÉS')
      expect(SYSTEM_PROMPT).toContain('Répondre précisément')
      expect(SYSTEM_PROMPT).toContain('Citer tes sources')
      expect(SYSTEM_PROMPT).toContain('Être transparent')
    })

    it('should include examples section', () => {
      expect(SYSTEM_PROMPT).toContain('EXEMPLES DE BONNES RÉPONSES')
      expect(SYSTEM_PROMPT).toContain('score RSE global')
    })

    it('should include communication style section', () => {
      expect(SYSTEM_PROMPT).toContain('STYLE DE COMMUNICATION')
      expect(SYSTEM_PROMPT).toContain('Français exclusivement')
      expect(SYSTEM_PROMPT).toContain('Markdown')
    })

    it('should include prohibitions section', () => {
      expect(SYSTEM_PROMPT).toContain('INTERDICTIONS')
      expect(SYSTEM_PROMPT).toContain('Ne jamais inventer de données')
    })

    it('should include off-topic handling', () => {
      expect(SYSTEM_PROMPT).toContain('GESTION DES QUESTIONS HORS SUJET')
    })

    it('should include missing info handling', () => {
      expect(SYSTEM_PROMPT).toContain('GESTION DES INFORMATIONS MANQUANTES')
    })
  })

  describe('CACHE_CONTROL_INSTRUCTION', () => {
    it('should have correct structure', () => {
      expect(CACHE_CONTROL_INSTRUCTION).toBeDefined()
      expect(CACHE_CONTROL_INSTRUCTION.type).toBe('text')
      expect(CACHE_CONTROL_INSTRUCTION.text).toBe(SYSTEM_PROMPT)
      expect(CACHE_CONTROL_INSTRUCTION.cache_control).toBeDefined()
    })

    it('should have ephemeral cache control type', () => {
      expect(CACHE_CONTROL_INSTRUCTION.cache_control.type).toBe('ephemeral')
    })

    it('should contain the full system prompt', () => {
      expect(CACHE_CONTROL_INSTRUCTION.text).toContain('Clauger')
      expect(CACHE_CONTROL_INSTRUCTION.text).toContain('RSE')
    })
  })

  describe('WELCOME_MESSAGE', () => {
    it('should be a non-empty string', () => {
      expect(WELCOME_MESSAGE).toBeDefined()
      expect(typeof WELCOME_MESSAGE).toBe('string')
      expect(WELCOME_MESSAGE.length).toBeGreaterThan(0)
    })

    it('should include greeting', () => {
      expect(WELCOME_MESSAGE).toContain('Bonjour')
    })

    it('should mention Clauger 2025 report', () => {
      expect(WELCOME_MESSAGE).toContain('Clauger 2025')
    })

    it('should list capabilities', () => {
      expect(WELCOME_MESSAGE).toContain('Je peux vous aider')
      expect(WELCOME_MESSAGE).toContain('performances RSE')
      expect(WELCOME_MESSAGE).toContain('scores')
      expect(WELCOME_MESSAGE).toContain('recommandations')
    })

    it('should include suggested questions section', () => {
      expect(WELCOME_MESSAGE).toContain('Questions suggérées')
      expect(WELCOME_MESSAGE).toContain('score RSE global')
    })

    it('should use appropriate emojis', () => {
      expect(WELCOME_MESSAGE).toMatch(/[👋📊🎯💡🔍]/)
    })
  })

  describe('SUGGESTED_QUESTIONS', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(SUGGESTED_QUESTIONS)).toBe(true)
      expect(SUGGESTED_QUESTIONS.length).toBeGreaterThan(0)
    })

    it('should have exactly 10 questions', () => {
      expect(SUGGESTED_QUESTIONS).toHaveLength(10)
    })

    it('all questions should be strings', () => {
      SUGGESTED_QUESTIONS.forEach(question => {
        expect(typeof question).toBe('string')
        expect(question.length).toBeGreaterThan(0)
      })
    })

    it('should include score-related question', () => {
      const hasScoreQuestion = SUGGESTED_QUESTIONS.some(q =>
        q.toLowerCase().includes('score')
      )
      expect(hasScoreQuestion).toBe(true)
    })

    it('should include environment-related question', () => {
      const hasEnvQuestion = SUGGESTED_QUESTIONS.some(q =>
        q.toLowerCase().includes('environnemental')
      )
      expect(hasEnvQuestion).toBe(true)
    })

    it('should include social data question', () => {
      const hasSocialQuestion = SUGGESTED_QUESTIONS.some(q =>
        q.toLowerCase().includes('social')
      )
      expect(hasSocialQuestion).toBe(true)
    })

    it('should include recommendations question', () => {
      const hasRecoQuestion = SUGGESTED_QUESTIONS.some(q =>
        q.toLowerCase().includes('recommandations')
      )
      expect(hasRecoQuestion).toBe(true)
    })

    it('all questions should end with question mark', () => {
      SUGGESTED_QUESTIONS.forEach(question => {
        expect(question).toMatch(/\?$/)
      })
    })
  })

  describe('ERROR_MESSAGE', () => {
    it('should be a non-empty string', () => {
      expect(ERROR_MESSAGE).toBeDefined()
      expect(typeof ERROR_MESSAGE).toBe('string')
      expect(ERROR_MESSAGE.length).toBeGreaterThan(0)
    })

    it('should apologize', () => {
      expect(ERROR_MESSAGE).toContain('Désolé')
    })

    it('should suggest retry', () => {
      expect(ERROR_MESSAGE).toContain('réessayer')
    })

    it('should mention RSE Clauger 2025', () => {
      expect(ERROR_MESSAGE).toContain('RSE Clauger 2025')
    })
  })

  describe('NO_CONTEXT_MESSAGE', () => {
    it('should be a non-empty string', () => {
      expect(NO_CONTEXT_MESSAGE).toBeDefined()
      expect(typeof NO_CONTEXT_MESSAGE).toBe('string')
      expect(NO_CONTEXT_MESSAGE.length).toBeGreaterThan(0)
    })

    it('should explain the issue', () => {
      expect(NO_CONTEXT_MESSAGE).toContain('charger le contexte')
    })

    it('should list possible causes', () => {
      expect(NO_CONTEXT_MESSAGE).toContain('problème de chargement')
      expect(NO_CONTEXT_MESSAGE).toContain('configuration incorrecte')
    })

    it('should suggest retry', () => {
      expect(NO_CONTEXT_MESSAGE).toContain('réessayer')
    })
  })

  describe('buildSystemMessage', () => {
    it('should build message with context', () => {
      const context = 'Test RSE data'
      const result = buildSystemMessage(context)

      expect(result).toContain(SYSTEM_PROMPT)
      expect(result).toContain(context)
    })

    it('should include context section header', () => {
      const context = 'Test data'
      const result = buildSystemMessage(context)

      expect(result).toContain('DONNÉES DU RAPPORT RSE CLAUGER')
    })

    it('should include instructions to respond', () => {
      const context = 'Test data'
      const result = buildSystemMessage(context)

      expect(result).toContain('Réponds maintenant aux questions')
    })

    it('should handle empty context', () => {
      const result = buildSystemMessage('')

      expect(result).toContain(SYSTEM_PROMPT)
      expect(result).toContain('DONNÉES DU RAPPORT RSE CLAUGER')
    })

    it('should handle multiline context', () => {
      const context = 'Line 1\nLine 2\nLine 3'
      const result = buildSystemMessage(context)

      expect(result).toContain('Line 1')
      expect(result).toContain('Line 2')
      expect(result).toContain('Line 3')
    })

    it('should handle special characters in context', () => {
      const context = 'Score: 62/100 - "Émergent" (niveau intermédiaire)'
      const result = buildSystemMessage(context)

      expect(result).toContain('62/100')
      expect(result).toContain('Émergent')
    })
  })

  describe('buildSystemMessageWithCaching', () => {
    it('should build message with context', () => {
      const context = 'Test RSE data'
      const result = buildSystemMessageWithCaching(context)

      expect(result).toContain(SYSTEM_PROMPT)
      expect(result).toContain(context)
    })

    it('should have same structure as buildSystemMessage', () => {
      const context = 'Test data'
      const withCache = buildSystemMessageWithCaching(context)
      const without = buildSystemMessage(context)

      expect(withCache).toBe(without)
    })

    it('should include context section header', () => {
      const context = 'Test data'
      const result = buildSystemMessageWithCaching(context)

      expect(result).toContain('DONNÉES DU RAPPORT RSE CLAUGER')
    })

    it('should handle empty context', () => {
      const result = buildSystemMessageWithCaching('')

      expect(result).toContain(SYSTEM_PROMPT)
    })

    it('should handle large context', () => {
      const largeContext = 'x'.repeat(10000)
      const result = buildSystemMessageWithCaching(largeContext)

      expect(result).toContain(SYSTEM_PROMPT)
      expect(result).toContain(largeContext)
    })
  })

  describe('formatCitation', () => {
    it('should format citation with section only', () => {
      const result = formatCitation('Environnement')

      expect(result).toBe('*Source : Environnement*')
    })

    it('should format citation with section and page', () => {
      const result = formatCitation('Environnement', 12)

      expect(result).toBe('*Source : Environnement (page 12)*')
    })

    it('should handle section with special characters', () => {
      const result = formatCitation('Section "Gouvernance" & Éthique')

      expect(result).toContain('Section "Gouvernance" & Éthique')
    })

    it('should handle page 0', () => {
      const result = formatCitation('Introduction', 0)

      expect(result).toBe('*Source : Introduction (page 0)*')
    })

    it('should handle large page numbers', () => {
      const result = formatCitation('Annexes', 999)

      expect(result).toBe('*Source : Annexes (page 999)*')
    })

    it('should use italic markdown format', () => {
      const result = formatCitation('Test')

      expect(result).toMatch(/^\*Source : .+\*$/)
    })

    it('should handle undefined page explicitly', () => {
      const result = formatCitation('Test', undefined)

      expect(result).toBe('*Source : Test*')
    })
  })

  describe('formatScore', () => {
    it('should format score with defaults', () => {
      const result = formatScore(7.5, 10)

      expect(result).toContain('7.5/10')
      expect(result).toContain('75%')
    })

    it('should show checkmark for high scores (>=75%)', () => {
      const result = formatScore(8, 10)

      expect(result).toContain('✅')
      expect(result).toContain('80%')
    })

    it('should show warning for medium scores (50-74%)', () => {
      const result = formatScore(6, 10)

      expect(result).toContain('⚠️')
      expect(result).toContain('60%')
    })

    it('should show cross for low scores (<50%)', () => {
      const result = formatScore(4, 10)

      expect(result).toContain('❌')
      expect(result).toContain('40%')
    })

    it('should format score with label', () => {
      const result = formatScore(7.5, 10, 'Environnement')

      expect(result).toContain('**Environnement**')
      expect(result).toContain('7.5/10')
    })

    it('should handle custom max score', () => {
      const result = formatScore(50, 100)

      expect(result).toContain('50/100')
      expect(result).toContain('50%')
      expect(result).toContain('⚠️')
    })

    it('should handle score of 0', () => {
      const result = formatScore(0, 10)

      expect(result).toContain('0/10')
      expect(result).toContain('0%')
      expect(result).toContain('❌')
    })

    it('should handle perfect score', () => {
      const result = formatScore(10, 10)

      expect(result).toContain('10/10')
      expect(result).toContain('100%')
      expect(result).toContain('✅')
    })

    it('should round percentage correctly', () => {
      const result = formatScore(7.4, 10)

      expect(result).toContain('74%')
    })

    it('should handle decimal scores', () => {
      const result = formatScore(4.8, 10, 'Environnement')

      expect(result).toContain('4.8/10')
      expect(result).toContain('48%')
      expect(result).toContain('❌')
    })

    it('should use bold markdown for label', () => {
      const result = formatScore(5, 10, 'Test Label')

      expect(result).toMatch(/^\*\*Test Label\*\*/)
    })

    it('should handle edge case at 75% boundary', () => {
      const result = formatScore(7.5, 10)

      expect(result).toContain('✅')
    })

    it('should handle edge case at 50% boundary', () => {
      const result = formatScore(5, 10)

      expect(result).toContain('⚠️')
    })

    it('should handle label with special characters', () => {
      const result = formatScore(6, 10, 'Score "RSE" & Gouvernance')

      expect(result).toContain('**Score "RSE" & Gouvernance**')
    })
  })
})
