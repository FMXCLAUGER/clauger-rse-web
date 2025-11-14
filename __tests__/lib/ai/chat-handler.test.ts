import { describe, it, expect } from '@jest/globals'
import {
  extractCitations,
  extractPageReferences,
  formatMessageForExport,
  exportConversationAsMarkdown,
  downloadConversation,
  analyzeConversationSentiment,
  suggestFollowUpQuestions,
  validateMessage
} from '@/lib/ai/chat-handler'
import type { Message } from 'ai'

describe('Chat Handler', () => {
  describe('extractCitations', () => {
    it('should extract single citation', () => {
      const content = 'Some text *Source : Document X* more text'
      const citations = extractCitations(content)

      expect(citations).toEqual(['Document X'])
    })

    it('should extract multiple citations', () => {
      const content = '*Source : Doc 1* text *Source : Doc 2* more *Source : Doc 3*'
      const citations = extractCitations(content)

      expect(citations).toEqual(['Doc 1', 'Doc 2', 'Doc 3'])
    })

    it('should handle citations with various spacing', () => {
      const content = '*Source:Doc1* *Source : Doc2* *Source  :  Doc3*'
      const citations = extractCitations(content)

      expect(citations).toEqual(['Doc1', 'Doc2', 'Doc3'])
    })

    it('should trim whitespace from citations', () => {
      const content = '*Source :   Document with spaces   *'
      const citations = extractCitations(content)

      expect(citations).toEqual(['Document with spaces'])
    })

    it('should return empty array when no citations', () => {
      const content = 'Text without any citations'
      const citations = extractCitations(content)

      expect(citations).toEqual([])
    })

    it('should handle empty string', () => {
      const citations = extractCitations('')

      expect(citations).toEqual([])
    })

    it('should handle citations with special characters', () => {
      const content = '*Source : Rapport RSE 2024, p.15-20*'
      const citations = extractCitations(content)

      expect(citations).toEqual(['Rapport RSE 2024, p.15-20'])
    })

    it('should be case insensitive for "Source"', () => {
      const content = '*source : Doc1* *SOURCE : Doc2* *SoUrCe : Doc3*'
      const citations = extractCitations(content)

      expect(citations).toEqual(['Doc1', 'Doc2', 'Doc3'])
    })
  })

  describe('extractPageReferences', () => {
    it('should extract page references with "page" keyword', () => {
      const content = 'See page 5 and page 12'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([5, 12])
    })

    it('should extract page references with "p." notation', () => {
      const content = 'Mentioned on p. 3 and p. 15'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([3, 15])
    })

    it('should extract page references in parentheses', () => {
      const content = 'The data (page 7) shows that (page 10) we need'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([7, 10])
    })

    it('should deduplicate page numbers', () => {
      const content = 'page 5, page 7, page 5, page 7'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([5, 7])
    })

    it('should sort page numbers', () => {
      const content = 'page 20, page 5, page 15, page 3'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([3, 5, 15, 20])
    })

    it('should only include pages between 1 and 36', () => {
      const content = 'page 0, page 5, page 40, page 100'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([5])
    })

    it('should handle edge cases at boundaries', () => {
      const content = 'page 1, page 36, page 37'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([1, 36])
    })

    it('should return empty array when no pages', () => {
      const content = 'No page references here'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([])
    })

    it('should be case insensitive', () => {
      const content = 'Page 5, PAGE 10, p. 15'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([5, 10, 15])
    })

    it('should handle various spacing', () => {
      const content = 'page  5, p.   10, page    15'
      const pages = extractPageReferences(content)

      expect(pages).toEqual([5, 10, 15])
    })
  })

  describe('formatMessageForExport', () => {
    it('should format user message without timestamp', () => {
      const message: Message = {
        id: '1',
        role: 'user',
        content: 'What is the score?'
      }

      const formatted = formatMessageForExport(message)

      expect(formatted).toBe('### Utilisateur \n\nWhat is the score?\n')
    })

    it('should format assistant message without timestamp', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'The score is 6.2/10'
      }

      const formatted = formatMessageForExport(message)

      expect(formatted).toBe('### Assistant \n\nThe score is 6.2/10\n')
    })

    it('should format message with timestamp', () => {
      const date = new Date('2024-01-15T10:30:00')
      const message: Message = {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: date
      }

      const formatted = formatMessageForExport(message)

      expect(formatted).toContain('Utilisateur')
      expect(formatted).toContain('Hello')
      expect(formatted).toMatch(/\(\d{2}\/\d{2}\/\d{4}/)
    })

    it('should preserve message content formatting', () => {
      const message: Message = {
        id: '1',
        role: 'user',
        content: 'Line 1\n\nLine 2\n- Item 1\n- Item 2'
      }

      const formatted = formatMessageForExport(message)

      expect(formatted).toContain('Line 1\n\nLine 2\n- Item 1\n- Item 2')
    })
  })

  describe('exportConversationAsMarkdown', () => {
    it('should export empty conversation', () => {
      const markdown = exportConversationAsMarkdown([])

      expect(markdown).toContain('# Conversation avec l\'Assistant RSE Clauger')
      expect(markdown).toContain('Date d\'export :')
    })

    it('should export single message', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Hello' }
      ]

      const markdown = exportConversationAsMarkdown(messages)

      expect(markdown).toContain('# Conversation avec l\'Assistant RSE Clauger')
      expect(markdown).toContain('### Utilisateur')
      expect(markdown).toContain('Hello')
      expect(markdown).toContain('---')
    })

    it('should export multiple messages', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Question 1' },
        { id: '2', role: 'assistant', content: 'Answer 1' },
        { id: '3', role: 'user', content: 'Question 2' },
        { id: '4', role: 'assistant', content: 'Answer 2' }
      ]

      const markdown = exportConversationAsMarkdown(messages)

      expect(markdown).toContain('Question 1')
      expect(markdown).toContain('Answer 1')
      expect(markdown).toContain('Question 2')
      expect(markdown).toContain('Answer 2')
    })

    it('should include separator between messages', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Q1' },
        { id: '2', role: 'assistant', content: 'A1' }
      ]

      const markdown = exportConversationAsMarkdown(messages)
      const separators = markdown.match(/---/g)

      expect(separators).toBeTruthy()
      expect(separators!.length).toBeGreaterThanOrEqual(2)
    })

    it('should preserve message order', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'First' },
        { id: '2', role: 'assistant', content: 'Second' },
        { id: '3', role: 'user', content: 'Third' }
      ]

      const markdown = exportConversationAsMarkdown(messages)
      const firstIndex = markdown.indexOf('First')
      const secondIndex = markdown.indexOf('Second')
      const thirdIndex = markdown.indexOf('Third')

      expect(firstIndex).toBeLessThan(secondIndex)
      expect(secondIndex).toBeLessThan(thirdIndex)
    })
  })

  describe('downloadConversation', () => {
    let createElementSpy: jest.SpyInstance
    let createObjectURLSpy: jest.SpyInstance
    let revokeObjectURLSpy: jest.SpyInstance
    let mockLink: any

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      }

      // Mock URL methods if they don't exist
      if (!URL.createObjectURL) {
        URL.createObjectURL = jest.fn()
      }
      if (!URL.revokeObjectURL) {
        URL.revokeObjectURL = jest.fn()
      }

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink)
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink)
      createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should create download link', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Test' }
      ]

      downloadConversation(messages)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('blob:mock-url')
    })

    it('should set correct filename', () => {
      const messages: Message[] = []

      downloadConversation(messages)

      expect(mockLink.download).toMatch(/conversation-rse-\d+\.md/)
    })

    it('should trigger download', () => {
      const messages: Message[] = []

      downloadConversation(messages)

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should clean up DOM and URL', () => {
      const messages: Message[] = []

      downloadConversation(messages)

      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should create blob with markdown content', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Test message' }
      ]

      // Mock Blob constructor
      const mockBlob = {} as Blob
      const originalBlob = global.Blob
      global.Blob = jest.fn().mockImplementation((content, options) => {
        return mockBlob
      }) as any

      downloadConversation(messages)

      expect(global.Blob).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('Test message')]),
        { type: 'text/markdown' }
      )

      // Restore
      global.Blob = originalBlob
    })
  })

  describe('analyzeConversationSentiment', () => {
    it('should analyze empty conversation', () => {
      const result = analyzeConversationSentiment([])

      expect(result.totalQuestions).toBe(0)
      expect(result.totalResponses).toBe(0)
      expect(result.averageResponseLength).toBe(0)
      expect(result.topics).toEqual([])
    })

    it('should count questions and responses', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Q1' },
        { id: '2', role: 'assistant', content: 'A1' },
        { id: '3', role: 'user', content: 'Q2' },
        { id: '4', role: 'assistant', content: 'A2' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.totalQuestions).toBe(2)
      expect(result.totalResponses).toBe(2)
    })

    it('should calculate average response length', () => {
      const messages: Message[] = [
        { id: '1', role: 'assistant', content: 'a'.repeat(100) },
        { id: '2', role: 'assistant', content: 'a'.repeat(200) }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.averageResponseLength).toBe(150)
    })

    it('should detect environment topic', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quelle est la réduction des émissions carbone ?' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.topics).toContain('environnement')
    })

    it('should detect social topic', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quelle est la politique de formation ?' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.topics).toContain('social')
    })

    it('should detect gouvernance topic', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Comment fonctionne la gouvernance ?' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.topics).toContain('gouvernance')
    })

    it('should detect scores topic', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quel est le score de notation ?' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.topics).toContain('scores')
    })

    it('should detect recommandations topic', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quelles sont les recommandations d\'amélioration ?' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.topics).toContain('recommandations')
    })

    it('should detect multiple topics', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Quel est le score environnement et les recommandations ?' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.topics).toContain('environnement')
      expect(result.topics).toContain('scores')
      expect(result.topics).toContain('recommandations')
    })

    it('should only analyze user messages for topics', () => {
      const messages: Message[] = [
        { id: '1', role: 'assistant', content: 'environnement carbone' },
        { id: '2', role: 'user', content: 'autre chose' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.topics).not.toContain('environnement')
    })

    it('should handle mixed content', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Q1' },
        { id: '2', role: 'user', content: 'Q2' },
        { id: '3', role: 'assistant', content: 'a'.repeat(100) },
        { id: '4', role: 'user', content: 'formation et gouvernance' }
      ]

      const result = analyzeConversationSentiment(messages)

      expect(result.totalQuestions).toBe(3)
      expect(result.totalResponses).toBe(1)
      expect(result.averageResponseLength).toBe(100)
      expect(result.topics.length).toBeGreaterThan(0)
    })
  })

  describe('suggestFollowUpQuestions', () => {
    it('should suggest questions for score-related content', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Le score environnement est de 6.2/10'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions).toContain('Comment améliorer ce score ?')
      expect(suggestions).toContain('Quelles sont les recommandations associées ?')
      expect(suggestions.length).toBeLessThanOrEqual(3)
    })

    it('should suggest questions for environment-related content', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Les émissions carbone ont diminué'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions).toContain('Quels sont les objectifs de réduction carbone ?')
      expect(suggestions).toContain('Comment Clauger mesure-t-il son impact environnemental ?')
    })

    it('should suggest questions for social-related content', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Le plan de formation est complet'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions).toContain('Quel est le budget de formation ?')
      expect(suggestions).toContain('Comment évolue le turnover ?')
    })

    it('should suggest questions for governance-related content', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'La gouvernance est structurée en comités'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions).toContain('Comment est structurée la gouvernance RSE ?')
      expect(suggestions).toContain('Y a-t-il des membres indépendants ?')
    })

    it('should provide generic suggestions for unrecognized content', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Some random content'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions).toContain('Peux-tu approfondir ce point ?')
      expect(suggestions).toContain('Y a-t-il d\'autres données sur ce sujet ?')
      expect(suggestions).toContain('Quelles sont les recommandations liées ?')
    })

    it('should return exactly 3 suggestions', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Some content'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions.length).toBe(3)
    })

    it('should be case insensitive', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Le SCORE ENVIRONNEMENT est bon'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions.length).toBe(3)
      expect(suggestions.some(s => s.includes('score'))).toBe(true)
    })

    it('should prioritize specific suggestions over generic ones', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Score de notation environnement'
      }

      const suggestions = suggestFollowUpQuestions(message)

      expect(suggestions).not.toContain('Peux-tu approfondir ce point ?')
    })
  })

  describe('validateMessage', () => {
    it('should accept valid message', () => {
      const result = validateMessage('This is a valid message')

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject message shorter than 3 characters', () => {
      const result = validateMessage('ab')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Votre message doit contenir au moins 3 caractères.')
    })

    it('should accept message with exactly 3 characters', () => {
      const result = validateMessage('abc')

      expect(result.isValid).toBe(true)
    })

    it('should reject message longer than 2000 characters', () => {
      const result = validateMessage('a'.repeat(2001))

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Votre message ne peut pas dépasser 2000 caractères.')
    })

    it('should accept message with exactly 2000 characters', () => {
      const result = validateMessage('a'.repeat(2000))

      expect(result.isValid).toBe(true)
    })

    it('should trim whitespace before validation', () => {
      const result = validateMessage('   ab   ')

      expect(result.isValid).toBe(false)
    })

    it('should accept message with whitespace trimmed to valid length', () => {
      const result = validateMessage('   abc   ')

      expect(result.isValid).toBe(true)
    })

    it('should reject empty string', () => {
      const result = validateMessage('')

      expect(result.isValid).toBe(false)
    })

    it('should reject whitespace-only string', () => {
      const result = validateMessage('   ')

      expect(result.isValid).toBe(false)
    })

    it('should accept message with special characters', () => {
      const result = validateMessage('Hello! Comment ça va? Émissions CO₂')

      expect(result.isValid).toBe(true)
    })

    it('should accept message with newlines', () => {
      const result = validateMessage('Line 1\nLine 2\nLine 3')

      expect(result.isValid).toBe(true)
    })

    it('should accept message at boundary conditions', () => {
      const min = validateMessage('abc')
      const max = validateMessage('a'.repeat(2000))

      expect(min.isValid).toBe(true)
      expect(max.isValid).toBe(true)
    })
  })
})
