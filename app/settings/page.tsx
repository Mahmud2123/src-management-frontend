'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/providers/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, UserPlus, Bell, Server, 
  AlertTriangle
} from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { fetchSystemSettings, updateSystemSettings } from '@/lib/api';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasToasted = useRef(false);

  // Normalize role check (Include SUPER_ADMIN, SYSTEM_ADMIN, and ADMIN)
  const normalizedRole = user?.role ? String(user.role).toUpperCase().trim() : '';
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(normalizedRole);

  // Prevent duplicate toasts using a ref lock
  useEffect(() => {
    if (!authLoading && user && !isAdmin && !hasToasted.current) {
      hasToasted.current = true;
      toast.error('Access Restricted', {
        id: 'settings-access-denied', // Prevents duplicate toasts
        description: `Your role (${user.role}) is not authorized to access the settings portal.`,
      });
      router.replace('/dashboard');
    }
  }, [user, authLoading, router, isAdmin]);

  // Fetch settings only if user is authorized admin
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: fetchSystemSettings,
    enabled: !!user && isAdmin,
  });

  const [allowRegistration, setAllowRegistration] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);

  useEffect(() => {
    if (settings) {
      setAllowRegistration(settings.allowClassRepRegistration ?? true);
      setMaintenanceMode(settings.maintenanceMode ?? false);
      setEmailAlerts(settings.emailNotifications ?? true);
    }
  }, [settings]);

  const settingsMutation = useMutation({
    mutationFn: (newSettings: any) => updateSystemSettings(newSettings),
    onSuccess: () => {
      toast.success('System Settings Updated', {
        description: 'Changes have taken effect across the portal immediately.',
      });
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update settings', {
        description: error?.response?.data?.message || error?.message || 'Server error',
      });
    },
  });

  const handleToggleRegistration = () => {
    const nextValue = !allowRegistration;
    setAllowRegistration(nextValue);
    settingsMutation.mutate({ allowClassRepRegistration: nextValue });
  };

  const handleToggleMaintenance = () => {
    const nextValue = !maintenanceMode;
    setMaintenanceMode(nextValue);
    
    settingsMutation.mutate({ maintenanceMode: nextValue }, {
      onSuccess: () => {
        toast.success(nextValue ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled', {
          description: nextValue 
            ? 'All non-admin users will now be restricted and redirected.' 
            : 'Portal operations have resumed normally.',
        });
        queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      }
    });
  };
  
  if (authLoading || (settingsLoading && isAdmin)) {
    return <LoadingState />;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="p-8 max-w-md text-center border-0 shadow-xl rounded-2xl">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
          <p className="text-slate-600 text-sm mt-2 font-medium">
            This area is restricted strictly to System Administrators.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Server className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Control Panel</h1>
              <p className="text-slate-500 font-bold text-sm italic">
                Manage registration rules and portal maintenance
              </p>
            </div>
          </div>
          <Badge className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full font-black text-xs">
            ADMIN ONLY
          </Badge>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <UserPlus className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-black text-slate-900">Student & Class Rep Registration Rules</h2>
                <p className="text-xs text-slate-500 font-medium">Control whether Class Reps can add new students to the portal</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm">Class Rep Student Registration</p>
                  <p className="text-xs text-slate-500 font-medium">
                    When disabled, Class Reps will not be able to add new students to their departments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleRegistration}
                  disabled={settingsMutation.isPending}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowRegistration ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowRegistration ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="font-bold text-amber-950 text-sm">System Maintenance Mode</p>
                  </div>
                  <p className="text-xs text-amber-800 font-medium">
                    Restricts portal write access for students and class reps during data audits or maintenance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMaintenance}
                  disabled={settingsMutation.isPending}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    maintenanceMode ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      maintenanceMode ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-black text-slate-900">System Notification Triggers</h2>
                <p className="text-xs text-slate-500 font-medium">Manage dispatch rules for system alert broadcasts</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Broadcast Complaint Escalations</span>
                  <span className="text-xs text-slate-500 font-medium">Trigger real-time socket updates when complaints change status</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={() => {
                    const next = !emailAlerts;
                    setEmailAlerts(next);
                    settingsMutation.mutate({ emailNotifications: next });
                  }}
                  className="w-5 h-5 rounded text-blue-600 accent-blue-600" 
                />
              </label>


            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}