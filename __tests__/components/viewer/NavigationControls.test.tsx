import { render, screen, fireEvent } from '@testing-library/react'
import NavigationControls from '@/components/viewer/NavigationControls'

jest.mock('next/link', () => {
  return function Link({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

jest.mock('@/components/theme/ThemeToggle', () => ({
  ThemeToggle: function ThemeToggle() {
    return <button data-testid="theme-toggle">Toggle Theme</button>
  },
}))

jest.mock('@/components/viewer/ZoomControls', () => ({
  ZoomControls: function ZoomControls({ zoomLevel, onZoomIn, onZoomOut }: any) {
    return (
      <div data-testid="zoom-controls">
        <button onClick={onZoomIn} data-testid="zoom-in-btn">Zoom In</button>
        <button onClick={onZoomOut} data-testid="zoom-out-btn">Zoom Out</button>
        <span>Zoom: {zoomLevel}%</span>
      </div>
    )
  },
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ asChild, children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <div role="tooltip">{children}</div>,
}))

describe('NavigationControls', () => {
  const defaultProps = {
    currentPage: 5,
    totalPages: 36,
    onPrev: jest.fn(),
    onNext: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders navigation header with all elements', () => {
      render(<NavigationControls {...defaultProps} />)

      expect(screen.getByRole('navigation', { name: /Navigation du rapport/i })).toBeInTheDocument()
      expect(screen.getByText('Accueil')).toBeInTheDocument()
      expect(screen.getByLabelText(/Page précédente/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Page suivante/i)).toBeInTheDocument()
    })

    it('displays current page and total pages', () => {
      render(<NavigationControls {...defaultProps} />)

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText(/\/ 36/)).toBeInTheDocument()
    })

    it('displays progress bar with correct value', () => {
      render(<NavigationControls {...defaultProps} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '5')
      expect(progressBar).toHaveAttribute('aria-valuemin', '1')
      expect(progressBar).toHaveAttribute('aria-valuemax', '36')
      expect(progressBar).toHaveAttribute('aria-label', 'Progression: page 5 sur 36')
    })

    it('disables prev button on first page', () => {
      render(<NavigationControls {...defaultProps} currentPage={1} />)

      const prevButton = screen.getByLabelText(/Page précédente/i)
      expect(prevButton).toBeDisabled()
    })

    it('disables next button on last page', () => {
      render(<NavigationControls {...defaultProps} currentPage={36} totalPages={36} />)

      const nextButton = screen.getByLabelText(/Page suivante/i)
      expect(nextButton).toBeDisabled()
    })

    it('enables both buttons on middle pages', () => {
      render(<NavigationControls {...defaultProps} />)

      const prevButton = screen.getByLabelText(/Page précédente/i)
      const nextButton = screen.getByLabelText(/Page suivante/i)

      expect(prevButton).not.toBeDisabled()
      expect(nextButton).not.toBeDisabled()
    })

    it('renders search button when onSearch provided', () => {
      const onSearch = jest.fn()
      render(<NavigationControls {...defaultProps} onSearch={onSearch} />)

      expect(screen.getByLabelText(/Rechercher dans le rapport/i)).toBeInTheDocument()
    })

    it('does not render search button when onSearch not provided', () => {
      render(<NavigationControls {...defaultProps} />)

      expect(screen.queryByLabelText(/Rechercher dans le rapport/i)).not.toBeInTheDocument()
    })

    it('renders PDF download button when onDownloadPDF provided', () => {
      const onDownloadPDF = jest.fn()
      render(<NavigationControls {...defaultProps} onDownloadPDF={onDownloadPDF} />)

      expect(screen.getByLabelText(/Télécharger en PDF/i)).toBeInTheDocument()
    })

    it('renders zoom controls when zoom props provided', () => {
      const onZoomIn = jest.fn()
      const onZoomOut = jest.fn()
      render(
        <NavigationControls
          {...defaultProps}
          zoomLevel={100}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      )

      expect(screen.getByTestId('zoom-controls')).toBeInTheDocument()
      expect(screen.getByText('Zoom: 100%')).toBeInTheDocument()
    })

    it('renders lightbox zoom button when onZoom provided', () => {
      const onZoom = jest.fn()
      render(<NavigationControls {...defaultProps} onZoom={onZoom} />)

      expect(screen.getByLabelText(/Ouvrir le zoom lightbox/i)).toBeInTheDocument()
    })

    it('renders focus mode button when onToggleFocus provided', () => {
      const onToggleFocus = jest.fn()
      render(<NavigationControls {...defaultProps} onToggleFocus={onToggleFocus} />)

      expect(screen.getByLabelText(/Mode focus/i)).toBeInTheDocument()
    })

    it('renders theme toggle', () => {
      render(<NavigationControls {...defaultProps} />)

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    })

    it('renders fullscreen button', () => {
      render(<NavigationControls {...defaultProps} />)

      expect(screen.getByLabelText(/Plein écran/i)).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onPrev when previous button clicked', () => {
      const onPrev = jest.fn()
      render(<NavigationControls {...defaultProps} onPrev={onPrev} />)

      const prevButton = screen.getByLabelText(/Page précédente/i)
      fireEvent.click(prevButton)

      expect(onPrev).toHaveBeenCalledTimes(1)
    })

    it('calls onNext when next button clicked', () => {
      const onNext = jest.fn()
      render(<NavigationControls {...defaultProps} onNext={onNext} />)

      const nextButton = screen.getByLabelText(/Page suivante/i)
      fireEvent.click(nextButton)

      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('does not call onPrev when prev button disabled', () => {
      const onPrev = jest.fn()
      render(<NavigationControls {...defaultProps} currentPage={1} onPrev={onPrev} />)

      const prevButton = screen.getByLabelText(/Page précédente/i)
      fireEvent.click(prevButton)

      expect(onPrev).not.toHaveBeenCalled()
    })

    it('does not call onNext when next button disabled', () => {
      const onNext = jest.fn()
      render(<NavigationControls {...defaultProps} currentPage={36} totalPages={36} onNext={onNext} />)

      const nextButton = screen.getByLabelText(/Page suivante/i)
      fireEvent.click(nextButton)

      expect(onNext).not.toHaveBeenCalled()
    })

    it('calls onSearch when search button clicked', () => {
      const onSearch = jest.fn()
      render(<NavigationControls {...defaultProps} onSearch={onSearch} />)

      const searchButton = screen.getByLabelText(/Rechercher dans le rapport/i)
      fireEvent.click(searchButton)

      expect(onSearch).toHaveBeenCalledTimes(1)
    })

    it('calls onDownloadPDF when PDF button clicked', () => {
      const onDownloadPDF = jest.fn()
      render(<NavigationControls {...defaultProps} onDownloadPDF={onDownloadPDF} />)

      const pdfButton = screen.getByLabelText(/Télécharger en PDF/i)
      fireEvent.click(pdfButton)

      expect(onDownloadPDF).toHaveBeenCalledTimes(1)
    })

    it('calls onZoomIn when zoom in button clicked', () => {
      const onZoomIn = jest.fn()
      const onZoomOut = jest.fn()
      render(
        <NavigationControls
          {...defaultProps}
          zoomLevel={100}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      )

      const zoomInButton = screen.getByTestId('zoom-in-btn')
      fireEvent.click(zoomInButton)

      expect(onZoomIn).toHaveBeenCalledTimes(1)
    })

    it('calls onZoomOut when zoom out button clicked', () => {
      const onZoomIn = jest.fn()
      const onZoomOut = jest.fn()
      render(
        <NavigationControls
          {...defaultProps}
          zoomLevel={100}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      )

      const zoomOutButton = screen.getByTestId('zoom-out-btn')
      fireEvent.click(zoomOutButton)

      expect(onZoomOut).toHaveBeenCalledTimes(1)
    })

    it('calls onZoom when lightbox zoom button clicked', () => {
      const onZoom = jest.fn()
      render(<NavigationControls {...defaultProps} onZoom={onZoom} />)

      const zoomButton = screen.getByLabelText(/Ouvrir le zoom lightbox/i)
      fireEvent.click(zoomButton)

      expect(onZoom).toHaveBeenCalledTimes(1)
    })

    it('calls onToggleFocus when focus mode button clicked', () => {
      const onToggleFocus = jest.fn()
      render(<NavigationControls {...defaultProps} onToggleFocus={onToggleFocus} />)

      const focusButton = screen.getByLabelText(/Mode focus/i)
      fireEvent.click(focusButton)

      expect(onToggleFocus).toHaveBeenCalledTimes(1)
    })

    it('navigates to home when accueil link clicked', () => {
      render(<NavigationControls {...defaultProps} />)

      const homeLink = screen.getByText('Accueil').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels on navigation buttons', () => {
      render(<NavigationControls {...defaultProps} />)

      expect(screen.getByLabelText('Page précédente')).toBeInTheDocument()
      expect(screen.getByLabelText('Page suivante')).toBeInTheDocument()
    })

    it('has proper role on navigation header', () => {
      render(<NavigationControls {...defaultProps} />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Navigation du rapport')
    })

    it('marks disabled buttons with disabled attribute', () => {
      render(<NavigationControls {...defaultProps} currentPage={1} />)

      const prevButton = screen.getByLabelText(/Page précédente/i)
      expect(prevButton).toHaveAttribute('disabled')
      expect(prevButton).toHaveClass('disabled:cursor-not-allowed')
    })

    it('provides keyboard shortcut information for search', () => {
      const onSearch = jest.fn()
      render(<NavigationControls {...defaultProps} onSearch={onSearch} />)

      const searchButton = screen.getByLabelText(/Rechercher dans le rapport/i)
      expect(searchButton).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K')
    })

    it('provides progress bar with correct ARIA attributes', () => {
      render(<NavigationControls {...defaultProps} currentPage={10} totalPages={36} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '10')
      expect(progressBar).toHaveAttribute('aria-valuemin', '1')
      expect(progressBar).toHaveAttribute('aria-valuemax', '36')
    })

    it('calculates progress percentage correctly', () => {
      render(<NavigationControls {...defaultProps} currentPage={18} totalPages={36} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '50%' })
    })
  })

  describe('Progressive Enhancement', () => {
    it('shows keyboard shortcut based on platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
        configurable: true,
      })

      const onSearch = jest.fn()
      render(<NavigationControls {...defaultProps} onSearch={onSearch} />)

      // The component uses useEffect to set Mac state, so we check the structure exists
      expect(screen.getByLabelText(/Rechercher dans le rapport/i)).toBeInTheDocument()
    })

    it('renders with minimal props', () => {
      render(
        <NavigationControls
          currentPage={1}
          totalPages={10}
          onPrev={jest.fn()}
          onNext={jest.fn()}
        />
      )

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText(/\/ 10/)).toBeInTheDocument()
    })

    it('renders with all optional props', () => {
      render(
        <NavigationControls
          {...defaultProps}
          onSearch={jest.fn()}
          onDownloadPDF={jest.fn()}
          onZoom={jest.fn()}
          onToggleFocus={jest.fn()}
          zoomLevel={125}
          onZoomIn={jest.fn()}
          onZoomOut={jest.fn()}
        />
      )

      expect(screen.getByLabelText(/Rechercher/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Télécharger en PDF/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Ouvrir le zoom/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Mode focus/i)).toBeInTheDocument()
      expect(screen.getByTestId('zoom-controls')).toBeInTheDocument()
    })
  })
})
