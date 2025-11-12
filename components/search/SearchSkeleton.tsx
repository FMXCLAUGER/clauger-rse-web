export function SearchSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {/* Search input skeleton */}
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />

      {/* Section filters skeleton */}
      <div className="flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
        ))}
      </div>

      {/* Results skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {/* Thumbnail skeleton */}
            <div className="shrink-0 w-[60px] h-[90px] bg-gray-300 dark:bg-gray-600 rounded" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading text */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
        <div className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Chargement de l'index de recherche...</span>
        </div>
      </div>
    </div>
  )
}
