import { useEffect } from "react"

export function useKeyboardNavigation(
  onPrev: () => void,
  onNext: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          onPrev()
          break
        case "ArrowRight":
          e.preventDefault()
          onNext()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onPrev, onNext, enabled])
}
