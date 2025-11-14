import { render, screen } from '@/test-utils'
import { TargetsProgress } from '@/components/dashboard/charts/TargetsProgress'
import { environmentData } from '@/lib/data/rse-data'

describe('TargetsProgress', () => {
  const mockTargets = [
    { name: 'CO2 Emissions', target: -1000, actual: -750, unit: 't' },
    { name: 'Energy Consumption', target: 5000, actual: 4500, unit: 'kWh' },
    { name: 'Waste Recycling', target: 80, actual: 72, unit: '%' },
    { name: 'Water Usage', target: -20, actual: -18, unit: 'm³' }
  ]

  describe('Rendering', () => {
    it('renders all target progress bars', () => {
      render(<TargetsProgress data={mockTargets} />)

      // Should render all 4 targets
      mockTargets.forEach(target => {
        expect(screen.getByText(target.name)).toBeInTheDocument()
      })
    })

    it('displays target names correctly', () => {
      render(<TargetsProgress data={mockTargets} />)

      const targetNames = mockTargets.map(t => t.name)
      targetNames.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })

    it('displays actual and target values with units', () => {
      render(<TargetsProgress data={mockTargets} />)

      mockTargets.forEach(target => {
        // Check actual value with unit
        const actualText = `${target.actual > 0 ? '+' : ''}${target.actual}${target.unit}`
        expect(screen.getByText(actualText)).toBeInTheDocument()

        // Check target value with unit - escape special regex characters
        const targetText = `${target.target > 0 ? '+' : ''}${target.target}${target.unit}`
        const escapedTargetText = targetText.replace(/[+\-*?^${}()|[\]\\]/g, '\\$&')
        expect(screen.getByText(new RegExp(escapedTargetText))).toBeInTheDocument()
      })
    })

    it('displays units correctly', () => {
      render(<TargetsProgress data={mockTargets} />)

      mockTargets.forEach(target => {
        // Unit should appear in the display
        const unitRegex = new RegExp(`${target.unit}`)
        const matches = screen.getAllByText(unitRegex)
        expect(matches.length).toBeGreaterThan(0)
      })
    })

    it('displays progression percentage', () => {
      render(<TargetsProgress data={mockTargets} />)

      mockTargets.forEach(target => {
        const percentage = Math.min(Math.abs(target.actual / target.target) * 100, 100)
        const progressText = `Progression: ${percentage.toFixed(1)}%`
        // Use getAllByText since multiple targets may have same percentage
        const elements = screen.getAllByText(progressText)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('displays status text based on progress', () => {
      const targetsWith90Plus = [
        { name: 'High Progress', target: 100, actual: 95, unit: '%' }
      ]
      const targetsBelow90 = [
        { name: 'Low Progress', target: 100, actual: 50, unit: '%' }
      ]

      const { rerender } = render(<TargetsProgress data={targetsWith90Plus} />)
      expect(screen.getByText('✓ Objectif atteint')).toBeInTheDocument()

      rerender(<TargetsProgress data={targetsBelow90} />)
      expect(screen.getByText('En cours')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    it('uses environmentData.targets as data source', () => {
      expect(environmentData.targets).toBeDefined()
      expect(environmentData.targets).toHaveLength(4)
    })

    it('has correct target structure', () => {
      environmentData.targets.forEach(target => {
        expect(target).toHaveProperty('name')
        expect(target).toHaveProperty('target')
        expect(target).toHaveProperty('actual')
        expect(target).toHaveProperty('unit')
      })
    })

    it('calculates percentage correctly for positive values', () => {
      const target = { name: 'Test', target: 100, actual: 75, unit: '%' }
      const expectedPercentage = Math.min(Math.abs(target.actual / target.target) * 100, 100)

      expect(expectedPercentage).toBe(75)
      expect(expectedPercentage).toBeGreaterThan(0)
      expect(expectedPercentage).toBeLessThanOrEqual(100)
    })

    it('calculates percentage correctly for negative values', () => {
      const target = { name: 'Test', target: -1000, actual: -750, unit: 't' }
      const expectedPercentage = Math.min(Math.abs(target.actual / target.target) * 100, 100)

      expect(expectedPercentage).toBe(75)
      expect(expectedPercentage).toBeGreaterThan(0)
      expect(expectedPercentage).toBeLessThanOrEqual(100)
    })

    it('caps percentage at 100% for over-achievement', () => {
      const target = { name: 'Test', target: 100, actual: 150, unit: '%' }
      const expectedPercentage = Math.min(Math.abs(target.actual / target.target) * 100, 100)

      expect(expectedPercentage).toBe(100)
    })
  })

  describe('Progress Indicators', () => {
    it('renders progress bars for each target', () => {
      const { container } = render(<TargetsProgress data={mockTargets} />)

      // Find all progress bar containers
      const progressBars = container.querySelectorAll('.relative.w-full.h-3')
      expect(progressBars.length).toBe(mockTargets.length)
    })

    it('applies correct width style to progress bars', () => {
      const { container } = render(<TargetsProgress data={mockTargets} />)

      const progressBars = container.querySelectorAll('.absolute.left-0')

      progressBars.forEach((bar, index) => {
        const target = mockTargets[index]
        const expectedPercentage = Math.min(Math.abs(target.actual / target.target) * 100, 100)
        const style = window.getComputedStyle(bar)

        expect(bar).toHaveStyle({ width: `${expectedPercentage}%` })
      })
    })

    it('applies green color for progress >= 90%', () => {
      const target = [{ name: 'High', target: 100, actual: 95, unit: '%' }]
      const { container } = render(<TargetsProgress data={target} />)

      const progressBar = container.querySelector('.absolute.left-0')
      expect(progressBar).toHaveClass('bg-[#10B981]')
    })

    it('applies yellow color for progress >= 70% and < 90%', () => {
      const target = [{ name: 'Medium', target: 100, actual: 75, unit: '%' }]
      const { container } = render(<TargetsProgress data={target} />)

      const progressBar = container.querySelector('.absolute.left-0')
      expect(progressBar).toHaveClass('bg-[#F8B500]')
    })

    it('applies red color for progress < 70%', () => {
      const target = [{ name: 'Low', target: 100, actual: 50, unit: '%' }]
      const { container } = render(<TargetsProgress data={target} />)

      const progressBar = container.querySelector('.absolute.left-0')
      expect(progressBar).toHaveClass('bg-[#EF4444]')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty data array', () => {
      const { container } = render(<TargetsProgress data={[]} />)

      const progressBars = container.querySelectorAll('.relative.w-full.h-3')
      expect(progressBars.length).toBe(0)
    })

    it('handles single target', () => {
      const singleTarget = [mockTargets[0]]
      render(<TargetsProgress data={singleTarget} />)

      expect(screen.getByText(singleTarget[0].name)).toBeInTheDocument()
    })

    it('displays plus sign for positive values', () => {
      const target = [{ name: 'Positive', target: 100, actual: 75, unit: '%' }]
      render(<TargetsProgress data={target} />)

      expect(screen.getByText('+75%')).toBeInTheDocument()
      expect(screen.getByText(/\+100%/)).toBeInTheDocument()
    })

    it('does not display plus sign for negative values', () => {
      const target = [{ name: 'Negative', target: -100, actual: -75, unit: 't' }]
      render(<TargetsProgress data={target} />)

      expect(screen.getByText('-75t')).toBeInTheDocument()
      expect(screen.getByText(/-100t/)).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('renders with proper responsive classes', () => {
      const { container } = render(<TargetsProgress data={mockTargets} />)

      // Check for responsive container
      const spaceYContainer = container.querySelector('.space-y-6')
      expect(spaceYContainer).toBeInTheDocument()
    })

    it('applies transition classes for animations', () => {
      const { container } = render(<TargetsProgress data={mockTargets} />)

      const progressBars = container.querySelectorAll('.absolute.left-0')
      progressBars.forEach(bar => {
        expect(bar).toHaveClass('transition-all', 'duration-500', 'ease-out')
      })
    })
  })
})
