'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/providers/auth';
import { toast } from 'sonner';
import { 
  addStudentByClassRep, 
  fetchUserActivity, 
  fetchMyStudents, 
  fetchSystemSettings 
} from '@/lib/api';

import {
  GraduationCap, UserPlus, Users, Building,
  Lock, AlertCircle, CheckCircle, Search, RefreshCw, X, ShieldAlert
} from 'lucide-react';

export default function ClassRepPortal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract department info cleanly from auth context
  const userDept = user?.department as any;
  const isDepartmentAssigned = Boolean(userDept?.id && userDept?.facultyId);

  // Fetch system-wide settings set by Admin
  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: fetchSystemSettings,
  });

  const isRegistrationAllowed = settings?.allowClassRepRegistration ?? true;
  const isMaintenanceMode = settings?.maintenanceMode ?? false;

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phoneNumber: '',
    facultyId: userDept?.facultyId || '',
    departmentId: userDept?.id || '',
  });

  // Fetch recent activities
  const { data: activities = [] } = useQuery({
    queryKey: ['user-activity'],
    queryFn: fetchUserActivity,
  });

  // Fetch department-scoped students
  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ['my-department-students'],
    queryFn: fetchMyStudents,
  });

  // Synchronize form state whenever user profile resolves
  useEffect(() => {
    if (userDept) {
      setFormData((prev) => ({
        ...prev,
        facultyId: userDept.facultyId || '',
        departmentId: userDept.id || '',
      }));
    }
  }, [userDept]);

  const addStudentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return addStudentByClassRep(data);
    },
    onSuccess: () => {
      toast.success('Student Added Successfully', {
        description: 'Default password is password123. Student must change it on first login.',
        duration: 5000,
      });
      setFormData({
        name: '',
        studentId: '',
        email: '',
        phoneNumber: '',
        facultyId: userDept?.facultyId || '',
        departmentId: userDept?.id || '',
      });
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-department-students'] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
    },
    onError: (error: any) => {
      toast.error('Failed to Add Student', {
        description: error?.response?.data?.message || error?.message || 'An unexpected error occurred.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isMaintenanceMode) {
      toast.error('Portal Under Maintenance', {
        description: 'System actions are currently suspended by System Administrator.',
      });
      return;
    }

    if (!isRegistrationAllowed) {
      toast.error('Registration Closed', {
        description: 'Student registration has been temporarily closed by System Administrator.',
      });
      return;
    }

    if (!isDepartmentAssigned) {
      toast.error('Department Assignment Missing', {
        description: 'You must be assigned to a department by an administrator before adding students.',
      });
      return;
    }

    if (!formData.name.trim() || !formData.studentId.trim() || !formData.email.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    addStudentMutation.mutate({
      ...formData,
      facultyId: userDept.facultyId,
      departmentId: userDept.id,
    });
  };

  const filteredStudents = students.filter(
    (student: any) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading department roster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
              Class Representative Portal
            </h1>
            <p className="text-slate-600 mt-1">
              Manage students in{' '}
              <span className="font-semibold text-slate-900">
                {userDept?.name ? `${userDept.name} (${userDept.code || 'N/A'})` : 'Unassigned Department'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                if (isMaintenanceMode) {
                  toast.error('System Maintenance Mode', {
                    description: 'Portal operations are locked for system maintenance.',
                  });
                  return;
                }
                if (!isRegistrationAllowed) {
                  toast.error('Registration Closed', {
                    description: 'Student registration is disabled by System Administrator.',
                  });
                  return;
                }
                if (!isDepartmentAssigned) {
                  toast.error('Action Restricted', {
                    description: 'Your account is not linked to a department yet.',
                  });
                  return;
                }
                setShowAddForm(true);
              }}
              disabled={!isRegistrationAllowed || isMaintenanceMode}
              className={`flex items-center gap-2 text-white font-bold transition-all ${
                !isRegistrationAllowed || isMaintenanceMode
                  ? 'bg-slate-400 cursor-not-allowed opacity-75'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
              }`}
            >
              {!isRegistrationAllowed || isMaintenanceMode ? (
                <>
                  <Lock className="w-4 h-4" />
                  Registration Disabled
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </>
              )}
            </Button>
          </div>
        </div>

        {/* System Maintenance Banner */}
        {isMaintenanceMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">System Maintenance Active</h3>
              <p className="text-amber-700 text-xs mt-0.5">
                The portal is currently undergoing administrative maintenance. Student updates and additions are temporarily locked.
              </p>
            </div>
          </div>
        )}

        {/* Registration Disabled Banner */}
        {!isRegistrationAllowed && !isMaintenanceMode && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 text-sm">Student Registration Locked</h3>
              <p className="text-red-700 text-xs mt-0.5">
                System Administrator has closed new student registration for Class Representatives. Contact Admin to enable access.
              </p>
            </div>
          </div>
        )}

        {/* Unassigned Department Warning */}
        {!isDepartmentAssigned && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Department Assignment Required</h3>
              <p className="text-amber-700 text-xs mt-0.5">
                You currently do not have a department bound to your profile. Please contact an Administrator to assign your department.
              </p>
            </div>
          </div>
        )}

        {/* High-Contrast Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-slate-200 shadow-md rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Department Students
                </p>
                <p className="text-3xl font-black text-slate-900 mt-0.5">
                  {students.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-200 shadow-md rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Assigned Department
                </p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 truncate max-w-[200px]">
                  {userDept?.name || 'Unassigned'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-200 shadow-md rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Active Accounts
                </p>
                <p className="text-3xl font-black text-slate-900 mt-0.5">
                  {students.filter((s: any) => s.isActive !== false).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6 border border-slate-200 shadow-sm rounded-2xl bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
            />
          </div>
        </Card>

        {/* Students Table */}
        <Card className="p-6 border border-slate-200 shadow-sm rounded-2xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Student</th>
                  <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Contact</th>
                  <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
                  <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: any) => (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{student.studentId || 'No Matric No.'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-slate-700">{student.email}</p>
                        {student.phoneNumber && (
                          <p className="text-xs text-slate-400">{student.phoneNumber}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={student.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : 'bg-slate-100 text-slate-700 border border-slate-200 font-bold'}>
                          {student.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-slate-500">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-bold text-sm">No students found for this department</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Actions */}
        <Card className="p-6 border border-slate-200 shadow-sm rounded-2xl bg-white">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            Recent Log Actions
          </h2>
          <div className="space-y-3">
            {activities?.length > 0 ? (
              activities.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{act.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">{act.details}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(act.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 font-medium italic">No recent activity found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-8 bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-emerald-600" />
                  Add Department Student
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  New student will automatically be assigned to <strong className="text-slate-900">{userDept?.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Student ID / Matric No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RUN/ACC/21/1001"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="student@institution.edu.ng"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Optional"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                />
              </div>

              {/* Read-Only Scope Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Faculty</label>
                  <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm">
                    {userDept?.faculty?.name || 'Assigned automatically'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Department</label>
                  <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm">
                    {userDept?.name || 'Unassigned'}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-900 text-xs">Default Password Policy</p>
                    <p className="text-blue-700 text-xs mt-0.5 font-medium">
                      Password will default to <strong>Password123</strong>. The student must update this password upon initial sign in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20"
                  disabled={addStudentMutation.isPending}
                >
                  {addStudentMutation.isPending ? 'Adding Student...' : 'Add Student'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                  className="px-8 font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}