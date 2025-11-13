import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ReportViewer from '@/components/viewer/ReportViewer'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { toast } from 'sonner'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, quality, placeholder, blurDataURL, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-priority={priority ? 'true' : 'false'} data-quality={quality} data-placeholder={placeholder} />
  },
}))

jest.mock('react-swipeable', () => ({
  useSwipeable: (handlers: any) => ({
    ref: jest.fn(),
    onMouseDown: jest.fn(),
  }),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('@/hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: jest.fn(),
}))

jest.mock('@/hooks/useReadingState', () => ({
  useReadingState: jest.fn(() => ({
    savedState: null,
    saveState: jest.fn(),
    hasResumePoint: false,
  })),
}))

jest.mock('@/components/viewer/NavigationControls', () => {
  return function NavigationControls(props: any) {
    return (
      <div data-testid="navigation-controls">
        <button onClick={props.onPrev}>Previous</button>
        <button onClick={props.onNext}>Next</button>
        <button onClick={props.onZoomIn}>Zoom In</button>
        <button onClick={props.onZoomOut}>Zoom Out</button>
        <button onClick={props.onToggleFocus}>Toggle Focus</button>
        <button onClick={props.onZoom}>Open Lightbox</button>
        <button onClick={props.onDownloadPDF}>Download PDF</button>
        <span>Page {props.currentPage} of {props.totalPages}</span>
      </div>
    )
  }
})

jest.mock('@/components/viewer/ThumbnailSidebar', () => {
  return function ThumbnailSidebar(props: any) {
    return (
      <div data-testid="thumbnail-sidebar">
        {props.pages.map((page: any, index: number) => (
          <button
            key={index}
            onClick={() => props.onSelectPage(index + 1)}
          >
            Thumbnail {index + 1}
          </button>
        ))}
      </div>
    )
  }
})

jest.mock('@/components/lightbox/ImageLightbox', () => {
  return function ImageLightbox(props: any) {
    if (!props.open) return null
    return (
      <div data-testid="image-lightbox">
        <button onClick={props.onClose}>Close Lightbox</button>
      </div>
    )
  }
})

jest.mock('@/components/export/PageSelectionModal', () => ({
  PageSelectionModal: function PageSelectionModal(props: any) {
    if (!props.isOpen) return null
    return (
      <div data-testid="page-selection-modal">
        <button onClick={props.onClose}>Close PDF Modal</button>
      </div>
    )
  },
}))

jest.mock('@/components/viewer/FocusMode', () => ({
  FocusMode: function FocusMode(props: any) {
    if (!props.isOpen) return null
    return (
      <div data-testid="focus-mode">
        <button onClick={props.onClose}>Close Focus Mode</button>
        <button data-testid="focus-prev" onClick={props.onPrev}>Previous in Focus</button>
        <button data-testid="focus-next" onClick={props.onNext}>Next in Focus</button>
        {props.children}
      </div>
    )
  },
}))

describe('ReportViewer', () => {
  const mockPush = jest.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(usePathname as jest.Mock).mockReturnValue('/rapport')
  })

  describe('Rendering', () => {
    it('renders the report viewer with initial page', () => {
      render(<ReportViewer initialPage={1} />)

      expect(screen.getByTestId('navigation-controls')).toBeInTheDocument()
      expect(screen.getByTestId('thumbnail-sidebar')).toBeInTheDocument()
      expect(screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)).toBeInTheDocument()
    })

    it('displays correct page number in navigation', () => {
      render(<ReportViewer initialPage={5} />)

      expect(screen.getByText(/Page 5 of/i)).toBeInTheDocument()
    })

    it('renders screen reader status text', () => {
      render(<ReportViewer initialPage={3} />)

      const srText = screen.getByRole('status')
      expect(srText).toHaveTextContent('Page 3 sur 36')
    })

    it('renders main content with proper ARIA attributes', () => {
      render(<ReportViewer initialPage={1} />)

      const main = screen.getByRole('main')
      expect(main).toHaveAttribute('id', 'main-content')
    })
  })

  describe('Page Navigation', () => {
    it('navigates to next page when next button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      expect(mockPush).toHaveBeenCalledWith(
        '/rapport?page=2',
        expect.objectContaining({ scroll: false })
      )
    })

    it('navigates to previous page when prev button clicked', () => {
      render(<ReportViewer initialPage={5} />)

      const prevButton = screen.getByText('Previous')
      fireEvent.click(prevButton)

      expect(mockPush).toHaveBeenCalledWith(
        '/rapport?page=4',
        expect.objectContaining({ scroll: false })
      )
    })

    it('navigates to specific page from thumbnail sidebar', () => {
      render(<ReportViewer initialPage={1} />)

      const thumbnail10 = screen.getByText('Thumbnail 10')
      fireEvent.click(thumbnail10)

      expect(mockPush).toHaveBeenCalledWith(
        '/rapport?page=10',
        expect.objectContaining({ scroll: false })
      )
    })

    it('does not navigate below page 1', () => {
      render(<ReportViewer initialPage={1} />)

      const prevButton = screen.getByText('Previous')
      fireEvent.click(prevButton)

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('does not navigate above last page', () => {
      render(<ReportViewer initialPage={36} />)

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('respects page from URL search params', () => {
      mockSearchParams.set('page', '15')
      render(<ReportViewer initialPage={1} />)

      expect(screen.getByAltText(/Page 15 du rapport RSE Clauger 2025/i)).toBeInTheDocument()
    })

    it('falls back to initialPage if URL param is invalid', () => {
      mockSearchParams.set('page', 'invalid')
      render(<ReportViewer initialPage={10} />)

      expect(screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)).toBeInTheDocument()
    })
  })

  describe('Zoom Functionality', () => {
    it('zooms in when zoom in button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const zoomInButton = screen.getByText('Zoom In')
      fireEvent.click(zoomInButton)

      const imageContainer = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i).parentElement
      expect(imageContainer?.parentElement).toHaveStyle({ transform: 'scale(1.25)' })
    })

    it('zooms out when zoom out button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const zoomInButton = screen.getByText('Zoom In')
      fireEvent.click(zoomInButton)

      const zoomOutButton = screen.getByText('Zoom Out')
      fireEvent.click(zoomOutButton)

      const imageContainer = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i).parentElement
      expect(imageContainer?.parentElement).toHaveStyle({ transform: 'scale(1)' })
    })

    it('does not zoom beyond max level', () => {
      render(<ReportViewer initialPage={1} />)

      const zoomInButton = screen.getByText('Zoom In')

      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomInButton)
      }

      const imageContainer = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i).parentElement
      expect(imageContainer?.parentElement).toHaveStyle({ transform: 'scale(2)' })
    })

    it('does not zoom below min level', () => {
      render(<ReportViewer initialPage={1} />)

      const zoomOutButton = screen.getByText('Zoom Out')

      for (let i = 0; i < 5; i++) {
        fireEvent.click(zoomOutButton)
      }

      const imageContainer = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i).parentElement
      expect(imageContainer?.parentElement).toHaveStyle({ transform: 'scale(0.75)' })
    })
  })

  describe('Modal States', () => {
    it('opens lightbox when zoom button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const zoomButton = screen.getByText('Open Lightbox')
      fireEvent.click(zoomButton)

      expect(screen.getByTestId('image-lightbox')).toBeInTheDocument()
    })

    it('closes lightbox when close button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const zoomButton = screen.getByText('Open Lightbox')
      fireEvent.click(zoomButton)

      const closeButton = screen.getByText('Close Lightbox')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('image-lightbox')).not.toBeInTheDocument()
    })

    it('opens PDF modal when download PDF button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const pdfButton = screen.getByText('Download PDF')
      fireEvent.click(pdfButton)

      expect(screen.getByTestId('page-selection-modal')).toBeInTheDocument()
    })

    it('closes PDF modal when close button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const pdfButton = screen.getByText('Download PDF')
      fireEvent.click(pdfButton)

      const closeButton = screen.getByText('Close PDF Modal')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('page-selection-modal')).not.toBeInTheDocument()
    })

    it('opens focus mode when toggle focus button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const focusButton = screen.getByText('Toggle Focus')
      fireEvent.click(focusButton)

      expect(screen.getByTestId('focus-mode')).toBeInTheDocument()
    })

    it('closes focus mode when close button clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const focusButton = screen.getByText('Toggle Focus')
      fireEvent.click(focusButton)

      const closeButton = screen.getByText('Close Focus Mode')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('focus-mode')).not.toBeInTheDocument()
    })
  })

  describe('Image Click Behavior', () => {
    it('opens lightbox when image is clicked', () => {
      render(<ReportViewer initialPage={1} />)

      const image = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)
      const imageButton = image.parentElement as HTMLElement

      fireEvent.click(imageButton)

      expect(screen.getByTestId('image-lightbox')).toBeInTheDocument()
    })

    it('has accessible zoom label on image button', () => {
      render(<ReportViewer initialPage={1} />)

      const image = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)
      const imageButton = image.parentElement as HTMLElement

      expect(imageButton).toHaveAttribute('aria-label', "Agrandir l'image")
    })
  })

  describe('Accessibility', () => {
    it('has proper focus indicators on image button', () => {
      render(<ReportViewer initialPage={1} />)

      const image = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)
      const imageButton = image.parentElement as HTMLElement

      expect(imageButton).toHaveClass('focus-visible:outline-none')
      expect(imageButton).toHaveClass('focus-visible:ring-3')
    })

    it('provides live region for page changes', () => {
      render(<ReportViewer initialPage={1} />)

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('renders main landmark with proper ID', () => {
      render(<ReportViewer initialPage={1} />)

      const main = screen.getByRole('main')
      expect(main).toHaveAttribute('id', 'main-content')
    })

    it('has screen reader only text for current page', () => {
      render(<ReportViewer initialPage={5} />)

      const srText = screen.getByRole('status')
      expect(srText).toHaveClass('sr-only')
    })
  })

  describe('Image Loading', () => {
    it('sets priority loading for first 2 pages', () => {
      render(<ReportViewer initialPage={1} />)

      const image = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)
      expect(image).toHaveAttribute('data-priority', 'true')
    })

    it('sets high quality for images', () => {
      render(<ReportViewer initialPage={1} />)

      const image = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)
      expect(image).toHaveAttribute('data-quality', '85')
    })

    it('uses blur placeholder when available', () => {
      render(<ReportViewer initialPage={1} />)

      const image = screen.getByAltText(/Page 1 du rapport RSE Clauger 2025/i)
      expect(image).toHaveAttribute('data-placeholder')
    })
  })

  describe('Focus Mode Navigation', () => {
    it('navigates to next page from focus mode', () => {
      mockSearchParams.set('page', '5')
      render(<ReportViewer initialPage={5} />)

      const focusButton = screen.getByText('Toggle Focus')
      fireEvent.click(focusButton)

      const nextInFocus = screen.getByTestId('focus-next')
      fireEvent.click(nextInFocus)

      expect(mockPush).toHaveBeenCalledWith(
        '/rapport?page=6',
        expect.objectContaining({ scroll: false })
      )
    })

    it('navigates to previous page from focus mode', () => {
      mockSearchParams.set('page', '5')
      render(<ReportViewer initialPage={5} />)

      const focusButton = screen.getByText('Toggle Focus')
      fireEvent.click(focusButton)

      const prevInFocus = screen.getByTestId('focus-prev')
      fireEvent.click(prevInFocus)

      expect(mockPush).toHaveBeenCalledWith(
        '/rapport?page=4',
        expect.objectContaining({ scroll: false })
      )
    })
  })
})
