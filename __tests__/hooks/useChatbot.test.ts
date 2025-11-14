import { renderHook, waitFor, act } from '@testing-library/react'
import { useChatbot, useCurrentPage, windowHelpers } from '@/hooks/useChatbot'
import { WELCOME_MESSAGE } from '@/lib/ai/prompts'
import { chatRateLimiter } from '@/lib/ai/rate-limiter'
import { trackSessionStarted, trackRateLimitExceeded, trackSessionEnded } from '@/lib/analytics/tracker'
import { toast } from 'sonner'
import { useChat } from 'ai/react'

// Mock dependencies
jest.mock('ai/react')
jest.mock('sonner')
jest.mock('@/lib/ai/rate-limiter')
jest.mock('@/lib/analytics/tracker')
jest.mock('@/lib/security', () => ({
  logger: {
    debug: jest.fn(),
  },
  logError: jest.fn(),
  logStorageError: jest.fn(),
}))

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>
const mockToast = toast as jest.Mocked<typeof toast>
const mockChatRateLimiter = chatRateLimiter as jest.Mocked<typeof chatRateLimiter>
const mockTrackSessionStarted = trackSessionStarted as jest.MockedFunction<typeof trackSessionStarted>
const mockTrackRateLimitExceeded = trackRateLimitExceeded as jest.MockedFunction<typeof trackRateLimitExceeded>
const mockTrackSessionEnded = trackSessionEnded as jest.MockedFunction<typeof trackSessionEnded>

describe('useChatbot', () => {
  let mockChatReturn: any
  let mockLocalStorage: Storage
  let getLocationHrefSpy: jest.SpyInstance
  let getLocationSearchSpy: jest.SpyInstance
  let reloadPageSpy: jest.SpyInstance

  beforeEach(() => {
    // Setup windowHelpers spies
    getLocationHrefSpy = jest.spyOn(windowHelpers, 'getLocationHref').mockReturnValue('http://localhost:3000')
    getLocationSearchSpy = jest.spyOn(windowHelpers, 'getLocationSearch').mockReturnValue('')
    reloadPageSpy = jest.spyOn(windowHelpers, 'reloadPage').mockImplementation(() => {})

    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })

    // Mock window.confirm
    window.confirm = jest.fn()

    // Mock performance.timing
    Object.defineProperty(performance, 'timing', {
      value: {
        navigationStart: Date.now(),
      },
      writable: true,
      configurable: true,
    })

    // Default useChat return value
    mockChatReturn = {
      messages: [],
      input: '',
      isLoading: false,
      error: undefined,
      handleSubmit: jest.fn(),
      setInput: jest.fn(),
      reload: jest.fn(),
      stop: jest.fn(),
      append: jest.fn(),
    }

    mockUseChat.mockReturnValue(mockChatReturn)

    // Default rate limiter behavior
    mockChatRateLimiter.checkAndConsume.mockResolvedValue({
      allowed: true,
      remainingTokens: 10,
      retryAfter: 0,
    })

    // Clear all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useChatbot())

      // After mount, isInitialized should become true
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      expect(result.current.isNewConversation).toBe(true)
      expect(result.current.welcomeMessage).toBe(WELCOME_MESSAGE)
      expect(result.current.stats).toEqual({
        messageCount: 0,
        userMessages: 0,
        assistantMessages: 0,
        isNewConversation: true,
      })
    })

    it('should initialize useChat with correct config', () => {
      renderHook(() => useChatbot({ currentPage: 5 }))

      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          api: '/api/chat',
          body: { currentPage: 5 },
        })
      )
    })

    it('should track session started on mount', async () => {
      renderHook(() => useChatbot({ currentPage: 3 }))

      await waitFor(() => {
        expect(mockTrackSessionStarted).toHaveBeenCalledWith({
          url: 'http://localhost:3000',
          currentPage: 3,
        })
      })
    })

    it('should load history from localStorage on mount', async () => {
      const mockHistory = [
        { role: 'user', content: 'Hello', id: '1' },
        { role: 'assistant', content: 'Hi there', id: '2' },
      ]
      ;(mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockHistory))

      renderHook(() => useChatbot())

      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('clauger-chat-history')
      })
    })

    it('should handle localStorage errors gracefully', async () => {
      ;(mockLocalStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { result } = renderHook(() => useChatbot())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })
    })

    it('should set isInitialized to true after mount', async () => {
      const { result } = renderHook(() => useChatbot())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })
    })
  })

  describe('message handling', () => {
    it('should calculate stats correctly with messages', () => {
      mockChatReturn.messages = [
        { role: 'user', content: 'Question 1', id: '1' },
        { role: 'assistant', content: 'Answer 1', id: '2' },
        { role: 'user', content: 'Question 2', id: '3' },
        { role: 'assistant', content: 'Answer 2', id: '4' },
      ]

      const { result } = renderHook(() => useChatbot())

      expect(result.current.stats).toEqual({
        messageCount: 4,
        userMessages: 2,
        assistantMessages: 2,
        isNewConversation: false,
      })
    })

    it('should set isNewConversation to false when messages exist', () => {
      mockChatReturn.messages = [
        { role: 'user', content: 'Hello', id: '1' },
      ]

      const { result } = renderHook(() => useChatbot())

      expect(result.current.isNewConversation).toBe(false)
    })

    it('should save history when message completes', async () => {
      let onFinishCallback: any

      mockUseChat.mockImplementation((config: any) => {
        onFinishCallback = config.onFinish
        return mockChatReturn
      })

      renderHook(() => useChatbot())

      const newMessage = { role: 'assistant', content: 'Response', id: '1' }
      mockChatReturn.messages = [newMessage]

      act(() => {
        onFinishCallback(newMessage)
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'clauger-chat-history',
        JSON.stringify([newMessage])
      )
    })

    it('should limit history to MAX_HISTORY_LENGTH', async () => {
      let onFinishCallback: any

      mockUseChat.mockImplementation((config: any) => {
        onFinishCallback = config.onFinish
        return mockChatReturn
      })

      renderHook(() => useChatbot())

      // Create 60 messages (more than MAX_HISTORY_LENGTH of 50)
      const messages = Array.from({ length: 60 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        id: String(i),
      }))

      mockChatReturn.messages = messages

      act(() => {
        onFinishCallback(messages[messages.length - 1])
      })

      const savedData = (mockLocalStorage.setItem as jest.Mock).mock.calls[0][1]
      const savedMessages = JSON.parse(savedData)

      expect(savedMessages.length).toBe(50)
      expect(savedMessages[0].content).toBe('Message 10') // First 10 messages should be trimmed
    })
  })

  describe('handleSubmit with rate limiting', () => {
    it('should submit when rate limit allows', async () => {
      const { result } = renderHook(() => useChatbot())

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockChatRateLimiter.checkAndConsume).toHaveBeenCalled()
      expect(mockChatReturn.handleSubmit).toHaveBeenCalled()
      expect(mockToast.error).not.toHaveBeenCalled()
    })

    it('should prevent submission when rate limited', async () => {
      mockChatRateLimiter.checkAndConsume.mockResolvedValue({
        allowed: false,
        remainingTokens: 0,
        retryAfter: 30,
      })

      const { result } = renderHook(() => useChatbot())

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockToast.error).toHaveBeenCalledWith('Trop de requêtes', {
        description: 'Veuillez patienter 30s avant de réessayer.',
      })
      expect(mockChatReturn.handleSubmit).not.toHaveBeenCalled()
    })

    it('should track rate limit exceeded event', async () => {
      mockChatRateLimiter.checkAndConsume.mockResolvedValue({
        allowed: false,
        remainingTokens: 0,
        retryAfter: 45,
      })

      const { result } = renderHook(() => useChatbot())

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockTrackRateLimitExceeded).toHaveBeenCalledWith({
        retryAfter: 45,
        remainingTokens: 0,
        requestCount: 0,
      })
    })

    it('should handle form event preventDefault', async () => {
      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>

      const { result } = renderHook(() => useChatbot())

      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('sendSuggestedQuestion', () => {
    it('should send suggested question when rate limit allows', async () => {
      jest.useFakeTimers()
      const { result } = renderHook(() => useChatbot())

      await act(async () => {
        await result.current.sendSuggestedQuestion('What is RSE?')
      })

      expect(mockChatReturn.setInput).toHaveBeenCalledWith('What is RSE?')

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockChatReturn.handleSubmit).toHaveBeenCalled()

      jest.useRealTimers()
    })

    it('should prevent sending when rate limited', async () => {
      mockChatRateLimiter.checkAndConsume.mockResolvedValue({
        allowed: false,
        remainingTokens: 0,
        retryAfter: 60,
      })

      const { result } = renderHook(() => useChatbot())

      await act(async () => {
        await result.current.sendSuggestedQuestion('Test question')
      })

      expect(mockToast.error).toHaveBeenCalledWith('Trop de requêtes', {
        description: 'Veuillez patienter 60s avant de réessayer.',
      })
      expect(mockChatReturn.setInput).not.toHaveBeenCalled()
    })

    it('should track rate limit exceeded for suggested questions', async () => {
      mockChatRateLimiter.checkAndConsume.mockResolvedValue({
        allowed: false,
        remainingTokens: 2,
        retryAfter: 15,
      })

      mockChatReturn.messages = [
        { role: 'user', content: 'Previous', id: '1' },
      ]

      const { result } = renderHook(() => useChatbot())

      await act(async () => {
        await result.current.sendSuggestedQuestion('Test')
      })

      expect(mockTrackRateLimitExceeded).toHaveBeenCalledWith({
        retryAfter: 15,
        remainingTokens: 2,
        requestCount: 1,
      })
    })
  })

  describe('error handling', () => {
    it('should handle chat errors via onError callback', () => {
      let onErrorCallback: any

      mockUseChat.mockImplementation((config: any) => {
        onErrorCallback = config.onError
        return mockChatReturn
      })

      const customErrorHandler = jest.fn()
      renderHook(() => useChatbot({ onError: customErrorHandler }))

      const error = new Error('API failed')

      act(() => {
        onErrorCallback(error)
      })

      expect(mockToast.error).toHaveBeenCalledWith('Une erreur est survenue', {
        description: 'API failed',
      })
      expect(customErrorHandler).toHaveBeenCalledWith(error)
    })

    it('should handle errors without message', () => {
      let onErrorCallback: any

      mockUseChat.mockImplementation((config: any) => {
        onErrorCallback = config.onError
        return mockChatReturn
      })

      renderHook(() => useChatbot())

      const error = new Error()
      error.message = ''

      act(() => {
        onErrorCallback(error)
      })

      expect(mockToast.error).toHaveBeenCalledWith('Une erreur est survenue', {
        description: 'Veuillez réessayer.',
      })
    })

    it('should not call custom onError if not provided', () => {
      let onErrorCallback: any

      mockUseChat.mockImplementation((config: any) => {
        onErrorCallback = config.onError
        return mockChatReturn
      })

      renderHook(() => useChatbot())

      const error = new Error('Test error')

      expect(() => {
        act(() => {
          onErrorCallback(error)
        })
      }).not.toThrow()
    })
  })

  describe('clearHistory and restartConversation', () => {
    it('should clear history and reload page when confirmed', () => {
      (window.confirm as jest.Mock).mockReturnValue(true)

      const { result } = renderHook(() => useChatbot())

      act(() => {
        result.current.restartConversation()
      })

      expect(window.confirm).toHaveBeenCalledWith(
        "Voulez-vous vraiment effacer l'historique de la conversation ?"
      )
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('clauger-chat-history')
      expect(reloadPageSpy).toHaveBeenCalled()
    })

    it('should not clear history when cancelled', () => {
      (window.confirm as jest.Mock).mockReturnValue(false)

      const { result } = renderHook(() => useChatbot())

      act(() => {
        result.current.restartConversation()
      })

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
      expect(reloadPageSpy).not.toHaveBeenCalled()
    })

    it('should call clearHistory directly', () => {
      const { result } = renderHook(() => useChatbot())

      act(() => {
        result.current.clearHistory()
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('clauger-chat-history')
      expect(reloadPageSpy).toHaveBeenCalled()
    })

    it('should handle localStorage errors on clear', () => {
      (mockLocalStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { result } = renderHook(() => useChatbot())

      expect(() => {
        act(() => {
          result.current.clearHistory()
        })
      }).not.toThrow()
    })
  })

  describe('cleanup and unmount', () => {
    it('should track session ended on unmount with messages', () => {
      mockChatReturn.messages = [
        { role: 'user', content: 'Hello', id: '1' },
        { role: 'assistant', content: 'Hi', id: '2' },
      ]

      const { unmount } = renderHook(() => useChatbot())

      unmount()

      expect(mockTrackSessionEnded).toHaveBeenCalledWith(
        expect.objectContaining({
          messageCount: 2,
          userMessageCount: 1,
          assistantMessageCount: 1,
          thinkingUsed: false,
          cacheHits: 0,
          errors: 0,
        })
      )
    })

    it('should not track session ended on unmount without messages', () => {
      mockChatReturn.messages = []

      const { unmount } = renderHook(() => useChatbot())

      unmount()

      expect(mockTrackSessionEnded).not.toHaveBeenCalled()
    })
  })

  describe('props forwarding', () => {
    it('should forward all useChat props', () => {
      mockChatReturn.isLoading = true
      mockChatReturn.error = new Error('Test')
      mockChatReturn.input = 'Test input'

      const { result } = renderHook(() => useChatbot())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toEqual(new Error('Test'))
      expect(result.current.input).toBe('Test input')
      expect(result.current.messages).toEqual([])
      expect(result.current.setInput).toBe(mockChatReturn.setInput)
    })
  })
})

describe('useCurrentPage', () => {
  let mockLocalStorage: Storage
  let getLocationSearchSpy: jest.SpyInstance

  beforeEach(() => {
    // Setup windowHelpers spy
    getLocationSearchSpy = jest.spyOn(windowHelpers, 'getLocationSearch').mockReturnValue('')

    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })

    jest.clearAllMocks()
  })

  it('should return undefined when no page is set', () => {
    getLocationSearchSpy.mockReturnValue('')

    const { result } = renderHook(() => useCurrentPage())

    expect(result.current).toBeUndefined()
  })

  it('should extract page from URL params', async () => {
    getLocationSearchSpy.mockReturnValue('?page=5')

    const { result } = renderHook(() => useCurrentPage())

    await waitFor(() => {
      expect(result.current).toBe(5)
    })
  })

  it('should extract page from localStorage reading state', async () => {
    getLocationSearchSpy.mockReturnValue('')

    const readingState = { lastPage: 10, progress: 0.5 }
    ;(mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(readingState))

    const { result } = renderHook(() => useCurrentPage())

    await waitFor(() => {
      expect(result.current).toBe(10)
    })
  })

  it('should prefer URL param over localStorage', async () => {
    getLocationSearchSpy.mockReturnValue('?page=7')

    const readingState = { lastPage: 10 }
    ;(mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(readingState))

    const { result } = renderHook(() => useCurrentPage())

    await waitFor(() => {
      expect(result.current).toBe(7)
    })
  })

  it('should handle invalid JSON in localStorage', async () => {
    getLocationSearchSpy.mockReturnValue('')

    ;(mockLocalStorage.getItem as jest.Mock).mockReturnValue('invalid json')

    const { result } = renderHook(() => useCurrentPage())

    await waitFor(() => {
      expect(result.current).toBeUndefined()
    })
  })

  it('should handle missing lastPage in reading state', async () => {
    getLocationSearchSpy.mockReturnValue('')

    const readingState = { progress: 0.5 }
    ;(mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(readingState))

    const { result } = renderHook(() => useCurrentPage())

    await waitFor(() => {
      expect(result.current).toBeUndefined()
    })
  })

  it('should parse page number correctly', async () => {
    getLocationSearchSpy.mockReturnValue('?page=42')

    const { result } = renderHook(() => useCurrentPage())

    await waitFor(() => {
      expect(result.current).toBe(42)
      expect(typeof result.current).toBe('number')
    })
  })
})
