import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from './Card';
import { Button } from './Button';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { fetchFaculties, fetchDepartments } from '@/lib/api';
import type { Role } from '@/types';

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

const STUDENT_LEVELS = ['100L','200L','300L','400L','500L','600L'];

export default function EditUserModal({ user, onClose, updateUserMutation }: any) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    studentId: user.studentId || '',
    level: user.level || '',
    studentStatus: user.studentStatus || 'ACTIVE',
    facultyId: user.department?.faculty?.id || '',
    departmentId: user.department?.id || '',
    role: user.role || 'STUDENT',
    isActive: user.isActive,
  });

  const { data: faculties = [] } = useQuery({ queryKey: ['faculties'], queryFn: fetchFaculties, staleTime: 1000 * 60 * 60 * 24 });
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', formData.facultyId],
    queryFn: () => fetchDepartments(formData.facultyId),
    enabled: !!formData.facultyId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber || null,
      studentId: formData.studentId || null,
      level: formData.level || null,
      studentStatus: formData.studentStatus || null,
      departmentId: formData.departmentId || null,
      role: formData.role,
      isActive: formData.isActive,
    };

    updateUserMutation.mutate({ userId: user.id, data: payload });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl p-6 sm:p-8 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
          <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
          Edit User Details
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Phone Number</label>
              <input
                type="tel"
                placeholder="08012345678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              >
                <option value="">Select Level (Optional)</option>
                {STUDENT_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Role</label>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Faculty</label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value, departmentId: '' })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              >
                <option value="">Select Faculty (Optional)</option>
                {faculties.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-gray-900 text-sm"
              >
                <option value="">Unassigned</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-green-700 hover:bg-green-800 text-white" 
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
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
