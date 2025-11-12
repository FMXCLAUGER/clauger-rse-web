'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { MetricCard } from '@/components/analytics/MetricCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Activity, Database, Zap, Clock, TrendingUp, AlertCircle,
  Download, RefreshCw
} from 'lucide-react'
import { exportMetrics, clearAllEvents } from '@/lib/analytics'

export default function AnalyticsPage() {
  const { events, summary, isLoading } = useAnalytics()

  const handleExport = () => {
    const data = exportMetrics()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString()}.json`
    a.click()
  }

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les métriques ?')) {
      clearAllEvents()
      window.location.reload()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aucune donnée disponible</h2>
          <p className="text-muted-foreground">
            Commencez à utiliser le chatbot pour voir les métriques apparaître
          </p>
        </Card>
      </div>
    )
  }

  // Préparer données pour cache chart
  const cacheData = events
    .filter(e => e.eventType === 'chat.cache.metrics')
    .slice(-20)
    .map((e, i) => ({
      index: i + 1,
      hit: (e as any).properties.cacheHit ? 1 : 0,
      savings: (e as any).properties.estimatedSavings || 0
    }))

  // Préparer données pour performance chart
  const performanceData = events
    .filter(e => e.eventType === 'chat.response.completed')
    .slice(-20)
    .map((e, i) => ({
      index: i + 1,
      duration: (e as any).properties.duration || 0,
      tokens: (e as any).properties.totalTokens || 0
    }))

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Métriques temps réel de votre chatbot RSE
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Effacer
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Cache Hit Rate"
          value={`${summary.cacheHitRate.toFixed(1)}%`}
          description={`${summary.totalCacheHits} hits / ${summary.totalCacheMisses} misses`}
          trend={summary.cacheHitRate >= 50 ? 'up' : 'down'}
          trendValue={summary.cacheHitRate >= 50 ? 'Excellent' : 'À améliorer'}
          icon={<Database className="w-6 h-6" />}
        />

        <MetricCard
          title="Économies Cache"
          value={`$${summary.totalCacheSavings.toFixed(4)}`}
          description="Coûts évités grâce au cache"
          trend="up"
          icon={<TrendingUp className="w-6 h-6" />}
        />

        <MetricCard
          title="Thinking Activations"
          value={summary.thinkingActivations}
          description={`${summary.thinkingActivationRate.toFixed(1)}% des requêtes`}
          icon={<Zap className="w-6 h-6" />}
        />

        <MetricCard
          title="Temps Réponse Moyen"
          value={`${summary.avgResponseTime.toFixed(0)}ms`}
          description={`P95: ${summary.p95ResponseTime.toFixed(0)}ms`}
          trend={summary.avgResponseTime < 2000 ? 'up' : 'down'}
          icon={<Clock className="w-6 h-6" />}
        />
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Sessions"
          value={summary.totalSessions}
          icon={<Activity className="w-6 h-6" />}
        />

        <MetricCard
          title="Total Messages"
          value={summary.totalMessages}
          description={`${summary.avgMessagesPerSession.toFixed(1)} par session`}
          icon={<Activity className="w-6 h-6" />}
        />

        <MetricCard
          title="Taux d'Erreur"
          value={`${summary.errorRate.toFixed(2)}%`}
          description={`${summary.totalErrors} erreurs`}
          trend={summary.errorRate < 5 ? 'up' : 'down'}
          icon={<AlertCircle className="w-6 h-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cache Performance Chart */}
        {cacheData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance du Cache</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cacheData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hit" fill="#10b981" name="Cache Hit" />
                <Bar yAxisId="right" dataKey="savings" fill="#3b82f6" name="Savings ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Performance Chart */}
        {performanceData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Réponses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="duration"
                  stroke="#8b5cf6"
                  name="Durée (ms)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tokens"
                  stroke="#f59e0b"
                  name="Tokens"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Events Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Derniers Événements</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Timestamp</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Catégorie</th>
                <th className="text-left p-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(-10).reverse().map((event) => (
                <tr key={event.eventId} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2">{event.eventType}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-xs">
                      {event.eventCategory}
                    </span>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">
                    {JSON.stringify((event as any).properties).substring(0, 100)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
