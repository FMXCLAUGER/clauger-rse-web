// Mock nanoid to avoid ESM import issues in Jest
let counter = 0

module.exports = {
  nanoid: () => {
    counter++
    return `test-id-${counter}`
  },
  // Export reset function for tests
  __resetCounter: () => {
    counter = 0
  }
}
