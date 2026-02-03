import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { logAuditLog } from '../services/supabaseService.ts';

export type UserRole = "user" | "editor" | "admin" | "owner";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  is_super_owner: boolean;
  is_blocked: boolean;
  full_name: string | null;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isEditor: boolean;
  isSuperOwner: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  isAdmin: false,
  isOwner: false,
  isEditor: false,
  isSuperOwner: false,
  refresh: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isSyncing = useRef(false);
  const lastLoggedSessionId = useRef<string | null>(null);

  const fetchProfile = useCallback(async (isFreshLogin: boolean = false) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    try {
      const { data: { session } } = await (supabase.auth as any).getSession();

      if (!session || !session.user) {
        setProfile(null);
        setLoading(false);
        isSyncing.current = false;
        return;
      }

      // Unique session tracker to prevent alert loops on refreshes
      const currentSessionId = session.access_token.slice(-12);
      const shouldLog = isFreshLogin && lastLoggedSessionId.current !== currentSessionId;

      const { data, error } = await supabase.rpc('get_my_detailed_profile');
      let currentProfile: Profile | null = null;
      
      if (error || !data || data.length === 0) {
        const { data: fallbackData } = await supabase
          .from("profiles")
          .select("id, email, role, is_super_owner, is_blocked, full_name")
          .eq("id", session.user.id)
          .single();
        
        if (fallbackData) currentProfile = fallbackData as Profile;
      } else {
        currentProfile = data[0] as Profile;
      }
      
      setProfile(currentProfile);

      // AUTOMATED ADMIN NOTIFICATION PROTOCOL
      if (shouldLog && currentProfile) {
        lastLoggedSessionId.current = currentSessionId;
        const identityType = currentProfile.is_super_owner ? 'SUPER_OWNER' : currentProfile.role.toUpperCase();
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Node';
        
        const logMsg = `[ACCESS_GRANTED]\nSubject: ${currentProfile.email}\nIdentity: ${currentProfile.full_name || 'N/A'}\nClearance: ${identityType}\nDevice: ${userAgent}`;
        
        // This call triggers both Email and Telegram notifications via logAuditLog internal logic
        logAuditLog('USER_LOGIN', logMsg, 'INFO');
      }
    } catch (err) {
      console.warn("AuthContext: Terminal handshake delayed.");
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        fetchProfile(true);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
        lastLoggedSessionId.current = null;
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const value = {
    profile, loading,
    isAdmin: profile?.role === "admin" || profile?.role === "owner" || profile?.is_super_owner === true,
    isOwner: profile?.role === "owner" || profile?.is_super_owner === true,
    isEditor: profile?.role === "editor" || profile?.role === "admin" || profile?.role === "owner" || profile?.is_super_owner === true,
    isSuperOwner: profile?.is_super_owner === true,
    refresh: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);