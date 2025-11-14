import { describe, it, expect } from '@jest/globals'
import {
  enjeuxDetails,
  getEnjeuxDetail,
  type EnjeuxDetail,
  type EnjeuxKPI,
} from '@/lib/data/enjeux-details'
import {
  Leaf,
  Zap,
  Target,
  Users,
  GraduationCap,
  Shield,
  TrendingUp,
  Scale,
  CheckCircle2,
  Lock,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react'

describe('Enjeux Details Data Management', () => {
  describe('enjeuxDetails array structure', () => {
    it('exports enjeuxDetails as non-empty array', () => {
      expect(Array.isArray(enjeuxDetails)).toBe(true)
      expect(enjeuxDetails.length).toBeGreaterThan(0)
    })

    it('contains exactly 3 enjeux items', () => {
      expect(enjeuxDetails).toHaveLength(3)
    })

    it('contains environnement enjeu with id "environnement"', () => {
      const environnement = enjeuxDetails.find(e => e.id === 'environnement')
      expect(environnement).toBeDefined()
    })

    it('contains social enjeu with id "social"', () => {
      const social = enjeuxDetails.find(e => e.id === 'social')
      expect(social).toBeDefined()
    })

    it('contains gouvernance enjeu with id "gouvernance"', () => {
      const gouvernance = enjeuxDetails.find(e => e.id === 'gouvernance')
      expect(gouvernance).toBeDefined()
    })

    it('has all required properties in each enjeu', () => {
      enjeuxDetails.forEach(enjeu => {
        expect(enjeu).toHaveProperty('id')
        expect(enjeu).toHaveProperty('title')
        expect(enjeu).toHaveProperty('description')
        expect(enjeu).toHaveProperty('keyPoints')
        expect(enjeu).toHaveProperty('kpis')
        expect(enjeu).toHaveProperty('actions')
        expect(enjeu).toHaveProperty('challenges')
        expect(enjeu).toHaveProperty('dashboardTab')
      })
    })

    it('has no duplicate IDs in array', () => {
      const ids = enjeuxDetails.map(e => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('has no null/undefined values in required fields', () => {
      enjeuxDetails.forEach(enjeu => {
        expect(enjeu.id).not.toBeNull()
        expect(enjeu.id).not.toBeUndefined()
        expect(enjeu.title).not.toBeNull()
        expect(enjeu.title).not.toBeUndefined()
        expect(enjeu.description).not.toBeNull()
        expect(enjeu.description).not.toBeUndefined()
      })
    })
  })

  describe('Environnement enjeu validation', () => {
    const environnement = enjeuxDetails.find(e => e.id === 'environnement')!

    it('has id "environnement"', () => {
      expect(environnement.id).toBe('environnement')
    })

    it('has title "Environnement"', () => {
      expect(environnement.title).toBe('Environnement')
    })

    it('has non-empty description', () => {
      expect(environnement.description).toBeTruthy()
      expect(environnement.description.length).toBeGreaterThan(0)
    })

    it('has 5 keyPoints', () => {
      expect(environnement.keyPoints).toHaveLength(5)
    })

    it('has 4 KPIs with correct icons', () => {
      expect(environnement.kpis).toHaveLength(4)
      expect(environnement.kpis[0].icon).toBe(Leaf)
      expect(environnement.kpis[1].icon).toBe(AlertTriangle)
      expect(environnement.kpis[2].icon).toBe(Zap)
      expect(environnement.kpis[3].icon).toBe(Target)
    })

    it('has 5 actions', () => {
      expect(environnement.actions).toHaveLength(5)
    })

    it('has 5 challenges', () => {
      expect(environnement.challenges).toHaveLength(5)
    })

    it('has dashboardTab "environment"', () => {
      expect(environnement.dashboardTab).toBe('environment')
    })

    it('has all KPI fields (label, value, icon, trend)', () => {
      environnement.kpis.forEach(kpi => {
        expect(kpi).toHaveProperty('label')
        expect(kpi).toHaveProperty('value')
        expect(kpi).toHaveProperty('icon')
        expect(typeof kpi.label).toBe('string')
        expect(typeof kpi.value).toBe('string')
        expect(kpi.label.length).toBeGreaterThan(0)
        expect(kpi.value.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Social enjeu validation', () => {
    const social = enjeuxDetails.find(e => e.id === 'social')!

    it('has id "social"', () => {
      expect(social.id).toBe('social')
    })

    it('has title "Politique Sociale"', () => {
      expect(social.title).toBe('Politique Sociale')
    })

    it('has non-empty description', () => {
      expect(social.description).toBeTruthy()
      expect(social.description.length).toBeGreaterThan(0)
    })

    it('has 5 keyPoints with correct numbers', () => {
      expect(social.keyPoints).toHaveLength(5)
      expect(social.keyPoints[0]).toContain('1 302')
      expect(social.keyPoints[1]).toContain('365')
      expect(social.keyPoints[1]).toContain('199')
      expect(social.keyPoints[2]).toContain('300 000€')
      expect(social.keyPoints[2]).toContain('55 000')
    })

    it('has 4 KPIs with correct icons', () => {
      expect(social.kpis).toHaveLength(4)
      expect(social.kpis[0].icon).toBe(Users)
      expect(social.kpis[1].icon).toBe(GraduationCap)
      expect(social.kpis[2].icon).toBe(TrendingUp)
      expect(social.kpis[3].icon).toBe(Shield)
    })

    it('has 5 actions', () => {
      expect(social.actions).toHaveLength(5)
    })

    it('has 5 challenges', () => {
      expect(social.challenges).toHaveLength(5)
    })

    it('has dashboardTab "social"', () => {
      expect(social.dashboardTab).toBe('social')
    })
  })

  describe('Gouvernance enjeu validation', () => {
    const gouvernance = enjeuxDetails.find(e => e.id === 'gouvernance')!

    it('has id "gouvernance"', () => {
      expect(gouvernance.id).toBe('gouvernance')
    })

    it('has title "Conduite des Affaires"', () => {
      expect(gouvernance.title).toBe('Conduite des Affaires')
    })

    it('has non-empty description', () => {
      expect(gouvernance.description).toBeTruthy()
      expect(gouvernance.description.length).toBeGreaterThan(0)
    })

    it('has 5 keyPoints with percentages', () => {
      expect(gouvernance.keyPoints).toHaveLength(5)
      expect(gouvernance.keyPoints[0]).toContain('23,25%')
      expect(gouvernance.keyPoints[1]).toContain('90%')
      expect(gouvernance.keyPoints[3]).toContain('Zéro')
    })

    it('has 4 KPIs with correct icons', () => {
      expect(gouvernance.kpis).toHaveLength(4)
      expect(gouvernance.kpis[0].icon).toBe(Scale)
      expect(gouvernance.kpis[1].icon).toBe(CheckCircle2)
      expect(gouvernance.kpis[2].icon).toBe(Lock)
      expect(gouvernance.kpis[3].icon).toBe(ShoppingCart)
    })

    it('has 5 actions', () => {
      expect(gouvernance.actions).toHaveLength(5)
    })

    it('has 5 challenges', () => {
      expect(gouvernance.challenges).toHaveLength(5)
    })

    it('has dashboardTab "governance"', () => {
      expect(gouvernance.dashboardTab).toBe('governance')
    })
  })

  describe('KPI data validation', () => {
    it('each KPI has label as non-empty string', () => {
      enjeuxDetails.forEach(enjeu => {
        enjeu.kpis.forEach(kpi => {
          expect(typeof kpi.label).toBe('string')
          expect(kpi.label.length).toBeGreaterThan(0)
        })
      })
    })

    it('each KPI has value as non-empty string', () => {
      enjeuxDetails.forEach(enjeu => {
        enjeu.kpis.forEach(kpi => {
          expect(typeof kpi.value).toBe('string')
          expect(kpi.value.length).toBeGreaterThan(0)
        })
      })
    })

    it('each KPI has icon (Lucide React component)', () => {
      enjeuxDetails.forEach(enjeu => {
        enjeu.kpis.forEach(kpi => {
          expect(kpi.icon).toBeDefined()
          expect(typeof kpi.icon).toBe('object')
        })
      })
    })

    it('each KPI trend is "up", "down", or "stable"', () => {
      enjeuxDetails.forEach(enjeu => {
        enjeu.kpis.forEach(kpi => {
          if (kpi.trend) {
            expect(['up', 'down', 'stable']).toContain(kpi.trend)
          }
        })
      })
    })
  })

  describe('Data consistency', () => {
    it('all keyPoints are non-empty strings', () => {
      enjeuxDetails.forEach(enjeu => {
        enjeu.keyPoints.forEach(point => {
          expect(typeof point).toBe('string')
          expect(point.length).toBeGreaterThan(0)
        })
      })
    })

    it('all actions are non-empty strings', () => {
      enjeuxDetails.forEach(enjeu => {
        enjeu.actions.forEach(action => {
          expect(typeof action).toBe('string')
          expect(action.length).toBeGreaterThan(0)
        })
      })
    })

    it('all challenges are non-empty strings', () => {
      enjeuxDetails.forEach(enjeu => {
        enjeu.challenges.forEach(challenge => {
          expect(typeof challenge).toBe('string')
          expect(challenge.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('getEnjeuxDetail function', () => {
    it('returns undefined for non-existent id', () => {
      expect(getEnjeuxDetail('non-existent')).toBeUndefined()
    })

    it('returns correct enjeu for "environnement" id', () => {
      const result = getEnjeuxDetail('environnement')
      expect(result).toBeDefined()
      expect(result?.id).toBe('environnement')
      expect(result?.title).toBe('Environnement')
    })

    it('returns correct enjeu for "social" id', () => {
      const result = getEnjeuxDetail('social')
      expect(result).toBeDefined()
      expect(result?.id).toBe('social')
      expect(result?.title).toBe('Politique Sociale')
    })

    it('returns correct enjeu for "gouvernance" id', () => {
      const result = getEnjeuxDetail('gouvernance')
      expect(result).toBeDefined()
      expect(result?.id).toBe('gouvernance')
      expect(result?.title).toBe('Conduite des Affaires')
    })

    it('is case-sensitive (returns undefined for "Environnement")', () => {
      expect(getEnjeuxDetail('Environnement')).toBeUndefined()
    })

    it('returns exact object reference from array', () => {
      const result = getEnjeuxDetail('environnement')
      const expected = enjeuxDetails.find(e => e.id === 'environnement')
      expect(result).toBe(expected)
    })

    it('handles empty string id (returns undefined)', () => {
      expect(getEnjeuxDetail('')).toBeUndefined()
    })
  })
})
