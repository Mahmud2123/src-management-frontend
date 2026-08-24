'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './Button';

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

  // Base: White background + Black text
  // Hover: Green background (bg-emerald-500) + Black text
  const explicitStyles = '!bg-white !text-black hover:!bg-emerald-500 hover:!text-black border border-gray-200 shadow-sm transition-colors duration-150';

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap ${explicitStyles} ${sizeClasses[size]} ${className}`}
      title="Refresh data"
    >
      <RefreshCw 
        className={`w-4 h-4 shrink-0 !text-current ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {label && <span className="!text-current font-medium">{label}</span>}
    </Button>
  );
}