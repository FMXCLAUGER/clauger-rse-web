'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV, type ExportData } from '@/lib/export/csv-exporter'
import { toast } from 'sonner'

interface ExportCSVButtonProps {
  data: ExportData[]
  filename: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function ExportCSVButton({
  data,
  filename,
  label = 'Exporter CSV',
  variant = 'outline',
  size = 'default',
}: ExportCSVButtonProps) {
  const handleExport = () => {
    try {
      if (data.length === 0) {
        toast.error('Aucune donnée à exporter')
        return
      }

      exportToCSV(data, filename)
      toast.success(`Fichier ${filename}.csv téléchargé`)
    } catch (error) {
      // Error handling - toast notification provides user feedback
      toast.error('Erreur lors de l\'export CSV')
    }
  }

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      className="gap-2"
      title={`Exporter les données en CSV`}
    >
      <Download className="w-4 h-4" />
      {label}
    </Button>
  )
}
