
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { logAuditLog } from '../services/supabaseService.ts';

export type UserRole = "user" | "admin" | "owner";

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
  isSuperOwner: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  isAdmin: false,
  isOwner: false,
  isSuperOwner: false,
  refresh: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isSyncing = useRef(false);
  const authLockActive = useRef(false);
  const lastEventLogged = useRef<string | null>(null);

  const hasAuthParams = 
    window.location.hash.includes('access_token=') || 
    window.location.hash.includes('id_token=') || 
    window.location.search.includes('code=');

  if (hasAuthParams) authLockActive.current = true;

  const fetchProfile = useCallback(async (isFreshLogin: boolean = false) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();

      if (!user) {
        if (!authLockActive.current) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      // Interrogate detailed profile registry
      const { data, error } = await supabase.rpc('get_my_detailed_profile');
      let currentProfile: Profile | null = null;
      
      if (error || !data || data.length === 0) {
        const { data: fallbackData } = await supabase
          .from("profiles")
          .select("id, email, role, is_super_owner, is_blocked, full_name")
          .eq("id", user.id)
          .single();
        
        if (fallbackData) currentProfile = fallbackData as Profile;
      } else {
        currentProfile = data[0] as Profile;
      }
      
      setProfile(currentProfile);

      // CRITICAL: TRIGGER LOGIN NOTIFICATION
      if (isFreshLogin && currentProfile) {
        // Prevent duplicate logs for the same session refresh
        const eventKey = `login_${currentProfile.id}_${new Date().getMinutes()}`;
        if (lastEventLogged.current !== eventKey) {
           lastEventLogged.current = eventKey;
           // logAuditLog with 'USER_LOGIN' will automatically notify Telegram
           await logAuditLog('USER_LOGIN', `Access protocol verified for: ${currentProfile.email}`, 'INFO');
        }
      }
      
      authLockActive.current = false;
    } catch (err) {
      console.warn("AuthContext: Pulse interrupted.", err);
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string, session: any) => {
      console.debug(`[Auth Engine] EVENT: ${event}`);
      
      if (event === 'SIGNED_IN') {
        authLockActive.current = false;
        fetchProfile(true); // Signal this as a fresh login
      } else if (event === 'TOKEN_REFRESHED') {
        fetchProfile(false);
      } else if (event === 'SIGNED_OUT') {
        authLockActive.current = false;
        setProfile(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        if (!session && !hasAuthParams) {
          setLoading(false);
        }
      }
    });

    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [fetchProfile, hasAuthParams, loading]);

  const value = {
    profile,
    loading,
    isAdmin: profile?.role === "admin" || profile?.role === "owner" || profile?.is_super_owner === true,
    isOwner: profile?.role === "owner" || profile?.is_super_owner === true,
    isSuperOwner: profile?.is_super_owner === true,
    refresh: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
