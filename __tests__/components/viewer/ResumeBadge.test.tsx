import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ResumeBadge } from '@/components/viewer/ResumeBadge'
import { CLAUGER_COLORS } from '@/lib/design/clauger-colors'

// Helper to convert hex to RGB for color comparisons
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

describe('ResumeBadge', () => {
  describe('Rendering', () => {
    it('renders badge as div', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.querySelector('div')
      expect(badge).toBeInTheDocument()
    })

    it('displays "Reprendre" text', () => {
      render(<ResumeBadge />)
      expect(screen.getByText('Reprendre')).toBeInTheDocument()
    })

    it('has correct positioning classes', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('absolute')
      expect(badge.className).toContain('top-2')
      expect(badge.className).toContain('right-2')
      expect(badge.className).toContain('z-10')
    })

    it('has correct padding classes', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('px-2')
      expect(badge.className).toContain('py-1')
    })
  })

  describe('Styling', () => {
    it('has background color from CLAUGER_COLORS', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.style.backgroundColor).toBe(hexToRgb(CLAUGER_COLORS.resume.background))
    })

    it('has text color from CLAUGER_COLORS', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.style.color).toBe(hexToRgb(CLAUGER_COLORS.resume.text))
    })

    it('has rounded corners', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('rounded')
    })

    it('has text-xs font size', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('text-xs')
    })

    it('has font-semibold weight', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('font-semibold')
    })
  })

  describe('Animation', () => {
    it('has animate-pulse class', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('animate-pulse')
    })

    it('has animationDuration set to 2s', () => {
      const { container } = render(<ResumeBadge />)
      const badge = container.firstChild as HTMLElement
      expect(badge.style.animationDuration).toBe('2s')
    })
  })

  describe('Visual Regression', () => {
    it('renders correctly with all expected elements', () => {
      const { container } = render(<ResumeBadge />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
