import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, act } from '@testing-library/react'
import { CircularGauge180 } from '@/components/enjeux/CircularGauge180'

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any

describe('CircularGauge180', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders SVG gauge', () => {
      const { container } = render(<CircularGauge180 value={7.5} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders with default props', () => {
      const { container } = render(<CircularGauge180 value={5} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders display value as 0.0 initially when animated', () => {
      render(<CircularGauge180 value={8.5} animated={true} />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('renders actual value immediately when animated=false', () => {
      render(<CircularGauge180 value={8.5} animated={false} />)
      expect(screen.getByText('8.5')).toBeInTheDocument()
    })

    it('renders maxValue display', () => {
      render(<CircularGauge180 value={7.5} maxValue={10} />)
      expect(screen.getByText('/ 10')).toBeInTheDocument()
    })

    it('renders custom maxValue', () => {
      render(<CircularGauge180 value={5} maxValue={5} />)
      expect(screen.getByText('/ 5')).toBeInTheDocument()
    })
  })

  describe('Color Coding', () => {
    it('uses red color for score < 5', () => {
      const { container } = render(<CircularGauge180 value={3} animated={false} />)
      const valueElement = screen.getByText('3.0')
      expect(valueElement.style.color).toBe('rgb(239, 68, 68)')
    })

    it('uses yellow color for score >= 5 and < 7', () => {
      const { container } = render(<CircularGauge180 value={6} animated={false} />)
      const valueElement = screen.getByText('6.0')
      expect(valueElement.style.color).toBe('rgb(248, 181, 0)')
    })

    it('uses green color for score >= 7', () => {
      const { container } = render(<CircularGauge180 value={8} animated={false} />)
      const valueElement = screen.getByText('8.0')
      expect(valueElement.style.color).toBe('rgb(16, 185, 129)')
    })

    it('boundary: score 4.9 is red', () => {
      const { container } = render(<CircularGauge180 value={4.9} animated={false} />)
      const valueElement = screen.getByText('4.9')
      expect(valueElement.style.color).toBe('rgb(239, 68, 68)')
    })

    it('boundary: score 5.0 is yellow', () => {
      const { container } = render(<CircularGauge180 value={5.0} animated={false} />)
      const valueElement = screen.getByText('5.0')
      expect(valueElement.style.color).toBe('rgb(248, 181, 0)')
    })

    it('boundary: score 6.9 is yellow', () => {
      const { container } = render(<CircularGauge180 value={6.9} animated={false} />)
      const valueElement = screen.getByText('6.9')
      expect(valueElement.style.color).toBe('rgb(248, 181, 0)')
    })

    it('boundary: score 7.0 is green', () => {
      const { container } = render(<CircularGauge180 value={7.0} animated={false} />)
      const valueElement = screen.getByText('7.0')
      expect(valueElement.style.color).toBe('rgb(16, 185, 129)')
    })
  })

  describe('SVG Structure', () => {
    it('has correct SVG dimensions with default size', () => {
      const { container } = render(<CircularGauge180 value={5} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe('140')
      expect(svg?.getAttribute('height')).toBe('88') // (140/2) + 8 + 10
    })

    it('has correct SVG dimensions with custom size', () => {
      const { container } = render(<CircularGauge180 value={5} size={200} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe('200')
      expect(svg?.getAttribute('height')).toBe('118') // (200/2) + 8 + 10
    })

    it('renders background circle', () => {
      const { container } = render(<CircularGauge180 value={5} />)
      const circles = container.querySelectorAll('circle')
      expect(circles.length).toBe(2)
      expect(circles[0].getAttribute('stroke')).toBe('#E5E7EB')
    })

    it('renders progress circle', () => {
      const { container } = render(<CircularGauge180 value={5} />)
      const circles = container.querySelectorAll('circle')
      expect(circles.length).toBe(2)
      expect(circles[1].getAttribute('stroke')).toBeTruthy()
    })

    it('both circles have strokeLinecap="round"', () => {
      const { container } = render(<CircularGauge180 value={5} />)
      const circles = container.querySelectorAll('circle')
      expect(circles[0].getAttribute('stroke-linecap')).toBe('round')
      expect(circles[1].getAttribute('stroke-linecap')).toBe('round')
    })
  })

  describe('Value Display', () => {
    it('formats value with 1 decimal place', () => {
      render(<CircularGauge180 value={7.5} animated={false} />)
      expect(screen.getByText('7.5')).toBeInTheDocument()
    })

    it('formats integer as X.0', () => {
      render(<CircularGauge180 value={8} animated={false} />)
      expect(screen.getByText('8.0')).toBeInTheDocument()
    })

    it('rounds to 1 decimal place', () => {
      render(<CircularGauge180 value={7.56} animated={false} />)
      expect(screen.getByText('7.6')).toBeInTheDocument()
    })

    it('displays 0.0 for zero value', () => {
      render(<CircularGauge180 value={0} animated={false} />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('displays 10.0 for max value', () => {
      render(<CircularGauge180 value={10} animated={false} />)
      expect(screen.getByText('10.0')).toBeInTheDocument()
    })
  })

  describe('Animation Behavior', () => {
    it('starts at 0.0 when animated', () => {
      render(<CircularGauge180 value={8} animated={true} />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('renders with animation enabled by default', () => {
      const { container } = render(<CircularGauge180 value={8} />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('shows final value immediately when not animated', () => {
      render(<CircularGauge180 value={8} animated={false} />)
      expect(screen.getByText('8.0')).toBeInTheDocument()
    })
  })

  describe('Sizing', () => {
    it('applies custom size prop', () => {
      const { container } = render(<CircularGauge180 value={5} size={200} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe('200')
    })

    it('applies custom strokeWidth', () => {
      const { container } = render(<CircularGauge180 value={5} strokeWidth={12} />)
      const circles = container.querySelectorAll('circle')
      expect(circles[0].getAttribute('stroke-width')).toBe('12')
      expect(circles[1].getAttribute('stroke-width')).toBe('12')
    })

    it('calculates radius based on size and strokeWidth', () => {
      const { container } = render(<CircularGauge180 value={5} size={140} strokeWidth={8} />)
      const circles = container.querySelectorAll('circle')
      const radius = circles[0].getAttribute('r')
      expect(radius).toBe('66') // (140 - 8) / 2
    })
  })

  describe('CSS Classes', () => {
    it('has transition classes on progress circle', () => {
      const { container } = render(<CircularGauge180 value={5} />)
      const circles = container.querySelectorAll('circle')
      expect(circles[1].className.baseVal).toContain('transition-all')
    })

    it('value text has tabular-nums class', () => {
      const { container } = render(<CircularGauge180 value={5} animated={false} />)
      const valueElement = screen.getByText('5.0')
      expect(valueElement.className).toContain('tabular-nums')
    })

    it('value text has text-5xl class', () => {
      const { container } = render(<CircularGauge180 value={5} animated={false} />)
      const valueElement = screen.getByText('5.0')
      expect(valueElement.className).toContain('text-5xl')
    })

    it('maxValue text has text-xs class', () => {
      const { container } = render(<CircularGauge180 value={5} />)
      const maxValueElement = screen.getByText('/ 10')
      expect(maxValueElement.className).toContain('text-xs')
    })
  })

  describe('Edge Cases', () => {
    it('handles value of 0', () => {
      render(<CircularGauge180 value={0} animated={false} />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('handles maxValue of 0', () => {
      render(<CircularGauge180 value={0} maxValue={0} animated={false} />)
      expect(screen.getByText('/ 0')).toBeInTheDocument()
    })

    it('handles value exceeding maxValue', () => {
      render(<CircularGauge180 value={12} maxValue={10} animated={false} />)
      expect(screen.getByText('12.0')).toBeInTheDocument()
    })

    it('handles very small decimal values', () => {
      render(<CircularGauge180 value={0.1} animated={false} />)
      expect(screen.getByText('0.1')).toBeInTheDocument()
    })

    it('handles negative values (displays as-is)', () => {
      render(<CircularGauge180 value={-1} animated={false} />)
      expect(screen.getByText('-1.0')).toBeInTheDocument()
    })
  })
})
