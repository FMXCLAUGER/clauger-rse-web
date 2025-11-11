import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'
import { act } from 'react'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('basic functionality', () => {
    it('should return the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300))

      expect(result.current).toBe('initial')
    })

    it('should debounce string value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 300 } }
      )

      expect(result.current).toBe('first')

      // Change value
      rerender({ value: 'second', delay: 300 })

      // Value should not change immediately
      expect(result.current).toBe('first')

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Value should now be updated
      expect(result.current).toBe('second')
    })

    it('should debounce number value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 1 } }
      )

      expect(result.current).toBe(1)

      rerender({ value: 2 })
      expect(result.current).toBe(1)

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe(2)
    })

    it('should debounce boolean value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: true } }
      )

      expect(result.current).toBe(true)

      rerender({ value: false })
      expect(result.current).toBe(true)

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe(false)
    })

    it('should debounce object value changes', () => {
      const obj1 = { id: 1, name: 'first' }
      const obj2 = { id: 2, name: 'second' }

      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: obj1 } }
      )

      expect(result.current).toBe(obj1)

      rerender({ value: obj2 })
      expect(result.current).toBe(obj1)

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe(obj2)
    })

    it('should debounce array value changes', () => {
      const arr1 = [1, 2, 3]
      const arr2 = [4, 5, 6]

      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: arr1 } }
      )

      expect(result.current).toBe(arr1)

      rerender({ value: arr2 })
      expect(result.current).toBe(arr1)

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe(arr2)
    })
  })

  describe('delay customization', () => {
    it('should use default delay of 300ms when not specified', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value),
        { initialProps: { value: 'first' } }
      )

      rerender({ value: 'second' })
      expect(result.current).toBe('first')

      act(() => {
        jest.advanceTimersByTime(299)
      })
      expect(result.current).toBe('first')

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(result.current).toBe('second')
    })

    it('should respect custom delay of 500ms', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'first' } }
      )

      rerender({ value: 'second' })

      act(() => {
        jest.advanceTimersByTime(499)
      })
      expect(result.current).toBe('first')

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(result.current).toBe('second')
    })

    it('should respect custom delay of 100ms', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'first' } }
      )

      rerender({ value: 'second' })

      act(() => {
        jest.advanceTimersByTime(99)
      })
      expect(result.current).toBe('first')

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(result.current).toBe('second')
    })

    it('should respect delay of 0ms', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        { initialProps: { value: 'first' } }
      )

      rerender({ value: 'second' })
      expect(result.current).toBe('first')

      act(() => {
        jest.advanceTimersByTime(0)
      })
      expect(result.current).toBe('second')
    })

    it('should update when delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 300 } }
      )

      rerender({ value: 'second', delay: 500 })

      act(() => {
        jest.advanceTimersByTime(300)
      })
      // Should not update yet because delay changed to 500
      expect(result.current).toBe('first')

      act(() => {
        jest.advanceTimersByTime(200)
      })
      expect(result.current).toBe('second')
    })
  })

  describe('rapid value changes', () => {
    it('should only update once after rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'v1' } }
      )

      // Rapidly change values
      rerender({ value: 'v2' })
      act(() => jest.advanceTimersByTime(100))

      rerender({ value: 'v3' })
      act(() => jest.advanceTimersByTime(100))

      rerender({ value: 'v4' })
      act(() => jest.advanceTimersByTime(100))

      // Should still be original value
      expect(result.current).toBe('v1')

      // After full delay from last change
      act(() => {
        jest.advanceTimersByTime(200)
      })

      // Should be the last value
      expect(result.current).toBe('v4')
    })

    it('should cancel pending updates when value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'first' } }
      )

      rerender({ value: 'second' })
      act(() => jest.advanceTimersByTime(200))

      // Change again before timeout completes
      rerender({ value: 'third' })

      // Wait for original timeout
      act(() => jest.advanceTimersByTime(100))
      expect(result.current).toBe('first') // Should not be 'second'

      // Wait for new timeout
      act(() => jest.advanceTimersByTime(200))
      expect(result.current).toBe('third')
    })

    it('should handle 10 rapid changes correctly', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 0 } }
      )

      // Make 10 rapid changes
      for (let i = 1; i <= 10; i++) {
        rerender({ value: i })
        act(() => jest.advanceTimersByTime(50))
      }

      expect(result.current).toBe(0)

      // Wait for final debounce
      act(() => jest.advanceTimersByTime(250))

      expect(result.current).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('should handle null value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'something' as string | null } }
      )

      rerender({ value: null })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe(null)
    })

    it('should handle undefined value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'something' as string | undefined } }
      )

      rerender({ value: undefined })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe(undefined)
    })

    it('should handle empty string', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'non-empty' } }
      )

      rerender({ value: '' })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe('')
    })

    it('should handle zero value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 5 } }
      )

      rerender({ value: 0 })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe(0)
    })

    it('should handle same value updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'same' } }
      )

      rerender({ value: 'same' })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      expect(result.current).toBe('same')
    })
  })

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'first' } }
      )

      rerender({ value: 'second' })

      // Unmount before timeout completes
      unmount()

      act(() => {
        jest.advanceTimersByTime(300)
      })

      // Value should not have updated after unmount
      expect(result.current).toBe('first')
    })

    it('should clear previous timeout when value changes', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      const { rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'first' } }
      )

      const initialCallCount = clearTimeoutSpy.mock.calls.length

      rerender({ value: 'second' })

      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(initialCallCount)

      clearTimeoutSpy.mockRestore()
    })
  })

  describe('TypeScript generics', () => {
    it('should work with generic string type', () => {
      const { result } = renderHook(() => useDebounce<string>('test', 300))
      expect(typeof result.current).toBe('string')
    })

    it('should work with generic number type', () => {
      const { result } = renderHook(() => useDebounce<number>(42, 300))
      expect(typeof result.current).toBe('number')
    })

    it('should work with generic boolean type', () => {
      const { result } = renderHook(() => useDebounce<boolean>(true, 300))
      expect(typeof result.current).toBe('boolean')
    })

    it('should work with generic object type', () => {
      type User = { id: number; name: string }
      const user: User = { id: 1, name: 'Test' }
      const { result } = renderHook(() => useDebounce<User>(user, 300))
      expect(result.current).toEqual(user)
    })

    it('should work with generic array type', () => {
      const { result } = renderHook(() => useDebounce<number[]>([1, 2, 3], 300))
      expect(Array.isArray(result.current)).toBe(true)
    })
  })
})
