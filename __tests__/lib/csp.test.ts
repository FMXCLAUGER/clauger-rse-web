import { getCSPNonce } from '@/lib/csp'

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

describe('getCSPNonce', () => {
  let mockHeaders: jest.Mock

  beforeEach(() => {
    mockHeaders = require('next/headers').headers
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return nonce from headers', async () => {
    const mockHeadersList = {
      get: jest.fn((key: string) => key === 'x-nonce' ? 'test-nonce-123' : null),
    }
    mockHeaders.mockResolvedValue(mockHeadersList)

    const nonce = await getCSPNonce()

    expect(nonce).toBe('test-nonce-123')
    expect(mockHeaders).toHaveBeenCalled()
    expect(mockHeadersList.get).toHaveBeenCalledWith('x-nonce')
  })

  it('should return null when no nonce in headers', async () => {
    const mockHeadersList = {
      get: jest.fn(() => null),
    }
    mockHeaders.mockResolvedValue(mockHeadersList)

    const nonce = await getCSPNonce()

    expect(nonce).toBeNull()
    expect(mockHeadersList.get).toHaveBeenCalledWith('x-nonce')
  })

  it('should call headers() function', async () => {
    const mockHeadersList = {
      get: jest.fn(() => 'nonce-value'),
    }
    mockHeaders.mockResolvedValue(mockHeadersList)

    await getCSPNonce()

    expect(mockHeaders).toHaveBeenCalledTimes(1)
  })
})
