import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';

const initialState = {
  proposals: [],
  proposal: {},
  status: 'idle',
  error: null,
};

export const fetchProposals = createAsyncThunk('proposals/fetchProposals', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/proposals`);
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

export const fetchOneProposal = createAsyncThunk('proposals/fetchOneProposal', async (proposalId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/proposals/${proposalId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Failed to fetch proposal');
  }
});

export const addProposal = createAsyncThunk('proposals/addProposal', async (proposal, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/proposals`, proposal);
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Failed to add proposal');
  }
});

export const updateProposal = createAsyncThunk('proposals/updateProposal', async (proposal, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/proposals/${proposal._id}`, proposal);
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Failed to update proposal');
  }
});

export const deleteProposal = createAsyncThunk('proposals/deleteProposal', async (proposalId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/proposals/${proposalId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Failed to delete proposal');
  }
});

export const deleteMultipleProposals = createAsyncThunk('proposals/deleteMultipleProposals', async (proposalIds, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/proposals/delete-multiple`, { ids: proposalIds });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Failed to delete proposals');
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
        state.proposals = action.payload;
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
        state.proposals.push(action.payload);
      })
      .addCase(addProposal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteMultipleProposals.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteMultipleProposals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.proposals = action.payload;
      })
      .addCase(deleteMultipleProposals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default proposalSlice.reducer;
