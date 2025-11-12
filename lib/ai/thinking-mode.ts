export interface ThinkingConfig {
  enabled: boolean
  budget_tokens: number
}

const THINKING_INDICATORS = [
  /analys(er|e) en profondeur/i,
  /analys(er|e) d[ée]taill[ée]/i,
  /compar(er|aison).*avec/i,
  /pourquoi.*plut[ôo]t que/i,
  /[ée]valu(er|ation).*strat[ée]gie/i,
  /recommand(er|ation).*d[ée]taill[ée]/i,
  /expliqu(er|e) en d[ée]tail/i,
  /comment am[ée]liorer/i,
  /quelles sont les causes/i,
  /quels sont les impacts/i,
  /quelle est la meilleure approche/i,
  /plan d['']action/i,
  /analyse critique/i,
  /[ée]valuation approfondie/i
]

const COMPLEXITY_WORDS = [
  'analyser',
  'comparer',
  'évaluer',
  'critiquer',
  'synthétiser',
  'approfondir',
  'détailler',
  'justifier',
  'argumenter',
  'démontrer'
]

export function shouldUseThinking(query: string): boolean {
  const lowerQuery = query.toLowerCase()

  const hasIndicator = THINKING_INDICATORS.some(regex => regex.test(query))

  const complexityScore = COMPLEXITY_WORDS.reduce((score, word) => {
    return lowerQuery.includes(word) ? score + 1 : score
  }, 0)

  const isLongQuery = query.length > 200
  const hasMultipleQuestions = (query.match(/\?/g) || []).length >= 2

  return hasIndicator || complexityScore >= 2 || (isLongQuery && hasMultipleQuestions)
}

export function getThinkingConfig(userQuery: string): ThinkingConfig {
  if (!shouldUseThinking(userQuery)) {
    return { enabled: false, budget_tokens: 0 }
  }

  const queryLength = userQuery.length
  let budget_tokens = 10000

  if (queryLength > 500 || userQuery.includes('approfondie')) {
    budget_tokens = 16000
  }

  if (queryLength > 1000) {
    budget_tokens = 20000
  }

  return {
    enabled: true,
    budget_tokens
  }
}

export const THINKING_MODELS = [
  'claude-sonnet-4-5-20250929',
  'claude-opus-4',
  'claude-haiku-4-5'
]

export function supportsThinking(modelId: string): boolean {
  return THINKING_MODELS.some(model => modelId.includes(model))
}
