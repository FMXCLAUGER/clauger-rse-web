import type { UIMessage } from 'ai'
import { getMessageText } from './message-utils'

export const CLAUDE_MODELS = {
  HAIKU: {
    id: 'claude-3-5-haiku-20241022',
    inputCost: 0.80,
    outputCost: 4.00,
    speedRating: 10,
    qualityRating: 7,
    contextWindow: 200000
  },
  SONNET: {
    id: 'claude-sonnet-4-5-20250929',
    inputCost: 3.00,
    outputCost: 15.00,
    speedRating: 8,
    qualityRating: 10,
    contextWindow: 200000
  },
} as const

const COMPLEXITY_INDICATORS = {
  high: [
    'analyser en profondeur',
    'analyse détaillée',
    'comparer',
    'comparaison',
    'évaluer',
    'évaluation',
    'synthétiser',
    'synthèse',
    'tendance',
    'évolution',
    'prédire',
    'projection',
    'stratégie',
    'recommandation détaillée',
    'approfondir'
  ],

  medium: [
    'expliquer',
    'explication',
    'détailler',
    'comment',
    'pourquoi',
    'différence',
    'lien entre',
    'relation'
  ],

  simple: [
    'quel est',
    'quelle est',
    'quels sont',
    'quelles sont',
    'combien',
    'où',
    'où se trouve',
    'quand',
    'qui',
    'score',
    'notation',
    'note',
    'nombre',
    'liste',
    'montre'
  ]
}

export interface ComplexityScore {
  level: 'simple' | 'medium' | 'complex'
  score: number
  reasons: string[]
}

export interface RoutingDecision {
  model: typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS]
  complexity: ComplexityScore
  reasoning: string
  estimatedInputTokens: number
  estimatedCost: number
  alternativeModel?: typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS]
  potentialSavings?: number
}

export class ModelRouter {
  static analyzeComplexity(query: string): ComplexityScore {
    const lowerQuery = query.toLowerCase().trim()
    const reasons: string[] = []
    let score = 0

    const hasHighComplexity = COMPLEXITY_INDICATORS.high.some(indicator => {
      if (lowerQuery.includes(indicator)) {
        reasons.push(`Indicateur haute complexité: "${indicator}"`)
        return true
      }
      return false
    })

    const hasMediumComplexity = COMPLEXITY_INDICATORS.medium.some(indicator => {
      if (lowerQuery.includes(indicator)) {
        reasons.push(`Indicateur moyenne complexité: "${indicator}"`)
        return true
      }
      return false
    })

    const hasSimpleIndicator = COMPLEXITY_INDICATORS.simple.some(indicator => {
      if (lowerQuery.includes(indicator)) {
        reasons.push(`Indicateur simple: "${indicator}"`)
        return true
      }
      return false
    })

    if (query.length > 500) {
      score += 3
      reasons.push('Query très longue (>500 chars)')
    } else if (query.length > 200) {
      score += 2
      reasons.push('Query longue (>200 chars)')
    } else if (query.length > 100) {
      score += 1
      reasons.push('Query moyenne (>100 chars)')
    }

    const questionMarks = (query.match(/\?/g) || []).length
    if (questionMarks >= 3) {
      score += 3
      reasons.push(`Multiple questions (${questionMarks})`)
    } else if (questionMarks === 2) {
      score += 1
      reasons.push('Deux questions')
    }

    const conjunctions = ['et', 'puis', 'ensuite', 'également', 'ainsi que', 'de plus']
    const hasMultipleParts = conjunctions.some(conj => lowerQuery.includes(` ${conj} `))
    if (hasMultipleParts) {
      score += 1
      reasons.push('Query multi-parts')
    }

    if (hasHighComplexity) {
      score += 5
    } else if (hasMediumComplexity) {
      score += 3
    } else if (hasSimpleIndicator) {
      score -= 1
    }

    let level: 'simple' | 'medium' | 'complex'
    if (score >= 6) {
      level = 'complex'
    } else if (score >= 3) {
      level = 'medium'
    } else {
      level = 'simple'
    }

    return { level, score, reasons }
  }

  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  static selectModel(messages: UIMessage[], currentPage?: number): RoutingDecision {
    const lastMessage = messages[messages.length - 1]

    // Extract user query using AI SDK v5 compatible utility
    const userQuery = lastMessage ? getMessageText(lastMessage) : ''

    const complexity = this.analyzeComplexity(userQuery)

    let selectedModel: typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS] = CLAUDE_MODELS.SONNET
    let alternativeModel: typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS] = CLAUDE_MODELS.HAIKU
    let reasoning = ''

    if (complexity.level === 'simple') {
      selectedModel = CLAUDE_MODELS.HAIKU
      alternativeModel = CLAUDE_MODELS.SONNET
      reasoning = `Query simple détectée (score: ${complexity.score}). Utilisation de Haiku pour optimiser les coûts.`
    } else if (complexity.level === 'medium') {
      selectedModel = CLAUDE_MODELS.HAIKU
      alternativeModel = CLAUDE_MODELS.SONNET
      reasoning = `Query de complexité moyenne (score: ${complexity.score}). Haiku devrait suffire.`
    } else {
      selectedModel = CLAUDE_MODELS.SONNET
      alternativeModel = CLAUDE_MODELS.HAIKU
      reasoning = `Query complexe détectée (score: ${complexity.score}). Utilisation de Sonnet pour qualité maximale.`
    }

    const conversationLength = messages.reduce((sum, msg) => {
      const contentText = getMessageText(msg)
      return sum + contentText.length
    }, 0)

    // Estimate tokens from character count (not from string)
    const estimatedInputTokens = Math.ceil(conversationLength / 4) + 10000

    const estimatedCost = this.calculateCost(
      estimatedInputTokens,
      500,
      selectedModel
    )

    const alternativeCost = this.calculateCost(
      estimatedInputTokens,
      500,
      alternativeModel
    )

    const potentialSavings = selectedModel.id === CLAUDE_MODELS.HAIKU.id
      ? alternativeCost - estimatedCost
      : 0

    return {
      model: selectedModel,
      complexity,
      reasoning,
      estimatedInputTokens,
      estimatedCost,
      alternativeModel,
      potentialSavings
    }
  }

  static calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS]
  ): number {
    const inputCost = (inputTokens / 1_000_000) * model.inputCost
    const outputCost = (outputTokens / 1_000_000) * model.outputCost
    return inputCost + outputCost
  }

  static getModelById(modelId: string): typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS] | null {
    const models = Object.values(CLAUDE_MODELS)
    return models.find(m => m.id === modelId) || null
  }
}
