"use client"

import { useState } from "react"
import { X, Download, Loader2, FileDown, Check } from "lucide-react"
import { exportReportPagesPDF } from "@/lib/export/export-utils"
import { PAGES, TOTAL_PAGES } from "@/lib/constants"
import { toast } from "sonner"
import Image from "next/image"

interface PageSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  currentPage?: number
}

export function PageSelectionModal({ isOpen, onClose, currentPage }: PageSelectionModalProps) {
  const [selectedPages, setSelectedPages] = useState<number[]>(currentPage ? [currentPage] : [])
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    )
  }

  const selectAll = () => {
    setSelectedPages(Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1))
  }

  const deselectAll = () => {
    setSelectedPages([])
  }

  const handleExportPDF = async () => {
    if (selectedPages.length === 0) {
      toast.error("Veuillez sélectionner au moins une page")
      return
    }

    setLoading(true)
    try {
      await exportReportPagesPDF(selectedPages)
      toast.success(`PDF téléchargé avec succès (${selectedPages.length} page${selectedPages.length > 1 ? 's' : ''})`)
      onClose()
    } catch (error) {
      console.error("Export PDF error:", error)
      toast.error("Erreur lors de la génération du PDF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Télécharger en PDF
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sélectionnez les pages à inclure dans le PDF
          </p>
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} sélectionnée{selectedPages.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Tout sélectionner
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Tout désélectionner
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {PAGES.map((page) => {
              const isSelected = selectedPages.includes(page.id)
              return (
                <button
                  key={page.id}
                  onClick={() => togglePage(page.id)}
                  className={`relative group aspect-[1/1.414] rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected
                      ? "border-primary shadow-lg scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <Image
                    src={page.src}
                    alt={page.alt}
                    width={100}
                    height={141}
                    className="w-full h-full object-cover"
                    placeholder={page.blurDataURL ? "blur" : "empty"}
                    blurDataURL={page.blurDataURL}
                  />

                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                      isSelected ? "bg-primary/20" : "bg-black/0 group-hover:bg-black/10"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-1">
                    <span className="text-xs font-medium text-white block text-center">
                      {page.id}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExportPDF}
            disabled={loading || selectedPages.length === 0}
            className="flex-1 flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" />
                Télécharger le PDF
              </>
            )}
          </button>
        </div>

        {selectedPages.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Le PDF sera généré avec les pages suivantes: {selectedPages.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
