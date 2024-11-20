import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import productsReducer from './reducers/productsSlice';
import supportSlice from './reducers/supportSlice';
import ordersSlice from './reducers/ordersSlice';
import salesOrdersReducer from './reducers/ordersSlice';
import instanceSlice from './reducers/instanceSlice';
import profileSlice from './reducers/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    support: supportSlice,
    salesOrders: salesOrdersReducer,
    instance: instanceSlice,
    orders:ordersSlice,
    profile: profileSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
