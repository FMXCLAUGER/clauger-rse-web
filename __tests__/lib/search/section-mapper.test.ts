import { describe, it, expect } from '@jest/globals'
import {
  PAGE_SECTION_MAP,
  SECTIONS,
  getPageSection,
  filterResultsBySection,
} from '@/lib/search/section-mapper'

describe('section-mapper', () => {
  describe('PAGE_SECTION_MAP', () => {
    it('maps all 36 pages', () => {
      const pageNumbers = Object.keys(PAGE_SECTION_MAP).map(Number)
      expect(pageNumbers).toHaveLength(36)
    })

    it('starts at page 1', () => {
      expect(PAGE_SECTION_MAP[1]).toBeDefined()
    })

    it('ends at page 36', () => {
      expect(PAGE_SECTION_MAP[36]).toBeDefined()
    })

    it('has no gaps in page numbers', () => {
      for (let i = 1; i <= 36; i++) {
        expect(PAGE_SECTION_MAP[i]).toBeDefined()
      }
    })

    it('intro section covers pages 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(PAGE_SECTION_MAP[i]).toBe('intro')
      }
    })

    it('environnement section covers pages 11-23', () => {
      for (let i = 11; i <= 23; i++) {
        expect(PAGE_SECTION_MAP[i]).toBe('environnement')
      }
    })

    it('social section covers pages 24-31', () => {
      for (let i = 24; i <= 31; i++) {
        expect(PAGE_SECTION_MAP[i]).toBe('social')
      }
    })

    it('gouvernance section covers pages 32-36', () => {
      for (let i = 32; i <= 36; i++) {
        expect(PAGE_SECTION_MAP[i]).toBe('gouvernance')
      }
    })
  })

  describe('SECTIONS', () => {
    it('has 5 sections', () => {
      expect(SECTIONS).toHaveLength(5)
    })

    it('includes all section', () => {
      const allSection = SECTIONS.find(s => s.id === 'all')
      expect(allSection).toBeDefined()
      expect(allSection?.label).toBe('Toutes les sections')
      expect(allSection?.icon).toBe('📄')
    })

    it('includes intro section', () => {
      const introSection = SECTIONS.find(s => s.id === 'intro')
      expect(introSection).toBeDefined()
      expect(introSection?.label).toBe('Introduction')
      expect(introSection?.icon).toBe('📖')
    })

    it('includes environnement section', () => {
      const envSection = SECTIONS.find(s => s.id === 'environnement')
      expect(envSection).toBeDefined()
      expect(envSection?.label).toBe('Environnement')
      expect(envSection?.icon).toBe('🌍')
    })

    it('includes social section', () => {
      const socialSection = SECTIONS.find(s => s.id === 'social')
      expect(socialSection).toBeDefined()
      expect(socialSection?.label).toBe('Social')
      expect(socialSection?.icon).toBe('👥')
    })

    it('includes gouvernance section', () => {
      const gouvSection = SECTIONS.find(s => s.id === 'gouvernance')
      expect(gouvSection).toBeDefined()
      expect(gouvSection?.label).toBe('Gouvernance')
      expect(gouvSection?.icon).toBe('⚖️')
    })

    it('all sections have color property', () => {
      SECTIONS.forEach(section => {
        expect(section.color).toBeDefined()
        expect(section.color).toContain('bg-')
      })
    })
  })

  describe('getPageSection', () => {
    it('returns intro for page 1', () => {
      expect(getPageSection(1)).toBe('intro')
    })

    it('returns intro for page 10', () => {
      expect(getPageSection(10)).toBe('intro')
    })

    it('returns environnement for page 11', () => {
      expect(getPageSection(11)).toBe('environnement')
    })

    it('returns environnement for page 23', () => {
      expect(getPageSection(23)).toBe('environnement')
    })

    it('returns social for page 24', () => {
      expect(getPageSection(24)).toBe('social')
    })

    it('returns social for page 31', () => {
      expect(getPageSection(31)).toBe('social')
    })

    it('returns gouvernance for page 32', () => {
      expect(getPageSection(32)).toBe('gouvernance')
    })

    it('returns gouvernance for page 36', () => {
      expect(getPageSection(36)).toBe('gouvernance')
    })

    it('returns intro for page 0 (invalid)', () => {
      expect(getPageSection(0)).toBe('intro')
    })

    it('returns intro for page 37 (out of range)', () => {
      expect(getPageSection(37)).toBe('intro')
    })

    it('returns intro for page -1 (negative)', () => {
      expect(getPageSection(-1)).toBe('intro')
    })

    it('returns intro for page 100 (far out of range)', () => {
      expect(getPageSection(100)).toBe('intro')
    })
  })

  describe('filterResultsBySection', () => {
    const mockResults = [
      { pageNumber: 1, title: 'Intro page 1' },
      { pageNumber: 5, title: 'Intro page 5' },
      { pageNumber: 11, title: 'Env page 11' },
      { pageNumber: 20, title: 'Env page 20' },
      { pageNumber: 24, title: 'Social page 24' },
      { pageNumber: 28, title: 'Social page 28' },
      { pageNumber: 32, title: 'Gouv page 32' },
      { pageNumber: 36, title: 'Gouv page 36' },
    ]

    it('returns all results when section is "all"', () => {
      const filtered = filterResultsBySection(mockResults, 'all')
      expect(filtered).toHaveLength(8)
      expect(filtered).toEqual(mockResults)
    })

    it('filters results by intro section', () => {
      const filtered = filterResultsBySection(mockResults, 'intro')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].pageNumber).toBe(1)
      expect(filtered[1].pageNumber).toBe(5)
    })

    it('filters results by environnement section', () => {
      const filtered = filterResultsBySection(mockResults, 'environnement')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].pageNumber).toBe(11)
      expect(filtered[1].pageNumber).toBe(20)
    })

    it('filters results by social section', () => {
      const filtered = filterResultsBySection(mockResults, 'social')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].pageNumber).toBe(24)
      expect(filtered[1].pageNumber).toBe(28)
    })

    it('filters results by gouvernance section', () => {
      const filtered = filterResultsBySection(mockResults, 'gouvernance')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].pageNumber).toBe(32)
      expect(filtered[1].pageNumber).toBe(36)
    })

    it('returns empty array when no results match section', () => {
      const introOnlyResults = [{ pageNumber: 1, title: 'Intro' }]
      const filtered = filterResultsBySection(introOnlyResults, 'social')
      expect(filtered).toHaveLength(0)
    })

    it('handles empty results array', () => {
      const filtered = filterResultsBySection([], 'intro')
      expect(filtered).toHaveLength(0)
      expect(filtered).toEqual([])
    })
  })
})
