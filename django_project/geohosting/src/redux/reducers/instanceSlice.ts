import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PaginationResult } from "../types/paginationTypes";
import { ReduxState } from "../types/reduxState";
import { headerWithToken } from "../../utils/helpers";
import { Package, Product } from "./productsSlice";

export interface Instance {
  id: number,
  url: string,
  name: string,
  status: string,
  price: number,
  cluster: number,
  owner: number,
  product: Product,
  package: Package,
}

interface InstancePaginationResult extends PaginationResult {
  results: Instance[]
}

interface ListState extends ReduxState {
  data: InstancePaginationResult | null
}

interface NonReturnState extends ReduxState {
  data: null
}

interface DetailState extends ReduxState {
  data: Instance | null
}


interface InstanceState {
  list: ListState;
  create: NonReturnState;
  detail: DetailState;
  edit: DetailState;
  delete: NonReturnState;
}

// Initial state
const initialState: InstanceState = {
  list: {
    data: {
      count: 0,
      next: null,
      previous: null,
      results: []
    },
    loading: false,
    error: null,
  },
  create: {
    data: null,
    loading: false,
    error: null,
  },
  edit: {
    data: null,
    loading: false,
    error: null,
  },
  detail: {
    data: null,
    loading: false,
    error: null,
  },
  delete: {
    data: null,
    loading: false,
    error: null,
  },
};

// Async thunk to fetch user instances
export const fetchUserInstances = createAsyncThunk(
  'instance/fetchUserInstances',
  async (url: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(url, {
        headers: headerWithToken()
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
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchUserInstances.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.data = action.payload;
      })
      .addCase(fetchUserInstances.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload as string; // Ensure error is string
      });
  },
});

export default instanceSlice.reducer;
