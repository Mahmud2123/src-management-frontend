export default function SuggestionSkeleton() {
    return (
      <div className="space-y-4 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="flex gap-4">
              {/* Voting Column Skeleton */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="w-4 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
  
              {/* Content Column Skeleton */}
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-24 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
                <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-20 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }