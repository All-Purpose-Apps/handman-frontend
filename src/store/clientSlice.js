import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { handleGoogleSignIn } from '../utils/handleGoogleSignIn';

const accessToken = localStorage.getItem('accessToken');

const initialState = {
  clients: [],
  client: {},
  status: 'idle',
  error: null,
};

// Fetch all clients
export const fetchClients = createAsyncThunk('clients/fetchClients', async (_, { rejectWithValue }) => {
  const auth = getAuth();
  try {
    const response = await axios.get('http://localhost:3000/api/clients', {
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
    console.log(error);
    return rejectWithValue(error.response?.data || 'Failed to add client');
  }
});

export const updateClient = createAsyncThunk('clients/updateClient', async (client, { rejectWithValue }) => {
  try {
    const response = await axios.put(`http://localhost:3000/api/clients/${client.id}`, client, {
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

export const deleteClient = createAsyncThunk('clients/deleteClient', async ({ resourceName, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:3000/api/google/contacts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
      params: {
        resourceName,
        id,
      },
    });
    return clientId;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to delete client');
  }
});

export const syncClients = createAsyncThunk('clients/syncClients', async (clients, { rejectWithValue }) => {
  const auth = getAuth();
  try {
    const response = await axios.post('http://localhost:3000/api/clients/sync', clients, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    console.log('error', error.response);
    if (error.response?.status === 401) {
      await signOut(auth);
      handleGoogleSignIn(auth);
    }
    return rejectWithValue(error.response?.data || 'Failed to sync clients');
  }
});

export const createGoogleContact = createAsyncThunk('clients/createGoogleContact', async (contact, { rejectWithValue }) => {
  const auth = getAuth();
  console.log('contact', contact);
  try {
    const response = await axios.post('http://localhost:3000/api/google/contacts', contact, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await signOut(auth);
      handleGoogleSignIn(auth);
    }
    return rejectWithValue(error.response?.data || 'Failed to create Google contact');
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
      })
      .addCase(updateClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.client = action.payload; // Update the client in the list
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = state.clients.filter((client) => client._id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(syncClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(syncClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload;
      })
      .addCase(syncClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(createGoogleContact.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createGoogleContact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.client = action.payload;
      })
      .addCase(createGoogleContact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default clientSlice.reducer;
