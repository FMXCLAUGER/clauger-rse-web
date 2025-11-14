"use client"

import { useState } from "react"
import { X, Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { exportDashboardPDF, exportDataCSV, exportAllDataCSV } from "@/lib/export/export-utils"
import { toast } from "sonner"
import { logError } from '@/lib/security/logger-helpers'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: "environment" | "social" | "governance"
}

export function ExportModal({ isOpen, onClose, activeTab }: ExportModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleExportPDF = async () => {
    setLoading(true)
    try {
      const dashboardNames = {
        environment: "Dashboard-Environnement",
        social: "Dashboard-Social",
        governance: "Dashboard-Gouvernance",
      }

      await exportDashboardPDF("dashboard-content", dashboardNames[activeTab])
      toast.success("PDF exporté avec succès !")
      onClose()
    } catch (error) {
      logError('Dashboard PDF export failed', error, { component: 'ExportModal', activeTab })
      toast.error("Erreur lors de l'export PDF")
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    try {
      exportDataCSV(activeTab)
      toast.success("CSV exporté avec succès !")
      onClose()
    } catch (error) {
      logError('Dashboard CSV export failed', error, { component: 'ExportModal', activeTab })
      toast.error("Erreur lors de l'export CSV")
    }
  }

  const handleExportAllCSV = () => {
    try {
      exportAllDataCSV()
      toast.success("Toutes les données exportées !")
      onClose()
    } catch (error) {
      logError('Complete CSV export failed', error, { component: 'ExportModal' })
      toast.error("Erreur lors de l'export")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Exporter les données
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choisissez le format d'export
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportPDF}
            disabled={loading}
            className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <FileText className="w-6 h-6 text-red-500" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Exporter en PDF
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dashboard actuel avec graphiques
              </p>
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
          >
            <FileSpreadsheet className="w-6 h-6 text-green-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Exporter en CSV
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Données de la section actuelle
              </p>
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleExportAllCSV}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 rounded-xl transition-colors text-left border-2 border-primary/20"
          >
            <FileSpreadsheet className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Export complet CSV
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toutes les données ESG
              </p>
            </div>
            <Download className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Les fichiers sont téléchargés directement dans votre dossier de téléchargements.
            Les données sont formatées pour Excel avec séparateur point-virgule.
          </p>
        </div>
      </div>
    </div>
  )
}
