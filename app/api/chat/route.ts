import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { ContextBuilder } from '@/lib/ai/context-builder'
import { buildSystemMessageWithCaching } from '@/lib/ai/prompts'

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

    // 3. Extraire la dernière question de l'utilisateur
    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage?.content || ''

    console.log('[Chat API] Nouvelle requête:', {
      userQuery: userQuery.substring(0, 100),
      currentPage,
      messageCount: messages.length
    })

    // 4. Construire le contexte RSE adaptatif
    const context = await ContextBuilder.buildAdaptiveContext(userQuery, currentPage)

    console.log('[Chat API] Contexte construit:', {
      sources: context.metadata.sources,
      contextLength: context.metadata.contextLength,
      estimatedTokens: context.metadata.estimatedTokens
    })

    // 5. Construire le message système avec prompt caching
    const systemMessages = buildSystemMessageWithCaching(context.systemContext)

    // 6. Appeler Claude avec streaming et prompt caching
    const result = await streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      system: systemMessages,
      messages: messages,
      maxTokens: 2048,
      temperature: 0.3, // Réponses plus factuelles
      // Options avancées
      onFinish: async ({ text, usage }) => {
        console.log('[Chat API] Réponse générée:', {
          textLength: text.length,
          usage: usage
        })
      }
    })

    // 7. Retourner le stream
    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error('[Chat API] Erreur:', error)

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
