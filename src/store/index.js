import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import proposalReducer from './proposalSlice';
import lastSyncReducer from './lastSyncSlice';
import invoiceReducer from './invoiceSlice';
import calendarReducer from './calendarSlice';

export default configureStore({
  reducer: {
    clients: clientReducer,
    proposals: proposalReducer,
    lastSync: lastSyncReducer,
    invoices: invoiceReducer,
    calendar: calendarReducer,
  },
});
