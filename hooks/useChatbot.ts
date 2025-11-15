'use client'

import { useChat, type UIMessage as Message } from '@ai-sdk/react'
import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { WELCOME_MESSAGE } from '@/lib/ai/prompts'
import { chatRateLimiter } from '@/lib/ai/rate-limiter'
import {
  trackSessionStarted,
  trackRateLimitExceeded,
  trackSessionEnded
} from '@/lib/analytics/tracker'
import { logger, logError, logStorageError } from '@/lib/security'

type ChatStatus = 'idle' | 'submitting' | 'streaming'

interface ChatWithStatus {
  status?: ChatStatus
  messages: Message[]
  sendMessage?: (options: { text: string }) => void
  [key: string]: unknown
}

// Helpers for window.location - extracted for testability
export const windowHelpers = {
  getLocationHref: () => window.location.href,
  getLocationSearch: () => window.location.search,
  reloadPage: () => window.location.reload()
}

interface UseChatbotOptions {
  currentPage?: number
  onError?: (error: Error) => void
}

const CHAT_HISTORY_KEY = 'clauger-chat-history'
const MAX_HISTORY_LENGTH = 50

/**
 * Custom hook for RSE chatbot
 * Wrapper around Vercel AI SDK useChat with specific features
 */
export function useChatbot(options: UseChatbotOptions = {}) {
  const { currentPage, onError } = options
  const [isInitialized, setIsInitialized] = useState(false)
  const [input, setInput] = useState('')

  // Hook useChat de Vercel AI SDK (v5 uses different config structure)
  const chat = useChat({
    api: '/api/chat',
    body: {
      currentPage
    },
    onError: (error: Error) => {
      logError('Chatbot request failed', error, { hook: 'useChatbot' })
      toast.error('Une erreur est survenue', {
        description: error.message || 'Veuillez réessayer.'
      })
      onError?.(error)
    },
    onFinish: (message: any) => {
      const content = (message as any).content || ''
      logger.debug('Chat message completed', {
        role: message.role,
        contentLength: typeof content === 'string' ? content.length : 0
      })

      // Save history
      saveHistory(chat.messages)
    }
  } as any)

  // Load history on mount
  useEffect(() => {
    if (!isInitialized) {
      loadHistory()
      setIsInitialized(true)

      // Track session started
      trackSessionStarted({
        url: windowHelpers.getLocationHref(),
        currentPage
      })
    }
  }, [isInitialized, currentPage])

  // Function to load history from localStorage
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY)
      if (stored) {
        const history = JSON.parse(stored)
        // Note: useChat doesn't allow setting messages directly
        // History will be loaded via setMessages if available
        logger.debug('Chat history loaded', { messageCount: history.length })
      }
    } catch (error) {
      logStorageError('load', error, 'chatHistory')
    }
  }

  // Function to save history to localStorage
  const saveHistory = (messages: typeof chat.messages) => {
    try {
      // Limit history size
      const limitedMessages = messages.slice(-MAX_HISTORY_LENGTH)
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(limitedMessages))
    } catch (error) {
      logStorageError('save', error, 'chatHistory')
    }
  }

  // Function to clear history
  const clearHistory = () => {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY)
      // Reload page to reset chat
      windowHelpers.reloadPage()
    } catch (error) {
      logStorageError('clear', error, 'chatHistory')
    }
  }

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  // Wrapper for handleSubmit with rate limiting
  const handleSubmitWithRateLimit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    if (!input.trim()) return

    const rateLimitResult = await chatRateLimiter.checkAndConsume()

    if (!rateLimitResult.allowed) {
      const retryAfter: number = rateLimitResult.retryAfter ?? 0
      const remainingTokens: number = rateLimitResult.remainingTokens ?? 0

      // Track rate limit exceeded
      trackRateLimitExceeded({
        retryAfter,
        remainingTokens,
        requestCount: stats.messageCount
      })

      toast.error('Trop de requêtes', {
        description: `Veuillez patienter ${retryAfter}s avant de réessayer.`
      })
      return
    }

    // Send message using sendMessage (v5 API)
    chat.sendMessage({ text: input })

    // Clear input after sending
    setInput('')
  }

  // Function to send a suggested question
  const sendSuggestedQuestion = async (question: string) => {
    const rateLimitResult = await chatRateLimiter.checkAndConsume()

    if (!rateLimitResult.allowed) {
      const retryAfter: number = rateLimitResult.retryAfter ?? 0
      const remainingTokens: number = rateLimitResult.remainingTokens ?? 0

      // Track rate limit exceeded
      trackRateLimitExceeded({
        retryAfter,
        remainingTokens,
        requestCount: stats.messageCount
      })

      toast.error('Trop de requêtes', {
        description: `Veuillez patienter ${retryAfter}s avant de réessayer.`
      })
      return
    }

    // Send message directly using sendMessage (v5 API)
    chat.sendMessage({ text: question })
  }

  // Function to restart conversation
  const restartConversation = () => {
    if (confirm('Voulez-vous vraiment effacer l\'historique de la conversation ?')) {
      clearHistory()
    }
  }

  // Check if this is a new conversation
  const isNewConversation = chat.messages.length === 0

  // Conversation statistics
  const stats = {
    messageCount: chat.messages.length,
    userMessages: chat.messages.filter(m => m.role === 'user').length,
    assistantMessages: chat.messages.filter(m => m.role === 'assistant').length,
    isNewConversation
  }

  // Track session end on unmount
  useEffect(() => {
    return () => {
      // Only track if there was actual activity
      if (chat.messages.length > 0) {
        trackSessionEnded({
          duration: Date.now() - (performance.timing?.navigationStart || Date.now()),
          messageCount: chat.messages.length,
          userMessageCount: chat.messages.filter(m => m.role === 'user').length,
          assistantMessageCount: chat.messages.filter(m => m.role === 'assistant').length,
          thinkingUsed: false, // We don't track this client-side
          cacheHits: 0, // We don't track this client-side
          errors: 0 // We don't track this client-side
        })
      }
    }
  }, [chat.messages])

  // Compute isLoading for v5 compatibility (v5 uses 'status' instead)
  const chatWithStatus = chat as unknown as ChatWithStatus
  const isLoading = chatWithStatus.status === 'submitting' || chatWithStatus.status === 'streaming'

  return {
    // Original useChat props
    ...chat,

    // Manual input state management (v5 requirement)
    input,
    handleInputChange,

    // V5 compatibility
    isLoading,

    // Replace handleSubmit with rate limiting version
    handleSubmit: handleSubmitWithRateLimit,

    // Custom functions
    sendSuggestedQuestion,
    restartConversation,
    clearHistory,

    // Custom states
    isInitialized,
    isNewConversation,
    stats,

    // Messages
    welcomeMessage: WELCOME_MESSAGE
  }
}

/**
 * Hook to manage current page context
 * Automatically detects the page being read
 */
export function useCurrentPage(): number | undefined {
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined)

  useEffect(() => {
    // Get page from URL or localStorage
    const params = new URLSearchParams(windowHelpers.getLocationSearch())
    const pageParam = params.get('page')

    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10))
    } else {
      // Try to get from reading state
      try {
        const readingState = localStorage.getItem('clauger-reading-state')
        if (readingState) {
          const state = JSON.parse(readingState)
          if (state.lastPage) {
            setCurrentPage(state.lastPage)
          }
        }
      } catch (error) {
        logStorageError('parse', error, 'clauger-reading-state')
      }
    }
  }, [])

  return currentPage
}
