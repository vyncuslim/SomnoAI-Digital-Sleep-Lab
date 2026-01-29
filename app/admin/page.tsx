
import React from 'react';
import { AdminView } from '../../components/AdminView.tsx';

export default function AdminDashboard() {
  // Access is already verified by the ProtectedRoute in App.tsx
  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-12 animate-in fade-in duration-1000">
      <AdminView onBack={() => window.location.hash = '#/'} />
    </div>
  );
}
