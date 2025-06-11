import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/api';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.clearAllNotifications();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear all notifications');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  success: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotificationState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Read
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          if (!state.notifications[index].read) {
            state.unreadCount -= 1;
          }
        }
        state.success = true;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Mark All as Read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = 0;
        state.success = true;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Clear All Notifications
      .addCase(clearAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.loading = false;
        state.notifications = [];
        state.unreadCount = 0;
        state.success = true;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetNotificationState, addNotification } = notificationSlice.actions;

export default notificationSlice.reducer; 