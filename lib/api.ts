import { Complaint, ComplaintStats } from '@/types';
import axios from 'axios';

const axiosInstance = axios.create({
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
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('src_token');
        window.location.href = '/';
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
  // 1. Fixed the path to '/categories/names'
  const res = await axiosInstance.get('/categories/names');
  
  // 2. Map the data from { id, name } to { value, label }
  return res.data.map((cat: { id: string; name: string }) => ({
    label: cat.name,
    value: cat.id
  }));
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
  // Professional fallback to ensure it's ALWAYS an array
  return Array.isArray(res.data) ? res.data : (res.data?.notifications || []);
};

export const markNotificationRead = async (notificationId: string) => {
  const res = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllRead = async () => {
  const { data } = await axiosInstance.patch('/notifications/read-all');
  return data;
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

export const createUser = async (data: any) => {
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
export const addStudentByClassRep = async (data: any) => {
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
 * COMPLAINTS (Extended)
 */
 // ✅ ADD THIS: Specifically for the Dashboard Activity Feed
export const fetchRecentActivity = async (limit: number = 5) => {
  const res = await axiosInstance.get('/notifications', { 
    params: { limit } 
  });
  return res.data;
};

/**
 * SUGGESTIONS & VOTING
 */
export const fetchSuggestions = async () => {
  const res = await axiosInstance.get('/suggestions');
  return res.data;
};

export const createSuggestion = async (data: { 
  title: string; 
  description: string; 
  isAnonymous: boolean 
}) => {
  const res = await axiosInstance.post('/suggestions', data);
  return res.data;
};

export const toggleSuggestionUpvote = async (suggestionId: string) => {
  const res = await axiosInstance.post(`/suggestions/${suggestionId}/upvote`);
  return res.data;
};

export const fetchSuggestionById = async (id: string) => {
  const { data } = await axiosInstance.get(`/suggestions/${id}`);
  return data;
};

export const addSuggestionComment = async (id: string, content: string) => {
  const { data } = await axiosInstance.post(`/suggestions/${id}/comments`, { content });
  return data;
};

export const verifySuggestion = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const { data } = await axiosInstance.patch(`/suggestions/${id}/status`, { status });
  return data;
};

/**
 * MODERATION (For SRC/Class Reps)
 */
export const fetchModerationQueue = async () => {
  const { data } = await axiosInstance.get('/moderation/pending');
  return data;
};

/**
 * Complaints: SRC Verifies a complaint, moving it to IN_PROGRESS
 */
export const verifyComplaint = async (id: string) => {
  const { data } = await axiosInstance.patch(`/complaints/${id}/status`, { 
    status: 'IN_PROGRESS' 
  });
  return data;
};

/**
 * Complaints: SRC Rejects a complaint
 */
export const rejectComplaint = async (id: string, reason?: string) => {
  const { data } = await axiosInstance.patch(`/complaints/${id}/status`, { 
    status: 'REJECTED',
    rejectionReason: reason
  });
  return data;
};

/**
 * Suggestions: SRC Approves a student suggestion
 */
export const verifySuggestionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const { data } = await axiosInstance.patch(`/suggestions/${id}/status`, { 
    status 
  });
  return data;
};

/**
 * GLOBAL STATISTICS (for SRC/Admin)
 */
export const fetchGlobalStats = async () => {
  const res = await axiosInstance.get('/complaints/global-stats');
  return res.data;
};

export const fetchAdvancedStats = async () => {
  const res = await axiosInstance.get('/complaints/advanced-statistics');
  return res.data;
};

export const checkDuplicateComplaints = async (query: string) => {
  const res = await axiosInstance.get('/complaints/check-duplicates', {
    params: { q: query },
  });
  return res.data; 
};