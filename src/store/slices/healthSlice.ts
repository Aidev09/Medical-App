import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HealthRecord {
  id: string;
  date: Date | string;
  medicationName: string;
  notes: string;
  dosage?: string;
  time?: string;
}

export interface HealthInfo {
  bloodType: string;
  allergies: string;
  emergencyContact: string;
}

export interface HealthStats {
  medicationAdherence: number;
  completedAppointments: number;
  healthRecords: number;
}

interface HealthState {
  records: HealthRecord[];
  healthInfo: HealthInfo;
  stats: HealthStats;
  isLoading: boolean;
  error: string | null;
}

// Load from localStorage or use default values
const savedRecords = localStorage.getItem('healthRecords');
const initialRecords = savedRecords ? JSON.parse(savedRecords) : [];

const initialState: HealthState = {
  records: initialRecords,
  healthInfo: {
    bloodType: localStorage.getItem('bloodType') || 'O+',
    allergies: localStorage.getItem('allergies') || 'None',
    emergencyContact: localStorage.getItem('emergencyContact') || ''
  },
  stats: {
    medicationAdherence: 92,
    completedAppointments: 8,
    healthRecords: initialRecords.length
  },
  isLoading: false,
  error: null,
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    fetchHealthRecordsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchHealthRecordsSuccess: (state, action: PayloadAction<HealthRecord[]>) => {
      state.records = action.payload;
      state.stats.healthRecords = action.payload.length;
      state.isLoading = false;
      state.error = null;
    },
    fetchHealthRecordsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addHealthRecord: (state, action: PayloadAction<HealthRecord>) => {
      state.records.unshift(action.payload);
      state.stats.healthRecords = state.records.length;
      localStorage.setItem('healthRecords', JSON.stringify(state.records));
    },
    updateHealthRecord: (state, action: PayloadAction<HealthRecord>) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
        localStorage.setItem('healthRecords', JSON.stringify(state.records));
      }
    },
    deleteHealthRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(record => record.id !== action.payload);
      state.stats.healthRecords = state.records.length;
      localStorage.setItem('healthRecords', JSON.stringify(state.records));
    },
    updateHealthInfo: (state, action: PayloadAction<Partial<HealthInfo>>) => {
      state.healthInfo = { ...state.healthInfo, ...action.payload };
      
      // Update localStorage
      if (action.payload.bloodType) localStorage.setItem('bloodType', action.payload.bloodType);
      if (action.payload.allergies) localStorage.setItem('allergies', action.payload.allergies);
      if (action.payload.emergencyContact) localStorage.setItem('emergencyContact', action.payload.emergencyContact);
    },
    updateHealthStats: (state, action: PayloadAction<Partial<HealthStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    }
  },
});

export const { 
  fetchHealthRecordsStart,
  fetchHealthRecordsSuccess,
  fetchHealthRecordsFailure,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  updateHealthInfo,
  updateHealthStats
} = healthSlice.actions;

export default healthSlice.reducer;
