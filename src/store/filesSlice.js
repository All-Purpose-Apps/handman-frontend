import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFiles = createAsyncThunk('files/fetchFiles', async (_, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
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

export const deleteFile = createAsyncThunk('files/deleteFile', async (filename, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/files/delete/`, {
      params: { filename },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return filename; // Return the filename to remove it from the state
  } catch (error) {
    console.error('Failed to delete file:', error);
    return rejectWithValue(error.response?.data || 'Failed to delete file');
  }
});

export const renameFile = createAsyncThunk('files/renameFile', async ({ oldName, newName }, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/files/rename`,
      {
        oldName,
        newName,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      }
    );
    return response.data; // Assuming the response contains the updated file info
  } catch (error) {
    console.error('Failed to rename file:', error);
    return rejectWithValue(error.response?.data || 'Failed to rename file');
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
      })
      .addCase(deleteFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.loading = false;
        const filename = action.payload;
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default filesSlice.reducer;
