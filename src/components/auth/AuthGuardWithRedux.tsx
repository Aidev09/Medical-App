
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuardWithRedux: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
};

export default AuthGuardWithRedux;
