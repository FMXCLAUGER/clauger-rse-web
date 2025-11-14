import { render, screen } from '@/test-utils'
import { ChartCard } from '@/components/dashboard/ChartCard'

jest.mock('@/components/dashboard/ChartSkeleton', () => ({
  ChartSkeleton: ({ height }: any) => (
    <div data-testid="chart-skeleton" data-height={height}>Loading...</div>
  ),
}))

jest.mock('lucide-react', () => ({
  Download: () => <span data-testid="download-icon">Download</span>,
}))

describe('ChartCard', () => {
  const mockOnExport = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with title', () => {
      render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByText('Test Chart')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(
        <ChartCard title="Test Chart" description="Chart description">
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByText('Chart description')).toBeInTheDocument()
    })

    it('renders with icon', () => {
      render(
        <ChartCard title="Test Chart" icon={<span data-testid="custom-icon">Icon</span>}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('renders without icon when not provided', () => {
      render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument()
    })

    it('renders children when not loading', () => {
      render(
        <ChartCard title="Test Chart">
          <div data-testid="chart-content">Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByTestId('chart-content')).toBeInTheDocument()
    })

    it('does not render children when loading', () => {
      render(
        <ChartCard title="Test Chart" isLoading={true}>
          <div data-testid="chart-content">Chart Content</div>
        </ChartCard>
      )
      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = render(
        <ChartCard title="Test Chart" className="custom-class">
          <div>Chart Content</div>
        </ChartCard>
      )
      const article = container.querySelector('article')
      expect(article).toHaveClass('custom-class')
    })

    it('renders as article element', () => {
      const { container } = render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(container.querySelector('article')).toBeInTheDocument()
    })
  })

  describe('Export Button', () => {
    it('renders export button when onExport provided', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByRole('button', { name: /exporter/i })).toBeInTheDocument()
    })

    it('does not render export button when onExport not provided', () => {
      render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.queryByRole('button', { name: /exporter/i })).not.toBeInTheDocument()
    })

    it('calls onExport when export button clicked', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport}>
          <div>Chart Content</div>
        </ChartCard>
      )

      const exportButton = screen.getByRole('button', { name: /exporter/i })
      exportButton.click()

      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })

    it('hides export button when loading', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport} isLoading={true}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.queryByRole('button', { name: /exporter/i })).not.toBeInTheDocument()
    })

    it('renders download icon in export button', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByTestId('download-icon')).toBeInTheDocument()
    })

    it('renders "Export" text in button', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByText('Export')).toBeInTheDocument()
    })

    it('has correct aria-label for accessibility', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport}>
          <div>Chart Content</div>
        </ChartCard>
      )
      const button = screen.getByRole('button', { name: 'Exporter le graphique' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows ChartSkeleton when isLoading=true', () => {
      render(
        <ChartCard title="Test Chart" isLoading={true}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    })

    it('hides ChartSkeleton when isLoading=false', () => {
      render(
        <ChartCard title="Test Chart" isLoading={false}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.queryByTestId('chart-skeleton')).not.toBeInTheDocument()
    })

    it('passes loadingHeight to ChartSkeleton', () => {
      render(
        <ChartCard title="Test Chart" isLoading={true} loadingHeight={400}>
          <div>Chart Content</div>
        </ChartCard>
      )
      const skeleton = screen.getByTestId('chart-skeleton')
      expect(skeleton).toHaveAttribute('data-height', '400')
    })

    it('uses default loadingHeight when not provided', () => {
      render(
        <ChartCard title="Test Chart" isLoading={true}>
          <div>Chart Content</div>
        </ChartCard>
      )
      const skeleton = screen.getByTestId('chart-skeleton')
      expect(skeleton).toHaveAttribute('data-height', '300')
    })

    it('displays title even when loading', () => {
      render(
        <ChartCard title="Test Chart" isLoading={true}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByText('Test Chart')).toBeInTheDocument()
    })

    it('displays description even when loading', () => {
      render(
        <ChartCard title="Test Chart" description="Chart description" isLoading={true}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByText('Chart description')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('title has correct heading level', () => {
      render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      const title = screen.getByText('Test Chart')
      expect(title.tagName).toBe('H3')
    })

    it('has header section with semantic markup', () => {
      const { container } = render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(container.querySelector('header')).toBeInTheDocument()
    })

    it('export button has type="button"', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport}>
          <div>Chart Content</div>
        </ChartCard>
      )
      const button = screen.getByRole('button', { name: /exporter/i })
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Edge Cases', () => {
    it('renders with title only (no description)', () => {
      render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByText('Test Chart')).toBeInTheDocument()
      expect(screen.getByText('Chart Content')).toBeInTheDocument()
    })

    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(100)
      render(
        <ChartCard title={longTitle}>
          <div>Chart Content</div>
        </ChartCard>
      )
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles multiple export button clicks', () => {
      render(
        <ChartCard title="Test Chart" onExport={mockOnExport}>
          <div>Chart Content</div>
        </ChartCard>
      )

      const exportButton = screen.getByRole('button', { name: /exporter/i })
      exportButton.click()
      exportButton.click()
      exportButton.click()

      expect(mockOnExport).toHaveBeenCalledTimes(3)
    })

    it('handles all props together', () => {
      render(
        <ChartCard
          title="Test Chart"
          description="Chart description"
          icon={<span data-testid="icon">Icon</span>}
          onExport={mockOnExport}
          className="custom-class"
          isLoading={false}
          loadingHeight={500}
        >
          <div data-testid="chart-content">Chart Content</div>
        </ChartCard>
      )

      expect(screen.getByText('Test Chart')).toBeInTheDocument()
      expect(screen.getByText('Chart description')).toBeInTheDocument()
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /exporter/i })).toBeInTheDocument()
      expect(screen.getByTestId('chart-content')).toBeInTheDocument()
    })

    it('transitions between loading states', () => {
      const { rerender } = render(
        <ChartCard title="Test Chart" isLoading={true}>
          <div data-testid="chart-content">Chart Content</div>
        </ChartCard>
      )

      expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument()

      rerender(
        <ChartCard title="Test Chart" isLoading={false}>
          <div data-testid="chart-content">Chart Content</div>
        </ChartCard>
      )

      expect(screen.queryByTestId('chart-skeleton')).not.toBeInTheDocument()
      expect(screen.getByTestId('chart-content')).toBeInTheDocument()
    })
  })

  describe('Description Rendering', () => {
    it('does not render description paragraph when description not provided', () => {
      const { container } = render(
        <ChartCard title="Test Chart">
          <div>Chart Content</div>
        </ChartCard>
      )
      const descriptionElement = container.querySelector('p')
      expect(descriptionElement).not.toBeInTheDocument()
    })

    it('renders description as paragraph element', () => {
      render(
        <ChartCard title="Test Chart" description="Chart description">
          <div>Chart Content</div>
        </ChartCard>
      )
      const description = screen.getByText('Chart description')
      expect(description.tagName).toBe('P')
    })
  })
})
