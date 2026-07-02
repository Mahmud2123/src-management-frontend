'use client';

import { Toaster } from 'sonner';
import { ReactNode } from 'react';

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        duration={4000}
      />
    </>
  );
}