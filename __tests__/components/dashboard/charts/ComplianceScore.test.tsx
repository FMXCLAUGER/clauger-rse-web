import { render, screen } from '@/test-utils'
import { ComplianceScore } from '@/components/dashboard/charts/ComplianceScore'
import { governanceData } from '@/lib/data/rse-data'

describe('ComplianceScore', () => {
  describe('Rendering', () => {
    it('renders all compliance areas', () => {
      render(<ComplianceScore data={governanceData.compliance} />)

      governanceData.compliance.forEach(item => {
        expect(screen.getByText(item.area)).toBeInTheDocument()
      })
    })

    it('displays area names correctly', () => {
      render(<ComplianceScore data={governanceData.compliance} />)

      const areaNames = governanceData.compliance.map(c => c.area)
      areaNames.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })

    it('displays score as fraction', () => {
      render(<ComplianceScore data={governanceData.compliance} />)

      governanceData.compliance.forEach(item => {
        const fractionText = `${item.score}/${item.maxScore}`
        expect(screen.getByText(fractionText)).toBeInTheDocument()
      })
    })

    it('displays compliance percentage', () => {
      render(<ComplianceScore data={governanceData.compliance} />)

      governanceData.compliance.forEach(item => {
        const percentage = ((item.score / item.maxScore) * 100).toFixed(1)
        const conformityText = `Conformité: ${percentage}%`
        expect(screen.getByText(conformityText)).toBeInTheDocument()
      })
    })

    it('renders labels for each compliance area', () => {
      render(<ComplianceScore data={governanceData.compliance} />)

      const labels = screen.getAllByText(/Excellent|Bon|Moyen|À améliorer/)
      expect(labels).toHaveLength(governanceData.compliance.length)
    })
  })

  describe('Data Handling', () => {
    it('uses governanceData.compliance as data source', () => {
      expect(governanceData.compliance).toBeDefined()
      expect(governanceData.compliance).toHaveLength(5) // 5 compliance areas
    })

    it('has correct compliance structure', () => {
      governanceData.compliance.forEach(item => {
        expect(item).toHaveProperty('area')
        expect(item).toHaveProperty('score')
        expect(item).toHaveProperty('maxScore')
      })
    })

    it('calculates percentage correctly', () => {
      governanceData.compliance.forEach(item => {
        const percentage = (item.score / item.maxScore) * 100
        expect(percentage).toBeGreaterThanOrEqual(0)
        expect(percentage).toBeLessThanOrEqual(100)
      })
    })

    it('handles empty data array', () => {
      const { container } = render(<ComplianceScore data={[]} />)

      expect(container.querySelector('.space-y-6')).toBeInTheDocument()
      expect(container.querySelector('.space-y-6')?.children).toHaveLength(0)
    })
  })

  describe('Score Labels', () => {
    it('displays "Excellent" for scores ≥90%', () => {
      const testData = [
        { area: 'Test Area 1', score: 90, maxScore: 100 },
        { area: 'Test Area 2', score: 95, maxScore: 100 },
        { area: 'Test Area 3', score: 100, maxScore: 100 }
      ]

      render(<ComplianceScore data={testData} />)

      const labels = screen.getAllByText('Excellent')
      expect(labels).toHaveLength(3)
    })

    it('displays "Bon" for scores 75-89%', () => {
      const testData = [
        { area: 'Test Area 1', score: 75, maxScore: 100 },
        { area: 'Test Area 2', score: 80, maxScore: 100 },
        { area: 'Test Area 3', score: 89, maxScore: 100 }
      ]

      render(<ComplianceScore data={testData} />)

      const labels = screen.getAllByText('Bon')
      expect(labels).toHaveLength(3)
    })

    it('displays "Moyen" for scores 50-74%', () => {
      const testData = [
        { area: 'Test Area 1', score: 50, maxScore: 100 },
        { area: 'Test Area 2', score: 60, maxScore: 100 },
        { area: 'Test Area 3', score: 74, maxScore: 100 }
      ]

      render(<ComplianceScore data={testData} />)

      const labels = screen.getAllByText('Moyen')
      expect(labels).toHaveLength(3)
    })

    it('displays "À améliorer" for scores <50%', () => {
      const testData = [
        { area: 'Test Area 1', score: 0, maxScore: 100 },
        { area: 'Test Area 2', score: 25, maxScore: 100 },
        { area: 'Test Area 3', score: 49, maxScore: 100 }
      ]

      render(<ComplianceScore data={testData} />)

      const labels = screen.getAllByText('À améliorer')
      expect(labels).toHaveLength(3)
    })
  })

  describe('Badge Colors', () => {
    it('applies green background for high scores (≥90%)', () => {
      const testData = [
        { area: 'Test Area', score: 95, maxScore: 100 }
      ]

      const { container } = render(<ComplianceScore data={testData} />)

      const badge = container.querySelector('.bg-\\[\\#10B981\\]')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Excellent')
    })

    it('applies yellow background for medium scores (75-89%)', () => {
      const testData = [
        { area: 'Test Area', score: 80, maxScore: 100 }
      ]

      const { container } = render(<ComplianceScore data={testData} />)

      const badge = container.querySelector('.bg-\\[\\#F8B500\\]')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Bon')
    })

    it('applies red background for low scores (<75%)', () => {
      const testData = [
        { area: 'Test Area', score: 50, maxScore: 100 }
      ]

      const { container } = render(<ComplianceScore data={testData} />)

      const badge = container.querySelector('.bg-\\[\\#EF4444\\]')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Moyen')
    })
  })

  describe('Progress Bars', () => {
    it('renders progress bar for each compliance area', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const progressBars = container.querySelectorAll('.bg-\\[\\#E5E7EB\\]')
      expect(progressBars).toHaveLength(governanceData.compliance.length)
    })

    it('progress bar width matches percentage', () => {
      const testData = [
        { area: 'Test Area 1', score: 50, maxScore: 100 },
        { area: 'Test Area 2', score: 75, maxScore: 100 },
        { area: 'Test Area 3', score: 100, maxScore: 100 }
      ]

      const { container } = render(<ComplianceScore data={testData} />)

      const progressBars = container.querySelectorAll('[style*="width"]')
      expect(progressBars[0]).toHaveStyle({ width: '50%' })
      expect(progressBars[1]).toHaveStyle({ width: '75%' })
      expect(progressBars[2]).toHaveStyle({ width: '100%' })
    })

    it('applies correct color to progress bar based on score', () => {
      const testData = [
        { area: 'High Score', score: 95, maxScore: 100 },
        { area: 'Medium Score', score: 80, maxScore: 100 },
        { area: 'Low Score', score: 50, maxScore: 100 }
      ]

      const { container } = render(<ComplianceScore data={testData} />)

      const progressFills = container.querySelectorAll('[class*="absolute"][class*="bg-"]')

      // Check green for high score
      expect(progressFills[0]).toHaveClass('bg-[#10B981]')

      // Check yellow for medium score
      expect(progressFills[1]).toHaveClass('bg-[#F8B500]')

      // Check red for low score
      expect(progressFills[2]).toHaveClass('bg-[#EF4444]')
    })

    it('has rounded corners on progress bars', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const progressContainers = container.querySelectorAll('.rounded-full')
      expect(progressContainers.length).toBeGreaterThan(0)
    })

    it('has transition animation on progress bars', () => {
      const testData = [
        { area: 'Test Area', score: 75, maxScore: 100 }
      ]

      const { container } = render(<ComplianceScore data={testData} />)

      const progressFill = container.querySelector('[class*="transition-all"]')
      expect(progressFill).toBeInTheDocument()
      expect(progressFill).toHaveClass('duration-500')
      expect(progressFill).toHaveClass('ease-out')
    })
  })

  describe('Styling', () => {
    it('applies correct text colors for area names', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const areaNames = container.querySelectorAll('.text-\\[\\#333333\\]')
      expect(areaNames).toHaveLength(governanceData.compliance.length)
    })

    it('applies correct text colors for scores', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const scores = container.querySelectorAll('.text-\\[\\#0088CC\\]')
      expect(scores).toHaveLength(governanceData.compliance.length)
    })

    it('applies correct text colors for conformity labels', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const conformityLabels = container.querySelectorAll('.text-\\[\\#666666\\]')
      expect(conformityLabels).toHaveLength(governanceData.compliance.length)
    })

    it('uses tabular-nums for score consistency', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const scores = container.querySelectorAll('.tabular-nums')
      expect(scores).toHaveLength(governanceData.compliance.length)
    })
  })

  describe('Layout', () => {
    it('spaces items correctly', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const mainContainer = container.querySelector('.space-y-6')
      expect(mainContainer).toBeInTheDocument()
    })

    it('arranges header elements horizontally', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const headers = container.querySelectorAll('.flex.items-center.justify-between')
      expect(headers).toHaveLength(governanceData.compliance.length)
    })

    it('groups score and badge together', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const scoreGroups = container.querySelectorAll('.flex.items-center.gap-3')
      expect(scoreGroups).toHaveLength(governanceData.compliance.length)
    })
  })

  describe('Edge Cases', () => {
    it('handles score of 0', () => {
      const testData = [
        { area: 'Test Area', score: 0, maxScore: 100 }
      ]

      render(<ComplianceScore data={testData} />)

      expect(screen.getByText('0/100')).toBeInTheDocument()
      expect(screen.getByText('Conformité: 0.0%')).toBeInTheDocument()
      expect(screen.getByText('À améliorer')).toBeInTheDocument()
    })

    it('handles perfect score', () => {
      const testData = [
        { area: 'Test Area', score: 100, maxScore: 100 }
      ]

      render(<ComplianceScore data={testData} />)

      expect(screen.getByText('100/100')).toBeInTheDocument()
      expect(screen.getByText('Conformité: 100.0%')).toBeInTheDocument()
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('handles non-100 maxScore', () => {
      const testData = [
        { area: 'Test Area', score: 45, maxScore: 50 }
      ]

      render(<ComplianceScore data={testData} />)

      expect(screen.getByText('45/50')).toBeInTheDocument()
      expect(screen.getByText('Conformité: 90.0%')).toBeInTheDocument()
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('formats decimal percentages with one decimal place', () => {
      const testData = [
        { area: 'Test Area', score: 33, maxScore: 100 }
      ]

      render(<ComplianceScore data={testData} />)

      expect(screen.getByText('Conformité: 33.0%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(<ComplianceScore data={governanceData.compliance} />)

      const divElements = container.querySelectorAll('div')
      expect(divElements.length).toBeGreaterThan(0)
    })

    it('provides readable text content', () => {
      render(<ComplianceScore data={governanceData.compliance} />)

      governanceData.compliance.forEach(item => {
        expect(screen.getByText(item.area)).toBeInTheDocument()
      })
    })

    it('has visible labels for all scores', () => {
      render(<ComplianceScore data={governanceData.compliance} />)

      const labels = screen.getAllByText(/Excellent|Bon|Moyen|À améliorer/)
      expect(labels.length).toBe(governanceData.compliance.length)
    })
  })
})
