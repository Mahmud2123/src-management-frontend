// components/RefreshButton.tsx
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
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`${sizeClasses[size]} ${className}`}
      title="Refresh data"
    >
      <RefreshCw 
        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {label && <span className="ml-2">{label}</span>}
    </Button>
  );
}