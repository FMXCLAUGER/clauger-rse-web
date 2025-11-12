import { useEffect } from "react"

interface KeyboardNavigationOptions {
  onPrev?: () => void
  onNext?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
  onToggleFocus?: () => void
  enabled?: boolean
}

export function useKeyboardNavigation({
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleFocus,
  enabled = true,
}: KeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          onPrev?.()
          break
        case "ArrowRight":
          e.preventDefault()
          onNext?.()
          break
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            onToggleFocus?.()
          }
          break
        case "+":
        case "=":
          e.preventDefault()
          onZoomIn?.()
          break
        case "-":
        case "_":
          e.preventDefault()
          onZoomOut?.()
          break
        case "0":
          e.preventDefault()
          onZoomReset?.()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onPrev, onNext, onZoomIn, onZoomOut, onZoomReset, onToggleFocus, enabled])
}
