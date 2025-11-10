# 📊 Application Web Rapport RSE Clauger 2025

Application Next.js 14 moderne pour naviguer dans le rapport RSE de Clauger avec fonctionnalités avancées.

## ✨ Fonctionnalités

### ✅ Phase 1 : MVP Viewer (Implémenté)
- 🏠 Landing page avec chiffres clés et navigation
- 📖 Viewer de rapport avec 36 pages
- ⬅️➡️ Navigation prev/next + raccourcis clavier (← →)
- 🖼️ Miniatures en sidebar avec scroll
- 📊 Barre de progression
- 🔗 URLs partageables (?page=15)
- 📱 Responsive mobile/tablet/desktop
- ⚡ Optimisation images Next.js

### 🔜 Phase 2 : Recherche & Dashboards (À venir)
- 🔍 Recherche full-text avec FlexSearch
- 📈 3 dashboards interactifs (Environnement, Social, Gouvernance)
- 🎯 Filtres par thématique
- 💾 Export PDF

### 🔜 Phase 3 : Annotations (À venir)
- ✏️ Annotations sur images avec Annotorious
- 💬 Commentaires et notes
- 📤 Export/Import JSON

### 🔜 Phase 4 : Optimisations (À venir)
- 🌙 Mode sombre/clair
- ♿ Accessibilité WCAG 2.1 AA
- 🚀 Optimisations performances

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes

1. **Installer les dépendances**
```bash
cd clauger-rse-web
npm install
```

2. **Lancer le serveur de développement**
```bash
npm run dev
```

3. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

---

## 📁 Structure du Projet

```
clauger-rse-web/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── rapport/page.tsx         # Viewer de rapport
│   ├── layout.tsx               # Layout global
│   └── globals.css              # Styles globaux
├── components/
│   └── viewer/
│       ├── ReportViewer.tsx           # Composant principal viewer
│       ├── NavigationControls.tsx     # Barre de navigation
│       └── ThumbnailSidebar.tsx       # Sidebar miniatures
├── lib/
│   └── constants.ts             # Données du rapport (36 pages, KPIs)
├── hooks/
│   └── useKeyboardNavigation.ts # Hook navigation clavier
└── public/
    └── images/rapport/          # 36 images PNG du rapport
```

---

## 🎨 Technologies Utilisées

**Frontend**
- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icônes)

**À venir**
- FlexSearch (recherche)
- Recharts (graphiques)
- Annotorious (annotations)
- Tesseract.js (OCR)

**Hébergement**
- Vercel (gratuit)

---

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Extraction OCR (Phase 2)
npm run extract-text
```

---

## 📦 Budget & Coûts

**Coût opérationnel : 0$/mois** 🎉

- ✅ Next.js : Gratuit
- ✅ Vercel Free Tier : Gratuit
- ✅ FlexSearch : Gratuit (open-source)
- ✅ Tesseract.js : Gratuit (open-source)
- ✅ Recharts : Gratuit (open-source)
- ✅ Annotorious : Gratuit (open-source)

---

## 🚀 Déploiement Vercel

1. **Créer un compte Vercel**
   - https://vercel.com/signup

2. **Connecter le repository**
```bash
npm install -g vercel
vercel login
vercel
```

3. **Configuration automatique**
   - Vercel détecte automatiquement Next.js
   - Déploiement en 1 clic

4. **Accéder à l'application**
   - URL automatique : `https://clauger-rse-web.vercel.app`

---

## 📸 Captures d'écran

### Landing Page
- Présentation du rapport avec note globale (62/100)
- Chiffres clés 2024
- 3 enjeux durables
- Accès rapides

### Viewer de Rapport
- Navigation intuitive
- Miniatures en sidebar
- Barre de progression
- Plein écran
- Navigation clavier

---

## 🎯 Roadmap

### ✅ Phase 1 : MVP Viewer (Terminé)
- [x] Setup Next.js 14 + TypeScript
- [x] Landing page
- [x] Viewer avec navigation
- [x] Miniatures sidebar
- [x] Raccourcis clavier
- [x] Responsive design
- [x] 36 images copiées

### 🔄 Phase 2 : Recherche & Dashboards (En cours)
- [ ] Script OCR Tesseract.js
- [ ] Recherche FlexSearch
- [ ] Dashboard Environnement
- [ ] Dashboard Social
- [ ] Dashboard Gouvernance
- [ ] Export PDF

### 📅 Phase 3 : Annotations (Planifié)
- [ ] Annotorious v3
- [ ] localStorage
- [ ] Export/Import JSON

### 📅 Phase 4 : Optimisations (Planifié)
- [ ] Mode sombre
- [ ] Accessibilité
- [ ] SEO avancé
- [ ] Tests E2E

---

## 🤝 Contribution

Pour contribuer :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 License

© 2025 Clauger. Tous droits réservés.

---

## 📞 Support

Pour toute question :
- 📧 Email : [contact@clauger.com](mailto:contact@clauger.com)
- 🌐 Site web : https://www.clauger.com

---

## 🙏 Remerciements

- Next.js pour le framework
- Vercel pour l'hébergement gratuit
- Tailwind CSS pour le design system
- Open-source community

---

**Fait avec ❤️ par l'équipe Clauger**
