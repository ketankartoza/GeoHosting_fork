import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import axios from 'axios';
import { Package, Product } from "./productsSlice";
import { PaginationResult } from "../types/paginationTypes";
import { ReduxState, ReduxStateInit } from "../types/reduxState";
import { Instance } from "./instanceSlice";
import { headerWithToken } from "../../utils/helpers";


let _lastAbortController: AbortController | null = null;
const ABORTED = 'Aborted';

export interface SalesOrder {
  id: string,
  erpnext_code: string,
  status: string,
  date: string,
  order_status: string,
  payment_method: string,
  invoice_url: string,
  product: Product,
  package: Package,
  app_name: string,
  company_name: string,
  instance: Instance
}

interface SalesOrderPaginationResult extends PaginationResult {
  results: SalesOrder[]
}

interface ListState extends ReduxState {
  data: SalesOrderPaginationResult | null
}

interface NonReturnState extends ReduxState {
  data: null
}

interface DetailState extends ReduxState {
  data: SalesOrder | null
}


interface SalesOrderState {
  list: ListState;
  create: NonReturnState;
  detail: DetailState;
  update: DetailState;
  delete: NonReturnState;
}

// Initial state
const initialState: SalesOrderState = {
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
  delete: ReduxStateInit
};

// Async thunk to fetch sales order
export const fetchSalesOrders = createAsyncThunk(
  'salesOrder/fetchSalesOrders',
  async (url: string, thunkAPI) => {
    try {
      if (_lastAbortController) {
        _lastAbortController.abort();
      }
      const abortController = new AbortController();
      _lastAbortController = abortController;

      const response = await axios.get(url, {
        headers: headerWithToken(),
        signal: abortController.signal,
      });
      return response.data;
    } catch (error: any) {

      // Handle cancel errors
      if (axios.isCancel(error)) {
        return thunkAPI.rejectWithValue(ABORTED);
      }

      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

export const fetchSalesOrderDetail = createAsyncThunk(
  'salesOrder/fetchSalesOrderDetail',
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/orders/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

const handlePending = (state: SalesOrderState, action: PayloadAction<any>) => {
  switch (action.type) {
    case fetchSalesOrders.pending.type: {
      state.list.loading = true;
      state.list.error = null;
      break
    }
    case fetchSalesOrderDetail.pending.type: {
      state.detail.loading = true;
      state.detail.error = null;
      break
    }
  }
};

const handleFulfilled = (state: SalesOrderState, action: PayloadAction<any>) => {
  switch (action.type) {
    case fetchSalesOrders.fulfilled.type: {
      state.list.loading = false;
      state.list.data = action.payload;
      break
    }
    case fetchSalesOrderDetail.fulfilled.type: {
      state.detail.loading = false;
      state.detail.data = action.payload;
      break
    }
  }
};

const handleRejected = (state: SalesOrderState, action: PayloadAction<any>) => {
  switch (action.type) {
    case fetchSalesOrders.rejected.type: {
      if (action.payload === ABORTED) {
        return
      }
      state.list.loading = false;
      state.list.error = action.payload as string;
      break
    }
    case fetchSalesOrderDetail.rejected.type: {
      state.detail.loading = false;
      if (action.payload.detail) {
        state.detail.error = action.payload.detail as string;
      } else {
        state.detail.error = action.payload as string;
      }
      break
    }
  }
};


const ordersSlice = createSlice({
  name: 'salesOrders',
  initialState,
  reducers: {
    clearSalesOrderDetail: (state) => {
      state.detail.data = null;
      state.detail.error = null;
    },
  },
  extraReducers: (builder) => {
    const actions = [
      fetchSalesOrders,
      fetchSalesOrderDetail
    ];

    actions.forEach(action => {
      builder.addCase(action.pending, handlePending);
      builder.addCase(action.fulfilled, handleFulfilled);
      builder.addCase(action.rejected, handleRejected);
    });
  },
});

export const { clearSalesOrderDetail } = ordersSlice.actions;
export default ordersSlice.reducer;
