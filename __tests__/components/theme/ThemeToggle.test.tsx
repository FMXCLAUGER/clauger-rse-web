import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

const mockSetTheme = jest.fn()
const mockUseTheme = jest.fn()

jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}))

jest.mock('lucide-react', () => ({
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })
  })

  describe('Rendering', () => {
    it('renders button element', () => {
      render(<ThemeToggle />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has aria-label for accessibility', () => {
      render(<ThemeToggle />)
      const button = screen.getAllByRole('button')[0]
      expect(button).toHaveAccessibleName()
    })
  })

  describe('Styling', () => {
    it('has rounded-lg class', () => {
      render(<ThemeToggle />)
      const button = screen.getAllByRole('button')[0]
      expect(button.className).toContain('rounded-lg')
    })

    it('has transition-colors class', () => {
      render(<ThemeToggle />)
      const button = screen.getAllByRole('button')[0]
      expect(button.className).toContain('transition-colors')
    })
  })

  describe('Accessibility', () => {
    it('button is keyboard accessible', () => {
      render(<ThemeToggle />)
      const button = screen.getAllByRole('button')[0]
      expect(button.tagName).toBe('BUTTON')
    })
  })
})
