// lib/api/index.ts
import { io } from 'socket.io-client';
import apiClient from './client2';
import type {
  Announcement,
  AnnouncementResponse,
  Complaint,
  ComplaintStats,
  CreateAnnouncementPayload,
  UploadAnnouncementImageResponse,
} from '@/types';

export * from '../../types';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface SystemSettings {
  allowClassRepRegistration: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

// ✅ Cache for frequently requested data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

export const loginAPI = async (email: string, password: string) => {
  const res = await apiClient.post('/auth/login', { email, password });
  clearCache();
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

// ============================================
// COMPLAINTS
// ============================================

export const fetchComplaints = async (params: any) => {
  const cleanParams = Object.keys(params).reduce((acc, key) => {
    const value = params[key];
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  try {
    const res = await apiClient.get('/complaints', { params: cleanParams });
    const responseData = res.data;

    if (!responseData || typeof responseData !== 'object') {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: cleanParams.limit || 10,
          totalPages: 0,
        },
      };
    }

    if (responseData && !responseData.meta) {
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          meta: {
            total: responseData.length,
            page: cleanParams.page || 1,
            limit: cleanParams.limit || 10,
            totalPages: Math.ceil(responseData.length / (cleanParams.limit || 10)) || 1,
          },
        };
      }

      if (responseData.data) {
        const dataArray = Array.isArray(responseData.data) ? responseData.data : [];
        return {
          data: dataArray,
          meta: {
            total: responseData.total || dataArray.length,
            page: cleanParams.page || 1,
            limit: cleanParams.limit || 10,
            totalPages: Math.ceil((responseData.total || dataArray.length) / (cleanParams.limit || 10)) || 1,
          },
        };
      }

      return {
        data: [responseData],
        meta: {
          total: 1,
          page: cleanParams.page || 1,
          limit: cleanParams.limit || 10,
          totalPages: 1,
        },
      };
    }

    if (responseData.meta) {
      if (!responseData.meta.totalPages && responseData.meta.total) {
        responseData.meta.totalPages = Math.ceil(
          responseData.meta.total / (responseData.meta.limit || cleanParams.limit || 10)
        );
      }
      if (!Array.isArray(responseData.data)) {
        responseData.data = responseData.data ? [responseData.data] : [];
      }
    }

    return responseData;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: cleanParams.limit || 10,
        totalPages: 0,
      },
    };
  }
};

export const fetchComplaintById = async (id: string) => {
  const cacheKey = `complaint_${id}`;
  const cached = getCached<Complaint>(cacheKey);
  if (cached) return cached;

  const res = await apiClient.get(`/complaints/${id}`);
  const data = res.data as Complaint;
  setCache(cacheKey, data);
  return data;
};

export const createComplaint = async (data: any) => {
  const res = await apiClient.post('/complaints', data);
  clearCache('complaints');
  return res.data;
};

export const updateComplaint = async (id: string, data: any) => {
  const res = await apiClient.put(`/complaints/${id}`, data);
  clearCache(`complaint_${id}`);
  clearCache('complaints');
  return res.data;
};

export const verifyComplaint = async (id: string) => {
  const { data } = await apiClient.patch(`/complaints/${id}/status`, {
    status: 'IN_PROGRESS'
  });
  clearCache(`complaint_${id}`);
  return data;
};

export const rejectComplaint = async (id: string, reason?: string) => {
  const { data } = await apiClient.patch(`/complaints/${id}/status`, {
    status: 'REJECTED',
    rejectionReason: reason
  });
  clearCache(`complaint_${id}`);
  return data;
};

export const checkDuplicateComplaints = async (query: string) => {
  const res = await apiClient.get('/complaints/check-duplicates', {
    params: { q: query },
  });
  return res.data;
};

// ============================================
// DASHBOARD & STATISTICS
// ============================================

export const fetchComplaintStats = async (): Promise<ComplaintStats> => {
  // For complaint statistics we prefer fresh data since counts drive UI badges.
  // Avoid the shared in-module cache here so React Query invalidation results in immediate refetch.
  const res = await apiClient.get('/complaints/statistics');
  return res.data as ComplaintStats;
};

export const fetchGlobalStats = async () => {
  const cacheKey = 'global_stats';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await apiClient.get('/complaints/global-stats');
    setCache(cacheKey, res.data);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 403) {
      throw new Error('You do not have permission to view global statistics');
    }
    throw error;
  }
};

export const fetchAdvancedStats = async () => {
  const cacheKey = 'advanced_stats';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await apiClient.get('/statistics/advanced');
  setCache(cacheKey, res.data);
  return res.data;
};

// ============================================
// CATEGORIES
// ============================================

export const fetchCategories = async () => {
  const cacheKey = 'categories';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await apiClient.get('/categories/names');
  const data = res.data.map((cat: { id: string; name: string }) => ({
    label: cat.name,
    value: cat.id
  }));
  setCache(cacheKey, data);
  return data;
};

// ============================================
// COMMENTS
// ============================================

export const addComment = async (complaintId: string, content: string, isInternal: boolean = false) => {
  const res = await apiClient.post(`/complaints/${complaintId}/comments`, {
    content,
    isInternal
  });
  clearCache(`complaint_${complaintId}`);
  return res.data;
};

export const addSuggestionComment = async (id: string, content: string) => {
  const { data } = await apiClient.post(`/suggestions/${id}/comments`, { content });
  return data;
};

// ============================================
// NOTIFICATIONS
// ============================================

export const fetchNotifications = async () => {
  const res = await apiClient.get('/notifications');
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

// ============================================
// ATTACHMENTS
// ============================================

export const uploadFile = async (file: File, complaintId?: string, commentId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (complaintId) formData.append('complaintId', complaintId);
  if (commentId) formData.append('commentId', commentId);

  const res = await apiClient.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (complaintId) clearCache(`complaint_${complaintId}`);
  return res.data;
};

// ============================================
// USERS
// ============================================

export const fetchUsers = async () => {
  const res = await apiClient.get('/users');
  return res.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const res = await apiClient.patch(`/users/${userId}/role`, { role });
  clearCache();
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await apiClient.post('/users/create', data);
  clearCache();
  return res.data;
};

export const resetUserPassword = async (userId: string) => {
  const res = await apiClient.post(`/users/${userId}/reset-password`);
  return res.data;
};

export const exportUsers = async () => {
  const res = await apiClient.get('/users/export');
  return res.data;
};

export const deleteUser = async (userId: string) => {
  const res = await apiClient.patch(`/users/${userId}/deactivate`);
  clearCache();
  return res.data;
};

// Admin update user (allows admin correction of user details)
export const updateUser = async (userId: string, data: any) => {
  const res = await apiClient.patch(`/users/${userId}`, data);
  clearCache();
  return res.data;
};

export const fetchFaculties = async () => {
  const cacheKey = 'faculties';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await apiClient.get('/users/faculties');
  setCache(cacheKey, res.data);
  return res.data;
};

export const fetchDepartments = async (facultyId: string) => {
  const cacheKey = `departments_${facultyId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await apiClient.get(`/users/departments/${facultyId}`);
  setCache(cacheKey, res.data);
  return res.data;
};

export const bulkImportUsers = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/users/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache();
  return res.data;
};

export const fetchUserById = async (id: string) => {
  const res = await apiClient.get(`/users/${id}`);
  return res.data;
};

// ============================================
// CLASS REP
// ============================================

export const addStudentByClassRep = async (data: any) => {
  const res = await apiClient.post('/users/create', data);
  clearCache();
  return res.data;
};

export const fetchMyStudents = async () => {
  const res = await apiClient.get('/users/my-department');
  return res.data;
};

// ============================================
// USER PROFILE
// ============================================

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

// ============================================
// SUGGESTIONS & VOTING
// ============================================

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
  const { data } = await apiClient.patch(`/suggestions/${id}/status`, { status });
  return data;
};

// ============================================
// MODERATION
// ============================================

export const fetchModerationQueue = async () => {
  const { data } = await apiClient.get('/moderation/pending');
  return data;
};

// ============================================
// MEMBERS & ASSIGNMENT
// ============================================

export async function fetchMembers() {
  const cacheKey = 'members';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/users/members');
  setCache(cacheKey, response.data);
  return response.data;
}

export async function assignComplaint(complaintId: string, assignedToId: string) {
  const response = await apiClient.patch(`/complaints/${complaintId}`, { assignedToId });
  clearCache(`complaint_${complaintId}`);
  return response.data;
}

// ============================================
// SYSTEM SETTINGS
// ============================================

export async function fetchSystemSettings(): Promise<SystemSettings> {
  const cacheKey = 'system_settings';
  const cached = getCached<SystemSettings>(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiClient.get('/settings');
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.response?.status === 500 || error?.type === 'network') {
      console.warn('System settings endpoint not found. Using default fallbacks.');
      return {
        allowClassRepRegistration: true,
        maintenanceMode: false,
        emailNotifications: true,
      };
    }
    throw error;
  }
}

export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<SystemSettings> {
  try {
    const response = await apiClient.patch('/settings', settings);
    clearCache('system_settings');
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.type === 'network') {
      console.warn('Backend update settings endpoint missing.');
      return settings as SystemSettings;
    }
    throw error;
  }
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const cacheKey = 'announcements';
  const cached = getCached<Announcement[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiClient.get('/announcements');
    const data = response.data;

    let announcements: Announcement[] = [];
    if (data?.success && data?.data) {
      announcements = Array.isArray(data.data) ? data.data : [data.data];
    } else {
      announcements = data?.data || [];
    }
    setCache(cacheKey, announcements);
    return announcements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

export const createAnnouncement = async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
  try {
    const response = await apiClient.post('/announcements', payload);
    const data = response.data;

    if (data?.success && data?.data) {
      clearCache('announcements');
      return data.data;
    }
    throw new Error(data?.message || 'Failed to create announcement');
  } catch (error: any) {
    if (error?.response?.data) {
      const errorData = error.response.data;
      let message = 'Failed to create announcement';

      if (typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        message = errorData.message.join(', ');
      } else if (typeof errorData.error === 'string') {
        message = errorData.error;
      }
      throw new Error(message);
    }
    throw error;
  }
};

export const uploadAnnouncementImage = async (file: File): Promise<UploadAnnouncementImageResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/admin/announcements/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`/announcements/${id}`);
    clearCache('announcements');
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      const errorData = error.response.data;
      let message = 'Failed to delete announcement';

      if (typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        message = errorData.message.join(', ');
      } else if (typeof errorData.error === 'string') {
        message = errorData.error;
      }
      throw new Error(message);
    }
    throw error;
  }
};

export const updateAnnouncement = async (
  id: string,
  payload: Partial<CreateAnnouncementPayload>
): Promise<Announcement> => {
  try {
    const response = await apiClient.put(`/announcements/${id}`, payload);
    const data = response.data;

    if (data?.success && data?.data) {
      clearCache('announcements');
      clearCache(`announcement_${id}`);
      return data.data;
    }
    throw new Error(data?.message || 'Failed to update announcement');
  } catch (error: any) {
    if (error?.response?.data) {
      const errorData = error.response.data;
      let message = 'Failed to update announcement';

      if (typeof errorData.message === 'string') {
        message = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        message = errorData.message.join(', ');
      } else if (typeof errorData.error === 'string') {
        message = errorData.error;
      }
      throw new Error(message);
    }
    throw error;
  }
};

// ============================================
// USER AVATAR
// ============================================

export const uploadUserAvatar = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await apiClient.post(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  clearCache(`user_${userId}`);
  return res.data;
};

export const updateUserProfile = async (userId: string, data: any) => {
  const res = await apiClient.patch(`/users/${userId}`, data);
  clearCache(`user_${userId}`);
  return res.data;
};

// ============================================
// AUDIT LOGS
// ============================================

export const fetchAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const cleanParams = Object.keys(params || {}).reduce((acc, key) => {
    const value = params?.[key as keyof typeof params];
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  const res = await apiClient.get('/audit-logs', { params: cleanParams });
  return res.data;
};

export const fetchAuditLogActions = async () => {
  const cacheKey = 'audit_actions';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await apiClient.get('/audit-logs/actions');
  setCache(cacheKey, res.data);
  return res.data;
};

export const fetchComplaintAuditTrail = async (complaintId: string) => {
  const res = await apiClient.get(`/audit-logs/complaint/${complaintId}`);
  return res.data;
};

// ============================================
// WEBSOCKET
// ============================================

export function createBroadcastSocket(userId?: string) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  const socket = io(`${socketUrl}/broadcast`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      userId,
    },
  });

  return socket;
}



// ============================================
// COMPLAINT FILE UPLOAD
// ============================================

export const uploadComplaintFile = async (file: File): Promise<{
  success: boolean;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/complaints/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(error?.response?.data?.message || 'Failed to upload file');
  }
};

export const deleteComplaintFile = async (filename: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`/complaints/images/${filename}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error(error?.response?.data?.message || 'Failed to delete file');
  }
};

export const getCurrentUserAPI = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};
// ============================================
// EXPORTS
// ============================================

export const subscribeToPush = async (subscription: any) => {
  // Normalize subscription payload to exactly what backend DTO expects
  const toBase64Url = (ab: ArrayBuffer | null) => {
    if (!ab) return null;
    const uint8 = new Uint8Array(ab as ArrayBuffer);
    let str = '';
    for (let i = 0; i < uint8.length; i++) str += String.fromCharCode(uint8[i]);
    // standard btoa then make URL-safe
    try {
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      // If btoa fails, fallback to base64 via Buffer (SSR path unlikely here)
      try { return Buffer.from(uint8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch { return null; }
    }
  };

  let keys = (subscription && subscription.keys) || {};
  // Some browsers expose getKey instead of keys property
  if ((!keys || !keys.p256dh) && subscription && typeof subscription.getKey === 'function') {
    try {
      keys = {
        p256dh: toBase64Url(subscription.getKey('p256dh') as ArrayBuffer),
        auth: toBase64Url(subscription.getKey('auth') as ArrayBuffer),
      };
    } catch (e) {
      console.warn('[push] failed to extract keys via getKey', e);
    }
  }

  const payload: any = {
    endpoint: subscription?.endpoint,
    keys,
  };

  // DEBUG: console.debug('[push] subscribe payload', payload);

  const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await apiClient.post('/push/subscribe', payload, { headers });
  return res.data;
};

export const unsubscribeFromPush = async (endpoint: string) => {
  const res = await apiClient.delete('/push/unsubscribe', { data: { endpoint } });
  return res.data;
};

export { apiClient, clearCache as clearApiCache };
export default apiClient;