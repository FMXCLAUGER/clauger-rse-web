# 🔌 API Documentation - Clauger RSE Web

Documentation complète de l'API du chatbot IA et des endpoints disponibles.

---

## 📋 Table des Matières

1. [Chatbot API](#chatbot-api)
2. [Modèles IA](#modèles-ia)
3. [Sécurité](#sécurité)
4. [Codes d'Erreur](#codes-derreur)
5. [Exemples d'Utilisation](#exemples-dutilisation)
6. [Rate Limiting](#rate-limiting)

---

## 🤖 Chatbot API

### POST `/api/chat`

Endpoint principal pour interagir avec l'assistant IA Claude.

#### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```typescript
{
  messages: UIMessage[],      // Historique de conversation
  currentPage?: number        // Page courante du rapport (optionnel)
}
```

**UIMessage Type:**
```typescript
interface UIMessage {
  role: 'user' | 'assistant'
  content: string
  id?: string
  createdAt?: Date
}
```

#### Response

**Success (200):**

Streaming response (Server-Sent Events) avec les chunks de texte générés par Claude.

```
Format: text/event-stream
```

**Response Headers:**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Stream Events:**
```typescript
// Message chunks
0:"text_chunk_1"
1:"text_chunk_2"
...

// Final message
d:{"finishReason":"stop","usage":{"promptTokens":1234,"completionTokens":567}}
```

#### Example Request

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'Quel est le score environnemental de Clauger?'
      }
    ],
    currentPage: 15
  })
})

// Handle streaming response
const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  console.log(chunk) // Process each chunk
}
```

#### Example with useChat Hook

```typescript
import { useChatbot } from '@/hooks/useChatbot'

function MyComponent() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useChatbot({ currentPage: 5 })

  return (
    <form onSubmit={handleSubmit}>
      {messages.map(message => (
        <div key={message.id}>
          <strong>{message.role}:</strong> {message.content}
        </div>
      ))}

      <textarea
        value={input}
        onChange={handleInputChange}
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading}>
        Envoyer
      </button>
    </form>
  )
}
```

---

## 🧠 Modèles IA

L'API utilise un système de routing intelligent pour sélectionner le modèle optimal.

### Modèles Disponibles

| Modèle | ID | Coût Input | Coût Output | Performance |
|--------|----|-----------:|------------:|-------------|
| **Haiku** | `claude-3-5-haiku-20241022` | $0.80/M | $4.00/M | Rapide |
| **Sonnet 4.5** | `claude-sonnet-4-5-20250929` | $3.00/M | $15.00/M | Précis |

### Routing Automatique

Le système analyse la complexité de la requête et sélectionne le modèle approprié.

**Critères de sélection:**

1. **Longueur de la query**
   - < 100 chars → score +0
   - 100-200 chars → score +1
   - 200-500 chars → score +2
   - \> 500 chars → score +3

2. **Indicateurs de complexité**
   - **Haute** (+5): analyser, comparer, synthétiser, tendance, stratégie
   - **Moyenne** (+3): expliquer, détailler, différence, relation
   - **Simple** (-1): quel, combien, où, score, liste

3. **Questions multiples**
   - 2 questions → score +1
   - 3+ questions → score +3

4. **Structure**
   - Conjonctions multiples (et, puis, ainsi que) → score +1

**Seuils de décision:**
- Score < 3 → **Haiku**
- Score 3-5 → **Haiku** (capable)
- Score ≥ 6 → **Sonnet 4.5**

### Extended Thinking

Pour les questions complexes, activez Extended Thinking avec le préfixe `###`:

```
### Analyser en profondeur l'évolution de l'empreinte carbone de Clauger entre 2022 et 2024
```

**Configuration:**
- Budget: 10,000 tokens de réflexion
- Utilisation: Questions nécessitant analyse approfondie
- Coût: Inclus dans les tokens de sortie

---

## 🛡️ Sécurité

### Input Validation

Toutes les requêtes passent par une validation stricte:

**Règles:**
```typescript
{
  minLength: 3,           // Minimum 3 caractères
  maxLength: 2000,        // Maximum 2000 caractères
  blockedPatterns: [
    /(?:SELECT|DROP|INSERT|UPDATE|DELETE)\s+/i,  // SQL injection
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // XSS
    /javascript:/i,       // JavaScript protocol
    /on\w+\s*=/i         // Event handlers
  ]
}
```

**Erreur de validation (400):**
```json
{
  "error": "Votre message contient des caractères ou patterns non autorisés. Veuillez reformuler.",
  "details": "Detected SQL injection pattern"
}
```

### Content Security Policy

Headers de sécurité appliqués:

```http
Content-Security-Policy:
  script-src 'self' 'nonce-{random}';
  img-src 'self' data: https:;
  connect-src 'self' https://api.anthropic.com;
  default-src 'self';
```

### Resilience

**Circuit Breaker:**
- Seuil: 5 échecs consécutifs
- Timeout: 60 secondes
- État: CLOSED (normal), OPEN (bloqué), HALF_OPEN (test)

**Retry avec Backoff:**
- Max retries: 3
- Délai initial: 1000ms
- Délai max: 30000ms
- Multiplicateur: 2x
- Jitter: Activé (±25%)

---

## ⚠️ Codes d'Erreur

### 400 Bad Request

**Cause:** Validation échouée

```json
{
  "error": "Votre message contient des caractères ou patterns non autorisés.",
  "details": "Content too long (2500 > 2000)"
}
```

**Solutions:**
- Vérifier longueur du message (3-2000 chars)
- Supprimer patterns suspects (SQL, script tags)
- Reformuler la question

### 401 Unauthorized

**Cause:** Clé API Anthropic invalide ou manquante

```json
{
  "error": "Clé API Anthropic invalide. Vérifiez votre configuration."
}
```

**Solutions:**
- Vérifier `.env.local` contient `ANTHROPIC_API_KEY`
- Vérifier validité de la clé sur console.anthropic.com
- Redémarrer le serveur après modification

### 429 Too Many Requests

**Cause:** Rate limit dépassé

```json
{
  "error": "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants."
}
```

**Client-side (toast):**
```
"Trop de requêtes. Veuillez patienter {X}s avant de réessayer."
```

**Solutions:**
- Attendre le délai indiqué
- Réduire fréquence des requêtes
- Limite: 10 requêtes/minute par session

### 500 Internal Server Error

**Cause:** Erreur serveur inattendue

```json
{
  "error": "Une erreur est survenue lors du traitement de votre demande.",
  "details": "Network timeout"
}
```

**Solutions:**
- Réessayer la requête
- Vérifier connexion internet
- Vérifier statut API Anthropic (status.anthropic.com)

---

## 🚦 Rate Limiting

### Configuration

**Limite client-side:**
```typescript
{
  maxTokens: 10,          // 10 requêtes max
  windowMs: 60000,        // Sur 1 minute
  refillRate: 10,         // Recharge complète toutes les 1min
}
```

### Utilisation

Le hook `useChatbot` gère automatiquement le rate limiting:

```typescript
const handleSubmit = async () => {
  const result = await chatRateLimiter.checkAndConsume()

  if (!result.allowed) {
    toast.error('Trop de requêtes', {
      description: `Veuillez patienter ${result.retryAfter}s`
    })
    return
  }

  // Envoyer la requête...
}
```

### États

**Tokens disponibles:**
```typescript
interface RateLimitResult {
  allowed: boolean          // Requête autorisée?
  remainingTokens: number   // Tokens restants
  retryAfter?: number       // Attente en secondes si bloqué
  resetTime?: number        // Timestamp reset complet
}
```

**Exemple de réponse:**
```json
{
  "allowed": false,
  "remainingTokens": 0,
  "retryAfter": 45,
  "resetTime": 1700000000000
}
```

---

## 📊 Analytics

### Événements Trackés

L'API émet des événements analytics pour monitoring:

**1. Message envoyé**
```typescript
{
  eventType: 'chat.message.sent',
  properties: {
    queryLength: 123,
    messageCount: 5,
    currentPage: 15,
    modelUsed: 'claude-3-5-haiku-20241022',
    complexityScore: 2,
    estimatedCost: 0.0015
  }
}
```

**2. Contexte construit**
```typescript
{
  eventType: 'chat.context.built',
  properties: {
    sources: ['semantic_chunking', 'scores'],
    sourceCount: 2,
    contextLength: 4500,
    estimatedTokens: 1125,
    buildDuration: 15
  }
}
```

**3. Réponse complète**
```typescript
{
  eventType: 'chat.response.completed',
  properties: {
    responseLength: 567,
    inputTokens: 1234,
    outputTokens: 567,
    totalTokens: 1801,
    thinkingUsed: false,
    duration: 2500,
    tokensPerSecond: 227
  }
}
```

**4. Cache metrics**
```typescript
{
  eventType: 'chat.cache.metrics',
  properties: {
    cacheHit: true,
    cacheReadTokens: 1100,
    cacheCreationTokens: 0,
    cacheReadPercentage: 89.1,
    estimatedSavings: 0.0245
  }
}
```

---

## 💾 Prompt Caching

### Configuration

**Cache ephemeral:**
```typescript
{
  cacheControl: {
    type: 'ephemeral'
  }
}
```

### Fonctionnement

**1. Premier appel (cache MISS):**
```
Input tokens: 15,000 (contexte RSE)
Cache creation: 15,000 tokens
Coût: 15,000 × $3.00/M = $0.045
```

**2. Appels suivants (cache HIT, < 5min):**
```
Input tokens: 200 (nouvelle question)
Cache read: 15,000 tokens (réutilisé)
Coût: (200 × $3.00/M) + (15,000 × $0.30/M) = $0.0051
Économie: 90%
```

### Métriques

**Response metadata:**
```typescript
{
  anthropic: {
    cacheReadInputTokens: 15000,      // Tokens lus du cache
    cacheCreationInputTokens: 0,      // Tokens créés (1er appel)
  }
}
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_RATE_LIMIT_MAX=10
NEXT_PUBLIC_RATE_LIMIT_WINDOW=60000
```

### Personnalisation du Contexte

Modifier `lib/ai/context-builder.ts` pour ajuster le contexte envoyé:

```typescript
export class ContextBuilder {
  static async buildOptimizedContext(
    query: string,
    currentPage?: number,
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): Promise<ContextResult> {
    // Personnaliser la logique de sélection des sources
    const sources = []

    if (complexity === 'simple') {
      sources.push(await this.getSemanticChunks(query, 3))
    } else {
      sources.push(await this.getFullAnalysis())
    }

    return { systemContext, metadata }
  }
}
```

### Personnalisation du Routing

Modifier `lib/ai/model-router.ts` pour ajuster les critères:

```typescript
export class ModelRouter {
  static analyzeComplexity(query: string): ComplexityScore {
    // Personnaliser les indicateurs
    const CUSTOM_INDICATORS = {
      veryComplex: ['analyse critique', 'évaluation approfondie'],
      // ...
    }

    // Ajuster les seuils
    if (score >= 8) return 'complex'
    if (score >= 4) return 'medium'
    return 'simple'
  }
}
```

---

## 📚 Ressources

**Documentation Externe:**
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Vercel AI SDK v5](https://sdk.vercel.ai/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

**Code Source:**
- API Route: `app/api/chat/route.ts`
- Context Builder: `lib/ai/context-builder.ts`
- Model Router: `lib/ai/model-router.ts`
- Chatbot Hook: `hooks/useChatbot.ts`

---

**Dernière mise à jour : 15 novembre 2024**
