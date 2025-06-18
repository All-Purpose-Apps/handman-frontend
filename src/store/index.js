import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import proposalReducer from './proposalSlice';
import lastSyncReducer from './lastSyncSlice';
import invoiceReducer from './invoiceSlice';
import notificationReducer from './notificationSlice';
import materialsReducer from './materialsSlice';
import filesReducer from './filesSlice';
import calendarReducer from './calendarSlice';

export default configureStore({
  reducer: {
    clients: clientReducer,
    proposals: proposalReducer,
    lastSync: lastSyncReducer,
    invoices: invoiceReducer,
    notifications: notificationReducer,
    materials: materialsReducer,
    files: filesReducer,
    calendar: calendarReducer,
  },
});
