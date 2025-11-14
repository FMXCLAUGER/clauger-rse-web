import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { FocusMode } from '@/components/viewer/FocusMode'

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="chevron-right">ChevronRight</span>,
  X: () => <span data-testid="x-icon">X</span>,
}))

describe('FocusMode', () => {
  const mockOnClose = jest.fn()
  const mockOnPrev = jest.fn()
  const mockOnNext = jest.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    currentPage: 5,
    totalPages: 36,
    onPrev: mockOnPrev,
    onNext: mockOnNext,
    children: <div>Page Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('returns null when isOpen=false', () => {
      const { container } = render(<FocusMode {...defaultProps} isOpen={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders when isOpen=true', () => {
      render(<FocusMode {...defaultProps} />)
      expect(screen.getByText('Page Content')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<FocusMode {...defaultProps}><div>Test Content</div></FocusMode>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('displays current page number', () => {
      render(<FocusMode {...defaultProps} currentPage={10} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('displays total pages', () => {
      render(<FocusMode {...defaultProps} totalPages={36} />)
      expect(screen.getByText('/ 36')).toBeInTheDocument()
    })

    it('displays page indicator as "currentPage / totalPages"', () => {
      render(<FocusMode {...defaultProps} currentPage={5} totalPages={36} />)
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('/ 36')).toBeInTheDocument()
    })
  })

  describe('Navigation Buttons', () => {
    it('renders previous button', () => {
      render(<FocusMode {...defaultProps} />)
      const prevButton = screen.getByLabelText('Page précédente')
      expect(prevButton).toBeInTheDocument()
    })

    it('renders next button', () => {
      render(<FocusMode {...defaultProps} />)
      const nextButton = screen.getByLabelText('Page suivante')
      expect(nextButton).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<FocusMode {...defaultProps} />)
      const closeButton = screen.getByLabelText(/Quitter le mode focus/)
      expect(closeButton).toBeInTheDocument()
    })

    it('prev button is disabled on first page', () => {
      render(<FocusMode {...defaultProps} currentPage={1} />)
      const prevButton = screen.getByLabelText('Page précédente')
      expect(prevButton).toBeDisabled()
    })

    it('prev button is enabled when not on first page', () => {
      render(<FocusMode {...defaultProps} currentPage={5} />)
      const prevButton = screen.getByLabelText('Page précédente')
      expect(prevButton).not.toBeDisabled()
    })

    it('next button is disabled on last page', () => {
      render(<FocusMode {...defaultProps} currentPage={36} totalPages={36} />)
      const nextButton = screen.getByLabelText('Page suivante')
      expect(nextButton).toBeDisabled()
    })

    it('next button is enabled when not on last page', () => {
      render(<FocusMode {...defaultProps} currentPage={5} totalPages={36} />)
      const nextButton = screen.getByLabelText('Page suivante')
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Button Interactions', () => {
    it('calls onPrev when prev button clicked', () => {
      render(<FocusMode {...defaultProps} currentPage={5} />)
      const prevButton = screen.getByLabelText('Page précédente')
      fireEvent.click(prevButton)
      expect(mockOnPrev).toHaveBeenCalledTimes(1)
    })

    it('calls onNext when next button clicked', () => {
      render(<FocusMode {...defaultProps} currentPage={5} />)
      const nextButton = screen.getByLabelText('Page suivante')
      fireEvent.click(nextButton)
      expect(mockOnNext).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close button clicked', () => {
      render(<FocusMode {...defaultProps} />)
      const closeButton = screen.getByLabelText(/Quitter le mode focus/)
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onPrev when button is disabled', () => {
      render(<FocusMode {...defaultProps} currentPage={1} />)
      const prevButton = screen.getByLabelText('Page précédente')
      fireEvent.click(prevButton)
      expect(mockOnPrev).not.toHaveBeenCalled()
    })

    it('does not call onNext when button is disabled', () => {
      render(<FocusMode {...defaultProps} currentPage={36} totalPages={36} />)
      const nextButton = screen.getByLabelText('Page suivante')
      fireEvent.click(nextButton)
      expect(mockOnNext).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('prev button has aria-label', () => {
      render(<FocusMode {...defaultProps} />)
      expect(screen.getByLabelText('Page précédente')).toBeInTheDocument()
    })

    it('next button has aria-label', () => {
      render(<FocusMode {...defaultProps} />)
      expect(screen.getByLabelText('Page suivante')).toBeInTheDocument()
    })

    it('close button has descriptive aria-label', () => {
      render(<FocusMode {...defaultProps} />)
      expect(screen.getByLabelText(/Quitter le mode focus/)).toBeInTheDocument()
    })

    it('all buttons are keyboard accessible', () => {
      render(<FocusMode {...defaultProps} />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  describe('Layout', () => {
    it('has fixed positioning', () => {
      const { container } = render(<FocusMode {...defaultProps} />)
      const wrapper = container.querySelector('.fixed.inset-0')
      expect(wrapper).toBeInTheDocument()
    })

    it('centers content', () => {
      const { container } = render(<FocusMode {...defaultProps} />)
      const wrapper = container.querySelector('.justify-center')
      expect(wrapper).toBeInTheDocument()
    })

    it('has z-50 for layering', () => {
      const { container } = render(<FocusMode {...defaultProps} />)
      const wrapper = container.querySelector('.z-50')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Controls Styling', () => {
    it('controls have rounded styling', () => {
      const { container } = render(<FocusMode {...defaultProps} />)
      const controlsBar = container.querySelector('.rounded-full')
      expect(controlsBar).toBeInTheDocument()
    })

    it('has divider between navigation and close button', () => {
      const { container } = render(<FocusMode {...defaultProps} />)
      const divider = container.querySelector('.bg-white\\/20')
      expect(divider).toBeInTheDocument()
    })
  })

  describe('Page Number Display', () => {
    it('shows bold current page', () => {
      const { container } = render(<FocusMode {...defaultProps} currentPage={15} />)
      const currentPage = container.querySelector('.font-bold')
      expect(currentPage).toHaveTextContent('15')
    })

    it('updates when currentPage prop changes', () => {
      const { rerender } = render(<FocusMode {...defaultProps} currentPage={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()

      rerender(<FocusMode {...defaultProps} currentPage={10} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })
})
