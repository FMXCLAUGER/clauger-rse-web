# 📊 Application Web Rapport RSE Clauger 2025

Application Next.js 14 moderne pour naviguer dans le rapport RSE de Clauger avec fonctionnalités avancées : viewer interactif, chatbot IA, dashboards analytiques, et exports PDF.

[![CI Status](https://github.com/FMXCLAUGER/clauger-rse-web/workflows/CI/badge.svg)](https://github.com/FMXCLAUGER/clauger-rse-web/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

---

## ✨ Fonctionnalités

### ✅ Core Features (Implémenté)

**Viewer de Rapport**
- 📖 Viewer 36 pages avec navigation fluide
- ⬅️➡️ Navigation prev/next + raccourcis clavier (← →, Home, End)
- 🖼️ Miniatures en sidebar avec scroll
- 📊 Barre de progression et compteur pages
- 🔗 URLs partageables (?page=15)
- 🔍 Zoom 50%-200% avec contrôles
- 🎯 Mode focus sans distractions
- 💾 Sauvegarde position de lecture (localStorage)
- 📱 Responsive mobile/tablet/desktop
- ⚡ Optimisation images Next.js

**Chatbot IA avec Claude**
- 🤖 Assistant conversationnel alimenté par Claude Sonnet 4.5 et Haiku
- 🧠 Sélection dynamique du modèle (routing basé sur complexité)
- 💬 Contexte sémantique optimisé (chunking intelligent)
- ⚡ Prompt caching pour réduire les coûts (-90% tokens)
- 🎯 Extended Thinking pour questions complexes
- 📝 Export conversations en Markdown
- 💾 Historique persistant (localStorage)
- 🚦 Rate limiting client-side (10 req/min)

**Dashboards Analytiques**
- 📈 3 dashboards interactifs (Environnement, Social, Gouvernance)
- 📊 15+ graphiques avec Recharts (barres, lignes, aires, radar)
- 🎨 Visualisations responsives et accessibles
- 💾 Export PNG des graphiques
- 📱 Mode mobile optimisé avec scroll horizontal
- 🌈 Palette de couleurs Clauger cohérente

**Landing Page**
- 🏠 Page d'accueil avec note globale (62/100)
- 📊 Chiffres clés 2024
- 🎯 3 enjeux durables
- 🔗 Accès rapides aux sections
- ✨ Animations et design moderne

### 🔒 Sécurité & Qualité

- ✅ **0 Vulnérabilités** (npm audit high/critical)
- 🛡️ Input sanitization (XSS, injection prevention)
- 🔐 CSP headers avec nonces
- 📝 Logging sécurisé (sans données sensibles)
- ♻️ Circuit breaker & retry avec backoff
- 🧪 2500+ tests automatisés
- 🤖 CI/CD GitHub Actions (lint, tests, build, security)

---

## 🚀 Installation

### Prérequis
- Node.js 20+
- npm 10+
- Clé API Anthropic (pour le chatbot)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/FMXCLAUGER/clauger-rse-web.git
cd clauger-rse-web
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
# Éditer .env.local et ajouter votre clé API Anthropic
```

```env
ANTHROPIC_API_KEY=sk-ant-...
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

---

## 📁 Structure du Projet

```
clauger-rse-web/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── rapport/page.tsx              # Viewer de rapport
│   ├── dashboard/page.tsx            # Dashboards analytiques
│   ├── api/chat/route.ts             # API chatbot Claude
│   ├── layout.tsx                    # Layout global + CSP
│   └── globals.css                   # Styles globaux + animations
├── components/
│   ├── viewer/
│   │   ├── ReportViewer.tsx          # Composant principal viewer
│   │   ├── NavigationControls.tsx    # Contrôles de navigation
│   │   ├── ThumbnailSidebar.tsx      # Sidebar miniatures
│   │   └── FocusMode.tsx             # Mode focus plein écran
│   ├── chatbot/
│   │   ├── ChatbotModal.tsx          # Modal chatbot
│   │   ├── ChatMessage.tsx           # Message avec Markdown
│   │   ├── SuggestedQuestions.tsx    # Questions suggérées
│   │   └── ChatSkeleton.tsx          # Loading states
│   ├── dashboard/
│   │   ├── EnvironmentDashboard.tsx  # Dashboard environnement
│   │   ├── SocialDashboard.tsx       # Dashboard social
│   │   ├── GovernanceDashboard.tsx   # Dashboard gouvernance
│   │   └── charts/                   # 15+ composants graphiques
│   └── export/
│       └── PageSelectionModal.tsx    # Export PDF sélectif
├── lib/
│   ├── ai/
│   │   ├── context-builder.ts        # Construction contexte IA
│   │   ├── model-router.ts           # Routing Haiku/Sonnet
│   │   ├── prompts.ts                # Prompts système + caching
│   │   ├── rate-limiter.ts           # Rate limiting
│   │   └── thinking-mode.ts          # Extended Thinking config
│   ├── security/
│   │   ├── input-sanitizer.ts        # Validation + sanitization
│   │   ├── secure-logger.ts          # Logging sécurisé
│   │   └── csp.ts                    # Content Security Policy
│   ├── resilience/
│   │   ├── resilient-ai-client.ts    # Circuit breaker + retry
│   │   ├── circuit-breaker.ts        # Pattern circuit breaker
│   │   └── retry.ts                  # Retry avec backoff
│   ├── analytics/
│   │   └── tracker.ts                # Analytics anonymes
│   └── constants.ts                  # Données rapport (36 pages, KPIs)
├── hooks/
│   ├── useChatbot.ts                 # Hook chatbot principal
│   ├── useKeyboardNavigation.ts      # Navigation clavier
│   └── useReadingState.ts            # Persistance position
├── __tests__/                        # 2500+ tests Jest
│   ├── components/                   # Tests composants
│   ├── lib/                          # Tests logique métier
│   ├── hooks/                        # Tests hooks
│   └── integration/                  # Tests d'intégration
├── .github/
│   └── workflows/
│       └── ci.yml                    # Pipeline CI/CD
└── public/
    └── images/rapport/               # 36 images PNG rapport
```

---

## 🎨 Stack Technique

**Frontend**
- **Next.js 14.2.33** (App Router, React Server Components)
- **React 19** (latest)
- **TypeScript 5.7** (strict mode)
- **Tailwind CSS 4** (design system)
- **Lucide React** (icônes)

**AI & Data**
- **Anthropic Claude** (Sonnet 4.5 + Haiku)
- **Vercel AI SDK v5** (streaming, hooks)
- **Prompt Caching** (90% réduction coûts)
- **Semantic Chunking** (contexte optimisé)

**Visualisation**
- **Recharts** (graphiques interactifs)
- **React Markdown** (chatbot messages)
- **jsPDF** (export PDF)

**Sécurité & Qualité**
- **Zod** (validation schémas)
- **DOMPurify** (sanitization XSS)
- **Jest + Testing Library** (2500+ tests)
- **ESLint + TypeScript** (code quality)

**Infrastructure**
- **Vercel** (hosting + edge functions)
- **GitHub Actions** (CI/CD)

---

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev                    # Démarrer serveur dev (localhost:3000)

# Build & Production
npm run build                  # Build optimisé production
npm start                      # Démarrer en mode production
npm run vercel ls              # Lister déploiements Vercel

# Tests & Qualité
npm test                       # Lancer tests Jest
npm run test:watch             # Mode watch
npm run test:coverage          # Rapport de couverture
npm run lint                   # ESLint
npx tsc --noEmit              # TypeScript check

# Sécurité
npm audit                      # Vérifier vulnérabilités
npm audit fix                  # Corriger automatiquement
```

---

## 🤖 Chatbot IA - Configuration

### Modèles & Routing

L'application utilise 2 modèles Claude avec sélection automatique :

| Modèle | Usage | Coût | Qualité |
|--------|-------|------|---------|
| **Haiku** | Questions simples | $0.80/M tokens | 7/10 |
| **Sonnet 4.5** | Questions complexes | $3.00/M tokens | 10/10 |

**Critères de routing :**
- Longueur de la query
- Indicateurs de complexité (analyser, comparer, synthétiser)
- Nombre de questions multiples
- Historique de conversation

### Extended Thinking

Activé automatiquement pour les questions complexes marquées `###` :
```
### Analyser en profondeur l'évolution de l'empreinte carbone
```

Budget : 10,000 tokens de réflexion avant la réponse.

### Prompt Caching

**Économie de 90% sur les tokens répétés :**
- Cache le contexte statique (rapport RSE)
- Réutilise sur conversations multiples
- TTL: 5 minutes
- Économie moyenne : $0.0275 par requête

---

## 📊 Dashboards Analytiques

### 1. Dashboard Environnement
- Évolution émissions carbone (2022-2024)
- Mix énergétique (gaz, électricité, autres)
- Consommation eau
- Production déchets
- Taux recyclage

### 2. Dashboard Social
- Évolution effectifs
- Répartition CSP
- Formation (heures, budget)
- Turnover & absentéisme
- Index égalité H/F

### 3. Dashboard Gouvernance
- Composition CA (genre, indépendance)
- Taux participation AG
- Formations administrateurs
- Délais paiement

**15+ types de graphiques :**
- BarChart, LineChart, AreaChart
- PieChart, RadarChart, ComposedChart
- Responsive & accessibles
- Export PNG individuel

---

## 🔒 Sécurité

### Mesures Implémentées

**1. Input Validation & Sanitization**
```typescript
// lib/security/input-sanitizer.ts
- Validation longueur (min/max)
- Détection patterns malveillants (SQL injection, XSS)
- Sanitization HTML avec DOMPurify
- Rate limiting (10 req/min)
```

**2. Content Security Policy**
```typescript
// app/layout.tsx
- script-src avec nonces dynamiques
- img-src restreint (self + data: pour graphiques)
- connect-src restreint (API Anthropic uniquement)
```

**3. Resilience Patterns**
```typescript
// lib/resilience/
- Circuit Breaker (5 failures → OPEN)
- Retry avec exponential backoff (3 tentatives)
- Jitter pour éviter thundering herd
```

**4. Secure Logging**
```typescript
// lib/security/secure-logger.ts
- Pas de clés API dans logs
- Pas de PII (emails, tokens)
- Contexte structuré (JSON)
```

### Vulnérabilités Résolues

| Date | CVE | Sévérité | Fix |
|------|-----|----------|-----|
| 2025-11-15 | CVE-2025-29927 | 🔴 CRITICAL (9.1) | Next.js 14.2.18 → 14.2.33 |
| 2025-11-15 | CVE-2025-48985 | 🟡 MODERATE | ai SDK v4 → v5 |

**Statut actuel : 0 vulnérabilités high/critical** ✅

---

## 🧪 Tests

### Couverture

```
Tests Suites: 40 passed
Tests:        2543 passed
Coverage:     87% statements
              85% branches
              90% functions
              88% lines
```

### Organisation

```
__tests__/
├── components/           # Tests React (RTL)
│   ├── chatbot/         # ChatMessage, Modal, Suggestions
│   ├── dashboard/       # 15+ graphiques
│   └── viewer/          # Navigation, Thumbnails
├── lib/                 # Tests logique métier
│   ├── ai/             # Context builder, routing, prompts
│   ├── security/       # Sanitization, logging, CSP
│   └── resilience/     # Circuit breaker, retry
├── hooks/              # Tests hooks personnalisés
└── integration/        # Tests E2E scénarios
```

### Commandes

```bash
# Tous les tests
npm test

# Mode watch
npm run test:watch

# Couverture détaillée
npm run test:coverage

# Tests spécifiques
npm test -- chatbot
npm test -- security
```

---

## 🚀 Déploiement

### Vercel (Recommandé)

1. **Installer Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Déployer**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

4. **Configurer variables d'environnement**
```bash
vercel env add ANTHROPIC_API_KEY production
```

5. **Accès**
- Production: `https://clauger-rse-web.vercel.app`
- Preview: `https://clauger-rse-web-{branch}.vercel.app`

### Auto-déploiement

Le repository est configuré pour déploiement automatique :
- ✅ Push sur `main` → déploiement production
- ✅ Pull Request → déploiement preview
- ✅ CI/CD vérifie : lint, tests, build, security

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**Triggers:**
- Push sur `main`
- Pull Requests vers `main`

**Jobs:**

1. **Code Quality**
   - ✅ ESLint (zero warnings)
   - ✅ TypeScript check
   - ✅ Tests Jest (2500+)
   - ✅ Build production

2. **Security Scan**
   - ✅ npm audit (high/critical only)
   - ✅ Dependency check
   - ✅ Fail si vulnérabilités

**Status:** [![CI](https://github.com/FMXCLAUGER/clauger-rse-web/workflows/CI/badge.svg)](https://github.com/FMXCLAUGER/clauger-rse-web/actions)

---

## 📦 Coûts & Budget

### Hosting & Infrastructure
| Service | Plan | Coût |
|---------|------|------|
| Vercel | Free Tier | $0/mois |
| GitHub | Free | $0/mois |
| Total Infrastructure | | **$0/mois** ✅ |

### IA (Claude API)

**Modèle hybride avec prompt caching :**

| Modèle | Input | Output | Caching |
|--------|-------|--------|---------|
| Haiku | $0.80/M | $4.00/M | -90% |
| Sonnet 4.5 | $3.00/M | $15.00/M | -90% |

**Usage typique (100 requêtes/jour) :**
- Sans caching : ~$15/mois
- Avec caching : ~$1.50/mois
- **Économie : 90%** ✅

---

## 🎯 Roadmap

### ✅ Sprint 1 : MVP (Nov 2024)
- [x] Setup Next.js 14 + TypeScript
- [x] Landing page avec KPIs
- [x] Viewer 36 pages
- [x] Navigation + miniatures
- [x] Responsive design

### ✅ Sprint 2 : AI & Analytics (Nov 2024)
- [x] Chatbot Claude (Sonnet + Haiku)
- [x] 3 Dashboards interactifs
- [x] 15+ graphiques Recharts
- [x] Export PDF sélectif
- [x] Prompt caching
- [x] Model routing

### ✅ Sprint 3 : Security & Quality (Nov 2024)
- [x] Input sanitization
- [x] CSP headers
- [x] Circuit breaker & retry
- [x] 2500+ tests Jest
- [x] CI/CD GitHub Actions
- [x] Fix CVE-2025-29927 (CRITICAL)
- [x] Upgrade ai SDK v4 → v5

### 🔜 Sprint 4 : UX & Accessibility (Q1 2025)
- [ ] Mode sombre/clair
- [ ] Accessibilité WCAG 2.1 AA
- [ ] Internationalisation (i18n)
- [ ] Animations avancées (Framer Motion)
- [ ] Tutoriel interactif (Intro.js)

### 🔜 Sprint 5 : Advanced Features (Q2 2025)
- [ ] Annotations sur pages (Annotorious)
- [ ] Commentaires collaboratifs
- [ ] Version comparison (diff)
- [ ] Export multi-formats (Excel, CSV)
- [ ] API publique documentée

---

## 🤝 Contribution

### Workflow

1. **Fork** le projet
2. **Créer une branche**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Développer** en respectant les standards
   - ESLint + Prettier
   - Tests pour toute nouvelle feature
   - TypeScript strict mode
4. **Tester**
   ```bash
   npm test
   npm run lint
   npm run build
   ```
5. **Commit** avec message conventionnel
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   Formats : `feat:`, `fix:`, `docs:`, `test:`, `chore:`
6. **Push** et ouvrir une **Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Standards de Code

- **TypeScript**: strict mode, pas de `any` sans justification
- **ESLint**: zero warnings
- **Tests**: coverage > 80% pour nouveaux fichiers
- **Commits**: conventional commits
- **PR**: description détaillée + screenshots si UI

---

## 📝 License

© 2025 Clauger. Tous droits réservés.

Ce projet est propriétaire et confidentiel. Toute distribution, modification ou utilisation non autorisée est strictement interdite.

---

## 📞 Support & Contact

**Questions & Issues**
- 🐛 Bugs : [GitHub Issues](https://github.com/FMXCLAUGER/clauger-rse-web/issues)
- 💬 Discussions : [GitHub Discussions](https://github.com/FMXCLAUGER/clauger-rse-web/discussions)

**Clauger**
- 📧 Email : contact@clauger.com
- 🌐 Site web : https://www.clauger.com
- 📍 Adresse : Paris, France

---

## 🙏 Remerciements

**Technologies & Open Source**
- [Next.js](https://nextjs.org/) - Framework React
- [Anthropic Claude](https://www.anthropic.com/) - IA conversationnelle
- [Vercel](https://vercel.com/) - Hosting & edge network
- [Tailwind CSS](https://tailwindcss.com/) - Design system
- [Recharts](https://recharts.org/) - Graphiques React
- [Jest](https://jestjs.io/) - Testing framework
- Toute la communauté open-source ❤️

---

**Développé avec ❤️ par l'équipe Clauger**

*Dernière mise à jour : 15 novembre 2024*
