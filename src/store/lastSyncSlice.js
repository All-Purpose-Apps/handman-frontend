import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';

const initialState = {
  lastSync: null,
  status: 'idle',
  error: null,
};

// Fetch the last sync time
export const fetchLastSync = createAsyncThunk('lastSync/fetchLastSync', async (_, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/last-synced`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch last sync');
  }
});

// Update the last sync time
export const updateLastSync = createAsyncThunk('lastSync/updateLastSync', async (id, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/last-synced/${id}`,
      {}, // Empty body if you're not sending data
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to update last sync');
  }
});

export const lastSyncSlice = createSlice({
  name: 'lastSync',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchLastSync actions
      .addCase(fetchLastSync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLastSync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastSync = action.payload;
      })
      .addCase(fetchLastSync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Handle updateLastSync actions
      .addCase(updateLastSync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateLastSync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastSync = action.payload;
      })
      .addCase(updateLastSync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default lastSyncSlice.reducer;
