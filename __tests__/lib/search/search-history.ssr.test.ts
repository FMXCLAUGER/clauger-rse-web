/**
 * SSR-specific tests for search-history
 * These tests run in a Node environment without window/DOM
 */

describe('search-history SSR behavior', () => {
  let originalWindow: typeof globalThis.window
  let originalDocument: typeof globalThis.document
  let originalLocalStorage: typeof globalThis.localStorage

  beforeAll(() => {
    // Save original globals
    originalWindow = global.window
    originalDocument = global.document
    originalLocalStorage = global.localStorage

    // Remove browser globals to simulate SSR
    // @ts-expect-error Simulating SSR environment
    delete global.window
    // @ts-expect-error Simulating SSR environment
    delete global.document
    // @ts-expect-error Simulating SSR environment
    delete global.localStorage

    // Clear module cache to force reload in SSR context
    jest.resetModules()
  })

  afterAll(() => {
    // Restore browser globals
    global.window = originalWindow
    global.document = originalDocument
    global.localStorage = originalLocalStorage

    // Reset modules again to reload with browser context
    jest.resetModules()
  })

  it('getSearchHistory should return empty array in SSR', () => {
    const { getSearchHistory } = require('@/lib/search/search-history')
    const history = getSearchHistory()
    expect(history).toEqual([])
  })

  it('addToSearchHistory should do nothing in SSR', () => {
    const { addToSearchHistory } = require('@/lib/search/search-history')

    // Should not throw and should do nothing
    expect(() => {
      addToSearchHistory('test')
    }).not.toThrow()
  })

  it('clearSearchHistory should do nothing in SSR', () => {
    const { clearSearchHistory } = require('@/lib/search/search-history')

    // Should not throw and should do nothing
    expect(() => {
      clearSearchHistory()
    }).not.toThrow()
  })

  it('removeFromSearchHistory should do nothing in SSR', () => {
    const { removeFromSearchHistory } = require('@/lib/search/search-history')

    // Should not throw and should do nothing
    expect(() => {
      removeFromSearchHistory('test')
    }).not.toThrow()
  })
})
