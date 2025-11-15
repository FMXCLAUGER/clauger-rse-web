import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { SearchSkeleton } from '@/components/search/SearchSkeleton'

describe('SearchSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SearchSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has animate-pulse on wrapper', () => {
      const { container } = render(<SearchSkeleton />)
      const wrapper = container.querySelector('.animate-pulse')
      expect(wrapper).toBeInTheDocument()
    })

    it('has padding and spacing', () => {
      const { container } = render(<SearchSkeleton />)
      const wrapper = container.querySelector('.p-4.space-y-4')
      expect(wrapper).toBeInTheDocument()
    })

    it('displays loading text', () => {
      render(<SearchSkeleton />)
      expect(screen.getByText("Chargement de l'index de recherche...")).toBeInTheDocument()
    })
  })

  describe('Search Input Skeleton', () => {
    it('renders search input skeleton', () => {
      const { container } = render(<SearchSkeleton />)
      const input = container.querySelector('.h-12.bg-gray-200.dark\\:bg-gray-700.rounded-lg')
      expect(input).toBeInTheDocument()
    })

    it('input skeleton has correct height', () => {
      const { container } = render(<SearchSkeleton />)
      const input = container.querySelector('.h-12')
      expect(input).toBeInTheDocument()
    })

    it('input skeleton has rounded corners', () => {
      const { container } = render(<SearchSkeleton />)
      const input = container.querySelector('.rounded-lg')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Section Filters Skeleton', () => {
    it('renders 5 filter skeletons', () => {
      const { container } = render(<SearchSkeleton />)
      const filters = container.querySelectorAll('.h-8.w-24.rounded-full.shrink-0')
      expect(filters.length).toBe(5)
    })

    it('filters have rounded-full class', () => {
      const { container } = render(<SearchSkeleton />)
      const filter = container.querySelector('.rounded-full.shrink-0')
      expect(filter).toBeInTheDocument()
    })

    it('filters have correct dimensions', () => {
      const { container } = render(<SearchSkeleton />)
      const filter = container.querySelector('.h-8.w-24')
      expect(filter).toBeInTheDocument()
    })

    it('filters container has horizontal scroll', () => {
      const { container } = render(<SearchSkeleton />)
      const filterContainer = container.querySelector('.overflow-x-auto')
      expect(filterContainer).toBeInTheDocument()
    })

    it('filters have gap spacing', () => {
      const { container } = render(<SearchSkeleton />)
      const filterContainer = container.querySelector('.gap-2')
      expect(filterContainer).toBeInTheDocument()
    })
  })

  describe('Results Skeleton', () => {
    it('renders 3 result skeletons', () => {
      const { container } = render(<SearchSkeleton />)
      const results = container.querySelectorAll('.space-y-3 > div')
      expect(results.length).toBe(3)
    })

    it('each result has padding', () => {
      const { container } = render(<SearchSkeleton />)
      const result = container.querySelector('.p-4')
      expect(result).toBeInTheDocument()
    })

    it('results have spacing between them', () => {
      const { container } = render(<SearchSkeleton />)
      const resultsContainer = container.querySelector('.space-y-3')
      expect(resultsContainer).toBeInTheDocument()
    })

    it('each result has rounded corners', () => {
      const { container } = render(<SearchSkeleton />)
      const result = container.querySelector('.rounded-lg.p-4')
      expect(result).toBeInTheDocument()
    })

    it('each result has background color', () => {
      const { container } = render(<SearchSkeleton />)
      const result = container.querySelector('.bg-gray-50.dark\\:bg-gray-800')
      expect(result).toBeInTheDocument()
    })
  })

  describe('Thumbnail Skeletons', () => {
    it('each result has a thumbnail skeleton', () => {
      const { container } = render(<SearchSkeleton />)
      const thumbnails = container.querySelectorAll('.w-\\[60px\\].h-\\[90px\\]')
      expect(thumbnails.length).toBe(3)
    })

    it('thumbnails have correct dimensions', () => {
      const { container } = render(<SearchSkeleton />)
      const thumbnail = container.querySelector('.w-\\[60px\\].h-\\[90px\\]')
      expect(thumbnail).toBeInTheDocument()
    })

    it('thumbnails have rounded corners', () => {
      const { container } = render(<SearchSkeleton />)
      const thumbnail = container.querySelector('.rounded.bg-gray-300')
      expect(thumbnail).toBeInTheDocument()
    })

    it('thumbnails do not shrink', () => {
      const { container } = render(<SearchSkeleton />)
      const thumbnail = container.querySelector('.shrink-0')
      expect(thumbnail).toBeInTheDocument()
    })
  })

  describe('Content Placeholders', () => {
    it('has title placeholder in each result', () => {
      const { container } = render(<SearchSkeleton />)
      const titles = container.querySelectorAll('.h-5.rounded')
      expect(titles.length).toBeGreaterThanOrEqual(3)
    })

    it('has text line placeholders', () => {
      const { container } = render(<SearchSkeleton />)
      const textLines = container.querySelectorAll('.h-4.rounded')
      expect(textLines.length).toBeGreaterThanOrEqual(6) // 2 lines × 3 results
    })

    it('content has spacing between lines', () => {
      const { container } = render(<SearchSkeleton />)
      const content = container.querySelector('.space-y-2')
      expect(content).toBeInTheDocument()
    })

    it('content is flexible (flex-1)', () => {
      const { container } = render(<SearchSkeleton />)
      const content = container.querySelector('.flex-1.space-y-2')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Badge Skeletons', () => {
    it('has badge placeholders in results', () => {
      const { container } = render(<SearchSkeleton />)
      const badges = container.querySelectorAll('.h-6.rounded-full')
      expect(badges.length).toBeGreaterThanOrEqual(6) // 2 badges × 3 results
    })

    it('badges have rounded-full class', () => {
      const { container } = render(<SearchSkeleton />)
      const badge = container.querySelector('.h-6.rounded-full')
      expect(badge).toBeInTheDocument()
    })

    it('badges container has gap', () => {
      const { container } = render(<SearchSkeleton />)
      const badgeContainer = container.querySelector('.gap-2.mt-2')
      expect(badgeContainer).toBeInTheDocument()
    })
  })

  describe('Loading Spinner', () => {
    it('renders spinning SVG', () => {
      const { container } = render(<SearchSkeleton />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('spinner is an SVG element', () => {
      const { container } = render(<SearchSkeleton />)
      const spinner = container.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('spinner has correct viewBox', () => {
      const { container } = render(<SearchSkeleton />)
      const spinner = container.querySelector('svg[viewBox="0 0 24 24"]')
      expect(spinner).toBeInTheDocument()
    })

    it('spinner has circle and path elements', () => {
      const { container } = render(<SearchSkeleton />)
      const circle = container.querySelector('circle')
      const path = container.querySelector('path')
      expect(circle).toBeInTheDocument()
      expect(path).toBeInTheDocument()
    })
  })

  describe('Loading Text Section', () => {
    it('has centered loading text', () => {
      const { container } = render(<SearchSkeleton />)
      const textSection = container.querySelector('.text-center')
      expect(textSection).toBeInTheDocument()
    })

    it('loading text has correct styling', () => {
      const { container } = render(<SearchSkeleton />)
      const textSection = container.querySelector('.text-sm.text-gray-500.dark\\:text-gray-400')
      expect(textSection).toBeInTheDocument()
    })

    it('loading text has padding', () => {
      const { container } = render(<SearchSkeleton />)
      const textSection = container.querySelector('.py-4')
      expect(textSection).toBeInTheDocument()
    })

    it('loading content is inline-flex', () => {
      const { container } = render(<SearchSkeleton />)
      const loadingContent = container.querySelector('.inline-flex.items-center.gap-2')
      expect(loadingContent).toBeInTheDocument()
    })
  })

  describe('Dark Mode Support', () => {
    it('has dark mode for input skeleton', () => {
      const { container } = render(<SearchSkeleton />)
      const input = container.querySelector('.dark\\:bg-gray-700')
      expect(input).toBeInTheDocument()
    })

    it('has dark mode for filters', () => {
      const { container } = render(<SearchSkeleton />)
      const filters = container.querySelectorAll('.dark\\:bg-gray-700')
      expect(filters.length).toBeGreaterThanOrEqual(5)
    })

    it('has dark mode for results background', () => {
      const { container } = render(<SearchSkeleton />)
      const result = container.querySelector('.dark\\:bg-gray-800')
      expect(result).toBeInTheDocument()
    })

    it('has dark mode for thumbnails', () => {
      const { container } = render(<SearchSkeleton />)
      const thumbnail = container.querySelector('.dark\\:bg-gray-600')
      expect(thumbnail).toBeInTheDocument()
    })

    it('has dark mode for loading text', () => {
      const { container } = render(<SearchSkeleton />)
      const text = container.querySelector('.dark\\:text-gray-400')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains semantic structure', () => {
      const { container } = render(<SearchSkeleton />)
      expect(container.querySelector('.space-y-4')).toBeInTheDocument()
    })

    it('provides visual feedback with animation', () => {
      const { container } = render(<SearchSkeleton />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('has readable loading text', () => {
      render(<SearchSkeleton />)
      const loadingText = screen.getByText("Chargement de l'index de recherche...")
      expect(loadingText).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works as Suspense fallback', () => {
      const { container } = render(<SearchSkeleton />)
      expect(container.textContent).toContain('Chargement')
    })

    it('maintains layout structure during loading', () => {
      const { container } = render(<SearchSkeleton />)
      const sections = container.querySelectorAll('.space-y-4 > *')
      expect(sections.length).toBeGreaterThanOrEqual(3) // input, filters, results, loading text
    })
  })
})
