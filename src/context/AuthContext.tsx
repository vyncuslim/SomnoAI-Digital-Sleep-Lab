import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  isAdmin: boolean;
  isOwner: boolean;
  isSuperOwner: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | undefined>(undefined);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner' || profile?.is_super_owner || false;
  const isOwner = profile?.role === 'owner' || profile?.is_super_owner || false;
  const isSuperOwner = profile?.is_super_owner || false;

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile(data);
        setIsBlocked(data.is_blocked || false);
        setBlockedReason(data.blocked_reason);
      } else {
        // Fallback profile if not found in DB yet
        setProfile({
          id: userId,
          email: email || '',
          role: 'user'
        });
        setIsBlocked(false);
        setBlockedReason(undefined);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    }).catch((err: any) => {
      console.error('Error getting session:', err);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setIsBlocked(false);
        setBlockedReason(undefined);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    // Mock signIn for compatibility if needed, but we'll use Supabase directly in Auth.tsx
    console.log('signIn called', { email });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isBlocked, blockedReason, isAdmin, isOwner, isSuperOwner, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
