// Centralized API Service for Assignment Hub Frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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
  setSession: ({ session, user, profile }) => {
    if (session?.accessToken) localStorage.setItem('ah_access_token', session.accessToken);
    if (session?.refreshToken) localStorage.setItem('ah_refresh_token', session.refreshToken);
    if (user) localStorage.setItem('ah_user', JSON.stringify(user));
    if (profile) localStorage.setItem('ah_profile', JSON.stringify(profile));
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
    const error = new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    error.status = response.status;
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
    updateProfile: (body) => request('/user/profile', { method: 'PUT', body })
  }
};
