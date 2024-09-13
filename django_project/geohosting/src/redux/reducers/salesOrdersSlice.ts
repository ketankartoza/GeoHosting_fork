import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import axios from 'axios';
import { Package, Product } from "./productsSlice";


export interface Instance {
  id: number,
  url: string,
  name: string,
  price: number,
  cluster: number,
  owner: number
}

export interface SalesOrder {
  id: string,
  status: string,
  date: string,
  order_status: string,
  payment_method: string,
  invoice_url: string,
  product: Product,
  package: Package,
  app_name: string,
  instance: Instance
}

interface SalesOrderState {
  salesOrders: SalesOrder[];
  salesOrderDetail: SalesOrder | null;
  loading: boolean;
  error: string | null;
  detailLoading: boolean;
  detailError: string | null;
}

const initialState: SalesOrderState = {
  salesOrders: [],
  salesOrderDetail: null,
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,
};

// Async thunk to fetch sales order
export const fetchSalesOrders = createAsyncThunk(
  'salesOrder/fetchSalesOrders',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/', {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data.results;
    } catch (error: any) {
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
  if (action.type === fetchSalesOrders.pending.type) {
    state.loading = true;
    state.error = null;
  } else {
    state.detailLoading = true;
    state.detailError = null;
  }
};

const handleFulfilled = (state: SalesOrderState, action: PayloadAction<any>) => {
  if (action.type === fetchSalesOrders.fulfilled.type) {
    state.loading = false;
    state.salesOrders = action.payload;
  } else {
    state.detailLoading = false;
    state.salesOrderDetail = action.payload;
  }
};

const handleRejected = (state: SalesOrderState, action: PayloadAction<any>) => {
  if (action.type === fetchSalesOrders.rejected.type) {
    state.loading = false;
    state.error = action.payload as string;
  } else {
    state.detailLoading = false;
    if (action.payload.detail) {
      state.detailError = action.payload.detail as string;
    } else {
      state.detailError = action.payload as string;
    }
  }
};


const salesOrdersSlice = createSlice({
  name: 'salesOrders',
  initialState,
  reducers: {
    clearSalesOrderDetail: (state) => {
      state.salesOrderDetail = null;
      state.detailError = null;
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

export const { clearSalesOrderDetail } = salesOrdersSlice.actions;
export default salesOrdersSlice.reducer;
