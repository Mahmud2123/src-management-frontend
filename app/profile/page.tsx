// app/profile/page.tsx
'use client';

import { useAuth } from '@/providers/auth';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { 
  Shield, User, Key, Mail, Building2, GraduationCap, 
  Lock, CheckCircle2, Loader2, Camera, Phone, 
  Calendar, Award, AlertCircle, Upload 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/interceptor';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarRequired, setIsAvatarRequired] = useState(false);

  // Ensure we have the freshest user data (fixes stale avatar URLs)
  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Check if avatar is required (user has no avatar)
  useEffect(() => {
    if (user && !user.avatarUrl) {
      setIsAvatarRequired(true);
      toast.info('Profile Picture Required', {
        description: 'Please upload a profile picture to complete your profile.',
        duration: 6000,
      });
    } else {
      setIsAvatarRequired(false);
    }
  }, [user]);

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

  // ✅ FIXED: Use correct endpoint /users/:id/avatar
  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await apiClient.post(`/users/${user.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        toast.success('Profile picture updated successfully!');
        await refreshUser();
        queryClient.invalidateQueries({ queryKey: ['user'] });
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsAvatarRequired(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WEBP, and GIF images are allowed');
      return;
    }

    setAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    
    handleAvatarUpload(file);
  };

  const getRoleBadgeStyle = (role: string = '') => {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SRC_MEMBER': return 'bg-green-100 text-green-800 border-green-200';
      case 'ICT_UNIT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SECURITY_UNIT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HOSTEL_MANAGEMENT_UNIT': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SENATE_UNIT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLASS_REP': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'GRADUATED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'INACTIVE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Resolve avatar src to absolute URL when backend serves uploads at a different origin
  const resolveAvatarSrc = () => {
    if (avatarPreview) return avatarPreview; // use local blob preview if available
    const url = user?.avatarUrl;
    if (!url) return null;
    // Already absolute
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // Prefer explicit API base for static assets, fallback to NEXT_PUBLIC_API_URL without /api
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || null;

    let base = 'http://localhost:3001';
    if (apiBase) base = apiBase.replace(/\/$/, '');
    else if (apiUrl) base = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-4 sm:p-6 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header Banner */}
        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 ${
          isAvatarRequired ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-gray-200/80'
        }`}>
          {/* Avatar with Upload */}
          <div className="relative flex-shrink-0 group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-green-700 to-green-800 shadow-md shadow-green-900/25 flex items-center justify-center">
              {resolveAvatarSrc() ? (
                <img
                  src={resolveAvatarSrc() || ''}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {getUserInitials()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`absolute bottom-0 right-0 p-2 text-white rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50 ${
                isAvatarRequired ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' : 'bg-green-700 hover:bg-green-800'
              }`}
              title="Upload Profile Picture"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
                {user?.name || 'User Profile'}
              </h1>
              {isAvatarRequired && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
                  <AlertCircle className="w-3 h-3" />
                  Action Required
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2 truncate">
              {user?.email || 'No email registered'}
            </p>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(user?.role)}`}>
                <Shield className="w-3.5 h-3.5" />
                {user?.role ? user.role.replace(/_/g, ' ') : 'STUDENT'}
              </span>
              {user?.level && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {user.level}
                </span>
              )}
              {user?.studentStatus && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.studentStatus)}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {user.studentStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {isAvatarRequired && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Profile Picture Required</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Please upload a profile picture by clicking the camera icon on your avatar above. 
                This helps identify you across the platform.
              </p>
            </div>
          </div>
        )}

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
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </p>
                <p className="font-medium text-gray-900 truncate">{user?.phoneNumber || 'N/A'}</p>
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
                <p className="font-medium text-gray-900 truncate">{user?.studentId || 'N/A'}</p>
              </div>

              {user?.level && (
                <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Level
                  </p>
                  <p className="font-medium text-gray-900">{user.level}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Member Since
                </p>
                <p className="font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Security & Password Update Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm border-t-4 border-t-green-700 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Lock className="w-5 h-5 text-green-700" /> Security
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
                    <Key className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>

            {/* Account Status */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Account Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  user?.isActive !== false 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive !== false ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </div>

              {user?.mustChangePassword && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    You are required to change your password for security reasons.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}