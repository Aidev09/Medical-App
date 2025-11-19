import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { UserData } from '@/types/profile';

export const useProfileData = () => {
  const { resolvedTheme } = useTheme();
  
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('userName') || "John Doe";
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem('profileImage') || null
  );
  
  const [userData, setUserData] = useState<UserData>({
    name: username,
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    age: 0, // Ensure age is always present
    joinDate: "March 2023",
    notifications: {
      reminders: true,
      updates: false,
      tips: true
    },
    theme: resolvedTheme || 'light',
    language: "English",
    healthInfo: {
      bloodType: "O+",
      allergies: "None",
      emergencyContact: "Jane Doe (555-123-4567)",
      patientDisease: ""
    },
    stats: {
      medicationAdherence: 92,
      completedAppointments: 8,
      healthRecords: 12
    }
  });

  useEffect(() => {
    setUserData(prev => ({
      ...prev,
      name: username,
      theme: resolvedTheme || 'light'
    }));
  }, [username, resolvedTheme]);

  const updateProfileImage = (imageDataUrl: string) => {
    setProfileImage(imageDataUrl);
    localStorage.setItem('profileImage', imageDataUrl);
  };

  const updateUsername = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('userName', newUsername);
  };

  return {
    username,
    profileImage,
    userData,
    setUserData,
    updateProfileImage,
    updateUsername
  };
};
