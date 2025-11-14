import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-primary')
    })

    it('renders secondary variant correctly', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('bg-secondary')
    })

    it('renders destructive variant correctly', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('bg-red-600')
    })

    it('renders outline variant correctly', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-gray-900')
    })

    it('renders success variant correctly', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-green-600')
    })

    it('renders warning variant correctly', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge).toHaveClass('bg-yellow-500')
    })
  })

  describe('Default behavior', () => {
    it('uses default variant when no variant specified', () => {
      render(<Badge>No Variant</Badge>)
      const badge = screen.getByText('No Variant')
      expect(badge).toHaveClass('bg-primary')
    })
  })
})
