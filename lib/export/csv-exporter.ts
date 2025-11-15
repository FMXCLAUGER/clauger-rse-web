import Papa from 'papaparse'

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined
}

export function exportToCSV(data: ExportData[], filename: string): void {
  if (data.length === 0) {
    // No data to export - silently return
    return
  }

  const csv = Papa.unparse(data, {
    delimiter: ',',
    header: true,
  })

  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csv

  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportDashboardMetrics(metrics: Record<string, number | string>): void {
  const data = Object.entries(metrics).map(([key, value]) => ({
    Métrique: key,
    Valeur: value,
  }))

  const timestamp = new Date().toISOString().split('T')[0]
  exportToCSV(data, `dashboard-metrics-${timestamp}`)
}

export function exportChartData(
  chartData: Array<Record<string, string | number>>,
  chartName: string
): void {
  const timestamp = new Date().toISOString().split('T')[0]
  exportToCSV(chartData, `${chartName}-${timestamp}`)
}
