'use client';

import { useAuth } from '@/providers/auth';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Shield, User, Key, Mail, Building2, GraduationCap, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/interceptor';

export default function ProfilePage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.current || !passwords.next) {
      toast.error('Please fill in both your current and new password.');
      return;
    }

    if (passwords.next.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    if (passwords.next !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Connects to your NestJS backend endpoint (adjust route if needed, e.g. /users/change-password or /auth/change-password)
      await apiClient.patch('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });

      toast.success('Password updated successfully!', {
        description: 'Your security credentials have been updated.',
      });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.customMessage || 'Failed to update password. Please check your current password.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeStyle = (role: string = '') => {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SRC_MEMBER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ICT_UNIT':
      case 'SECURITY_UNIT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 select-none">
      {/* Profile Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-green-700 to-green-800 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-green-900/25 flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight truncate">{user?.name || 'User Profile'}</h1>
          <p className="text-sm text-gray-500 mb-2 truncate">{user?.email || 'No email registered'}</p>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(user?.role)}`}>
            <Shield className="w-3.5 h-3.5" />
            {user?.role ? user.role.replace(/_/g, ' ') : 'STUDENT'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information Card */}
        <div className="md:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
            <User className="w-5 h-5 text-green-700" /> Personal Information
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </p>
              <p className="font-medium text-gray-900 truncate">{user?.email || 'N/A'}</p>
            </div>

            <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Department
              </p>
              <p className="font-medium text-gray-900 truncate">{user?.department?.name || 'N/A'}</p>
            </div>

            <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Student / Staff ID
              </p>
              <p className="font-medium text-gray-900 truncate">{(user as any)?.studentId || (user as any)?.matricNumber || 'N/A'}</p>
            </div>

            <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Account Status
              </p>
              <p className="font-medium text-green-700">Active & Verified</p>
            </div>
          </div>
        </div>

        {/* Security & Password Update Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm border-t-4 border-t-green-700 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Key className="w-5 h-5 text-green-700" /> Security
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Input 
                type="password" 
                label="Current Password" 
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                required
              />
            </div>

            <div>
              <Input 
                type="password" 
                label="New Password" 
                placeholder="Min. 8 characters"
                value={passwords.next}
                onChange={(e) => setPasswords({...passwords, next: e.target.value})}
                required
              />
            </div>

            <div>
              <Input 
                type="password" 
                label="Confirm New Password" 
                placeholder="Re-type new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-green-900/10 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}