'use client'

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { WELCOME_MESSAGE } from '@/lib/ai/prompts'
import { chatRateLimiter } from '@/lib/ai/rate-limiter'
import {
  trackSessionStarted,
  trackRateLimitExceeded,
  trackSessionEnded
} from '@/lib/analytics/tracker'
import { logger, logError, logStorageError } from '@/lib/security'

interface UseChatbotOptions {
  currentPage?: number
  onError?: (error: Error) => void
}

const CHAT_HISTORY_KEY = 'clauger-chat-history'
const MAX_HISTORY_LENGTH = 50

/**
 * Hook personnalisé pour le chatbot RSE
 * Wrapper autour du useChat de Vercel AI SDK avec fonctionnalités spécifiques
 */
export function useChatbot(options: UseChatbotOptions = {}) {
  const { currentPage, onError } = options
  const [isInitialized, setIsInitialized] = useState(false)

  // Hook useChat de Vercel AI SDK
  const chat = useChat({
    api: '/api/chat',
    body: {
      currentPage
    },
    onError: error => {
      logError('Chatbot request failed', error, { hook: 'useChatbot' })
      toast.error('Une erreur est survenue', {
        description: error.message || 'Veuillez réessayer.'
      })
      onError?.(error)
    },
    onFinish: message => {
      logger.debug('Chat message completed', {
        role: message.role,
        contentLength: message.content.length
      })

      // Sauvegarder l'historique
      saveHistory(chat.messages)
    }
  })

  // Charger l'historique au montage
  useEffect(() => {
    if (!isInitialized) {
      loadHistory()
      setIsInitialized(true)

      // Track session started
      trackSessionStarted({
        url: window.location.href,
        currentPage
      })
    }
  }, [isInitialized, currentPage])

  // Fonction pour charger l'historique depuis localStorage
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY)
      if (stored) {
        const history = JSON.parse(stored)
        // Note: useChat ne permet pas de définir messages directement
        // L'historique sera chargé via setMessages si disponible
        logger.debug('Chat history loaded', { messageCount: history.length })
      }
    } catch (error) {
      logStorageError('load', error, 'chatHistory')
    }
  }

  // Fonction pour sauvegarder l'historique dans localStorage
  const saveHistory = (messages: typeof chat.messages) => {
    try {
      // Limiter la taille de l'historique
      const limitedMessages = messages.slice(-MAX_HISTORY_LENGTH)
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(limitedMessages))
    } catch (error) {
      logStorageError('save', error, 'chatHistory')
    }
  }

  // Fonction pour effacer l'historique
  const clearHistory = () => {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY)
      // Recharger la page pour réinitialiser le chat
      window.location.reload()
    } catch (error) {
      logStorageError('clear', error, 'chatHistory')
    }
  }

  // Wrapper pour handleSubmit avec rate limiting
  const handleSubmitWithRateLimit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

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

    chat.handleSubmit(e)
  }

  // Fonction pour envoyer une question suggérée
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

    chat.setInput(question)
    // Petit délai pour que l'input soit mis à jour
    setTimeout(() => {
      chat.handleSubmit()
    }, 100)
  }

  // Fonction pour redémarrer la conversation
  const restartConversation = () => {
    if (confirm('Voulez-vous vraiment effacer l\'historique de la conversation ?')) {
      clearHistory()
    }
  }

  // Vérifier si c'est une nouvelle conversation
  const isNewConversation = chat.messages.length === 0

  // Statistiques de la conversation
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

  return {
    // Props du useChat original
    ...chat,

    // Remplacer handleSubmit par la version avec rate limiting
    handleSubmit: handleSubmitWithRateLimit,

    // Fonctions personnalisées
    sendSuggestedQuestion,
    restartConversation,
    clearHistory,

    // États personnalisés
    isInitialized,
    isNewConversation,
    stats,

    // Messages
    welcomeMessage: WELCOME_MESSAGE
  }
}

/**
 * Hook pour gérer le contexte de la page actuelle
 * Détecte automatiquement la page en cours de lecture
 */
export function useCurrentPage(): number | undefined {
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined)

  useEffect(() => {
    // Récupérer la page depuis l'URL ou le localStorage
    const params = new URLSearchParams(window.location.search)
    const pageParam = params.get('page')

    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10))
    } else {
      // Essayer de récupérer depuis le reading state
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
