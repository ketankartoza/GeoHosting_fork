import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Instance {
  id: number,
  url: string,
  name: string,
  price: number,
  cluster: number,
  owner: number
}

interface InstanceState {
  instances: Instance[];
  loading: boolean;
  error: string | null;
}

const initialState: InstanceState = {
  instances: [],
  loading: false,
  error: null,
};

// Async thunk to fetch user instances
export const fetchUserInstances = createAsyncThunk(
  'instance/fetchUserInstances',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/instances/my_instances/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'An error occurred while fetching instances'
      );
    }
  }
);

const instanceSlice = createSlice({
  name: 'instance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInstances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInstances.fulfilled, (state, action) => {
        state.loading = false;
        state.instances = action.payload;
      })
      .addCase(fetchUserInstances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Ensure error is string
      });
  },
});

export default instanceSlice.reducer;
