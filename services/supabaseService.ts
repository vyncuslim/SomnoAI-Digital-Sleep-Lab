
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Authentication & Identity API
 */
export const authApi = {
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: `${window.location.origin}/#/dashboard` }
    }),
  
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),

  sendOTP: (email: string) => 
    supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/#/dashboard`
      }
    }),

  verifyOTP: (email: string, token: string) => 
    supabase.auth.verifyOtp({ email, token, type: 'email' }),

  signInWithGoogle: () => 
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#/dashboard`,
        // 关键修复：强制弹出 Google 账号选择器
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    }),

  resetPassword: (email: string) => 
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#/login'
    }),

  updatePassword: (password: string) => 
    supabase.auth.updateUser({ password }),

  signOut: () => supabase.auth.signOut()
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};

export const adminApi = {
  isAdmin: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    return data?.role === 'admin';
  },
  checkAdminStatus: async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    return data?.role === 'admin';
  },
  getUsers: async () => (await supabase.from('profiles').select('*')).data || [],
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSecurityEvents: async () => (await supabase.from('security_events').select('*')).data || [],
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

export const updateUserPassword = authApi.updatePassword;
export const signInWithEmailOTP = authApi.sendOTP;
export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await authApi.verifyOTP(email, token);
  if (error) throw error;
  return data.session;
};
export const sendPasswordReset = authApi.resetPassword;
export const signInWithGoogle = authApi.signInWithGoogle;
