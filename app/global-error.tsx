'use client';

export default function GlobalLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Critical Application Error</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {error.message || 'A critical layout error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}