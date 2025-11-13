export interface Chunk {
  id: string
  text: string
  startIndex: number
  endIndex: number
  section: string
  metadata?: {
    length: number
    estimatedTokens: number
  }
}

export interface ScoredChunk extends Chunk {
  relevanceScore: number
  matchedTerms: string[]
}

export class SemanticChunker {
  static chunkBySection(context: string): Chunk[] {
    const chunks: Chunk[] = []

    const sectionPattern = /^#{1,3}\s+(.+)$/gm
    const sections = []
    let match

    while ((match = sectionPattern.exec(context)) !== null) {
      sections.push({
        title: match[1].trim(),
        index: match.index
      })
    }

    for (let i = 0; i < sections.length; i++) {
      const currentSection = sections[i]
      const nextSection = sections[i + 1]

      const startIndex = currentSection.index
      const endIndex = nextSection ? nextSection.index : context.length

      const text = context.substring(startIndex, endIndex).trim()

      if (text.length > 50) {
        chunks.push({
          id: `chunk-${i}`,
          text,
          startIndex,
          endIndex,
          section: currentSection.title,
          metadata: {
            length: text.length,
            estimatedTokens: Math.ceil(text.length / 4)
          }
        })
      }
    }

    if (chunks.length === 0) {
      const paragraphs = context.split(/\n\n+/)
      paragraphs.forEach((para, i) => {
        if (para.trim().length > 50) {
          chunks.push({
            id: `para-${i}`,
            text: para.trim(),
            startIndex: i * 100,
            endIndex: (i + 1) * 100,
            section: 'Paragraphe',
            metadata: {
              length: para.length,
              estimatedTokens: Math.ceil(para.length / 4)
            }
          })
        }
      })
    }

    return chunks
  }

  static scoreRelevance(query: string, chunk: Chunk): number {
    const lowerQuery = query.toLowerCase()
    const lowerText = chunk.text.toLowerCase()

    const queryTerms = lowerQuery
      .split(/\s+/)
      .filter(term => term.length > 3)
      .filter(term => !['quel', 'quelle', 'comment', 'pourquoi', 'dans', 'pour', 'avec', 'sans', 'sont', 'sont', 'est', 'être'].includes(term))

    if (queryTerms.length === 0) {
      return 0.5
    }

    let score = 0
    const matchedTerms: string[] = []
    const termFrequency: Map<string, number> = new Map()

    for (const term of queryTerms) {
      const regex = new RegExp(term, 'gi')
      const matches = lowerText.match(regex)
      if (matches) {
        const frequency = matches.length
        termFrequency.set(term, frequency)
        matchedTerms.push(term)

        score += Math.min(frequency, 5)
      }
    }

    const coverage = matchedTerms.length / queryTerms.length

    const termDensity = Array.from(termFrequency.values()).reduce((sum, freq) => sum + freq, 0) / (chunk.text.length / 100)

    const titleBonus = queryTerms.some(term => chunk.section.toLowerCase().includes(term)) ? 2 : 0

    const finalScore = (score * 0.5) + (coverage * 10) + (termDensity * 5) + titleBonus

    return Math.min(finalScore, 10)
  }

  static selectTopChunks(query: string, chunks: Chunk[], k: number = 5): ScoredChunk[] {
    const scoredChunks: ScoredChunk[] = chunks.map(chunk => {
      const relevanceScore = this.scoreRelevance(query, chunk)
      const matchedTerms = query.toLowerCase()
        .split(/\s+/)
        .filter(term => chunk.text.toLowerCase().includes(term))

      return {
        ...chunk,
        relevanceScore,
        matchedTerms
      }
    })

    return scoredChunks
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, k)
  }

  static rebuildContext(chunks: ScoredChunk[]): string {
    if (chunks.length === 0) {
      return ''
    }

    const header = `# Contexte Pertinent (${chunks.length} sections)\n\n`

    const sections = chunks.map((chunk, index) => {
      return `## ${chunk.section} (pertinence: ${chunk.relevanceScore.toFixed(1)}/10)\n\n${chunk.text}`
    }).join('\n\n---\n\n')

    return header + sections
  }

  static async optimizeContext(
    fullContext: string,
    query: string,
    complexity: 'simple' | 'medium' | 'complex'
  ): Promise<{ context: string; metadata: { chunksUsed: number; originalTokens: number; optimizedTokens: number; reduction: number } }> {

    const chunks = this.chunkBySection(fullContext)

    let topK: number
    if (complexity === 'simple') {
      topK = 3
    } else if (complexity === 'medium') {
      topK = 5
    } else {
      return {
        context: fullContext,
        metadata: {
          chunksUsed: chunks.length,
          originalTokens: Math.ceil(fullContext.length / 4),
          optimizedTokens: Math.ceil(fullContext.length / 4),
          reduction: 0
        }
      }
    }

    const selectedChunks = this.selectTopChunks(query, chunks, topK)

    const optimizedContext = this.rebuildContext(selectedChunks)

    const originalTokens = Math.ceil(fullContext.length / 4)
    const optimizedTokens = Math.ceil(optimizedContext.length / 4)
    const reduction = ((originalTokens - optimizedTokens) / originalTokens) * 100

    return {
      context: optimizedContext,
      metadata: {
        chunksUsed: selectedChunks.length,
        originalTokens,
        optimizedTokens,
        reduction: Math.round(reduction)
      }
    }
  }
}
