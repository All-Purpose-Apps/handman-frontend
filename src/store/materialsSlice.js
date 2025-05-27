import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const accessToken = localStorage.getItem('accessToken');

const initialState = {
  items: [],
  materialsList: [],
  loading: false,
  error: null,
};

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

export const createMaterialsList = createAsyncThunk('materials/createMaterialsList', async (materials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/materials/create-materials-list`, materials, {
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

export const getMaterialList = createAsyncThunk('materials/getMaterialList', async (proposalNumber, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/materials/get-materials-list/${proposalNumber}`, {
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

export const updateMaterialsList = createAsyncThunk('materials/updateMaterialsList', async ({ proposalNumber, materials }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/materials/update-materials-list/${proposalNumber}`, materials, {
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

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(createMaterialsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMaterialsList.fulfilled, (state, action) => {
        state.loading = false;
        state.materialsList = action.payload;
      })
      .addCase(createMaterialsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMaterialList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterialList.fulfilled, (state, action) => {
        state.loading = false;
        state.materialsList = action.payload;
      })
      .addCase(getMaterialList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMaterialsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMaterialsList.fulfilled, (state, action) => {
        state.loading = false;
        state.materialsList = action.payload;
      })
      .addCase(updateMaterialsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default materialsSlice.reducer;
