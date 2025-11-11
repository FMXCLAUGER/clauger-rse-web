import { reportPageSchema } from '@/lib/validations/searchParams'
import { TOTAL_PAGES } from '@/lib/constants'

describe('reportPageSchema', () => {
  describe('valid inputs', () => {
    it('should accept page 1', () => {
      const result = reportPageSchema.safeParse({ page: 1 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should accept the last valid page', () => {
      const result = reportPageSchema.safeParse({ page: TOTAL_PAGES })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(TOTAL_PAGES)
      }
    })

    it('should accept a middle page number', () => {
      const middlePage = Math.floor(TOTAL_PAGES / 2)
      const result = reportPageSchema.safeParse({ page: middlePage })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(middlePage)
      }
    })

    it('should coerce string numbers to integers', () => {
      const result = reportPageSchema.safeParse({ page: '5' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
        expect(typeof result.data.page).toBe('number')
      }
    })

    it('should use default value of 1 when page is undefined', () => {
      const result = reportPageSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })
  })

  describe('invalid inputs - catch behavior', () => {
    it('should catch page 0 and return 1', () => {
      const result = reportPageSchema.safeParse({ page: 0 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch negative page numbers and return 1', () => {
      const result = reportPageSchema.safeParse({ page: -5 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch pages above TOTAL_PAGES and return 1', () => {
      const result = reportPageSchema.safeParse({ page: TOTAL_PAGES + 1 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch pages far above TOTAL_PAGES and return 1', () => {
      const result = reportPageSchema.safeParse({ page: 9999 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch decimal numbers and return 1', () => {
      const result = reportPageSchema.safeParse({ page: 3.14 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch invalid string and return 1', () => {
      const result = reportPageSchema.safeParse({ page: 'invalid' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch null and return 1', () => {
      const result = reportPageSchema.safeParse({ page: null })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch empty string and return 1', () => {
      const result = reportPageSchema.safeParse({ page: '' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch boolean values and return 1', () => {
      const result = reportPageSchema.safeParse({ page: true })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch object values and return 1', () => {
      const result = reportPageSchema.safeParse({ page: {} })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should catch array values and return 1', () => {
      const result = reportPageSchema.safeParse({ page: [] })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle string representation of page 1', () => {
      const result = reportPageSchema.safeParse({ page: '1' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should handle string representation of TOTAL_PAGES', () => {
      const result = reportPageSchema.safeParse({ page: String(TOTAL_PAGES) })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(TOTAL_PAGES)
      }
    })

    it('should handle whitespace in string numbers', () => {
      const result = reportPageSchema.safeParse({ page: ' 5 ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
      }
    })

    it('should handle Infinity and return 1', () => {
      const result = reportPageSchema.safeParse({ page: Infinity })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should handle -Infinity and return 1', () => {
      const result = reportPageSchema.safeParse({ page: -Infinity })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should handle NaN and return 1', () => {
      const result = reportPageSchema.safeParse({ page: NaN })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })
  })

  describe('type inference', () => {
    it('should infer correct TypeScript type', () => {
      const result = reportPageSchema.safeParse({ page: 5 })
      if (result.success) {
        // This is a compile-time check
        const page: number = result.data.page
        expect(typeof page).toBe('number')
      }
    })
  })
})
