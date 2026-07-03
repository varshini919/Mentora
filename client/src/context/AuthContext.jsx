import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Handler for 401 unauthorized intercepts
    const handleAuthLogout = () => {
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth-logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('token', token);
      setUser(loggedUser);
      toast.success('Logged in successfully!');
      return loggedUser;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user: registeredUser } = response.data;
      localStorage.setItem('token', token);
      setUser(registeredUser);
      toast.success('Account created successfully!');
      return registeredUser;
    } catch (error) {
      const errors = error.response?.data?.errors;
      const errorMsg = errors ? errors.map(e => e.msg).join(', ') : (error.response?.data?.error || 'Registration failed.');
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
