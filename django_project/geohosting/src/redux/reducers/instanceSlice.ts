import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PaginationResult } from "../types/paginationTypes";
import { ReduxState, ReduxStateInit } from "../types/reduxState";
import { headerWithToken } from "../../utils/helpers";
import { Package, Product } from "./productsSlice";

let _lastAbortController: AbortController | null = null;
const ABORTED = 'Aborted';

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
  update: DetailState;
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
  create: ReduxStateInit,
  update: ReduxStateInit,
  detail: ReduxStateInit,
  delete: ReduxStateInit,
};

// Async thunk to fetch user instances
export const fetchUserInstances = createAsyncThunk(
  'instance/fetchUserInstances',
  async (url: string, thunkAPI) => {
    try {
      if (_lastAbortController) {
        _lastAbortController.abort();
      }
      const abortController = new AbortController();
      _lastAbortController = abortController;

      const response = await axios.get(url, {
        headers: headerWithToken(),
        signal: abortController.signal
      });
      return response.data;
    } catch (error: any) {

      // Handle cancel errors
      if (axios.isCancel(error)) {
        return thunkAPI.rejectWithValue(ABORTED);
      }

      return thunkAPI.rejectWithValue(
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
        if (action.payload === ABORTED) {
          return
        }
        state.list.loading = false;
        state.list.error = action.payload as string; // Ensure error is string
      });
  },
});

export default instanceSlice.reducer;
