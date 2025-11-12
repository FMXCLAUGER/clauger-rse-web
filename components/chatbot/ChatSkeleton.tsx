'use client'

import { Loader2 } from 'lucide-react'

export function ChatSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement du chatbot RSE...</p>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-secondary/10 mr-auto max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>

      {/* Typing Animation */}
      <div className="flex-1 flex items-center gap-2 pt-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
        <span className="text-xs text-muted-foreground">L'assistant analyse votre question...</span>
      </div>
    </div>
  )
}

export function ChatLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Message 1 - User */}
      <div className="flex gap-3 p-4 rounded-lg bg-primary/10 ml-auto max-w-[85%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-primary/20 rounded w-24 animate-pulse" />
          <div className="h-4 bg-primary/20 rounded w-full animate-pulse" />
          <div className="h-4 bg-primary/20 rounded w-3/4 animate-pulse" />
        </div>
      </div>

      {/* Message 2 - Assistant */}
      <div className="flex gap-3 p-4 rounded-lg bg-secondary/10 mr-auto max-w-[90%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-secondary/20 rounded w-32 animate-pulse" />
          <div className="h-4 bg-secondary/20 rounded w-full animate-pulse" />
          <div className="h-4 bg-secondary/20 rounded w-full animate-pulse" />
          <div className="h-4 bg-secondary/20 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
