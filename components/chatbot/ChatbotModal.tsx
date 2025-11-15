'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { X, Send, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatbot, useCurrentPage } from '@/hooks/useChatbot'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './ChatSkeleton'
import { WelcomeScreen } from './SuggestedQuestions'
import { cn } from '@/lib/utils'
import { trackSessionStarted } from '@/lib/analytics/tracker'

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const currentPage = useCurrentPage()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    sendSuggestedQuestion,
    restartConversation,
    isNewConversation,
    stats
  } = useChatbot({ currentPage })

  // Auto-scroll vers le bas quand nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Gestion du clavier (Escape pour fermer)
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      trackSessionStarted({
        url: window.location.href,
        currentPage
      })
    }
  }, [isOpen, currentPage])

  // Gestion de l'envoi du message
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      handleSubmit(e)
    }
  }

  // Gestion de Enter/Shift+Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as any)
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed z-50 bg-background border shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300',
          isFullscreen
            ? 'inset-0 rounded-none'
            : 'bottom-4 right-4 w-[500px] h-[700px] rounded-xl max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
          'flex flex-col'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Assistant RSE</h2>
              <p className="text-xs text-muted-foreground">
                {stats.messageCount === 0
                  ? 'Nouvelle conversation'
                  : `${stats.messageCount} messages`}
                {currentPage && ` · Page ${currentPage}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Restart Button */}
            {stats.messageCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={restartConversation}
                disabled={isLoading}
                title="Nouvelle conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Mode fenêtre' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            {/* Close Button */}
            <Button variant="ghost" size="icon" onClick={onClose} title="Fermer">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isNewConversation ? (
            <WelcomeScreen onSelectQuestion={sendSuggestedQuestion} />
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}

              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 shrink-0">
          <form onSubmit={onSubmit} className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question sur le rapport RSE..."
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 min-h-[44px] max-h-[120px]"
              style={{
                height: 'auto',
                overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
              }}
            />

            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 h-11 w-11">
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Propulsé par Claude Sonnet 4.5</span>
            <span>Entrée pour envoyer · Shift+Entrée pour nouvelle ligne</span>
          </div>
        </div>
      </div>
    </>
  )
}
