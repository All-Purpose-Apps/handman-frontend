import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { handleGoogleSignIn } from '../utils/handleGoogleSignIn';

const initialState = {
  notifications: [],
  notification: {},
  status: 'idle',
  error: null,
};

// Fetch all notifications
export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (_, { rejectWithValue }) => {
  const auth = getAuth();
  const accessToken = await localStorage.getItem('accessToken');

  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    if (error.response?.status === 401) {
      await signOut(auth);
      handleGoogleSignIn(auth);
    }
    return rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

export const markNotificationAsRead = createAsyncThunk('notifications/markNotificationAsRead', async (notificationId, { rejectWithValue }) => {
  try {
    const accessToken = await localStorage.getItem('accessToken');
    const response = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/api/notifications/markAsRead/${notificationId}`,
      {}, // Pass an empty object as the request body since it's a PATCH request
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to mark notification as read');
  }
});

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notification = action.payload;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default notificationSlice.reducer;
