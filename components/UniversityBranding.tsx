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

  const logoSrc = process.env.NEXT_PUBLIC_SRC_LOGO || '/src-logo.jpg';

  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0">
          <Image src={logoSrc} alt="SAZU Logo" width={40} height={40} className="object-cover" />
        </div>
      </div>

    );
  }

  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0">
          <Image src={logoSrc} alt="SAZU Logo" width={40} height={40} className="object-cover" />
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
      {/* Logo */}
      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
        <Image src={logoSrc} alt="SAZU Logo" width={48} height={48} className="object-cover" />
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