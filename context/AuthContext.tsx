import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseService.ts';
import { logAuditLog } from '../services/supabaseService.ts';
import { Profile } from '../types.ts';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isEditor: boolean;
  isSuperOwner: boolean;
  isBlocked: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  isAdmin: false,
  isOwner: false,
  isEditor: false,
  isSuperOwner: false,
  isBlocked: false,
  refresh: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const isSyncing = useRef(false);
  const lastLoggedSessionId = useRef<string | null>(null);

  const fetchProfile = useCallback(async (isFreshLogin: boolean = false) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    // 加急超时判定：3.5秒内必须释放首页加载锁定
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("AuthContext: Handshake timeout. Release load lock.");
        setLoading(false);
        isSyncing.current = false;
      }
    }, 3500);
    
    try {
      const { data: { session }, error: sessionError } = await (supabase.auth as any).getSession();

      if (sessionError || !session || !session.user) {
        setProfile(null);
        setLoading(false);
        clearTimeout(timeoutId);
        isSyncing.current = false;
        return;
      }

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
        
        if (fallbackData) {
          currentProfile = fallbackData as Profile;
        } else {
          // If profile doesn't exist in DB yet (e.g. trigger delay or legacy user), create a temporary one
          currentProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'user',
            is_super_owner: false,
            is_blocked: false,
            full_name: session.user.user_metadata?.full_name || ''
          } as Profile;
          
          // Try to insert it to fix the missing profile
          supabase.from('profiles').insert([currentProfile]).then();
        }
      } else {
        currentProfile = data[0] as Profile;
      }

      if (currentProfile?.is_blocked) {
        setIsBlocked(true);
        await supabase.auth.signOut();
        setProfile(null);
        setLoading(false);
        isSyncing.current = false;
        return;
      }
      setIsBlocked(false);
      
      setProfile(currentProfile);

      if (shouldLog && currentProfile) {
        lastLoggedSessionId.current = currentSessionId;
        const logMsg = `[ACCESS_GRANTED] Subject: ${currentProfile.email}`;
        logAuditLog('USER_LOGIN', logMsg, 'INFO');
      }
    } catch (err) {
      console.error("AuthContext: Terminal handshake crashed.");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      isSyncing.current = false;
    }
  }, [loading]);

  useEffect(() => {
    fetchProfile();
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        fetchProfile(true);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
        setIsBlocked(false);
        lastLoggedSessionId.current = null;
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const value = {
    profile, loading, isBlocked,
    isAdmin: profile?.role === "admin" || profile?.role === "owner" || profile?.is_super_owner === true,
    isOwner: profile?.role === "owner" || profile?.is_super_owner === true,
    isEditor: profile?.role === "editor" || profile?.role === "admin" || profile?.role === "owner" || profile?.is_super_owner === true,
    isSuperOwner: profile?.is_super_owner === true,
    refresh: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);