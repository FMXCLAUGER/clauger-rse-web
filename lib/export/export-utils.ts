"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Papa from "papaparse"
import { environmentData, socialData, governanceData } from "@/lib/data/rse-data"
import { PAGES } from "@/lib/constants"

// Export dashboard as PDF
export async function exportDashboardPDF(dashboardId: string, dashboardName: string) {
  const element = document.getElementById(dashboardId)
  if (!element) {
    throw new Error("Dashboard element not found")
  }

  // Capture dashboard as image
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  })

  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  })

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
  pdf.save(`${dashboardName}-${new Date().toISOString().split("T")[0]}.pdf`)
}

// Export data as CSV
export function exportDataCSV(dataType: "environment" | "social" | "governance") {
  let csvData: any[] = []
  let filename = ""

  switch (dataType) {
    case "environment":
      // Emissions data
      csvData = environmentData.emissions.map((item) => ({
        Année: item.year,
        "Scope 1": item.scope1,
        "Scope 2": item.scope2,
        "Scope 3": item.scope3,
        Total: item.scope1 + item.scope2 + item.scope3,
      }))
      filename = "donnees-environnement"
      break

    case "social":
      // Workforce data
      csvData = socialData.workforce.map((item) => ({
        Année: item.year,
        Total: item.total,
        Hommes: item.men,
        Femmes: item.women,
        "% Femmes": ((item.women / item.total) * 100).toFixed(1),
      }))
      filename = "donnees-social"
      break

    case "governance":
      // Budget data
      csvData = governanceData.budget.map((item) => ({
        Pilier: item.pillar,
        "Budget (€)": item.amount,
        "Pourcentage": item.percentage,
      }))
      filename = "donnees-gouvernance"
      break
  }

  const csv = Papa.unparse(csvData, {
    delimiter: ";",
    header: true,
  })

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export all data as complete CSV
export function exportAllDataCSV() {
  const allData = [
    { Section: "Environnement", Indicateur: "Émissions 2025", Valeur: "1480 tCO2e" },
    { Section: "Environnement", Indicateur: "Énergie renouvelable", Valeur: "58.6%" },
    { Section: "Environnement", Indicateur: "Taux recyclage", Valeur: "67.8%" },
    { Section: "Social", Indicateur: "Effectifs totaux", Valeur: "1523" },
    { Section: "Social", Indicateur: "% Femmes", Valeur: "33.3%" },
    { Section: "Social", Indicateur: "Formation/employé", Valeur: "20.5h" },
    { Section: "Gouvernance", Indicateur: "Budget RSE", Valeur: "8,100,000 €" },
    { Section: "Gouvernance", Indicateur: "Conformité CSRD", Valeur: "92%" },
    { Section: "Gouvernance", Indicateur: "Indépendants CA", Valeur: "41.7%" },
  ]

  const csv = Papa.unparse(allData, {
    delimiter: ";",
    header: true,
  })

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `rapport-rse-complet-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportReportPagesPDF(selectedPages: number[], filename?: string) {
  if (selectedPages.length === 0) {
    throw new Error("Aucune page sélectionnée")
  }

  selectedPages.sort((a, b) => a - b)

  let pdf: jsPDF

  for (let i = 0; i < selectedPages.length; i++) {
    const pageNum = selectedPages[i]

    try {
      const imagePath = PAGES[pageNum - 1].src
      const img = await loadImage(imagePath)

      const isLandscape = img.width > img.height
      const orientation = isLandscape ? 'landscape' : 'portrait'

      if (i === 0) {
        pdf = new jsPDF({
          orientation,
          unit: "mm",
          format: "a4",
        })

        pdf.setProperties({
          title: "Rapport RSE 2023 - Clauger",
          author: "Clauger",
          subject: "Rapport de Responsabilité Sociétale des Entreprises",
          creator: "Clauger RSE Web Application",
        })
      } else {
        pdf.addPage("a4", orientation)
      }

      const pageWidth = orientation === 'portrait' ? 210 : 297
      const pageHeight = orientation === 'portrait' ? 297 : 210
      const margin = 10
      const footerHeight = 10
      const availableHeight = pageHeight - margin * 2 - footerHeight

      const imgAspectRatio = img.width / img.height
      const availableAspectRatio = (pageWidth - margin * 2) / availableHeight

      let imgWidth, imgHeight, imgX, imgY

      if (imgAspectRatio > availableAspectRatio) {
        imgWidth = pageWidth - margin * 2
        imgHeight = imgWidth / imgAspectRatio
        imgX = margin
        imgY = margin
      } else {
        imgHeight = availableHeight
        imgWidth = imgHeight * imgAspectRatio
        imgX = (pageWidth - imgWidth) / 2
        imgY = margin
      }

      pdf.addImage(img, "WEBP", imgX, imgY, imgWidth, imgHeight)

      pdf.setFontSize(9)
      pdf.setTextColor(128, 128, 128)
      const pageText = `Page ${pageNum}/${selectedPages.length === 1 ? '36' : selectedPages[selectedPages.length - 1]}`
      const textWidth = pdf.getTextWidth(pageText)
      pdf.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 7)

    } catch (error) {
      console.error(`Erreur lors du chargement de la page ${pageNum}:`, error)
      throw new Error(`Impossible de charger la page ${pageNum}`)
    }
  }

  const defaultFilename = selectedPages.length === 1
    ? `rapport-page-${selectedPages[0]}`
    : `rapport-pages-${selectedPages[0]}-a-${selectedPages[selectedPages.length - 1]}`

  pdf.save(`${filename || defaultFilename}-${new Date().toISOString().split("T")[0]}.pdf`)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}
