import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import proposalReducer from './proposalSlice';

export default configureStore({
  reducer: {
    clients: clientReducer,
    proposals: proposalReducer,
  },
});
