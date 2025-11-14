jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children, data }: any) => <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Line: ({ dataKey, stroke }: any) => <div data-testid={`line-${dataKey}`} data-stroke={stroke} />,
  XAxis: ({ dataKey }: any) => <div data-testid="xaxis" data-key={dataKey} />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

import { render, screen } from '@/test-utils'
import { EmissionsChart } from '@/components/dashboard/charts/EmissionsChart'
import { environmentData } from '@/lib/data/rse-data'

const mockEmissionsData = [
  { year: 2019, scope1: 1234, scope2: 5678, scope3: 9012 },
  { year: 2020, scope1: 1200, scope2: 5500, scope3: 8800 },
  { year: 2021, scope1: 1150, scope2: 5300, scope3: 8500 },
  { year: 2022, scope1: 1100, scope2: 5000, scope3: 8200 },
  { year: 2023, scope1: 1050, scope2: 4800, scope3: 8000 },
  { year: 2024, scope1: 1000, scope2: 4500, scope3: 7800 },
]

describe('EmissionsChart', () => {
  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders LineChart with emissions data', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      const chart = screen.getByTestId('line-chart')
      expect(chart).toBeInTheDocument()

      // Verify data is passed
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(mockEmissionsData.length)
    })

    it('renders 3 Line components for scopes', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      expect(screen.getByTestId('line-scope1')).toBeInTheDocument()
      expect(screen.getByTestId('line-scope2')).toBeInTheDocument()
      expect(screen.getByTestId('line-scope3')).toBeInTheDocument()
    })

    it('renders XAxis with year dataKey', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toBeInTheDocument()
      expect(xaxis).toHaveAttribute('data-key', 'year')
    })

    it('renders YAxis', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      expect(screen.getByTestId('yaxis')).toBeInTheDocument()
    })

    it('renders CartesianGrid', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Legend', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('accepts emissions data as prop', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      const chart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(mockEmissionsData)
    })

    it('renders with environmentData.emissions from rse-data', () => {
      render(<EmissionsChart data={environmentData.emissions} />)
      const chart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(environmentData.emissions)
    })

    it('handles data with correct structure', () => {
      const data = [
        { year: 2023, scope1: 100, scope2: 200, scope3: 300 },
      ]
      render(<EmissionsChart data={data} />)
      const chart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData[0]).toHaveProperty('year')
      expect(chartData[0]).toHaveProperty('scope1')
      expect(chartData[0]).toHaveProperty('scope2')
      expect(chartData[0]).toHaveProperty('scope3')
    })

    it('validates environmentData.emissions structure', () => {
      expect(environmentData.emissions).toHaveLength(6)
      expect(environmentData.emissions[0]).toHaveProperty('year')
      expect(environmentData.emissions[0]).toHaveProperty('scope1')
      expect(environmentData.emissions[0]).toHaveProperty('scope2')
      expect(environmentData.emissions[0]).toHaveProperty('scope3')
    })

    it('handles empty data array', () => {
      render(<EmissionsChart data={[]} />)
      const chart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toHaveLength(0)
    })
  })

  describe('Visual Styling', () => {
    it('applies red stroke color to Scope 1 line (#EF4444)', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      const scope1Line = screen.getByTestId('line-scope1')

      expect(scope1Line).toHaveAttribute('data-stroke', '#EF4444')
    })

    it('applies yellow stroke color to Scope 2 line (#F8B500)', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      const scope2Line = screen.getByTestId('line-scope2')

      expect(scope2Line).toHaveAttribute('data-stroke', '#F8B500')
    })

    it('applies green stroke color to Scope 3 line (#10B981)', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      const scope3Line = screen.getByTestId('line-scope3')

      expect(scope3Line).toHaveAttribute('data-stroke', '#10B981')
    })

    it('applies distinct colors to all scope lines', () => {
      render(<EmissionsChart data={mockEmissionsData} />)
      const scope1Line = screen.getByTestId('line-scope1')
      const scope2Line = screen.getByTestId('line-scope2')
      const scope3Line = screen.getByTestId('line-scope3')

      const color1 = scope1Line.getAttribute('data-stroke')
      const color2 = scope2Line.getAttribute('data-stroke')
      const color3 = scope3Line.getAttribute('data-stroke')

      expect(color1).not.toBe(color2)
      expect(color2).not.toBe(color3)
      expect(color1).not.toBe(color3)
    })
  })

  describe('Props Validation', () => {
    it('requires data prop', () => {
      // TypeScript ensures data prop is required
      expect(() => {
        render(<EmissionsChart data={mockEmissionsData} />)
      }).not.toThrow()
    })

    it('handles multiple years of data', () => {
      const multiYearData = [
        { year: 2020, scope1: 1000, scope2: 2000, scope3: 3000 },
        { year: 2021, scope1: 900, scope2: 1900, scope3: 2900 },
        { year: 2022, scope1: 800, scope2: 1800, scope3: 2800 },
        { year: 2023, scope1: 700, scope2: 1700, scope3: 2700 },
        { year: 2024, scope1: 600, scope2: 1600, scope3: 2600 },
      ]

      render(<EmissionsChart data={multiYearData} />)
      const chart = screen.getByTestId('line-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toHaveLength(5)
      expect(chartData[0].year).toBe(2020)
      expect(chartData[4].year).toBe(2024)
    })
  })
})
