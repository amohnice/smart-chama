import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(response => {
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            throw new Error('No user data received');
          }
        })
        .catch((error) => {
          console.error('Error getting current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          navigate('/login');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      // Check user status
      if (user.status === 'pending') {
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      }

      if (user.status === 'suspended') {
        throw new Error('Your account has been suspended. Please contact support.');
      }

      if (user.status === 'inactive') {
        throw new Error('Your account is inactive. Please contact support.');
      }

      message.success('Login successful!');

      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/member/dashboard', { replace: true });
      }

      return response.data;
    } catch (error) {
      message.error(error.response?.data?.error || error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      message.success('Registration successful! Please check your email to verify your account.');
      return response;
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      message.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      message.error(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data) => {
    try {
      setLoading(true);
      await authService.changePassword(data);
      message.success('Password changed successfully');
    } catch (error) {
      message.error(error.response?.data?.message || 'Password change failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authService.requestPasswordReset(email);
      message.success('Password reset instructions sent to your email');
    } catch (error) {
      message.error(error.response?.data?.message || 'Password reset request failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      await authService.resetPassword({ token, password });
      message.success('Password reset successful');
    } catch (error) {
      message.error(error.response?.data?.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 