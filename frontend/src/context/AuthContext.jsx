import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, authStorage } from '../services/api';
import { supabase } from '../services/supabase';
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
        authStorage.clearSession();
        setUser(null);
        setProfile(null);
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync Supabase Auth state (including Google OAuth redirect logins)
  useEffect(() => {
    let isSubscribed = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && session)) {
        if (session?.access_token) {
          const token = session.access_token;
          const authUser = session.user;
          const fallbackProfile = {
            id: authUser.id,
            fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
            email: authUser.email,
            role: authUser.user_metadata?.role || 'student',
            avatarUrl: authUser.user_metadata?.avatar_url || null
          };

          setSession({
            session: { accessToken: token, refreshToken: session.refresh_token },
            user: { id: authUser.id, email: authUser.email, role: fallbackProfile.role },
            profile: authStorage.getProfile() || fallbackProfile
          });

          // Sync live profile from backend if available (non-blocking)
          api.user.getProfile()
            .then((res) => {
              if (isSubscribed && res?.data?.profile) {
                setProfile(res.data.profile);
              }
            })
            .catch((e) => {
              console.warn('OAuth profile sync notice:', e.message);
            });
        }
      } else if (event === 'SIGNED_OUT') {
        authStorage.clearSession();
        setUser(null);
        setProfile(null);
        setAccessToken(null);
      }

      setIsLoading(false);
    });

    fetchLiveProfile();

    return () => {
      isSubscribed = false;
      subscription?.unsubscribe();
    };
  }, [fetchLiveProfile]);

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      showToast(err.message || 'Google authentication failed.', 'error');
      throw err;
    }
  };

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
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      // ignore
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
        loginWithGoogle,
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

