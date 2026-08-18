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

  const primaryLogoSrc = process.env.NEXT_PUBLIC_SRC_LOGO || '/src-logo.png';
  const secondaryLogoSrc = '/sch-logo.jpg';

  const logos = (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/20 bg-white/90 shadow-sm shrink-0">
        <Image src={secondaryLogoSrc} alt="SAZU School Logo" width={40} height={40} className="h-full w-full object-cover" />
      </div>
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/20 bg-white/90 shadow-sm shrink-0">
        <Image src={primaryLogoSrc} alt="SRC Logo" width={40} height={40} className="h-full w-full object-cover" />
      </div>
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-white/20 bg-white/90">
          <Image src={primaryLogoSrc} alt="SRC Logo" width={40} height={40} className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {logos}
        <div className="min-w-0">
          <h1 className="text-base font-black text-white leading-tight truncate tracking-tight">
            SRC Portal
          </h1>
          <p className="text-[10px] sm:text-xs text-emerald-100/80 font-semibold uppercase tracking-[0.18em] truncate">
            {shortName}
          </p>
        </div>
        {showLocation && (
          <span className="text-[10px] text-gray-300 font-medium hidden sm:inline">
            {location}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-green-200 bg-white shadow-lg flex-shrink-0">
          <Image src={secondaryLogoSrc} alt="SAZU School Logo" width={48} height={48} className="h-full w-full object-cover" />
        </div>
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-green-200 bg-white shadow-lg flex-shrink-0">
          <Image src={primaryLogoSrc} alt="SRC Logo" width={48} height={48} className="h-full w-full object-cover" />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
          {universityName}
        </h1>
        <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <span className="text-emerald-700">SRC Portal</span>
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