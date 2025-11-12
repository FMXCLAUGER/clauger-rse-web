import { renderHook } from '@testing-library/react'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { createKeyboardEvent } from '../utils/test-utils'

describe('useKeyboardNavigation', () => {
  let onPrev: jest.Mock
  let onNext: jest.Mock

  beforeEach(() => {
    onPrev = jest.fn()
    onNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should call onPrev when ArrowLeft is pressed', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const event = createKeyboardEvent('ArrowLeft')
      window.dispatchEvent(event)

      expect(onPrev).toHaveBeenCalledTimes(1)
      expect(onNext).not.toHaveBeenCalled()
    })

    it('should call onNext when ArrowRight is pressed', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const event = createKeyboardEvent('ArrowRight')
      window.dispatchEvent(event)

      expect(onNext).toHaveBeenCalledTimes(1)
      expect(onPrev).not.toHaveBeenCalled()
    })

    it('should handle multiple ArrowLeft presses', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))

      expect(onPrev).toHaveBeenCalledTimes(3)
    })

    it('should handle multiple ArrowRight presses', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      window.dispatchEvent(createKeyboardEvent('ArrowRight'))
      window.dispatchEvent(createKeyboardEvent('ArrowRight'))

      expect(onNext).toHaveBeenCalledTimes(2)
    })

    it('should handle alternating arrow key presses', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      window.dispatchEvent(createKeyboardEvent('ArrowRight'))
      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))

      expect(onPrev).toHaveBeenCalledTimes(2)
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('should prevent default behavior for ArrowLeft', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const event = createKeyboardEvent('ArrowLeft')
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should prevent default behavior for ArrowRight', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const event = createKeyboardEvent('ArrowRight')
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('enabled/disabled state', () => {
    it('should work when enabled is true (default)', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext, enabled: true }))

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))

      expect(onPrev).toHaveBeenCalledTimes(1)
    })

    it('should work when enabled parameter is omitted', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      window.dispatchEvent(createKeyboardEvent('ArrowRight'))

      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('should not respond to keys when disabled', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext, enabled: false }))

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      window.dispatchEvent(createKeyboardEvent('ArrowRight'))

      expect(onPrev).not.toHaveBeenCalled()
      expect(onNext).not.toHaveBeenCalled()
    })

    it('should start working when enabled changes from false to true', () => {
      const { rerender } = renderHook(
        ({ enabled }) => useKeyboardNavigation({ onPrev, onNext, enabled }),
        { initialProps: { enabled: false } }
      )

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).not.toHaveBeenCalled()

      rerender({ enabled: true })

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).toHaveBeenCalledTimes(1)
    })

    it('should stop working when enabled changes from true to false', () => {
      const { rerender } = renderHook(
        ({ enabled }) => useKeyboardNavigation({ onPrev, onNext, enabled }),
        { initialProps: { enabled: true } }
      )

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).toHaveBeenCalledTimes(1)

      rerender({ enabled: false })

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).toHaveBeenCalledTimes(1) // No additional call
    })
  })

  describe('input element filtering', () => {
    it('should ignore arrow keys when focused on an input element', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      window.dispatchEvent(event)

      expect(onPrev).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should ignore arrow keys when focused on a textarea element', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: textarea, enumerable: true })

      window.dispatchEvent(event)

      expect(onNext).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('should respond to arrow keys when focused on other elements', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const button = document.createElement('button')
      document.body.appendChild(button)

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: button, enumerable: true })

      window.dispatchEvent(event)

      expect(onPrev).toHaveBeenCalledTimes(1)

      document.body.removeChild(button)
    })
  })

  describe('other keys', () => {
    it('should not respond to other keys', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const keys = ['Enter', 'Space', 'Escape', 'a', 'ArrowUp', 'ArrowDown', 'Tab']

      keys.forEach((key) => {
        window.dispatchEvent(createKeyboardEvent(key))
      })

      expect(onPrev).not.toHaveBeenCalled()
      expect(onNext).not.toHaveBeenCalled()
    })

    it('should not prevent default for other keys', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      const event = createKeyboardEvent('Enter')
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).toHaveBeenCalledTimes(1)

      unmount()

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).toHaveBeenCalledTimes(1) // No additional call after unmount
    })

    it('should clean up and re-add listener when callbacks change', () => {
      const newOnPrev = jest.fn()
      const { rerender } = renderHook(
        ({ prev }) => useKeyboardNavigation({ onPrev: prev, onNext }),
        { initialProps: { prev: onPrev } }
      )

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).toHaveBeenCalledTimes(1)
      expect(newOnPrev).not.toHaveBeenCalled()

      rerender({ prev: newOnPrev })

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(onPrev).toHaveBeenCalledTimes(1) // No additional call
      expect(newOnPrev).toHaveBeenCalledTimes(1) // New callback called
    })
  })

  describe('edge cases', () => {
    it('should handle rapid key presses', () => {
      renderHook(() => useKeyboardNavigation({ onPrev, onNext }))

      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
        window.dispatchEvent(createKeyboardEvent('ArrowRight'))
      }

      expect(onPrev).toHaveBeenCalledTimes(10)
      expect(onNext).toHaveBeenCalledTimes(10)
    })

    it('should call callbacks even if they might have side effects', () => {
      let callCount = 0
      const callbackWithSideEffect = jest.fn(() => {
        callCount++
      })

      renderHook(() => useKeyboardNavigation({ onPrev: callbackWithSideEffect, onNext }))

      window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      expect(callbackWithSideEffect).toHaveBeenCalledTimes(1)
      expect(callCount).toBe(1)

      // Hook should still be functional
      window.dispatchEvent(createKeyboardEvent('ArrowRight'))
      expect(onNext).toHaveBeenCalledTimes(1)
    })
  })
})
