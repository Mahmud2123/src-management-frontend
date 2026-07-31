import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/auth';
import { ToastProvider } from '@/providers/sonner';
import { ReactQueryProvider } from '@/providers/react-query';
import LayoutWrapper from './LayoutWrapper';

const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  preload: true 
});

export const viewport: Viewport = {
  themeColor: '#064e3b',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "SRC Portal | Sa'adu Zungur University",
    template: "%s | SRC Portal - SAZU",
  },
  description: "Official Student Representative Council Portal for Sa'adu Zungur University",
  keywords: ['SAZU', 'Student Portal', 'SRC', 'Complaints', 'University', 'Bauchi'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 text-gray-900`}>
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