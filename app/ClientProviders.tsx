'use client';

import React, { ReactNode } from 'react';
import { ReactQueryProvider } from '@/providers/react-query';
import { AuthProvider } from '@/providers/auth';
import { ToastProvider } from '@/providers/sonner';
import { SocketProvider } from '@/providers/socket';
import LayoutWrapper from './LayoutWrapper';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
