import { useAuthStore } from '../store/useAuthStore';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const userData = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;

    if (!userData.isAuthenticated) {
      navigate('/login');
    }
  }, [userData?.isAuthenticated]);

  return <>{children}</>;
};

export { ProtectedLayout };
