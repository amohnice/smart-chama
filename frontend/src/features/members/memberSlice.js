import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { memberService } from '../../services/api';

// Async thunks
export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await memberService.getMembers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);

export const fetchMember = createAsyncThunk(
  'members/fetchMember',
  async (id, { rejectWithValue }) => {
    try {
      const response = await memberService.getMember(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch member');
    }
  }
);

export const createMember = createAsyncThunk(
  'members/createMember',
  async (memberData, { rejectWithValue }) => {
    try {
      const response = await memberService.createMember(memberData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create member');
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ id, memberData }, { rejectWithValue }) => {
    try {
      const response = await memberService.updateMember(id, memberData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update member');
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id, { rejectWithValue }) => {
    try {
      await memberService.deleteMember(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete member');
    }
  }
);

const initialState = {
  members: [],
  selectedMember: null,
  loading: false,
  error: null,
  success: false,
};

const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    resetMemberState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearSelectedMember: (state) => {
      state.selectedMember = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Member
      .addCase(fetchMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMember.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMember = action.payload;
      })
      .addCase(fetchMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Member
      .addCase(createMember.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
        state.success = true;
      })
      .addCase(createMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Member
      .addCase(updateMember.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.members.findIndex(member => member._id === action.payload._id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
        state.selectedMember = action.payload;
        state.success = true;
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Member
      .addCase(deleteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter(member => member._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetMemberState, clearSelectedMember } = memberSlice.actions;

export default memberSlice.reducer; 