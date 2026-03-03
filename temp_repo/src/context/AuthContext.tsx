import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService.ts';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  isBlocked: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isSuperOwner: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner' || profile?.is_super_owner;
  const isOwner = profile?.role === 'owner' || profile?.is_super_owner;
  const isSuperOwner = profile?.is_super_owner;

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    // Placeholder sign in
    console.log('Sign in with', email);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isBlocked, isAdmin, isOwner, isSuperOwner, signIn, signOut }}>
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
