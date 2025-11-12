import type { Message } from 'ai'

/**
 * Utilitaires pour la gestion des conversations du chatbot
 */

/**
 * Extrait les citations d'un message assistant
 */
export function extractCitations(content: string): string[] {
  const citations: string[] = []

  // Pattern pour les citations : *Source : ...*
  const citationRegex = /\*Source\s*:\s*([^*]+)\*/gi
  let match

  while ((match = citationRegex.exec(content)) !== null) {
    citations.push(match[1].trim())
  }

  return citations
}

/**
 * Extrait les numéros de page mentionnés dans un message
 */
export function extractPageReferences(content: string): number[] {
  const pages: number[] = []

  // Pattern pour les pages : (page X), page X, p. X
  const pageRegex = /(?:page|p\.)\s*(\d+)/gi
  let match

  while ((match = pageRegex.exec(content)) !== null) {
    const pageNum = parseInt(match[1], 10)
    if (pageNum >= 1 && pageNum <= 36) {
      pages.push(pageNum)
    }
  }

  // Dédupliquation et tri
  return [...new Set(pages)].sort((a, b) => a - b)
}

/**
 * Formatte un message pour l'export
 */
export function formatMessageForExport(message: Message): string {
  const role = message.role === 'user' ? 'Utilisateur' : 'Assistant'
  const timestamp = message.createdAt
    ? new Date(message.createdAt).toLocaleString('fr-FR')
    : ''

  return `### ${role} ${timestamp ? `(${timestamp})` : ''}\n\n${message.content}\n`
}

/**
 * Exporte la conversation en Markdown
 */
export function exportConversationAsMarkdown(messages: Message[]): string {
  let markdown = '# Conversation avec l\'Assistant RSE Clauger\n\n'
  markdown += `Date d'export : ${new Date().toLocaleString('fr-FR')}\n\n`
  markdown += '---\n\n'

  messages.forEach(message => {
    markdown += formatMessageForExport(message)
    markdown += '\n---\n\n'
  })

  return markdown
}

/**
 * Télécharge la conversation en fichier Markdown
 */
export function downloadConversation(messages: Message[]): void {
  const markdown = exportConversationAsMarkdown(messages)
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `conversation-rse-${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Analyse le sentiment d'une conversation
 */
export function analyzeConversationSentiment(messages: Message[]): {
  totalQuestions: number
  totalResponses: number
  averageResponseLength: number
  topics: string[]
} {
  const userMessages = messages.filter(m => m.role === 'user')
  const assistantMessages = messages.filter(m => m.role === 'assistant')

  const averageResponseLength =
    assistantMessages.length > 0
      ? Math.round(
          assistantMessages.reduce((sum, m) => sum + m.content.length, 0) / assistantMessages.length
        )
      : 0

  // Détection basique de topics
  const topics = new Set<string>()
  const topicKeywords = {
    environnement: ['environnement', 'carbone', 'émission', 'énergie', 'climat'],
    social: ['social', 'formation', 'emploi', 'collaboration', 'sécurité'],
    gouvernance: ['gouvernance', 'conseil', 'stratégie', 'éthique', 'conformité'],
    scores: ['score', 'notation', 'évaluation', 'performance'],
    recommandations: ['recommandation', 'amélioration', 'conseil', 'action']
  }

  userMessages.forEach(message => {
    const contentLower = message.content.toLowerCase()
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => contentLower.includes(kw))) {
        topics.add(topic)
      }
    })
  })

  return {
    totalQuestions: userMessages.length,
    totalResponses: assistantMessages.length,
    averageResponseLength,
    topics: Array.from(topics)
  }
}

/**
 * Suggère des questions de suivi basées sur le dernier message
 */
export function suggestFollowUpQuestions(lastMessage: Message): string[] {
  const content = lastMessage.content.toLowerCase()
  const suggestions: string[] = []

  // Suggestions basées sur le contenu
  if (content.includes('score') || content.includes('notation')) {
    suggestions.push('Comment améliorer ce score ?')
    suggestions.push('Quelles sont les recommandations associées ?')
  }

  if (content.includes('environnement') || content.includes('carbone')) {
    suggestions.push('Quels sont les objectifs de réduction carbone ?')
    suggestions.push('Comment Clauger mesure-t-il son impact environnemental ?')
  }

  if (content.includes('social') || content.includes('formation')) {
    suggestions.push('Quel est le budget de formation ?')
    suggestions.push('Comment évolue le turnover ?')
  }

  if (content.includes('gouvernance')) {
    suggestions.push('Comment est structurée la gouvernance RSE ?')
    suggestions.push('Y a-t-il des membres indépendants ?')
  }

  // Suggestions génériques si aucune spécifique
  if (suggestions.length === 0) {
    suggestions.push('Peux-tu approfondir ce point ?')
    suggestions.push('Y a-t-il d\'autres données sur ce sujet ?')
    suggestions.push('Quelles sont les recommandations liées ?')
  }

  return suggestions.slice(0, 3)
}

/**
 * Valide qu'un message respecte les limites
 */
export function validateMessage(content: string): {
  isValid: boolean
  error?: string
} {
  const minLength = 3
  const maxLength = 2000

  if (content.trim().length < minLength) {
    return {
      isValid: false,
      error: `Votre message doit contenir au moins ${minLength} caractères.`
    }
  }

  if (content.length > maxLength) {
    return {
      isValid: false,
      error: `Votre message ne peut pas dépasser ${maxLength} caractères.`
    }
  }

  return { isValid: true }
}
