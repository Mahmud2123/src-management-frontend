'use client';

import { useState } from 'react';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import apiClient from '@/lib/api/interceptor';

export default function MaintenancePage() {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const res = await apiClient.get('/settings');
      if (!res.data?.maintenanceMode) {
        window.location.href = '/';
      } else {
        window.location.reload();
      }
    } catch (error) {
      setIsChecking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('src_token');
    localStorage.removeItem('src_user');
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">System Under Maintenance</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The student portal is currently undergoing scheduled maintenance and system upgrades. Student access is temporarily restricted. Please check back shortly.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full py-3 px-4 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking System Status...' : 'Check Status Again'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Back to Home
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Sa'adu Zungur University SRC Portal
        </p>
      </div>
    </main>
  );
}