import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface OrdersState {
  orders: Array<any>;
  orderDetail: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  orderDetail: null,
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (token: string) => {
  const response = await axios.get('/api/orders', {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data.results;
});

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async ({ id, token }: { id: string; token: string }) => {
  const response = await axios.get(`/api/orders/${id}`, {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});

export default ordersSlice.reducer;
