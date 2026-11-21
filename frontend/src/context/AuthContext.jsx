/**
 * Authentication Context Provider
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hc_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile.user);
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('hc_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password, role) => {
    const res = await api.register(name, email, password, role);
    localStorage.setItem('hc_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const demoLogin = async () => {
    return login('demo@healthcare.org', 'Demo@12345');
  };

  const logout = () => {
    localStorage.removeItem('hc_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
