// components/UnauthorizedAccess.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface UnauthorizedAccessProps {
  type?: 'unauthorized' | 'forbidden' | 'session-expired';
  message?: string;
  redirectTo?: string;
}

export function UnauthorizedAccess({ 
  type = 'unauthorized',
  message,
  redirectTo = '/login',
}: UnauthorizedAccessProps) {
  const router = useRouter();

  const configs = {
    unauthorized: {
      icon: ShieldAlert,
      title: 'Access Denied',
      description: 'You need to be logged in to access this page. Please log in to continue.',
      buttonText: 'Log In',
      buttonIcon: Lock,
    },
    'session-expired': {
      icon: ShieldAlert,
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again to continue.',
      buttonText: 'Log In Again',
      buttonIcon: Lock,
    },
    forbidden: {
      icon: ShieldAlert,
      title: 'Forbidden Access',
      description: 'You do not have permission to access this resource. Please contact support if you believe this is an error.',
      buttonText: 'Go Home',
      buttonIcon: Home,
    },
  };

  const config = configs[type];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center border-0 shadow-xl rounded-3xl bg-white">
        <div className="mb-6 inline-flex p-4 bg-red-50 rounded-2xl text-red-600 ring-8 ring-red-50/50">
          <config.icon className="w-14 h-14" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {config.title}
        </h1>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          {message || config.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          
          <Button 
            onClick={() => router.push(redirectTo)}
            className="bg-green-700 hover:bg-green-800 text-white flex items-center justify-center gap-2 shadow-sm"
          >
            <config.buttonIcon className="w-4 h-4" /> {config.buttonText}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Contact SRC Support: <a href="mailto:src@sazu.edu.ng" className="text-green-700 hover:underline">
              src@sazu.edu.ng
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © {new Date().getFullYear()} Sa'adu Zungur University, Bauchi, Nigeria
          </p>
        </div>
      </Card>
    </div>
  );
}