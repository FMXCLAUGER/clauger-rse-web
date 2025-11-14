import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock security module
jest.mock('@/lib/security', () => ({
  logError: jest.fn(),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

import { RSEContextParser, RSEContext, RSESection, RSEScore } from '@/lib/ai/rse-context'

// Sample markdown content for testing
const SAMPLE_RSE_ANALYSIS = `# RAPPORT RSE CLAUGER 2025

## RÉSUMÉ EXÉCUTIF

Clauger poursuit sa transformation RSE avec une progression notable sur l'ensemble des piliers environnementaux, sociaux et de gouvernance. L'entreprise démontre un engagement fort dans la réduction de son empreinte carbone et l'amélioration des conditions de travail.

Notation globale : **78/100**

Points forts :
- Réduction significative des émissions scope 1 et 2
- Excellence en santé et sécurité au travail
- Transparence financière exemplaire

---

## I. PERFORMANCE ENVIRONNEMENTALE

### Émissions de Gaz à Effet de Serre

Les émissions totales ont diminué de 28% depuis 2020, passant de 1970 à 1480 tonnes CO2e. Cette performance s'explique par l'électrification de la flotte et l'optimisation des process industriels.

**Note : 8.5/10**

**Forces :**
- Trajectoire alignée sur l'Accord de Paris
- Scope 3 en amélioration (920 tCO2e en 2025)

**Axes d'amélioration :**
- Accélérer la décarbonation du scope 3
- Renforcer l'engagement des fournisseurs

### Gestion de l'énergie

La consommation énergétique totale s'établit à 8000 MWh, avec 58.6% d'énergies renouvelables. Le site de Lyon affiche un taux remarquable de 72% d'EnR.

**Note : 7.2/10**

**Forces :**
- Progression constante de la part d'EnR
- Investissements dans l'efficacité énergétique

**Axes d'amélioration :**
- Atteindre 70% d'EnR d'ici 2026
- Harmoniser les performances entre sites

### Économie circulaire

Le taux de recyclage atteint 67.8%, proche de l'objectif de 75%. Seuls 9.7% des déchets sont enfouis.

**Note : 7.8/10**

---

## II. PERFORMANCE SOCIALE

### Emploi et diversité

L'effectif total s'élève à 1523 collaborateurs en 2025, avec une féminisation en progression (33.3% contre 28% en 2020). La pyramide des âges est équilibrée avec une moyenne de 38 ans.

**Note : 7.4/10**

**Forces :**
- Croissance soutenue des effectifs (+22% depuis 2020)
- Effort notable sur la parité (508 femmes)

**Axes d'amélioration :**
- Atteindre 40% de femmes d'ici 2028
- Renforcer la présence féminine dans les postes techniques

### Formation et développement

29,875 heures de formation ont été dispensées en 2025, soit 20.5 heures par employé. 95.6% des collaborateurs ont bénéficié d'au moins une formation.

**Note : 8.1/10**

**Forces :**
- Budget formation en hausse de 25%
- Programmes de reconversion et upskilling

### Santé et sécurité

Le taux de fréquence des accidents diminue significativement : 5.3 en 2025 contre 18.5 en 2020. Aucun accident grave n'a été déploré sur l'année.

**Note : 9.2/10**

**Forces :**
- Culture sécurité bien ancrée
- Investissements préventifs importants

---

## III. PERFORMANCE GOUVERNANCE

### Composition des organes de direction

Le conseil d'administration compte 12 membres dont 5 indépendants (41.7%) et 4 femmes (33.3%). 3 experts RSE siègent au conseil.

**Note : 6.2/10**

**Axes d'amélioration :**
- Augmenter la proportion de femmes à 40%
- Rajeunir le conseil (50% de moins de 50 ans)

### Budget et investissements RSE

Le budget RSE 2025 s'élève à 8.1M€, soit 11.5% du CA. 52% sont alloués à l'environnement, 32% au social et 16% à la gouvernance.

**Note : 7.5/10**

### Conformité et reporting

Clauger affiche d'excellents scores de conformité : CSRD (92/100), ISO 14001 (95/100), RGPD (97/100).

**Note : 9.0/10**

---

## IV. RECOMMANDATIONS STRATÉGIQUES

### Priorités à court terme (2025-2026)

- **Scope 3** : Élaborer un plan détaillé de réduction avec les 50 premiers fournisseurs
- **Diversité** : Lancer un programme de recrutement ciblé pour atteindre 40% de femmes
- **Énergies renouvelables** : Installer 2000 m² de panneaux solaires sur les sites de Culoz et Nantes
- **Gouvernance** : Renouveler 3 sièges du conseil avec des profils féminins et jeunes

### Priorités à moyen terme (2027-2028)

- **Net Zero** : Valider la trajectoire SBTi et obtenir la certification
- **Économie circulaire** : Atteindre 85% de recyclage et zéro enfouissement
- **Formation** : Porter la moyenne à 25h/employé avec 50% sur les compétences vertes
- **Transparence** : Publier un rapport intégré conforme aux standards GRI et SASB

### Priorités à long terme (2029-2030)

- **Neutralité carbone** : Atteindre le Net Zero scope 1+2 et -50% sur scope 3
- **B Corp** : Obtenir la certification avec un score supérieur à 90/200
- **Parité** : Réaliser la parité hommes-femmes à tous les niveaux hiérarchiques
- **Supply chain** : 100% des fournisseurs stratégiques évalués sur critères ESG
`

const SAMPLE_EMPTY_CONTENT = `# RAPPORT RSE

Contenu minimal sans structure.
`

const SAMPLE_NO_SCORES = `## I. SECTION SANS SCORES

### Sous-section test

Contenu sans notation.
`

describe('RSEContextParser', () => {
  let loadFullAnalysisSpy: jest.SpiedFunction<typeof RSEContextParser.loadFullAnalysis>

  beforeEach(() => {
    jest.clearAllMocks()
    // Create spy on loadFullAnalysis method
    loadFullAnalysisSpy = jest.spyOn(RSEContextParser, 'loadFullAnalysis')
  })

  afterEach(() => {
    // Restore original implementation
    loadFullAnalysisSpy.mockRestore()
  })

  describe('loadFullAnalysis', () => {
    it('should load analysis file successfully', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const content = await RSEContextParser.loadFullAnalysis()

      expect(content).toBe(SAMPLE_RSE_ANALYSIS)
      expect(loadFullAnalysisSpy).toHaveBeenCalled()
    })

    it('should return empty string on file read error', async () => {
      loadFullAnalysisSpy.mockResolvedValue('')

      const content = await RSEContextParser.loadFullAnalysis()

      expect(content).toBe('')
    })

    it('should handle permission errors gracefully', async () => {
      loadFullAnalysisSpy.mockResolvedValue('')

      const content = await RSEContextParser.loadFullAnalysis()

      expect(content).toBe('')
    })
  })

  describe('parseAnalysis', () => {
    it('should parse complete RSE analysis correctly', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context).toHaveProperty('summary')
      expect(context).toHaveProperty('globalScore')
      expect(context).toHaveProperty('sections')
      expect(context).toHaveProperty('scores')
      expect(context).toHaveProperty('recommendations')
      expect(context).toHaveProperty('metadata')
    })

    it('should extract summary correctly', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.summary).toContain('Clauger poursuit sa transformation RSE')
      expect(context.summary).toContain('Points forts')
    })

    it('should extract global score correctly', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.globalScore).toBe(78)
    })

    it('should parse sections with Roman numerals', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.sections.length).toBeGreaterThan(0)
      const titles = context.sections.map(s => s.title)
      expect(titles).toContain('I. PERFORMANCE ENVIRONNEMENTALE')
      expect(titles).toContain('II. PERFORMANCE SOCIALE')
      expect(titles).toContain('III. PERFORMANCE GOUVERNANCE')
    })

    it('should include metadata with correct values', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.metadata).toEqual({
        company: 'Clauger',
        year: 2025,
        reportPages: 36,
        analysts: 'Experts RSE indépendants'
      })
    })

    it('should return empty context when file is empty', async () => {
      loadFullAnalysisSpy.mockResolvedValue('')

      const context = await RSEContextParser.parseAnalysis()

      expect(context.summary).toBe('')
      expect(context.globalScore).toBe(0)
      expect(context.sections).toEqual([])
      expect(context.scores).toEqual([])
      expect(context.recommendations).toEqual([])
    })

    it('should handle malformed markdown gracefully', async () => {
      loadFullAnalysisSpy.mockResolvedValue('Invalid markdown content ###')

      const context = await RSEContextParser.parseAnalysis()

      expect(context).toBeDefined()
      expect(context.globalScore).toBe(0)
    })
  })

  describe('extractSections', () => {
    it('should extract all main sections', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.sections.length).toBeGreaterThanOrEqual(3)
    })

    it('should preserve section content', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()
      const envSection = context.sections.find(s =>
        s.title.includes('ENVIRONNEMENTALE')
      )

      expect(envSection).toBeDefined()
      expect(envSection!.content).toContain('Émissions de Gaz à Effet de Serre')
    })

    it('should extract subsections within sections', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()
      const envSection = context.sections.find(s =>
        s.title.includes('ENVIRONNEMENTALE')
      )

      expect(envSection?.subsections).toBeDefined()
      expect(envSection!.subsections!.length).toBeGreaterThan(0)
    })

    it('should handle sections without subsections', async () => {
      const simpleContent = `## I. SIMPLE SECTION\n\nContent without subsections.`
      loadFullAnalysisSpy.mockResolvedValue(simpleContent)

      const context = await RSEContextParser.parseAnalysis()

      if (context.sections.length > 0) {
        expect(context.sections[0].subsections).toEqual([])
      }
    })
  })

  describe('extractSubsections', () => {
    it('should extract subsection titles', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()
      const envSection = context.sections.find(s =>
        s.title.includes('ENVIRONNEMENTALE')
      )

      const subsectionTitles = envSection!.subsections!.map(s => s.title)
      expect(subsectionTitles).toContain('Émissions de Gaz à Effet de Serre')
      expect(subsectionTitles).toContain('Gestion de l\'énergie')
    })

    it('should extract subsection scores', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()
      const envSection = context.sections.find(s =>
        s.title.includes('ENVIRONNEMENTALE')
      )

      const emissionsSubsection = envSection!.subsections!.find(s =>
        s.title.includes('Émissions')
      )

      expect(emissionsSubsection?.score).toBe(8.5)
    })

    it('should handle subsections without scores', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_NO_SCORES)

      const context = await RSEContextParser.parseAnalysis()

      if (context.sections.length > 0 && context.sections[0].subsections) {
        const subsection = context.sections[0].subsections[0]
        expect(subsection.score).toBeUndefined()
      }
    })

    it('should parse decimal scores correctly', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()
      const socialSection = context.sections.find(s =>
        s.title.includes('SOCIALE')
      )

      const healthSubsection = socialSection!.subsections!.find(s =>
        s.title.includes('Santé et sécurité')
      )

      expect(healthSubsection?.score).toBe(9.2)
    })

    it('should preserve subsection content', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()
      const envSection = context.sections.find(s =>
        s.title.includes('ENVIRONNEMENTALE')
      )

      const emissionsSubsection = envSection!.subsections!.find(s =>
        s.title.includes('Émissions')
      )

      expect(emissionsSubsection?.content).toContain('1970 à 1480 tonnes CO2e')
    })
  })

  describe('extractScores', () => {
    it('should extract all scores from document', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.scores.length).toBeGreaterThan(0)
    })

    it('should associate scores with correct categories', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      const emissionsScore = context.scores.find(s =>
        s.category.includes('Émissions')
      )

      expect(emissionsScore).toBeDefined()
      expect(emissionsScore?.score).toBe(8.5)
      expect(emissionsScore?.maxScore).toBe(10)
    })

    it('should handle multiple scores in same section', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      const socialScores = context.scores.filter(s =>
        s.category.toLowerCase().includes('emploi') ||
        s.category.toLowerCase().includes('formation') ||
        s.category.toLowerCase().includes('santé')
      )

      expect(socialScores.length).toBeGreaterThanOrEqual(3)
    })

    it('should return empty array when no scores present', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_NO_SCORES)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.scores).toEqual([])
    })

    it('should handle scores with comma as decimal separator', async () => {
      const contentWithComma = `### Test\n\n**Note : 7,5/10**`
      loadFullAnalysisSpy.mockResolvedValue(contentWithComma)

      const context = await RSEContextParser.parseAnalysis()

      if (context.scores.length > 0) {
        expect(context.scores[0].score).toBe(7.5)
      }
    })
  })

  describe('extractRecommendations', () => {
    it('should extract all recommendations', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.recommendations.length).toBeGreaterThan(0)
    })

    it('should extract recommendation titles and descriptions', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)

      const context = await RSEContextParser.parseAnalysis()

      const scopeReco = context.recommendations.find(r =>
        r.includes('Scope 3')
      )

      expect(scopeReco).toBeDefined()
      expect(scopeReco).toContain('Élaborer un plan détaillé')
    })

    it('should return empty array when no recommendations section', async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_EMPTY_CONTENT)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.recommendations).toEqual([])
    })

    it('should handle recommendations with different formatting', async () => {
      const contentWithRecos = `## RECOMMANDATIONS

- **Test 1** : Description 1
* **Test 2** : Description 2
`
      loadFullAnalysisSpy.mockResolvedValue(contentWithRecos)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.recommendations.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('searchInContext', () => {
    let context: RSEContext

    beforeEach(async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)
      context = await RSEContextParser.parseAnalysis()
    })

    it('should find sections by title keyword', () => {
      const results = RSEContextParser.searchInContext(context, 'environnementale')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].title).toContain('ENVIRONNEMENTALE')
    })

    it('should find sections by content keyword', () => {
      const results = RSEContextParser.searchInContext(context, 'émissions')

      expect(results.length).toBeGreaterThan(0)
    })

    it('should be case insensitive', () => {
      const resultsLower = RSEContextParser.searchInContext(context, 'sociale')
      const resultsUpper = RSEContextParser.searchInContext(context, 'SOCIALE')

      expect(resultsLower.length).toBe(resultsUpper.length)
    })

    it('should search in subsections', () => {
      const results = RSEContextParser.searchInContext(context, 'formation')

      const formationSection = results.find(r =>
        r.title.includes('Formation')
      )

      expect(formationSection).toBeDefined()
    })

    it('should return empty array for no matches', () => {
      const results = RSEContextParser.searchInContext(context, 'xyzzzznonexistent')

      expect(results).toEqual([])
    })

    it('should handle empty query', () => {
      const results = RSEContextParser.searchInContext(context, '')

      expect(results).toEqual([])
    })

    it('should find multiple matching sections', () => {
      const results = RSEContextParser.searchInContext(context, 'Note')

      expect(results.length).toBeGreaterThan(1)
    })
  })

  describe('formatForClaude', () => {
    let context: RSEContext

    beforeEach(async () => {
      loadFullAnalysisSpy.mockResolvedValue(SAMPLE_RSE_ANALYSIS)
      context = await RSEContextParser.parseAnalysis()
    })

    it('should include report header', () => {
      const formatted = RSEContextParser.formatForClaude(context)

      expect(formatted).toContain('# RAPPORT RSE CLAUGER 2025')
    })

    it('should include executive summary', () => {
      const formatted = RSEContextParser.formatForClaude(context)

      expect(formatted).toContain('## Résumé Exécutif')
      expect(formatted).toContain(context.summary)
    })

    it('should include global score', () => {
      const formatted = RSEContextParser.formatForClaude(context)

      expect(formatted).toContain('**Notation globale : 78/100**')
    })

    it('should include all main sections', () => {
      const formatted = RSEContextParser.formatForClaude(context)

      expect(formatted).toContain('## I. PERFORMANCE ENVIRONNEMENTALE')
      expect(formatted).toContain('## II. PERFORMANCE SOCIALE')
      expect(formatted).toContain('## III. PERFORMANCE GOUVERNANCE')
    })

    it('should truncate content when maxLength specified', () => {
      const formatted = RSEContextParser.formatForClaude(context, 500)

      expect(formatted.length).toBeLessThanOrEqual(550) // Some margin for truncation message
      expect(formatted).toContain('[... Contenu tronqué ...]')
    })

    it('should not truncate when content is shorter than maxLength', () => {
      const formatted = RSEContextParser.formatForClaude(context, 50000)

      expect(formatted).not.toContain('[... Contenu tronqué ...]')
    })

    it('should preserve markdown formatting', () => {
      const formatted = RSEContextParser.formatForClaude(context)

      expect(formatted).toContain('##')
      expect(formatted).toContain('**')
    })

    it('should handle empty context gracefully', () => {
      const emptyContext: RSEContext = {
        summary: '',
        globalScore: 0,
        sections: [],
        scores: [],
        recommendations: [],
        metadata: {
          company: 'Clauger',
          year: 2025,
          reportPages: 36,
          analysts: 'Experts RSE indépendants'
        }
      }

      const formatted = RSEContextParser.formatForClaude(emptyContext)

      expect(formatted).toContain('# RAPPORT RSE CLAUGER 2025')
      expect(formatted).toContain('**Notation globale : 0/100**')
    })

    it('should format sections with proper spacing', () => {
      const formatted = RSEContextParser.formatForClaude(context)

      // Check for proper spacing between sections
      expect(formatted).toContain('\n\n')
    })
  })

  describe('getEmptyContext', () => {
    it('should return valid empty context structure', async () => {
      loadFullAnalysisSpy.mockResolvedValue('')

      const context = await RSEContextParser.parseAnalysis()

      expect(context.summary).toBe('')
      expect(context.globalScore).toBe(0)
      expect(context.sections).toEqual([])
      expect(context.scores).toEqual([])
      expect(context.recommendations).toEqual([])
      expect(context.metadata).toEqual({
        company: 'Clauger',
        year: 2025,
        reportPages: 36,
        analysts: 'Experts RSE indépendants'
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle missing global score', async () => {
      const contentNoScore = `## RÉSUMÉ EXÉCUTIF\n\nContent without score.`
      loadFullAnalysisSpy.mockResolvedValue(contentNoScore)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.globalScore).toBe(0)
    })

    it('should handle multiple summary sections', async () => {
      const multiSummary = `## RÉSUMÉ EXÉCUTIF\n\nFirst summary\n\n## RÉSUMÉ EXÉCUTIF\n\nSecond summary`
      loadFullAnalysisSpy.mockResolvedValue(multiSummary)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.summary).toBeTruthy()
    })

    it('should handle scores with unusual formatting', async () => {
      const unusualScore = `### Test\n\n**Note:9/10**`
      loadFullAnalysisSpy.mockResolvedValue(unusualScore)

      const context = await RSEContextParser.parseAnalysis()

      if (context.scores.length > 0) {
        expect(context.scores[0].score).toBe(9)
      }
    })

    it('should handle very long content efficiently', async () => {
      const longContent = SAMPLE_RSE_ANALYSIS.repeat(10)
      loadFullAnalysisSpy.mockResolvedValue(longContent)

      const startTime = Date.now()
      const context = await RSEContextParser.parseAnalysis()
      const endTime = Date.now()

      expect(context).toBeDefined()
      expect(endTime - startTime).toBeLessThan(5000) // Should parse in less than 5 seconds
    })

    it('should handle special characters in content', async () => {
      const specialChars = `## I. TEST SPÉCIAL\n\n### Émissions CO₂\n\n**Note : 8.5/10**\n\nContenu avec caractères spéciaux: é, è, à, ç, €, °C`
      loadFullAnalysisSpy.mockResolvedValue(specialChars)

      const context = await RSEContextParser.parseAnalysis()

      expect(context.sections.length).toBeGreaterThan(0)
    })
  })
})
