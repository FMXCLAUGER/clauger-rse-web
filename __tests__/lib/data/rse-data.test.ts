import { describe, it, expect } from '@jest/globals'
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  environmentData,
  socialData,
  governanceData,
} from '@/lib/data/rse-data'

describe('RSE Data Utilities', () => {
  describe('formatNumber', () => {
    it('formats 0 as "0"', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('formats positive integers with French locale separator', () => {
      expect(formatNumber(1000)).toBe('1\u202F000')
    })

    it('formats 1000 as "1 000" (narrow no-break space)', () => {
      expect(formatNumber(1000)).toBe('1\u202F000')
    })

    it('formats 1000000 as "1 000 000"', () => {
      expect(formatNumber(1000000)).toBe('1\u202F000\u202F000')
    })

    it('formats decimal numbers with French decimal separator', () => {
      expect(formatNumber(1234.56)).toBe('1\u202F234,56')
    })

    it('formats negative numbers correctly', () => {
      expect(formatNumber(-1000)).toBe('-1\u202F000')
    })

    it('handles edge case: very large numbers', () => {
      expect(formatNumber(1234567890)).toBe('1\u202F234\u202F567\u202F890')
    })

    it('handles edge case: very small decimals', () => {
      expect(formatNumber(0.5)).toBe('0,5')
    })

    it('uses French locale grouping (narrow no-break space as separator)', () => {
      const result = formatNumber(10000)
      expect(result).toContain('\u202F')
      expect(result).toBe('10\u202F000')
    })

    it('formats 1500 as "1 500"', () => {
      expect(formatNumber(1500)).toBe('1\u202F500')
    })

    it('formats 999 as "999" (no separator needed)', () => {
      expect(formatNumber(999)).toBe('999')
    })
  })

  describe('formatCurrency', () => {
    it('formats 0 as "0 €"', () => {
      expect(formatCurrency(0)).toContain('0')
      expect(formatCurrency(0)).toContain('€')
    })

    it('formats positive amounts with EUR symbol and locale', () => {
      const result = formatCurrency(1000)
      expect(result).toContain('€')
      expect(result).toBe('1\u202F000\u00A0€')
    })

    it('formats 4200000 with French format', () => {
      const result = formatCurrency(4200000)
      expect(result).toBe('4\u202F200\u202F000\u00A0€')
      expect(result).toContain('€')
    })

    it('formats with 0 fraction digits (no cents)', () => {
      const result = formatCurrency(1234.99)
      expect(result).not.toContain(',99')
      expect(result).not.toContain('.99')
    })

    it('formats negative amounts correctly', () => {
      const result = formatCurrency(-1000)
      expect(result).toContain('-')
      expect(result).toContain('€')
    })

    it('handles decimal inputs (should round)', () => {
      expect(formatCurrency(1234.5)).toBe('1\u202F235\u00A0€')
    })

    it('uses € symbol (EUR currency)', () => {
      expect(formatCurrency(100)).toContain('€')
    })

    it('uses French locale formatting (narrow no-break space)', () => {
      const result = formatCurrency(10000)
      expect(result).toContain('\u202F')
    })
  })

  describe('formatPercentage', () => {
    it('formats 0 as "0.0%"', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })

    it('formats 100 as "100.0%"', () => {
      expect(formatPercentage(100)).toBe('100.0%')
    })

    it('formats 50 as "50.0%"', () => {
      expect(formatPercentage(50)).toBe('50.0%')
    })

    it('formats 66.66 as "66.7%" (toFixed(1) rounds)', () => {
      expect(formatPercentage(66.66)).toBe('66.7%')
    })

    it('formats 33.333 as "33.3%" (rounds correctly)', () => {
      expect(formatPercentage(33.333)).toBe('33.3%')
    })

    it('formats decimals with exactly 1 decimal place', () => {
      const result = formatPercentage(12.3456)
      const decimalPart = result.split('.')[1]
      expect(decimalPart).toBe('3%')
    })

    it('formats negative percentages as "-50.0%"', () => {
      expect(formatPercentage(-50)).toBe('-50.0%')
    })

    it('formats very small decimals like 0.1 as "0.1%"', () => {
      expect(formatPercentage(0.1)).toBe('0.1%')
    })

    it('formats 100.5 as "100.5%"', () => {
      expect(formatPercentage(100.5)).toBe('100.5%')
    })

    it('rounds 66.65 to "66.7%"', () => {
      expect(formatPercentage(66.65)).toBe('66.7%')
    })

    it('rounds 66.64 to "66.6%"', () => {
      expect(formatPercentage(66.64)).toBe('66.6%')
    })

    it('formats integer as "X.0%"', () => {
      expect(formatPercentage(75)).toBe('75.0%')
    })
  })

  describe('Data structure validation', () => {
    it('environmentData has emissions array with 6 years', () => {
      expect(environmentData.emissions).toHaveLength(6)
      expect(environmentData.emissions[0].year).toBe(2020)
      expect(environmentData.emissions[5].year).toBe(2025)
    })

    it('environmentData has energy array with 5 sites', () => {
      expect(environmentData.energy).toHaveLength(5)
    })

    it('environmentData waste has all categories', () => {
      expect(environmentData.waste).toHaveProperty('recycled')
      expect(environmentData.waste).toHaveProperty('incinerated')
      expect(environmentData.waste).toHaveProperty('landfill')
    })

    it('environmentData targets has 4 targets', () => {
      expect(environmentData.targets).toHaveLength(4)
    })

    it('socialData has workforce with 6 years', () => {
      expect(socialData.workforce).toHaveLength(6)
    })

    it('socialData has ageDistribution with 5 age ranges', () => {
      expect(socialData.ageDistribution).toHaveLength(5)
    })

    it('socialData has training data with 6 years', () => {
      expect(socialData.training).toHaveLength(6)
    })

    it('socialData has accidents with 6 years', () => {
      expect(socialData.accidents).toHaveLength(6)
    })

    it('governanceData has board with 4 categories', () => {
      expect(governanceData.board).toHaveLength(4)
    })

    it('governanceData has budget with 3 pillars', () => {
      expect(governanceData.budget).toHaveLength(3)
    })

    it('governanceData has compliance with 5 areas', () => {
      expect(governanceData.compliance).toHaveLength(5)
    })

    it('governanceData has initiatives with 6 items', () => {
      expect(governanceData.initiatives).toHaveLength(6)
    })
  })

  describe('Emissions data validation', () => {
    it('has 2024 values: scope1=360, scope2=245, scope3=980', () => {
      const year2024 = environmentData.emissions.find(e => e.year === 2024)
      expect(year2024?.scope1).toBe(360)
      expect(year2024?.scope2).toBe(245)
      expect(year2024?.scope3).toBe(980)
    })

    it('has 2025 values: scope1=340, scope2=220, scope3=920', () => {
      const year2025 = environmentData.emissions.find(e => e.year === 2025)
      expect(year2025?.scope1).toBe(340)
      expect(year2025?.scope2).toBe(220)
      expect(year2025?.scope3).toBe(920)
    })

    it('trend is downward (decreasing values)', () => {
      const year2024 = environmentData.emissions.find(e => e.year === 2024)!
      const year2025 = environmentData.emissions.find(e => e.year === 2025)!

      expect(year2025.scope1).toBeLessThan(year2024.scope1)
      expect(year2025.scope2).toBeLessThan(year2024.scope2)
      expect(year2025.scope3).toBeLessThan(year2024.scope3)
    })
  })

  describe('Energy data validation', () => {
    it('Lyon has correct values', () => {
      const lyon = environmentData.energy.find(e => e.site === 'Lyon')
      expect(lyon?.consumption).toBe(2400)
      expect(lyon?.renewable).toBe(65)
    })

    it('Culoz has correct values', () => {
      const culoz = environmentData.energy.find(e => e.site === 'Culoz')
      expect(culoz?.consumption).toBe(1850)
      expect(culoz?.renewable).toBe(58)
    })

    it('Paris has correct values', () => {
      const paris = environmentData.energy.find(e => e.site === 'Paris')
      expect(paris?.consumption).toBe(1200)
      expect(paris?.renewable).toBe(72)
    })

    it('Nantes has correct values', () => {
      const nantes = environmentData.energy.find(e => e.site === 'Nantes')
      expect(nantes?.consumption).toBe(980)
      expect(nantes?.renewable).toBe(45)
    })

    it('Autres has correct values', () => {
      const autres = environmentData.energy.find(e => e.site === 'Autres')
      expect(autres?.consumption).toBe(1570)
      expect(autres?.renewable).toBe(52)
    })
  })

  describe('Waste data validation', () => {
    it('has recycled percentage', () => {
      expect(environmentData.waste.recycled).toBe(67.8)
    })

    it('has incinerated percentage', () => {
      expect(environmentData.waste.incinerated).toBe(22.5)
    })

    it('has landfill percentage', () => {
      expect(environmentData.waste.landfill).toBe(9.7)
    })

    it('total should sum to approximately 100%', () => {
      const total = environmentData.waste.recycled +
                   environmentData.waste.incinerated +
                   environmentData.waste.landfill
      expect(total).toBeCloseTo(100, 1)
    })
  })

  describe('Workforce validation', () => {
    it('has 2024 total: 1467 (992 men, 475 women)', () => {
      const year2024 = socialData.workforce.find(w => w.year === 2024)
      expect(year2024?.total).toBe(1467)
      expect(year2024?.men).toBe(992)
      expect(year2024?.women).toBe(475)
    })

    it('has 2025 total: 1523 (1015 men, 508 women)', () => {
      const year2025 = socialData.workforce.find(w => w.year === 2025)
      expect(year2025?.total).toBe(1523)
      expect(year2025?.men).toBe(1015)
      expect(year2025?.women).toBe(508)
    })

    it('trend is upward', () => {
      const year2024 = socialData.workforce.find(w => w.year === 2024)!
      const year2025 = socialData.workforce.find(w => w.year === 2025)!
      expect(year2025.total).toBeGreaterThan(year2024.total)
    })
  })

  describe('Training validation', () => {
    it('has 2024: 27340 hours, 1389 employees', () => {
      const year2024 = socialData.training.find(t => t.year === 2024)
      expect(year2024?.hours).toBe(27340)
      expect(year2024?.employees).toBe(1389)
    })

    it('hours increase year over year (2023 to 2024)', () => {
      const year2023 = socialData.training.find(t => t.year === 2023)!
      const year2024 = socialData.training.find(t => t.year === 2024)!
      expect(year2024.hours).toBeGreaterThan(year2023.hours)
    })
  })

  describe('Accidents validation', () => {
    it('has 2024: 11 count, 7.5 frequency', () => {
      const year2024 = socialData.accidents.find(a => a.year === 2024)
      expect(year2024?.count).toBe(11)
      expect(year2024?.frequency).toBe(7.5)
    })

    it('has 2025: 8 count, 5.3 frequency', () => {
      const year2025 = socialData.accidents.find(a => a.year === 2025)
      expect(year2025?.count).toBe(8)
      expect(year2025?.frequency).toBe(5.3)
    })

    it('trend is downward (improvement)', () => {
      const year2024 = socialData.accidents.find(a => a.year === 2024)!
      const year2025 = socialData.accidents.find(a => a.year === 2025)!
      expect(year2025.count).toBeLessThan(year2024.count)
      expect(year2025.frequency).toBeLessThan(year2024.frequency)
    })
  })

  describe('Governance budget', () => {
    it('Environnement: 4200000, 52%', () => {
      const env = governanceData.budget.find(b => b.pillar === 'Environnement')
      expect(env?.amount).toBe(4200000)
      expect(env?.percentage).toBe(52)
    })

    it('Social: 2600000, 32%', () => {
      const social = governanceData.budget.find(b => b.pillar === 'Social')
      expect(social?.amount).toBe(2600000)
      expect(social?.percentage).toBe(32)
    })

    it('Gouvernance: 1300000, 16%', () => {
      const gouv = governanceData.budget.find(b => b.pillar === 'Gouvernance')
      expect(gouv?.amount).toBe(1300000)
      expect(gouv?.percentage).toBe(16)
    })

    it('percentages sum to 100%', () => {
      const total = governanceData.budget.reduce((sum, b) => sum + b.percentage, 0)
      expect(total).toBe(100)
    })
  })

  describe('Initiatives validation', () => {
    it('has 6 initiatives with dates, titles, status', () => {
      expect(governanceData.initiatives).toHaveLength(6)
      governanceData.initiatives.forEach(initiative => {
        expect(initiative).toHaveProperty('date')
        expect(initiative).toHaveProperty('title')
        expect(initiative).toHaveProperty('status')
      })
    })

    it('status is "completed", "in-progress", or "planned"', () => {
      const validStatuses = ['completed', 'in-progress', 'planned']
      governanceData.initiatives.forEach(initiative => {
        expect(validStatuses).toContain(initiative.status)
      })
    })
  })
})
