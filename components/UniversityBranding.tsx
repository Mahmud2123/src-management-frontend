// components/UniversityBranding.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Shield } from 'lucide-react';

interface UniversityBrandingProps {
  variant?: 'full' | 'compact' | 'icon-only';
  className?: string;
  showLocation?: boolean;
}

export function UniversityBranding({ 
  variant = 'full', 
  className = '',
  showLocation = false,
}: UniversityBrandingProps) {
  const location = "Bauchi, Nigeria";
  const universityName = "Sa'adu Zungur University";
  const shortName = "SAZU";

  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 leading-tight truncate">
            SRC Portal
          </h1>
          <p className="text-xs text-gray-500 font-medium truncate">
            {shortName}
          </p>
        </div>
        {showLocation && (
          <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
            {location}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Logo / Shield */}
      <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-800 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20 flex-shrink-0">
        <Shield className="w-6 h-6 text-white" strokeWidth={2.2} />
      </div>

      <div>
        <h1 className="text-xl font-black text-gray-900 leading-tight">
          {universityName}
        </h1>
        <p className="text-sm font-semibold text-gray-500 flex items-center gap-2">
          <span>Student Representative Council Portal</span>
          {showLocation && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-green-700">{location}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}