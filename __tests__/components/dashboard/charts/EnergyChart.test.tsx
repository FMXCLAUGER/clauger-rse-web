import { render, screen } from '@/test-utils'
import { EnergyChart } from '@/components/dashboard/charts/EnergyChart'
import { environmentData } from '@/lib/data/rse-data'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Bar: ({ dataKey, fill, name, children }: any) => <div data-testid={`bar-${dataKey}`} data-fill={fill} data-name={name}>{children}</div>,
  XAxis: ({ dataKey }: any) => <div data-testid="xaxis" data-key={dataKey} />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
}))

describe('EnergyChart', () => {
  const mockData = [
    { site: 'Lyon', consumption: 1200, renewable: 35 },
    { site: 'Culoz', consumption: 800, renewable: 60 },
    { site: 'Paris', consumption: 1500, renewable: 25 },
    { site: 'Nantes', consumption: 950, renewable: 45 },
    { site: 'Autres', consumption: 600, renewable: 40 },
  ]

  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<EnergyChart data={mockData} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders BarChart with energy data', () => {
      render(<EnergyChart data={mockData} />)
      const chart = screen.getByTestId('bar-chart')
      expect(chart).toBeInTheDocument()

      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(mockData.length)
    })

    it('renders 2 Bar components for consumption and renewable', () => {
      render(<EnergyChart data={mockData} />)
      expect(screen.getByTestId('bar-consumption')).toBeInTheDocument()
      expect(screen.getByTestId('bar-renewable')).toBeInTheDocument()
    })

    it('renders XAxis with site dataKey', () => {
      render(<EnergyChart data={mockData} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toBeInTheDocument()
      expect(xaxis).toHaveAttribute('data-key', 'site')
    })

    it('renders YAxis', () => {
      render(<EnergyChart data={mockData} />)
      expect(screen.getByTestId('yaxis')).toBeInTheDocument()
    })

    it('renders CartesianGrid', () => {
      render(<EnergyChart data={mockData} />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(<EnergyChart data={mockData} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Legend', () => {
      render(<EnergyChart data={mockData} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('accepts data prop and passes it to BarChart', () => {
      render(<EnergyChart data={mockData} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(mockData)
    })

    it('handles data with 5 sites correctly', () => {
      render(<EnergyChart data={mockData} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toHaveLength(5)
      expect(chartData[0]).toHaveProperty('site')
      expect(chartData[0]).toHaveProperty('consumption')
      expect(chartData[0]).toHaveProperty('renewable')
    })

    it('works with real environmentData.energy', () => {
      render(<EnergyChart data={environmentData.energy} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(environmentData.energy)
      expect(chartData.length).toBeGreaterThan(0)
    })

    it('handles empty data array', () => {
      render(<EnergyChart data={[]} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual([])
      expect(chartData).toHaveLength(0)
    })
  })

  describe('Visual Styling', () => {
    it('applies fill color to renewable bar', () => {
      render(<EnergyChart data={mockData} />)
      const renewableBar = screen.getByTestId('bar-renewable')

      expect(renewableBar).toHaveAttribute('data-fill', '#10B981')
    })

    it('consumption bar uses Cell components for colors', () => {
      render(<EnergyChart data={mockData} />)
      const consumptionBar = screen.getByTestId('bar-consumption')

      // Consumption bar has Cell children for individual colors
      expect(consumptionBar).toBeInTheDocument()
      // Verify Cell components are rendered (one per data point)
      const cells = screen.getAllByTestId('cell')
      expect(cells.length).toBeGreaterThan(0)
    })

    it('sets correct names for bars', () => {
      render(<EnergyChart data={mockData} />)
      const consumptionBar = screen.getByTestId('bar-consumption')
      const renewableBar = screen.getByTestId('bar-renewable')

      expect(consumptionBar).toHaveAttribute('data-name', 'Consommation')
      expect(renewableBar).toHaveAttribute('data-name', '% Renouvelable')
    })
  })

  describe('Bar Configuration', () => {
    it('renders consumption bar with dataKey consumption', () => {
      render(<EnergyChart data={mockData} />)
      const consumptionBar = screen.getByTestId('bar-consumption')

      expect(consumptionBar).toBeInTheDocument()
    })

    it('renders renewable bar with dataKey renewable', () => {
      render(<EnergyChart data={mockData} />)
      const renewableBar = screen.getByTestId('bar-renewable')

      expect(renewableBar).toBeInTheDocument()
    })

    it('uses Cell components for consumption bar colors', () => {
      render(<EnergyChart data={mockData} />)
      const cells = screen.getAllByTestId('cell')

      expect(cells.length).toBeGreaterThan(0)
    })
  })
})
