import { render, screen } from '@testing-library/react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

// Mock Radix UI Tooltip
jest.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Root: ({ children }: any) => <div data-testid="tooltip-root">{children}</div>,
  Trigger: ({ asChild, children }: any) => (
    asChild ? children : <button data-testid="tooltip-trigger">{children}</button>
  ),
  Content: ({ children, sideOffset, className, ...props }: any) => (
    <div
      role="tooltip"
      data-testid="tooltip-content"
      data-side-offset={sideOffset}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}))

describe('Tooltip Components', () => {
  describe('TooltipProvider', () => {
    it('renders children within provider', () => {
      render(
        <TooltipProvider>
          <div>Provider Content</div>
        </TooltipProvider>
      )
      expect(screen.getByText('Provider Content')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
    })
  })

  describe('Tooltip', () => {
    it('renders tooltip root with children', () => {
      render(
        <Tooltip>
          <div>Tooltip Children</div>
        </Tooltip>
      )
      expect(screen.getByText('Tooltip Children')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument()
    })
  })

  describe('TooltipTrigger', () => {
    it('renders trigger button', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      )
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument()
      expect(screen.getByText('Hover me')).toBeInTheDocument()
    })

    it('supports asChild prop', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Custom Button</button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      )
      expect(screen.getByText('Custom Button')).toBeInTheDocument()
    })
  })

  describe('TooltipContent', () => {
    it('renders with children', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Tooltip Text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
      expect(screen.getByText('Tooltip Text')).toBeInTheDocument()
    })

    it('has role="tooltip"', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Tooltip Text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
      const content = screen.getByRole('tooltip')
      expect(content).toBeInTheDocument()
    })

    it('applies default sideOffset of 4', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
      const content = screen.getByRole('tooltip')
      expect(content).toHaveAttribute('data-side-offset', '4')
    })

    it('accepts custom sideOffset', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent sideOffset={10}>Tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
      const content = screen.getByRole('tooltip')
      expect(content).toHaveAttribute('data-side-offset', '10')
    })

    it('applies custom className', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent className="custom-tooltip">Tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
      const content = screen.getByRole('tooltip')
      expect(content).toHaveClass('custom-tooltip')
    })

    it('applies base styling classes', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
      const content = screen.getByRole('tooltip')
      expect(content).toHaveClass('z-50')
      expect(content).toHaveClass('rounded-md')
    })
  })

  describe('Complete Tooltip', () => {
    it('renders complete tooltip structure', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover Button</TooltipTrigger>
            <TooltipContent>Help Text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument()
      expect(screen.getByText('Hover Button')).toBeInTheDocument()
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      expect(screen.getByText('Help Text')).toBeInTheDocument()
    })
  })
})
