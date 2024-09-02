import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import productsReducer from './reducers/productsSlice';
import supportSlice from './reducers/supportSlice';
import salesOrdersReducer from './reducers/salesOrdersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    support: supportSlice,
    salesOrders: salesOrdersReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
