'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUGGESTED_QUESTIONS } from '@/lib/ai/prompts'

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void
  disabled?: boolean
}

export function SuggestedQuestions({ onSelectQuestion, disabled = false }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageCircle className="w-4 h-4" />
        <span>Questions suggérées</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {SUGGESTED_QUESTIONS.slice(0, 6).map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="justify-start text-left h-auto py-2 px-3 whitespace-normal"
            onClick={() => onSelectQuestion(question)}
            disabled={disabled}
          >
            <span className="text-xs">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

export function WelcomeScreen({ onSelectQuestion }: { onSelectQuestion: (question: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageCircle className="w-8 h-8 text-primary" />
      </div>

      {/* Welcome Message */}
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold">Assistant RSE Clauger</h2>
        <p className="text-sm text-muted-foreground">
          Posez-moi des questions sur le rapport durable Clauger 2025. Je peux vous aider à
          comprendre les performances RSE, les scores, et les recommandations.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <div className="bg-primary/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">62</div>
          <div className="text-xs text-muted-foreground">Score global</div>
        </div>
        <div className="bg-secondary/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-secondary">36</div>
          <div className="text-xs text-muted-foreground">Pages</div>
        </div>
        <div className="bg-accent/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-accent">3</div>
          <div className="text-xs text-muted-foreground">Enjeux</div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="w-full max-w-md">
        <SuggestedQuestions onSelectQuestion={onSelectQuestion} />
      </div>
    </div>
  )
}
