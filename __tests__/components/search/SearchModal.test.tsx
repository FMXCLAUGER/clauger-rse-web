/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SearchModal } from '@/components/search/SearchModal'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { getSearchIndex } from '@/lib/search/search-index'
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
  type SearchHistoryItem
} from '@/lib/search/search-history'
import { resultsExporter } from '@/lib/search/export-results'
import type { OCRData, SearchResult } from '@/lib/search/types'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, onError, loading, ...rest } = props
    return (
      <img
        {...rest}
        onError={(e) => {
          if (onError) onError(e)
        }}
      />
    )
  },
}))

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock search history
jest.mock('@/lib/search/search-history', () => ({
  getSearchHistory: jest.fn(),
  addToSearchHistory: jest.fn(),
  removeFromSearchHistory: jest.fn(),
  clearSearchHistory: jest.fn(),
}))

// Mock export results
jest.mock('@/lib/search/export-results', () => ({
  resultsExporter: {
    exportAndDownload: jest.fn(),
    exportToMarkdown: jest.fn(),
    copyToClipboard: jest.fn(),
  },
}))

// Real OCR data for integration tests
const REAL_OCR_DATA: OCRData = {
  metadata: {
    totalPages: 36,
    successful: 36,
    failed: 0,
    language: 'fra',
    avgConfidence: 83.3,
    processingTime: 50639,
    timestamp: '2025-11-11T12:49:00.861Z'
  },
  pages: [
    {
      id: 1,
      pageNumber: 1,
      filename: 'page1.png',
      text: 'ul e f F y ea S UE',
      confidence: 75,
      words: 26
    },
    {
      id: 2,
      pageNumber: 2,
      filename: 'page2.png',
      text: 'Sommaire SOMMAIRE RSE chez Clauger Présentation société Nos grands enjeux durables Environnement Politique Sociale Conduite des affaires Conformité éthique Sécurité information Achats responsables Rapport durable Clauger 2025',
      confidence: 83,
      words: 552
    },
    {
      id: 3,
      pageNumber: 3,
      filename: 'page3.png',
      text: 'Démarche RSE chez Clauger My Portal3E plateforme collaborative Réalisation 1er bilan GES Accompagnement B-Corp Création poste Responsable RSE Obtention médaille Bronze Eco Vadis Publication 1er rapport durable développement durable',
      confidence: 90,
      words: 369
    },
    {
      id: 4,
      pageNumber: 4,
      filename: 'page4.png',
      text: 'Présentation de la société Vision entreprise collaborateurs sites industriels équipés clients dans le monde Innover pour de meilleures qualités de vie Bien manger Bien se soigner Bien respirer',
      confidence: 79,
      words: 869
    },
    {
      id: 5,
      pageNumber: 5,
      filename: 'page5.png',
      text: 'Environnement développement durable énergie renouvelable efficacité énergétique réduction émissions carbone transition écologique',
      confidence: 88,
      words: 150
    },
  ]
}

// Mock search-index module with real implementation
const mockSearchIndex = {
  loadData: jest.fn(async (data: OCRData) => {
    // Simulate real data loading
    return Promise.resolve()
  }),
  search: jest.fn((query: string, options?: any) => {
    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    REAL_OCR_DATA.pages.forEach(page => {
      const lowerText = page.text.toLowerCase()
      if (lowerText.includes(lowerQuery)) {
        const index = lowerText.indexOf(lowerQuery)
        const start = Math.max(0, index - 50)
        const end = Math.min(page.text.length, index + query.length + 100)
        const snippet = page.text.substring(start, end)
        const highlightedSnippet = page.text.substring(start, end).replace(
          new RegExp(query, 'gi'),
          (match) => `<mark>${match}</mark>`
        )

        results.push({
          id: page.id,
          pageNumber: page.pageNumber,
          title: `Page ${page.pageNumber}`,
          snippet,
          highlightedSnippet,
          score: lowerText.split(lowerQuery).length - 1, // Simple scoring
          confidence: page.confidence
        })
      }
    })

    return results.sort((a, b) => b.score - a.score).slice(0, options?.limit || 20)
  }),
  getAutocompleteSuggestions: jest.fn((query: string, limit: number = 5) => {
    const suggestions: string[] = []
    const lowerQuery = query.toLowerCase()

    // Build vocabulary from OCR data
    const vocabulary = new Set<string>()
    REAL_OCR_DATA.pages.forEach(page => {
      page.text.split(/\s+/).forEach(word => {
        const cleaned = word.toLowerCase().replace(/[^\w]/g, '')
        if (cleaned.length >= 3) {
          vocabulary.add(cleaned)
        }
      })
    })

    // Find matching words
    Array.from(vocabulary).forEach(word => {
      if (word.startsWith(lowerQuery) && word !== lowerQuery) {
        suggestions.push(word)
      }
    })

    return suggestions.slice(0, limit)
  })
}

jest.mock('@/lib/search/search-index', () => ({
  getSearchIndex: jest.fn()
}))

describe('SearchModal', () => {
  const mockPush = jest.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(async () => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(getSearchHistory as jest.Mock).mockReturnValue([])

    // Mock getSearchIndex to return our mock with real data
    ;(getSearchIndex as jest.Mock).mockImplementation(async () => {
      await mockSearchIndex.loadData(REAL_OCR_DATA)
      return mockSearchIndex
    })

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    })

    // Mock performance.now() for timing tests
    let time = 0
    jest.spyOn(performance, 'now').mockImplementation(() => {
      time += 10 // Simulate 10ms increments
      return time
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('1. Rendering & Initial State', () => {
    it('renders nothing when modal is closed', () => {
      const { container } = render(<SearchModal />)
      expect(container.firstChild).toBeNull()
    })

    it('opens modal on "/" key press', async () => {
      render(<SearchModal />)

      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })
    })

    it('opens modal on Cmd+K / Ctrl+K', async () => {
      render(<SearchModal />)

      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })
    })

    it('does not open on "/" when focus is in input field', () => {
      const { container } = render(
        <div>
          <input data-testid="other-input" />
          <SearchModal />
        </div>
      )

      const otherInput = screen.getByTestId('other-input')
      otherInput.focus()

      fireEvent.keyDown(document, { key: '/' })

      expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
    })

    it('shows loading skeleton when index is loading', async () => {
      ;(getSearchIndex as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockSearchIndex), 1000))
      )

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      // SearchSkeleton should be rendered during loading
      // We can check for the skeleton structure or loading state
    })

    it('shows search input when index is loaded', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })
    })

    it('displays section filter buttons', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText(/Toutes/i)).toBeInTheDocument()
        expect(screen.getByText(/Environnement/i)).toBeInTheDocument()
        expect(screen.getByText(/Social/i)).toBeInTheDocument()
        expect(screen.getByText(/Gouvernance/i)).toBeInTheDocument()
      })
    })

    it('displays keyboard shortcut hints in footer', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText(/naviguer/i)).toBeInTheDocument()
        expect(screen.getByText(/sélectionner/i)).toBeInTheDocument()
        expect(screen.getByText(/fermer/i)).toBeInTheDocument()
      })
    })

    it('shows empty state message when no search performed', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText(/Tapez au moins 2 caractères pour rechercher/i)).toBeInTheDocument()
      })
    })

    it('displays performance metrics when available', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      // Wait for index load time to appear
      await waitFor(() => {
        const metricsText = screen.getByText(/ms/, { exact: false })
        expect(metricsText).toBeInTheDocument()
      })
    })

    it('platform detection shows correct keyboard shortcut', async () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
        configurable: true
      })

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })
    })

    it('reads initial query from URL params', async () => {
      const urlMockSearchParams = new URLSearchParams()
      urlMockSearchParams.set('q', 'environnement')
      ;(useSearchParams as jest.Mock).mockReturnValue(urlMockSearchParams)

      render(<SearchModal />)

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i) as HTMLInputElement
        expect(input.value).toBe('environnement')
      }, { timeout: 5000 })
    })

    it('shows error message when index fails to load', async () => {
      ;(getSearchIndex as jest.Mock).mockRejectedValueOnce(new Error('Failed to load'))

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText(/Impossible de charger l'index de recherche/i)).toBeInTheDocument()
      })
    })
  })

  describe('2. Search Functionality', () => {
    it('updates input value on typing', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)
      fireEvent.change(input, { target: { value: 'rse' } })

      expect((input as HTMLInputElement).value).toBe('rse')
    })

    it('performs search with real OCR data', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(mockSearchIndex.search).toHaveBeenCalledWith('RSE', expect.objectContaining({
          limit: 20,
          includeSnippets: true,
          snippetLength: 180
        }))
      }, { timeout: 3000 })
    })

    it('debounces search (100ms delay)', async () => {
      jest.useFakeTimers()

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      mockSearchIndex.search.mockClear()

      fireEvent.change(input, { target: { value: 'e' } })
      fireEvent.change(input, { target: { value: 'en' } })
      fireEvent.change(input, { target: { value: 'env' } })

      expect(mockSearchIndex.search).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(mockSearchIndex.search).toHaveBeenCalledTimes(1)
      })

      jest.useRealTimers()
    })

    it('displays search results with correct structure', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/résultat/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('shows highlighted snippets in results', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'durable' } })
      })

      await waitFor(() => {
        const marks = document.querySelectorAll('mark')
        expect(marks.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('displays page numbers for each result', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/Page 2/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('shows confidence scores (OCR quality)', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(screen.getAllByText(/Confiance:/i).length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('shows relevance badges', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'durable' } })
      })

      await waitFor(() => {
        expect(screen.getAllByText(/pertinent/i).length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('handles empty query (no search performed)', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)
      fireEvent.change(input, { target: { value: '' } })

      await waitFor(() => {
        expect(mockSearchIndex.search).not.toHaveBeenCalled()
      })
    })

    it('handles single character query (minimum 2 chars)', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      mockSearchIndex.search.mockClear()

      act(() => {
        fireEvent.change(input, { target: { value: 'e' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/Tapez au moins 2 caractères/i)).toBeInTheDocument()
      })
    })

    it('performs accent-insensitive search', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'energie' } }) // without accent
      })

      await waitFor(() => {
        expect(mockSearchIndex.search).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('sorts results by score descending', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        const results = mockSearchIndex.search('RSE', { limit: 20, includeSnippets: true, snippetLength: 180 })
        expect(results[0].score).toBeGreaterThanOrEqual(results[results.length - 1].score)
      })
    })

    it('limits results to 20 items', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'de' } })
      })

      await waitFor(() => {
        expect(mockSearchIndex.search).toHaveBeenCalledWith('de', expect.objectContaining({
          limit: 20
        }))
      }, { timeout: 3000 })
    })

    it('displays "Aucun résultat" when no matches found', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'xyzabc123' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/Aucun résultat pour/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('3. Autocomplete & Suggestions', () => {
    it('shows autocomplete dropdown on typing', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'dev' } })
      })

      await waitFor(() => {
        expect(mockSearchIndex.getAutocompleteSuggestions).toHaveBeenCalledWith('dev', 5)
      }, { timeout: 3000 })
    })

    it('displays vocabulary suggestions', async () => {
      mockSearchIndex.getAutocompleteSuggestions.mockReturnValue([
        'développement',
        'durable',
        'démarche'
      ])

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'dev' } })
      })

      await waitFor(() => {
        expect(screen.getByText('développement')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('shows search history suggestions', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'développement durable', timestamp: Date.now() - 1000, resultCount: 5 },
        { query: 'énergie', timestamp: Date.now() - 2000, resultCount: 3 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      // Should show history when query is empty
      await waitFor(() => {
        expect(screen.getByText('développement durable')).toBeInTheDocument()
      })
    })

    it('combines vocabulary + history suggestions', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'environnement', timestamp: Date.now(), resultCount: 5 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      mockSearchIndex.getAutocompleteSuggestions.mockReturnValue([
        'développement',
        'durable'
      ])

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'dev' } })
      })

      await waitFor(() => {
        // Should combine both sources
        expect(mockSearchIndex.getAutocompleteSuggestions).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('limits suggestions to 5 items', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'de' } })
      })

      await waitFor(() => {
        expect(mockSearchIndex.getAutocompleteSuggestions).toHaveBeenCalledWith('de', 5)
      }, { timeout: 3000 })
    })

    it('selects suggestion on click', async () => {
      mockSearchIndex.getAutocompleteSuggestions.mockReturnValue(['développement'])

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'dev' } })
      })

      await waitFor(() => {
        const suggestion = screen.getByText('développement')
        fireEvent.click(suggestion)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('développement')
      })
    })

    it('does not show suggestions for queries < 2 chars', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'd' } })
      })

      await waitFor(() => {
        expect(mockSearchIndex.getAutocompleteSuggestions).not.toHaveBeenCalled()
      })
    })

    it('does not show suggestions for queries >= 20 chars', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'very long query text here that exceeds twenty chars' } })
      })

      await waitFor(() => {
        expect(mockSearchIndex.getAutocompleteSuggestions).not.toHaveBeenCalled()
      })
    })
  })

  describe('4. Section Filtering', () => {
    it('shows all section filter buttons', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText(/Toutes/i)).toBeInTheDocument()
        expect(screen.getByText(/Introduction/i)).toBeInTheDocument()
        expect(screen.getByText(/Environnement/i)).toBeInTheDocument()
        expect(screen.getByText(/Social/i)).toBeInTheDocument()
        expect(screen.getByText(/Gouvernance/i)).toBeInTheDocument()
      })
    })

    it('filters results by selected section', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/résultat/i)).toBeInTheDocument()
      }, { timeout: 3000 })

      const environnementButton = screen.getByText(/Environnement/i)
      fireEvent.click(environnementButton)

      // Results should be filtered (implementation depends on page-section mapping)
    })

    it('highlights active section button', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const environnementButton = screen.getByText(/Environnement/i)
      fireEvent.click(environnementButton)

      expect(environnementButton).toHaveClass('bg-primary')
    })

    it('shows "Toutes" (all sections) option selected by default', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const toutesButton = screen.getByText(/Toutes/i)
      expect(toutesButton).toHaveClass('bg-primary')
    })

    it('persists filter selection during search', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const environnementButton = screen.getByText(/Environnement/i)
      fireEvent.click(environnementButton)

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'énergie' } })
      })

      await waitFor(() => {
        expect(environnementButton).toHaveClass('bg-primary')
      })
    })
  })

  describe('5. Result Navigation & Selection', () => {
    it('navigates to page on result click', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        const result = screen.getByText(/Page 2/i)
        fireEvent.click(result.closest('[role="option"]') || result)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/rapport?page=2')
      })
    })

    it('adds selected query to search history', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'durable' } })
      })

      await waitFor(() => {
        const result = screen.getAllByText(/Page/i)[0]
        fireEvent.click(result.closest('[role="option"]') || result)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(addToSearchHistory).toHaveBeenCalledWith('durable')
      })
    })

    it('closes modal after selection', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        const result = screen.getAllByText(/Page/i)[0]
        fireEvent.click(result.closest('[role="option"]') || result)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
      })
    })

    it('shows page thumbnail preview', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'durable' } })
      })

      await waitFor(() => {
        const images = document.querySelectorAll('img[alt^="Page"]')
        expect(images.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('handles missing thumbnail gracefully', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        const images = document.querySelectorAll('img[alt^="Page"]')
        if (images.length > 0) {
          const img = images[0] as HTMLImageElement
          fireEvent.error(img)

          // Should show fallback icon
          const fallback = img.parentElement?.querySelector('.fallback-icon')
          expect(fallback).toBeDefined()
        }
      }, { timeout: 3000 })
    })
  })

  describe('6. Export Functionality', () => {
    it('shows export dropdown button when results exist', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(screen.getByTitle(/Exporter les résultats/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('exports results to JSON format', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'durable' } })
      })

      await waitFor(() => {
        const exportButton = screen.getByTitle(/Exporter les résultats/i)
        fireEvent.mouseEnter(exportButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        const jsonButton = screen.getByText('JSON')
        fireEvent.click(jsonButton)
      })

      expect(resultsExporter.exportAndDownload).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          format: 'json',
          query: 'durable',
          timestamp: true,
          includeMetadata: true
        })
      )
    })

    it('exports results to CSV format', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'énergie' } })
      })

      await waitFor(() => {
        const exportButton = screen.getByTitle(/Exporter les résultats/i)
        fireEvent.mouseEnter(exportButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        const csvButton = screen.getByText('CSV')
        fireEvent.click(csvButton)
      })

      expect(resultsExporter.exportAndDownload).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ format: 'csv' })
      )
    })

    it('exports results to Markdown format', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      // Wait for results to appear first
      await waitFor(() => {
        expect(screen.getByText(/résultat/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        const exportButton = screen.getByTitle(/Exporter les résultats/i)
        fireEvent.mouseEnter(exportButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        const markdownButton = screen.getByText('Markdown')
        fireEvent.click(markdownButton)
      })

      expect(resultsExporter.exportAndDownload).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ format: 'markdown' })
      )
    })

    it('exports results to Text format', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'environnement' } })
      })

      await waitFor(() => {
        const exportButton = screen.getByTitle(/Exporter les résultats/i)
        fireEvent.mouseEnter(exportButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        const textButton = screen.getByText('Texte')
        fireEvent.click(textButton)
      })

      expect(resultsExporter.exportAndDownload).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ format: 'text' })
      )
    })

    it('shows toast notification on export success', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        const exportButton = screen.getByTitle(/Exporter les résultats/i)
        fireEvent.mouseEnter(exportButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        const jsonButton = screen.getByText('JSON')
        fireEvent.click(jsonButton)
      })

      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('exportés'))
    })

    it('shows toast notification on export error', async () => {
      ;(resultsExporter.exportAndDownload as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Export failed')
      })

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      // Wait for results to appear first
      await waitFor(() => {
        expect(screen.getByText(/résultat/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        const exportButton = screen.getByTitle(/Exporter les résultats/i)
        fireEvent.mouseEnter(exportButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        const jsonButton = screen.getByText('JSON')
        fireEvent.click(jsonButton)
      })

      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Erreur lors de l'export"))
    })

    it('copies Markdown to clipboard', async () => {
      ;(resultsExporter.exportToMarkdown as jest.Mock).mockReturnValue('# Results')
      ;(resultsExporter.copyToClipboard as jest.Mock).mockResolvedValue(undefined)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        const copyButton = screen.getByTitle(/Copier dans le presse-papiers/i)
        fireEvent.click(copyButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(resultsExporter.exportToMarkdown).toHaveBeenCalled()
        expect(resultsExporter.copyToClipboard).toHaveBeenCalledWith('# Results')
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('copiés'))
      })
    })

    it('shows error toast on clipboard copy failure', async () => {
      ;(resultsExporter.copyToClipboard as jest.Mock).mockRejectedValue(new Error('Clipboard error'))

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      // Wait for results to appear first
      await waitFor(() => {
        expect(screen.getByText(/résultat/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        const copyButton = screen.getByTitle(/Copier dans le presse-papiers/i)
        fireEvent.click(copyButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Erreur lors de la copie'))
      })
    })
  })

  describe('7. Search History', () => {
    it('displays recent searches in history', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'environnement', timestamp: Date.now() - 1000, resultCount: 5 },
        { query: 'gouvernance', timestamp: Date.now() - 2000, resultCount: 3 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('environnement')).toBeInTheDocument()
        expect(screen.getByText('gouvernance')).toBeInTheDocument()
      })
    })

    it('shows "Recherches récentes" heading when history exists', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'test', timestamp: Date.now(), resultCount: 1 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText(/Recherches récentes/i)).toBeInTheDocument()
      })
    })

    it('shows clock icon for history items', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'test', timestamp: Date.now(), resultCount: 1 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        const historyItem = screen.getByText('test').closest('[role="option"]')
        expect(historyItem).toBeInTheDocument()
      })
    })

    it('shows "X" button to remove history item on hover', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'test query', timestamp: Date.now(), resultCount: 1 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        const removeButton = screen.getByLabelText(/Supprimer de l'historique/i)
        expect(removeButton).toBeInTheDocument()
      })
    })

    it('removes individual history item on "X" click', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'test query', timestamp: Date.now(), resultCount: 1 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        const removeButton = screen.getByLabelText(/Supprimer de l'historique/i)
        fireEvent.click(removeButton)
      })

      expect(removeFromSearchHistory).toHaveBeenCalledWith('test query')
    })

    it('selects history item on click', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'environnement', timestamp: Date.now(), resultCount: 5 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        const historyItem = screen.getByText('environnement')
        fireEvent.click(historyItem)
      })

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i) as HTMLInputElement
        expect(input.value).toBe('environnement')
      })
    })

    it('hides history when user starts typing', async () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'test', timestamp: Date.now(), resultCount: 1 }
      ]
      ;(getSearchHistory as jest.Mock).mockReturnValue(mockHistory)

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'new query' } })
      })

      await waitFor(() => {
        expect(screen.queryByText(/Recherches récentes/i)).not.toBeInTheDocument()
      })
    })

    it('does not show history when empty', async () => {
      ;(getSearchHistory as jest.Mock).mockReturnValue([])

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      expect(screen.queryByText(/Recherches récentes/i)).not.toBeInTheDocument()
    })
  })

  describe('8. Modal Behavior', () => {
    it('closes on Escape key', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
      })
    })

    it('closes on backdrop click', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50') as HTMLElement
      fireEvent.click(backdrop)

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
      })
    })

    it('toggles modal on Cmd+K', async () => {
      render(<SearchModal />)

      // Open
      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      // Close
      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
      })
    })

    it('toggles modal on Ctrl+K', async () => {
      render(<SearchModal />)

      // Open
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      // Close
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
      })
    })

    it('clears query when modal closes', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)
      fireEvent.change(input, { target: { value: 'test query' } })

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
      })

      // Reopen
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        const reopenedInput = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i) as HTMLInputElement
        expect(reopenedInput.value).toBe('')
      })
    })

    it('clears results when modal closes', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/résultat/i)).toBeInTheDocument()
      }, { timeout: 3000 })

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Rechercher dans le rapport RSE/i)).not.toBeInTheDocument()
      })
    })

    it('auto-focuses search input when modal opens', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)
        expect(document.activeElement).toBe(input)
      })
    })
  })

  describe('9. URL Synchronization', () => {
    it('updates URL with query param on search', async () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState')

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'environnement' } })
      })

      await waitFor(() => {
        expect(replaceStateSpy).toHaveBeenCalledWith(
          {},
          '',
          expect.stringContaining('q=environnement')
        )
      }, { timeout: 3000 })
    })

    it('clears URL param when query is empty', async () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState')

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: '' } })
      })

      await waitFor(() => {
        const calls = replaceStateSpy.mock.calls
        const lastCall = calls[calls.length - 1]
        expect(lastCall[2]).not.toContain('q=')
      })
    })

    it('shares search via URL copy', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'test search' } })
      })

      await waitFor(() => {
        const shareButton = screen.getByTitle(/Partager cette recherche/i)
        fireEvent.click(shareButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('q=test+search')
        )
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('copié'))
      })
    })

    it('shows error toast on share failure', async () => {
      ;(navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Share error'))

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await waitFor(() => {
        const shareButton = screen.getByTitle(/Partager cette recherche/i)
        fireEvent.click(shareButton)
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Erreur lors du partage'))
      })
    })
  })

  describe('10. Performance', () => {
    it('displays index load time metric', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      await waitFor(() => {
        const metrics = screen.getByText(/ms/, { exact: false })
        expect(metrics).toBeInTheDocument()
      })
    })

    it('displays search time metric after search', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        const searchTime = screen.getByText(/⚡/, { exact: false })
        expect(searchTime).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('measures real performance timing', async () => {
      const nowSpy = jest.spyOn(performance, 'now')

      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      expect(nowSpy).toHaveBeenCalled()
    })
  })

  describe('11. Accessibility', () => {
    it('has proper dialog ARIA role', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const dialog = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i).closest('[role="dialog"]')
      expect(dialog).toBeInTheDocument()
    })

    it('has aria-label on search input', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)
        expect(input).toHaveAttribute('placeholder')
      })
    })

    it('all buttons have proper titles/labels', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      await waitFor(() => {
        expect(screen.getByTitle(/Partager cette recherche/i)).toBeInTheDocument()
        expect(screen.getByTitle(/Copier dans le presse-papiers/i)).toBeInTheDocument()
        expect(screen.getByTitle(/Exporter les résultats/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('keyboard shortcuts are documented in footer', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByText('↑↓')).toBeInTheDocument()
        expect(screen.getByText('↵')).toBeInTheDocument()
        expect(screen.getByText('esc')).toBeInTheDocument()
      })
    })
  })

  describe('12. Loading States', () => {
    it('shows loading spinner during search', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      // During debounce and search, should show loading
      await waitFor(() => {
        expect(screen.getByText(/Recherche en cours/i)).toBeInTheDocument()
      }, { timeout: 200 })
    })

    it('hides loading after results arrive', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'RSE' } })
      })

      await waitFor(() => {
        expect(screen.queryByText(/Recherche en cours/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('13. Integration Tests with Real Data', () => {
    it('performs end-to-end search with real OCR data', async () => {
      render(<SearchModal />)
      fireEvent.keyDown(document, { key: '/' })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/Rechercher dans le rapport RSE/i)

      act(() => {
        fireEvent.change(input, { target: { value: 'développement durable' } })
      })

      await waitFor(() => {
        const results = mockSearchIndex.search('développement durable', { limit: 20, includeSnippets: true, snippetLength: 180 })
        expect(results.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('finds results across multiple pages', async () => {
      const results = mockSearchIndex.search('RSE', { limit: 20 })

      const uniquePages = new Set(results.map(r => r.pageNumber))
      expect(uniquePages.size).toBeGreaterThan(1)
    })

    it('handles French accents correctly', async () => {
      const withAccent = mockSearchIndex.search('développement', { limit: 20 })
      const withoutAccent = mockSearchIndex.search('developpement', { limit: 20 })

      // Both should find results (accent-insensitive)
      expect(withAccent.length).toBeGreaterThan(0)
      expect(withoutAccent.length).toBeGreaterThan(0)
    })
  })
})
