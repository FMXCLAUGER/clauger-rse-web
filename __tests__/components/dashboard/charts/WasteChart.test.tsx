import { render, screen } from '@/test-utils'
import { WasteChart } from '@/components/dashboard/charts/WasteChart'
import { environmentData } from '@/lib/data/rse-data'

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

describe('WasteChart', () => {
  describe('Rendering', () => {
    it('renders ResponsiveContainer', () => {
      render(<WasteChart data={environmentData.waste} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders PieChart', () => {
      render(<WasteChart data={environmentData.waste} />)
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('renders Pie component with waste data', () => {
      render(<WasteChart data={environmentData.waste} />)
      const pie = screen.getByTestId('pie')
      expect(pie).toBeInTheDocument()

      const pieData = JSON.parse(pie.getAttribute('data-pie-data') || '[]')
      expect(pieData).toHaveLength(3) // recycled, incinerated, landfill
    })

    it('renders 3 Cell components for waste categories', () => {
      render(<WasteChart data={environmentData.waste} />)
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(3)
    })

    it('renders Tooltip', () => {
      render(<WasteChart data={environmentData.waste} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders Legend', () => {
      render(<WasteChart data={environmentData.waste} />)
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('uses environmentData.waste as data source', () => {
      render(<WasteChart data={environmentData.waste} />)
      const pie = screen.getByTestId('pie')
      const pieData = JSON.parse(pie.getAttribute('data-pie-data') || '[]')

      // Should have 3 categories
      expect(pieData).toHaveLength(3)
    })

    it('has correct waste categories', () => {
      const waste = environmentData.waste
      expect(waste).toHaveProperty('recycled')
      expect(waste).toHaveProperty('incinerated')
      expect(waste).toHaveProperty('landfill')
    })

    it('waste percentages sum to 100', () => {
      const { recycled, incinerated, landfill } = environmentData.waste
      const total = recycled + incinerated + landfill
      expect(total).toBeCloseTo(100, 1) // Allow small floating point variance
    })

    it('transforms waste data to chart format with correct labels', () => {
      render(<WasteChart data={environmentData.waste} />)
      const pie = screen.getByTestId('pie')
      const pieData = JSON.parse(pie.getAttribute('data-pie-data') || '[]')

      expect(pieData[0]).toMatchObject({
        name: 'Recyclé',
        value: environmentData.waste.recycled,
      })
      expect(pieData[1]).toMatchObject({
        name: 'Incinéré',
        value: environmentData.waste.incinerated,
      })
      expect(pieData[2]).toMatchObject({
        name: 'Enfouissement',
        value: environmentData.waste.landfill,
      })
    })
  })

  describe('Visual Styling', () => {
    it('applies different colors to each waste category', () => {
      render(<WasteChart data={environmentData.waste} />)
      const cells = screen.getAllByTestId('cell')

      const colors = cells.map(cell => cell.getAttribute('data-fill'))

      // All cells should have fill colors
      colors.forEach(color => {
        expect(color).toBeTruthy()
      })

      // Colors should be different (at least 2 unique colors)
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBeGreaterThan(1)
    })

    it('applies correct color scheme to waste categories', () => {
      render(<WasteChart data={environmentData.waste} />)
      const cells = screen.getAllByTestId('cell')

      expect(cells[0].getAttribute('data-fill')).toBe('#10B981') // Recycled - green
      expect(cells[1].getAttribute('data-fill')).toBe('#F59E0B') // Incinerated - amber
      expect(cells[2].getAttribute('data-fill')).toBe('#EF4444') // Landfill - red
    })
  })
})
