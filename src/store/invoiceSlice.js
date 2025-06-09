import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  invoices: [],
  invoice: {},
  status: 'idle',
  error: null,
};

// Fetch all invoices
export const fetchInvoices = createAsyncThunk('invoices/fetchInvoices', async (_, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`, {
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

// Fetch a single invoice by ID
export const fetchOneInvoice = createAsyncThunk('invoices/fetchOneInvoice', async (invoiceId, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch invoice');
  }
});

// Add a new invoice
export const addInvoice = createAsyncThunk('invoices/addInvoice', async (invoice, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`, invoice, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to add invoice');
  }
});

export const updateInvoice = createAsyncThunk('invoices/updateInvoice', async ({ id, prevClientId, newClientId, invoiceData }, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/${id}`, invoiceData, {
      params: {
        prevClientId,
        newClientId,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to update invoice');
  }
});

export const deleteInvoice = createAsyncThunk('invoices/deleteInvoice', async (invoiceId, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to delete invoice');
  }
});

export const sendInvoiceToClient = createAsyncThunk('invoices/sendInvoiceToClient', async (invoiceId, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/invoices/send-invoice-to-client`,
      { invoiceId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      }
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to send invoice to client');
  }
});

export const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchInvoices actions
      .addCase(fetchInvoices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchOneInvoice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOneInvoice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoice = action.payload;
      })
      .addCase(fetchOneInvoice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(addInvoice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoices.push(action.payload);
      })
      .addCase(addInvoice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateInvoice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoice = action.payload;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteInvoice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoices = action.payload;
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default invoiceSlice.reducer;
