import { supabase } from '../lib/supabaseClient.ts';

// Re-export the supabase client for external access
export { supabase };

/**
 * Profiles Management API
 */
export const profileApi = {
  getMyProfile: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return data;
  },

  updateProfile: async (updates: {
    full_name?: string;
    avatar_url?: string;
    preferences?: any;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    return supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
  }
};

/**
 * Authentication & Identity API (Strictly following provided logic)
 */
export const authApi = {
  // Email + Password Auth
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: `${window.location.origin}/#/dashboard` }
    }),
  
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),

  // Email OTP Auth
  sendOTP: (email: string) => 
    supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/#/dashboard`
      }
    }),

  verifyOTP: (email: string, token: string) => 
    supabase.auth.verifyOtp({ email, token, type: 'email' }),

  // Google OAuth Auth
  signInWithGoogle: () => 
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#/dashboard`
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

/**
 * Administrative Logic (RBAC via profiles.role)
 */
export const adminApi = {
  /**
   * Strictly verifies if the current user has the 'admin' role.
   */
  isAdmin: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      return profile?.role === 'admin';
    } catch (e) {
      console.warn("Admin check failed, defaulting to false.", e);
      return false;
    }
  },

  /**
   * Checks if a specific user has admin privileges.
   */
  checkAdminStatus: async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      return profile?.role === 'admin';
    } catch (e) {
      return false;
    }
  },

  getUsers: async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  blockUser: async (id: string) => {
    await supabase.from('profiles').update({ is_blocked: true }).eq('id', id);
  },

  unblockUser: async (id: string) => {
    await supabase.from('profiles').update({ is_blocked: false }).eq('id', id);
  },

  getSecurityEvents: async () => {
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

// Legacy support for standalone component exports
export const updateUserPassword = authApi.updatePassword;
export const signInWithEmailOTP = authApi.sendOTP;
export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await authApi.verifyOTP(email, token);
  if (error) throw error;
  return data.session;
};
export const sendPasswordReset = authApi.resetPassword;
export const signInWithGoogle = authApi.signInWithGoogle;