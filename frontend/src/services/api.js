import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const memberService = {
  getMembers: () => api.get('/api/members'),
  getMember: (id) => api.get(`/api/members/${id}`),
  createMember: (data) => api.post('/api/members', data),
  updateMember: (id, data) => api.put(`/api/members/${id}`, data),
  deleteMember: (id) => api.delete(`/api/members/${id}`),
};

export const meetingService = {
  getMeetings: () => api.get('/api/meetings'),
  getMeeting: (id) => api.get(`/api/meetings/${id}`),
  createMeeting: (data) => api.post('/api/meetings', data),
  updateMeeting: (id, data) => api.put(`/api/meetings/${id}`, data),
  deleteMeeting: (id) => api.delete(`/api/meetings/${id}`),
  getUpcomingMeetings: () => api.get('/api/meetings/upcoming'),
  getPastMeetings: () => api.get('/api/meetings/past'),
  addAttendee: (meetingId, memberId) => api.post(`/api/meetings/${meetingId}/attendees`, { memberId }),
  removeAttendee: (meetingId, memberId) => api.delete(`/api/meetings/${meetingId}/attendees/${memberId}`),
};

export const financeService = {
  getTransactions: () => api.get('/api/finance/transactions'),
  getTransaction: (id) => api.get(`/api/finance/transactions/${id}`),
  createTransaction: (data) => api.post('/api/finance/transactions', data),
  updateTransaction: (id, data) => api.put(`/api/finance/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/api/finance/transactions/${id}`),
  approveTransaction: (id) => api.put(`/api/finance/transactions/${id}/approve`),
  getLoans: () => api.get('/api/finance/loans'),
  getLoan: (id) => api.get(`/api/finance/loans/${id}`),
  createLoan: (data) => api.post('/api/finance/loans', data),
  updateLoan: (id, data) => api.put(`/api/finance/loans/${id}`, data),
  deleteLoan: (id) => api.delete(`/api/finance/loans/${id}`),
  approveLoan: (id) => api.put(`/api/finance/loans/${id}/approve`),
  rejectLoan: (id) => api.put(`/api/finance/loans/${id}/reject`),
  repayLoan: (id, data) => api.post(`/api/finance/loans/${id}/repay`, data),
  getStatistics: () => api.get('/api/finance/statistics'),
  getFinancialReport: (params) => api.get('/api/finance/reports/financial', { params }),
  getTransactionReport: (params) => api.get('/api/finance/reports/transactions', { params }),
  getLoanReport: (params) => api.get('/api/finance/reports/loans', { params }),
};

export const notificationService = {
  getNotifications: () => api.get('/api/notifications'),
  getNotification: (id) => api.get(`/api/notifications/${id}`),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
};

export const settingsService = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (data) => api.put('/api/settings', data),
};

export default api; 