import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { VisuallyHidden } from '@/components/a11y/VisuallyHidden'

describe('VisuallyHidden', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<VisuallyHidden>Hidden text</VisuallyHidden>)
      expect(screen.getByText('Hidden text')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      const { container } = render(<VisuallyHidden>Test</VisuallyHidden>)
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <VisuallyHidden>
          <span>First</span>
          <span>Second</span>
        </VisuallyHidden>
      )
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('has sr-only class', () => {
      const { container } = render(<VisuallyHidden>Test</VisuallyHidden>)
      const span = container.querySelector('span')
      expect(span).toHaveClass('sr-only')
    })
  })

  describe('Accessibility', () => {
    it('text is accessible to screen readers', () => {
      render(<VisuallyHidden>Screen reader only</VisuallyHidden>)
      const element = screen.getByText('Screen reader only')
      expect(element).toBeInTheDocument()
    })

    it('content is in the DOM', () => {
      const { container } = render(<VisuallyHidden>Content</VisuallyHidden>)
      expect(container.textContent).toContain('Content')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      const { container } = render(<VisuallyHidden></VisuallyHidden>)
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
    })

    it('handles complex JSX children', () => {
      render(
        <VisuallyHidden>
          <div>
            <strong>Bold</strong> and <em>italic</em>
          </div>
        </VisuallyHidden>
      )
      expect(screen.getByText(/Bold/)).toBeInTheDocument()
      expect(screen.getByText(/italic/)).toBeInTheDocument()
    })
  })
})
