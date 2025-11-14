import { render, screen } from '@/test-utils'
import { BoardCompositionChart } from '@/components/dashboard/charts/BoardCompositionChart'
import { governanceData } from '@/lib/data/rse-data'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, data }: any) => (
    <div data-testid="pie" data-pie-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('BoardCompositionChart', () => {
  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders PieChart', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('renders Pie component with board composition data', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      const pie = screen.getByTestId('pie')
      expect(pie).toBeInTheDocument()

      const pieData = JSON.parse(pie.getAttribute('data-pie-data') || '[]')
      expect(pieData).toHaveLength(governanceData.board.length)
    })

    it('renders Cell components for each category', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(governanceData.board.length)
    })

    it('renders Tooltip', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Legend', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('uses governanceData.board as data source', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      const pie = screen.getByTestId('pie')
      const pieData = JSON.parse(pie.getAttribute('data-pie-data') || '[]')

      expect(pieData).toEqual(governanceData.board)
    })

    it('has 4 board categories', () => {
      expect(governanceData.board).toHaveLength(4)
    })

    it('has correct board composition structure', () => {
      governanceData.board.forEach(item => {
        expect(item).toHaveProperty('category')
        expect(item).toHaveProperty('count')
        expect(item).toHaveProperty('percentage')
      })
    })

    it('board data has count totals', () => {
      const totalCount = governanceData.board.reduce((sum, item) => sum + item.count, 0)
      expect(totalCount).toBeGreaterThan(0)
    })

    it('percentages are valid (between 0 and 100)', () => {
      governanceData.board.forEach(item => {
        expect(item.percentage).toBeGreaterThan(0)
        expect(item.percentage).toBeLessThanOrEqual(100)
      })
    })

    it('each category has count and percentage', () => {
      governanceData.board.forEach(item => {
        expect(item.count).toBeGreaterThan(0)
        expect(item.percentage).toBeGreaterThan(0)
        expect(typeof item.category).toBe('string')
      })
    })
  })

  describe('Visual Styling', () => {
    it('applies different colors to each category', () => {
      render(<BoardCompositionChart data={governanceData.board} />)
      const cells = screen.getAllByTestId('cell')

      const colors = cells.map(cell => cell.getAttribute('data-fill'))

      // All cells should have fill colors
      colors.forEach(color => {
        expect(color).toBeTruthy()
      })

      // Should have multiple unique colors
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBeGreaterThan(1)
    })

    it('applies correct color sequence from COLORS array', () => {
      const COLORS = ["#0088CC", "#F8B500", "#10B981", "#F59E0B"]

      render(<BoardCompositionChart data={governanceData.board} />)
      const cells = screen.getAllByTestId('cell')

      cells.forEach((cell, index) => {
        const expectedColor = COLORS[index % COLORS.length]
        expect(cell.getAttribute('data-fill')).toBe(expectedColor)
      })
    })
  })

  describe('Empty Data', () => {
    it('renders without crashing when data is empty', () => {
      render(<BoardCompositionChart data={[]} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('renders no cells when data is empty', () => {
      render(<BoardCompositionChart data={[]} />)
      const cells = screen.queryAllByTestId('cell')
      expect(cells).toHaveLength(0)
    })
  })

  describe('Custom Data', () => {
    it('handles different data correctly', () => {
      const customData = [
        { category: 'Test A', count: 5, percentage: 50 },
        { category: 'Test B', count: 5, percentage: 50 },
      ]

      render(<BoardCompositionChart data={customData} />)
      const pie = screen.getByTestId('pie')
      const pieData = JSON.parse(pie.getAttribute('data-pie-data') || '[]')

      expect(pieData).toEqual(customData)
      expect(pieData).toHaveLength(2)
    })

    it('renders correct number of cells for custom data', () => {
      const customData = [
        { category: 'Test A', count: 3, percentage: 30 },
        { category: 'Test B', count: 4, percentage: 40 },
        { category: 'Test C', count: 3, percentage: 30 },
      ]

      render(<BoardCompositionChart data={customData} />)
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(3)
    })
  })
})
