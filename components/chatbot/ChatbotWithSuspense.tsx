'use client'

import { Suspense, lazy } from 'react'
import { ChatSkeleton } from './ChatSkeleton'

// Lazy loading du ChatbotTrigger pour optimiser le bundle
const ChatbotTriggerLazy = lazy(() =>
  import('./ChatbotTrigger').then(mod => ({ default: mod.ChatbotTrigger }))
)

/**
 * Wrapper avec Suspense pour le lazy loading du chatbot
 * Pattern similaire à SearchModalWithSuspense
 */
export function ChatbotWithSuspense() {
  return (
    <Suspense fallback={<ChatbotLoadingFallback />}>
      <ChatbotTriggerLazy />
    </Suspense>
  )
}

/**
 * Fallback pendant le chargement du chatbot
 * Affiche un indicateur de chargement discret
 */
function ChatbotLoadingFallback() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="h-14 w-14 rounded-full bg-primary/20 animate-pulse" />
    </div>
  )
}
