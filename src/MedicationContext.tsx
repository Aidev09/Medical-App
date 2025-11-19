import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  amount: string;
  amount_type: string;
  frequency: string;
  days: string[];
  time: string;
  end_date: string | null;
  color: string;
  taken: boolean;
}

interface MedicationContextType {
  medications: Medication[];
  addMedication: (medication: Medication) => void;
  deleteMedication: (id: string) => void;
  fetchMedications: () => void;
  toggleTaken: (id: string) => void;
  clearMedications: () => void; // Add this function
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);

  const fetchMedications = () => {
    const userId = localStorage.getItem('userId');
    if (!userId || userId === "null") {
      // Optionally: handle not logged in
      setMedications([]);
      return;
    }
    fetch(`http://127.0.0.1:8000/medications/?owner_id=${userId}`)
      .then(res => res.json())
      .then(data => setMedications(Array.isArray(data) ? data : []));
  };

  const addMedication = (medication: Medication) => {
    setMedications(prev => [...prev, medication]);
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const toggleTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id
          ? { ...med, taken: !med.taken }
          : med
      )
    );
  };

  const clearMedications = () => {
    setMedications([]);
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  // Refetch medications when userId changes
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId && userId !== 'null') {
      fetchMedications();
    } else {
      setMedications([]);
    }
  }, [localStorage.getItem('userId')]);

  return (
    <MedicationContext.Provider value={{ medications, addMedication, deleteMedication, fetchMedications, toggleTaken, clearMedications }}>
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedications = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedications must be used within a MedicationProvider');
  }
  return context;
}; 