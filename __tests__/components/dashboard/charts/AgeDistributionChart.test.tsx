import { render, screen } from '@/test-utils'
import { AgeDistributionChart } from '@/components/dashboard/charts/AgeDistributionChart'
import { socialData } from '@/lib/data/rse-data'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Bar: ({ dataKey, fill, children }: any) => <div data-testid={`bar-${dataKey}`} data-fill={fill}>{children}</div>,
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
  XAxis: ({ dataKey }: any) => <div data-testid="xaxis" data-key={dataKey} />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('AgeDistributionChart', () => {
  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders BarChart with age distribution data', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      const chart = screen.getByTestId('bar-chart')
      expect(chart).toBeInTheDocument()

      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(socialData.ageDistribution.length)
    })

    it('renders Bar component', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      expect(screen.getByTestId('bar-count')).toBeInTheDocument()
    })

    it('renders XAxis with range dataKey', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toBeInTheDocument()
      expect(xaxis).toHaveAttribute('data-key', 'range')
    })

    it('renders YAxis', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      expect(screen.getByTestId('yaxis')).toBeInTheDocument()
    })

    it('renders CartesianGrid', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('uses socialData.ageDistribution as data source', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(socialData.ageDistribution)
    })

    it('has 5 age ranges', () => {
      expect(socialData.ageDistribution).toHaveLength(5)
    })

    it('has correct age distribution structure', () => {
      socialData.ageDistribution.forEach(item => {
        expect(item).toHaveProperty('range')
        expect(item).toHaveProperty('count')
      })
    })

    it('all counts are positive numbers', () => {
      socialData.ageDistribution.forEach(item => {
        expect(item.count).toBeGreaterThan(0)
        expect(typeof item.count).toBe('number')
      })
    })

    it('handles custom data prop', () => {
      const customData = [
        { range: '18-25', count: 10 },
        { range: '26-35', count: 20 },
      ]
      render(<AgeDistributionChart data={customData} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(customData)
    })

    it('handles empty data array', () => {
      render(<AgeDistributionChart data={[]} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual([])
      expect(chartData).toHaveLength(0)
    })
  })

  describe('Visual Styling', () => {
    it('renders Cell components for color mapping', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      const cells = screen.getAllByTestId('cell')
      expect(cells.length).toBeGreaterThan(0)
    })

    it('each age range has a cell with fill color', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      const cells = screen.getAllByTestId('cell')

      cells.forEach(cell => {
        expect(cell).toHaveAttribute('data-fill')
      })
    })

    it('renders correct number of cells matching data length', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      const cells = screen.getAllByTestId('cell')

      expect(cells).toHaveLength(socialData.ageDistribution.length)
    })

    it('applies different colors to each bar', () => {
      render(<AgeDistributionChart data={socialData.ageDistribution} />)
      const cells = screen.getAllByTestId('cell')

      const colors = cells.map(cell => cell.getAttribute('data-fill'))
      const expectedColors = ['#0088CC', '#F8B500', '#10B981', '#F59E0B', '#EF4444']

      expect(colors).toEqual(expectedColors)
    })

    it('cycles through colors when data length exceeds color array', () => {
      const extendedData = [
        { range: '18-25', count: 10 },
        { range: '26-35', count: 20 },
        { range: '36-45', count: 30 },
        { range: '46-55', count: 25 },
        { range: '56-65', count: 15 },
        { range: '66+', count: 5 },
      ]
      render(<AgeDistributionChart data={extendedData} />)
      const cells = screen.getAllByTestId('cell')

      expect(cells).toHaveLength(6)
      const firstColor = cells[0].getAttribute('data-fill')
      const sixthColor = cells[5].getAttribute('data-fill')
      expect(sixthColor).toBe(firstColor)
    })
  })
})
