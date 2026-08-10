// app/layout.tsx
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
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "SRC Portal | Sa'adu Zungur University",
    template: "%s | SRC Portal - SAZU",
  },
  description: "Official Student Representative Council Portal for Sa'adu Zungur University, Bauchi State, Nigeria.",
  keywords: [
    'SAZU', 
    'Student Portal', 
    'SRC', 
    'Complaints', 
    'University', 
    'Bauchi',
    'Sa\'adu Zungur University',
    'Student Representative Council',
    'Student Complaints',
    'Academic Portal'
  ],
  authors: [{ name: 'Sa\'adu Zungur University SRC' }],
  creator: 'Sa\'adu Zungur University',
  publisher: 'Sa\'adu Zungur University SRC',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://src.sazu.edu.ng',
    title: 'SRC Portal | Sa\'adu Zungur University',
    description: 'Official Student Representative Council Portal for Sa\'adu Zungur University, Bauchi State, Nigeria.',
    siteName: 'SAZU SRC Portal',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SAZU SRC Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SRC Portal | Sa\'adu Zungur University',
    description: 'Official Student Representative Council Portal for Sa\'adu Zungur University, Bauchi State, Nigeria.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* University Branding - Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: "Sa'adu Zungur University",
              alternateName: 'SAZU',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://src.sazu.edu.ng',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'PMB 0698, Bauchi',
                addressLocality: 'Bauchi',
                addressRegion: 'Bauchi State',
                addressCountry: 'Nigeria',
                postalCode: '740001',
              },
              sameAs: [
                'https://sazu.edu.ng',
                'https://facebook.com/sazu.edu.ng',
                'https://twitter.com/sazu_edu_ng',
              ],
            }),
          }}
        />
      </head>
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