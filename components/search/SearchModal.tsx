"use client"

import { useEffect, useState, useCallback } from "react"
import { Command } from "cmdk"
import { Search, FileText, AlertCircle, Clock, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSearchIndex } from "@/lib/search/search-index"
import type { SearchIndex } from "@/lib/search/search-index"
import type { SearchResult } from "@/lib/search/types"
import { Badge } from "@/components/ui/badge"
import { SECTIONS, filterResultsBySection } from "@/lib/search/section-mapper"
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  type SearchHistoryItem
} from "@/lib/search/search-history"

export function SearchModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<typeof SECTIONS[number]["id"]>("all")
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const loadIndex = async () => {
      try {
        const index = await getSearchIndex()
        setSearchIndex(index)
      } catch (err) {
        console.error("Failed to load search index:", err)
        setError("Impossible de charger l'index de recherche")
      }
    }

    loadIndex()
    setHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory())
      setShowHistory(query.trim().length === 0)
    }
  }, [open, query])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchIndex) return

      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([])
        setShowHistory(true)
        return
      }

      setLoading(true)
      setShowHistory(false)
      try {
        const searchResults = searchIndex.search(searchQuery, {
          limit: 20,
          includeSnippets: true,
          snippetLength: 180
        })
        const filtered = filterResultsBySection(searchResults, activeSection)
        setResults(filtered)
      } catch (err) {
        console.error("Search error:", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [searchIndex, activeSection]
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  const handleSelect = useCallback(
    (pageNumber: number, searchQuery?: string) => {
      if (searchQuery) {
        addToSearchHistory(searchQuery)
      }
      setOpen(false)
      setQuery("")
      router.push(`/rapport?page=${pageNumber}`)
    },
    [router]
  )

  const handleHistorySelect = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery)
      setShowHistory(false)
    },
    []
  )

  const handleRemoveHistory = useCallback(
    (historyQuery: string, e: React.MouseEvent) => {
      e.stopPropagation()
      removeFromSearchHistory(historyQuery)
      setHistory(getSearchHistory())
    },
    []
  )

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    }
  }, [open])

  const getRelevanceBadge = (score: number) => {
    if (score >= 5) return { label: "Très pertinent", variant: "default" as const }
    if (score >= 3) return { label: "Pertinent", variant: "secondary" as const }
    return { label: "Peu pertinent", variant: "outline" as const }
  }

  if (!open) return null

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Recherche dans le rapport"
      className="fixed inset-0 z-50"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed left-1/2 top-[10vh] w-full max-w-3xl -translate-x-1/2 px-4">
        <Command
          className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
          loop
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <Search className="mr-3 h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                className="flex h-14 w-full bg-transparent py-3 text-base outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-100"
                placeholder="Rechercher dans le rapport RSE..."
                autoFocus
              />
            </div>

            {/* Section Filters */}
            <div className="px-4 pb-3 flex gap-2 flex-wrap">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeSection === section.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-1.5">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {!searchIndex && !error && (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin mx-auto h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
                Chargement de l&apos;index de recherche...
              </div>
            )}

            {error && (
              <div className="py-8 px-4 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {searchIndex && showHistory && history.length > 0 && (
              <Command.Group heading="Recherches récentes" className="px-2 pb-2">
                {history.map((item) => (
                  <Command.Item
                    key={item.timestamp}
                    value={item.query}
                    onSelect={() => handleHistorySelect(item.query)}
                    className="relative flex items-center justify-between gap-3 rounded-lg px-4 py-3 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-950 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-2 group"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.query}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveHistory(item.query, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      aria-label="Supprimer de l'historique"
                    >
                      <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    </button>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {searchIndex && query.trim().length < 2 && history.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Tapez au moins 2 caractères pour rechercher</p>
                <p className="mt-1 text-xs">
                  Exemples : <span className="font-mono">développement durable</span>, <span className="font-mono">énergie</span>
                </p>
              </div>
            )}

            {loading && query.trim().length >= 2 && (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin mx-auto h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
                Recherche en cours...
              </div>
            )}

            {!loading && searchIndex && query.trim().length >= 2 && results.length === 0 && (
              <Command.Empty className="py-8 px-4 text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aucun résultat pour « {query} »
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Essayez des termes différents ou vérifiez l&apos;orthographe
                </p>
              </Command.Empty>
            )}

            {!loading && results.length > 0 && (
              <Command.Group
                heading={`${results.length} résultat${results.length > 1 ? "s" : ""} ${
                  activeSection !== "all" ? `(${SECTIONS.find((s) => s.id === activeSection)?.label})` : ""
                }`}
                className="px-2 pb-2"
              >
                {results.map((result) => {
                  const relevance = getRelevanceBadge(result.score)

                  return (
                    <Command.Item
                      key={result.id}
                      value={`${result.pageNumber} ${result.snippet}`}
                      onSelect={() => handleSelect(result.pageNumber, query)}
                      className="relative flex flex-col gap-2 rounded-lg px-4 py-3 cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-950 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary dark:text-primary/90 shrink-0 mt-0.5" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {result.title}
                          </span>
                        </div>
                        <Badge variant={relevance.variant} className="shrink-0 text-xs">
                          {relevance.label}
                        </Badge>
                      </div>

                      {result.highlightedSnippet && (
                        <p
                          className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 pl-6"
                          dangerouslySetInnerHTML={{
                            __html: result.highlightedSnippet.replace(
                              /<mark>/g,
                              '<mark class="bg-yellow-200 dark:bg-yellow-900 font-semibold px-0.5 rounded">'
                            )
                          }}
                        />
                      )}

                      <div className="flex items-center gap-3 pl-6 text-xs text-gray-500 dark:text-gray-400">
                        <span>Confiance: {result.confidence.toFixed(1)}%</span>
                        <span>•</span>
                        <span>Score: {result.score.toFixed(1)}</span>
                      </div>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                    ↑↓
                  </kbd>
                  naviguer
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                    ↵
                  </kbd>
                  sélectionner
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                    esc
                  </kbd>
                  fermer
                </span>
              </div>
              {results.length > 0 && (
                <span className="text-xs">
                  Recherche plein texte avec FlexSearch
                </span>
              )}
            </div>
          </div>
        </Command>
      </div>
    </Command.Dialog>
  )
}
