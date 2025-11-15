import type { UIMessage } from 'ai'

/**
 * Extracts text content from AI SDK v5 UIMessage objects
 *
 * AI SDK v5 changed the message format from a simple `content` string (v4)
 * to a `parts` array structure (v5). This utility handles both formats
 * for backward compatibility.
 *
 * @example
 * // v5 format
 * const message = {
 *   role: 'user',
 *   parts: [
 *     { type: 'text', text: 'Hello world' }
 *   ]
 * }
 * getMessageText(message) // Returns: 'Hello world'
 *
 * // v4 format (backward compatibility)
 * const legacyMessage = {
 *   role: 'user',
 *   content: 'Hello world'
 * }
 * getMessageText(legacyMessage) // Returns: 'Hello world'
 */
export function getMessageText(message: UIMessage): string {
  // Try v5 format first (parts array)
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part as any).text)
      .join('')
  }

  // Fallback to v4 format (content string) for backward compatibility
  const content = (message as any).content
  if (typeof content === 'string') {
    return content
  }

  // Empty message
  return ''
}
