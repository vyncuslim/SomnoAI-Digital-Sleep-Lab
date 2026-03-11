import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  profile: any;
  loading: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockCode?: string;
  isAdmin: boolean;
  isOwner: boolean;
  isSuperOwner: boolean;
  isVerified: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isBlocked: false,
  isAdmin: false,
  isOwner: false,
  isSuperOwner: false,
  isVerified: false,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | undefined>();
  const [blockCode, setBlockCode] = useState<string | undefined>();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner' || profile?.is_super_owner;
  const isOwner = profile?.role === 'owner' || profile?.is_super_owner;
  const isSuperOwner = profile?.is_super_owner;
  const isVerified = user?.email_confirmed_at != null;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
      if (data?.is_blocked) {
        setIsBlocked(true);
        setBlockedReason(data.blocked_reason);
        setBlockCode(data.block_code);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string) => {
    // Placeholder sign in
    console.log('Sign in with', email);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, isBlocked, blockedReason, blockCode, 
      isAdmin, isOwner, isSuperOwner, isVerified, signIn, signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
