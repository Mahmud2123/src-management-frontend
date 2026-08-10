// components/ImagePreviewModal.tsx
'use client';

import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnnouncementImage } from './AnnouncementImage';
import { useState, useEffect } from 'react';

interface ImagePreviewModalProps {
  src: string;
  alt: string;
  title?: string;
  date?: string;
  onClose: () => void;
}

export function ImagePreviewModal({ src, alt, title, date, onClose }: ImagePreviewModalProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownload = () => {
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'announcement-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl w-full max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close and action buttons */}
        <div className="flex items-center justify-between mb-4">
          {/* Title */}
          <div className="flex-1">
            {title && (
              <h3 className="text-white text-xl font-bold truncate max-w-[60%]">
                {title}
              </h3>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="relative flex-1 flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden min-h-[50vh]">
          <AnnouncementImage
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[75vh] object-contain"
          />
        </div>

        {/* Footer info */}
        {date && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              {date}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Click outside or press ESC to close
            </p>
          </div>
        )}
      </div>
    </div>
  );
}