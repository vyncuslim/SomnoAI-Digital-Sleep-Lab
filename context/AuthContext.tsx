
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';

export type UserRole = "user" | "admin" | "owner";

export interface Profile {
  id: string;
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
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  isAdmin: false,
  isOwner: false,
  isSuperOwner: false,
  refreshProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase.rpc('get_my_detailed_profile');
      
      if (error || !data || data.length === 0) {
        // Fallback to basic query if RPC fails
        const { data: basicData } = await supabase
          .from("profiles")
          .select("id, role, is_super_owner, is_blocked, full_name")
          .eq("id", user.id)
          .single();
        
        setProfile(basicData as Profile);
      } else {
        setProfile(data[0] as Profile);
      }
    } catch (err) {
      console.error("AuthContext: Profile fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') fetchProfile();
      if (event === 'SIGNED_OUT') {
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
    refreshProfile: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
