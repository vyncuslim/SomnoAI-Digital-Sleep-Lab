
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';

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

  // 关键检测：是否处于 OAuth 回跳过程中
  const hasAuthParams = 
    window.location.hash.includes('access_token=') || 
    window.location.hash.includes('id_token=') || 
    window.location.search.includes('code=');

  if (hasAuthParams) authLockActive.current = true;

  const fetchProfile = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();

      if (!user) {
        // 如果 OAuth 锁激活中，暂不取消 loading 状态
        if (!authLockActive.current) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.rpc('get_my_detailed_profile');
      
      if (error || !data || data.length === 0) {
        const { data: fallbackData } = await supabase
          .from("profiles")
          .select("id, email, role, is_super_owner, is_blocked, full_name")
          .eq("id", user.id)
          .single();
        
        if (fallbackData) setProfile(fallbackData as Profile);
      } else {
        setProfile(data[0] as Profile);
      }
      
      authLockActive.current = false; // 获取到 profile 后释放锁
    } catch (err) {
      console.warn("AuthContext: Telemetry sync error.", err);
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    // 初始检测
    fetchProfile();

    // 监听认证状态变更
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string, session: any) => {
      console.debug(`[Auth Engine] EVENT: ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        authLockActive.current = false;
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        authLockActive.current = false;
        setProfile(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // 如果没有 Session 且没有 OAuth 参数，才允许结束加载状态
        if (!session && !hasAuthParams) {
          setLoading(false);
        }
      }
    });

    // 冗余保险：如果发生 OAuth 错误或死锁，3秒后强制释放 UI
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
