import { renderHook, act } from '@testing-library/react'
import { useReadingState } from '@/hooks/useReadingState'
import { logger } from '@/lib/security/secure-logger'

const STORAGE_KEY = 'clauger-reading-state'

describe('useReadingState', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}

    const localStorageMock: Storage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key])
      },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() {
        return Object.keys(store).length
      },
    }

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    })

    jest.spyOn(Date, 'now').mockReturnValue(1000000)
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    store = {}
  })

  describe('initialization', () => {
    it('should initialize with null savedState when no stored data', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.savedState).toBeNull()
      expect(result.current.hasResumePoint).toBe(false)
    })

    it('should load savedState from localStorage on mount', () => {
      const mockState = {
        lastPage: 5,
        zoomLevel: 'large' as const,
        sidebarCollapsed: true,
        timestamp: 999999,
      }
      store[STORAGE_KEY] = JSON.stringify(mockState)

      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.savedState).toEqual(mockState)
    })

    it('should return null savedState when localStorage has invalid JSON', () => {
      store[STORAGE_KEY] = 'invalid json'

      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.savedState).toBeNull()
      expect(logger.error).toHaveBeenCalledWith('localStorage parse failed', {
        operation: 'parse',
        key: 'readingState',
        error: expect.any(String),
      })
    })

    it('should handle localStorage.getItem throwing error', () => {
      Object.defineProperty(global.localStorage, 'getItem', {
        value: () => {
          throw new Error('Storage error')
        },
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.savedState).toBeNull()
      expect(logger.error).toHaveBeenCalledWith('localStorage load failed', {
        operation: 'load',
        key: 'readingState',
        error: expect.any(String),
      })
    })
  })

  describe('saveState', () => {
    it('should save state using current props when no arguments provided', () => {
      const { result } = renderHook(() => useReadingState(3, 'large', true))

      act(() => {
        result.current.saveState()
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved).toEqual({
        lastPage: 3,
        zoomLevel: 'large',
        sidebarCollapsed: true,
        timestamp: 1000000,
      })
      expect(result.current.savedState).toEqual(saved)
    })

    it('should save state with custom page argument', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(10)
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved.lastPage).toBe(10)
      expect(saved.zoomLevel).toBe('normal')
      expect(saved.sidebarCollapsed).toBe(false)
    })

    it('should save state with custom zoom argument', () => {
      const { result } = renderHook(() => useReadingState(5, 'normal', false))

      act(() => {
        result.current.saveState(undefined, 'extra-large')
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved.lastPage).toBe(5)
      expect(saved.zoomLevel).toBe('extra-large')
      expect(saved.sidebarCollapsed).toBe(false)
    })

    it('should save state with custom sidebarCollapsed argument', () => {
      const { result } = renderHook(() => useReadingState(5, 'normal', false))

      act(() => {
        result.current.saveState(undefined, undefined, true)
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved.lastPage).toBe(5)
      expect(saved.zoomLevel).toBe('normal')
      expect(saved.sidebarCollapsed).toBe(true)
    })

    it('should save state with all custom arguments', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(42, 'extra-large', true)
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved).toEqual({
        lastPage: 42,
        zoomLevel: 'extra-large',
        sidebarCollapsed: true,
        timestamp: 1000000,
      })
    })

    it('should update savedState in hook after saving', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.savedState).toBeNull()

      act(() => {
        result.current.saveState(10, 'large', false)
      })

      expect(result.current.savedState).toEqual({
        lastPage: 10,
        zoomLevel: 'large',
        sidebarCollapsed: false,
        timestamp: 1000000,
      })
    })

    it('should overwrite existing saved state', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(5, 'large', true)
      })

      expect(JSON.parse(store[STORAGE_KEY]).lastPage).toBe(5)

      act(() => {
        result.current.saveState(10, 'extra-large', false)
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved.lastPage).toBe(10)
      expect(saved.zoomLevel).toBe('extra-large')
      expect(saved.sidebarCollapsed).toBe(false)
    })

    it('should save page 0', () => {
      const { result } = renderHook(() => useReadingState(0, 'normal', false))

      act(() => {
        result.current.saveState()
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved.lastPage).toBe(0)
    })

    it('should handle localStorage.setItem errors gracefully', () => {
      Object.defineProperty(global.localStorage, 'setItem', {
        value: () => {
          throw new Error('Storage full')
        },
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState()
      })

      // Should not throw, handled internally
      expect(store[STORAGE_KEY]).toBeUndefined()
      expect(logger.error).toHaveBeenCalledWith('localStorage save failed', {
        operation: 'save',
        key: 'readingState',
        error: expect.any(String),
      })
    })
  })

  describe('clearState', () => {
    it('should remove state from localStorage', () => {
      const { result } = renderHook(() => useReadingState(5, 'large', true))

      act(() => {
        result.current.saveState()
      })

      expect(store[STORAGE_KEY]).toBeDefined()

      act(() => {
        result.current.clearState()
      })

      expect(store[STORAGE_KEY]).toBeUndefined()
    })

    it('should set savedState to null after clearing', () => {
      const { result } = renderHook(() => useReadingState(5, 'large', true))

      act(() => {
        result.current.saveState()
      })

      expect(result.current.savedState).not.toBeNull()

      act(() => {
        result.current.clearState()
      })

      expect(result.current.savedState).toBeNull()
    })

    it('should work when no state exists', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.clearState()
      })

      expect(result.current.savedState).toBeNull()
      expect(store[STORAGE_KEY]).toBeUndefined()
    })

    it('should handle localStorage.removeItem errors gracefully', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState()
      })

      Object.defineProperty(global.localStorage, 'removeItem', {
        value: () => {
          throw new Error('Remove error')
        },
        writable: true,
        configurable: true,
      })

      act(() => {
        result.current.clearState()
      })

      // Should still update internal state
      expect(result.current.savedState).toBeNull()
      expect(logger.error).toHaveBeenCalledWith('localStorage clear failed', {
        operation: 'clear',
        key: 'readingState',
        error: expect.any(String),
      })
    })
  })

  describe('hasResumePoint', () => {
    it('should be false when savedState is null', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.hasResumePoint).toBe(false)
    })

    it('should be false when lastPage is 1', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(1)
      })

      expect(result.current.hasResumePoint).toBe(false)
    })

    it('should be false when lastPage is 0', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(0)
      })

      expect(result.current.hasResumePoint).toBe(false)
    })

    it('should be true when lastPage is 2', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(2)
      })

      expect(result.current.hasResumePoint).toBe(true)
    })

    it('should be true when lastPage is greater than 1', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(10)
      })

      expect(result.current.hasResumePoint).toBe(true)
    })

    it('should update when state changes', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.hasResumePoint).toBe(false)

      act(() => {
        result.current.saveState(5)
      })

      expect(result.current.hasResumePoint).toBe(true)

      act(() => {
        result.current.clearState()
      })

      expect(result.current.hasResumePoint).toBe(false)
    })
  })

  describe('props changes', () => {
    it('should update saveState behavior when currentPage changes', () => {
      const { result, rerender } = renderHook(
        ({ page, zoom, collapsed }) => useReadingState(page, zoom, collapsed),
        { initialProps: { page: 1, zoom: 'normal' as const, collapsed: false } }
      )

      act(() => {
        result.current.saveState()
      })

      expect(JSON.parse(store[STORAGE_KEY]).lastPage).toBe(1)

      rerender({ page: 10, zoom: 'normal' as const, collapsed: false })

      act(() => {
        result.current.saveState()
      })

      expect(JSON.parse(store[STORAGE_KEY]).lastPage).toBe(10)
    })

    it('should update saveState behavior when zoom changes', () => {
      const { result, rerender } = renderHook(
        ({ page, zoom, collapsed }) => useReadingState(page, zoom, collapsed),
        { initialProps: { page: 1, zoom: 'normal' as const, collapsed: false } }
      )

      act(() => {
        result.current.saveState()
      })

      expect(JSON.parse(store[STORAGE_KEY]).zoomLevel).toBe('normal')

      rerender({ page: 1, zoom: 'large' as const, collapsed: false })

      act(() => {
        result.current.saveState()
      })

      expect(JSON.parse(store[STORAGE_KEY]).zoomLevel).toBe('large')
    })

    it('should update saveState behavior when sidebarCollapsed changes', () => {
      const { result, rerender } = renderHook(
        ({ page, zoom, collapsed }) => useReadingState(page, zoom, collapsed),
        { initialProps: { page: 1, zoom: 'normal' as const, collapsed: false } }
      )

      act(() => {
        result.current.saveState()
      })

      expect(JSON.parse(store[STORAGE_KEY]).sidebarCollapsed).toBe(false)

      rerender({ page: 1, zoom: 'normal' as const, collapsed: true })

      act(() => {
        result.current.saveState()
      })

      expect(JSON.parse(store[STORAGE_KEY]).sidebarCollapsed).toBe(true)
    })
  })

  describe('integration', () => {
    it('should persist state across hook instances', () => {
      const { result: result1 } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result1.current.saveState(15, 'large', true)
      })

      const { result: result2 } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result2.current.savedState).toEqual({
        lastPage: 15,
        zoomLevel: 'large',
        sidebarCollapsed: true,
        timestamp: 1000000,
      })
      expect(result2.current.hasResumePoint).toBe(true)
    })

    it('should handle complete workflow', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      expect(result.current.savedState).toBeNull()
      expect(result.current.hasResumePoint).toBe(false)

      act(() => {
        result.current.saveState(10, 'large', false)
      })

      expect(result.current.savedState?.lastPage).toBe(10)
      expect(result.current.hasResumePoint).toBe(true)

      act(() => {
        result.current.saveState(20, 'extra-large', true)
      })

      expect(result.current.savedState?.lastPage).toBe(20)
      expect(result.current.savedState?.zoomLevel).toBe('extra-large')
      expect(result.current.savedState?.sidebarCollapsed).toBe(true)

      act(() => {
        result.current.clearState()
      })

      expect(result.current.savedState).toBeNull()
      expect(result.current.hasResumePoint).toBe(false)
    })

    it('should maintain timestamp consistency', () => {
      const { result } = renderHook(() => useReadingState(1, 'normal', false))

      act(() => {
        result.current.saveState(5)
      })

      expect(result.current.savedState?.timestamp).toBe(1000000)

      jest.spyOn(Date, 'now').mockReturnValue(2000000)

      act(() => {
        result.current.saveState(6)
      })

      expect(result.current.savedState?.timestamp).toBe(2000000)
    })
  })

  describe('edge cases', () => {
    it('should handle negative page numbers', () => {
      const { result } = renderHook(() => useReadingState(-1, 'normal', false))

      act(() => {
        result.current.saveState()
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved.lastPage).toBe(-1)
      expect(result.current.hasResumePoint).toBe(false)
    })

    it('should handle very large page numbers', () => {
      const { result } = renderHook(() => useReadingState(999999, 'normal', false))

      act(() => {
        result.current.saveState()
      })

      const saved = JSON.parse(store[STORAGE_KEY])
      expect(saved.lastPage).toBe(999999)
      expect(result.current.hasResumePoint).toBe(true)
    })

    it('should handle all zoom level values', () => {
      const zoomLevels = ['extra-small', 'small', 'normal', 'large', 'extra-large'] as const

      zoomLevels.forEach((zoom) => {
        const { result } = renderHook(() => useReadingState(1, zoom, false))

        act(() => {
          result.current.saveState()
        })

        const saved = JSON.parse(store[STORAGE_KEY])
        expect(saved.zoomLevel).toBe(zoom)
      })
    })

    it('should handle saveState callback stability', () => {
      const { result, rerender } = renderHook(
        ({ page }) => useReadingState(page, 'normal', false),
        { initialProps: { page: 1 } }
      )

      const saveState1 = result.current.saveState

      rerender({ page: 2 })

      const saveState2 = result.current.saveState

      // Callback should NOT be stable because it depends on currentPage (a dependency)
      expect(saveState1).not.toBe(saveState2)
    })

    it('should handle clearState callback stability', () => {
      const { result, rerender } = renderHook(
        ({ page }) => useReadingState(page, 'normal', false),
        { initialProps: { page: 1 } }
      )

      const clearState1 = result.current.clearState

      rerender({ page: 2 })

      const clearState2 = result.current.clearState

      // Callback should be stable (same reference) due to useCallback
      expect(clearState1).toBe(clearState2)
    })
  })
})
