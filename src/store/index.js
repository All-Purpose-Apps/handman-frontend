import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import proposalReducer from './proposalSlice';
import lastSyncReducer from './lastSyncSlice';
import invoiceReducer from './invoiceSlice';
import notificationReducer from './notificationSlice';
import productReducer from './productSlice';
import materialsReducer from './materialsSlice';
import filesReducer from './filesSlice';
import userReducer from './userSlice';
import calendarReducer from './calendarSlice';

export default configureStore({
  reducer: {
    clients: clientReducer,
    proposals: proposalReducer,
    lastSync: lastSyncReducer,
    invoices: invoiceReducer,
    notifications: notificationReducer,
    products: productReducer,
    materials: materialsReducer,
    files: filesReducer,
    user: userReducer,
    calendar: calendarReducer,
  },
});
