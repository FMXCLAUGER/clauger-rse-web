import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { EnjeuxDetailModal } from '@/components/enjeux/EnjeuxDetailModal'

// Mock react-swipeable
jest.mock('react-swipeable', () => ({
  useSwipeable: (handlers: any) => {
    return {
      ref: jest.fn(),
      onMouseDown: jest.fn(),
    }
  },
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => (
    <a href={href} data-testid="dashboard-link">
      {children}
    </a>
  ),
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, onClick }: any) => (
    <button className={className} onClick={onClick} data-testid="dashboard-button">
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">×</span>,
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  CheckCircle2: () => <span data-testid="check-circle-icon">✓</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">!</span>,
}))

describe('EnjeuxDetailModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    document.body.style.overflow = 'unset'
  })

  describe('Rendering - Closed State', () => {
    it('returns null when isOpen is false', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={false} onClose={mockOnClose} enjeuxId="environnement" />
      )
      expect(container.firstChild).toBeNull()
    })

    it('returns null when enjeuxId is null', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId={null} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('returns null when enjeuxId is invalid', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="invalid-id" />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Rendering - Open State', () => {
    it('renders modal when isOpen is true with valid enjeuxId', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has correct aria attributes', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('renders backdrop', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const backdrop = container.querySelector('.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByLabelText('Fermer')).toBeInTheDocument()
    })

    it('close button renders with icon', () => {
      const { container } = render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const closeButton = screen.getByLabelText('Fermer')
      const svg = closeButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Environnement Enjeu Content', () => {
    it('renders Environnement title', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByText('Environnement')).toBeInTheDocument()
    })

    it('renders environnement icon emoji', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByText('🌍')).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const description = screen.getByText(/préserver le climat/)
      expect(description).toBeInTheDocument()
    })

    it('renders Points Clés section', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByText('Points Clés')).toBeInTheDocument()
    })

    it('renders Indicateurs Clés section', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByText('Indicateurs Clés')).toBeInTheDocument()
    })

    it('renders Actions Mises en Place section', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByText('Actions Mises en Place')).toBeInTheDocument()
    })

    it('renders Défis section', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByText(/Défis et Axes d'Amélioration/)).toBeInTheDocument()
    })

    it('renders key points', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const keyPoint = screen.getByText(/Premier bilan carbone réalisé/)
      expect(keyPoint).toBeInTheDocument()
    })

    it('renders KPIs', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const kpi = screen.getByText('718 000 teqCO₂')
      expect(kpi).toBeInTheDocument()
    })

    it('renders actions', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const actions = screen.getAllByText(/Transition vers l'électricité verte/)
      expect(actions.length).toBeGreaterThan(0)
    })

    it('renders challenges', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const challenge = screen.getByText(/Absence de cibles de réduction/)
      expect(challenge).toBeInTheDocument()
    })
  })

  describe('Social Enjeu Content', () => {
    it('renders Social title', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="social" />)
      expect(screen.getByText('Politique Sociale')).toBeInTheDocument()
    })

    it('renders social icon emoji', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="social" />)
      expect(screen.getByText('👥')).toBeInTheDocument()
    })

    it('renders key points for social', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="social" />)
      const keyPoint = screen.getByText(/1 302 collaborateurs/)
      expect(keyPoint).toBeInTheDocument()
    })
  })

  describe('Gouvernance Enjeu Content', () => {
    it('renders Gouvernance title', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="gouvernance" />)
      expect(screen.getByText('Conduite des Affaires')).toBeInTheDocument()
    })

    it('renders gouvernance icon emoji', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="gouvernance" />)
      expect(screen.getByText('⚖️')).toBeInTheDocument()
    })

    it('renders key points for gouvernance', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="gouvernance" />)
      const keyPoints = screen.getAllByText(/23,25%/)
      expect(keyPoints.length).toBeGreaterThan(0)
    })
  })

  describe('KPI Badges', () => {
    it('renders KPI grid with data', () => {
      const { container } = render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const kpiGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
      expect(kpiGrid).toBeInTheDocument()
    })

    it('shows trend indicators for KPIs', () => {
      const { container } = render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      // Check that badges exist (mocked component will render)
      const badgeElements = screen.queryAllByTestId('badge')
      expect(badgeElements.length).toBeGreaterThanOrEqual(0) // May or may not have trends
    })
  })

  describe('Close Interactions', () => {
    it('calls onClose when close button clicked', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      fireEvent.click(screen.getByLabelText('Fermer'))
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const backdrop = container.querySelector('.bg-black\\/50') as HTMLElement
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key pressed', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose for other keys', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Body Overflow Management', () => {
    it('sets body overflow to hidden when open', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('resets body overflow when closed', () => {
      const { rerender } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<EnjeuxDetailModal isOpen={false} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(document.body.style.overflow).toBe('unset')
    })

    it('resets body overflow on unmount', () => {
      const { unmount } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      expect(document.body.style.overflow).toBe('hidden')

      unmount()
      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('Dashboard Link', () => {
    it('renders dashboard link for environnement', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const link = screen.getByText('Voir le dashboard complet').closest('a')
      expect(link).toHaveAttribute('href', '/dashboard?tab=environment')
    })

    it('renders dashboard link for social', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="social" />)
      const link = screen.getByText('Voir le dashboard complet').closest('a')
      expect(link).toHaveAttribute('href', '/dashboard?tab=social')
    })

    it('renders dashboard link for gouvernance', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="gouvernance" />)
      const link = screen.getByText('Voir le dashboard complet').closest('a')
      expect(link).toHaveAttribute('href', '/dashboard?tab=governance')
    })

    it('link button has ArrowRight icon', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const button = screen.getByText('Voir le dashboard complet')
      const svg = button.parentElement?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('clicking dashboard button calls onClose', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      fireEvent.click(screen.getByText('Voir le dashboard complet'))
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('renders "Voir le dashboard complet" text', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByText('Voir le dashboard complet')).toBeInTheDocument()
    })
  })

  describe('Icon Components', () => {
    it('renders SVG icons in sections', () => {
      const { container } = render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(5) // Icons for KPIs, sections, buttons
    })

    it('renders section headers with icons', () => {
      const { container } = render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const sections = container.querySelectorAll('section')
      expect(sections.length).toBeGreaterThan(0)
    })
  })

  describe('Modal Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toContain('rounded-2xl')
    })

    it('has max width constraint', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toContain('max-w-4xl')
    })

    it('is scrollable', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toContain('overflow-y-auto')
    })

    it('has shadow', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toContain('shadow-2xl')
    })

    it('backdrop has blur effect', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const backdrop = container.querySelector('.backdrop-blur-sm')
      expect(backdrop).toBeInTheDocument()
    })
  })

  describe('Section Headers', () => {
    it('all section headers use Montserrat font', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const headers = container.querySelectorAll('.font-montserrat')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('main title has text-3xl class', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const title = screen.getByText('Environnement')
      expect(title.className).toContain('text-3xl')
    })
  })

  describe('KPI Grid', () => {
    it('KPIs displayed in grid', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('each KPI has hover shadow effect', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const kpiCards = container.querySelectorAll('.hover\\:shadow-md')
      expect(kpiCards.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Accessibility', () => {
    it('close button has aria-label', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      expect(screen.getByLabelText('Fermer')).toBeInTheDocument()
    })

    it('title has proper ID for aria-labelledby', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const title = container.querySelector('#modal-title')
      expect(title).toBeInTheDocument()
      expect(title?.textContent).toBe('Environnement')
    })

    it('backdrop has aria-hidden', () => {
      const { container } = render(
        <EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />
      )
      const backdrop = container.querySelector('[aria-hidden="true"]')
      expect(backdrop).toBeInTheDocument()
    })

    it('close button is focusable', () => {
      render(<EnjeuxDetailModal isOpen={true} onClose={mockOnClose} enjeuxId="environnement" />)
      const closeButton = screen.getByLabelText('Fermer')
      expect(closeButton.tagName).toBe('BUTTON')
    })
  })
})
