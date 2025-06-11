import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { meetingService } from '../../services/api';

// Async thunks
export const fetchMeetings = createAsyncThunk(
  'meetings/fetchMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await meetingService.getMeetings();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meetings');
    }
  }
);

export const fetchMeeting = createAsyncThunk(
  'meetings/fetchMeeting',
  async (id, { rejectWithValue }) => {
    try {
      const response = await meetingService.getMeeting(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meeting');
    }
  }
);

export const createMeeting = createAsyncThunk(
  'meetings/createMeeting',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await meetingService.createMeeting(meetingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create meeting');
    }
  }
);

export const updateMeeting = createAsyncThunk(
  'meetings/updateMeeting',
  async ({ id, meetingData }, { rejectWithValue }) => {
    try {
      const response = await meetingService.updateMeeting(id, meetingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update meeting');
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  'meetings/deleteMeeting',
  async (id, { rejectWithValue }) => {
    try {
      await meetingService.deleteMeeting(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meeting');
    }
  }
);

export const fetchAttendance = createAsyncThunk(
  'meetings/fetchAttendance',
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await meetingService.getAttendance(meetingId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'meetings/updateAttendance',
  async ({ meetingId, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await meetingService.updateAttendance(meetingId, attendanceData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update attendance');
    }
  }
);

const initialState = {
  meetings: [],
  selectedMeeting: null,
  attendance: [],
  loading: false,
  error: null,
  success: false,
};

const meetingSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    resetMeetingState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearSelectedMeeting: (state) => {
      state.selectedMeeting = null;
      state.attendance = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Meetings
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Meeting
      .addCase(fetchMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMeeting = action.payload;
      })
      .addCase(fetchMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings.push(action.payload);
        state.success = true;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Meeting
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.meetings.findIndex(meeting => meeting._id === action.payload._id);
        if (index !== -1) {
          state.meetings[index] = action.payload;
        }
        state.selectedMeeting = action.payload;
        state.success = true;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = state.meetings.filter(meeting => meeting._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch Attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Attendance
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
        state.success = true;
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetMeetingState, clearSelectedMeeting } = meetingSlice.actions;

export default meetingSlice.reducer; 