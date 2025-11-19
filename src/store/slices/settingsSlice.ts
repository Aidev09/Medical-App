
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notificationSettings: {
    reminders: boolean;
    updates: boolean;
    tips: boolean;
  };
  reminderSettings: {
    beforeTime: string;
    quietHoursStart: string;
    quietHoursEnd: string;
    enabledMethods: string[];
    phoneNumber?: string;
  };
}

const initialState: SettingsState = {
  theme: localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system',
  language: localStorage.getItem('language') || 'English',
  notificationSettings: {
    reminders: localStorage.getItem('notif_reminders') !== 'false',
    updates: localStorage.getItem('notif_updates') === 'true',
    tips: localStorage.getItem('notif_tips') !== 'false',
  },
  reminderSettings: {
    beforeTime: localStorage.getItem('reminder_beforeTime') || '0',
    quietHoursStart: localStorage.getItem('reminder_quietHoursStart') || '22:00',
    quietHoursEnd: localStorage.getItem('reminder_quietHoursEnd') || '07:00',
    enabledMethods: localStorage.getItem('reminder_methods') ? 
      JSON.parse(localStorage.getItem('reminder_methods') || '["push"]') : 
      ['push'],
    phoneNumber: localStorage.getItem('reminder_phoneNumber') || '',
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<SettingsState['notificationSettings']>>) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload };
      
      // Update localStorage
      if (action.payload.reminders !== undefined) {
        localStorage.setItem('notif_reminders', action.payload.reminders.toString());
      }
      if (action.payload.updates !== undefined) {
        localStorage.setItem('notif_updates', action.payload.updates.toString());
      }
      if (action.payload.tips !== undefined) {
        localStorage.setItem('notif_tips', action.payload.tips.toString());
      }
    },
    updateReminderSettings: (state, action: PayloadAction<Partial<SettingsState['reminderSettings']>>) => {
      state.reminderSettings = { ...state.reminderSettings, ...action.payload };
      
      // Update localStorage
      if (action.payload.beforeTime) {
        localStorage.setItem('reminder_beforeTime', action.payload.beforeTime);
      }
      if (action.payload.quietHoursStart) {
        localStorage.setItem('reminder_quietHoursStart', action.payload.quietHoursStart);
      }
      if (action.payload.quietHoursEnd) {
        localStorage.setItem('reminder_quietHoursEnd', action.payload.quietHoursEnd);
      }
      if (action.payload.enabledMethods) {
        localStorage.setItem('reminder_methods', JSON.stringify(action.payload.enabledMethods));
      }
      if (action.payload.phoneNumber !== undefined) {
        localStorage.setItem('reminder_phoneNumber', action.payload.phoneNumber);
      }
    }
  },
});

export const { 
  setTheme, 
  setLanguage, 
  updateNotificationSettings, 
  updateReminderSettings 
} = settingsSlice.actions;

export default settingsSlice.reducer;
