import { render, screen } from '@/test-utils'
import { TrainingChart } from '@/components/dashboard/charts/TrainingChart'
import { socialData } from '@/lib/data/rse-data'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  ComposedChart: ({ children, data }: any) => <div data-testid="composed-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Bar: ({ dataKey, fill, yAxisId }: any) => <div data-testid={`bar-${dataKey}`} data-fill={fill} data-yaxis-id={yAxisId} />,
  Line: ({ dataKey, stroke, yAxisId }: any) => <div data-testid={`line-${dataKey}`} data-stroke={stroke} data-yaxis-id={yAxisId} />,
  XAxis: ({ dataKey }: any) => <div data-testid="xaxis" data-key={dataKey} />,
  YAxis: ({ yAxisId }: any) => <div data-testid={`yaxis-${yAxisId || 'left'}`} />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('TrainingChart', () => {
  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<TrainingChart data={socialData.training} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders ComposedChart with training data', () => {
      render(<TrainingChart data={socialData.training} />)
      const chart = screen.getByTestId('composed-chart')
      expect(chart).toBeInTheDocument()

      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(socialData.training.length)
    })

    it('renders Bar component for total hours', () => {
      render(<TrainingChart data={socialData.training} />)
      expect(screen.getByTestId('bar-hours')).toBeInTheDocument()
    })

    it('renders Line component for average hours', () => {
      render(<TrainingChart data={socialData.training} />)
      const line = screen.getByTestId('line-avgHours')
      expect(line).toBeInTheDocument()
    })

    it('renders XAxis with year dataKey', () => {
      render(<TrainingChart data={socialData.training} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toBeInTheDocument()
      expect(xaxis).toHaveAttribute('data-key', 'year')
    })

    it('renders dual Y-axes', () => {
      render(<TrainingChart data={socialData.training} />)
      expect(screen.getByTestId('yaxis-left')).toBeInTheDocument()
      expect(screen.getByTestId('yaxis-right')).toBeInTheDocument()
    })

    it('renders CartesianGrid', () => {
      render(<TrainingChart data={socialData.training} />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(<TrainingChart data={socialData.training} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Legend', () => {
      render(<TrainingChart data={socialData.training} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('uses provided training data as data source', () => {
      render(<TrainingChart data={socialData.training} />)
      const chart = screen.getByTestId('composed-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toHaveLength(socialData.training.length)
    })

    it('has correct training data structure', () => {
      expect(socialData.training).toHaveLength(6)
      socialData.training.forEach(item => {
        expect(item).toHaveProperty('year')
        expect(item).toHaveProperty('hours')
        expect(item).toHaveProperty('employees')
      })
    })

    it('calculates avgHours correctly', () => {
      render(<TrainingChart data={socialData.training} />)
      const chart = screen.getByTestId('composed-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      const firstItem = socialData.training[0]
      const expectedAvg = (firstItem.hours / firstItem.employees).toFixed(1)

      expect(chartData[0].avgHours).toBe(expectedAvg)
    })

    it('calculates avgHours for all data points', () => {
      render(<TrainingChart data={socialData.training} />)
      const chart = screen.getByTestId('composed-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      chartData.forEach((item: any, index: number) => {
        const originalItem = socialData.training[index]
        const expectedAvg = (originalItem.hours / originalItem.employees).toFixed(1)
        expect(item.avgHours).toBe(expectedAvg)
      })
    })

    it('preserves original data properties', () => {
      render(<TrainingChart data={socialData.training} />)
      const chart = screen.getByTestId('composed-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      chartData.forEach((item: any, index: number) => {
        const originalItem = socialData.training[index]
        expect(item.year).toBe(originalItem.year)
        expect(item.hours).toBe(originalItem.hours)
        expect(item.employees).toBe(originalItem.employees)
      })
    })
  })

  describe('Dual Y-Axis Configuration', () => {
    it('Bar uses left Y-axis', () => {
      render(<TrainingChart data={socialData.training} />)
      const bar = screen.getByTestId('bar-hours')
      expect(bar).toHaveAttribute('data-yaxis-id', 'left')
    })

    it('Line uses right Y-axis', () => {
      render(<TrainingChart data={socialData.training} />)
      const line = screen.getByTestId('line-avgHours')
      expect(line).toHaveAttribute('data-yaxis-id', 'right')
    })
  })

  describe('Visual Styling', () => {
    it('Bar has fill color', () => {
      render(<TrainingChart data={socialData.training} />)
      const bar = screen.getByTestId('bar-hours')
      expect(bar).toHaveAttribute('data-fill')
      expect(bar.getAttribute('data-fill')).toBeTruthy()
    })

    it('Line has stroke color', () => {
      render(<TrainingChart data={socialData.training} />)
      const line = screen.getByTestId('line-avgHours')
      expect(line).toHaveAttribute('data-stroke')
      expect(line.getAttribute('data-stroke')).toBeTruthy()
    })

    it('Bar has correct color (#0088CC)', () => {
      render(<TrainingChart data={socialData.training} />)
      const bar = screen.getByTestId('bar-hours')
      expect(bar).toHaveAttribute('data-fill', '#0088CC')
    })

    it('Line has correct color (#10B981)', () => {
      render(<TrainingChart data={socialData.training} />)
      const line = screen.getByTestId('line-avgHours')
      expect(line).toHaveAttribute('data-stroke', '#10B981')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty data array', () => {
      render(<TrainingChart data={[]} />)
      const chart = screen.getByTestId('composed-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(0)
    })

    it('handles single data point', () => {
      const singlePoint = [{ year: 2025, hours: 29875, employees: 1456 }]
      render(<TrainingChart data={singlePoint} />)
      const chart = screen.getByTestId('composed-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(1)
      expect(chartData[0].avgHours).toBe((29875 / 1456).toFixed(1))
    })

    it('handles division calculation correctly for large numbers', () => {
      const largeData = [{ year: 2025, hours: 100000, employees: 1000 }]
      render(<TrainingChart data={largeData} />)
      const chart = screen.getByTestId('composed-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData[0].avgHours).toBe('100.0')
    })
  })
})
