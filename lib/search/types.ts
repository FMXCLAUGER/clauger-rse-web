export interface OCRPage {
  id: number
  pageNumber: number
  filename: string
  text: string
  confidence: number
  words?: number
  error?: string
}

export interface OCRData {
  metadata: {
    totalPages: number
    successful: number
    failed: number
    language: string
    avgConfidence: number
    processingTime: number
    timestamp: string
  }
  pages: OCRPage[]
}

export interface SearchResult {
  id: number
  pageNumber: number
  title: string
  snippet: string
  score: number
  confidence: number
  highlightedSnippet: string
}

export interface SearchOptions {
  limit?: number
  includeSnippets?: boolean
  snippetLength?: number
}
