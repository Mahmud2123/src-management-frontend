'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';
import { Lock, ShieldOff, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function AccessDenied() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon with Alert Animation */}
        <div className="relative mb-8 inline-flex">
          <div className="absolute inset-0 bg-red-200 blur-2xl rounded-full opacity-30 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-red-100">
            <ShieldOff className="w-16 h-16 text-red-600" />
            <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1.5 border-4 border-white">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Restricted Area</h1>
        <p className="text-gray-600 mb-8 px-4">
          Your current account role does not have the necessary permissions to access this department. If you believe this is an error, please contact the IT Administrator.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard" className="block w-full">
            <Button className="w-full bg-gray-900 hover:bg-black text-white py-6 rounded-xl flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Return to Dashboard
            </Button>
          </Link>
          
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => window.history.back()}
              className="flex-1 py-6 rounded-xl"
            >
              Go Back
            </Button>
            <Button 
              variant="secondary" 
              onClick={logout}
              className="flex-1 py-6 rounded-xl text-red-600 hover:bg-red-50 border-red-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}