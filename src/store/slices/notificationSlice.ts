
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'reminder' | 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

// Load from localStorage or use empty array
const savedNotifications = localStorage.getItem('notifications');
const initialNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];

const initialState: NotificationState = {
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((notif: Notification) => !notif.read).length,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...action.payload,
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(notif => notif.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notificationToDelete = state.notifications.find(notif => notif.id === action.payload);
      if (notificationToDelete && !notificationToDelete.read) {
        state.unreadCount -= 1;
      }
      
      state.notifications = state.notifications.filter(notif => notif.id !== action.payload);
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    }
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;
