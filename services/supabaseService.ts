import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'somno_auth_session'
  }
});

export const authApi = {
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password,
      options: { emailRedirectTo: `${window.location.origin}` }
    }),
  
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    }),

  sendOTP: (email: string) => 
    supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { 
        emailRedirectTo: `${window.location.origin}`,
        shouldCreateUser: false 
      }
    }),

  verifyOTP: async (email: string, token: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return await supabase.auth.verifyOtp({ 
      email: normalizedEmail, 
      token, 
      type: 'email' 
    });
  },

  signInWithGoogle: () => 
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' }
      }
    }),

  resetPassword: (email: string) => 
    supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin + '/#/login'
    }),

  updatePassword: (password: string) => 
    supabase.auth.updateUser({ password }),

  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string, retryCount = 0): Promise<boolean> => {
    try {
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 200; 
        await new Promise(res => setTimeout(res, delay));
      }

      // Try regular query first
      const { data, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        // Specifically handle the infinite recursion error by attempting an RPC call to a security definer function
        if (error.message.includes('infinite recursion') || error.code === 'P0001') {
          console.warn("[Admin Security] RLS Recursion detected. Attempting RPC fallback...");
          const { data: rpcData, error: rpcError } = await supabase.rpc('check_is_admin');
          if (!rpcError) return !!rpcData;
        }

        console.error("[Admin Security] Query failed:", error.message);
        if (retryCount < 3) return adminApi.checkAdminStatus(userId, retryCount + 1);
        return false;
      }

      if (!data) {
        console.warn("[Admin Security] Subject not found in registry.");
        if (retryCount < 3) return adminApi.checkAdminStatus(userId, retryCount + 1);
        return false;
      }

      const isAuthorized = (data.role || '').toLowerCase().trim() === 'admin';
      console.debug(`[Admin Guard] identity: ${data.email} | clearance: ${data.role} | authorized: ${isAuthorized}`);
      
      return isAuthorized;
    } catch (err) {
      console.error("[Admin Security] Handshake critical failure:", err);
      return false;
    }
  },
  getUsers: async () => (await supabase.from('profiles').select('*')).data || [],
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSecurityEvents: async () => (await supabase.from('security_events').select('*')).data || [],
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('profiles').select('*').eq('id', user.id).single()).data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};