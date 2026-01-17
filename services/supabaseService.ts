import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
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
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.debug(`[Auth] Attempting OTP verification for: ${normalizedEmail}`);
      
      const result = await supabase.auth.verifyOtp({ 
        email: normalizedEmail, 
        token, 
        type: 'email' 
      });
      return result;
    } catch (err) {
      console.error("[Auth] Supabase verification crashed:", err);
      throw err;
    }
  },

  signInWithGoogle: () => 
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: { prompt: 'select_account', access_type: 'offline' }
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

export const updateUserPassword = authApi.updatePassword;

export const adminApi = {
  isAdmin: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    return data?.role?.toLowerCase().trim() === 'admin';
  },
  checkAdminStatus: async (userId: string) => {
    try {
      console.group(`[Admin Clearance Check] UID: ${userId}`);
      
      // 强制从服务器获取最新的 Profile 数据
      const { data, error } = await supabase
        .from('profiles')
        .select('*') // 获取所有字段以便调试
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("[-] Profile Fetch Failed:", error.message);
        console.groupEnd();
        return false;
      }

      console.debug("[+] Registry Record Found:", data);
      
      // 鲁棒的角色检查：忽略大小写，去除首尾空格
      const rawRole = data?.role || 'null';
      const normalizedRole = rawRole.toString().toLowerCase().trim();
      const isAuthorized = normalizedRole === 'admin';

      if (!isAuthorized) {
        console.warn(`[!] ACCESS REJECTED: Current role is '${rawRole}'. Expected 'admin'.`);
      } else {
        console.info("[*] ACCESS GRANTED: Admin status confirmed.");
      }
      
      console.groupEnd();
      return isAuthorized;
    } catch (err) {
      console.error("[!] Critical Exception during role validation:", err);
      console.groupEnd();
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