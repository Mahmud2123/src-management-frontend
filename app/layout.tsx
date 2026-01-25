import './globals.css';
import { ReactQueryProvider } from '../providers/react-query';
import { AuthProvider } from '../providers/auth';
import { ToastProvider } from '../providers/sonner';
import LayoutWrapper from './LayoutWrapper';

export const metadata = {
  title: 'SRC Complaint Portal',
  description: 'Saadu Zungur University SRC Complaint System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-50 to-green-50/30">
        <ReactQueryProvider>
          <AuthProvider>
            <ToastProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ToastProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}