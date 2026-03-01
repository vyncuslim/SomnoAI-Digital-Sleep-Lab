
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LockKeyhole, Home, ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { logAuditLog, supabase } from '../services/supabaseService.ts';
import { emailService } from '../services/emailService.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  level?: 'admin' | 'owner' | 'super';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, level }) => {
  const { loading, isAdmin, isOwner, isSuperOwner, profile } = useAuth();
  const attackLogged = useRef(false);

  // If no level is required, just checking for authentication (profile existence)
  // If level is required, check for specific roles
  const hasAccess = !level || 
    (level === 'admin' && (isAdmin || isOwner || isSuperOwner)) || 
    (level === 'owner' && (isOwner || isSuperOwner)) || 
    (level === 'super' && isSuperOwner);

  useEffect(() => {
    if (!loading && !hasAccess && profile && level && !attackLogged.current) {
      attackLogged.current = true;
      
      const trackAttack = async () => {
        try {
          // Log the security event
          await logAuditLog('SECURITY_BREACH', 
            `INTRUSION ATTEMPT: Node ${profile.email} attempted accessing level ${level.toUpperCase()}. Path: ${window.location.pathname}`, 
            'CRITICAL'
          );

          // Increment failed attempts for this user (using a custom RPC or direct update)
          const { data: currentProfile } = await supabase.from('profiles').select('failed_login_attempts').eq('id', profile.id).single();
          const newAttempts = (currentProfile?.failed_login_attempts || 0) + 1;
          
          if (newAttempts >= 3) {
            // Block user after 3 failed access attempts to restricted areas
            await supabase.from('profiles').update({ 
              is_blocked: true,
              failed_login_attempts: newAttempts 
            }).eq('id', profile.id);
            
            await supabase.rpc('block_user', { target_email: profile.email });
            await emailService.sendBlockNotification(profile.email, `Repeated unauthorized access to ${level.toUpperCase()} restricted areas`);
            
            // Force logout
            await supabase.auth.signOut();
            window.location.href = '/';
          } else {
            await supabase.from('profiles').update({ 
              failed_login_attempts: newAttempts 
            }).eq('id', profile.id);
          }
        } catch (e) {
          console.error("Security monitor failed:", e);
        }
      };

      trackAttack();
    }
  }, [loading, hasAccess, profile, level]);

  // 【物理隔离】封禁用户绝对禁止进入受保护区域
  if (profile?.is_blocked) {
     return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="w-24 h-24 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-600 mb-8 border border-rose-600/30 shadow-[0_0_50px_rgba(225,29,72,0.2)]">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic mb-4">Neural Hub Locked</h2>
        <p className="text-slate-500 text-xs italic max-w-xs mb-10 text-center uppercase tracking-widest leading-loose">Your node status: [BLOCKED].<br/>Connection to restricted sectors is prohibited.</p>
        <button onClick={() => window.location.href = '/'} className="px-10 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">RE-SYNC HUB</button>
      </div>
     );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 space-y-12">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse italic">Verifying Clearance...</p>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
