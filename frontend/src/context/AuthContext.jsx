import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, authStorage } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authStorage.getUser());
  const [profile, setProfile] = useState(authStorage.getProfile());
  const [accessToken, setAccessToken] = useState(authStorage.getAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const setSession = (sessionData = {}) => {
    authStorage.setSession(sessionData);
    const session = sessionData.session || sessionData;
    const token = session?.accessToken || session?.access_token || authStorage.getAccessToken();
    const authUser = sessionData.user || authStorage.getUser();
    const userProfile = sessionData.profile || authStorage.getProfile();

    if (token) setAccessToken(token);
    if (authUser) setUser(authUser);
    if (userProfile) setProfile(userProfile);
  };

  const fetchLiveProfile = useCallback(async () => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    setAccessToken(token);
    setUser(authStorage.getUser());
    try {
      const res = await api.user.getProfile();
      if (res?.data?.profile) {
        setProfile(res.data.profile);
        authStorage.setSession({
          session: {
            accessToken: token,
            refreshToken: authStorage.getRefreshToken()
          },
          user: authStorage.getUser(),
          profile: res.data.profile
        });
      }
    } catch (err) {
      console.warn('Profile sync:', err.message);
      if (err.status === 401) {
        logout(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveProfile();
  }, [fetchLiveProfile]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res?.data?.session) {
      const { session, user: authUser, profile: userProfile } = res.data;
      setSession({ session, user: authUser, profile: userProfile });
      showToast('Logged in successfully! Welcome back.', 'success');
      return res.data;
    }
    throw new Error('Invalid response from authentication server.');
  };

  const logout = async (callApi = true) => {
    if (callApi && authStorage.getAccessToken()) {
      try {
        await api.auth.logout();
      } catch (err) {
        console.warn('Logout api call:', err.message);
      }
    }
    authStorage.clearSession();
    setUser(null);
    setProfile(null);
    setAccessToken(null);
    showToast('Logged out of session.', 'info');
  };

  const updateProfile = async (updates) => {
    const res = await api.user.updateProfile(updates);
    if (res?.data?.profile) {
      setProfile(res.data.profile);
      authStorage.setSession({
        session: {
          accessToken: authStorage.getAccessToken(),
          refreshToken: authStorage.getRefreshToken()
        },
        user: authStorage.getUser(),
        profile: res.data.profile
      });
      showToast('Profile updated successfully!', 'success');
      return res.data.profile;
    }
    return null;
  };

  const isAuthenticated = Boolean(accessToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setSession,
        updateProfile,
        refreshProfile: fetchLiveProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

