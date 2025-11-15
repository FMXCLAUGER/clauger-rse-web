export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col animate-pulse">
        <div className="p-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 dark:bg-gray-800 rounded-lg"
            />
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-20 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
            <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-4xl w-full animate-pulse">
            <div className="aspect-[3/4] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
