import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const u = await base44.auth.login(email, password);
      setUser(u);
      return u;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const u = await base44.auth.register(email, password, fullName);
      setUser(u);
      return u;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    base44.auth.logout();
    setUser(null);
    navigate('/login');
  };

  const navigateToLogin = () => navigate('/login');

  return (
    <AuthContext.Provider value={{
      user,
      isLoadingAuth,
      authError,
      login,
      register,
      logout,
      navigateToLogin,
      isLoadingPublicSettings: false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
