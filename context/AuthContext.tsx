
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

  // 关键检测：是否处于 OAuth 回跳过程中
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

      // 如果检测到是新鲜登录（OAuth 回跳或 SIGNED_IN 事件），手动记录一次审计触发告警
      if (isFreshLogin && currentProfile) {
        // 防止页面热重载导致的重复记录
        const eventKey = `login_${currentProfile.id}_${new Date().getMinutes()}`;
        if (lastEventLogged.current !== eventKey) {
           lastEventLogged.current = eventKey;
           logAuditLog('USER_LOGIN', `Identity detected via Auth Guard: ${currentProfile.email}`, 'INFO');
        }
      }
      
      authLockActive.current = false;
    } catch (err) {
      console.warn("AuthContext: Telemetry sync error.", err);
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string, session: any) => {
      console.debug(`[Auth Engine] EVENT: ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        authLockActive.current = false;
        fetchProfile(event === 'SIGNED_IN'); // SIGNED_IN 标记为新鲜登录
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
      if (loading) {
        console.warn("Auth Engine: Handshake timeout, forcing UI release.");
        setLoading(false);
      }
    }, 4500);

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
