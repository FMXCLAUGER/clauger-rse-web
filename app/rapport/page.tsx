import { redirect } from "next/navigation"
import ReportViewer from "@/components/viewer/ReportViewer"
import { TOTAL_PAGES } from "@/lib/constants"

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function RapportPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)

  if (page < 1 || page > TOTAL_PAGES) {
    redirect("/rapport?page=1")
  }

  return (
    <main className="h-screen overflow-hidden">
      <ReportViewer initialPage={page} />
    </main>
  )
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page || "1"
  return {
    title: `Rapport RSE - Page ${page}/${TOTAL_PAGES}`,
    description: `Page ${page} du rapport durable Clauger 2025`,
  }
}
