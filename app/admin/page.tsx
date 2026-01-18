
import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase, adminApi } from '../../services/supabaseService.ts';
import { AdminView } from '../../components/AdminView.tsx';

/**
 * Enhanced Admin Dashboard with protection and error boundaries.
 */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const protectAdmin = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.warn("[Admin Guard] No active session identified.");
          if (isMounted) window.location.hash = '#/admin/login';
          return;
        }

        // Verify admin status with enhanced RPC/direct logic
        const isAdmin = await adminApi.checkAdminStatus(session.user.id);
        
        if (!isMounted) return;

        if (!isAdmin) {
          console.error('[Admin Guard] Access denied: Subject lacks clearance.');
          setError("Clearance Denied: Your account is verified but does not hold 'admin' level privileges.");
          setIsAuthorized(false);
          // Redirect after short delay to allow error reading
          setTimeout(() => {
            if (isMounted) window.location.hash = '#/';
          }, 4000);
          return;
        }

        setIsAuthorized(true);
      } catch (e: any) {
        console.error('[Admin Guard] Verification sequence failed:', e);
        if (isMounted) setError(e.message || "Registry unreachable. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    protectAdmin();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse italic">
          Verifying Command Clearance...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <ShieldAlert size={64} className="text-rose-600 mb-4" />
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Security Block Active</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto italic leading-relaxed">{error}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95"
          >
            Retry Handshake
          </button>
          <button 
            onClick={() => window.location.hash = '#/'}
            className="px-8 py-4 bg-white/5 text-slate-400 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-white"
          >
            Exit Terminal
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-12 animate-in fade-in duration-1000 relative">
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
