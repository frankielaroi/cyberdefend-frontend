import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import defendxReducer from './slices/defendxSlice';
import defendxPlusReducer from './slices/defendxPlusSlice';
import billingReducer from './slices/billingSlice';
import adminReducer from './slices/adminSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    defendx: defendxReducer,
    defendxPlus: defendxPlusReducer,
    billing: billingReducer,
    admin: adminReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
