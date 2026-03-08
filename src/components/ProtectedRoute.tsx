import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

export const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean, lang: Language }> = ({ children, adminOnly, lang }) => {
  const { user, loading, isAdmin } = useAuth();
  const langPrefix = lang === 'zh' ? '/cn' : '/en';

  if (loading) return (
    <div className="min-h-screen bg-[#01040a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Neural Handshake in Progress...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to={`${langPrefix}/auth/login`} />;
  
  if (adminOnly && !isAdmin) {
    return <Navigate to={`${langPrefix}/dashboard`} />;
  }

  return <>{children}</>;
};
