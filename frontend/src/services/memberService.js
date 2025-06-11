import api from './api';

// Get dashboard statistics
const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/members/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get recent contributions
const getRecentContributions = async () => {
  try {
    const response = await api.get('/api/members/contributions');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent contributions:', error);
    throw error;
  }
};

// Get recent loans
const getRecentLoans = async () => {
  try {
    const response = await api.get('/api/members/loans');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent loans:', error);
    throw error;
  }
};

// Get upcoming meetings
const getUpcomingMeetings = async () => {
  try {
    const response = await api.get('/api/members/meetings/upcoming');
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    throw error;
  }
};

// Get notifications (using transactions as notifications for now)
const getNotifications = async () => {
  try {
    const response = await api.get('/api/members/transactions/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get member profile
const getProfile = async () => {
  try {
    const response = await api.get('/api/members/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Update member profile
const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/api/members/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update profile image
const updateProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    const response = await api.put('/api/members/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw error;
  }
};

// Change password
const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/members/profile/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

const memberService = {
  getDashboardStats,
  getRecentContributions,
  getRecentLoans,
  getUpcomingMeetings,
  getNotifications,
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
};

export default memberService; 