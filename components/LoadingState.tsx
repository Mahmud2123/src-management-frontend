import { RefreshCw } from 'lucide-react';

export default function LoadingState({ message = "Verifying access..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-green-200 blur-2xl rounded-full opacity-20 animate-pulse"></div>
        {/* Spinner */}
        <RefreshCw className="w-12 h-12 text-green-600 animate-spin relative z-10" />
      </div>
      <h2 className="mt-4 text-lg font-medium text-gray-700 animate-pulse">
        {message}
      </h2>
      <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
    </div>
  );
}