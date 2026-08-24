// app/users/page.tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import LoadingState from '@/components/LoadingState';
import AccessDenied from '@/components/AccessDenied';
import { toast } from 'sonner';
import {
  Users, Search, Shield, Edit, Trash2, UserPlus, Mail,
  Phone, RefreshCw, Check, X, AlertCircle,
  Building, Lock, FileDown, FileUp, GraduationCap, KeyRound,
  Camera, Loader2, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  fetchUsers, 
  updateUserRole, 
  fetchFaculties, 
  fetchDepartments, 
  createUser,
  deleteUser,
  exportUsers,
  resetUserPassword,
  bulkImportUsers,
  uploadUserAvatar,
  updateUser
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import EditUserModal from '@/components/EditUserModal';
import AvatarImage from '@/components/AvatarImage';
import { useAuth } from '@/providers/auth';
import type { Role } from '@/types';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentId?: string;
  level?: string;
  studentStatus?: string;
  avatarUrl?: string;
  department?: {
    id: string;
    name: string;
    code: string;
    faculty?: any;
  };
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
}

const ALL_ROLES: { value: Role; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SRC_MEMBER', label: 'SRC Member' },
  { value: 'ICT_UNIT', label: 'ICT Unit Staff' },
  { value: 'SECURITY_UNIT', label: 'Security Unit Staff' },
  { value: 'HOSTEL_MANAGEMENT_UNIT', label: 'Hostel Unit Staff' },
  { value: 'SENATE_UNIT', label: 'Senate Unit Staff' },
  { value: 'CLASS_REP', label: 'Class Rep' },
  { value: 'STUDENT', label: 'Student' },
];

const STUDENT_LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L'];

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const userRole = (user?.role as Role) || 'STUDENT';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Fetching with pagination
  const { data: rawUsers, isLoading: usersLoading, refetch, isFetching } = useQuery({
    queryKey: ['users', page, limit],
    queryFn: fetchUsers,
    enabled: !!user && isSuperAdmin,
    staleTime: 30000,
  });

  const users = useMemo(() => {
    return Array.isArray(rawUsers) ? rawUsers : rawUsers?.data || rawUsers?.users || [];
  }, [rawUsers]);

  // Role Update Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => 
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User Role Updated Successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error('Update Failed', {
        description: error.response?.data?.message || error.message || 'Failed to update role',
      });
    },
  });

  // Deactivate/Delete Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success('User Account Removed/Deactivated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error('Action Failed', {
        description: error.response?.data?.message || error.message || 'Failed to deactivate user',
      });
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) => resetUserPassword(userId),
    onSuccess: () => {
      toast.success('Password Reset Successful', {
        description: 'Temporary default password has been applied.',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error('Reset Failed', {
        description: error.response?.data?.message || error.message || 'Failed to reset password',
      });
    },
  });

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: (data: any) => createUser(data),
    onSuccess: () => {
      toast.success('User Created Successfully', {
        description: 'Password has been sent to email.',
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error('Creation Failed', {
        description: error.response?.data?.message || error.message || 'Failed to create user',
      });
    },
  });

  // Avatar Upload Mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) => 
      uploadUserAvatar(userId, file),
    onSuccess: () => {
      toast.success('Profile Picture Updated Successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAvatarUpload(null);
    },
    onError: (error: any) => {
      toast.error('Upload Failed', {
        description: error.response?.data?.message || error.message || 'Failed to upload avatar',
      });
    },
  });

  // Admin update user mutation (for correcting user fields)
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => updateUser(userId, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error('Update Failed', {
        description: error.response?.data?.message || error.message || 'Failed to update user',
      });
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'SUPER_ADMIN')) {
      toast.error('Unauthorized Access - Super Admin Privilege Required');
      router.push('/dashboard');
    }
  }, [user, authLoading, router, userRole]);

  const handleRoleUpdate = useCallback((targetUser: User) => {
    if (!selectedRole) {
      toast.error('Please select a target role');
      return;
    }
    updateRoleMutation.mutate({ userId: targetUser.id, role: selectedRole });
  }, [selectedRole, updateRoleMutation]);

  const handleResetPassword = useCallback((userId: string, userName: string) => {
    if (confirm(`Are you sure you want to reset ${userName}'s password to the default?`)) {
      resetPasswordMutation.mutate({ userId });
    }
  }, [resetPasswordMutation]);

  const handleDeactivate = useCallback((userId: string, userName: string) => {
    if (confirm(`Are you certain you want to delete/deactivate ${userName}'s account?`)) {
      deleteUserMutation.mutate(userId);
    }
  }, [deleteUserMutation]);

  const handleAvatarFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
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

    uploadAvatarMutation.mutate({ userId, file });
  }, [uploadAvatarMutation]);

  const handleExport = useCallback(async () => {
    try {
      const data = await exportUsers();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-users-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('User data exported successfully');
    } catch (error: any) {
      toast.error('Export failed', {
        description: error.message || 'Failed to export users',
      });
    }
  }, []);

  const getRoleBadgeStyle = useCallback((role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SRC_MEMBER': return 'bg-green-100 text-green-800 border-green-200';
      case 'ICT_UNIT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SECURITY_UNIT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HOSTEL_MANAGEMENT_UNIT': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SENATE_UNIT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLASS_REP': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getStatusBadge = useCallback((status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'GRADUATED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'INACTIVE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Normalize level strings so that '100', '100L', 100 all compare equal
  const normalizeLevel = useCallback((lvl?: string | number | null) => {
    if (lvl === undefined || lvl === null) return '';
    const s = String(lvl).toUpperCase().trim();
    // remove any non-digit characters (e.g., 'L') and return the numeric part
    const digits = s.replace(/[^0-9]/g, '');
    return digits;
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u: User) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesLevel = !levelFilter || (normalizeLevel(u.level) === normalizeLevel(levelFilter));
      return matchesSearch && matchesRole && matchesLevel;
    });
  }, [users, searchQuery, roleFilter, levelFilter, normalizeLevel]);

  if (authLoading || usersLoading) {
    return <LoadingState message="Verifying Privileges & Loading Users..." />;
  }

  if (!user || userRole !== 'SUPER_ADMIN') {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-green-700" />
              Advanced User Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {users.length} total users • {filteredUsers.length} filtered
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="secondary" 
              onClick={() => refetch()} 
              className="flex items-center gap-2 text-sm px-3 py-2"
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2 text-sm px-3 py-2">
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="secondary" onClick={() => setShowBulkImport(true)} className="flex items-center gap-2 text-sm px-3 py-2">
              <FileUp className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Import</span>
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-green-700 to-green-800 text-white flex items-center gap-2 text-sm px-4 py-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Register User</span>
            </Button>
          </div>
        </div>

        {/* System Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Accounts', value: users.length, color: 'bg-blue-50 text-blue-800', icon: Users },
            { label: 'Students & Reps', value: users.filter((u: any) => ['STUDENT', 'CLASS_REP'].includes(u.role)).length, color: 'bg-gray-100 text-gray-800', icon: GraduationCap },
            { label: 'SRC & Units Staff', value: users.filter((u: any) => ['SRC_MEMBER', 'ICT_UNIT', 'SECURITY_UNIT', 'HOSTEL_MANAGEMENT_UNIT', 'SENATE_UNIT'].includes(u.role)).length, color: 'bg-green-50 text-green-800', icon: Shield },
            { label: 'Super Admins', value: users.filter((u: any) => u.role === 'SUPER_ADMIN').length, color: 'bg-purple-50 text-purple-800', icon: KeyRound },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 sm:p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 sm:p-5 border-0 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-green-700 transition-colors" />
              <input
                type="text"
                placeholder="Search user by name, email, or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 font-medium text-sm"
            >
              <option value="">Filter By Role (All Roles)</option>
              {ALL_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 font-medium text-sm"
            >
              <option value="">Filter By Level (All)</option>
              {STUDENT_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Users Roster Table */}
        <Card className="p-0 border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-600">
                  <th className="py-3 sm:py-4 px-3 sm:px-6">User Account</th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6">Contact</th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 hidden md:table-cell">Department</th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6">Role</th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 hidden sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u: User) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm overflow-hidden">
                              {/* For the user management list, show a simple initial avatar (clickable) instead of the full image.
                                  Admins can view the full picture on the detailed user page. */}
                              <button
                                onClick={() => router.push(`/users/${u.id}`)}
                                aria-label={`Open ${u.name} profile`}
                                className="w-full h-full flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-pointer"
                              >
                                {u.name?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'U'}
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setShowAvatarUpload(u.id);
                                if (fileInputRef.current) {
                                  fileInputRef.current.click();
                                }
                              }}
                              className="absolute -bottom-1 -right-1 p-0.5 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-sm transition-all"
                              title="Upload Profile Picture"
                            >
                              <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{u.name}</p>
                            {u.studentId && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[8px] sm:text-[10px] font-mono">
                                ID: {u.studentId}
                              </span>
                            )}
                            {u.level && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[8px] sm:text-[10px] font-mono ml-1">
                                {u.level}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <p className="text-xs sm:text-sm text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
                          {u.email}
                        </p>
                        {u.phoneNumber && (
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                            {u.phoneNumber}
                          </p>
                        )}
                      </td>

                      <td className="py-3 sm:py-4 px-3 sm:px-6 hidden md:table-cell">
                        <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[140px]">
                          {u.department?.name || 'Unassigned'}
                        </p>
                        {u.studentStatus && (
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold border ${getStatusBadge(u.studentStatus)}`}>
                            {u.studentStatus}
                          </span>
                        )}
                      </td>

                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        {editingUser?.id === u.id ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value as Role)}
                              className="px-2 py-1 text-[10px] sm:text-xs border-2 border-green-600 rounded-lg font-semibold focus:outline-none bg-white"
                            >
                              <option value="">Change...</option>
                              {ALL_ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRoleUpdate(u)}
                              className="p-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                              title="Commit Role Change"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ) : (
                          <Badge className={`${getRoleBadgeStyle(u.role)} border px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold inline-block`}>
                            {u.role.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 sm:py-4 px-3 sm:px-6 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                  <td colSpan={5} className="py-12 sm:py-16 text-center">
                      <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No matching user accounts found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (showAvatarUpload) {
            handleAvatarFileChange(e, showAvatarUpload);
          }
        }}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
          createUserMutation={createUserMutation}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            setShowBulkImport(false);
            refetch();
          }}
        />
      )}

      {/* Edit User Modal (Admin corrections) */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }}
          updateUserMutation={updateUserMutation}
        />
      )}
    </div>
  );
}

// CreateUserModal component (optimized with useMemo)
function CreateUserModal({ 
  onClose, 
  onSuccess, 
  createUserMutation 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  createUserMutation: any;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    facultyId: '',
    departmentId: '',
    phoneNumber: '',
    role: 'STUDENT' as Role,
    level: '',
    studentStatus: 'ACTIVE',
  });

  const { data: faculties = [], isLoading: facultiesLoading } = useQuery({
    queryKey: ['faculties'],
    queryFn: fetchFaculties,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', formData.facultyId],
    queryFn: () => fetchDepartments(formData.facultyId),
    enabled: !!formData.facultyId,
    staleTime: 60000,
  });

  const isStaffRole = ['ICT_UNIT', 'SECURITY_UNIT', 'HOSTEL_MANAGEMENT_UNIT', 'SENATE_UNIT', 'SRC_MEMBER', 'SUPER_ADMIN'].includes(formData.role);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }

    const submitData = {
      name: formData.name,
      email: formData.email,
      studentId: formData.studentId || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      role: formData.role,
      level: formData.level || undefined,
      studentStatus: formData.studentStatus,
      departmentId: formData.departmentId || undefined,
      facultyId: formData.facultyId || undefined,
    };

    createUserMutation.mutate(submitData);
  }, [formData, createUserMutation]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl p-6 sm:p-8 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
          <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
          Register Institutional User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Email Address *</label>
              <input
                type="email"
                placeholder="user@university.edu.ng"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">System Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 font-medium text-sm"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Phone Number</label>
              <input
                type="tel"
                placeholder="08012345678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              />
            </div>
          </div>

          {!isStaffRole && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Student ID</label>
                  <input
                    type="text"
                    placeholder="e.g. SZ/2022/CSC/001"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 font-medium text-sm"
                  >
                    <option value="">Select Level</option>
                    {STUDENT_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Student Status</label>
                <select
                  value={formData.studentStatus}
                  onChange={(e) => setFormData({ ...formData, studentStatus: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 font-medium text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Faculty</label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value, departmentId: '' })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
                disabled={facultiesLoading}
              >
                <option value="">Select Faculty (Optional)</option>
                {faculties.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                disabled={!formData.facultyId}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm disabled:bg-gray-200"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              New accounts are auto-assigned a temporary bootstrap password of <strong>password123</strong>. Users will be required to update it immediately upon their first authenticated session.
            </p>
          </div> */}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-green-700 hover:bg-green-800 text-white" 
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// BulkImportModal component (optimized)
function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (importFile: File) => bulkImportUsers(importFile),
    onSuccess: (data: any) => {
      // data expected to be { success: [], failed: [] }
      const successCount = Array.isArray(data?.success) ? data.success.length : 0;
      const failedCount = Array.isArray(data?.failed) ? data.failed.length : 0;
      toast.success(`Bulk Import Completed — ${successCount} created, ${failedCount} failed`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Optionally log details to console for admin
      if (failedCount > 0) {
        console.warn('Bulk import failures:', data.failed);
      }
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Bulk Import Failed', {
        description: error.response?.data?.message || error.message || 'Failed to import users',
      });
    },
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please attach a valid file first');
      return;
    }
    importMutation.mutate(file);
  }, [file, importMutation]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 border-0 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
          Bulk User Import
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-green-600 hover:bg-green-50/20 transition-all cursor-pointer">
            <input
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="bulk-upload-input"
            />
            <p className="text-xs text-gray-500 mt-2">Supports CSV, JSON, XLSX (Excel)</p>
            <label htmlFor="bulk-upload-input" className="cursor-pointer">
              <FileUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Click to upload CSV or JSON template</p>
              <p className="text-xs text-gray-500 mt-1">Supports batch rosters</p>
            </label>
            {file && (
              <p className="mt-3 text-xs font-semibold text-green-700 bg-green-50 py-1.5 px-3 rounded-lg inline-block">
                Attached: {file.name}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-green-700 hover:bg-green-800 text-white" 
              disabled={importMutation.isPending || !file}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Start Import'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}