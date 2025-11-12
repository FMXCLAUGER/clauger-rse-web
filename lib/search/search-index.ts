import type { OCRData, SearchResult, SearchOptions } from './types'
import { queryParser, type ParsedQuery, type QueryTerm } from './query-parser'

const FRENCH_STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
  'pour', 'dans', 'sur', 'avec', 'sans', 'sous', 'vers', 'par',
  'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur',
  'qui', 'que', 'quoi', 'dont', 'où',
  'à', 'en', 'y', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'
])

// Lazy-loaded FlexSearch Document class
let FlexSearchDocument: any = null

async function loadFlexSearch() {
  if (!FlexSearchDocument) {
    const flexSearchModule = await import('flexsearch/dist/module/document')
    FlexSearchDocument = flexSearchModule.default
  }
  return FlexSearchDocument
}

export class SearchIndex {
  private index: any = null
  private pages: Map<number, { text: string; confidence: number }>
  private vocabulary: Set<string>
  private indexConfig: any

  constructor() {
    // Store config but don't create index yet (lazy loading)
    this.indexConfig = {
      charset: 'latin:advanced',
      tokenize: 'forward',
      resolution: 9,
      context: {
        resolution: 5,
        depth: 2,
        bidirectional: true
      },
      cache: 100,
      filter: (word: string) => {
        return word.length > 2 && !FRENCH_STOPWORDS.has(word.toLowerCase())
      },
      document: {
        id: 'id',
        store: ['id', 'pageNumber', 'title'],
        index: ['title', 'content']
      }
    }

    this.pages = new Map()
    this.vocabulary = new Set()
  }

  /**
   * Normalize text by removing accents and converting to lowercase
   * Example: "Frédéric" → "frederic", "théâtre" → "theatre"
   */
  private normalizeText(text: string): string {
    return text
      .normalize('NFD')  // Decompose accented characters (é → e + ´)
      .replace(/[\u0300-\u036f]/g, '')  // Remove diacritical marks
      .toLowerCase()
  }

  async loadData(data: OCRData) {
    const startTime = Date.now()

    // Lazy load FlexSearch on first use
    if (!this.index) {
      const Document = await loadFlexSearch()
      this.index = new Document(this.indexConfig)
      console.log('FlexSearch loaded dynamically')
    }

    for (const page of data.pages) {
      if (!page.error && page.text) {
        // Normalize content for accent-insensitive search
        const normalizedContent = this.normalizeText(page.text)

        this.index.add({
          id: page.id,
          pageNumber: page.pageNumber,
          title: `Page ${page.pageNumber}`,
          content: normalizedContent
        })

        // Store original text for snippet extraction
        this.pages.set(page.id, {
          text: page.text,
          confidence: page.confidence
        })

        const words = page.text
          .toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 2 && !FRENCH_STOPWORDS.has(w))

        // Add normalized words to vocabulary (without accents)
        words.forEach(w => {
          const normalized = this.normalizeText(w)
          this.vocabulary.add(normalized)
        })
      }
    }

    const loadTime = Date.now() - startTime
    console.log(`Search index loaded in ${loadTime}ms (vocabulary: ${this.vocabulary.size} words)`)

    return {
      totalPages: data.pages.length,
      indexedPages: this.pages.size,
      vocabularySize: this.vocabulary.size,
      loadTime
    }
  }

  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const {
      limit = 8,
      includeSnippets = true,
      snippetLength = 180
    } = options

    if (!query || query.trim().length < 2) {
      return []
    }

    // Ensure index is loaded before searching
    if (!this.index) {
      console.warn('Search index not loaded yet')
      return []
    }

    const parsedQuery = queryParser.parse(query)

    if (parsedQuery.type === 'advanced') {
      return this.searchAdvanced(parsedQuery, options)
    }

    // Normalize query for accent-insensitive search
    const normalizedQuery = this.normalizeText(query)

    let results = this.index.search(normalizedQuery, {
      index: ['title', 'content'],
      enrich: true,
      limit: limit * 2
    })

    if (results.length === 0 || results.every((r: any) => r.result.length === 0)) {
      const correctedQuery = this.getSuggestion(query)
      if (correctedQuery && correctedQuery !== query) {
        console.log(`Fuzzy search: "${query}" → "${correctedQuery}"`)
        const normalizedCorrected = this.normalizeText(correctedQuery)
        results = this.index.search(normalizedCorrected, {
          index: ['title', 'content'],
          enrich: true,
          limit: limit * 2
        })
      }
    }

    const scoreMap = new Map<number, number>()
    const docMap = new Map<number, { pageNumber: number; title: string }>()

    results.forEach((fieldResult: any) => {
      const fieldBoost = fieldResult.field === 'title' ? 3 : 1

      fieldResult.result.forEach((item: any) => {
        const id = item.id
        const currentScore = scoreMap.get(id) || 0
        scoreMap.set(id, currentScore + fieldBoost)
        docMap.set(id, {
          pageNumber: item.doc.pageNumber,
          title: item.doc.title
        })
      })
    })

    const sortedResults = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    return sortedResults.map(([id, score]) => {
      const doc = docMap.get(id)!
      const pageData = this.pages.get(id)!

      let snippet = ''
      let highlightedSnippet = ''

      if (includeSnippets && pageData.text) {
        const snippetData = this.extractSnippet(
          pageData.text,
          query,
          snippetLength
        )
        snippet = snippetData.snippet
        highlightedSnippet = snippetData.highlighted
      }

      return {
        id,
        pageNumber: doc.pageNumber,
        title: doc.title,
        snippet,
        highlightedSnippet,
        score,
        confidence: pageData.confidence
      }
    })
  }

  private searchAdvanced(parsedQuery: ParsedQuery, options: SearchOptions): SearchResult[] {
    const { limit = 8, includeSnippets = true, snippetLength = 180 } = options

    // Ensure index is loaded (defensive check)
    if (!this.index) {
      console.warn('Search index not loaded for advanced search')
      return []
    }

    const termResults = new Map<number, Set<number>>()

    for (const term of parsedQuery.terms) {
      const searchQuery = term.isPhrase ? `"${term.value}"` : term.value
      // Normalize query for accent-insensitive search
      const normalizedSearchQuery = this.normalizeText(searchQuery)

      const results = this.index.search(normalizedSearchQuery, {
        index: ['title', 'content'],
        enrich: true,
        limit: 100
      })

      const pageIds = new Set<number>()

      results.forEach((fieldResult: any) => {
        fieldResult.result.forEach((item: any) => {
          const pageId = item.id
          const pageData = this.pages.get(pageId)

          if (pageData) {
            if (term.isPhrase) {
              // Normalize both for accent-insensitive comparison
              const normalizedText = this.normalizeText(pageData.text)
              const normalizedValue = this.normalizeText(term.value)
              if (normalizedText.includes(normalizedValue)) {
                pageIds.add(pageId)
              }
            } else if (term.isNegated) {
              // Normalize both for accent-insensitive comparison
              const normalizedText = this.normalizeText(pageData.text)
              const normalizedValue = this.normalizeText(term.value)
              if (!normalizedText.includes(normalizedValue)) {
                pageIds.add(pageId)
              }
            } else {
              pageIds.add(pageId)
            }
          }
        })
      })

      const termKey = parsedQuery.terms.indexOf(term)
      termResults.set(termKey, pageIds)
    }

    let finalPageIds = new Set<number>()
    let currentOperator: 'AND' | 'OR' = 'AND'

    for (let i = 0; i < parsedQuery.terms.length; i++) {
      const term = parsedQuery.terms[i]
      const pageIds = termResults.get(i) || new Set()

      if (i === 0) {
        if (term.isNegated) {
          finalPageIds = new Set(Array.from(this.pages.keys()).filter(id => !pageIds.has(id)))
        } else {
          finalPageIds = new Set(pageIds)
        }
      } else {
        const operator: 'AND' | 'OR' = (term.operator as 'AND' | 'OR') || currentOperator

        if (operator === 'AND') {
          if (term.isNegated) {
            finalPageIds = new Set(Array.from(finalPageIds).filter(id => !pageIds.has(id)))
          } else {
            finalPageIds = new Set(Array.from(finalPageIds).filter(id => pageIds.has(id)))
          }
        } else if (operator === 'OR') {
          if (term.isNegated) {
            const negatedIds = new Set(Array.from(this.pages.keys()).filter(id => !pageIds.has(id)))
            finalPageIds = new Set([...Array.from(finalPageIds), ...Array.from(negatedIds)])
          } else {
            finalPageIds = new Set([...Array.from(finalPageIds), ...Array.from(pageIds)])
          }
        }

        currentOperator = operator
      }
    }

    const searchResults = Array.from(finalPageIds)
      .map(id => {
        const pageData = this.pages.get(id)
        if (!pageData) return null

        const reconstructedQuery = parsedQuery.terms
          .filter(t => !t.isNegated)
          .map(t => t.value)
          .join(' ')

        let snippet = ''
        let highlightedSnippet = ''

        if (includeSnippets && pageData.text && reconstructedQuery) {
          const snippetData = this.extractSnippet(pageData.text, reconstructedQuery, snippetLength)
          snippet = snippetData.snippet
          highlightedSnippet = snippetData.highlighted
        }

        return {
          id,
          pageNumber: id,
          title: `Page ${id}`,
          snippet,
          highlightedSnippet,
          score: 5,
          confidence: pageData.confidence
        }
      })
      .filter((r): r is SearchResult => r !== null)
      .slice(0, limit)

    return searchResults
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  getSuggestion(query: string): string {
    const queryLower = query.toLowerCase().trim()
    const queryTerms = queryLower.split(/\s+/)

    const correctedTerms = queryTerms.map(term => {
      if (term.length <= 2 || FRENCH_STOPWORDS.has(term)) {
        return term
      }

      // Normalize term for comparison (remove accents)
      const normalizedTerm = this.normalizeText(term)

      if (this.vocabulary.has(normalizedTerm)) {
        return term  // Return original term with accents if found
      }

      let bestMatch = term
      let bestDistance = Infinity
      const maxDistance = Math.max(1, Math.floor(normalizedTerm.length / 4))

      for (const vocabWord of Array.from(this.vocabulary)) {
        if (Math.abs(vocabWord.length - normalizedTerm.length) > maxDistance) {
          continue
        }

        if (vocabWord.startsWith(normalizedTerm.charAt(0))) {
          const distance = this.levenshteinDistance(normalizedTerm, vocabWord)

          if (distance <= maxDistance && distance < bestDistance) {
            bestDistance = distance
            bestMatch = vocabWord
          }
        }
      }

      return bestMatch
    })

    const correctedQuery = correctedTerms.join(' ')
    return correctedQuery !== queryLower ? correctedQuery : query
  }

  getAlternativeSuggestions(query: string, limit: number = 3): string[] {
    const queryLower = query.toLowerCase().trim()
    const normalizedQuery = this.normalizeText(queryLower)
    const suggestions: Array<{ word: string; distance: number }> = []

    if (normalizedQuery.length <= 2 || FRENCH_STOPWORDS.has(normalizedQuery)) {
      return []
    }

    if (this.vocabulary.has(normalizedQuery)) {
      return []
    }

    const maxDistance = Math.max(1, Math.floor(normalizedQuery.length / 4))

    for (const vocabWord of Array.from(this.vocabulary)) {
      if (Math.abs(vocabWord.length - normalizedQuery.length) > maxDistance) {
        continue
      }

      if (vocabWord.startsWith(normalizedQuery.charAt(0))) {
        const distance = this.levenshteinDistance(normalizedQuery, vocabWord)

        if (distance <= maxDistance) {
          suggestions.push({ word: vocabWord, distance })
        }
      }
    }

    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(s => s.word)
  }

  getAutocompleteSuggestions(partialQuery: string, limit: number = 5): string[] {
    const queryLower = partialQuery.toLowerCase().trim()

    if (queryLower.length < 2) {
      return []
    }

    const words = queryLower.split(/\s+/)
    const lastWord = words[words.length - 1]
    const normalizedLastWord = this.normalizeText(lastWord)

    if (normalizedLastWord.length < 2 || FRENCH_STOPWORDS.has(normalizedLastWord)) {
      return []
    }

    const suggestions: Array<{ word: string; score: number }> = []

    for (const vocabWord of Array.from(this.vocabulary)) {
      if (vocabWord.length < normalizedLastWord.length) {
        continue
      }

      if (vocabWord.startsWith(normalizedLastWord)) {
        const score = 100 - (vocabWord.length - normalizedLastWord.length)
        suggestions.push({ word: vocabWord, score })
      } else if (vocabWord.includes(normalizedLastWord)) {
        const score = 50 - vocabWord.indexOf(normalizedLastWord)
        suggestions.push({ word: vocabWord, score })
      }
    }

    const prefix = words.slice(0, -1).join(' ')
    const completeSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => prefix ? `${prefix} ${s.word}` : s.word)

    return completeSuggestions
  }

  private extractSnippet(
    text: string,
    query: string,
    maxLength: number
  ): { snippet: string; highlighted: string } {
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2 && !FRENCH_STOPWORDS.has(term))

    if (queryTerms.length === 0) {
      const snippet = text.substring(0, maxLength).trim()
      return {
        snippet: snippet + (text.length > maxLength ? '...' : ''),
        highlighted: snippet + (text.length > maxLength ? '...' : '')
      }
    }

    const textLower = text.toLowerCase()
    let bestIndex = -1
    let bestScore = 0

    for (const term of queryTerms) {
      const index = textLower.indexOf(term)
      if (index !== -1) {
        const score = queryTerms.length
        if (score > bestScore) {
          bestScore = score
          bestIndex = index
        }
      }
    }

    if (bestIndex === -1) {
      const snippet = text.substring(0, maxLength).trim()
      return {
        snippet: snippet + (text.length > maxLength ? '...' : ''),
        highlighted: snippet + (text.length > maxLength ? '...' : '')
      }
    }

    const contextBefore = Math.floor(maxLength / 2)
    const contextAfter = maxLength - contextBefore

    let start = Math.max(0, bestIndex - contextBefore)
    let end = Math.min(text.length, bestIndex + contextAfter)

    if (start > 0) {
      const spaceIndex = text.lastIndexOf(' ', start)
      if (spaceIndex !== -1 && spaceIndex > start - 20) {
        start = spaceIndex + 1
      }
    }

    if (end < text.length) {
      const spaceIndex = text.indexOf(' ', end)
      if (spaceIndex !== -1 && spaceIndex < end + 20) {
        end = spaceIndex
      }
    }

    let snippet = text.substring(start, end).trim()
    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'

    const highlightRegex = new RegExp(
      `(${queryTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    )
    const highlighted = snippet.replace(highlightRegex, '<mark>$1</mark>')

    return { snippet, highlighted }
  }
}

let searchIndexInstance: SearchIndex | null = null

export async function getSearchIndex(): Promise<SearchIndex> {
  if (searchIndexInstance) {
    return searchIndexInstance
  }

  searchIndexInstance = new SearchIndex()

  try {
    const response = await fetch('/data/ocr/pages.json')
    if (!response.ok) {
      throw new Error(`Failed to load OCR data: ${response.statusText}`)
    }

    const data: OCRData = await response.json()
    await searchIndexInstance.loadData(data)
  } catch (error) {
    console.error('Failed to initialize search index:', error)
    throw error
  }

  return searchIndexInstance
}
