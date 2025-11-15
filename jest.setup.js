import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

global.localStorage = localStorageMock

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock crypto.randomUUID for CSP nonce generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234-5678',
    getRandomValues: (arr) => arr,
  },
})

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock TransformStream for Vercel AI SDK (used in streaming responses)
if (typeof TransformStream === 'undefined') {
  global.TransformStream = class TransformStream {
    constructor() {
      this.readable = {
        getReader: () => ({
          read: async () => ({ done: true, value: undefined }),
          releaseLock: () => {},
          cancel: async () => {},
        }),
        pipeThrough: (stream) => stream,
        pipeTo: async () => {},
        cancel: async () => {},
      }
      this.writable = {
        getWriter: () => ({
          write: async () => {},
          close: async () => {},
          abort: async () => {},
        }),
        abort: async () => {},
      }
    }
  }
}

// Mock TextEncoderStream and TextDecoderStream if needed
if (typeof TextEncoderStream === 'undefined') {
  global.TextEncoderStream = class TextEncoderStream extends TransformStream {}
}
if (typeof TextDecoderStream === 'undefined') {
  global.TextDecoderStream = class TextDecoderStream extends TransformStream {}
}
