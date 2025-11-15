import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { KeyFiguresSection } from '@/components/KeyFiguresSection'
import { RSE_DATA } from '@/lib/constants'

jest.mock('@/components/dashboard/KeyFigureCard', () => ({
  __esModule: true,
  default: ({ title, value, unit }: any) => (
    <div data-testid="key-figure-card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-value">{value}</div>
      <div data-testid="card-unit">{unit}</div>
    </div>
  ),
}))

jest.mock('lucide-react', () => ({
  Users: () => <span>Users</span>,
  Award: () => <span>Award</span>,
  Leaf: () => <span>Leaf</span>,
  GraduationCap: () => <span>GraduationCap</span>,
}))

describe('KeyFiguresSection', () => {
  const mockKpis = RSE_DATA.kpis

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<KeyFiguresSection kpis={mockKpis} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders grid container', () => {
      const { container } = render(<KeyFiguresSection kpis={mockKpis} />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('renders 4 KeyFigureCard instances', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const cards = screen.getAllByTestId('key-figure-card')
      expect(cards.length).toBe(4)
    })

    it('has responsive grid classes', () => {
      const { container } = render(<KeyFiguresSection kpis={mockKpis} />)
      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('grid-cols-1')
      expect(grid.className).toContain('md:grid-cols-2')
      expect(grid.className).toContain('lg:grid-cols-12')
    })
  })

  describe('Card 1: Collaborateurs', () => {
    it('displays Collaborateurs title', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      expect(screen.getByText('Collaborateurs')).toBeInTheDocument()
    })

    it('displays correct value', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const cards = screen.getAllByTestId('card-value')
      expect(cards[0]).toHaveTextContent('3200')
    })

    it('displays "+" unit', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const units = screen.getAllByTestId('card-unit')
      expect(units[0]).toHaveTextContent('+')
    })
  })

  describe('Card 2: Expérience', () => {
    it('displays "Années d\'expérience" title', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      expect(screen.getByText('Années d\'expérience')).toBeInTheDocument()
    })

    it('displays correct value', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const cards = screen.getAllByTestId('card-value')
      expect(cards[1]).toHaveTextContent('50')
    })
  })

  describe('Card 3: Emissions', () => {
    it('displays emissions title', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      expect(screen.getByText('teqCO₂ (Bilan carbone)')).toBeInTheDocument()
    })

    it('displays correct value', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const cards = screen.getAllByTestId('card-value')
      expect(cards[2]).toHaveTextContent('718000')
    })

    it('displays "k" unit', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const units = screen.getAllByTestId('card-unit')
      expect(units[2]).toHaveTextContent('k')
    })
  })

  describe('Card 4: Formation', () => {
    it('displays "Budget formation" title', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      expect(screen.getByText('Budget formation')).toBeInTheDocument()
    })

    it('displays correct value', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const cards = screen.getAllByTestId('card-value')
      expect(cards[3]).toHaveTextContent('300000')
    })

    it('displays "k€" unit', () => {
      render(<KeyFiguresSection kpis={mockKpis} />)
      const units = screen.getAllByTestId('card-unit')
      expect(units[3]).toHaveTextContent('k€')
    })
  })

  describe('Layout', () => {
    it('has gap spacing', () => {
      const { container } = render(<KeyFiguresSection kpis={mockKpis} />)
      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('gap-4')
    })

    it('each card in col-span-3 wrapper', () => {
      const { container } = render(<KeyFiguresSection kpis={mockKpis} />)
      const colSpans = container.querySelectorAll('.lg\\:col-span-3')
      expect(colSpans.length).toBe(4)
    })
  })

  describe('Data Structure', () => {
    it('accepts kpis object with correct structure', () => {
      expect(mockKpis).toHaveProperty('collaborateurs')
      expect(mockKpis).toHaveProperty('experienceAnnees')
      expect(mockKpis).toHaveProperty('emissionsCarbone')
      expect(mockKpis).toHaveProperty('budgetFormation')
      expect(mockKpis).toHaveProperty('trends')
    })

    it('trends object has all required arrays', () => {
      expect(mockKpis.trends).toHaveProperty('collaborateurs')
      expect(mockKpis.trends).toHaveProperty('experienceAnnees')
      expect(mockKpis.trends).toHaveProperty('emissionsCarbone')
      expect(mockKpis.trends).toHaveProperty('budgetFormation')
    })
  })
})
