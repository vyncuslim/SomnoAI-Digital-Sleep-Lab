import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { analyticsService } from '../services/analyticsService';
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
  isPinVerified: boolean;
  hasPinSet: boolean;
  verifyPin: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<{ recoveryKey: string }>;
  resetPinWithRecoveryKey: (recoveryKey: string, newPin: string) => Promise<boolean>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
  isPinVerified: false,
  hasPinSet: false,
  verifyPin: async () => false,
  setPin: async () => ({ recoveryKey: '' }),
  resetPinWithRecoveryKey: async () => false,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | undefined>();
  const [blockCode, setBlockCode] = useState<string | undefined>();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner' || profile?.is_super_owner;
  const isOwner = profile?.role === 'owner' || profile?.is_super_owner;
  const isSuperOwner = profile?.is_super_owner;
  const isVerified = user?.email_confirmed_at != null;
  const hasPinSet = !!profile?.pin_hash;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        analyticsService.trackVisit(session.user.id);
      } else {
        setLoading(false);
        analyticsService.trackVisit();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        if (event === 'SIGNED_IN') {
          analyticsService.trackVisit(session.user.id);
        }
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
    setIsPinVerified(false);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    if (!profile?.pin_hash) return false;
    // In a real app, we'd hash the pin and compare. 
    // For this demo, we'll assume the pin_hash is the pin itself or a simple hash.
    // We'll use a simple "hash" for demonstration.
    const hashedPin = btoa(pin); 
    if (profile.pin_hash === hashedPin) {
      setIsPinVerified(true);
      return true;
    }
    return false;
  };

  const setPin = async (pin: string): Promise<{ recoveryKey: string }> => {
    if (!user) throw new Error('User not authenticated');
    
    const hashedPin = btoa(pin);
    const recoveryKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        pin_hash: hashedPin,
        recovery_key: recoveryKey 
      })
      .eq('id', user.id);

    if (error) throw error;
    
    await fetchProfile(user.id);
    setIsPinVerified(true);
    return { recoveryKey };
  };

  const resetPinWithRecoveryKey = async (recoveryKey: string, newPin: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('recovery_key')
      .eq('id', user.id)
      .single();
      
    if (fetchError || data.recovery_key !== recoveryKey) return false;
    
    const hashedPin = btoa(newPin);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ pin_hash: hashedPin })
      .eq('id', user.id);
      
    if (updateError) return false;
    
    await fetchProfile(user.id);
    setIsPinVerified(true);
    return true;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, isBlocked, blockedReason, blockCode, 
      isAdmin, isOwner, isSuperOwner, isVerified, isPinVerified, hasPinSet,
      verifyPin, setPin, resetPinWithRecoveryKey,
      signIn, signOut, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
