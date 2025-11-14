"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { logger } from "@/lib/security"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error("Global application error caught by error boundary", {
      errorMessage: error.message,
      errorStack: error.stack,
      errorDigest: error.digest,
      component: "GlobalErrorBoundary"
    })
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Erreur inattendue
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Une erreur inattendue s&apos;est produite. Veuillez réessayer ou retourner à l&apos;accueil.
          </p>

          {error.message && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm font-mono text-red-800 dark:text-red-300 break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  ID d&apos;erreur: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary/90 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Home className="w-5 h-5" />
              Retour à l&apos;accueil
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Si le problème persiste, veuillez rafraîchir la page ou contacter le support technique
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
