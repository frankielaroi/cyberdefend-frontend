import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import defendxReducer from './slices/defendxSlice';
import defendxPlusReducer from './slices/defendxPlusSlice';
import billingReducer from './slices/billingSlice';
import adminReducer from './slices/adminSlice';
import { apiSlice } from './api/apiSlice';
import { backupApi } from './api/backupApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    defendx: defendxReducer,
    defendxPlus: defendxPlusReducer,
    billing: billingReducer,
    admin: adminReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [backupApi.reducerPath]: backupApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in our non-serializable value checks
        ignoredActionPaths: ['payload.timestamp', 'meta.arg.timestamp'],
        ignoredPaths: ['items.createdAt'],
      },
    }).concat(apiSlice.middleware, backupApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
