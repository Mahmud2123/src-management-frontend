import { Wind } from "lucide-react";

export function EmptyState({ message, subMessage }: { message: string, subMessage: string }) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <Wind className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{message}</h3>
        <p className="text-gray-500 max-w-xs text-center mt-2">{subMessage}</p>
      </div>
    );
  }