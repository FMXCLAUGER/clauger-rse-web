import { render, screen } from '@/test-utils'
import { BudgetChart } from '@/components/dashboard/charts/BudgetChart'
import { governanceData } from '@/lib/data/rse-data'
import { formatCurrency } from '@/lib/data/rse-data'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data, layout }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-layout={layout}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, name, children }: any) => (
    <div data-testid={`bar-${dataKey}`} data-name={name}>
      {children}
    </div>
  ),
  XAxis: ({ type, tickFormatter }: any) => (
    <div data-testid="xaxis" data-type={type} data-has-formatter={!!tickFormatter} />
  ),
  YAxis: ({ type, dataKey }: any) => <div data-testid="yaxis" data-type={type} data-key={dataKey} />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({ formatter }: any) => <div data-testid="tooltip" data-has-formatter={!!formatter} />,
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
}))

describe('BudgetChart', () => {
  const mockBudgetData = [
    { pillar: 'Environnement', amount: 2500000, percentage: 41.7 },
    { pillar: 'Social', amount: 2000000, percentage: 33.3 },
    { pillar: 'Gouvernance', amount: 1500000, percentage: 25.0 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<BudgetChart data={mockBudgetData} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders horizontal BarChart', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const chart = screen.getByTestId('bar-chart')
      expect(chart).toBeInTheDocument()
      expect(chart).toHaveAttribute('data-layout', 'vertical')
    })

    it('renders BarChart with budget data', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')
      expect(chartData).toHaveLength(mockBudgetData.length)
    })

    it('renders Bar component for amount', () => {
      render(<BudgetChart data={mockBudgetData} />)
      expect(screen.getByTestId('bar-amount')).toBeInTheDocument()
    })

    it('renders Bar with correct name', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const bar = screen.getByTestId('bar-amount')
      expect(bar).toHaveAttribute('data-name', 'Budget')
    })

    it('renders XAxis with number type', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toBeInTheDocument()
      expect(xaxis).toHaveAttribute('data-type', 'number')
    })

    it('renders XAxis with tickFormatter', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toHaveAttribute('data-has-formatter', 'true')
    })

    it('renders YAxis with category type', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const yaxis = screen.getByTestId('yaxis')
      expect(yaxis).toBeInTheDocument()
      expect(yaxis).toHaveAttribute('data-type', 'category')
      expect(yaxis).toHaveAttribute('data-key', 'pillar')
    })

    it('renders CartesianGrid', () => {
      render(<BudgetChart data={mockBudgetData} />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('renders Tooltip', () => {
      render(<BudgetChart data={mockBudgetData} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Tooltip with formatter', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveAttribute('data-has-formatter', 'true')
    })

    it('renders Cell components for each data item', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(mockBudgetData.length)
    })
  })

  describe('Data Handling', () => {
    it('uses governanceData.budget as data source', () => {
      render(<BudgetChart data={governanceData.budget} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(governanceData.budget)
    })

    it('has 3 budget pillars', () => {
      expect(governanceData.budget).toHaveLength(3)
    })

    it('has correct budget structure', () => {
      governanceData.budget.forEach(item => {
        expect(item).toHaveProperty('pillar')
        expect(item).toHaveProperty('amount')
        expect(item).toHaveProperty('percentage')
      })
    })

    it('percentages sum to 100', () => {
      const totalPercentage = governanceData.budget.reduce((sum, item) => sum + item.percentage, 0)
      expect(totalPercentage).toBeCloseTo(100, 1)
    })

    it('accepts custom data prop', () => {
      const customData = [
        { pillar: 'Test1', amount: 1000000, percentage: 50 },
        { pillar: 'Test2', amount: 1000000, percentage: 50 },
      ]
      render(<BudgetChart data={customData} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual(customData)
    })

    it('handles empty data array', () => {
      render(<BudgetChart data={[]} />)
      const chart = screen.getByTestId('bar-chart')
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]')

      expect(chartData).toEqual([])
    })
  })

  describe('Currency Formatting', () => {
    it('uses formatCurrency for amount display', () => {
      const amount = governanceData.budget[0].amount
      const formatted = formatCurrency(amount)
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })

    it('formatCurrency formats amounts correctly', () => {
      const testAmount = 2500000
      const formatted = formatCurrency(testAmount)
      expect(formatted).toContain('2')
      expect(formatted).toContain('€')
    })
  })

  describe('Visual Styling', () => {
    it('Cell components have fill colors', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const cells = screen.getAllByTestId('cell')
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('data-fill')
        expect(cell.getAttribute('data-fill')).toBeTruthy()
      })
    })

    it('uses correct color scheme', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const cells = screen.getAllByTestId('cell')
      const expectedColors = ['#10B981', '#0088CC', '#F8B500']

      cells.forEach((cell, index) => {
        expect(cell).toHaveAttribute('data-fill', expectedColors[index])
      })
    })

    it('cycles colors for data longer than color array', () => {
      const longData = [
        ...mockBudgetData,
        { pillar: 'Extra1', amount: 1000000, percentage: 10 },
      ]
      render(<BudgetChart data={longData} />)
      const cells = screen.getAllByTestId('cell')

      // Fourth item should cycle back to first color
      expect(cells[3]).toHaveAttribute('data-fill', '#10B981')
    })
  })

  describe('Layout Configuration', () => {
    it('uses vertical layout', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const chart = screen.getByTestId('bar-chart')
      expect(chart).toHaveAttribute('data-layout', 'vertical')
    })

    it('XAxis is number type for vertical layout', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const xaxis = screen.getByTestId('xaxis')
      expect(xaxis).toHaveAttribute('data-type', 'number')
    })

    it('YAxis is category type for vertical layout', () => {
      render(<BudgetChart data={mockBudgetData} />)
      const yaxis = screen.getByTestId('yaxis')
      expect(yaxis).toHaveAttribute('data-type', 'category')
    })
  })
})
