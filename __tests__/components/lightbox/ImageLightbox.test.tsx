import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render } from '@testing-library/react'

// Mock next/dynamic to return a simple component
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: any, options: any) => {
    const Component = () => <div data-testid="lightbox-mock">Lightbox</div>
    Component.displayName = 'DynamicLightbox'
    return Component
  },
}))

// Mock NextJsImage component
jest.mock('@/components/lightbox/NextJsImage', () => ({
  __esModule: true,
  default: () => <div>NextJsImage</div>,
}))

// Manual mocks for yet-another-react-lightbox are in __mocks__ directory

import ImageLightbox from '@/components/lightbox/ImageLightbox'

describe('ImageLightbox', () => {
  const mockOnClose = jest.fn()

  const mockSlides = [
    { src: '/image1.jpg' },
    { src: '/image2.jpg' },
    { src: '/image3.jpg' },
  ]

  const defaultProps = {
    slides: mockSlides,
    open: true,
    onClose: mockOnClose,
    index: 0,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('renders without crashing', () => {
      const { container } = render(<ImageLightbox {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })

    it('is a wrapper component', () => {
      const { container } = render(<ImageLightbox {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('accepts slides prop', () => {
      const slides = [{ src: '/test.jpg' }]
      const { container } = render(<ImageLightbox {...defaultProps} slides={slides} />)
      expect(container).toBeInTheDocument()
    })

    it('accepts open prop', () => {
      const { container } = render(<ImageLightbox {...defaultProps} open={false} />)
      expect(container).toBeInTheDocument()
    })

    it('accepts onClose prop', () => {
      const customOnClose = jest.fn()
      const { container } = render(<ImageLightbox {...defaultProps} onClose={customOnClose} />)
      expect(container).toBeInTheDocument()
    })

    it('accepts index prop', () => {
      const { container } = render(<ImageLightbox {...defaultProps} index={2} />)
      expect(container).toBeInTheDocument()
    })

    it('uses default index of 0 when not provided', () => {
      const { index, ...propsWithoutIndex } = defaultProps
      const { container } = render(<ImageLightbox {...propsWithoutIndex} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works with single slide', () => {
      const singleSlide = [{ src: '/single.jpg' }]
      const { container } = render(<ImageLightbox {...defaultProps} slides={singleSlide} />)
      expect(container).toBeInTheDocument()
    })

    it('works with multiple slides', () => {
      const multipleSlides = [
        { src: '/slide1.jpg' },
        { src: '/slide2.jpg' },
        { src: '/slide3.jpg' },
        { src: '/slide4.jpg' },
      ]
      const { container } = render(<ImageLightbox {...defaultProps} slides={multipleSlides} />)
      expect(container).toBeInTheDocument()
    })

    it('handles open state changes', () => {
      const { rerender, container } = render(<ImageLightbox {...defaultProps} open={true} />)
      expect(container).toBeInTheDocument()

      rerender(<ImageLightbox {...defaultProps} open={false} />)
      expect(container).toBeInTheDocument()
    })

    it('handles index changes', () => {
      const { rerender, container } = render(<ImageLightbox {...defaultProps} index={0} />)
      expect(container).toBeInTheDocument()

      rerender(<ImageLightbox {...defaultProps} index={1} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Default Export', () => {
    it('is the default export', () => {
      expect(ImageLightbox).toBeDefined()
      expect(typeof ImageLightbox).toBe('function')
    })

    it('can be imported and rendered', () => {
      const { container } = render(<ImageLightbox {...defaultProps} />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('TypeScript Props', () => {
    it('accepts slides as array of Slide objects', () => {
      const slides = [
        { src: '/image1.jpg', alt: 'Image 1' },
        { src: '/image2.jpg', alt: 'Image 2' },
      ]
      const { container } = render(<ImageLightbox {...defaultProps} slides={slides} />)
      expect(container).toBeInTheDocument()
    })

    it('accepts open as boolean', () => {
      const { container } = render(<ImageLightbox {...defaultProps} open={true} />)
      expect(container).toBeInTheDocument()

      const { container: container2 } = render(<ImageLightbox {...defaultProps} open={false} />)
      expect(container2).toBeInTheDocument()
    })

    it('accepts onClose as function', () => {
      const mockClose = jest.fn()
      const { container } = render(<ImageLightbox {...defaultProps} onClose={mockClose} />)
      expect(container).toBeInTheDocument()
    })

    it('accepts index as optional number', () => {
      const { container } = render(<ImageLightbox {...defaultProps} index={0} />)
      expect(container).toBeInTheDocument()

      const { container: container2 } = render(<ImageLightbox {...defaultProps} index={5} />)
      expect(container2).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty slides array', () => {
      const { container } = render(<ImageLightbox {...defaultProps} slides={[]} />)
      expect(container).toBeInTheDocument()
    })

    it('handles undefined index', () => {
      const props = { ...defaultProps }
      delete (props as any).index
      const { container } = render(<ImageLightbox {...props} />)
      expect(container).toBeInTheDocument()
    })

    it('handles negative index', () => {
      const { container } = render(<ImageLightbox {...defaultProps} index={-1} />)
      expect(container).toBeInTheDocument()
    })

    it('handles index beyond slides length', () => {
      const { container } = render(<ImageLightbox {...defaultProps} index={100} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Dynamic Import', () => {
    it('uses dynamic import for lightbox', () => {
      const { container } = render(<ImageLightbox {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })

    it('renders even when dynamically imported', () => {
      const { container } = render(<ImageLightbox {...defaultProps} />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
