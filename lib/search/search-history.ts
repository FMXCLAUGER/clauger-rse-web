import { logStorageError } from '@/lib/security/logger-helpers'

const STORAGE_KEY = "clauger-search-history"
const MAX_HISTORY = 10

export interface SearchHistoryItem {
  query: string
  timestamp: number
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const history = JSON.parse(stored) as SearchHistoryItem[]
    return history.slice(0, MAX_HISTORY)
  } catch (error) {
    logStorageError('load', error, 'searchHistory')
    return []
  }
}

export function addToSearchHistory(query: string): void {
  if (typeof window === "undefined") return
  if (!query || query.trim().length < 2) return

  try {
    const history = getSearchHistory()

    const existingIndex = history.findIndex((item) => item.query === query)
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1)
    }

    const newHistory: SearchHistoryItem[] = [
      { query, timestamp: Date.now() },
      ...history,
    ].slice(0, MAX_HISTORY)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  } catch (error) {
    logStorageError('save', error, 'searchHistory')
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    logStorageError('clear', error, 'searchHistory')
  }
}

export function removeFromSearchHistory(query: string): void {
  if (typeof window === "undefined") return

  try {
    const history = getSearchHistory()
    const filtered = history.filter((item) => item.query !== query)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    logStorageError('remove', error, 'searchHistory')
  }
}
