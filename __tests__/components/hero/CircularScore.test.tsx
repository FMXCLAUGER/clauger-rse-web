import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, act } from '@testing-library/react'
import { CircularScore } from '@/components/hero/CircularScore'

describe('CircularScore', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders SVG element', () => {
      const { container } = render(<CircularScore score={75} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders with default props', () => {
      const { container } = render(<CircularScore score={50} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('displays initial score as 0', () => {
      render(<CircularScore score={75} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays max score', () => {
      render(<CircularScore score={75} maxScore={100} />)
      expect(screen.getByText('/ 100')).toBeInTheDocument()
    })

    it('renders with custom maxScore', () => {
      render(<CircularScore score={40} maxScore={50} />)
      expect(screen.getByText('/ 50')).toBeInTheDocument()
    })

    it('renders "Score Global" label', () => {
      render(<CircularScore score={75} />)
      expect(screen.getByText('Score Global')).toBeInTheDocument()
    })
  })

  describe('Score Level Labels', () => {
    it('shows "Excellent" for score >= 80', () => {
      render(<CircularScore score={85} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('shows "Bon" for score >= 60 and < 80', () => {
      render(<CircularScore score={70} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('Bon')).toBeInTheDocument()
    })

    it('shows "Moyen" for score >= 40 and < 60', () => {
      render(<CircularScore score={50} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('Moyen')).toBeInTheDocument()
    })

    it('shows "À améliorer" for score < 40', () => {
      render(<CircularScore score={30} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('À améliorer')).toBeInTheDocument()
    })

    it('boundary: score 80 is "Excellent"', () => {
      render(<CircularScore score={80} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('boundary: score 60 is "Bon"', () => {
      render(<CircularScore score={60} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('Bon')).toBeInTheDocument()
    })

    it('boundary: score 40 is "Moyen"', () => {
      render(<CircularScore score={40} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('Moyen')).toBeInTheDocument()
    })
  })

  describe('SVG Structure', () => {
    it('has correct width with default size', () => {
      const { container } = render(<CircularScore score={50} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe('200')
    })

    it('has correct width with custom size', () => {
      const { container } = render(<CircularScore score={50} size={300} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe('300')
    })

    it('renders 2 circles (background + progress)', () => {
      const { container } = render(<CircularScore score={50} />)
      const circles = container.querySelectorAll('circle')
      expect(circles).toHaveLength(2)
    })

    it('has gradient definition', () => {
      const { container } = render(<CircularScore score={50} />)
      const gradient = container.querySelector('#scoreGradient')
      expect(gradient).toBeInTheDocument()
    })

    it('progress circle uses gradient', () => {
      const { container } = render(<CircularScore score={50} />)
      const circles = container.querySelectorAll('circle')
      expect(circles[1].getAttribute('stroke')).toContain('scoreGradient')
    })

    it('has strokeLinecap="round"', () => {
      const { container } = render(<CircularScore score={50} />)
      const circles = container.querySelectorAll('circle')
      expect(circles[1].getAttribute('stroke-linecap')).toBe('round')
    })
  })

  describe('Animation', () => {
    it('animates from 0 to target score', () => {
      render(<CircularScore score={75} />)
      expect(screen.getByText('0')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(2100)
      })

      expect(screen.getByText('75')).toBeInTheDocument()
    })

    it('animation completes in approximately 2 seconds', () => {
      render(<CircularScore score={100} />)

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      act(() => {
        jest.advanceTimersByTime(1100)
      })

      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('does not re-animate after first animation', () => {
      const { rerender } = render(<CircularScore score={50} />)

      act(() => {
        jest.advanceTimersByTime(2100)
      })

      expect(screen.getByText('50')).toBeInTheDocument()

      rerender(<CircularScore score={50} />)

      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has group class', () => {
      const { container } = render(<CircularScore score={50} />)
      const wrapper = container.querySelector('.group')
      expect(wrapper).toBeInTheDocument()
    })

    it('has hover:scale-105 effect', () => {
      const { container } = render(<CircularScore score={50} />)
      const card = container.querySelector('.hover\\:scale-105')
      expect(card).toBeInTheDocument()
    })

    it('has rounded-2xl class', () => {
      const { container } = render(<CircularScore score={50} />)
      const card = container.querySelector('.rounded-2xl')
      expect(card).toBeInTheDocument()
    })

    it('has shadow styling', () => {
      const { container } = render(<CircularScore score={50} />)
      const card = container.querySelector('[class*="shadow"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles score of 0', () => {
      render(<CircularScore score={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('/ 100')).toBeInTheDocument()
    })

    it('handles score of 100', () => {
      render(<CircularScore score={100} />)
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('handles custom size and strokeWidth', () => {
      const { container } = render(<CircularScore score={50} size={150} strokeWidth={8} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe('150')
    })
  })
})
