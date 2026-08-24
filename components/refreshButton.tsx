'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { twMerge } from 'tailwind-merge'; // Standard utility in Next.js / React projects

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function RefreshButton({ 
  onRefresh, 
  className = '', 
  size = 'md',
  label 
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-3.5 py-2.5 text-base',
  };

  // Combine default layout, size, and incoming custom styles using twMerge
  const combinedClassName = twMerge(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    sizeClasses[size],
    className
  );

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={combinedClassName}
      title="Refresh data"
    >
      <RefreshCw 
        className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {label && <span>{label}</span>}
    </Button>
  );
}