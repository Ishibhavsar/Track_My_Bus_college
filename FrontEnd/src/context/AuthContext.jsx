import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    }
  };

  const requestOTP = useCallback(async (phone, purpose) => {
    setLoading(true);
    try {
      const response = await authAPI.requestOTP(phone, purpose);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, phone, otp) => {
    setLoading(true);
    try {
      const response = await authAPI.signup(name, phone, otp);
      if (response.data.success) {
        const { token, user } = response.data.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone, otp) => {
    setLoading(true);
    try {
      const response = await authAPI.login(phone, otp);
      if (response.data.success) {
        const { token, user } = response.data.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateProfile = useCallback(async (name) => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(name);
      if (response.data.success) {
        setUser(response.data.data);
      }
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        requestOTP,
        signup,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
