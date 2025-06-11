import api from './api';

// Register user
const register = async (userData) => {
  try {
    console.log('Registration data:', userData);
    const response = await api.post('/api/auth/register', userData);
    console.log('Registration response:', response);
    
    if (response.data && response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
const login = async (email, password) => {
  try {
    console.log('Login attempt with data:', { email });
    const response = await api.post('/api/auth/login', { email, password });
    console.log('Login response:', response);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    const { token, user } = response.data;
    
    if (!token || !user) {
      throw new Error('Missing token or user data in response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response;
  } catch (error) {
    console.error('Login error:', error.response?.data || error);
    throw error;
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.get('/api/auth/me');
    return response;
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error);
    throw error;
  }
};

// Logout user
const logout = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response;
  } catch (error) {
    console.error('Logout error:', error.response?.data || error);
    throw error;
  }
};

// Update user profile
const updateProfile = async (data) => {
  try {
    const response = await api.put('/api/auth/profile', data);
    return response;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error);
    throw error;
  }
};

// Change password
const changePassword = async (data) => {
  try {
    const response = await api.put('/api/auth/change-password', data);
    return response;
  } catch (error) {
    console.error('Change password error:', error.response?.data || error);
    throw error;
  }
};

// Request password reset
const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response;
  } catch (error) {
    console.error('Request password reset error:', error.response?.data || error);
    throw error;
  }
};

// Reset password
const resetPassword = async (data) => {
  try {
    const response = await api.post('/api/auth/reset-password', data);
    return response;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error);
    throw error;
  }
};

const authService = {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
};

export default authService; 