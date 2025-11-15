# Configuration Vercel Blob pour Analytics Globales

## Vue d'ensemble

Ce projet utilise **Vercel Blob Storage** pour stocker les événements analytics de manière centralisée et globale, accessible à tous les utilisateurs de l'application.

## Architecture

```
┌─────────────────┐
│  Client (Web)   │
│   tracker.ts    │
└────────┬────────┘
         │ POST /api/analytics/track
         ▼
┌─────────────────────────────────┐
│   API Routes (Next.js)          │
│  - /api/analytics/track         │
│  - /api/analytics/events        │
│  - /api/analytics/summary       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Vercel Blob Storage           │
│   analytics/events.json         │
│   (Max 10,000 events FIFO)      │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Admin Dashboard               │
│  - /admin/analytics             │
│  - /admin/ai-analytics          │
└─────────────────────────────────┘
```

## Configuration initiale

### 1. Créer un Blob Store sur Vercel

1. Accédez au dashboard Vercel: https://vercel.com/dashboard
2. Sélectionnez votre projet `clauger-rse-web`
3. Allez dans l'onglet **Storage**
4. Cliquez sur **Create Database**
5. Sélectionnez **Blob** (Object Storage)
6. Donnez un nom au store (ex: `clauger-analytics-blob`)
7. Cliquez sur **Create**

### 2. Récupérer les variables d'environnement

Vercel va automatiquement créer la variable:
- `BLOB_READ_WRITE_TOKEN`

Pour la récupérer localement:

```bash
vercel env pull .env.local
```

### 3. Installer les dépendances

```bash
npm install @vercel/blob
```

## Structure des fichiers

### Fichiers de stockage Blob

#### `lib/analytics/blob-storage.ts`

Couche d'abstraction pour Vercel Blob:

- **`getEventsFromBlob()`**: Récupère tous les événements
- **`saveEventsToBlob(events)`**: Sauvegarde tous les événements
- **`saveEventToBlob(event)`**: Ajoute un événement
- **`getFilteredEventsFromBlob(filters)`**: Récupère avec filtres
- **`cleanupOldEventsInBlob(maxAgeMs)`**: Nettoie les anciens événements
- **`clearAllEventsInBlob()`**: Supprime tous les événements
- **`getBlobStats()`**: Statistiques du Blob

**Caractéristiques**:
- Cache en mémoire (`cachedEvents`) comme fallback
- Limite de 10,000 événements (FIFO)
- Stockage dans un seul fichier JSON: `analytics/events.json`
- Gestion d'erreurs avec `logger` (security/secure-logger)

### API Routes

#### `app/api/analytics/track/route.ts`

**POST** - Enregistre un événement analytics

```typescript
// Request
{
  "eventId": "uuid",
  "eventType": "page_view" | "chat_interaction" | "search_query" | ...,
  "timestamp": "2025-11-15T16:00:00.000Z",
  "metadata": { ... }
}

// Response 201
{
  "success": true,
  "eventId": "uuid"
}
```

**Fonctionnalités**:
- Validation de la structure de l'événement
- Sauvegarde dans Blob
- Cleanup asynchrone des anciens événements (30 jours)
- Support CORS (OPTIONS)

#### `app/api/analytics/events/route.ts`

**GET** - Récupère les événements avec filtres

**Query parameters**:
- `eventType`: Filtrer par type d'événement
- `limit`: Nombre max d'événements
- `startDate`: Date de début (ISO 8601)
- `endDate`: Date de fin (ISO 8601)

```typescript
// Response
{
  "events": [...],
  "count": 123,
  "filters": { ... }
}
```

#### `app/api/analytics/summary/route.ts`

**GET** - Résumé global des analytics

**Query parameters**:
- `type`: `general` | `ai` | `stats`

**Response (`type=general`)**:
```typescript
{
  "summary": {
    "totalEvents": 1234,
    "eventsByType": { ... },
    "topQueries": [...],
    "averageSessionDuration": 180000
  },
  "stats": {
    "totalEvents": 1234,
    "oldestEvent": "2025-10-01T...",
    "newestEvent": "2025-11-15T...",
    "estimatedSize": 524288
  },
  "timestamp": "2025-11-15T16:00:00.000Z"
}
```

**Response (`type=ai`)**:
```typescript
{
  "aiSummary": {
    "totalInteractions": 456,
    "averageResponseTime": 2500,
    "topFeatures": [...],
    "errorRate": 0.02
  }
}
```

**Response (`type=stats`)**:
```typescript
{
  "stats": {
    "totalEvents": 1234,
    "oldestEvent": "...",
    "newestEvent": "...",
    "estimatedSize": 524288
  }
}
```

## Runtime Configuration

Toutes les API routes utilisent le runtime **Node.js** (pas Edge):

```typescript
export const runtime = 'nodejs'
```

**Raison**: Vercel Blob API nécessite le runtime Node.js complet.

## Limites et contraintes

### Limites de stockage

- **Max événements**: 10,000 (configurable dans `blob-storage.ts`)
- **Politique**: FIFO (First In, First Out)
- **Rétention par défaut**: 30 jours (cleanup automatique)

### Taille estimée

- 10,000 événements ≈ 5-10 MB (selon les métadonnées)
- Vercel Blob free tier: 100 GB

### Performance

- **Cache en mémoire**: Réduit les lectures Blob
- **Cleanup asynchrone**: Non-bloquant
- **Lecture**: ~100-200ms
- **Écriture**: ~150-300ms

## Fallback et résilience

Si `BLOB_READ_WRITE_TOKEN` n'est pas disponible:
- Utilise le cache en mémoire local
- Log warning avec `logger.warn()`
- Continue de fonctionner (dégradé)

## Sécurité

### Logging sécurisé

Utilise `lib/security/secure-logger.ts`:
- Redaction automatique des PII
- Masquage des clés API
- Hashage des identifiants

### Validation

- Validation des structures d'événements
- Sanitization des inputs
- Gestion d'erreurs appropriée

## Migration depuis localStorage

L'ancien système utilisait `localStorage` (client-side). Les avantages de Blob:

| Aspect | localStorage | Vercel Blob |
|--------|-------------|-------------|
| Scope | Par navigateur | Global |
| Persistance | Client uniquement | Serveur centralisé |
| Limite | 5-10 MB | 100 GB (free tier) |
| Analytics admin | ❌ | ✅ |
| Multi-utilisateur | ❌ | ✅ |

## Monitoring et debugging

### Vérifier le Blob sur Vercel

1. Dashboard Vercel → Storage → Votre Blob store
2. Browse files → `analytics/events.json`

### Logs locaux

```bash
npm run dev
# Les logs apparaissent dans la console avec le format JSON
```

### Logs production

```bash
vercel logs <deployment-url>
```

### Inspecter les événements

```bash
# Tous les événements
curl https://votre-app.vercel.app/api/analytics/events

# Avec filtres
curl "https://votre-app.vercel.app/api/analytics/events?eventType=chat_interaction&limit=10"

# Résumé
curl https://votre-app.vercel.app/api/analytics/summary
```

## Maintenance

### Nettoyage manuel

Pour vider tous les événements:

```typescript
import { clearAllEventsInBlob } from '@/lib/analytics/blob-storage'

await clearAllEventsInBlob()
```

### Backup

Récupérer tous les événements pour backup:

```bash
curl https://votre-app.vercel.app/api/analytics/events > backup-events.json
```

### Ajuster la limite d'événements

Dans `lib/analytics/blob-storage.ts`:

```typescript
const MAX_EVENTS = 20000 // Augmenter à 20k
```

## Troubleshooting

### Erreur: "BLOB_READ_WRITE_TOKEN not found"

**Solution**: Exécuter `vercel env pull .env.local`

### Erreur: "Failed to save events to Blob"

**Causes possibles**:
1. Token invalide ou expiré
2. Problème réseau
3. Quota Vercel dépassé

**Solution**: Vérifier les logs et le dashboard Vercel

### Les événements disparaissent

**Cause**: Limite de 10,000 événements atteinte (FIFO)

**Solution**: Augmenter `MAX_EVENTS` ou exporter régulièrement

### Build warning: "Dynamic server usage"

**Normal**: Les API routes utilisent `nextUrl.searchParams` (dynamique par nature)

**Impact**: Aucun - les routes API sont toujours dynamiques

## Prochaines étapes

### Améliorations possibles

1. **Migration vers KV pour les compteurs**:
   - Utiliser Redis pour les compteurs en temps réel
   - Garder Blob pour l'historique complet

2. **Aggregations pré-calculées**:
   - Calculer les résumés quotidiens
   - Stocker dans des blobs séparés

3. **Export automatique**:
   - Cron job pour exporter vers S3/GCS
   - Archive mensuelle automatique

4. **Dashboard temps réel**:
   - WebSocket ou Server-Sent Events
   - Mise à jour en direct des métriques

## Références

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob Package](https://www.npmjs.com/package/@vercel/blob)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
