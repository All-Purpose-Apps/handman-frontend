import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFiles = createAsyncThunk('files/fetchFiles', async (_, { rejectWithValue }) => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/files`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch files:', error);
    return rejectWithValue(error.response?.data || 'Failed to fetch files');
  }
});

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default filesSlice.reducer;
