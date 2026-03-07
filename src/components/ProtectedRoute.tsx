import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

export const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean, lang: Language }> = ({ children, adminOnly, lang }) => {
  const { user, loading, isAdmin } = useAuth();
  const langPrefix = lang === 'zh' ? '/cn' : '/en';

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to={`${langPrefix}/auth/login`} />;
  
  if (adminOnly && !isAdmin) {
    return <Navigate to={`${langPrefix}/dashboard`} />;
  }

  return <>{children}</>;
};
