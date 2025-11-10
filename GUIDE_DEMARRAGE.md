# 🚀 Guide de Démarrage Rapide

## ✅ Ce Qui A Été Créé (Phase 1 - MVP)

### Structure Complète Next.js 14
- ✅ Configuration Next.js, TypeScript, Tailwind CSS
- ✅ 36 images PNG copiées dans `/public/images/rapport/`
- ✅ Landing page avec chiffres clés RSE
- ✅ Viewer de rapport interactif avec navigation
- ✅ Miniatures en sidebar
- ✅ Raccourcis clavier (← →)
- ✅ URLs partageables (?page=15)
- ✅ Responsive mobile/tablet/desktop
- ✅ README complet

### Fichiers Créés (13 fichiers)
```
✓ package.json              # Dépendances du projet
✓ tsconfig.json             # Configuration TypeScript
✓ next.config.js            # Configuration Next.js
✓ tailwind.config.ts        # Configuration Tailwind CSS
✓ app/layout.tsx            # Layout global
✓ app/page.tsx              # Landing page
✓ app/rapport/page.tsx      # Page du viewer
✓ app/globals.css           # Styles globaux
✓ components/viewer/ReportViewer.tsx           # Viewer principal
✓ components/viewer/NavigationControls.tsx     # Barre navigation
✓ components/viewer/ThumbnailSidebar.tsx       # Sidebar miniatures
✓ lib/constants.ts          # Données du rapport
✓ hooks/useKeyboardNavigation.ts  # Hook navigation clavier
✓ hooks/useDebounce.ts      # Hook debounce (pour recherche)
✓ README.md                 # Documentation
✓ GUIDE_DEMARRAGE.md        # Ce fichier
```

---

## 🎯 Démarrage en 3 Étapes

### Étape 1 : Installer les dépendances (2-3 minutes)

```bash
cd "/Users/fmx/Desktop/Agents de Claude/clauger-rse-web"
npm install
```

**Note** : Cela va installer ~300 packages (Next.js, React, Tailwind, etc.)

### Étape 2 : Lancer le serveur de développement

```bash
npm run dev
```

Vous devriez voir :
```
  ▲ Next.js 14.2.18
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

### Étape 3 : Ouvrir dans le navigateur

Ouvrez : **http://localhost:3000**

---

## 🎨 Que Pouvez-Vous Faire ?

### Sur la Page d'Accueil
- ✅ Voir les chiffres clés (3200+ collaborateurs, 718k teqCO2, etc.)
- ✅ Consulter les 3 enjeux durables avec leurs notes
- ✅ Cliquer sur "Explorer le rapport" pour ouvrir le viewer

### Dans le Viewer de Rapport
- ✅ Naviguer entre les 36 pages avec ← → ou les boutons
- ✅ Cliquer sur les miniatures à gauche pour sauter à une page
- ✅ Voir la barre de progression
- ✅ Passer en plein écran (icône en haut à droite)
- ✅ Partager une page spécifique (l'URL change : ?page=15)
- ✅ Retour à l'accueil avec le bouton "Accueil"

### Responsive
- 📱 **Mobile** : Interface adaptée, sidebar masquable
- 💻 **Desktop** : Expérience complète avec toutes les fonctionnalités

---

## 🔧 Commandes Disponibles

```bash
# Développement (avec hot-reload)
npm run dev

# Build pour production
npm run build

# Démarrer en mode production
npm start

# Vérifier le code (linter)
npm run lint
```

---

## 📊 Budget Actuel : 0$ 🎉

**Coûts opérationnels** :
- Next.js : Gratuit ✅
- Images locales : Gratuit ✅
- Développement local : Gratuit ✅

**Déploiement Vercel (quand prêt)** :
- Vercel Free Tier : Gratuit ✅
- Limite : 100 GB bandwidth/mois (largement suffisant)

---

## 🚀 Prochaines Étapes (Phases 2-3-4)

### Phase 2 : Recherche & Dashboards
**À implémenter** :
- Script OCR Tesseract.js pour extraire le texte des 36 images
- Recherche instantanée avec FlexSearch
- 3 dashboards interactifs avec Recharts :
  - Environnement (bilan carbone, énergie)
  - Social (formation, SSE, diversité)
  - Gouvernance (éthique, conformité)

**Commande** :
```bash
npm run extract-text    # Extraire texte des images (30min one-time)
```

### Phase 3 : Annotations
**À implémenter** :
- Annotorious v3 pour annotations sur images
- localStorage pour sauvegarde
- Export/Import JSON pour partage

### Phase 4 : Optimisations
**À implémenter** :
- Mode sombre/clair
- Accessibilité WCAG 2.1 AA
- SEO avancé
- Optimisations performances

---

## 🐛 Résolution de Problèmes

### Problème : `npm install` échoue

**Solution** : Vérifier la version Node.js
```bash
node --version  # Doit être >= 18.0.0
```

Si <18, installer Node.js récent : https://nodejs.org/

### Problème : Port 3000 déjà utilisé

**Solution** : Utiliser un autre port
```bash
PORT=3001 npm run dev
```

### Problème : Images ne s'affichent pas

**Solution** : Vérifier que les 36 images sont bien dans `/public/images/rapport/`
```bash
ls -la public/images/rapport/ | wc -l  # Doit afficher 36
```

### Problème : Erreurs TypeScript

**Solution** : Régénérer les types
```bash
rm -rf .next
npm run dev
```

---

## 📝 Structure des URLs

**Landing page** : `http://localhost:3000/`

**Viewer** : `http://localhost:3000/rapport?page=1`
- Page 1 : `/rapport?page=1`
- Page 15 : `/rapport?page=15`
- Page 36 : `/rapport?page=36`

**Dashboards (Phase 2)** :
- Vue d'ensemble : `/dashboard`
- Environnement : `/dashboard/environnement`
- Social : `/dashboard/social`
- Gouvernance : `/dashboard/gouvernance`

**Recherche (Phase 2)** : `/recherche`

---

## 🎯 Checklist de Test

Après `npm run dev`, vérifiez :

### Page d'Accueil
- [ ] La page se charge correctement
- [ ] Les chiffres clés s'affichent (3200+, 50+, 718k, 300k€)
- [ ] Les 3 enjeux durables sont visibles avec leurs notes
- [ ] Le bouton "Explorer le rapport" fonctionne

### Viewer de Rapport
- [ ] La page 1 s'affiche correctement
- [ ] Les miniatures apparaissent dans la sidebar gauche
- [ ] Navigation ← → fonctionne au clavier
- [ ] Les boutons prev/next fonctionnent
- [ ] La barre de progression se remplit
- [ ] Cliquer sur une miniature change la page
- [ ] L'URL change quand on navigue (?page=X)
- [ ] Le bouton "Accueil" ramène à la landing page

### Responsive
- [ ] Ouvrir dans Chrome DevTools (F12)
- [ ] Tester en mode mobile (iPhone SE, Pixel 5)
- [ ] Tester en mode tablet (iPad)
- [ ] Vérifier que la sidebar est masquable sur mobile

---

## 📦 Déploiement sur Vercel (Optionnel)

### Méthode 1 : Via Interface Web (Plus Simple)

1. Créer un compte sur https://vercel.com
2. Cliquer sur "Add New Project"
3. Importer le dossier `clauger-rse-web`
4. Vercel détecte automatiquement Next.js
5. Cliquer sur "Deploy"
6. Attendre 2-3 minutes
7. Votre site est en ligne ! 🎉

**URL générée** : `https://clauger-rse-web-xxxxx.vercel.app`

### Méthode 2 : Via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer (dans le dossier du projet)
cd "/Users/fmx/Desktop/Agents de Claude/clauger-rse-web"
vercel

# Suivre les instructions à l'écran
```

---

## 💡 Astuces Développeur

### Hot Reload
Le serveur redémarre automatiquement quand vous modifiez un fichier.
Pas besoin de relancer `npm run dev` !

### Voir les Logs
Les logs s'affichent dans le terminal où vous avez lancé `npm run dev`

### Inspecter avec DevTools
- Ouvrir Chrome DevTools : F12 ou Cmd+Option+I (Mac)
- Onglet "Network" : Voir les images chargées
- Onglet "Console" : Voir les erreurs JavaScript
- Onglet "Elements" : Inspecter le HTML/CSS

### Personnaliser les Couleurs
Modifier `tailwind.config.ts` :
```typescript
colors: {
  primary: "#1E3A5F",    // Bleu Clauger
  secondary: "#2D8659",  // Vert environnement
  accent: "#E67E22",     // Orange social
}
```

### Ajouter une Page
1. Créer un fichier dans `app/` :
   ```typescript
   // app/apropos/page.tsx
   export default function APropos() {
     return <div>À propos de Clauger</div>
   }
   ```
2. Accessible sur `http://localhost:3000/apropos`

---

## 🎓 Ressources Utiles

**Next.js 14**
- Documentation : https://nextjs.org/docs
- Tutoriels : https://nextjs.org/learn

**Tailwind CSS**
- Documentation : https://tailwindcss.com/docs
- Playground : https://play.tailwindcss.com

**TypeScript**
- Documentation : https://www.typescriptlang.org/docs

**Vercel**
- Documentation : https://vercel.com/docs

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez un problème :

1. **Vérifier les logs** dans le terminal
2. **Lire l'erreur complète** (souvent explicite)
3. **Google l'erreur** (souvent déjà résolue sur Stack Overflow)
4. **Consulter la documentation Next.js**

---

## 🎉 Félicitations !

Vous avez maintenant une **application web moderne** pour le rapport RSE Clauger avec :
- ✅ Navigation fluide entre 36 pages
- ✅ Design professionnel et responsive
- ✅ Performance optimisée (Next.js)
- ✅ 0$ de coût opérationnel

**Prochaine étape** : Implémenter la recherche et les dashboards (Phase 2)

---

**Fait avec ❤️ par l'équipe Clauger**
