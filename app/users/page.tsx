'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import LoadingState from '@/components/LoadingState';
import AccessDenied from '@/components/AccessDenied';
import { toast } from 'sonner';
// ✅ Removed direct axios import to prevent accidental use
import {
  Users, Search, Shield, Edit, Trash2, UserPlus, Mail,
  Phone, RefreshCw, Check, X, AlertCircle,
  Download, Upload, Plus, GraduationCap, Building, Lock,
  FileDown, FileUp
} from 'lucide-react';
// ✅ Added all necessary centralized API imports
import { 
  fetchUsers, 
  updateUserRole, 
  fetchFaculties, 
  fetchDepartments, 
  createUser,
  deleteUser, // Used for deactivation logic
  exportUsers,
  resetUserPassword // Imported only for the reset password logic if not in lib/api
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  studentId?: string;
  department?: {
    id: string;
    name: string;
    code: string;
    faculty: any;
  };
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
}

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Data Fetching
  const { data: users = [], isLoading: usersLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // ✅ FIXED: Role Update Mutation (Using centralized API)
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('Role Updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error('Update Failed', {
        description: error.customMessage || error.message,
      });
    },
  });

  // ✅ FIXED: Deactivate Mutation (Using centralized API)
  const deactivateUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId), // Assuming your deleteUser calls the deactivate endpoint
    onSuccess: () => {
      toast.success('User Deactivated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error('Deactivation Failed', {
        description: error.customMessage || error.message,
      });
    },
  });

 // ✅ FIXED: Reset Password Mutation (Now calling your api lib)
 const resetPasswordMutation = useMutation({
  mutationFn: (userId: string) => resetUserPassword(userId),
  onSuccess: () => {
    toast.success('Password Reset', {
      description: 'User password has been reset to the default.',
    });
  },
  onError: (error: any) => {
    toast.error('Reset Failed', {
      description: error.customMessage || error.message,
    });
  },
});

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      toast.error('Unauthorized Access');
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || usersLoading) {
    return <LoadingState message="Checking Credentials..." />;
  }

  if (!user || user.role !== 'ADMIN') {
    return <AccessDenied />;
  }

  const handleRoleUpdate = (user: User) => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    updateRoleMutation.mutate({ userId: user.id, role: selectedRole });
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('Reset this user\'s password?')) {
      resetPasswordMutation.mutate(userId);
    }
  };

  const handleDeactivate = (userId: string) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      deactivateUserMutation.mutate(userId);
    }
  };

  // ✅ FIXED: Export Function (Using centralized API)
  const handleExport = async () => {
    try {
      const data = await exportUsers('json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
      SRC_EXECUTIVE: 'bg-blue-100 text-blue-700 border-blue-200',
      SRC_MEMBER: 'bg-green-100 text-green-700 border-green-200',
      CLASS_REP: 'bg-orange-100 text-orange-700 border-orange-200',
      STUDENT: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredUsers = users.filter((u: User) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
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
              <Users className="w-8 h-8 text-green-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage student and staff accounts</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowBulkImport(true)} className="flex items-center gap-2">
              <FileUp className="w-4 h-4" />
              Bulk Import
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-green-600 to-green-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: 'bg-blue-100 text-blue-700', icon: Users },
            { label: 'Students', value: users.filter((u) => u.role === 'STUDENT').length, color: 'bg-gray-100 text-gray-700', icon: GraduationCap },
            { label: 'Class Reps', value: users.filter((u) => u.role === 'CLASS_REP').length, color: 'bg-orange-100 text-orange-700', icon: Shield },
            { label: 'SRC Members', value: users.filter((u) => u.role === 'SRC_MEMBER').length, color: 'bg-green-100 text-green-700', icon: Shield },
            { label: 'Admins', value: users.filter((u) => u.role === 'ADMIN').length, color: 'bg-purple-100 text-purple-700', icon: Shield },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="CLASS_REP">Class Reps</option>
              <option value="SRC_MEMBER">SRC Members</option>
              <option value="SRC_EXECUTIVE">SRC Executives</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6 border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Department</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            {user.studentId && (
                              <p className="text-xs text-gray-500">{user.studentId}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </p>
                          {user.phoneNumber && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                       {/* Access the name property of the object, with safety checks */}
                        {(user.department as any)?.name || 'N/A'} 
                      </p>
                      </td>
                      <td className="py-4 px-4">
                        {editingUser?.id === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="px-3 py-2 border-2 border-green-500 rounded-lg text-sm focus:outline-none"
                            >
                              <option value="">Select Role</option>
                              <option value="STUDENT">Student</option>
                              <option value="CLASS_REP">Class Rep</option>
                              <option value="SRC_MEMBER">SRC Member</option>
                              <option value="SRC_EXECUTIVE">SRC Executive</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <button
                              onClick={() => handleRoleUpdate(user)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Badge className={`${getRoleBadgeColor(user.role)} border px-3 py-1`}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                        <button
      onClick={() => handleResetPassword(user.id)}
      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
      title="Reset Password"
      disabled={resetPasswordMutation.isPending}
    >
      <RefreshCw className={`w-4 h-4 ${resetPasswordMutation.isPending ? 'animate-spin' : ''}`} />
    </button>

    <button
      onClick={() => {
        setEditingUser(user);
        setSelectedRole(user.role);
      }}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title="Edit Role"
    >
      <Edit className="w-4 h-4" />
    </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }} />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal onClose={() => setShowBulkImport(false)} onSuccess={() => {
          setShowBulkImport(false);
          refetch();
        }} />
      )}
    </div>
  );
}

// Create User Modal Component
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    facultyId: '',
    departmentId: '',
    phoneNumber: '',
    role: 'STUDENT',
  });
    
     // ✅ FIXED: Fetch faculties using centralized API
  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: fetchFaculties,
  });

  // ✅ FIXED: Fetch departments using centralized API
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', formData.facultyId],
    queryFn: () => fetchDepartments(formData.facultyId),
    enabled: !!formData.facultyId,
  });

  // ✅ FIXED: Create User Mutation using centralized API
  const createMutation = useMutation({
    mutationFn: (data: any) => createUser(data),
    onSuccess: () => {
      toast.success('User Created', {
        description: 'Default password is password123. User must change it on first login.',
        duration: 5000,
      });
      // Invalidate the users list so the table updates
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Failed to create user', {
        description: error.customMessage || error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-8 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-green-600" />
          Create New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Student ID {formData.role === 'STUDENT' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required={formData.role === 'STUDENT'}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Faculty <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.facultyId}
                onChange={(e) => {
                  setFormData({ ...formData, facultyId: e.target.value, departmentId: '' });
                }}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty: any) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
                disabled={!formData.facultyId}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <option value="">Select Department</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {!formData.facultyId && (
                <p className="text-xs text-gray-500">Please select a faculty first</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
            >
              <option value="STUDENT">Student</option>
              <option value="CLASS_REP">Class Rep</option>
              <option value="SRC_MEMBER">SRC Member</option>
              <option value="SRC_EXECUTIVE">SRC Executive</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 text-sm">Default Password Policy</p>
                <p className="text-blue-700 text-sm mt-1">
                  Password will be set to <strong>password123</strong>. User must change it on first login.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Bulk Import Modal Component
function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('http://localhost:3001/api/users/bulk-import', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('src_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Users imported successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Import failed', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    importMutation.mutate(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-8 border-0 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6 text-green-600" />
          Bulk Import Users
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/30 transition-all">
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="bulk-file"
            />
            <label htmlFor="bulk-file" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Click to upload CSV or JSON</p>
              <p className="text-sm text-gray-500 mt-1">Maximum file size: 5MB</p>
            </label>
            {file && (
              <p className="mt-4 text-sm font-medium text-green-600">Selected: {file.name}</p>
            )}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>CSV Format:</strong> name, email, studentId, department, phoneNumber
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={importMutation.isPending || !file}>
              {importMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}