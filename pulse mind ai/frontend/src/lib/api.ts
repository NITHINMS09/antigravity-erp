import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pulsemind_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('pulsemind_refresh');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('pulsemind_token', data.accessToken);
          localStorage.setItem('pulsemind_refresh', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch { localStorage.clear(); window.location.href = '/login'; }
      } else { localStorage.clear(); window.location.href = '/login'; }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Feedback API
export const feedbackAPI = {
  create: (data: any) => api.post('/feedback', data),
  getAll: (params?: any) => api.get('/feedback', { params }),
  getMy: () => api.get('/feedback/my'),
  getById: (id: string) => api.get(`/feedback/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/feedback/${id}/status`, { status }),
};

// Analytics API
export const analyticsAPI = {
  getHealth: () => api.get('/analytics/health'),
  getDepartments: () => api.get('/analytics/departments'),
  getEmotions: (deptId?: string) => api.get('/analytics/emotions', { params: { departmentId: deptId } }),
  getTrends: (days?: number) => api.get('/analytics/trends', { params: { days } }),
  getComplaints: () => api.get('/analytics/complaints'),
  getBurnout: (userId: string) => api.get(`/analytics/burnout/${userId}`),
  getPatterns: () => api.get('/analytics/patterns'),
  getSummary: () => api.get('/analytics/summary'),
  analyze: (text: string, category?: string) => api.post('/analytics/analyze', { text, category }),
};

// Admin API
export const adminAPI = {
  getNotifications: (unread?: boolean) => api.get('/admin/notifications', { params: { unread } }),
  getUnreadCount: () => api.get('/admin/notifications/count'),
  markRead: (id: string) => api.patch(`/admin/notifications/${id}/read`),
  markAllRead: () => api.patch('/admin/notifications/read-all'),
  getComplaints: (status?: string) => api.get('/admin/complaints', { params: { status } }),
  updateComplaint: (id: string, data: any) => api.patch(`/admin/complaints/${id}`, data),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data: any) => api.post('/admin/departments', data),
  getPolls: () => api.get('/admin/polls'),
  createPoll: (data: any) => api.post('/admin/polls', data),
  getActivityLogs: () => api.get('/admin/activity-logs'),
};
