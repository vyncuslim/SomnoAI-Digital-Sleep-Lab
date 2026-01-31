
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';

export type UserRole = "user" | "admin" | "owner";

export interface Profile {
  id: string;
  // Added email property to the Profile interface to resolve access errors.
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
  const initialized = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      // Defensive Handshake: 6-second timeout to prevent loading-screen lock
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("HANDSHAKE_TIMEOUT")), 6000)
      );

      const authPromise = supabase.auth.getUser();
      const result: any = await Promise.race([authPromise, timeoutPromise]);
      const user = result?.data?.user;

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Fetch precise clearance levels
      const { data, error } = await supabase.rpc('get_my_detailed_profile');
      
      if (error || !data || data.length === 0) {
        // Fixed: Added email to the selection query to ensure the Profile object is fully populated.
        const { data: fallbackData } = await supabase
          .from("profiles")
          .select("id, email, role, is_super_owner, is_blocked, full_name")
          .eq("id", user.id)
          .single();
        
        setProfile(fallbackData as Profile);
      } else {
        setProfile(data[0] as Profile);
      }
    } catch (err) {
      console.warn("AuthContext: Protocol Latency or Abort detected", err);
    } finally {
      setLoading(false);
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

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
