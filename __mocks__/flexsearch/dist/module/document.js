// Mock FlexSearch Document to avoid ESM import issues in Jest
const Document = jest.fn().mockImplementation(function(config) {
  this.config = config
  this.index = []

  this.add = jest.fn((doc) => {
    this.index.push(doc)
    return this
  })

  this.search = jest.fn((query, options) => {
    // Simple mock search implementation
    const results = this.index
      .filter(doc => {
        const text = ((doc.title || '') + ' ' + (doc.content || '')).toLowerCase()
        return text.includes(query.toLowerCase())
      })
      .map((doc, index) => ({
        id: doc.id,
        result: [doc.id],
        score: 100 - index
      }))

    return results.slice(0, options?.limit || 10)
  })

  this.remove = jest.fn((id) => {
    this.index = this.index.filter(doc => doc.id !== id)
    return this
  })

  this.update = jest.fn((doc) => {
    this.remove(doc.id)
    this.add(doc)
    return this
  })

  this.clear = jest.fn(() => {
    this.index = []
    return this
  })

  return this
})

module.exports = {
  default: Document
}
