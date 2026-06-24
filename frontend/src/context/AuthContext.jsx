import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to store user locally (convenience, not sensitive data)
  const storeUserLocal = (userData) => {
    if (userData) {
      localStorage.setItem('sleepsync_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('sleepsync_user');
    }
  };

  // Perform initial load to check if user has a valid refresh cookie session
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('sleepsync_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Attempt to refresh token on boot to establish memory token
      try {
        await refreshAccessToken();
      } catch (err) {
        // Refresh failed, meaning session cookie is invalid/missing
        console.warn('Session check failed or no session active.');
        setUser(null);
        localStorage.removeItem('sleepsync_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Periodic Access Token Refresh (every 14 minutes since token expires in 15m)
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch (err) {
        console.error('Auto-token-refresh failed:', err);
        logout();
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
  }, [accessToken]);

  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Includes cookie automatically (cross-origin requires credentials: 'include')
        // But for local/Vercel standard it is best practice
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to refresh access token');
      }
      
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      setAccessToken(null);
      throw error;
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      storeUserLocal(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      storeUserLocal(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      storeUserLocal(null);
    }
  };

  // Helper function to make authenticated fetch requests with access token
  const authFetch = async (url, options = {}) => {
    let currentToken = accessToken;
    
    // Default headers
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${currentToken}`
    };
    options.credentials = 'include';

    let res = await fetch(url, options);

    // If unauthorized, token might have expired. Try to refresh it.
    if (res.status === 401) {
      try {
        console.log('Access token expired, attempting silent refresh...');
        const newToken = await refreshAccessToken();
        options.headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, options);
      } catch (refreshErr) {
        console.error('Token refresh failed during request. Logging out.');
        logout();
        throw new Error('Session expired, please login again.');
      }
    }

    return res;
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    signup,
    logout,
    authFetch
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
