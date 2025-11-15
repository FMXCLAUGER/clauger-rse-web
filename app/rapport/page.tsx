import { redirect } from "next/navigation"
import Link from "next/link"
import ReportViewerWithAnnotations from "@/components/viewer/ReportViewerWithAnnotations"
import { TOTAL_PAGES } from "@/lib/constants"
import { reportPageSchema } from "@/lib/validations/searchParams"

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function RapportPage({ searchParams }: PageProps) {
  const params = await searchParams
  const result = reportPageSchema.safeParse(params)

  if (!result.success) {
    return (
      <main className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
          <h1 className="mb-2 text-xl font-semibold text-red-800 dark:text-red-200">
            Paramètres invalides
          </h1>
          <p className="mb-4 text-red-700 dark:text-red-300">
            Le numéro de page doit être un nombre entre 1 et {TOTAL_PAGES}.
          </p>
          <Link
            href="/rapport?page=1"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Aller à la page 1
          </Link>
        </div>
      </main>
    )
  }

  const { page } = result.data

  return (
    <main className="h-screen overflow-hidden">
      <ReportViewerWithAnnotations initialPage={page} />
    </main>
  )
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams
  const result = reportPageSchema.safeParse(params)
  const page = result.success ? result.data.page : 1

  return {
    title: `Rapport RSE - Page ${page}/${TOTAL_PAGES}`,
    description: `Page ${page} du rapport durable Clauger 2025`,
  }
}
