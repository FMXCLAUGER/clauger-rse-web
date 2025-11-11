declare module 'flexsearch/dist/module/document' {
  interface DocumentOptions<T> {
    charset?: string
    tokenize?: string
    resolution?: number
    context?: {
      resolution?: number
      depth?: number
      bidirectional?: boolean
    }
    cache?: number | boolean
    filter?: (word: string) => boolean
    document?: {
      id: string
      store?: string[]
      index?: string[]
    }
  }

  export default class Document<T = any> {
    constructor(options: DocumentOptions<T>)
    add(doc: T): void
    search(query: string, options?: any): any[]
    remove(id: number | string): void
  }
}
