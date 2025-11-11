import Document from 'flexsearch/dist/module/document'
import type { OCRData, SearchResult, SearchOptions } from './types'

const FRENCH_STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
  'pour', 'dans', 'sur', 'avec', 'sans', 'sous', 'vers', 'par',
  'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur',
  'qui', 'que', 'quoi', 'dont', 'où',
  'à', 'en', 'y', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'
])

export class SearchIndex {
  private index: any
  private pages: Map<number, { text: string; confidence: number }>

  constructor() {
    this.index = new Document({
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
    })

    this.pages = new Map()
  }

  async loadData(data: OCRData) {
    const startTime = Date.now()

    for (const page of data.pages) {
      if (!page.error && page.text) {
        this.index.add({
          id: page.id,
          pageNumber: page.pageNumber,
          title: `Page ${page.pageNumber}`,
          content: page.text
        })

        this.pages.set(page.id, {
          text: page.text,
          confidence: page.confidence
        })
      }
    }

    const loadTime = Date.now() - startTime
    console.log(`Search index loaded in ${loadTime}ms`)

    return {
      totalPages: data.pages.length,
      indexedPages: this.pages.size,
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

    const results = this.index.search(query, {
      index: ['title', 'content'],
      enrich: true,
      limit: limit * 2
    })

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
