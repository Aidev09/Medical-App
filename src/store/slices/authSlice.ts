import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  joinDate: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: localStorage.getItem('userSession') ? true : false,
  userProfile: {
    id: '1',
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || '',
    phone: localStorage.getItem('userPhone') || '',
    profileImage: localStorage.getItem('profileImage') || null,
    joinDate: localStorage.getItem('joinDate') || 'May 2023',
  },
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.isAuthenticated = true;
      state.userProfile = action.payload;
      state.isLoading = false;
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('userSession', 'true');
      localStorage.setItem('userName', action.payload.name);
      localStorage.setItem('userEmail', action.payload.email);
      localStorage.setItem('userPhone', action.payload.phone);
      if (action.payload.profileImage) {
        localStorage.setItem('profileImage', action.payload.profileImage);
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userProfile = null;
      
      // Clear from localStorage
      localStorage.removeItem('userSession');
      // We might want to keep some user preferences even after logout
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.userProfile) {
        state.userProfile = { ...state.userProfile, ...action.payload };
        
        // Update localStorage
        if (action.payload.name) localStorage.setItem('userName', action.payload.name);
        if (action.payload.email) localStorage.setItem('userEmail', action.payload.email);
        if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone);
        if (action.payload.profileImage) localStorage.setItem('profileImage', action.payload.profileImage);
      }
    }
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateProfile 
} = authSlice.actions;

export default authSlice.reducer;
