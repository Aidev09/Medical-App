
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes: string;
  color: string;
  createdAt: string;
}

interface MedicationState {
  medications: Medication[];
  isLoading: boolean;
  error: string | null;
}

// Load medications from localStorage or use empty array
const savedMedications = localStorage.getItem('medications');
const initialMedications = savedMedications ? JSON.parse(savedMedications) : [];

const initialState: MedicationState = {
  medications: initialMedications,
  isLoading: false,
  error: null,
};

const medicationSlice = createSlice({
  name: 'medication',
  initialState,
  reducers: {
    fetchMedicationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMedicationsSuccess: (state, action: PayloadAction<Medication[]>) => {
      state.medications = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchMedicationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addMedication: (state, action: PayloadAction<Medication>) => {
      state.medications.push(action.payload);
      localStorage.setItem('medications', JSON.stringify(state.medications));
    },
    updateMedication: (state, action: PayloadAction<Medication>) => {
      const index = state.medications.findIndex(med => med.id === action.payload.id);
      if (index !== -1) {
        state.medications[index] = action.payload;
        localStorage.setItem('medications', JSON.stringify(state.medications));
      }
    },
    deleteMedication: (state, action: PayloadAction<string>) => {
      state.medications = state.medications.filter(med => med.id !== action.payload);
      localStorage.setItem('medications', JSON.stringify(state.medications));
    }
  },
});

export const { 
  fetchMedicationsStart,
  fetchMedicationsSuccess,
  fetchMedicationsFailure,
  addMedication,
  updateMedication,
  deleteMedication 
} = medicationSlice.actions;

export default medicationSlice.reducer;
