'use client'

import { HelpCircle, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  icon?: 'help' | 'info'
  iconClassName?: string
  delayDuration?: number
}

/**
 * Reusable help tooltip component for contextual assistance
 * Shows an icon that displays help text on hover
 */
export function HelpTooltip({
  content,
  side = 'top',
  icon = 'help',
  iconClassName,
  delayDuration = 300,
}: HelpTooltipProps) {
  const IconComponent = icon === 'help' ? HelpCircle : Info

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full',
              iconClassName
            )}
            aria-label="Aide"
          >
            <IconComponent className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface InfoTooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
}

/**
 * Wraps any element with a tooltip
 * Useful for adding help to existing UI elements
 */
export function InfoTooltip({
  children,
  content,
  side = 'top',
  delayDuration = 300,
}: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
