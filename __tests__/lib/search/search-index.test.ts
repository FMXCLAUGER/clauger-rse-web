import { SearchIndex, getSearchIndex } from '@/lib/search/search-index'
import type { OCRData } from '@/lib/search/types'

// Mock FlexSearch Document
jest.mock('flexsearch/dist/module/document', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      search: jest.fn().mockReturnValue([]),
    })),
  }
})

describe('SearchIndex', () => {
  let searchIndex: SearchIndex
  let mockDate: jest.SpyInstance

  beforeEach(() => {
    searchIndex = new SearchIndex()
    mockDate = jest.spyOn(Date, 'now').mockReturnValue(1000000)
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create a SearchIndex instance', () => {
      expect(searchIndex).toBeInstanceOf(SearchIndex)
    })

    it('should initialize FlexSearch Document with correct config', () => {
      const Document = require('flexsearch/dist/module/document').default
      expect(Document).toHaveBeenCalledWith({
        charset: 'latin:advanced',
        tokenize: 'forward',
        resolution: 9,
        context: {
          resolution: 5,
          depth: 2,
          bidirectional: true,
        },
        cache: 100,
        filter: expect.any(Function),
        document: {
          id: 'id',
          store: ['id', 'pageNumber', 'title'],
          index: ['title', 'content'],
        },
      })
    })

    it('should have a filter function that filters short words', () => {
      const Document = require('flexsearch/dist/module/document').default
      const config = Document.mock.calls[Document.mock.calls.length - 1][0]
      const filter = config.filter

      expect(filter('ab')).toBe(false) // Too short
      expect(filter('abc')).toBe(true) // Length 3, ok
      expect(filter('test')).toBe(true) // Length > 3, ok
    })

    it('should have a filter function that filters French stopwords', () => {
      const Document = require('flexsearch/dist/module/document').default
      const config = Document.mock.calls[Document.mock.calls.length - 1][0]
      const filter = config.filter

      expect(filter('le')).toBe(false)
      expect(filter('la')).toBe(false)
      expect(filter('les')).toBe(false)
      expect(filter('pour')).toBe(false)
      expect(filter('dans')).toBe(false)
      expect(filter('avec')).toBe(false)
    })

    it('should have a filter function that allows non-stopwords', () => {
      const Document = require('flexsearch/dist/module/document').default
      const config = Document.mock.calls[Document.mock.calls.length - 1][0]
      const filter = config.filter

      expect(filter('environnement')).toBe(true)
      expect(filter('énergie')).toBe(true)
      expect(filter('clauger')).toBe(true)
    })
  })

  describe('loadData', () => {
    it('should load OCR data and return stats', async () => {
      const mockData: OCRData = {
        metadata: {
          totalPages: 2,
          successful: 2,
          failed: 0,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: 'Test page 1 content',
            confidence: 0.95,
          },
          {
            id: 2,
            pageNumber: 2,
            filename: 'page2.jpg',
            text: 'Test page 2 content',
            confidence: 0.93,
          },
        ],
      }

      mockDate.mockReturnValueOnce(1000000).mockReturnValueOnce(1000100)

      const result = await searchIndex.loadData(mockData)

      expect(result).toEqual({
        totalPages: 2,
        indexedPages: 2,
        loadTime: 100,
      })
      expect(console.log).toHaveBeenCalledWith('Search index loaded in 100ms')
    })

    it('should skip pages with errors', async () => {
      const mockData: OCRData = {
        metadata: {
          totalPages: 3,
          successful: 2,
          failed: 1,
          language: 'fr',
          avgConfidence: 0.9,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: 'Test page 1',
            confidence: 0.95,
          },
          {
            id: 2,
            pageNumber: 2,
            filename: 'page2.jpg',
            text: '',
            confidence: 0,
            error: 'OCR failed',
          },
          {
            id: 3,
            pageNumber: 3,
            filename: 'page3.jpg',
            text: 'Test page 3',
            confidence: 0.92,
          },
        ],
      }

      const result = await searchIndex.loadData(mockData)

      expect(result.totalPages).toBe(3)
      expect(result.indexedPages).toBe(2)
    })

    it('should skip pages without text', async () => {
      const mockData: OCRData = {
        metadata: {
          totalPages: 2,
          successful: 1,
          failed: 1,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: 'Test content',
            confidence: 0.95,
          },
          {
            id: 2,
            pageNumber: 2,
            filename: 'page2.jpg',
            text: '',
            confidence: 0.8,
          },
        ],
      }

      const result = await searchIndex.loadData(mockData)

      expect(result.indexedPages).toBe(1)
    })

    it('should handle empty pages array', async () => {
      const mockData: OCRData = {
        metadata: {
          totalPages: 0,
          successful: 0,
          failed: 0,
          language: 'fr',
          avgConfidence: 0,
          processingTime: 0,
          timestamp: '2024-01-01',
        },
        pages: [],
      }

      const result = await searchIndex.loadData(mockData)

      expect(result).toEqual({
        totalPages: 0,
        indexedPages: 0,
        loadTime: 0,
      })
    })
  })

  describe('search', () => {
    beforeEach(async () => {
      const mockData: OCRData = {
        metadata: {
          totalPages: 3,
          successful: 3,
          failed: 0,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: 'Environnement et développement durable chez Clauger',
            confidence: 0.95,
          },
          {
            id: 2,
            pageNumber: 2,
            filename: 'page2.jpg',
            text: 'Énergie renouvelable et efficacité énergétique',
            confidence: 0.93,
          },
          {
            id: 3,
            pageNumber: 3,
            filename: 'page3.jpg',
            text: 'Solutions innovantes pour le climat',
            confidence: 0.92,
          },
        ],
      }

      await searchIndex.loadData(mockData)
    })

    it('should return empty array for queries shorter than 2 characters', () => {
      expect(searchIndex.search('')).toEqual([])
      expect(searchIndex.search('a')).toEqual([])
      expect(searchIndex.search(' ')).toEqual([])
    })

    it('should return empty array for whitespace-only queries', () => {
      expect(searchIndex.search('   ')).toEqual([])
      expect(searchIndex.search('\t\n')).toEqual([])
    })

    it('should search with default options', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            {
              id: 1,
              doc: { pageNumber: 1, title: 'Page 1' },
            },
          ],
        },
      ])

      const results = searchIndex.search('environnement')

      expect(mockIndex.search).toHaveBeenCalledWith('environnement', {
        index: ['title', 'content'],
        enrich: true,
        limit: 16, // limit * 2
      })
      expect(results).toHaveLength(1)
      expect(results[0].pageNumber).toBe(1)
    })

    it('should respect custom limit option', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([])

      searchIndex.search('test', { limit: 5 })

      expect(mockIndex.search).toHaveBeenCalledWith('test', {
        index: ['title', 'content'],
        enrich: true,
        limit: 10, // limit * 2
      })
    })

    it('should boost title matches higher than content matches', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'title',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
        {
          field: 'content',
          result: [
            { id: 2, doc: { pageNumber: 2, title: 'Page 2' } },
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('test')

      // Page 1 should be first (title boost: 3 + content: 1 = 4)
      // Page 2 should be second (content: 1)
      expect(results[0].pageNumber).toBe(1)
      expect(results[0].score).toBe(4)
      expect(results[1].pageNumber).toBe(2)
      expect(results[1].score).toBe(1)
    })

    it('should include snippets by default', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement')

      expect(results[0].snippet).toBeDefined()
      expect(results[0].snippet.length).toBeGreaterThan(0)
      expect(results[0].highlightedSnippet).toBeDefined()
    })

    it('should exclude snippets when includeSnippets is false', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('test', { includeSnippets: false })

      expect(results[0].snippet).toBe('')
      expect(results[0].highlightedSnippet).toBe('')
    })

    it('should respect custom snippetLength', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement', { snippetLength: 50 })

      expect(results[0].snippet.length).toBeLessThanOrEqual(60) // +ellipsis
    })

    it('should sort results by score descending', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
            { id: 2, doc: { pageNumber: 2, title: 'Page 2' } },
            { id: 3, doc: { pageNumber: 3, title: 'Page 3' } },
          ],
        },
        {
          field: 'title',
          result: [
            { id: 2, doc: { pageNumber: 2, title: 'Page 2' } },
          ],
        },
      ])

      const results = searchIndex.search('test')

      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score)
      expect(results[1].score).toBeGreaterThanOrEqual(results[2].score)
    })

    it('should limit results to specified limit', async () => {
      // Create a new index with many pages
      const largeIndex = new SearchIndex()
      const mockData: OCRData = {
        metadata: {
          totalPages: 20,
          successful: 20,
          failed: 0,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          pageNumber: i + 1,
          filename: `page${i + 1}.jpg`,
          text: `Test content for page ${i + 1}`,
          confidence: 0.95,
        })),
      }

      await largeIndex.loadData(mockData)

      const mockIndex = (largeIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            doc: { pageNumber: i + 1, title: `Page ${i + 1}` },
          })),
        },
      ])

      const results = largeIndex.search('test', { limit: 5 })

      expect(results).toHaveLength(5)
    })

    it('should include confidence score in results', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement')

      expect(results[0].confidence).toBe(0.95)
    })
  })

  describe('extractSnippet (via search)', () => {
    beforeEach(async () => {
      const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Environnement et développement durable sont essentiels pour notre avenir. ' +
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

      const mockData: OCRData = {
        metadata: {
          totalPages: 1,
          successful: 1,
          failed: 0,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: longText,
            confidence: 0.95,
          },
        ],
      }

      await searchIndex.loadData(mockData)
    })

    it('should extract snippet around query match', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement')

      expect(results[0].snippet).toContain('Environnement')
    })

    it('should highlight query terms in snippet', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement')

      expect(results[0].highlightedSnippet).toContain('<mark>')
      expect(results[0].highlightedSnippet).toContain('</mark>')
    })

    it('should add ellipsis at start if snippet starts mid-text', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement', { snippetLength: 80 })

      // "Environnement" appears after "Lorem ipsum...", so should have ellipsis
      expect(results[0].snippet).toMatch(/^\.\.\./)
    })

    it('should add ellipsis at end if snippet ends mid-text', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('lorem', { snippetLength: 50 })

      expect(results[0].snippet).toMatch(/\.\.\.$/)
    })

    it('should handle queries with no matches in text', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'title',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('nonexistent', { snippetLength: 50 })

      // Should return start of text when no match found
      expect(results[0].snippet).toContain('Lorem')
    })

    it('should handle multiple query terms', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement développement')

      expect(results[0].highlightedSnippet).toContain('<mark>')
      // Should highlight at least one of the terms
    })

    it('should filter out stopwords from query terms', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('le pour dans environnement')

      // Should only highlight "environnement", not stopwords
      const highlightCount = (results[0].highlightedSnippet.match(/<mark>/g) || []).length
      expect(highlightCount).toBeGreaterThan(0)
    })

    it('should escape special regex characters in query terms', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      // Should not throw with special characters
      expect(() => {
        searchIndex.search('test (parentheses) [brackets]')
      }).not.toThrow()
    })

    it('should handle query with only stopwords', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('le la les pour dans')

      // All stopwords filtered out, should return start of text
      expect(results[0].snippet).toContain('Lorem')
    })

    it('should handle very short snippet length', () => {
      const mockIndex = (searchIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = searchIndex.search('environnement', { snippetLength: 20 })

      // Short snippet with ellipsis
      expect(results[0].snippet).toBeDefined()
      expect(results[0].snippet.length).toBeGreaterThan(0)
    })

    it('should add ellipsis when text is longer than maxLength and no query terms', async () => {
      const longIndex = new SearchIndex()
      const veryLongText = 'A'.repeat(300)

      const mockData: OCRData = {
        metadata: {
          totalPages: 1,
          successful: 1,
          failed: 0,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: veryLongText,
            confidence: 0.95,
          },
        ],
      }

      await longIndex.loadData(mockData)

      const mockIndex = (longIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'title',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      // Query with only stopwords, so queryTerms.length === 0
      const results = longIndex.search('le la les', { snippetLength: 100 })

      expect(results[0].snippet).toMatch(/\.\.\.$/)
    })

    it('should handle word boundary alignment at start of snippet', async () => {
      const boundaryIndex = new SearchIndex()
      const textWithSpaces = 'This is some text before. Environnement durable recherche texte. Some text after this point.'

      const mockData: OCRData = {
        metadata: {
          totalPages: 1,
          successful: 1,
          failed: 0,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: textWithSpaces,
            confidence: 0.95,
          },
        ],
      }

      await boundaryIndex.loadData(mockData)

      const mockIndex = (boundaryIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = boundaryIndex.search('environnement', { snippetLength: 40 })

      // Should find word boundary and adjust
      expect(results[0].snippet).toBeDefined()
    })

    it('should handle word boundary alignment at end of snippet', async () => {
      const boundaryIndex = new SearchIndex()
      const textWithSpaces = 'Environnement durable. Some longer text after this that extends beyond the snippet length limit.'

      const mockData: OCRData = {
        metadata: {
          totalPages: 1,
          successful: 1,
          failed: 0,
          language: 'fr',
          avgConfidence: 0.95,
          processingTime: 1000,
          timestamp: '2024-01-01',
        },
        pages: [
          {
            id: 1,
            pageNumber: 1,
            filename: 'page1.jpg',
            text: textWithSpaces,
            confidence: 0.95,
          },
        ],
      }

      await boundaryIndex.loadData(mockData)

      const mockIndex = (boundaryIndex as any).index
      mockIndex.search.mockReturnValue([
        {
          field: 'content',
          result: [
            { id: 1, doc: { pageNumber: 1, title: 'Page 1' } },
          ],
        },
      ])

      const results = boundaryIndex.search('environnement', { snippetLength: 30 })

      // Should find word boundary and adjust
      expect(results[0].snippet).toBeDefined()
    })
  })
})

describe('getSearchIndex', () => {
  let mockFetch: jest.Mock

  beforeEach(() => {
    // Reset singleton
    jest.resetModules()

    mockFetch = global.fetch as jest.Mock
    mockFetch.mockClear()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockFetch.mockClear()
  })

  it('should create singleton instance on first call', async () => {
    const mockData: OCRData = {
      metadata: {
        totalPages: 1,
        successful: 1,
        failed: 0,
        language: 'fr',
        avgConfidence: 0.95,
        processingTime: 1000,
        timestamp: '2024-01-01',
      },
      pages: [
        {
          id: 1,
          pageNumber: 1,
          filename: 'page1.jpg',
          text: 'Test content',
          confidence: 0.95,
        },
      ],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response)

    const { getSearchIndex } = require('@/lib/search/search-index')
    const instance = await getSearchIndex()

    expect(instance).toBeDefined()
    expect(mockFetch).toHaveBeenCalledWith('/data/ocr/pages.json')
  })

  it('should return same instance on subsequent calls', async () => {
    const mockData: OCRData = {
      metadata: {
        totalPages: 1,
        successful: 1,
        failed: 0,
        language: 'fr',
        avgConfidence: 0.95,
        processingTime: 1000,
        timestamp: '2024-01-01',
      },
      pages: [
        {
          id: 1,
          pageNumber: 1,
          filename: 'page1.jpg',
          text: 'Test',
          confidence: 0.95,
        },
      ],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response)

    const { getSearchIndex } = require('@/lib/search/search-index')
    const instance1 = await getSearchIndex()
    const instance2 = await getSearchIndex()

    expect(instance1).toBe(instance2)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should throw error when fetch fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    } as Response)

    const { getSearchIndex } = require('@/lib/search/search-index')

    await expect(getSearchIndex()).rejects.toThrow('Failed to load OCR data: Not Found')
    expect(console.error).toHaveBeenCalledWith(
      'Failed to initialize search index:',
      expect.any(Error)
    )
  })

  it('should throw error when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { getSearchIndex } = require('@/lib/search/search-index')

    await expect(getSearchIndex()).rejects.toThrow('Network error')
    expect(console.error).toHaveBeenCalledWith(
      'Failed to initialize search index:',
      expect.any(Error)
    )
  })

  it('should throw error when JSON parsing fails', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    } as Response)

    const { getSearchIndex } = require('@/lib/search/search-index')

    await expect(getSearchIndex()).rejects.toThrow('Invalid JSON')
  })
})
