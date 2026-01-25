import { Complaint, ComplaintStats } from '@/types';
import axios from 'axios';

const axiosInstance = axios.create({
  // ✅ This checks for the env variable first, falls back to local if not found
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('src_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/')) {
        // Optional: logic to clear local storage if token is expired
      }
    }
    
    if (error.response?.data?.message) {
      error.customMessage = Array.isArray(error.response.data.message)
        ? error.response.data.message.join(', ')
        : error.response.data.message;
    }

    return Promise.reject(error);
  }
);

/**
 * AUTH
 */
export const loginAPI = async (email: string, password: string) => {
  const res = await axiosInstance.post('/auth/login', {
    email,
    password,
  });
  return res.data;
};

export const registerAPI = async (data: any) => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data;
};

/**
 * COMPLAINTS
 */
export const fetchComplaints = async (params: any) => {
  // Create a clean object removing empty strings, nulls, or undefineds
  const cleanParams = Object.keys(params).reduce((acc, key) => {
    if (params[key] !== "" && params[key] !== null && params[key] !== undefined) {
      acc[key] = params[key];
    }
    return acc;
  }, {} as any);

  const res = await axiosInstance.get('/complaints', { params: cleanParams });
  return res.data;
};

export const fetchComplaintById = async (id: string) => {
  const res = await axiosInstance.get(`/complaints/${id}`);
  return res.data as Complaint;
};

export const createComplaint = async (data: any) => {
  const res = await axiosInstance.post('/complaints', data);
  return res.data;
};

export const updateComplaint = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/complaints/${id}`, data);
  return res.data;
};

/**
 * DASHBOARD & STATISTICS
 */
export const fetchComplaintStats = async (): Promise<ComplaintStats> => {
  const res = await axiosInstance.get('/complaints/statistics');
  return res.data as ComplaintStats;
};

/**
 * CATEGORIES
 */
export const fetchCategories = async () => {
  const res = await axiosInstance.get('/complaints/categories-dropdown');
  return res.data as { label: string; value: string }[];
};

/**
 * COMMENTS
 */
export const addComment = async (complaintId: string, content: string, isInternal: boolean = false) => {
  const res = await axiosInstance.post(`/complaints/${complaintId}/comments`, { 
    content, 
    isInternal 
  });
  return res.data;
};

/**
 * NOTIFICATIONS
 */
export const fetchNotifications = async () => {
  const res = await axiosInstance.get('/notifications');
  return res.data;
};

export const markNotificationRead = async (notificationId: string) => {
  const res = await axiosInstance.patch('/notifications/read', { notificationId });
  return res.data;
};

/**
 * ATTACHMENTS (File Upload)
 */
export const uploadFile = async (file: File, complaintId?: string, commentId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (complaintId) formData.append('complaintId', complaintId);
  if (commentId) formData.append('commentId', commentId);

  const res = await axiosInstance.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * USERS (Admin Only)
 */
export const fetchUsers = async () => {
  const res = await axiosInstance.get('/users');
  return res.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const res = await axiosInstance.patch(`/users/${userId}/role`, { role });
  return res.data;
};

export const deleteUser = async (userId: string) => {
  const res = await axiosInstance.delete(`/users/${userId}`);
  return res.data;
};

/**
 * USERS (Admin Only)
 */
export const createUser = async (data: any) => {

  // ✅ Should be:
  const res = await axiosInstance.post('/users/create', data);
  return res.data;
};
export const fetchFaculties = async () => {
  const res = await axiosInstance.get('/users/faculties');
  return res.data;
};

export const fetchDepartments = async (facultyId: string) => {
  const res = await axiosInstance.get(`/users/departments/${facultyId}`);
  return res.data;
};

export const bulkImportUsers = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post('/users/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const exportUsers = async (format: 'csv' | 'json') => {
  const res = await axiosInstance.get(`/users/export?format=${format}`);
  return res.data;
};

/**
 * CLASS REP - Student Management
 */
// Change this function
export const addStudentByClassRep = async (data: any) => {
  // Use the existing 'create' endpoint instead of the non-existent 'class-rep/add-student'
  const res = await axiosInstance.post('/users/create', data); 
  return res.data;
};

export const fetchMyStudents = async () => {
  const res = await axiosInstance.get('/users/my-department');
  return res.data;
};

/**
 * USER PROFILE
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await axiosInstance.patch('/auth/change-password', data);
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await axiosInstance.patch('/users/profile', data);
  return res.data;
};

export const fetchUserActivity = async () => {
  const res = await axiosInstance.get('/users/activity');
  return res.data;
};

export const resetUserPassword = async (userId: string) => {
  const res = await axiosInstance.post(`/users/${userId}/reset-password`);
  return res.data;
};

/**
 * ADVANCED STATISTICS
 */

export const fetchGlobalStats = async () => {
  const response = await axiosInstance.get('/complaints/stats/global');
  return response.data;
};
export const fetchAdvancedStats = async () => {
  const res = await axiosInstance.get('/complaints/advanced-statistics');
  return res.data;
};