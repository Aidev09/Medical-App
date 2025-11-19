
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import medicationReducer from './slices/medicationSlice';
import healthReducer from './slices/healthSlice';
import settingsReducer from './slices/settingsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    medication: medicationReducer,
    health: healthReducer,
    settings: settingsReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
