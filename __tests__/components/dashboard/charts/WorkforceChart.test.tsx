import { render, screen } from '@/test-utils'
import { WorkforceChart } from '@/components/dashboard/charts/WorkforceChart'
import { socialData } from '@/lib/data/rse-data'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children, data }: any) => <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}><svg>{children}</svg></div>,
  Area: ({ dataKey, fill, stroke, name }: any) => <div data-testid={`area-${dataKey}`} data-fill={fill} data-stroke={stroke} data-name={name} />,
  XAxis: ({ dataKey }: any) => <div data-testid="xaxis" data-key={dataKey} />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  defs: ({ children }: any) => <defs data-testid="defs">{children}</defs>,
  linearGradient: ({ id, children }: any) => <linearGradient data-testid={`gradient-${id}`}>{children}</linearGradient>,
  stop: ({ offset, stopColor }: any) => <stop data-testid="gradient-stop" offset={offset} stopColor={stopColor} />,
}))

describe('WorkforceChart', () => {
  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders AreaChart with workforce data', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const chart = screen.getByTestId('area-chart')
      expect(chart).toBeInTheDocument()

      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(socialData.workforce.length)
    })

    it('renders 2 Area components for men and women', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      expect(screen.getByTestId('area-men')).toBeInTheDocument()
      expect(screen.getByTestId('area-women')).toBeInTheDocument()
    })

    it('renders XAxis with year dataKey', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toBeInTheDocument()
      expect(xaxis).toHaveAttribute('data-key', 'year')
    })

    it('renders YAxis', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      expect(screen.getByTestId('yaxis')).toBeInTheDocument()
    })

    it('renders CartesianGrid', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Legend', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('uses provided data as data source', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const chart = screen.getByTestId('area-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(socialData.workforce)
    })

    it('has correct workforce data structure', () => {
      expect(socialData.workforce).toHaveLength(6) // 6 years
      socialData.workforce.forEach(item => {
        expect(item).toHaveProperty('year')
        expect(item).toHaveProperty('total')
        expect(item).toHaveProperty('men')
        expect(item).toHaveProperty('women')
      })
    })

    it('total equals sum of men and women', () => {
      socialData.workforce.forEach(item => {
        expect(item.total).toBe(item.men + item.women)
      })
    })

    it('renders with empty data array', () => {
      render(<WorkforceChart data={[]} />)
      const chart = screen.getByTestId('area-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual([])
      expect(chartData).toHaveLength(0)
    })

    it('renders with single data point', () => {
      const singleData = [{ year: 2019, total: 1000, men: 700, women: 300 }]
      render(<WorkforceChart data={singleData} />)
      const chart = screen.getByTestId('area-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(singleData)
      expect(chartData).toHaveLength(1)
    })
  })

  describe('Visual Styling', () => {
    it('applies gradient fills to areas', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const menArea = screen.getByTestId('area-men')
      const womenArea = screen.getByTestId('area-women')

      // Both should have fill attributes (gradients)
      expect(menArea).toHaveAttribute('data-fill')
      expect(womenArea).toHaveAttribute('data-fill')
    })

    it('uses different colors for men and women', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const menArea = screen.getByTestId('area-men')
      const womenArea = screen.getByTestId('area-women')

      const menFill = menArea.getAttribute('data-fill')
      const womenFill = womenArea.getAttribute('data-fill')

      // Should have different fills
      expect(menFill).not.toBe(womenFill)
    })

    it('men area uses colorMen gradient', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const menArea = screen.getByTestId('area-men')

      expect(menArea).toHaveAttribute('data-fill', 'url(#colorMen)')
    })

    it('women area uses colorWomen gradient', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const womenArea = screen.getByTestId('area-women')

      expect(womenArea).toHaveAttribute('data-fill', 'url(#colorWomen)')
    })

    it('men area uses blue stroke color', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const menArea = screen.getByTestId('area-men')

      expect(menArea).toHaveAttribute('data-stroke', '#0088CC')
    })

    it('women area uses yellow stroke color', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const womenArea = screen.getByTestId('area-women')

      expect(womenArea).toHaveAttribute('data-stroke', '#F8B500')
    })

    it('men area has correct name label', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const menArea = screen.getByTestId('area-men')

      expect(menArea).toHaveAttribute('data-name', 'Hommes')
    })

    it('women area has correct name label', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const womenArea = screen.getByTestId('area-women')

      expect(womenArea).toHaveAttribute('data-name', 'Femmes')
    })
  })

  describe('Visual Styling', () => {
    it('areas use gradient fills', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const menArea = screen.getByTestId('area-men')
      const womenArea = screen.getByTestId('area-women')

      // Check that areas use URL gradient references
      expect(menArea).toHaveAttribute('data-fill', 'url(#colorMen)')
      expect(womenArea).toHaveAttribute('data-fill', 'url(#colorWomen)')
    })

    it('areas have stroke colors', () => {
      render(<WorkforceChart data={socialData.workforce} />)
      const menArea = screen.getByTestId('area-men')
      const womenArea = screen.getByTestId('area-women')

      expect(menArea).toHaveAttribute('data-stroke')
      expect(womenArea).toHaveAttribute('data-stroke')
    })
  })
})
