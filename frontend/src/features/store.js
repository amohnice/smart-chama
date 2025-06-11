import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import memberReducer from './members/memberSlice';
import meetingReducer from './meetings/meetingSlice';
import financeReducer from './finance/financeSlice';
import notificationReducer from './notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: memberReducer,
    meetings: meetingReducer,
    finance: financeReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 