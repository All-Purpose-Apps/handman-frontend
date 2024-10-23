// calendarSlice.js

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  calendar: [],
  calendars: [],
  status: 'idle',
  error: null,
};

export const fetchCalendars = createAsyncThunk('calendar/fetchCalendars', async (_, { rejectWithValue }) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return rejectWithValue('Access token is missing');
  }
  try {
    const response = await axios.get('http://localhost:3000/api/google/calendar/calendars', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const fetchCalendar = createAsyncThunk('calendar/fetchCalendar', async ({ calendarId }, { rejectWithValue }) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return rejectWithValue('Access token is missing');
  }
  try {
    const response = await axios.get(`http://localhost:3000/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const createCalendarEvent = createAsyncThunk('calendar/createCalendarEvent', async ({ eventData, calendarId }, { rejectWithValue }) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return rejectWithValue('Access token is missing');
  }
  try {
    await axios.post(`http://localhost:3000/api/google/calendar/events?calendarId=${calendarId}`, eventData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    const response = await axios.get(`http://localhost:3000/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const updateCalendarEvent = createAsyncThunk('calendar/updateCalendarEvent', async ({ eventId, eventData, calendarId }, { rejectWithValue }) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return rejectWithValue('Access token is missing');
  }
  try {
    await axios.put(`http://localhost:3000/api/google/calendar/events/${eventId}?calendarId=${calendarId}`, eventData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    const response = await axios.get(`http://localhost:3000/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message || 'Something went wrong');
  }
});

export const deleteCalendarEvent = createAsyncThunk('calendar/deleteCalendarEvent', async ({ eventId, calendarId }, { rejectWithValue }) => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return rejectWithValue('Access token is missing');
  }
  try {
    await axios.delete(`http://localhost:3000/api/google/calendar/events/${eventId}?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    const response = await axios.get(`http://localhost:3000/api/google/calendar/events?calendarId=${calendarId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
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
        state.calendar = action.payload;
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
