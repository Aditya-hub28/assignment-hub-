// Centralized API Service for Assignment Hub Frontend
const defaultApiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/api/v1'
  : 'https://assignment-hub-api-h0ny.onrender.com/api/v1';

let rawBase = (import.meta.env.VITE_API_URL || defaultApiUrl).trim();
rawBase = rawBase.replace(/\/+$/, '');
if (rawBase.startsWith('http') && !rawBase.includes('/api')) {
  rawBase = `${rawBase}/api/v1`;
}
const API_BASE_URL = rawBase;

export const authStorage = {
  getAccessToken: () => localStorage.getItem('ah_access_token'),
  getRefreshToken: () => localStorage.getItem('ah_refresh_token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('ah_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  getProfile: () => {
    try {
      const p = localStorage.getItem('ah_profile');
      return p ? JSON.parse(p) : null;
    } catch {
      return null;
    }
  },
  setSession: (sessionData = {}) => {
    const session = sessionData.session || sessionData;
    const user = sessionData.user;
    const profile = sessionData.profile;

    const access = session?.accessToken || session?.access_token;
    const refresh = session?.refreshToken || session?.refresh_token;

    if (access) localStorage.setItem('ah_access_token', access);
    if (refresh) localStorage.setItem('ah_refresh_token', refresh);
    if (user) localStorage.setItem('ah_user', typeof user === 'string' ? user : JSON.stringify(user));
    if (profile) localStorage.setItem('ah_profile', typeof profile === 'string' ? profile : JSON.stringify(profile));
  },
  clearSession: () => {
    localStorage.removeItem('ah_access_token');
    localStorage.removeItem('ah_refresh_token');
    localStorage.removeItem('ah_user');
    localStorage.removeItem('ah_profile');
    sessionStorage.clear();
  }
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    if (typeof data?.message === 'string' && data.message.trim()) {
      errorMsg = data.message;
    } else if (typeof data?.error === 'string' && data.error.trim()) {
      errorMsg = data.error;
    } else if (data?.error && typeof data.error.message === 'string' && data.error.message.trim()) {
      errorMsg = data.error.message;
    } else if (data?.error?.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
      errorMsg = data.error.details.map(d => d.message || d).join(', ');
    } else if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      errorMsg = data.errors.map(e => (typeof e === 'string' ? e : e.message || JSON.stringify(e))).join(', ');
    } else {
      errorMsg = `Server error (${response.status})`;
    }

    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.error?.code;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    initiateRegister: (body) => request('/auth/register/initiate', { method: 'POST', body }),
    verifyOtp: (body) => request('/auth/register/verify-otp', { method: 'POST', body }),
    resendOtp: (body) => request('/auth/register/resend-otp', { method: 'POST', body }),
    login: (body) => request('/auth/login', { method: 'POST', body }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    forgotPassword: (body) => request('/auth/password/forgot', { method: 'POST', body }),
    resetPassword: (body) => request('/auth/password/reset', { method: 'POST', body })
  },
  user: {
    getProfile: () => request('/user/profile', { method: 'GET' }),
    updateProfile: (body) => request('/user/profile', { method: 'PUT', body }),
    getAcademicDetails: () => request('/user/academic-details', { method: 'GET' }),
    updateAcademicDetails: (body) => request('/user/academic-details', { method: 'PUT', body })
  },
  services: {
    createRequest: (body) => request('/services/requests', { method: 'POST', body }),
    getRequests: () => request('/services/requests', { method: 'GET' }),
    getRequestById: (id) => request(`/services/requests/${id}`, { method: 'GET' })
  },
  inquiries: {
    getInquiries: () => request('/inquiries', { method: 'GET' }),
    getInquiryById: (id) => request(`/inquiries/${id}`, { method: 'GET' }),
    sendMessage: (id, body) => request(`/inquiries/${id}/messages`, { method: 'POST', body })
  },
  notifications: {
    getNotifications: () => request('/notifications', { method: 'GET' }),
    markRead: (body = {}) => request('/notifications/mark-read', { method: 'PUT', body })
  }
};
