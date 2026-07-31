'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [homeHref, setHomeHref] = useState('/');

  useEffect(() => {
    const token = localStorage.getItem('src_token');
    if (token) {
      setHomeHref('/dashboard');
    } else {
      setHomeHref('/');
    }
  }, []);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white p-6 select-none">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-flex p-4 bg-red-50 rounded-2xl text-red-600 ring-8 ring-red-50/50">
          <ShieldAlert className="w-14 h-14" />
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 mb-2 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Lost in the corridors?
        </h2>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          The requested page does not exist or your account doesn't have 
          the clearanced access level for this sector.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          
          <Link href={homeHref} passHref>
            <Button className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white flex items-center justify-center gap-2 shadow-sm">
              <Home className="w-4 h-4" /> {homeHref === '/dashboard' ? 'Home Dashboard' : 'Home'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}