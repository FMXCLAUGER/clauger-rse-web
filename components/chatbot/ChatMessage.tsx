'use client'

import { type UIMessage } from 'ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMessageText } from '@/lib/ai/message-utils'

interface ChatMessageProps {
  message: UIMessage
  isLast?: boolean
}

export function ChatMessage({ message, isLast = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  // Extract content using v5-compatible utility
  const content = getMessageText(message)

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg transition-colors',
        isUser && 'bg-primary/10 ml-auto max-w-[85%]',
        isAssistant && 'bg-secondary/10 mr-auto max-w-[90%]',
        isLast && 'animate-in fade-in slide-in-from-bottom-2 duration-300'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser && 'bg-primary text-primary-foreground',
          isAssistant && 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Role Label */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            {isUser ? 'Vous' : 'Assistant RSE'}
          </span>
        </div>

        {/* Message Text */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Personnalisation des éléments markdown
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="text-sm list-disc list-inside space-y-1 my-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-sm list-decimal list-inside space-y-1 my-2">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                code: ({ children, className }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block p-3 rounded bg-muted text-xs font-mono overflow-x-auto my-2">
                      {children}
                    </code>
                  )
                },
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-semibold mt-3 mb-1.5">{children}</h4>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-2">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-3 border-border" />
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {/* Metadata (timestamp, etc.) */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {(message as any).createdAt && (
            <time dateTime={(message as any).createdAt.toISOString()}>
              {(message as any).createdAt.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </time>
          )}
        </div>
      </div>
    </div>
  )
}
