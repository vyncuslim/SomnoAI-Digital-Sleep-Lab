import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { analyticsService } from '../services/analyticsService';
import { supabase, logSecurityEvent, logAuditLog } from '../services/supabaseService';

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
  isPinBlocked: boolean;
  hasPinSet: boolean;
  setIsPinVerified: (verified: boolean) => void;
  verifyPin: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<{ recoveryKey: string }>;
  resetPinWithRecoveryKey: (recoveryKey: string, newPin: string) => Promise<boolean>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
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
  isPinBlocked: false,
  hasPinSet: false,
  setIsPinVerified: () => {},
  verifyPin: async () => false,
  setPin: async () => ({ recoveryKey: '' }),
  resetPinWithRecoveryKey: async () => false,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  resendVerificationEmail: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isPinBlocked, setIsPinBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | undefined>();
  const [blockCode, setBlockCode] = useState<string | undefined>();

  const MAX_PIN_ATTEMPTS = 5;

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner' || profile?.is_super_owner;
  const isOwner = profile?.role === 'owner' || profile?.is_super_owner;
  const isSuperOwner = profile?.is_super_owner;
  const isVerified = user?.email_confirmed_at != null;
  const hasPinSet = !!profile?.pin_hash;

  useEffect(() => {
    if (profile?.pin_blocked_until) {
      const blockedUntil = new Date(profile.pin_blocked_until);
      if (blockedUntil > new Date()) {
        setIsPinBlocked(true);
      } else {
        setIsPinBlocked(false);
      }
    } else if (profile?.failed_pin_attempts >= MAX_PIN_ATTEMPTS) {
      setIsPinBlocked(true);
    } else {
      setIsPinBlocked(false);
    }
  }, [profile]);

  const hashPin = async (pin: string): Promise<string> => {
    const msgUint8 = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

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
    if (isPinBlocked) return false;
    if (!profile?.pin_hash) return false;
    
    const hashedPin = await hashPin(pin); 
    if (profile.pin_hash === hashedPin) {
      setIsPinVerified(true);
      
      // Reset failed attempts on success
      await supabase
        .from('profiles')
        .update({ 
          failed_pin_attempts: 0,
          pin_blocked_until: null
        })
        .eq('id', user?.id);

      await logSecurityEvent(user?.id || null, 'PIN_VERIFIED', { success: true });
      await refreshProfile();
      return true;
    } else {
      const newAttempts = (profile?.failed_pin_attempts || 0) + 1;
      
      const updates: any = { failed_pin_attempts: newAttempts };
      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        // Block for 1 hour
        const blockedUntil = new Date();
        blockedUntil.setHours(blockedUntil.getHours() + 1);
        updates.pin_blocked_until = blockedUntil.toISOString();
      }

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
      
      await logSecurityEvent(user?.id || null, 'PIN_VERIFICATION_FAILED', { 
        attempt_number: newAttempts,
        max_attempts: MAX_PIN_ATTEMPTS
      });

      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        await logSecurityEvent(user?.id || null, 'PIN_BLOCKED', { 
          reason: 'Too many failed attempts'
        });
      }
      
      await refreshProfile();
      return false;
    }
  };

  const setPin = async (pin: string): Promise<{ recoveryKey: string }> => {
    if (!user) throw new Error('User not authenticated');
    
    const hashedPin = await hashPin(pin);
    const recoveryKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        pin_hash: hashedPin,
        recovery_key: recoveryKey,
        failed_pin_attempts: 0,
        pin_blocked_until: null
      })
      .eq('id', user.id);

    if (error) throw error;
    
    await fetchProfile(user.id);
    setIsPinBlocked(false);
    await logAuditLog(user.id, 'SET_PIN', { has_recovery_key: true });
    return { recoveryKey };
  };

  const resetPinWithRecoveryKey = async (recoveryKey: string, newPin: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('recovery_key')
      .eq('id', user.id)
      .single();
      
    if (fetchError || data.recovery_key !== recoveryKey) {
      await logSecurityEvent(user.id, 'PIN_RECOVERY_FAILED', { reason: 'Invalid recovery key' });
      return false;
    }
    
    const hashedPin = await hashPin(newPin);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        pin_hash: hashedPin,
        failed_pin_attempts: 0,
        pin_blocked_until: null
      })
      .eq('id', user.id);
      
    if (updateError) return false;
    
    await fetchProfile(user.id);
    setIsPinBlocked(false);
    setIsPinVerified(true);
    await logAuditLog(user.id, 'RESET_PIN_WITH_RECOVERY_KEY', { success: true });
    return true;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, isBlocked, blockedReason, blockCode, 
      isAdmin, isOwner, isSuperOwner, isVerified, isPinVerified, isPinBlocked, hasPinSet,
      setIsPinVerified, verifyPin, setPin, resetPinWithRecoveryKey,
      signIn, signOut, refreshProfile, resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
