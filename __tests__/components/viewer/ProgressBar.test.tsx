import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from '@/components/viewer/ProgressBar'
import { CLAUGER_COLORS } from '@/lib/design/clauger-colors'

// Helper to convert hex to RGB for color comparisons
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

describe('ProgressBar', () => {
  describe('Rendering', () => {
    it('renders container with all elements', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      expect(container.querySelector('.px-4.py-3')).toBeInTheDocument()
    })

    it('renders vertical bar', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const bar = container.querySelector('.w-1.h-12')
      expect(bar).toBeInTheDocument()
    })

    it('renders progress fill', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const fill = container.querySelector('.absolute.bottom-0')
      expect(fill).toBeInTheDocument()
    })

    it('renders page text', () => {
      render(<ProgressBar currentPage={5} totalPages={10} />)
      expect(screen.getByText('Page 5/10')).toBeInTheDocument()
    })

    it('renders percentage text', () => {
      render(<ProgressBar currentPage={5} totalPages={10} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
  })

  describe('Progress Calculation', () => {
    it('calculates percentage correctly: 1/1 = 100%', () => {
      render(<ProgressBar currentPage={1} totalPages={1} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('calculates percentage correctly: 1/10 = 10%', () => {
      render(<ProgressBar currentPage={1} totalPages={10} />)
      expect(screen.getByText('10%')).toBeInTheDocument()
    })

    it('calculates percentage correctly: 5/10 = 50%', () => {
      render(<ProgressBar currentPage={5} totalPages={10} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('calculates percentage correctly: 10/10 = 100%', () => {
      render(<ProgressBar currentPage={10} totalPages={10} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('rounds percentage: 1/3 = 33% (not 33.333%)', () => {
      render(<ProgressBar currentPage={1} totalPages={3} />)
      expect(screen.getByText('33%')).toBeInTheDocument()
    })

    it('rounds percentage: 2/3 = 67%', () => {
      render(<ProgressBar currentPage={2} totalPages={3} />)
      expect(screen.getByText('67%')).toBeInTheDocument()
    })
  })

  describe('Container Styling', () => {
    it('has correct padding classes', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const wrapper = container.querySelector('.px-4.py-3')
      expect(wrapper).toBeInTheDocument()
    })

    it('has border-b class', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const wrapper = container.querySelector('.border-b')
      expect(wrapper).toBeInTheDocument()
    })

    it('has border color from theme', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.borderColor).toBe(hexToRgb(CLAUGER_COLORS.sidebar.border))
    })
  })

  describe('Progress Bar Container', () => {
    it('has relative positioning', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const bar = container.querySelector('.relative')
      expect(bar).toBeInTheDocument()
    })

    it('has correct width class (w-1)', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const bar = container.querySelector('.w-1')
      expect(bar).toBeInTheDocument()
    })

    it('has correct height class (h-12)', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const bar = container.querySelector('.h-12')
      expect(bar).toBeInTheDocument()
    })

    it('has rounded-full class', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const bar = container.querySelector('.rounded-full')
      expect(bar).toBeInTheDocument()
    })

    it('has overflow-hidden class', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const bar = container.querySelector('.overflow-hidden')
      expect(bar).toBeInTheDocument()
    })

    it('has background color from theme', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const bar = container.querySelector('.w-1.h-12') as HTMLElement
      expect(bar.style.backgroundColor).toBe(hexToRgb(CLAUGER_COLORS.progress.background))
    })
  })

  describe('Progress Fill', () => {
    it('has absolute positioning at bottom-0 left-0', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const fill = container.querySelector('.absolute.bottom-0.left-0')
      expect(fill).toBeInTheDocument()
    })

    it('has full width (w-full)', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const fill = container.querySelector('.absolute.bottom-0.left-0.w-full')
      expect(fill).toBeInTheDocument()
    })

    it('has transition classes', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const fill = container.querySelector('.transition-all.duration-300.ease-out')
      expect(fill).toBeInTheDocument()
    })

    it('height is set to percentage via inline style: 50% for 5/10', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const fill = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(fill.style.height).toBe('50%')
    })

    it('height is set to 100% for page 1/1', () => {
      const { container } = render(<ProgressBar currentPage={1} totalPages={1} />)
      const fill = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(fill.style.height).toBe('100%')
    })

    it('height is set to 10% for page 1/10', () => {
      const { container } = render(<ProgressBar currentPage={1} totalPages={10} />)
      const fill = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(fill.style.height).toBe('10%')
    })

    it('has gradient background from theme', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const fill = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(fill.style.background).toContain('linear-gradient')
      expect(fill.style.background).toContain(CLAUGER_COLORS.progress.gradientStart)
      expect(fill.style.background).toContain(CLAUGER_COLORS.progress.gradientEnd)
    })
  })

  describe('Text Display', () => {
    it('page text has text-xs class', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const pageText = screen.getByText('Page 5/10').closest('p')
      expect(pageText?.className).toContain('text-xs')
    })

    it('page text has font-medium class', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const pageText = screen.getByText('Page 5/10').closest('p')
      expect(pageText?.className).toContain('font-medium')
    })

    it('page text has color from theme', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const pageText = screen.getByText('Page 5/10').closest('p') as HTMLElement
      expect(pageText.style.color).toBe(hexToRgb(CLAUGER_COLORS.progress.text))
    })

    it('percentage text has text-xs class', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const percentText = screen.getByText('50%').closest('p')
      expect(percentText?.className).toContain('text-xs')
    })

    it('percentage text has color from theme', () => {
      const { container } = render(<ProgressBar currentPage={5} totalPages={10} />)
      const percentText = screen.getByText('50%').closest('p') as HTMLElement
      expect(percentText.style.color).toBe(hexToRgb(CLAUGER_COLORS.progress.text))
    })
  })

  describe('Responsive Updates', () => {
    it('progress bar updates when currentPage changes', () => {
      const { rerender } = render(<ProgressBar currentPage={1} totalPages={10} />)
      expect(screen.getByText('Page 1/10')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()

      rerender(<ProgressBar currentPage={5} totalPages={10} />)
      expect(screen.getByText('Page 5/10')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('progress bar updates when totalPages changes', () => {
      const { rerender } = render(<ProgressBar currentPage={5} totalPages={10} />)
      expect(screen.getByText('50%')).toBeInTheDocument()

      rerender(<ProgressBar currentPage={5} totalPages={20} />)
      expect(screen.getByText('25%')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles single page document (1/1)', () => {
      render(<ProgressBar currentPage={1} totalPages={1} />)
      expect(screen.getByText('Page 1/1')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('handles very long documents (page 500/1000)', () => {
      render(<ProgressBar currentPage={500} totalPages={1000} />)
      expect(screen.getByText('Page 500/1000')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('handles percentage rounding (page 1/7 = 14% not 14.285%)', () => {
      render(<ProgressBar currentPage={1} totalPages={7} />)
      expect(screen.getByText('14%')).toBeInTheDocument()
    })
  })
})
