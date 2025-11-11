import { TOTAL_PAGES, RAPPORT_DATA, PAGES, SOMMAIRE } from '@/lib/constants'

describe('constants', () => {
  describe('TOTAL_PAGES', () => {
    it('should be 36', () => {
      expect(TOTAL_PAGES).toBe(36)
    })
  })

  describe('RAPPORT_DATA', () => {
    it('should have correct structure', () => {
      expect(RAPPORT_DATA.title).toBeDefined()
      expect(RAPPORT_DATA.baseline).toBeDefined()
      expect(RAPPORT_DATA.notation).toBeDefined()
      expect(RAPPORT_DATA.kpis).toBeDefined()
      expect(RAPPORT_DATA.enjeux).toBeDefined()
    })

    it('should have valid notation scores', () => {
      expect(RAPPORT_DATA.notation.global).toBe(62)
      expect(RAPPORT_DATA.notation.environnement).toBe(4.8)
    })

    it('should have 3 enjeux', () => {
      expect(RAPPORT_DATA.enjeux).toHaveLength(3)
    })
  })

  describe('PAGES', () => {
    it('should have correct length', () => {
      expect(PAGES).toHaveLength(TOTAL_PAGES)
    })

    it('should have sequential IDs', () => {
      expect(PAGES[0].id).toBe(1)
      expect(PAGES[PAGES.length - 1].id).toBe(TOTAL_PAGES)
    })

    it('each page should have required fields', () => {
      const page = PAGES[0]
      expect(page.id).toBeDefined()
      expect(page.src).toBeDefined()
      expect(page.alt).toBeDefined()
      expect(page.title).toBeDefined()
    })
  })

  describe('SOMMAIRE', () => {
    it('should be an array', () => {
      expect(Array.isArray(SOMMAIRE)).toBe(true)
    })

    it('should have entries', () => {
      expect(SOMMAIRE.length).toBeGreaterThan(0)
    })

    it('each entry should have required fields', () => {
      const entry = SOMMAIRE[0]
      expect(entry.page).toBeDefined()
      expect(entry.title).toBeDefined()
      expect(entry.section).toBeDefined()
    })
  })
})
