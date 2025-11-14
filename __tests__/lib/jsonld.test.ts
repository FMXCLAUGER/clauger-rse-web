import { describe, it, expect } from '@jest/globals'
import {
  getOrganizationSchema,
  getReportSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
} from '@/lib/jsonld'

describe('JSON-LD Schema Generation', () => {
  describe('getOrganizationSchema', () => {
    it('returns organization schema with correct structure', () => {
      const schema = getOrganizationSchema()

      expect(schema).toHaveProperty('@context', 'https://schema.org')
      expect(schema).toHaveProperty('@type', 'Organization')
    })

    it('contains all required organization fields', () => {
      const schema = getOrganizationSchema()

      expect(schema).toHaveProperty('name', 'Clauger')
      expect(schema).toHaveProperty('url', 'https://rse.clauger.com')
      expect(schema).toHaveProperty('logo', 'https://rse.clauger.com/logo.png')
      expect(schema).toHaveProperty('description', 'Passion - Innovation - Performance - Solidarité')
      expect(schema).toHaveProperty('foundingDate', '1971')
      expect(schema).toHaveProperty('slogan', 'Passion, Innovation, Performance, Solidarité')
    })

    it('returns consistent output on multiple calls', () => {
      const schema1 = getOrganizationSchema()
      const schema2 = getOrganizationSchema()

      expect(schema1).toEqual(schema2)
    })
  })

  describe('getReportSchema', () => {
    it('returns report schema with correct structure', () => {
      const schema = getReportSchema()

      expect(schema).toHaveProperty('@context', 'https://schema.org')
      expect(schema).toHaveProperty('@type', 'Report')
    })

    it('contains all required report fields', () => {
      const schema = getReportSchema()

      expect(schema).toHaveProperty('name', 'Rapport RSE Clauger 2025')
      expect(schema).toHaveProperty('datePublished', '2025-01-01')
      expect(schema).toHaveProperty('abstract')
      expect(schema).toHaveProperty('keywords')
      expect(schema).toHaveProperty('inLanguage', 'fr-FR')
    })

    it('includes author as nested organization', () => {
      const schema = getReportSchema()

      expect(schema.author).toHaveProperty('@type', 'Organization')
      expect(schema.author).toHaveProperty('name', 'Clauger')
    })

    it('has French language tag', () => {
      const schema = getReportSchema()

      expect(schema.inLanguage).toBe('fr-FR')
    })

    it('contains RSE keywords', () => {
      const schema = getReportSchema()

      expect(schema.keywords).toContain('RSE')
      expect(schema.keywords).toContain('Environnement')
      expect(schema.keywords).toContain('Social')
      expect(schema.keywords).toContain('Gouvernance')
    })
  })

  describe('getWebSiteSchema', () => {
    it('returns website schema with correct structure', () => {
      const schema = getWebSiteSchema()

      expect(schema).toHaveProperty('@context', 'https://schema.org')
      expect(schema).toHaveProperty('@type', 'WebSite')
    })

    it('contains all required website fields', () => {
      const schema = getWebSiteSchema()

      expect(schema).toHaveProperty('name', 'Rapport RSE Clauger 2025')
      expect(schema).toHaveProperty('url', 'https://rse.clauger.com')
      expect(schema).toHaveProperty('description', 'Premier rapport durable de Clauger')
      expect(schema).toHaveProperty('inLanguage', 'fr-FR')
    })

    it('includes publisher as nested organization', () => {
      const schema = getWebSiteSchema()

      expect(schema.publisher).toHaveProperty('@type', 'Organization')
      expect(schema.publisher).toHaveProperty('name', 'Clauger')
    })

    it('has French language tag', () => {
      const schema = getWebSiteSchema()

      expect(schema.inLanguage).toBe('fr-FR')
    })
  })

  describe('getBreadcrumbSchema', () => {
    it('returns breadcrumb schema with correct structure', () => {
      const items = [{ name: 'Home', url: 'https://rse.clauger.com' }]
      const schema = getBreadcrumbSchema(items)

      expect(schema).toHaveProperty('@context', 'https://schema.org')
      expect(schema).toHaveProperty('@type', 'BreadcrumbList')
      expect(schema).toHaveProperty('itemListElement')
    })

    it('maps empty array to empty itemListElement', () => {
      const schema = getBreadcrumbSchema([])

      expect(schema.itemListElement).toEqual([])
    })

    it('maps single item correctly with position 1', () => {
      const items = [{ name: 'Home', url: 'https://rse.clauger.com' }]
      const schema = getBreadcrumbSchema(items)

      expect(schema.itemListElement).toHaveLength(1)
      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rse.clauger.com',
      })
    })

    it('maps multiple items with correct sequential positions', () => {
      const items = [
        { name: 'Home', url: 'https://rse.clauger.com' },
        { name: 'Rapport', url: 'https://rse.clauger.com/rapport' },
        { name: 'Page 1', url: 'https://rse.clauger.com/rapport?page=1' },
      ]
      const schema = getBreadcrumbSchema(items)

      expect(schema.itemListElement).toHaveLength(3)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[1].position).toBe(2)
      expect(schema.itemListElement[2].position).toBe(3)
    })

    it('maps each item to correct structure with @type ListItem', () => {
      const items = [
        { name: 'Home', url: 'https://rse.clauger.com' },
        { name: 'Rapport', url: 'https://rse.clauger.com/rapport' },
      ]
      const schema = getBreadcrumbSchema(items)

      schema.itemListElement.forEach((item) => {
        expect(item).toHaveProperty('@type', 'ListItem')
        expect(item).toHaveProperty('position')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('item')
      })
    })

    it('preserves item names and URLs exactly', () => {
      const items = [
        { name: 'Test Name', url: 'https://example.com/test' },
      ]
      const schema = getBreadcrumbSchema(items)

      expect(schema.itemListElement[0].name).toBe('Test Name')
      expect(schema.itemListElement[0].item).toBe('https://example.com/test')
    })

    it('handles special characters in names and URLs', () => {
      const items = [
        { name: 'Rapport & Résultats', url: 'https://rse.clauger.com/rapport?id=1&page=2' },
      ]
      const schema = getBreadcrumbSchema(items)

      expect(schema.itemListElement[0].name).toBe('Rapport & Résultats')
      expect(schema.itemListElement[0].item).toBe('https://rse.clauger.com/rapport?id=1&page=2')
    })

    it('handles accented characters in names', () => {
      const items = [
        { name: 'Éléments clés', url: 'https://rse.clauger.com/elements' },
      ]
      const schema = getBreadcrumbSchema(items)

      expect(schema.itemListElement[0].name).toBe('Éléments clés')
    })

    it('handles long URLs', () => {
      const longUrl = 'https://rse.clauger.com/rapport/details/section/subsection?param1=value1&param2=value2'
      const items = [
        { name: 'Long Path', url: longUrl },
      ]
      const schema = getBreadcrumbSchema(items)

      expect(schema.itemListElement[0].item).toBe(longUrl)
    })

    it('generates correct position values (1-indexed)', () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        name: `Item ${i}`,
        url: `https://example.com/${i}`,
      }))
      const schema = getBreadcrumbSchema(items)

      schema.itemListElement.forEach((item, index) => {
        expect(item.position).toBe(index + 1)
      })
    })
  })
})
