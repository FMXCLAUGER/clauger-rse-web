'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChatbotModal } from './ChatbotModal'

export function ChatbotTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false)

  // Keyboard shortcut: Cmd/Ctrl + Shift + C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Marquer comme lu quand on ouvre
  useEffect(() => {
    if (isOpen) {
      setHasUnreadMessage(false)
    }
  }, [isOpen])

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300',
            isOpen && 'scale-95'
          )}
          title="Assistant RSE (Cmd+Shift+C)"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              {hasUnreadMessage && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </>
          )}
        </Button>

        {/* Tooltip/Badge */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-md text-sm border">
              Assistant RSE
              <div className="text-xs text-muted-foreground mt-0.5">
                Cmd+Shift+C
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ChatbotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
