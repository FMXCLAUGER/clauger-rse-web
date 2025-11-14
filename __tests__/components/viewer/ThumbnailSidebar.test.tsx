import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import ThumbnailSidebar from '@/components/viewer/ThumbnailSidebar'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  Menu: () => <span>Menu</span>,
}))

jest.mock('@/components/viewer/ProgressBar', () => ({
  ProgressBar: () => <div data-testid="progress-bar">ProgressBar</div>,
}))

jest.mock('@/components/viewer/ResumeBadge', () => ({
  ResumeBadge: () => <div data-testid="resume-badge">Resume</div>,
}))

describe('ThumbnailSidebar', () => {
  const mockOnSelectPage = jest.fn()

  const mockPages = [
    { id: 1, src: '/page1.jpg', alt: 'Page 1', title: 'Page 1' },
    { id: 2, src: '/page2.jpg', alt: 'Page 2', title: 'Page 2' },
    { id: 3, src: '/page3.jpg', alt: 'Page 3', title: 'Page 3' },
  ]

  const defaultProps = {
    pages: mockPages,
    currentPage: 1,
    onSelectPage: mockOnSelectPage,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  describe('Rendering', () => {
    it('renders sidebar', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      expect(screen.getByLabelText('Miniatures des pages')).toBeInTheDocument()
    })

    it.skip('renders ProgressBar component', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    })

    it('renders Pages header', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      expect(screen.getByText('Pages')).toBeInTheDocument()
    })

    it('renders navigation with aria-label', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      expect(screen.getByRole('navigation', { name: 'Pages du rapport' })).toBeInTheDocument()
    })

    it('renders all page thumbnails', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      expect(screen.getByLabelText('Aller à la page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Aller à la page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Aller à la page 3')).toBeInTheDocument()
    })
  })

  describe('Page Selection', () => {
    it('calls onSelectPage when page button clicked', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      const page2Button = screen.getByLabelText('Aller à la page 2')
      fireEvent.click(page2Button)
      expect(mockOnSelectPage).toHaveBeenCalledWith(2)
    })

    it('calls onSelectPage with correct page ID', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      const page3Button = screen.getByLabelText('Aller à la page 3')
      fireEvent.click(page3Button)
      expect(mockOnSelectPage).toHaveBeenCalledWith(3)
    })

    it('calls onSelectPage only once per click', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      const page2Button = screen.getByLabelText('Aller à la page 2')
      fireEvent.click(page2Button)
      expect(mockOnSelectPage).toHaveBeenCalledTimes(1)
    })
  })

  describe('Current Page Highlighting', () => {
    it('marks current page with aria-current', () => {
      render(<ThumbnailSidebar {...defaultProps} currentPage={2} />)
      const page2Button = screen.getByLabelText('Aller à la page 2')
      expect(page2Button).toHaveAttribute('aria-current', 'page')
    })

    it('does not mark non-current pages', () => {
      render(<ThumbnailSidebar {...defaultProps} currentPage={2} />)
      const page1Button = screen.getByLabelText('Aller à la page 1')
      expect(page1Button).not.toHaveAttribute('aria-current')
    })
  })

  describe('Resume Badge', () => {
    it.skip('shows resume badge on resume page when set', () => {
      render(<ThumbnailSidebar {...defaultProps} resumePageId={2} currentPage={1} />)
      expect(screen.getByTestId('resume-badge')).toBeInTheDocument()
    })

    it('does not show resume badge when resumePageId not set', () => {
      render(<ThumbnailSidebar {...defaultProps} resumePageId={null} />)
      expect(screen.queryByTestId('resume-badge')).not.toBeInTheDocument()
    })

    it('does not show resume badge on current page', () => {
      render(<ThumbnailSidebar {...defaultProps} resumePageId={1} currentPage={1} />)
      expect(screen.queryByTestId('resume-badge')).not.toBeInTheDocument()
    })
  })

  describe('Page Images', () => {
    it('renders image for each page', () => {
      const { container } = render(<ThumbnailSidebar {...defaultProps} />)
      const images = container.querySelectorAll('img')
      expect(images.length).toBeGreaterThanOrEqual(3)
    })

    it('images have correct alt text', () => {
      const { container } = render(<ThumbnailSidebar {...defaultProps} />)
      const img1 = container.querySelector('img[alt="Miniature de la page 1"]')
      expect(img1).toBeInTheDocument()
    })

    it('images have aspect ratio container', () => {
      const { container } = render(<ThumbnailSidebar {...defaultProps} />)
      const aspectRatio = container.querySelector('.aspect-\\[3\\/4\\]')
      expect(aspectRatio).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('sidebar has aria-label', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      expect(screen.getByLabelText('Miniatures des pages')).toBeInTheDocument()
    })

    it('navigation has aria-label', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      expect(screen.getByRole('navigation', { name: 'Pages du rapport' })).toBeInTheDocument()
    })

    it('page buttons have aria-label', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      mockPages.forEach(page => {
        expect(screen.getByLabelText(`Aller à la page ${page.id}`)).toBeInTheDocument()
      })
    })

    it('all thumbnail buttons are keyboard accessible', () => {
      render(<ThumbnailSidebar {...defaultProps} />)
      const pageButtons = screen.getAllByLabelText(/Aller à la page/)
      pageButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  describe('Page Number Display', () => {
    it('displays page numbers', () => {
      const { container } = render(<ThumbnailSidebar {...defaultProps} />)
      expect(container.textContent).toContain('1')
      expect(container.textContent).toContain('2')
      expect(container.textContent).toContain('3')
    })
  })

  describe('Layout', () => {
    it('has flex-col layout', () => {
      const { container } = render(<ThumbnailSidebar {...defaultProps} />)
      const aside = screen.getByLabelText('Miniatures des pages')
      expect(aside.className).toContain('flex-col')
    })

    it('has border-r class', () => {
      const { container } = render(<ThumbnailSidebar {...defaultProps} />)
      const aside = screen.getByLabelText('Miniatures des pages')
      expect(aside.className).toContain('border-r')
    })

    it('has overflow-y-auto for scrolling', () => {
      const { container } = render(<ThumbnailSidebar {...defaultProps} />)
      const nav = container.querySelector('.overflow-y-auto')
      expect(nav).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('handles different currentPage values', () => {
      const { rerender } = render(<ThumbnailSidebar {...defaultProps} currentPage={1} />)
      expect(screen.getByLabelText('Aller à la page 1')).toHaveAttribute('aria-current', 'page')

      rerender(<ThumbnailSidebar {...defaultProps} currentPage={2} />)
      expect(screen.getByLabelText('Aller à la page 2')).toHaveAttribute('aria-current', 'page')
    })

    it('handles empty resumePageId', () => {
      render(<ThumbnailSidebar {...defaultProps} resumePageId={undefined} />)
      expect(screen.queryByTestId('resume-badge')).not.toBeInTheDocument()
    })
  })
})
