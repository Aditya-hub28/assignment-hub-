/**
 * Assignment Hub — Frontend API Client & Session Manager
 */
const API_BASE = '/api/v1';

const authStore = {
  getAccessToken() {
    return localStorage.getItem('ah_access_token') || sessionStorage.getItem('ah_access_token');
  },
  getRefreshToken() {
    return localStorage.getItem('ah_refresh_token') || sessionStorage.getItem('ah_refresh_token');
  },
  getUser() {
    const raw = localStorage.getItem('ah_user') || sessionStorage.getItem('ah_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getProfile() {
    const raw = localStorage.getItem('ah_profile') || sessionStorage.getItem('ah_profile');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setSession({ session, user, profile }, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    if (session?.accessToken) {
      storage.setItem('ah_access_token', session.accessToken);
    }
    if (session?.refreshToken) {
      storage.setItem('ah_refresh_token', session.refreshToken);
    }
    if (user) {
      storage.setItem('ah_user', JSON.stringify(user));
    }
    if (profile) {
      storage.setItem('ah_profile', JSON.stringify(profile));
    }
  },
  clearSession() {
    localStorage.removeItem('ah_access_token');
    localStorage.removeItem('ah_refresh_token');
    localStorage.removeItem('ah_user');
    localStorage.removeItem('ah_profile');
    sessionStorage.removeItem('ah_access_token');
    sessionStorage.removeItem('ah_refresh_token');
    sessionStorage.removeItem('ah_user');
    sessionStorage.removeItem('ah_profile');
  },
  isLoggedIn() {
    return Boolean(this.getAccessToken());
  }
};

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = authStore.getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      const errorMsg = data?.error?.message || 'Something went wrong. Please try again.';
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.error?.code;
      err.details = data?.error?.details;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.status === 401 && !endpoint.includes('/auth/login')) {
      authStore.clearSession();
      if (!window.location.pathname.includes('login.html')) {
        window.location.href = './login.html';
      }
    }
    throw err;
  }
}

const api = {
  auth: {
    register(data) {
      return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    initiateRegistration(data) {
      return apiRequest('/auth/register/initiate', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    verifyOtp(data) {
      return apiRequest('/auth/register/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    resendOtp(data) {
      return apiRequest('/auth/register/resend-otp', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    login(data) {
      return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    forgotPassword(data) {
      return apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    resetPassword(data) {
      return apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    logout() {
      return apiRequest('/auth/logout', {
        method: 'POST'
      }).finally(() => {
        authStore.clearSession();
      });
    }
  },
  user: {
    getProfile() {
      return apiRequest('/user/profile');
    },
    updateProfile(data) {
      return apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    getMe() {
      return apiRequest('/user/me');
    }
  }
};

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('ah-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ah-toast-container';
    container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-[#55C595] text-white',
    error: 'bg-[#FF5A5F] text-white',
    warning: 'bg-[#FFB84D] text-[#25233A]',
    info: 'bg-[#6C63FF] text-white'
  };

  toast.className = `${bgColors[type] || bgColors.info} px-4 py-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex items-center justify-between pointer-events-auto transform translate-y-[-10px] opacity-0 transition-all duration-300 font-medium text-sm`;
  
  toast.innerHTML = `
    <div class="flex items-center space-x-2">
      <span class="toast-msg"></span>
    </div>
    <button class="ml-3 text-white/80 hover:text-white font-bold">&times;</button>
  `;
  toast.querySelector('.toast-msg').textContent = message;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
}

window.api = api;
window.authStore = authStore;
window.showToast = showToast;
