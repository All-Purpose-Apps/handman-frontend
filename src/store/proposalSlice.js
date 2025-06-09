import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  proposals: [],
  proposal: {},
  status: 'idle',
  error: null,
};

export const fetchProposals = createAsyncThunk('proposals/fetchProposals', async (_, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/proposals`, {
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

export const fetchOneProposal = createAsyncThunk('proposals/fetchOneProposal', async (proposalId, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/proposals/${proposalId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch proposal');
  }
});

export const addProposal = createAsyncThunk('proposals/addProposal', async (proposal, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/proposals`, proposal, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to add proposal');
  }
});

export const updateProposal = createAsyncThunk('proposals/updateProposal', async (proposal, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/proposals/${proposal._id}`, proposal, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to update proposal');
  }
});

export const deleteProposal = createAsyncThunk('proposals/deleteProposal', async (proposalId, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/proposals/${proposalId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to delete proposal');
  }
});

export const sendProposalToClient = createAsyncThunk('proposals/sendProposalToClient', async (proposalId, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/proposals/send-proposal-to-client`,
      { proposalId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending proposal to client:', error);
    return rejectWithValue(error.response?.data || 'Failed to send proposal to client');
  }
});

export const proposalSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProposals.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.proposals = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchOneProposal.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOneProposal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.proposal = action.payload;
      })
      .addCase(fetchOneProposal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(addProposal.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addProposal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.proposals = action.payload;
      })
      .addCase(addProposal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default proposalSlice.reducer;
