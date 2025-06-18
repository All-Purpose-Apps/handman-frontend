// calendarSlice.js

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { handleGoogleSignIn } from '../utils/handleGoogleSignIn';

const initialState = {
  calendar: [],
  events: [],
  calendars: [],
  status: 'idle',
  error: null,
};

export const fetchCalendars = createAsyncThunk('calendar/fetchCalendars', async (_, { rejectWithValue }) => {
  const auth = getAuth();
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/calendars`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const fetchCalendar = createAsyncThunk('calendar/fetchCalendar', async ({ calendarId }, { rejectWithValue }) => {
  const auth = getAuth();

  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const createCalendarEvent = createAsyncThunk('calendar/createCalendarEvent', async ({ eventData, calendarId }, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/events?calendarId=${calendarId}`, eventData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const updateCalendarEvent = createAsyncThunk('calendar/updateCalendarEvent', async ({ eventId, eventData, calendarId }, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/events/${eventId}?calendarId=${calendarId}`, eventData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const deleteCalendarEvent = createAsyncThunk('calendar/deleteCalendarEvent', async ({ eventId, calendarId }, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/events/${eventId}?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Calendars
      .addCase(fetchCalendars.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCalendars.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.calendars = action.payload;
      })
      .addCase(fetchCalendars.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Fetch Calendar Events
      .addCase(fetchCalendar.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Create Calendar Event
      .addCase(createCalendarEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createCalendarEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.calendar = action.payload;
      })
      .addCase(createCalendarEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Update Calendar Event
      .addCase(updateCalendarEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCalendarEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.calendar = action.payload;
      })
      .addCase(updateCalendarEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Delete Calendar Event
      .addCase(deleteCalendarEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteCalendarEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.calendar = action.payload;
      })
      .addCase(deleteCalendarEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default calendarSlice.reducer;
