import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase, adminApi } from '../../services/supabaseService.ts';
import { AdminView } from '../../components/AdminView.tsx';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const protectAdmin = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.hash = '#/admin/login';
        return;
      }

      try {
        // Explicitly check role via profile to ensure current clearance
        const isAdmin = await adminApi.checkAdminStatus(session.user.id);
        
        if (!isAdmin) {
          console.error('Access denied: Unauthorized role detected.');
          window.location.hash = '#/';
          return;
        }

        setIsAuthorized(true);
      } catch (e) {
        console.error('Admin verification failed:', e);
        window.location.hash = '#/admin/login';
      } finally {
        setLoading(false);
      }
    };

    protectAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">Verifying Command Clearance...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-12 animate-in fade-in duration-1000">
      <AdminView onBack={() => window.location.hash = '#/'} />
      
      <div className="fixed top-8 right-8 z-[100]">
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full font-black text-[9px] uppercase tracking-widest border border-rose-500/20 transition-all active:scale-95"
        >
          Expel Admin Session
        </button>
      </div>
    </div>
  );
}