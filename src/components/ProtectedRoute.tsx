import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/useLanguage';
import { Language } from '../services/i18n';
import { PinProtection } from './PinProtection';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  lang?: Language;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
  const { user, loading, isAdmin, isVerified } = useAuth();
  const { langPrefix } = useLanguage();
  const location = useLocation();
  console.log('ProtectedRoute rendered for path:', location.pathname, 'User:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01040a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`${langPrefix}/auth/login`} state={{ from: location }} replace />;
  }

  if (!isVerified) {
    return <Navigate to={`${langPrefix}/auth/verify-email`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={`${langPrefix}/dashboard`} replace />;
  }

  return (
    <PinProtection>
      {children}
    </PinProtection>
  );
};

