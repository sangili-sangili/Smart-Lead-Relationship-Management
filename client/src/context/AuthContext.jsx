import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  // Sync / verify session with backend on initialization
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const currentToken = authService.getToken();
      if (!currentToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const freshUser = await authService.getMe();
        if (isMounted && freshUser) {
          setUser(freshUser);
        }
      } catch (err) {
        // If token expired or invalid, reset credentials
        if (err.status === 401) {
          authService.logout();
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();

    // Listen for unauthorized 401 event dispatched from api.js
    const handleUnauthorized = () => {
      authService.logout();
      setUser(null);
      setToken(null);
    };

    window.addEventListener('leadflow:auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('leadflow:auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Log in user
   */
  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await authService.login({ email, password });
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  /**
   * Log out user
   */
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Update profile
   */
  const updateUser = useCallback(async (profileData) => {
    const updatedUser = await authService.updateProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  /**
   * Change password
   */
  const changePassword = useCallback(async (passwordData) => {
    const res = await authService.changePassword(passwordData);
    const updatedToken = authService.getToken();
    if (updatedToken) setToken(updatedToken);
    return res;
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
    updateUser,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
