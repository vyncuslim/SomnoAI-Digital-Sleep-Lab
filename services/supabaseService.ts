
import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

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

  signOut: () => supabase.auth.signOut()
};

export const userDataApi = {
  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle()).data;
  },
  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('user_data').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
  }
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    const { data, error } = await supabase.rpc('is_admin');
    if (error) return false;
    return !!data;
  },
  getUsers: async () => (await supabase.from('profiles').select('*')).data || [],
  getSecurityEvents: async () => (await supabase.from('security_events').select('*')).data || [],
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()).data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
