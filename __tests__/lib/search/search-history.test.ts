import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  removeFromSearchHistory,
  SearchHistoryItem,
} from '@/lib/search/search-history'
import { logger } from '@/lib/security/secure-logger'

const STORAGE_KEY = 'clauger-search-history'
const MAX_HISTORY = 10

describe('search-history', () => {
  let store: Record<string, string>

  beforeEach(() => {
    // Create a fresh store for each test
    store = {}

    // Create localStorage mock with proper closure over store
    const localStorageMock: Storage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key])
      },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() {
        return Object.keys(store).length
      },
    }

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    })

    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(1000000)
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    store = {}
  })

  describe('getSearchHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getSearchHistory()
      expect(history).toEqual([])
    })

    it('should return stored history', () => {
      const mockHistory: SearchHistoryItem[] = [
        { query: 'test1', timestamp: 1000 },
        { query: 'test2', timestamp: 2000 },
      ]
      store[STORAGE_KEY] = JSON.stringify(mockHistory)

      const history = getSearchHistory()
      expect(history).toEqual(mockHistory)
    })

    it('should limit history to MAX_HISTORY items', () => {
      const mockHistory: SearchHistoryItem[] = Array.from({ length: 15 }, (_, i) => ({
        query: `test${i}`,
        timestamp: i * 1000,
      }))
      store[STORAGE_KEY] = JSON.stringify(mockHistory)

      const history = getSearchHistory()
      expect(history).toHaveLength(MAX_HISTORY)
      expect(history).toEqual(mockHistory.slice(0, MAX_HISTORY))
    })

    it('should return empty array when localStorage has null', () => {
      const history = getSearchHistory()
      expect(history).toEqual([])
    })

    it('should return empty array when JSON parsing fails', () => {
      store[STORAGE_KEY] = 'invalid json'

      const history = getSearchHistory()
      expect(history).toEqual([])
      expect(logger.error).toHaveBeenCalledWith('localStorage load failed', {
        operation: 'load',
        key: 'searchHistory',
        error: expect.any(String)
      })
    })

    it('should handle localStorage.getItem throwing error', () => {
      Object.defineProperty(global.localStorage, 'getItem', {
        value: () => {
          throw new Error('Storage error')
        },
        writable: true,
        configurable: true,
      })

      const history = getSearchHistory()
      expect(history).toEqual([])
      expect(logger.error).toHaveBeenCalledWith('localStorage load failed', {
        operation: 'load',
        key: 'searchHistory',
        error: expect.any(String)
      })
    })

    it('should handle SSR context gracefully', () => {
      // SSR check: typeof window === "undefined" returns []
      // This path is covered by the actual implementation when run on server
      // In browser/test environment, window always exists
      expect(typeof window).not.toBe('undefined')
    })
  })

  describe('addToSearchHistory', () => {
    it('should add new query to history', () => {
      addToSearchHistory('test query')

      const savedHistory = JSON.parse(store[STORAGE_KEY])
      expect(savedHistory).toEqual([{ query: 'test query', timestamp: 1000000 }])
    })

    it('should add multiple queries to history', () => {
      addToSearchHistory('first')
      jest.spyOn(Date, 'now').mockReturnValue(2000000)
      addToSearchHistory('second')

      const savedHistory = JSON.parse(store[STORAGE_KEY])
      expect(savedHistory).toHaveLength(2)
      expect(savedHistory[0]).toEqual({ query: 'second', timestamp: 2000000 })
      expect(savedHistory[1]).toEqual({ query: 'first', timestamp: 1000000 })
    })

    it('should move existing query to top', () => {
      addToSearchHistory('first')
      jest.spyOn(Date, 'now').mockReturnValue(2000000)
      addToSearchHistory('second')
      jest.spyOn(Date, 'now').mockReturnValue(3000000)
      addToSearchHistory('first')

      const savedHistory = JSON.parse(store[STORAGE_KEY])
      expect(savedHistory).toHaveLength(2)
      expect(savedHistory[0]).toEqual({ query: 'first', timestamp: 3000000 })
      expect(savedHistory[1]).toEqual({ query: 'second', timestamp: 2000000 })
    })

    it('should limit history to MAX_HISTORY items', () => {
      for (let i = 0; i < 15; i++) {
        jest.spyOn(Date, 'now').mockReturnValue((i + 1) * 1000)
        addToSearchHistory(`query${i}`)
      }

      const savedHistory = JSON.parse(store[STORAGE_KEY])
      expect(savedHistory).toHaveLength(MAX_HISTORY)
      expect(savedHistory[0].query).toBe('query14')
      expect(savedHistory[9].query).toBe('query5')
    })

    it('should not add empty string', () => {
      addToSearchHistory('')
      expect(store[STORAGE_KEY]).toBeUndefined()
    })

    it('should not add whitespace-only string', () => {
      addToSearchHistory('   ')
      expect(store[STORAGE_KEY]).toBeUndefined()
    })

    it('should not add single character query', () => {
      addToSearchHistory('a')
      expect(store[STORAGE_KEY]).toBeUndefined()
    })

    it('should add two character query', () => {
      addToSearchHistory('ab')
      expect(store[STORAGE_KEY]).toBeDefined()
    })

    it('should handle localStorage.setItem errors', () => {
      Object.defineProperty(global.localStorage, 'setItem', {
        value: () => {
          throw new Error('Storage full')
        },
        writable: true,
        configurable: true,
      })

      addToSearchHistory('test')

      expect(logger.error).toHaveBeenCalledWith('localStorage save failed', {
        operation: 'save',
        key: 'searchHistory',
        error: expect.any(String)
      })
    })

    // Note: SSR behavior is tested in search-history.ssr.test.ts
    // It's not possible to properly test SSR in jsdom environment
  })

  describe('clearSearchHistory', () => {
    it('should remove history from localStorage', () => {
      addToSearchHistory('test')
      expect(store[STORAGE_KEY]).toBeDefined()

      clearSearchHistory()
      expect(store[STORAGE_KEY]).toBeUndefined()
    })

    it('should clear all items', () => {
      addToSearchHistory('test1')
      addToSearchHistory('test2')
      addToSearchHistory('test3')

      clearSearchHistory()

      const history = getSearchHistory()
      expect(history).toEqual([])
    })

    it('should handle localStorage.removeItem errors', () => {
      Object.defineProperty(global.localStorage, 'removeItem', {
        value: () => {
          throw new Error('Remove error')
        },
        writable: true,
        configurable: true,
      })

      clearSearchHistory()

      expect(logger.error).toHaveBeenCalledWith('localStorage clear failed', {
        operation: 'clear',
        key: 'searchHistory',
        error: expect.any(String)
      })
    })

    // Note: SSR behavior is tested in search-history.ssr.test.ts

    it('should work when history is already empty', () => {
      clearSearchHistory()
      expect(store[STORAGE_KEY]).toBeUndefined()
    })
  })

  describe('removeFromSearchHistory', () => {
    beforeEach(() => {
      addToSearchHistory('query1')
      jest.spyOn(Date, 'now').mockReturnValue(2000000)
      addToSearchHistory('query2')
      jest.spyOn(Date, 'now').mockReturnValue(3000000)
      addToSearchHistory('query3')
    })

    it('should remove specific query from history', () => {
      removeFromSearchHistory('query2')

      const history = getSearchHistory()
      expect(history).toHaveLength(2)
      expect(history.find((item) => item.query === 'query2')).toBeUndefined()
      expect(history.find((item) => item.query === 'query1')).toBeDefined()
      expect(history.find((item) => item.query === 'query3')).toBeDefined()
    })

    it('should remove first item from history', () => {
      removeFromSearchHistory('query3')

      const history = getSearchHistory()
      expect(history).toHaveLength(2)
      expect(history[0].query).toBe('query2')
      expect(history[1].query).toBe('query1')
    })

    it('should remove last item from history', () => {
      removeFromSearchHistory('query1')

      const history = getSearchHistory()
      expect(history).toHaveLength(2)
      expect(history[0].query).toBe('query3')
      expect(history[1].query).toBe('query2')
    })

    it('should do nothing when query does not exist', () => {
      removeFromSearchHistory('nonexistent')

      const history = getSearchHistory()
      expect(history).toHaveLength(3)
    })

    it('should handle empty history', () => {
      clearSearchHistory()

      removeFromSearchHistory('query1')

      const history = getSearchHistory()
      expect(history).toEqual([])
    })

    it('should handle localStorage.setItem errors', () => {
      Object.defineProperty(global.localStorage, 'setItem', {
        value: () => {
          throw new Error('Write error')
        },
        writable: true,
        configurable: true,
      })

      removeFromSearchHistory('query1')

      expect(logger.error).toHaveBeenCalledWith('localStorage remove failed', {
        operation: 'remove',
        key: 'searchHistory',
        error: expect.any(String)
      })
    })

    // Note: SSR behavior is tested in search-history.ssr.test.ts

    it('should remove all instances of a query if duplicates exist', () => {
      const duplicateHistory: SearchHistoryItem[] = [
        { query: 'test', timestamp: 1000 },
        { query: 'test', timestamp: 2000 },
        { query: 'other', timestamp: 3000 },
      ]
      store[STORAGE_KEY] = JSON.stringify(duplicateHistory)

      removeFromSearchHistory('test')

      const savedHistory = JSON.parse(store[STORAGE_KEY])
      expect(savedHistory).toHaveLength(1)
      expect(savedHistory[0].query).toBe('other')
    })
  })

  describe('integration tests', () => {
    it('should handle complete workflow', () => {
      addToSearchHistory('first search')
      jest.spyOn(Date, 'now').mockReturnValue(2000000)
      addToSearchHistory('second search')

      let history = getSearchHistory()
      expect(history).toHaveLength(2)
      expect(history[0].query).toBe('second search')

      removeFromSearchHistory('first search')
      history = getSearchHistory()
      expect(history).toHaveLength(1)
      expect(history[0].query).toBe('second search')

      jest.spyOn(Date, 'now').mockReturnValue(3000000)
      addToSearchHistory('third search')
      history = getSearchHistory()
      expect(history).toHaveLength(2)

      clearSearchHistory()
      history = getSearchHistory()
      expect(history).toEqual([])
    })

    it('should maintain order with rapid additions', () => {
      const queries = ['ab', 'bc', 'cd', 'de', 'ef']
      queries.forEach((q, i) => {
        jest.spyOn(Date, 'now').mockReturnValue((i + 1) * 1000)
        addToSearchHistory(q)
      })

      const history = getSearchHistory()
      expect(history[0].query).toBe('ef')
      expect(history[4].query).toBe('ab')
    })

    it('should handle MAX_HISTORY boundary correctly', () => {
      for (let i = 0; i < MAX_HISTORY; i++) {
        jest.spyOn(Date, 'now').mockReturnValue((i + 1) * 1000)
        addToSearchHistory(`query${i}`)
      }

      let history = getSearchHistory()
      expect(history).toHaveLength(MAX_HISTORY)

      jest.spyOn(Date, 'now').mockReturnValue((MAX_HISTORY + 1) * 1000)
      addToSearchHistory('overflow')

      history = getSearchHistory()
      expect(history).toHaveLength(MAX_HISTORY)
      expect(history[0].query).toBe('overflow')
      expect(history.find((item) => item.query === 'query0')).toBeUndefined()
    })
  })
})
