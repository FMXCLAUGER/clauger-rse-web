import { render, screen, waitFor } from '@/test-utils'
import { KeyFigureCard } from '@/components/dashboard/KeyFigureCard'
import { Activity } from 'lucide-react'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children, data }: any) => <div data-testid="sparkline-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Line: ({ dataKey, stroke }: any) => <div data-testid={`sparkline-${dataKey}`} data-stroke={stroke} />,
}))

jest.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({
    ref: { current: null },
    isVisible: true,
  }),
}))

describe('KeyFigureCard', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders with title', () => {
      render(<KeyFigureCard icon={Activity} title="Total Revenue" value={1000000} unit="€" />)
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })

    it('renders icon component', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const iconContainer = container.querySelector('[aria-hidden="true"]')
      expect(iconContainer).toBeInTheDocument()
    })

    it('renders value with unit', () => {
      render(<KeyFigureCard icon={Activity} title="Total Revenue" value={1000000} unit="€" />)
      expect(screen.getByText('€')).toBeInTheDocument()
    })

    it('renders without unit when not provided', () => {
      render(<KeyFigureCard icon={Activity} title="Total Revenue" value={1000000} />)
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      // Should not have a unit span
      const { container } = render(<KeyFigureCard icon={Activity} title="Total Revenue" value={1000000} />)
      expect(container.querySelector('.text-base.font-medium')).not.toBeInTheDocument()
    })

    it('applies article semantic element', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      expect(container.querySelector('article')).toBeInTheDocument()
    })

    it('has correct aria-label', () => {
      render(<KeyFigureCard icon={Activity} title="Total Revenue" value={1000000} unit="€" />)
      const article = screen.getByLabelText(/Total Revenue:.*€/)
      expect(article).toBeInTheDocument()
    })
  })

  describe('Trend Indicators', () => {
    it('shows positive trend with plus sign', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: 15, label: 'vs last month' }}
        />
      )
      expect(screen.getByText(/\+15%/)).toBeInTheDocument()
    })

    it('shows negative trend without extra sign', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: -10, label: 'vs last month' }}
        />
      )
      expect(screen.getByText(/-10%/)).toBeInTheDocument()
    })

    it('shows zero trend', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: 0, label: 'stable' }}
        />
      )
      expect(screen.getByText(/0% stable/)).toBeInTheDocument()
    })

    it('renders trend label', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: 15, label: 'vs last year' }}
        />
      )
      expect(screen.getByText(/vs last year/)).toBeInTheDocument()
    })

    it('applies success color for positive trend', () => {
      const { container } = render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: 15, label: 'up' }}
        />
      )
      const trendElement = container.querySelector('.text-success')
      expect(trendElement).toBeInTheDocument()
    })

    it('applies danger color for negative trend', () => {
      const { container } = render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: -10, label: 'down' }}
        />
      )
      const trendElement = container.querySelector('.text-danger')
      expect(trendElement).toBeInTheDocument()
    })

    it('applies light color for stable trend', () => {
      const { container } = render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: 0, label: 'stable' }}
        />
      )
      const trendElement = container.querySelector('.text-text-light')
      expect(trendElement).toBeInTheDocument()
    })

    it('does not render trend when not provided', () => {
      const { container } = render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
        />
      )
      expect(container.querySelector('.text-success')).not.toBeInTheDocument()
      expect(container.querySelector('.text-danger')).not.toBeInTheDocument()
    })

    it('includes aria-label for trend', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          trend={{ value: 15, label: 'increase this month' }}
        />
      )
      expect(screen.getByLabelText('increase this month')).toBeInTheDocument()
    })
  })

  describe('Sparkline Chart', () => {
    const sparklineData = [
      { value: 100 },
      { value: 120 },
      { value: 110 },
      { value: 150 },
    ]

    it('renders sparkline when data provided', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={150}
          unit="%"
          sparklineData={sparklineData}
        />
      )
      expect(screen.getByTestId('sparkline-chart')).toBeInTheDocument()
    })

    it('does not render sparkline when no data provided', () => {
      render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      expect(screen.queryByTestId('sparkline-chart')).not.toBeInTheDocument()
    })

    it('does not render sparkline when empty array provided', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          sparklineData={[]}
        />
      )
      expect(screen.queryByTestId('sparkline-chart')).not.toBeInTheDocument()
    })

    it('passes correct data to sparkline', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={150}
          unit="%"
          sparklineData={sparklineData}
        />
      )
      const chart = screen.getByTestId('sparkline-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toEqual(sparklineData)
    })

    it('renders sparkline Line component', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={150}
          unit="%"
          sparklineData={sparklineData}
        />
      )
      expect(screen.getByTestId('sparkline-value')).toBeInTheDocument()
    })

    it('sparkline has correct stroke color', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={150}
          unit="%"
          sparklineData={sparklineData}
        />
      )
      const line = screen.getByTestId('sparkline-value')
      expect(line.getAttribute('data-stroke')).toBe('#0088CC')
    })

    it('sparkline has accessibility label', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Revenue Metric"
          value={150}
          unit="%"
          sparklineData={sparklineData}
        />
      )
      expect(screen.getByLabelText('Tendance de Revenue Metric')).toBeInTheDocument()
    })

    it('renders ResponsiveContainer', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={150}
          unit="%"
          sparklineData={sparklineData}
        />
      )
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('Counter Animation', () => {
    it('displays animated value from 0 to target', async () => {
      render(<KeyFigureCard icon={Activity} title="Test" value={1000} unit="€" />)

      // Initially should show 0 or low value
      expect(screen.getByText(/0/)).toBeInTheDocument()

      // Advance all timers
      jest.runAllTimers()

      // Should eventually show target value
      await waitFor(() => {
        expect(screen.getByText(/1 000/)).toBeInTheDocument()
      })
    })

    it('uses custom formatter', async () => {
      const customFormatter = (val: number) => `$${val.toFixed(2)}`
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={1234.56}
          unit="USD"
          formatter={customFormatter}
        />
      )

      jest.runAllTimers()

      await waitFor(() => {
        // Check that custom formatter is used (starts with $) and shows a value close to 1234.56
        expect(screen.getByText(/\$123[45]\.\d{2}/)).toBeInTheDocument()
      })
    })

    it('uses default French locale formatter', async () => {
      render(<KeyFigureCard icon={Activity} title="Test" value={1000000} unit="€" />)

      jest.runAllTimers()

      await waitFor(() => {
        // French locale uses space as thousands separator
        expect(screen.getByText(/1 000 000/)).toBeInTheDocument()
      })
    })

    it('displays value with aria-live for accessibility', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={1000} unit="€" />)
      const valueElement = container.querySelector('[aria-live="polite"]')
      expect(valueElement).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very large values', async () => {
      render(<KeyFigureCard icon={Activity} title="Test" value={999999999} unit="€" />)
      jest.runAllTimers()
      await waitFor(() => {
        expect(screen.getByText(/999 999 999/)).toBeInTheDocument()
      })
    })

    it('handles zero value', () => {
      render(<KeyFigureCard icon={Activity} title="Test" value={0} unit="%" />)
      jest.runAllTimers()
      expect(screen.getByText(/0/)).toBeInTheDocument()
    })

    it('handles decimal values', async () => {
      render(<KeyFigureCard icon={Activity} title="Test" value={123.45} unit="%" />)
      jest.runAllTimers()
      await waitFor(() => {
        expect(screen.getByText(/123/)).toBeInTheDocument()
      })
    })

    it('handles negative values', async () => {
      render(<KeyFigureCard icon={Activity} title="Test" value={-50} unit="°C" />)
      jest.runAllTimers()
      await waitFor(() => {
        expect(screen.getByText(/-50/)).toBeInTheDocument()
      })
    })

    it('handles single data point in sparkline', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Test"
          value={100}
          unit="%"
          sparklineData={[{ value: 100 }]}
        />
      )
      expect(screen.getByTestId('sparkline-chart')).toBeInTheDocument()
    })
  })

  describe('Styling and Interaction', () => {
    it('applies hover effects classes', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const article = container.querySelector('article')
      expect(article?.className).toContain('hover:-translate-y-2')
      expect(article?.className).toContain('hover:border-[#0088CC]')
    })

    it('applies focus-within ring classes', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const article = container.querySelector('article')
      expect(article?.className).toContain('focus-within:ring-3')
      expect(article?.className).toContain('focus-within:ring-primary')
    })

    it('applies shadow effects', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const article = container.querySelector('article')
      expect(article?.className).toContain('shadow-[0_1px_3px_rgba(0,0,0,0.08)]')
    })

    it('applies transition delay from delay prop', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" delay={200} />)
      const article = container.querySelector('article')
      expect(article).toHaveStyle({ transitionDelay: '200ms' })
    })

    it('uses default delay of 0 when not provided', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const article = container.querySelector('article')
      expect(article).toHaveStyle({ transitionDelay: '0ms' })
    })

    it('applies gradient background to icon container', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const iconContainer = container.querySelector('.bg-gradient-to-br')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies hover rotate effect to icon container', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const iconContainer = container.querySelector('[aria-hidden="true"]')
      expect(iconContainer?.className).toContain('group-hover:rotate-[360deg]')
    })
  })

  describe('Accessibility', () => {
    it('title has correct heading level', () => {
      render(<KeyFigureCard icon={Activity} title="Test Metric" value={100} unit="%" />)
      const title = screen.getByText('Test Metric')
      expect(title.tagName).toBe('H3')
    })

    it('icon is hidden from screen readers', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const iconContainer = container.querySelector('[aria-hidden="true"]')
      expect(iconContainer).toBeInTheDocument()
    })

    it('sparkline has role and aria-label', () => {
      render(
        <KeyFigureCard
          icon={Activity}
          title="Revenue"
          value={150}
          unit="%"
          sparklineData={[{ value: 100 }, { value: 150 }]}
        />
      )
      const sparklineContainer = screen.getByRole('img', { name: /Tendance de Revenue/ })
      expect(sparklineContainer).toBeInTheDocument()
    })

    it('value has tabular-nums class for consistent width', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={1000} unit="€" />)
      const valueElement = container.querySelector('.tabular-nums')
      expect(valueElement).toBeInTheDocument()
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode classes', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      const article = container.querySelector('article')
      expect(article?.className).toContain('dark:bg-gray-800')
      expect(article?.className).toContain('dark:border-gray-700')
    })

    it('applies dark mode text colors', () => {
      const { container } = render(<KeyFigureCard icon={Activity} title="Test" value={100} unit="%" />)
      expect(container.querySelector('.dark\\:text-gray-400')).toBeInTheDocument()
      expect(container.querySelector('.dark\\:text-\\[\\#0099DD\\]')).toBeInTheDocument()
    })
  })
})
