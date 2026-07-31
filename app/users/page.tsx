'use client';

import { useState, useEffect } from 'react';
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
  Building, Lock, FileDown, FileUp, GraduationCap, KeyRound, Server, Building2, Landmark
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
  bulkImportUsers
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import type { Role } from '@/types';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentId?: string;
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

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const userRole = (user?.role as Role) || 'STUDENT';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Data Fetching
  const { data: rawUsers, isLoading: usersLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!user && isSuperAdmin,
  });

  // Safely ensure users is always an array regardless of API payload structure
  const users = Array.isArray(rawUsers) ? rawUsers : rawUsers?.data || rawUsers?.users || [];

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
        description: error.customMessage || error.message,
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
        description: error.customMessage || error.message,
      });
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => resetUserPassword(userId),
    onSuccess: () => {
      toast.success('Password Reset Successful', {
        description: 'Temporary default password has been applied.',
      });
    },
    onError: (error: any) => {
      toast.error('Reset Failed', {
        description: error.customMessage || error.message,
      });
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'SUPER_ADMIN')) {
      toast.error('Unauthorized Access - Super Admin Privilege Required');
      router.push('/dashboard');
    }
  }, [user, authLoading, router, userRole]);

  if (authLoading || usersLoading) {
    return <LoadingState message="Verifying Privileges & Loading Users..." />;
  }

  if (!user || userRole !== 'SUPER_ADMIN') {
    return <AccessDenied />;
  }

  const handleRoleUpdate = (targetUser: User) => {
    if (!selectedRole) {
      toast.error('Please select a target role');
      return;
    }
    updateRoleMutation.mutate({ userId: targetUser.id, role: selectedRole });
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('Are you sure you want to reset this user\'s password to default?')) {
      resetPasswordMutation.mutate(userId);
    }
  };

  const handleDeactivate = (userId: string) => {
    if (confirm('Are you certain you want to delete/deactivate this user account?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportUsers('json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-users-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('User database exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
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
  };

  const filteredUsers = users.filter((u: User) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-green-700" />
              Advanced User Management
            </h1>
            <p className="text-gray-600 mt-1">Full administrative control over institutional roles, units, and system accounts</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export
            </Button>
            <Button variant="secondary" onClick={() => setShowBulkImport(true)} className="flex items-center gap-2">
              <FileUp className="w-4 h-4" />
              Bulk Import
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-green-700 to-green-800 text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Register User
            </Button>
          </div>
        </div>

        {/* System Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Accounts', value: users.length, color: 'bg-blue-50 text-blue-800', icon: Users },
            { label: 'Students & Reps', value: users.filter((u: any) => ['STUDENT', 'CLASS_REP'].includes(u.role)).length, color: 'bg-gray-100 text-gray-800', icon: GraduationCap },
            { label: 'SRC & Units Staff', value: users.filter((u: any) => ['SRC_MEMBER', 'ICT_UNIT', 'SECURITY_UNIT', 'HOSTEL_MANAGEMENT_UNIT', 'SENATE_UNIT'].includes(u.role)).length, color: 'bg-green-50 text-green-800', icon: Shield },
            { label: 'Super Admins', value: users.filter((u: any) => u.role === 'SUPER_ADMIN').length, color: 'bg-purple-50 text-purple-800', icon: KeyRound },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Toolbar */}
        <Card className="p-5 border-0 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-700 transition-colors" />
              <input
                type="text"
                placeholder="Search user by name, email, or student identity ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 font-medium"
            >
              <option value="">Filter By Role (All Roles)</option>
              {ALL_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Users Roster Table */}
        <Card className="p-0 border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold text-gray-600">
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Contact Channels</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u: User) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            {u.studentId && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                                ID: {u.studentId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <p className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {u.email}
                        </p>
                        {u.phoneNumber && (
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {u.phoneNumber}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-700 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{u.department?.name || 'General / Unassigned'}</span>
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        {editingUser?.id === u.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value as Role)}
                              className="px-2.5 py-1.5 border-2 border-green-600 rounded-lg text-xs font-semibold focus:outline-none bg-white"
                            >
                              <option value="">Change Role...</option>
                              {ALL_ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRoleUpdate(u)}
                              className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                              title="Commit Role Change"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Badge className={`${getRoleBadgeStyle(u.role)} border px-3 py-1 text-xs font-semibold`}>
                            {u.role.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset Password to Default"
                            disabled={resetPasswordMutation.isPending}
                          >
                            <RefreshCw className={`w-4 h-4 ${resetPasswordMutation.isPending ? 'animate-spin' : ''}`} />
                          </button>

                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setSelectedRole(u.role);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User Role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete / Deactivate User Account"
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No matching user accounts found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Registration Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
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
    </div>
  );
}

// User Registration Modal Form
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    facultyId: '',
    departmentId: '',
    phoneNumber: '',
    role: 'STUDENT' as Role,
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: fetchFaculties,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', formData.facultyId],
    queryFn: () => fetchDepartments(formData.facultyId),
    enabled: !!formData.facultyId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createUser(data),
    onSuccess: () => {
      toast.success('Account Created Successfully', {
        description: 'Temporary initial password: password123',
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Registration Failed', {
        description: error.customMessage || error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const isStaffRole = ['ICT_UNIT', 'SECURITY_UNIT', 'HOSTEL_MANAGEMENT_UNIT', 'SENATE_UNIT', 'SRC_MEMBER', 'SUPER_ADMIN'].includes(formData.role);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-8 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
          <UserPlus className="w-6 h-6 text-green-700" />
          Register Institutional User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900"
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
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                System Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 font-medium"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="08012345678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900"
              />
            </div>
          </div>

          {!isStaffRole && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Student Identity ID *</label>
              <input
                type="text"
                placeholder="e.g. SZ/2022/CSC/001"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required={!isStaffRole}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Faculty</label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value, departmentId: '' })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900"
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
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 disabled:bg-gray-200"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              New accounts are auto-assigned a temporary bootstrap password of <strong>password123</strong>. Users will be required to update it immediately upon their first authenticated session.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Registering Account...' : 'Complete Registration'}
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

// Bulk Import Modal Form
function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (importFile: File) => bulkImportUsers(importFile),
    onSuccess: () => {
      toast.success('Bulk Import Completed Successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Bulk Import Failed', {
        description: error.customMessage || error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please attach a valid file first');
      return;
    }
    importMutation.mutate(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-8 border-0 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileUp className="w-6 h-6 text-green-700" />
          Bulk User Import
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-600 hover:bg-green-50/20 transition-all cursor-pointer">
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="bulk-upload-input"
            />
            <label htmlFor="bulk-upload-input" className="cursor-pointer">
              <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Click to upload CSV or JSON template</p>
              <p className="text-xs text-gray-500 mt-1">Supports batch rosters</p>
            </label>
            {file && (
              <p className="mt-3 text-xs font-semibold text-green-700 bg-green-50 py-1.5 px-3 rounded-lg inline-block">
                Attached: {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white" disabled={importMutation.isPending || !file}>
              {importMutation.isPending ? 'Processing Batch...' : 'Start Import'}
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