import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { SkipLink } from '@/components/a11y/SkipLink'

describe('SkipLink', () => {
  describe('Rendering', () => {
    it('renders link element', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
    })

    it('renders with correct text', () => {
      render(<SkipLink />)
      expect(screen.getByText('Aller au contenu principal')).toBeInTheDocument()
    })

    it('has href="#main-content"', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '#main-content')
    })

    it('has skip-link class', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link).toHaveClass('skip-link')
    })
  })

  describe('Accessibility', () => {
    it('is a link', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link.tagName).toBe('A')
    })

    it('provides keyboard navigation', () => {
      const { container } = render(<SkipLink />)
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.tabIndex).not.toBe(-1)
    })
  })

  describe('CSS Classes', () => {
    it('renders with expected classes', () => {
      const { container } = render(<SkipLink />)
      const link = container.querySelector('.skip-link')
      expect(link).toBeInTheDocument()
    })
  })

  describe('Link Behavior', () => {
    it('creates anchor link to main content', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link.getAttribute('href')).toMatch(/^#/)
    })

    it('targets main-content id', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link.getAttribute('href')).toBe('#main-content')
    })
  })
})
