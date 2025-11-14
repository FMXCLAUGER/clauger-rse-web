import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/hero/HeroSection'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

jest.mock('lucide-react', () => ({
  ArrowRight: () => <span>ArrowRight</span>,
  ChevronDown: () => <span>ChevronDown</span>,
}))

jest.mock('@/components/hero/CircularScore', () => ({
  CircularScore: () => <div data-testid="circular-score">CircularScore</div>,
}))

describe('HeroSection', () => {
  const defaultProps = {
    title: 'Rapport RSE 2025',
    baseline: 'Notre engagement pour un avenir durable',
    score: 75,
    heroImage: {
      src: '/images/hero.jpg',
      blurDataURL: 'data:image/jpeg;base64,/test',
    },
  }

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })

    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  describe('Rendering', () => {
    it('renders section element', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<HeroSection {...defaultProps} />)
      expect(screen.getByText('Rapport RSE 2025')).toBeInTheDocument()
    })

    it('renders baseline', () => {
      render(<HeroSection {...defaultProps} />)
      expect(screen.getByText('Notre engagement pour un avenir durable')).toBeInTheDocument()
    })

    it.skip('renders CircularScore component', () => {
      render(<HeroSection {...defaultProps} />)
      expect(screen.getByTestId('circular-score')).toBeInTheDocument()
    })

    it('renders badge "1er Rapport Durable"', () => {
      render(<HeroSection {...defaultProps} />)
      expect(screen.getByText('1er Rapport Durable')).toBeInTheDocument()
    })

    it('renders "Explorer le rapport" CTA', () => {
      render(<HeroSection {...defaultProps} />)
      expect(screen.getByText('Explorer le rapport')).toBeInTheDocument()
    })

    it('renders hero image', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('has h-dvh class for full viewport height', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      const section = container.querySelector('section')
      expect(section?.className).toContain('h-dvh')
    })

    it('has overflow-hidden', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      const section = container.querySelector('section')
      expect(section?.className).toContain('overflow-hidden')
    })

    it('content is centered', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      const contentContainer = container.querySelector('.container')
      expect(contentContainer).toBeInTheDocument()
      expect(contentContainer?.className).toContain('justify-center')
    })
  })

  describe('Typography', () => {
    it('title has Montserrat font', () => {
      render(<HeroSection {...defaultProps} />)
      const title = screen.getByText('Rapport RSE 2025')
      expect(title.className).toContain('font-montserrat')
    })

    it('title has text-5xl on mobile', () => {
      render(<HeroSection {...defaultProps} />)
      const title = screen.getByText('Rapport RSE 2025')
      expect(title.className).toContain('text-5xl')
    })

    it('title has md:text-7xl for larger screens', () => {
      render(<HeroSection {...defaultProps} />)
      const title = screen.getByText('Rapport RSE 2025')
      expect(title.className).toContain('md:text-7xl')
    })

    it('title has font-bold', () => {
      render(<HeroSection {...defaultProps} />)
      const title = screen.getByText('Rapport RSE 2025')
      expect(title.className).toContain('font-bold')
    })

    it('baseline has text-xl on mobile', () => {
      render(<HeroSection {...defaultProps} />)
      const baseline = screen.getByText('Notre engagement pour un avenir durable')
      expect(baseline.className).toContain('text-xl')
    })

    it('baseline has md:text-2xl for larger screens', () => {
      render(<HeroSection {...defaultProps} />)
      const baseline = screen.getByText('Notre engagement pour un avenir durable')
      expect(baseline.className).toContain('md:text-2xl')
    })
  })

  describe('CTA Button', () => {
    it('links to /rapport?page=1', () => {
      render(<HeroSection {...defaultProps} />)
      const link = screen.getByText('Explorer le rapport').closest('a')
      expect(link).toHaveAttribute('href', '/rapport?page=1')
    })

    it('has group class for hover effects', () => {
      render(<HeroSection {...defaultProps} />)
      const link = screen.getByText('Explorer le rapport').closest('a')
      expect(link?.className).toContain('group')
    })

    it('has rounded-lg class', () => {
      render(<HeroSection {...defaultProps} />)
      const link = screen.getByText('Explorer le rapport').closest('a')
      expect(link?.className).toContain('rounded-lg')
    })
  })

  describe('Badge', () => {
    it('has uppercase text', () => {
      render(<HeroSection {...defaultProps} />)
      const badge = screen.getByText('1er Rapport Durable')
      expect(badge.className).toContain('uppercase')
    })

    it('has rounded-full class', () => {
      render(<HeroSection {...defaultProps} />)
      const badge = screen.getByText('1er Rapport Durable')
      expect(badge.className).toContain('rounded-full')
    })

    it('has bg-[#0088CC] color', () => {
      render(<HeroSection {...defaultProps} />)
      const badge = screen.getByText('1er Rapport Durable')
      expect(badge.className).toContain('bg-[#0088CC]')
    })
  })

  describe('Responsive Behavior', () => {
    it('has container class for responsive padding', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      const contentContainer = container.querySelector('.container')
      expect(contentContainer).toBeInTheDocument()
    })

    it('has px-4 for mobile padding', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      const contentContainer = container.querySelector('.container')
      expect(contentContainer?.className).toContain('px-4')
    })
  })

  describe('Props Variations', () => {
    it('renders different title', () => {
      render(<HeroSection {...defaultProps} title="Custom Title" />)
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders different baseline', () => {
      render(<HeroSection {...defaultProps} baseline="Custom baseline text" />)
      expect(screen.getByText('Custom baseline text')).toBeInTheDocument()
    })
  })
})
