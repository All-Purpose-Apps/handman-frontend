import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const accessToken = localStorage.getItem('accessToken');

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchMaterials = createAsyncThunk('materials/fetchMaterials', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/materials');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const getAllMaterials = createAsyncThunk('materials/getAllMaterials', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/materials/get-materials`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const addMaterial = createAsyncThunk('materials/addMaterial', async (material, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/materials', material);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateMaterial = createAsyncThunk('materials/updateMaterial', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/api/materials/${id}`, updates);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteMaterial = createAsyncThunk('materials/deleteMaterial', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/materials/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMaterial.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      })
      .addCase(getAllMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAllMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default materialsSlice.reducer;
