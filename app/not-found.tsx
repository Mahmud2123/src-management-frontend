'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-flex p-4 bg-red-50 rounded-2xl text-red-600">
          <ShieldAlert className="w-16 h-16" />
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Lost in the corridors?
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or you don't have the 
          clearance to enter this section.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          
          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <Home className="w-4 h-4" /> Home Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}