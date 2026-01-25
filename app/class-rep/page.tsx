'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/providers/auth';
import { toast } from 'sonner';
import { addStudentByClassRep, fetchUserActivity,fetchMyStudents, fetchFaculties, fetchDepartments } from '@/lib/api';
import axios from 'axios';

import {
  GraduationCap, UserPlus, Mail, Phone, Users, Building,
  Lock, AlertCircle, CheckCircle, Search, RefreshCw, X
} from 'lucide-react';

export default function ClassRepPortal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: activities } = useQuery({
    queryKey: ['user-activity'],
    queryFn: fetchUserActivity,
  });
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phoneNumber: '',
    facultyId: '',
    departmentId: '',
  });

 // Inside ClassRepPortal() { ... }

// 1. Fetch faculties using the instance
// 1. Fetch faculties
const { data: faculties = [] } = useQuery({
  queryKey: ['faculties'],
  queryFn: async () => {
    const data = await fetchFaculties(); // Use centralized function
    return Array.isArray(data) ? data : [];
  },
});

// 2. Fetch departments
const { data: departments = [] } = useQuery({
  queryKey: ['departments', formData.facultyId],
  queryFn: async () => {
    if (!formData.facultyId) return [];
    const data = await fetchDepartments(formData.facultyId); // Use centralized function
    return Array.isArray(data) ? data : [];
  },
  enabled: !!formData.facultyId,
});
  
  // 3. Fetch students using the instance
  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ['my-department-students'],
    queryFn: fetchMyStudents, // Use the exported helper function
  });
  const addStudentMutation = useMutation({
    mutationFn: async (data: any) => {
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
        facultyId: '',
        departmentId: '',
      });
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-department-students'] });
    },
    onError: (error: any) => {
      toast.error('Failed to Add Student', {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.studentId || !formData.email || !formData.facultyId || !formData.departmentId) {
      toast.error('Please fill all required fields');
      return;
    }
    addStudentMutation.mutate(formData);
  };

  const filteredStudents = students.filter((student: any) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-green-600" />
              Class Representative Portal
            </h1>
            <p className="text-gray-600 mt-1">
              Manage students in {`${user?.department?.name}(${user?.department?.code})` || 'your department'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => refetch()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-white"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-blue-600 text-white border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-600 text-white border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">Department</p>
                <p className="text-xl font-bold">{user?.department?.name || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-purple-600 text-white border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Status</p>
                <p className="text-3xl font-bold">{students.filter((s: any) => s.isActive).length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none transition-all"
            />
          </div>
        </Card>

        {/* Students Table */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-4 px-4 font-semibold text-gray-700">Student</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: any) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.studentId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={student.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No students found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-green-600" />
            Recent Actions
          </h2>
          <div className="space-y-3">
            {activities?.length > 0 ? (
              activities.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{act.action.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{act.details}</p>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(act.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No recent activity found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-8 bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-green-600" />
                Add New Student
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter student ID"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                />
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
  {/* Add the ? check before .map */}
  {Array.isArray(faculties) && faculties.map((faculty: any) => (
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

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Default Password Policy</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Password will be set to <strong>Password123</strong>. Student must change it on first login.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={addStudentMutation.isPending}
                >
                  {addStudentMutation.isPending ? 'Adding Student...' : 'Add Student'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                  className="px-8"
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