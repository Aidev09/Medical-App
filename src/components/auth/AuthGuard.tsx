
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// In a real app, this would come from a context or state management
const isAuthenticated = () => {
  // For demo purposes, we'll always return true
  // In a real app, you would check localStorage or a token
  return true;
};

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) {
      // Only show the welcome toast when coming from auth page
      if (location.state?.from === '/auth') {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in."
        });
      }
    }
  }, [location]);

  if (!isAuthenticated()) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
