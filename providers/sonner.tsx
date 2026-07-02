// src/providers/sonner.tsx
'use client';

import { Toaster } from 'sonner';
import { ReactNode } from 'react';
<<<<<<< HEAD
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
=======

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
