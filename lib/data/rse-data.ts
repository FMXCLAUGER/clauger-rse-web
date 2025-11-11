// Données RSE Clauger 2025 - Mockées depuis le rapport PDF

export interface EnvironmentData {
  emissions: Array<{ year: number; scope1: number; scope2: number; scope3: number }>
  energy: Array<{ site: string; consumption: number; renewable: number }>
  waste: { recycled: number; incinerated: number; landfill: number }
  targets: Array<{ name: string; target: number; actual: number; unit: string }>
}

export interface SocialData {
  workforce: Array<{ year: number; total: number; men: number; women: number }>
  ageDistribution: Array<{ range: string; count: number }>
  training: Array<{ year: number; hours: number; employees: number }>
  accidents: Array<{ year: number; count: number; frequency: number }>
}

export interface GovernanceData {
  board: Array<{ category: string; count: number; percentage: number }>
  budget: Array<{ pillar: string; amount: number; percentage: number }>
  compliance: Array<{ area: string; score: number; maxScore: number }>
  initiatives: Array<{ date: string; title: string; status: string }>
}

// Données Environnement
export const environmentData: EnvironmentData = {
  emissions: [
    { year: 2020, scope1: 450, scope2: 320, scope3: 1200 },
    { year: 2021, scope1: 430, scope2: 305, scope3: 1150 },
    { year: 2022, scope1: 410, scope2: 290, scope3: 1100 },
    { year: 2023, scope1: 385, scope2: 270, scope3: 1050 },
    { year: 2024, scope1: 360, scope2: 245, scope3: 980 },
    { year: 2025, scope1: 340, scope2: 220, scope3: 920 },
  ],
  energy: [
    { site: "Lyon", consumption: 2400, renewable: 65 },
    { site: "Culoz", consumption: 1850, renewable: 58 },
    { site: "Paris", consumption: 1200, renewable: 72 },
    { site: "Nantes", consumption: 980, renewable: 45 },
    { site: "Autres", consumption: 1570, renewable: 52 },
  ],
  waste: {
    recycled: 67.8,
    incinerated: 22.5,
    landfill: 9.7,
  },
  targets: [
    { name: "Réduction CO2", target: 42, actual: 38.5, unit: "%" },
    { name: "Énergie renouvelable", target: 70, actual: 58.6, unit: "%" },
    { name: "Recyclage", target: 75, actual: 67.8, unit: "%" },
    { name: "Consommation eau", target: -20, actual: -17.3, unit: "%" },
  ],
}

// Données Social
export const socialData: SocialData = {
  workforce: [
    { year: 2020, total: 1245, men: 896, women: 349 },
    { year: 2021, total: 1298, men: 920, women: 378 },
    { year: 2022, total: 1356, men: 945, women: 411 },
    { year: 2023, total: 1402, men: 965, women: 437 },
    { year: 2024, total: 1467, men: 992, women: 475 },
    { year: 2025, total: 1523, men: 1015, women: 508 },
  ],
  ageDistribution: [
    { range: "< 25 ans", count: 127 },
    { range: "25-34 ans", count: 412 },
    { range: "35-44 ans", count: 485 },
    { range: "45-54 ans", count: 358 },
    { range: "55+ ans", count: 141 },
  ],
  training: [
    { year: 2020, hours: 18450, employees: 1098 },
    { year: 2021, hours: 20120, employees: 1156 },
    { year: 2022, hours: 22890, employees: 1234 },
    { year: 2023, hours: 24560, employees: 1298 },
    { year: 2024, hours: 27340, employees: 1389 },
    { year: 2025, hours: 29875, employees: 1456 },
  ],
  accidents: [
    { year: 2020, count: 23, frequency: 18.5 },
    { year: 2021, count: 19, frequency: 14.6 },
    { year: 2022, count: 16, frequency: 11.8 },
    { year: 2023, count: 14, frequency: 10.0 },
    { year: 2024, count: 11, frequency: 7.5 },
    { year: 2025, count: 8, frequency: 5.3 },
  ],
}

// Données Gouvernance
export const governanceData: GovernanceData = {
  board: [
    { category: "Membres indépendants", count: 5, percentage: 41.7 },
    { category: "Femmes", count: 4, percentage: 33.3 },
    { category: "Experts RSE", count: 3, percentage: 25.0 },
    { category: "Moins de 50 ans", count: 4, percentage: 33.3 },
  ],
  budget: [
    { pillar: "Environnement", amount: 4200000, percentage: 52 },
    { pillar: "Social", amount: 2600000, percentage: 32 },
    { pillar: "Gouvernance", amount: 1300000, percentage: 16 },
  ],
  compliance: [
    { area: "CSRD", score: 92, maxScore: 100 },
    { area: "ISO 14001", score: 95, maxScore: 100 },
    { area: "ISO 45001", score: 88, maxScore: 100 },
    { area: "GRI Standards", score: 90, maxScore: 100 },
    { area: "RGPD", score: 97, maxScore: 100 },
  ],
  initiatives: [
    { date: "2025-01-15", title: "Lancement stratégie Net Zero 2040", status: "completed" },
    { date: "2025-02-20", title: "Certification B Corp en cours", status: "in-progress" },
    { date: "2025-03-10", title: "Politique diversité & inclusion", status: "completed" },
    { date: "2025-04-05", title: "Accord télétravail généralisé", status: "completed" },
    { date: "2025-05-12", title: "Programme mentorat féminin", status: "in-progress" },
    { date: "2025-06-01", title: "Audit supply chain ESG", status: "planned" },
  ],
}

// Fonctions utilitaires
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`
}
