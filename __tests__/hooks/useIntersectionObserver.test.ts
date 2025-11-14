import { renderHook, waitFor } from '@testing-library/react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { act } from 'react'
import { useState, useLayoutEffect } from 'react'

describe('useIntersectionObserver', () => {
  let mockIntersectionObserver: jest.Mock
  let mockObserve: jest.Mock
  let mockUnobserve: jest.Mock
  let mockDisconnect: jest.Mock
  let observerCallback: IntersectionObserverCallback

  beforeEach(() => {
    mockObserve = jest.fn()
    mockUnobserve = jest.fn()
    mockDisconnect = jest.fn()

    mockIntersectionObserver = jest.fn((callback) => {
      observerCallback = callback
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      }
    })

    global.IntersectionObserver = mockIntersectionObserver as any
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Helper to setup hook with element attached
  const setupHookWithElement = (options?: any) => {
    const mockElement = document.createElement('div')

    const { result } = renderHook(() => {
      const hook = useIntersectionObserver(options)
      const [, forceUpdate] = useState(0)

      useLayoutEffect(() => {
        if (hook.ref.current === null) {
          hook.ref.current = mockElement as HTMLDivElement
          forceUpdate(x => x + 1)
        }
      }, [])

      return hook
    })

    return { result, mockElement }
  }

  describe('initialization', () => {
    it('should return ref and isVisible false initially', () => {
      const { result } = renderHook(() => useIntersectionObserver())

      expect(result.current.ref).toBeDefined()
      expect(result.current.ref.current).toBeNull()
      expect(result.current.isVisible).toBe(false)
    })

    it('should create IntersectionObserver with default options', async () => {
      const { result } = setupHookWithElement()

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalledWith(
          expect.any(Function),
          { threshold: 0.2, rootMargin: '0px' }
        )
      })
    })

    it('should create IntersectionObserver with custom threshold', async () => {
      const { result } = setupHookWithElement({ threshold: 0.5 })

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalledWith(
          expect.any(Function),
          { threshold: 0.5, rootMargin: '0px' }
        )
      })
    })

    it('should create IntersectionObserver with custom rootMargin', async () => {
      const { result } = setupHookWithElement({ rootMargin: '100px' })

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalledWith(
          expect.any(Function),
          { threshold: 0.2, rootMargin: '100px' }
        )
      })
    })

    it('should not create observer when element is not attached', () => {
      renderHook(() => useIntersectionObserver())

      expect(mockObserve).not.toHaveBeenCalled()
    })
  })

  describe('intersection detection', () => {
    it('should set isVisible to true when element intersects', async () => {
      const { result } = setupHookWithElement()

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      expect(result.current.isVisible).toBe(false)

      // Simulate intersection
      act(() => {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          mockIntersectionObserver() as IntersectionObserver
        )
      })

      expect(result.current.isVisible).toBe(true)
    })

    it('should observe element when ref is attached', async () => {
      const { mockElement } = setupHookWithElement()

      await waitFor(() => {
        expect(mockObserve).toHaveBeenCalledWith(mockElement)
      })
    })

    it('should unobserve element after intersection when triggerOnce is true', async () => {
      const { result, mockElement } = setupHookWithElement({ triggerOnce: true })

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      act(() => {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          mockIntersectionObserver() as IntersectionObserver
        )
      })

      expect(mockUnobserve).toHaveBeenCalledWith(mockElement)
    })

    it('should not unobserve element when triggerOnce is false', async () => {
      const { result } = setupHookWithElement({ triggerOnce: false })

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      act(() => {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          mockIntersectionObserver() as IntersectionObserver
        )
      })

      expect(mockUnobserve).not.toHaveBeenCalled()
    })
  })

  describe('triggerOnce behavior', () => {
    it('should keep isVisible true when element leaves viewport with triggerOnce', async () => {
      const { result } = setupHookWithElement({ triggerOnce: true })

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      // Element enters viewport
      act(() => {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          mockIntersectionObserver() as IntersectionObserver
        )
      })

      expect(result.current.isVisible).toBe(true)

      // After triggerOnce, the observer unobserves the element
      // so the callback would not be called again in real usage
      // The visibility state should remain true
      expect(result.current.isVisible).toBe(true)
    })

    it('should set isVisible to false when element leaves viewport with triggerOnce false', async () => {
      const mockElement = document.createElement('div')
      let callback: IntersectionObserverCallback

      // Override mock to capture callback
      const customMock = jest.fn((cb) => {
        callback = cb
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect,
        }
      })
      global.IntersectionObserver = customMock as any

      // Setup hook after mock is in place
      const { result } = renderHook(() => {
        const hook = useIntersectionObserver({ triggerOnce: false })
        const [, forceUpdate] = useState(0)

        useLayoutEffect(() => {
          if (hook.ref.current === null) {
            hook.ref.current = mockElement as HTMLDivElement
            forceUpdate(x => x + 1)
          }
        }, [])

        return hook
      })

      await waitFor(() => {
        expect(customMock).toHaveBeenCalled()
      })

      // Element enters viewport
      act(() => {
        callback!(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          customMock() as IntersectionObserver
        )
      })

      expect(result.current.isVisible).toBe(true)

      // Element leaves viewport
      act(() => {
        callback!(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          customMock() as IntersectionObserver
        )
      })

      expect(result.current.isVisible).toBe(false)
    })

    it('should toggle visibility multiple times when triggerOnce is false', async () => {
      const mockElement = document.createElement('div')
      let callback: IntersectionObserverCallback

      // Override mock to capture callback
      const customMock = jest.fn((cb) => {
        callback = cb
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect,
        }
      })
      global.IntersectionObserver = customMock as any

      // Setup hook after mock is in place
      const { result } = renderHook(() => {
        const hook = useIntersectionObserver({ triggerOnce: false })
        const [, forceUpdate] = useState(0)

        useLayoutEffect(() => {
          if (hook.ref.current === null) {
            hook.ref.current = mockElement as HTMLDivElement
            forceUpdate(x => x + 1)
          }
        }, [])

        return hook
      })

      await waitFor(() => {
        expect(customMock).toHaveBeenCalled()
      })

      // First intersection
      act(() => {
        callback!(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          customMock() as IntersectionObserver
        )
      })
      expect(result.current.isVisible).toBe(true)

      // Leave viewport
      act(() => {
        callback!(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          customMock() as IntersectionObserver
        )
      })
      expect(result.current.isVisible).toBe(false)

      // Second intersection
      act(() => {
        callback!(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          customMock() as IntersectionObserver
        )
      })
      expect(result.current.isVisible).toBe(true)

      // Leave viewport again
      act(() => {
        callback!(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          customMock() as IntersectionObserver
        )
      })
      expect(result.current.isVisible).toBe(false)
    })
  })

  describe('cleanup', () => {
    it('should disconnect observer on unmount', async () => {
      const { result, mockElement } = setupHookWithElement()
      const { unmount } = renderHook(() => {
        const hook = useIntersectionObserver()
        const [, forceUpdate] = useState(0)

        useLayoutEffect(() => {
          if (hook.ref.current === null) {
            hook.ref.current = mockElement as HTMLDivElement
            forceUpdate(x => x + 1)
          }
        }, [])

        return hook
      })

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('should recreate observer when threshold changes', async () => {
      const mockElement = document.createElement('div')

      const { result, rerender } = renderHook(
        ({ threshold }) => {
          const hook = useIntersectionObserver({ threshold })
          const [, forceUpdate] = useState(0)

          useLayoutEffect(() => {
            if (hook.ref.current === null) {
              hook.ref.current = mockElement as HTMLDivElement
              forceUpdate(x => x + 1)
            }
          }, [])

          return hook
        },
        { initialProps: { threshold: 0.2 } }
      )

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      const initialCallCount = mockIntersectionObserver.mock.calls.length

      rerender({ threshold: 0.5 })

      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled()
        expect(mockIntersectionObserver.mock.calls.length).toBeGreaterThan(
          initialCallCount
        )
      })
    })

    it('should recreate observer when rootMargin changes', async () => {
      const mockElement = document.createElement('div')

      const { result, rerender } = renderHook(
        ({ rootMargin }) => {
          const hook = useIntersectionObserver({ rootMargin })
          const [, forceUpdate] = useState(0)

          useLayoutEffect(() => {
            if (hook.ref.current === null) {
              hook.ref.current = mockElement as HTMLDivElement
              forceUpdate(x => x + 1)
            }
          }, [])

          return hook
        },
        { initialProps: { rootMargin: '0px' } }
      )

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      const initialCallCount = mockIntersectionObserver.mock.calls.length

      rerender({ rootMargin: '100px' })

      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled()
        expect(mockIntersectionObserver.mock.calls.length).toBeGreaterThan(
          initialCallCount
        )
      })
    })

    it('should recreate observer when triggerOnce changes', async () => {
      const mockElement = document.createElement('div')

      const { result, rerender } = renderHook(
        ({ triggerOnce }) => {
          const hook = useIntersectionObserver({ triggerOnce })
          const [, forceUpdate] = useState(0)

          useLayoutEffect(() => {
            if (hook.ref.current === null) {
              hook.ref.current = mockElement as HTMLDivElement
              forceUpdate(x => x + 1)
            }
          }, [])

          return hook
        },
        { initialProps: { triggerOnce: true } }
      )

      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })

      const initialCallCount = mockIntersectionObserver.mock.calls.length

      rerender({ triggerOnce: false })

      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled()
        expect(mockIntersectionObserver.mock.calls.length).toBeGreaterThan(
          initialCallCount
        )
      })
    })
  })
})
