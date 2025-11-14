import { render, screen } from '@/test-utils'
import { AccidentsChart } from '@/components/dashboard/charts/AccidentsChart'
import { socialData } from '@/lib/data/rse-data'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children, data }: any) => <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Line: ({ dataKey, stroke, strokeDasharray, yAxisId }: any) => (
    <div
      data-testid={`line-${dataKey}`}
      data-stroke={stroke}
      data-stroke-dasharray={strokeDasharray}
      data-yaxis-id={yAxisId}
    />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid="xaxis" data-key={dataKey} />,
  YAxis: ({ yAxisId }: any) => <div data-testid={`yaxis-${yAxisId || 'left'}`} />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('AccidentsChart', () => {
  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders LineChart with accidents data', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const chart = screen.getByTestId('line-chart')
      expect(chart).toBeInTheDocument()

      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(socialData.accidents.length)
    })

    it('renders 2 Line components for count and frequency', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      expect(screen.getByTestId('line-count')).toBeInTheDocument()
      expect(screen.getByTestId('line-frequency')).toBeInTheDocument()
    })

    it('renders XAxis with year dataKey', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toBeInTheDocument()
      expect(xaxis).toHaveAttribute('data-key', 'year')
    })

    it('renders dual Y-axes', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      expect(screen.getByTestId('yaxis-left')).toBeInTheDocument()
      expect(screen.getByTestId('yaxis-right')).toBeInTheDocument()
    })

    it('renders CartesianGrid', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Legend', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('uses socialData.accidents as data source', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const chart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(socialData.accidents)
    })

    it('has 6 years of accidents data', () => {
      expect(socialData.accidents).toHaveLength(6)
    })

    it('has correct accidents data structure', () => {
      socialData.accidents.forEach(item => {
        expect(item).toHaveProperty('year')
        expect(item).toHaveProperty('count')
        expect(item).toHaveProperty('frequency')
      })
    })
  })

  describe('Dual Y-Axis Configuration', () => {
    it('count Line uses left Y-axis', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const countLine = screen.getByTestId('line-count')
      expect(countLine).toHaveAttribute('data-yaxis-id', 'left')
    })

    it('frequency Line uses right Y-axis', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const frequencyLine = screen.getByTestId('line-frequency')
      expect(frequencyLine).toHaveAttribute('data-yaxis-id', 'right')
    })
  })

  describe('Visual Styling', () => {
    it('count Line has solid stroke', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const countLine = screen.getByTestId('line-count')
      expect(countLine).toHaveAttribute('data-stroke')

      // Solid line should not have strokeDasharray or be empty/undefined
      const dasharray = countLine.getAttribute('data-stroke-dasharray')
      expect(dasharray === null || dasharray === undefined || dasharray === '').toBeTruthy()
    })

    it('frequency Line has dashed stroke', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const frequencyLine = screen.getByTestId('line-frequency')
      expect(frequencyLine).toHaveAttribute('data-stroke')

      // Dashed line should have strokeDasharray
      const dasharray = frequencyLine.getAttribute('data-stroke-dasharray')
      expect(dasharray).toBeTruthy()
      expect(dasharray).not.toBe('')
    })

    it('Lines have different stroke colors', () => {
      render(<AccidentsChart data={socialData.accidents} />)
      const countLine = screen.getByTestId('line-count')
      const frequencyLine = screen.getByTestId('line-frequency')

      const countStroke = countLine.getAttribute('data-stroke')
      const frequencyStroke = frequencyLine.getAttribute('data-stroke')

      expect(countStroke).not.toBe(frequencyStroke)
    })
  })
})
