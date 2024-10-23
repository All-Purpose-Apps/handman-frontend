import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const accessToken = localStorage.getItem('accessToken');

const initialState = {
  clients: [],
  client: {},
  status: 'idle',
  error: null,
};

// Fetch all clients
export const fetchClients = createAsyncThunk('clients/fetchClients', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:3000/api/clients', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

// Fetch a single client by ID
export const fetchOneClient = createAsyncThunk('clients/fetchOneClient', async (clientId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/clients/${clientId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch client');
  }
});

// Add a new client
export const addClient = createAsyncThunk('clients/addClient', async (client, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:3000/api/clients', client, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to add client');
  }
});

export const updateClient = createAsyncThunk('clients/updateClient', async (client, { rejectWithValue }) => {
  try {
    const response = await axios.put(`http://localhost:3000/api/clients/${client._id}`, client, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to update client');
  }
});

export const deleteClient = createAsyncThunk('clients/deleteClient', async (clientId, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:3000/api/clients/${clientId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return clientId;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to delete client');
  }
});

export const syncClients = createAsyncThunk('clients/syncClients', async (clients, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:3000/api/clients/sync', clients, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to sync clients');
  }
});

export const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchClients actions
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Handle fetchOneClient actions
      .addCase(fetchOneClient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOneClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.client = action.payload; // Store the fetched client
      })
      .addCase(fetchOneClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Handle addClient actions
      .addCase(addClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload; // Add the new client to the list
      })
      .addCase(addClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default clientSlice.reducer;
