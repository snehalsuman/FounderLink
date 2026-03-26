import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { unreadCount: 0 },
  reducers: {
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
    decrementUnread: (state) => { if (state.unreadCount > 0) state.unreadCount--; },
  },
});

export const { setUnreadCount, decrementUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
