import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import {
  login as loginAction,
  register as registerAction,
  logout as logoutAction,
  updateProfile as updateProfileAction,
  changePassword as changePasswordAction,
} from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      const response = await dispatch(loginAction(credentials)).unwrap();
      toast.success('Login successful');
      navigate('/');
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await dispatch(registerAction(userData)).unwrap();
      toast.success('Registration successful');
      navigate('/login');
      return response;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutAction()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Logout failed');
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await dispatch(updateProfileAction(profileData)).unwrap();
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await dispatch(changePasswordAction({ currentPassword, newPassword })).unwrap();
      toast.success('Password changed successfully');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
      throw error;
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
};

export default useAuth; 