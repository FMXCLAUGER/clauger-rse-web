import {
  Leaf,
  Zap,
  Trash2,
  Target,
  Users,
  GraduationCap,
  Shield,
  TrendingUp,
  Scale,
  FileCheck,
  Lock,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"

export interface EnjeuxKPI {
  label: string
  value: string
  icon: LucideIcon
  trend?: "up" | "down" | "stable"
}

export interface EnjeuxDetail {
  id: string
  title: string
  description: string
  keyPoints: string[]
  kpis: EnjeuxKPI[]
  actions: string[]
  challenges: string[]
  dashboardTab: "environment" | "social" | "governance"
}

export const enjeuxDetails: EnjeuxDetail[] = [
  {
    id: "environnement",
    title: "Environnement",
    description:
      "Clauger s'engage à préserver le climat, les ressources naturelles et la santé de tous. Notre démarche environnementale se concentre sur la réduction de notre empreinte carbone, l'optimisation de notre consommation énergétique et la gestion responsable des déchets.",
    keyPoints: [
      "Premier bilan carbone réalisé en 2024 pour le périmètre France",
      "Programme Cap Climat lancé pour structurer notre démarche",
      "Focus sur la mobilisation des partenaires (92% des émissions en catégorie 1)",
      "Transition vers l'électricité verte sur nos sites",
      "Réduction des déplacements professionnels engagée",
    ],
    kpis: [
      {
        label: "Émissions totales",
        value: "718 000 teqCO₂",
        icon: Leaf,
        trend: "stable",
      },
      {
        label: "Scope 3",
        value: "99%",
        icon: AlertTriangle,
        trend: "stable",
      },
      {
        label: "Électricité verte",
        value: "En cours",
        icon: Zap,
        trend: "up",
      },
      {
        label: "Budget environnemental",
        value: "300 000 €",
        icon: Target,
        trend: "up",
      },
    ],
    actions: [
      "Déploiement du programme Cap Climat pour structurer la démarche environnementale",
      "Transition vers l'électricité verte sur l'ensemble des sites",
      "Réduction des déplacements professionnels (favoriser visio et train)",
      "Mobilisation des fournisseurs et partenaires sur leur empreinte carbone",
      "Mise en place d'indicateurs de suivi et de pilotage",
    ],
    challenges: [
      "Absence de cibles de réduction quantifiées à moyen et long terme",
      "Manque de données historiques pour mesurer les progrès",
      "Dépendance forte aux achats (92% des émissions en catégorie 1)",
      "Biodiversité non encore intégrée dans la stratégie RSE",
      "Nécessité d'embarquer l'ensemble de la chaîne de valeur",
    ],
    dashboardTab: "environment",
  },
  {
    id: "social",
    title: "Politique Sociale",
    description:
      "Chez Clauger, l'humain est au cœur de notre culture d'entreprise. Notre philosophie 'Un homme, une femme = un projet' illustre notre engagement envers nos collaborateurs. Nous développons les compétences, favorisons la diversité et garantissons la santé et la sécurité au travail.",
    keyPoints: [
      "1 302 collaborateurs en France (moyenne 2024)",
      "365 embauches dont 199 apprentis, démontrant notre engagement formation",
      "300 000€ de budget formation pour 55 000 heures dispensées",
      "Certification Qualiopi obtenue en 2022",
      "Valeurs HOPE (Humain, Ouverture, Performance, Engagement)",
    ],
    kpis: [
      {
        label: "Effectif France",
        value: "1 302",
        icon: Users,
        trend: "up",
      },
      {
        label: "Budget formation",
        value: "300 000 €",
        icon: GraduationCap,
        trend: "stable",
      },
      {
        label: "Heures de formation",
        value: "55 000 h",
        icon: TrendingUp,
        trend: "up",
      },
      {
        label: "Taux de fréquence (TF1)",
        value: "11,85",
        icon: Shield,
        trend: "down",
      },
    ],
    actions: [
      "Programme HOPE pour renforcer la culture d'entreprise",
      "Formation continue avec certification Qualiopi depuis 2022",
      "Programme d'apprentissage ambitieux (199 apprentis en 2024)",
      "Amélioration continue de la sécurité au travail",
      "Développement de l'employabilité et des compétences",
    ],
    challenges: [
      "Déséquilibre hommes/femmes persistant (84% / 16%)",
      "Réduction du taux de fréquence des accidents (TF1: 11,85)",
      "Attractivité dans un secteur en tension",
      "Rétention des talents et gestion de la mobilité interne",
      "Adaptation aux nouvelles attentes des générations Y et Z",
    ],
    dashboardTab: "social",
  },
  {
    id: "gouvernance",
    title: "Conduite des Affaires",
    description:
      "Clauger place l'éthique et la conformité au cœur de sa gouvernance. Notre engagement se traduit par des formations anti-corruption, une sécurité de l'information certifiée ISO 27001, et une démarche d'achats responsables en déploiement.",
    keyPoints: [
      "23,25% des collaborateurs formés à l'anti-corruption (2024)",
      "Objectif de 90% de formation anti-corruption d'ici 2025",
      "Certification ISO 27001 pour la sécurité de l'information (Azure)",
      "Zéro incident de corruption, d'éthique ou de protection des données en 2024",
      "Code de conduite fournisseurs en cours de déploiement",
    ],
    kpis: [
      {
        label: "Formation anti-corruption",
        value: "23,25%",
        icon: Scale,
        trend: "up",
      },
      {
        label: "Incidents éthique",
        value: "0",
        icon: CheckCircle2,
        trend: "stable",
      },
      {
        label: "Certification ISO 27001",
        value: "Actif",
        icon: Lock,
        trend: "stable",
      },
      {
        label: "Achats responsables",
        value: "En cours",
        icon: ShoppingCart,
        trend: "up",
      },
    ],
    actions: [
      "Formation anti-corruption étendue (objectif 90% en 2025)",
      "Politique de sécurité de l'information en 7 points",
      "Déploiement du code de conduite fournisseurs",
      "Évaluation RSE des fournisseurs via Planut",
      "Intégration de critères RSE dans 100% des nouveaux contrats d'ici 2028",
    ],
    challenges: [
      "Accélération du déploiement de la formation anti-corruption",
      "Évaluation systématique de la maturité RSE des fournisseurs",
      "Mise en place d'indicateurs de suivi pour les achats responsables",
      "Extension de la certification ISO 27001 à l'ensemble du SI",
      "Renforcement de la communication sur les dispositifs d'alerte éthique",
    ],
    dashboardTab: "governance",
  },
]

export function getEnjeuxDetail(id: string): EnjeuxDetail | undefined {
  return enjeuxDetails.find((enjeu) => enjeu.id === id)
}
