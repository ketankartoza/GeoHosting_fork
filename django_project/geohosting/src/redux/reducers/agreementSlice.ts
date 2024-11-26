import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PaginationResult } from "../types/paginationTypes";
import { ReduxState, ReduxStateInit } from "../types/reduxState";
import { headerWithToken } from "../../utils/helpers";

let _lastAbortController: AbortController | null = null;
const ABORTED = 'Aborted';

export interface Agreement {
  id: number,
  name: string;
  created_at: string;
  download_url: string;
  file: string;
}

interface AgreementPaginationResult extends PaginationResult {
  results: Agreement[]
}

interface ListState extends ReduxState {
  data: AgreementPaginationResult | null
}

interface NonReturnState extends ReduxState {
  data: null
}

interface DetailState extends ReduxState {
  data: Agreement | null
}


interface AgreementState {
  list: ListState;
  create: NonReturnState;
  detail: DetailState;
  update: DetailState;
  delete: NonReturnState;
}

// Initial state
const initialState: AgreementState = {
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

// Async thunk to fetch user agreements
export const fetchUserAgreements = createAsyncThunk(
  'agreement/fetchUserAgreements',
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
        error.response?.data || 'An error occurred while fetching agreements'
      );
    }
  }
);

const agreementSlice = createSlice({
  name: 'agreement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAgreements.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchUserAgreements.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.data = action.payload;
      })
      .addCase(fetchUserAgreements.rejected, (state, action) => {
        if (action.payload === ABORTED) {
          return
        }
        state.list.loading = false;
        state.list.error = action.payload as string; // Ensure error is string
      });
  },
});

export default agreementSlice.reducer;
