import { describe, it, expect } from '@jest/globals'
import { render } from '@testing-library/react'
import { ChartSkeleton } from '@/components/dashboard/ChartSkeleton'

describe('ChartSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ChartSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders loading spinner', () => {
      const { container } = render(<ChartSkeleton />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('displays "Chargement..." text', () => {
      const { container } = render(<ChartSkeleton />)
      expect(container.textContent).toContain('Chargement...')
    })

    it('has animate-pulse class on wrapper', () => {
      const { container } = render(<ChartSkeleton />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('animate-pulse')
    })
  })

  describe('Props - height', () => {
    it('uses default height of 300px', () => {
      const { container } = render(<ChartSkeleton />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.height).toBe('300px')
    })

    it('accepts custom height prop', () => {
      const { container } = render(<ChartSkeleton height={400} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.height).toBe('400px')
    })

    it('handles small height values', () => {
      const { container } = render(<ChartSkeleton height={100} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.height).toBe('100px')
    })

    it('handles large height values', () => {
      const { container } = render(<ChartSkeleton height={800} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.height).toBe('800px')
    })
  })

  describe('Props - className', () => {
    it('uses empty className by default', () => {
      const { container } = render(<ChartSkeleton />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('w-full')
      expect(wrapper.className).toContain('animate-pulse')
    })

    it('accepts custom className prop', () => {
      const { container } = render(<ChartSkeleton className="custom-class" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })

    it('preserves base classes with custom className', () => {
      const { container } = render(<ChartSkeleton className="extra" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('w-full')
      expect(wrapper.className).toContain('animate-pulse')
      expect(wrapper.className).toContain('extra')
    })
  })

  describe('Dark Mode Support', () => {
    it('has dark mode background classes', () => {
      const { container } = render(<ChartSkeleton />)
      const bg = container.querySelector('.dark\\:bg-gray-700')
      expect(bg).toBeInTheDocument()
    })

    it('has dark mode spinner border classes', () => {
      const { container } = render(<ChartSkeleton />)
      const spinner = container.querySelector('.dark\\:border-gray-600')
      expect(spinner).toBeInTheDocument()
    })

    it('has dark mode text classes', () => {
      const { container } = render(<ChartSkeleton />)
      const text = container.querySelector('.dark\\:text-gray-400')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('has full width', () => {
      const { container } = render(<ChartSkeleton />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('w-full')
    })

    it('has rounded corners on background', () => {
      const { container } = render(<ChartSkeleton />)
      const bg = container.querySelector('.rounded-lg')
      expect(bg).toBeInTheDocument()
    })

    it('centers content with flex', () => {
      const { container } = render(<ChartSkeleton />)
      const bg = container.querySelector('.flex.items-center.justify-center')
      expect(bg).toBeInTheDocument()
    })
  })

  describe('Spinner', () => {
    it('has rounded-full class', () => {
      const { container } = render(<ChartSkeleton />)
      const spinner = container.querySelector('.rounded-full')
      expect(spinner).toBeInTheDocument()
    })

    it('has animate-spin class', () => {
      const { container } = render(<ChartSkeleton />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('has border styling', () => {
      const { container } = render(<ChartSkeleton />)
      const spinner = container.querySelector('.border-4')
      expect(spinner).toBeInTheDocument()
    })

    it('has width and height classes', () => {
      const { container } = render(<ChartSkeleton />)
      const spinner = container.querySelector('.w-12.h-12')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Text', () => {
    it('has medium font weight', () => {
      const { container } = render(<ChartSkeleton />)
      const text = container.querySelector('.font-medium')
      expect(text).toBeInTheDocument()
    })

    it('has small text size', () => {
      const { container } = render(<ChartSkeleton />)
      const text = container.querySelector('.text-sm')
      expect(text).toBeInTheDocument()
    })

    it('has gray text color', () => {
      const { container } = render(<ChartSkeleton />)
      const text = container.querySelector('.text-gray-500')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains visual hierarchy', () => {
      const { container } = render(<ChartSkeleton />)
      const wrapper = container.querySelector('.flex-col')
      expect(wrapper).toBeInTheDocument()
    })

    it('groups spinner and text together', () => {
      const { container } = render(<ChartSkeleton />)
      const group = container.querySelector('.gap-3')
      expect(group).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works with multiple instances', () => {
      const { container } = render(
        <>
          <ChartSkeleton height={200} />
          <ChartSkeleton height={300} />
          <ChartSkeleton height={400} />
        </>
      )
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(3)
    })

    it('handles zero height', () => {
      const { container } = render(<ChartSkeleton height={0} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.height).toBe('0px')
    })
  })
})
