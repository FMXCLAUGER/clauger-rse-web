import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { ContextBuilder } from '@/lib/ai/context-builder'
import { buildSystemMessageWithCaching } from '@/lib/ai/prompts'
import { getThinkingConfig } from '@/lib/ai/thinking-mode'
import {
  trackMessageSent,
  trackContextBuilt,
  trackThinkingActivated,
  trackCacheMetrics,
  trackResponseCompleted,
  trackError,
  trackResilienceMetrics
} from '@/lib/analytics/tracker'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { logger } from '@/lib/security/secure-logger'
import { ModelRouter } from '@/lib/ai/model-router'
import { ResilientAIClient } from '@/lib/resilience/resilient-ai-client'
import { getMessageText } from '@/lib/ai/message-utils'

const resilientClient = new ResilientAIClient({
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 60000
  },
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true
  }
})

// Configuration Node.js Runtime (nécessaire pour fs/path)
// export const runtime = 'edge' // ❌ Incompatible avec fs
export const dynamic = 'force-dynamic'

/**
 * POST /api/chat
 * Endpoint pour le chatbot RSE avec Claude
 *
 * Body:
 * - messages: Message[] - Historique des messages
 * - currentPage?: number - Page actuelle du rapport (optionnel)
 */
export async function POST(req: Request) {
  try {
    // 1. Vérifier la clé API
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'ANTHROPIC_API_KEY non configurée. Veuillez ajouter votre clé API dans .env.local'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Parser le body
    const { messages, currentPage } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages invalides' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. Extraire la dernière question de l'utilisateur (AI SDK v5 format)
    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage ? getMessageText(lastMessage) : ''

    // 3.5 Validation et sanitization de l'input utilisateur
    const validation = InputSanitizer.validate(userQuery)

    if (!validation.isValid) {
      logger.warn('Input validation failed', {
        error: validation.error,
        detectedPattern: validation.detectedPattern,
        queryLength: userQuery.length,
        messageCount: messages.length
      })

      return new Response(
        JSON.stringify({
          error: 'Votre message contient des caractères ou patterns non autorisés. Veuillez reformuler.',
          details: validation.error
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const safeUserQuery = validation.sanitizedInput!

    // 3.6 Déterminer le modèle optimal basé sur la complexité de la requête
    const routingDecision = ModelRouter.selectModel(messages, currentPage)

    logger.info('Model routing decision', {
      selectedModel: routingDecision.model.id,
      complexityLevel: routingDecision.complexity.level,
      complexityScore: routingDecision.complexity.score,
      estimatedCost: routingDecision.estimatedCost,
      potentialSavings: routingDecision.potentialSavings
    })

    const startTime = Date.now()

    // Track message sent with routing info
    trackMessageSent({
      queryLength: safeUserQuery.length,
      messageCount: messages.length,
      currentPage,
      modelUsed: routingDecision.model.id,
      complexityScore: routingDecision.complexity.score,
      estimatedCost: routingDecision.estimatedCost
    })

    logger.info('Chat request received', {
      queryLength: safeUserQuery.length,
      messageCount: messages.length,
      currentPage
    })

    // 4. Construire le contexte RSE optimisé basé sur la complexité
    const contextBuildStart = Date.now()
    const context = await ContextBuilder.buildOptimizedContext(
      safeUserQuery,
      currentPage,
      routingDecision.complexity.level
    )

    const contextBuildDuration = Date.now() - contextBuildStart

    // Track context built
    trackContextBuilt({
      sources: context.metadata.sources,
      sourceCount: context.metadata.sources.length,
      contextLength: context.metadata.contextLength,
      estimatedTokens: context.metadata.estimatedTokens,
      buildDuration: contextBuildDuration,
      includeFullAnalysis: context.metadata.sources.includes('full_analysis'),
      includeScores: context.metadata.sources.includes('scores'),
      includeRecommendations: context.metadata.sources.includes('recommendations')
    })

    logger.info('Context built successfully', {
      sources: context.metadata.sources,
      contextLength: context.metadata.contextLength,
      estimatedTokens: context.metadata.estimatedTokens
    })

    // 5. Construire le message système avec prompt caching
    const systemMessages = buildSystemMessageWithCaching(context.systemContext)

    // 5.5. Déterminer si Extended Thinking est nécessaire
    const thinkingConfig = getThinkingConfig(userQuery)
    if (thinkingConfig.enabled) {
      // Track thinking activation
      trackThinkingActivated({
        enabled: true,
        budgetTokens: thinkingConfig.budget_tokens,
        queryLength: userQuery.length,
        hasIndicator: userQuery.includes('###'),
        complexityScore: 0
      })

      logger.info('Extended thinking activated', {
        budgetTokens: thinkingConfig.budget_tokens
      })
    }

    // 6. Appeler Claude avec streaming, prompt caching et resilience (modèle sélectionné dynamiquement)
    const result = await resilientClient.executeWithResilience(
      async () => streamText({
        model: anthropic(routingDecision.model.id),
        system: systemMessages,
        messages: messages,
        maxOutputTokens: thinkingConfig.enabled ? 4096 : 2048,
        temperature: 0.3,
        providerOptions: {
          anthropic: {
            ...(thinkingConfig.enabled && {
              thinking: {
                type: 'enabled',
                budget_tokens: thinkingConfig.budget_tokens
              }
            }),
            cacheControl: {
              type: 'ephemeral'
            }
          }
        },
        onFinish: async ({ text, usage, response }) => {
        const cacheMetrics = (response as any)?.anthropic || {}
        const cacheReadTokens = typeof cacheMetrics.cacheReadInputTokens === 'number'
          ? cacheMetrics.cacheReadInputTokens
          : 0
        const cacheCreationTokens = typeof cacheMetrics.cacheCreationInputTokens === 'number'
          ? cacheMetrics.cacheCreationInputTokens
          : 0
        const inputTokens = (usage as any).promptTokens || 0
        const outputTokens = (usage as any).completionTokens || 0
        const totalTokens = (usage as any).totalTokens || 0
        const duration = Date.now() - startTime

        // Calculate cache savings using actual model pricing
        const inputCostPerToken = routingDecision.model.inputCost / 1_000_000
        const estimatedSavings = cacheReadTokens * inputCostPerToken * 0.9 // 90% discount on cached tokens

        // Track cache metrics
        trackCacheMetrics({
          cacheHit: cacheReadTokens > 0,
          cacheReadTokens,
          cacheCreationTokens,
          cacheReadPercentage: inputTokens > 0 ? (cacheReadTokens / (inputTokens + cacheReadTokens)) * 100 : 0,
          inputTokens,
          totalInputTokens: inputTokens + cacheReadTokens,
          estimatedSavings
        })

        // Track response completed
        trackResponseCompleted({
          responseLength: text.length,
          inputTokens,
          outputTokens,
          totalTokens,
          thinkingUsed: thinkingConfig.enabled,
          thinkingTokens: thinkingConfig.enabled ? (usage as any).thinkingTokens : undefined,
          duration,
          tokensPerSecond: duration > 0 ? (outputTokens / (duration / 1000)) : 0
        })

        logger.info('Response generated successfully', {
          textLength: text.length,
          inputTokens,
          outputTokens,
          totalTokens,
          thinkingUsed: thinkingConfig.enabled,
          cacheHit: cacheReadTokens > 0,
          cacheReadTokens,
          cacheCreationTokens
        })

        // Track resilience metrics after successful response
        const resilienceMetrics = resilientClient.getMetrics()
        trackResilienceMetrics({
          circuitState: resilientClient.getCircuitState(),
          circuitOpens: resilienceMetrics.circuitOpens,
          circuitCloses: resilienceMetrics.circuitCloses,
          totalRetries: resilienceMetrics.retriedRequests,
          retriedRequests: resilienceMetrics.retriedRequests,
          totalRequests: resilienceMetrics.totalRequests,
          successfulRequests: resilienceMetrics.successfulRequests,
          failedRequests: resilienceMetrics.failedRequests,
          successRate: resilienceMetrics.totalRequests > 0
            ? (resilienceMetrics.successfulRequests / resilienceMetrics.totalRequests * 100)
            : 100,
          averageLatency: resilienceMetrics.averageLatency,
          p95Latency: resilienceMetrics.p95Latency,
          recentFailureCount: 0 // Succès, donc 0 failures récents
        })
      }
    }),
    `chat-${Date.now()}`
    )

    // 7. Retourner le stream
    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    const circuitState = resilientClient.getCircuitState()
    const metrics = resilientClient.getMetrics()

    logger.error('Chat request failed', {
      errorType: error.name || 'UnknownError',
      errorStatus: error.status,
      errorMessage: error.message || 'Unknown error occurred',
      phase: error.status === 401 || error.status === 429 ? 'authentication' : 'processing',
      circuitState,
      successRate: metrics.totalRequests > 0
        ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2) + '%'
        : 'N/A'
    })

    // Track error
    trackError({
      errorType: error.name || 'UnknownError',
      errorStatus: error.status,
      errorMessage: error.message || 'Unknown error occurred',
      phase: error.status === 401 || error.status === 429 ? 'authentication' : 'processing'
    })

    // Track resilience metrics after error
    trackResilienceMetrics({
      circuitState: circuitState,
      circuitOpens: metrics.circuitOpens,
      circuitCloses: metrics.circuitCloses,
      totalRetries: metrics.retriedRequests,
      retriedRequests: metrics.retriedRequests,
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      failedRequests: metrics.failedRequests,
      successRate: metrics.totalRequests > 0
        ? (metrics.successfulRequests / metrics.totalRequests * 100)
        : 0,
      averageLatency: metrics.averageLatency,
      p95Latency: metrics.p95Latency,
      recentFailureCount: metrics.failedRequests
    })

    // Gestion des erreurs Anthropic spécifiques
    if (error.status === 401) {
      return new Response(
        JSON.stringify({
          error: 'Clé API Anthropic invalide. Vérifiez votre configuration.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (error.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.'
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Erreur générique
    return new Response(
      JSON.stringify({
        error: 'Une erreur est survenue lors du traitement de votre demande.',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * OPTIONS /api/chat
 * Pour les requêtes CORS preflight
 */
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
