// providers/sonner.tsx
'use client';

import { Toaster } from 'sonner';
import { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        theme={theme === 'dark' ? 'dark' : 'light'}
        closeButton
        duration={4000}
      />
    </>
  );
}