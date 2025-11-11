interface ChartSkeletonProps {
  height?: number
  className?: string
}

export function ChartSkeleton({
  height = 300,
  className = "",
}: ChartSkeletonProps) {
  return (
    <div
      className={`w-full animate-pulse ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-500 dark:border-t-gray-400 rounded-full animate-spin" />
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Chargement...
          </div>
        </div>
      </div>
    </div>
  )
}
