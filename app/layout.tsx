// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/auth';
import { ToastProvider } from '@/providers/sonner';
import LayoutWrapper from './LayoutWrapper';
import { ReactQueryProvider } from '@/providers/react-query';

const inter = Inter({ subsets: ['latin'], preload: false });

export const metadata: Metadata = {
  title: 'SRC Portal | Sa\'adu Zungur University',
  description: 'Official Student Representative Council Portal for Sa\'adu Zungur University',
  keywords: ['SZU', 'Student Portal', 'SRC', 'Complaints', 'University'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider>
            <ToastProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </ToastProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}