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
  /**
   * Authoritative check for admin status against the profiles table.
   * Includes exponential backoff retries to handle trigger-based profile creation latency.
   */
  checkAdminStatus: async (userId: string, retryCount = 0): Promise<boolean> => {
    try {
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 300; 
        await new Promise(res => setTimeout(res, delay));
      }

      console.debug(`[Admin Security] Validating clearance for UID: ${userId} (Attempt ${retryCount + 1})`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("[Admin Security] Database read error:", error.message);
        if (retryCount < 3) return adminApi.checkAdminStatus(userId, retryCount + 1);
        return false;
      }

      // If profile record doesn't exist yet, retry (trigger might be running)
      if (!data) {
        console.warn("[Admin Security] No profile record found for this identity.");
        if (retryCount < 4) return adminApi.checkAdminStatus(userId, retryCount + 1);
        return false;
      }

      const rawRole = data.role || 'user';
      const normalizedRole = rawRole.toLowerCase().trim();
      const isAuthorized = normalizedRole === 'admin';
      
      console.info(`[Security Audit] User: ${data.email} | Detected Role: "${rawRole}" | Clearance: ${isAuthorized ? 'GRANTED' : 'DENIED'}`);
      
      return isAuthorized;
    } catch (err) {
      console.error("[Admin Security] Critical exception during handshake:", err);
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