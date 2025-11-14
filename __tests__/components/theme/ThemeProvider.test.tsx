import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}))

describe('ThemeProvider', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <ThemeProvider>
          <div>Test child</div>
        </ThemeProvider>
      )
      expect(screen.getByText('Test child')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <ThemeProvider>
          <div>Child 1</div>
          <div>Child 2</div>
        </ThemeProvider>
      )
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })

    it.skip('wraps children with NextThemesProvider', () => {
      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('is a wrapper component', () => {
      const { container } = render(
        <ThemeProvider>
          <div>Wrapped</div>
        </ThemeProvider>
      )
      expect(container.firstChild).toBeInTheDocument()
    })

    it('preserves child component structure', () => {
      render(
        <ThemeProvider>
          <main>
            <header>Header</header>
            <section>Section</section>
          </main>
        </ThemeProvider>
      )
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Section')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works with nested components', () => {
      render(
        <ThemeProvider>
          <div>
            <span>Nested content</span>
          </div>
        </ThemeProvider>
      )
      expect(screen.getByText('Nested content')).toBeInTheDocument()
    })

    it('handles complex JSX children', () => {
      render(
        <ThemeProvider>
          <>
            <div>Fragment child 1</div>
            <div>Fragment child 2</div>
          </>
        </ThemeProvider>
      )
      expect(screen.getByText('Fragment child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment child 2')).toBeInTheDocument()
    })
  })
})
