export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  joinDate: string;
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  age: number;
  joinDate: string;
  notifications: {
    reminders: boolean;
    updates: boolean;
    tips: boolean;
  };
  theme: string;
  language: string;
  healthInfo: {
    bloodType: string;
    allergies: string;
    emergencyContact: string;
    patientDisease: string;
  };
  stats: {
    medicationAdherence: number;
    completedAppointments: number;
    healthRecords: number;
  };
}

export interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: () => void;
  danger?: boolean;
  color: string;
  bgColor: string;
  borderColor: string;
}
