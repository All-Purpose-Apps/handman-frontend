import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../utils/axiosInstance';

const initialState = {
  lowesProducts: [],
  homeDepotProducts: [],
  product: {},
  status: 'idle',
  error: null,
};

// Fetch all products
export const fetchLowesProducts = createAsyncThunk('products/fetchLowesProducts', async (search, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/lowes`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
      params: {
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

export const fetchHomeDepotProducts = createAsyncThunk('products/fetchHomeDepotProducts', async (search, { rejectWithValue }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/home-depot`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
      params: {
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLowesProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLowesProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lowesProducts = action.payload;
      })
      .addCase(fetchLowesProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchHomeDepotProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHomeDepotProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.homeDepotProducts = action.payload;
      })
      .addCase(fetchHomeDepotProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
