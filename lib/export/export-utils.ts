"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Papa from "papaparse"
import { environmentData, socialData, governanceData } from "@/lib/data/rse-data"

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
