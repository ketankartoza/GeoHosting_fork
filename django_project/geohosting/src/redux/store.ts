import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import productsReducer from './reducers/productsSlice';
import supportSlice from './reducers/supportSlice';
import ordersSlice from './reducers/ordersSlice';
import agreementSlice from './reducers/agreementSlice';
import salesOrdersReducer from './reducers/ordersSlice';
import instanceSlice from './reducers/instanceSlice';
import profileSlice from './reducers/profileSlice';
import companySlice from './reducers/companySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    support: supportSlice,
    salesOrders: salesOrdersReducer,
    instance: instanceSlice,
    company: companySlice,
    orders: ordersSlice,
    profile: profileSlice,
    agreements: agreementSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
