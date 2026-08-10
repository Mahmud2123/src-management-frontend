// components/AnnouncementImage.tsx
'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface AnnouncementImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function AnnouncementImage({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '' 
}: AnnouncementImageProps) {
  const [error, setError] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      return `${baseUrl}${url}`;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/uploads/announcements/${url}`;
  };

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className} ${fallbackClassName}`}>
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={getImageUrl(src)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}