// lib/api/index.ts
import apiClient from './interceptor';
import type { Complaint, ComplaintStats } from '@/types';

export interface SystemSettings {
  allowClassRepRegistration: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
}
/**
 * AUTH ENDPOINTS
 */
export const loginAPI = async (email: string, password: string) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
};

export const registerAPI = async (data: any) => {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
};

export const forgotPasswordAPI = async (email: string) => {
  const res = await apiClient.post('/auth/forgot-password', { email });
  return res.data;
};

export const verifyResetTokenAPI = async (token: string) => {
  const res = await apiClient.get('/auth/verify-reset-token', {
    params: { token },
  });
  return res.data;
};

export const verifyResetCodeAPI = async (email: string, code: string) => {
  const res = await apiClient.post('/auth/verify-reset-code', { email, code });
  return res.data;
};

export const resetPasswordAPI = async (token: string, newPassword: string) => {
  const res = await apiClient.post('/auth/reset-password', { token, newPassword });
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

  const res = await apiClient.get('/complaints', { params: cleanParams });
  return res.data;
};

export const fetchComplaintById = async (id: string) => {
  const res = await apiClient.get(`/complaints/${id}`);
  return res.data as Complaint;
};

export const createComplaint = async (data: any) => {
  const res = await apiClient.post('/complaints', data);
  return res.data;
};

export const updateComplaint = async (id: string, data: any) => {
  const res = await apiClient.put(`/complaints/${id}`, data);
  return res.data;
};

export const verifyComplaint = async (id: string) => {
  const { data } = await apiClient.patch(`/complaints/${id}/status`, { 
    status: 'IN_PROGRESS' 
  });
  return data;
};

export const rejectComplaint = async (id: string, reason?: string) => {
  const { data } = await apiClient.patch(`/complaints/${id}/status`, { 
    status: 'REJECTED',
    rejectionReason: reason
  });
  return data;
};

export const checkDuplicateComplaints = async (query: string) => {
  const res = await apiClient.get('/complaints/check-duplicates', {
    params: { q: query },
  });
  return res.data; 
};

/**
 * DASHBOARD & STATISTICS
 */
export const fetchComplaintStats = async (): Promise<ComplaintStats> => {
  const res = await apiClient.get('/complaints/statistics');
  return res.data as ComplaintStats;
};

export const fetchGlobalStats = async () => {
  const res = await apiClient.get('/complaints/global-stats');
  return res.data;
};

export const fetchAdvancedStats = async () => {
  const res = await apiClient.get('/complaints/advanced-statistics');
  return res.data;
};

/**
 * CATEGORIES
 */
export const fetchCategories = async () => {
  const res = await apiClient.get('/categories/names');
  
  // Map the data from { id, name } to { value, label }
  return res.data.map((cat: { id: string; name: string }) => ({
    label: cat.name,
    value: cat.id
  }));
};

/**
 * COMMENTS
 */
export const addComment = async (complaintId: string, content: string, isInternal: boolean = false) => {
  const res = await apiClient.post(`/complaints/${complaintId}/comments`, { 
    content, 
    isInternal 
  });
  return res.data;
};

export const addSuggestionComment = async (id: string, content: string) => {
  const { data } = await apiClient.post(`/suggestions/${id}/comments`, { content });
  return data;
};

/**
 * NOTIFICATIONS
 */
export const fetchNotifications = async () => {
  const res = await apiClient.get('/notifications');
  // Professional fallback to ensure it's ALWAYS an array
  return Array.isArray(res.data) ? res.data : (res.data?.notifications || []);
};

export const markNotificationRead = async (notificationId: string) => {
  const res = await apiClient.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllRead = async () => {
  const { data } = await apiClient.patch('/notifications/read-all');
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

  const res = await apiClient.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * USERS (Admin Only)
 */
export const fetchUsers = async () => {
  const res = await apiClient.get('/users');
  return res.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const res = await apiClient.patch(`/users/${userId}/role`, { role });
  return res.data;
};

export const deleteUser = async (userId: string) => {
  const res = await apiClient.delete(`/users/${userId}`);
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await apiClient.post('/users/create', data);
  return res.data;
};

export const fetchFaculties = async () => {
  const res = await apiClient.get('/users/faculties');
  return res.data;
};

export const fetchDepartments = async (facultyId: string) => {
  const res = await apiClient.get(`/users/departments/${facultyId}`);
  return res.data;
};

export const bulkImportUsers = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/users/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const exportUsers = async (format: 'csv' | 'json') => {
  const res = await apiClient.get(`/users/export?format=${format}`);
  return res.data;
};

export const resetUserPassword = async (userId: string) => {
  const res = await apiClient.post(`/users/${userId}/reset-password`);
  return res.data;
};

/**
 * CLASS REP - Student Management
 */
export const addStudentByClassRep = async (data: any) => {
  const res = await apiClient.post('/users/create', data); 
  return res.data;
};

export const fetchMyStudents = async () => {
  const res = await apiClient.get('/users/my-department');
  return res.data;
};

/**
 * USER PROFILE
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await apiClient.patch('/auth/change-password', data);
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await apiClient.patch('/users/profile', data);
  return res.data;
};

export const fetchUserActivity = async () => {
  const res = await apiClient.get('/users/activity');
  return res.data;
};

export const fetchRecentActivity = async (limit: number = 5) => {
  const res = await apiClient.get('/notifications', { 
    params: { limit } 
  });
  return res.data;
};

/**
 * SUGGESTIONS & VOTING
 */
export const fetchSuggestions = async () => {
  const res = await apiClient.get('/suggestions');
  return res.data;
};

export const createSuggestion = async (data: { 
  title: string; 
  description: string; 
  isAnonymous: boolean 
}) => {
  const res = await apiClient.post('/suggestions', data);
  return res.data;
};

export const toggleSuggestionUpvote = async (suggestionId: string) => {
  const res = await apiClient.post(`/suggestions/${suggestionId}/upvote`);
  return res.data;
};

export const fetchSuggestionById = async (id: string) => {
  const { data } = await apiClient.get(`/suggestions/${id}`);
  return data;
};

export const verifySuggestion = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const { data } = await apiClient.patch(`/suggestions/${id}/status`, { status });
  return data;
};

export const verifySuggestionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const { data } = await apiClient.patch(`/suggestions/${id}/status`, { 
    status 
  });
  return data;
};

/**
 * MODERATION (For SRC/Class Reps)
 */
export const fetchModerationQueue = async () => {
  const { data } = await apiClient.get('/moderation/pending');
  return data;
};


// Fetch staff/SRC members for assignment
export async function fetchMembers() {
  const response = await apiClient.get('/users/members');
  return response.data;
}

// Assign complaint to a member (uses your standard update complaint endpoint)
export async function assignComplaint(complaintId: string, assignedToId: string) {
  const response = await apiClient.patch(`/complaints/${complaintId}`, { assignedToId });
  return response.data;
}

/**
 * Fetch global system settings (Admin only).
 * Includes graceful fallback if backend endpoint is not yet active.
 */
export async function fetchSystemSettings(): Promise<SystemSettings> {
  try {
    const response = await apiClient.get('/settings');
    return response.data;
  } catch (error: any) {
    // If backend endpoint isn't ready yet (e.g. 404), return safe operational defaults
    if (error?.response?.status === 404 || error?.response?.status === 500) {
      console.warn('System settings endpoint not found on server. Using default fallbacks.');
      return {
        allowClassRepRegistration: true,
        maintenanceMode: false,
        emailNotifications: true,
      };
    }
    throw error;
  }
}

/**
 * Update global system settings (Admin only).
 * Includes graceful fallback if backend endpoint is not yet active.
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<SystemSettings> {
  try {
    const response = await apiClient.patch('/settings', settings);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn('Backend update settings endpoint missing.');
      // Return updated state locally so UI functions smoothly during development
      return settings as SystemSettings;
    }
    throw error;
  }
}


// Export the client for custom requests
export { apiClient };
export default apiClient;