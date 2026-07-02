// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/auth';
import { ThemeProvider } from '@/providers/ThemeProvider';
<<<<<<< HEAD
import { ToastProvider } from '@/providers/sonner';
import LayoutWrapper from './LayoutWrapper';
import { ReactQueryProvider } from '@/providers/react-query';

const inter = Inter({ subsets: ['latin'], preload: false });
=======
import { Toaster } from 'sonner';
import LayoutWrapper from './LayoutWrapper';
import {ReactQueryProvider} from '@/providers/react-query';

const inter = Inter({ subsets: ['latin'],preload: false });
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
<<<<<<< HEAD
              <ToastProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </ToastProvider>
=======
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <Toaster 
                position="top-right"
                richColors
                closeButton
                duration={4000}
              />
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}