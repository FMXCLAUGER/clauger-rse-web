import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { EnjeuxSection } from '@/components/enjeux/EnjeuxSection'

// Mock IntersectionObserver for CircularGauge180
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
}

global.IntersectionObserver = MockIntersectionObserver as any

describe('EnjeuxSection', () => {
  describe('Section Structure', () => {
    it('renders section with correct background', () => {
      const { container } = render(<EnjeuxSection />)
      const section = container.querySelector('section')
      expect(section?.className).toContain('bg-[#F9FAFB]')
    })

    it('renders section title', () => {
      render(<EnjeuxSection />)
      expect(screen.getByText('Nos 3 Enjeux Durables')).toBeInTheDocument()
    })

    it('renders section subtitle', () => {
      render(<EnjeuxSection />)
      expect(screen.getByText('Une démarche structurée autour de piliers clés')).toBeInTheDocument()
    })

    it('title has Montserrat font', () => {
      const { container } = render(<EnjeuxSection />)
      const title = screen.getByText('Nos 3 Enjeux Durables')
      expect(title.className).toContain('font-montserrat')
    })

    it('title has text-4xl class', () => {
      const { container } = render(<EnjeuxSection />)
      const title = screen.getByText('Nos 3 Enjeux Durables')
      expect(title.className).toContain('text-4xl')
    })
  })

  describe('Enjeux Cards', () => {
    it('renders 3 enjeux cards', () => {
      const { container } = render(<EnjeuxSection />)
      const cards = container.querySelectorAll('.group.relative.bg-white\\/90')
      expect(cards.length).toBe(3)
    })

    it('renders Environnement card', () => {
      render(<EnjeuxSection />)
      expect(screen.getByText('Environnement')).toBeInTheDocument()
    })

    it('renders Social card', () => {
      render(<EnjeuxSection />)
      expect(screen.getByText('Politique Sociale')).toBeInTheDocument()
    })

    it('renders Gouvernance card', () => {
      render(<EnjeuxSection />)
      expect(screen.getByText('Conduite des Affaires')).toBeInTheDocument()
    })

    it('each card has hover effects', () => {
      const { container } = render(<EnjeuxSection />)
      const cards = container.querySelectorAll('.group')
      cards.forEach(card => {
        expect(card.className).toContain('hover:scale-[1.03]')
      })
    })

    it('each card has rounded corners', () => {
      const { container } = render(<EnjeuxSection />)
      const cards = container.querySelectorAll('.group')
      cards.forEach(card => {
        expect(card.className).toContain('rounded-2xl')
      })
    })

    it('each card has border', () => {
      const { container } = render(<EnjeuxSection />)
      const cards = container.querySelectorAll('.group')
      cards.forEach(card => {
        expect(card.className).toContain('border-2')
      })
    })
  })

  describe('Icons', () => {
    it('renders SVG icons for all cards', () => {
      const { container} = render(<EnjeuxSection />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('each card has icon in gradient background', () => {
      const { container } = render(<EnjeuxSection />)
      const iconContainers = container.querySelectorAll('.w-16.h-16.rounded-2xl')
      expect(iconContainers.length).toBe(3)
    })

    it('icon containers have rotate and scale hover effects', () => {
      const { container } = render(<EnjeuxSection />)
      const iconContainers = container.querySelectorAll('.w-16.h-16.rounded-2xl')
      iconContainers.forEach(iconContainer => {
        expect(iconContainer.className).toContain('group-hover:rotate-[5deg]')
        expect(iconContainer.className).toContain('group-hover:scale-105')
      })
    })
  })

  describe('Circular Gauges', () => {
    it('renders gauge displays for all enjeux', () => {
      render(<EnjeuxSection />)
      // Gauges start at 0.0 when animated (default behavior)
      const zeroValues = screen.getAllByText('0.0')
      expect(zeroValues.length).toBe(3) // All 3 gauges start at 0
    })

    it('all gauges show max value 10', () => {
      render(<EnjeuxSection />)
      const maxValues = screen.getAllByText('/ 10')
      expect(maxValues.length).toBe(3)
    })
  })

  describe('Action Buttons', () => {
    it('renders "En savoir plus" button for each card', () => {
      render(<EnjeuxSection />)
      const buttons = screen.getAllByText('En savoir plus')
      expect(buttons.length).toBe(3)
    })

    it('buttons have hover effects', () => {
      const { container } = render(<EnjeuxSection />)
      const buttons = container.querySelectorAll('button')
      let enSavoirPlusCount = 0
      buttons.forEach(button => {
        if (button.textContent?.includes('En savoir plus')) {
          expect(button.className).toContain('hover:bg-[#0088CC]')
          enSavoirPlusCount++
        }
      })
      expect(enSavoirPlusCount).toBe(3)
    })

    it('buttons have focus ring', () => {
      const { container } = render(<EnjeuxSection />)
      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        if (button.textContent?.includes('En savoir plus')) {
          expect(button.className).toContain('focus-visible:ring-2')
        }
      })
    })
  })

  describe('Modal Interaction', () => {
    it('modal does not appear by default', () => {
      const { container } = render(<EnjeuxSection />)
      // Modal should not be in the DOM when closed
      const modals = container.querySelectorAll('[role="dialog"]')
      expect(modals.length).toBe(0)
    })

    it('opens modal when button clicked', () => {
      render(<EnjeuxSection />)
      const buttons = screen.getAllByText('En savoir plus')
      fireEvent.click(buttons[0])

      // Modal should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('modal shows correct enjeu title', () => {
      render(<EnjeuxSection />)
      const buttons = screen.getAllByText('En savoir plus')
      fireEvent.click(buttons[0])

      // Should show Environnement title in modal
      const titles = screen.getAllByText('Environnement')
      expect(titles.length).toBeGreaterThan(1) // One in card, one in modal
    })

    it('closes modal when close button clicked', () => {
      render(<EnjeuxSection />)
      const buttons = screen.getAllByText('En savoir plus')
      fireEvent.click(buttons[0])

      const closeButton = screen.getByLabelText('Fermer')
      fireEvent.click(closeButton)

      // Modal should be gone
      const modals = screen.queryAllByRole('dialog')
      expect(modals.length).toBe(0)
    })
  })

  describe('Responsive Grid', () => {
    it('has responsive grid classes', () => {
      const { container } = render(<EnjeuxSection />)
      const grid = container.querySelector('.grid')
      expect(grid?.className).toContain('grid-cols-1')
      expect(grid?.className).toContain('md:grid-cols-2')
      expect(grid?.className).toContain('lg:grid-cols-3')
    })

    it('has responsive gap', () => {
      const { container } = render(<EnjeuxSection />)
      const grid = container.querySelector('.grid')
      expect(grid?.className).toContain('gap-6')
      expect(grid?.className).toContain('md:gap-8')
    })
  })

  describe('Card Content', () => {
    it('each card has title with Montserrat font', () => {
      const { container } = render(<EnjeuxSection />)
      const titles = container.querySelectorAll('.font-montserrat.text-2xl')
      expect(titles.length).toBeGreaterThanOrEqual(3)
    })

    it('renders card descriptions', () => {
      render(<EnjeuxSection />)
      expect(
        screen.getByText(/Préserver le climat/)
      ).toBeInTheDocument()
    })

    it('cards have flex-col layout', () => {
      const { container } = render(<EnjeuxSection />)
      const cards = container.querySelectorAll('.group.relative')
      cards.forEach(card => {
        expect(card.className).toContain('flex-col')
      })
    })

    it('cards have min-height classes', () => {
      const { container } = render(<EnjeuxSection />)
      const cards = container.querySelectorAll('.group.relative')
      cards.forEach(card => {
        expect(card.className).toContain('min-h-[320px]')
      })
    })
  })

  describe('Accessibility', () => {
    it('section has semantic HTML', () => {
      const { container } = render(<EnjeuxSection />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })

    it('title uses h2 heading', () => {
      const { container } = render(<EnjeuxSection />)
      const h2 = screen.getByText('Nos 3 Enjeux Durables')
      expect(h2.tagName).toBe('H2')
    })

    it('card titles use h3 heading', () => {
      const { container } = render(<EnjeuxSection />)
      const h3Elements = container.querySelectorAll('h3')
      expect(h3Elements.length).toBeGreaterThanOrEqual(3)
    })

    it('buttons are keyboard accessible', () => {
      const { container } = render(<EnjeuxSection />)
      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })
})
