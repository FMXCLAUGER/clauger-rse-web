import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { ...options })
}

/**
 * Mock localStorage helpers
 */
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

/**
 * Mock Next.js router helpers
 */
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

/**
 * Mock Next.js searchParams helpers
 */
export const mockSearchParams = {
  get: jest.fn((key: string) => null),
  getAll: jest.fn((key: string) => []),
  has: jest.fn((key: string) => false),
  toString: jest.fn(() => ''),
}

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  jest.clearAllMocks()
  Object.values(mockLocalStorage).forEach(mock => mock.mockReset())
  Object.values(mockRouter).forEach(mock => mock.mockReset())
  Object.values(mockSearchParams).forEach(mock => mock.mockReset())
}

/**
 * Create mock environment variables
 */
export function mockEnv(env: Record<string, string>) {
  const originalEnv = process.env
  process.env = { ...originalEnv, ...env }
  return () => {
    process.env = originalEnv
  }
}

/**
 * Create mock keyboard event
 */
export function createKeyboardEvent(
  key: string,
  options: Partial<KeyboardEventInit> = {}
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

// Re-export everything from Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override render with custom render
export { customRender as render }
