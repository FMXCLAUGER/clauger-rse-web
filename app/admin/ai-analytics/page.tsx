'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { MetricCard } from '@/components/analytics/MetricCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Brain, DollarSign, TrendingUp, Zap,
  Download, RefreshCw, AlertCircle
} from 'lucide-react'
import { exportMetrics, calculateAISummary } from '@/lib/analytics'
import { useMemo } from 'react'

export default function AIAnalyticsPage() {
  const { events, isLoading } = useAnalytics()

  // All hooks must be called before any early returns
  const aiSummary = useMemo(() => calculateAISummary(), [])

  const costEvolutionData = useMemo(() => {
    const messageEvents = events.filter(e => e.eventType === 'chat.message.sent')
    const last7Days = messageEvents.slice(-50) // Last 50 messages for trend

    return last7Days.map((e, i) => ({
      index: i + 1,
      cost: (e as any).properties?.estimatedCost || 0,
      model: (e as any).properties?.modelUsed?.toLowerCase().includes('haiku') ? 'Haiku' : 'Sonnet'
    }))
  }, [events])

  const handleExport = () => {
    const data = exportMetrics()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-analytics-${new Date().toISOString()}.json`
    a.click()
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

  if (aiSummary.totalHaikuRequests === 0 && aiSummary.totalSonnetRequests === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aucune donnée IA disponible</h2>
          <p className="text-muted-foreground">
            Commencez à utiliser le chatbot pour voir les métriques IA apparaître
          </p>
        </Card>
      </div>
    )
  }

  // Chart 1: Model Distribution (Pie Chart)
  const modelDistributionData = [
    { name: 'Haiku', value: aiSummary.totalHaikuRequests, color: '#10b981' },
    { name: 'Sonnet', value: aiSummary.totalSonnetRequests, color: '#3b82f6' }
  ]

  // Chart 2: Cost by Model (Bar Chart)
  const costByModelData = [
    { model: 'Haiku', cost: aiSummary.haikuTotalCost },
    { model: 'Sonnet', cost: aiSummary.sonnetTotalCost }
  ]

  // Chart 3: Complexity Distribution (Bar Chart)
  const complexityDistributionData = [
    { name: 'Simple', value: aiSummary.simpleQueryCount, fill: '#10b981' },
    { name: 'Medium', value: aiSummary.mediumQueryCount, fill: '#f59e0b' },
    { name: 'Complex', value: aiSummary.complexQueryCount, fill: '#ef4444' }
  ]

  // Chart 5: Monthly Projection (Composed Chart)
  const projectionData = [
    { period: 'Actuel', actual: aiSummary.totalAICost, projected: 0 },
    { period: 'Projection', actual: 0, projected: aiSummary.monthlyProjectedCost }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Analyse du routing Claude Haiku vs Sonnet et optimisation des coûts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Taux Utilisation Haiku"
          value={`${aiSummary.haikuUsageRate.toFixed(1)}%`}
          description={`${aiSummary.totalHaikuRequests} / ${aiSummary.totalHaikuRequests + aiSummary.totalSonnetRequests} requêtes`}
          trend={aiSummary.haikuUsageRate >= 60 ? 'up' : 'down'}
          trendValue={aiSummary.haikuUsageRate >= 60 ? 'Optimal' : 'À améliorer'}
          icon={<Brain className="w-6 h-6" />}
        />

        <MetricCard
          title="Coût Total IA"
          value={`$${aiSummary.totalAICost.toFixed(4)}`}
          description={`Moy: $${aiSummary.avgCostPerRequest.toFixed(6)}/req`}
          icon={<DollarSign className="w-6 h-6" />}
        />

        <MetricCard
          title="Économies Routing"
          value={`$${aiSummary.routingSavings.toFixed(4)}`}
          description="vs tout en Sonnet"
          trend="up"
          trendValue={`${((aiSummary.routingSavings / (aiSummary.totalAICost + aiSummary.routingSavings)) * 100).toFixed(1)}% économisé`}
          icon={<TrendingUp className="w-6 h-6" />}
        />

        <MetricCard
          title="Projection Mensuelle"
          value={`$${aiSummary.monthlyProjectedCost.toFixed(2)}`}
          description={`Quotidien: $${aiSummary.dailyAvgCost.toFixed(4)}`}
          icon={<Zap className="w-6 h-6" />}
        />
      </div>

      {/* Complexity Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Distribution par Complexité</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Requêtes Simples"
            value={aiSummary.simpleQueryCount}
            description="Score < 3"
            icon={<Zap className="w-6 h-6 text-green-600" />}
          />
          <MetricCard
            title="Requêtes Medium"
            value={aiSummary.mediumQueryCount}
            description="Score 3-6"
            icon={<Zap className="w-6 h-6 text-orange-600" />}
          />
          <MetricCard
            title="Requêtes Complexes"
            value={aiSummary.complexQueryCount}
            description="Score ≥ 6"
            icon={<Zap className="w-6 h-6 text-red-600" />}
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Score moyen de complexité: <span className="font-bold">{aiSummary.avgComplexityScore.toFixed(2)}</span>
          </p>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Model Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution Modèles IA</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modelDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {modelDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 2: Cost by Model */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Coûts par Modèle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costByModelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(6)}`} />
              <Legend />
              <Bar dataKey="cost" fill="#3b82f6" name="Coût Total ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 3: Complexity Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution Complexité</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complexityDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Nombre de requêtes">
                {complexityDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 4: Cost Evolution */}
        {costEvolutionData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution Coûts (7 derniers jours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(6)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Coût par requête ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Chart 5: Monthly Projection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Projection Mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
              <Legend />
              <Bar dataKey="actual" fill="#10b981" name="Coût Actuel ($)" />
              <Area
                type="monotone"
                dataKey="projected"
                fill="#3b82f6"
                stroke="#3b82f6"
                name="Projection ($)"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Basé sur une moyenne quotidienne de <strong>${aiSummary.dailyAvgCost.toFixed(4)}</strong> × 30 jours
            </p>
          </div>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Détail des Coûts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Modèle</th>
                <th className="text-right p-2">Requêtes</th>
                <th className="text-right p-2">Coût Total</th>
                <th className="text-right p-2">Coût Moyen</th>
                <th className="text-right p-2">% du Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/50">
                <td className="p-2 font-semibold text-green-600">Haiku</td>
                <td className="text-right p-2">{aiSummary.totalHaikuRequests}</td>
                <td className="text-right p-2">${aiSummary.haikuTotalCost.toFixed(6)}</td>
                <td className="text-right p-2">
                  ${aiSummary.totalHaikuRequests > 0 ? (aiSummary.haikuTotalCost / aiSummary.totalHaikuRequests).toFixed(6) : '0.000000'}
                </td>
                <td className="text-right p-2">
                  {((aiSummary.haikuTotalCost / aiSummary.totalAICost) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/50">
                <td className="p-2 font-semibold text-blue-600">Sonnet</td>
                <td className="text-right p-2">{aiSummary.totalSonnetRequests}</td>
                <td className="text-right p-2">${aiSummary.sonnetTotalCost.toFixed(6)}</td>
                <td className="text-right p-2">
                  ${aiSummary.totalSonnetRequests > 0 ? (aiSummary.sonnetTotalCost / aiSummary.totalSonnetRequests).toFixed(6) : '0.000000'}
                </td>
                <td className="text-right p-2">
                  {((aiSummary.sonnetTotalCost / aiSummary.totalAICost) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="font-bold">
                <td className="p-2">TOTAL</td>
                <td className="text-right p-2">{aiSummary.totalHaikuRequests + aiSummary.totalSonnetRequests}</td>
                <td className="text-right p-2">${aiSummary.totalAICost.toFixed(6)}</td>
                <td className="text-right p-2">${aiSummary.avgCostPerRequest.toFixed(6)}</td>
                <td className="text-right p-2">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Savings Analysis */}
      <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold mb-2 text-green-900 dark:text-green-100">
          💰 Analyse des Économies
        </h3>
        <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
          <p>
            <strong>Économies réalisées:</strong> ${aiSummary.routingSavings.toFixed(4)} grâce au routing intelligent
          </p>
          <p>
            <strong>Coût si 100% Sonnet:</strong> ${(aiSummary.totalAICost + aiSummary.routingSavings).toFixed(4)}
          </p>
          <p>
            <strong>Taux d'optimisation:</strong>{' '}
            {((aiSummary.routingSavings / (aiSummary.totalAICost + aiSummary.routingSavings)) * 100).toFixed(1)}%
            {' '}de réduction des coûts
          </p>
        </div>
      </Card>
    </div>
  )
}
