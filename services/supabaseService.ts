
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  
  // PGRST202 means the RPC function is missing on the server
  if (err.code === 'PGRST202') {
    throw new Error("RPC_MISSING_DEPLOY_SQL");
  }

  if (err.status === 500 || err.status === 403 || err.code === '42P17' || err.message?.includes('recursion')) {
    throw new Error("DB_CALIBRATION_REQUIRED");
  }
  return err;
};

export const healthDataApi = {
  uploadTelemetry: async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'UNAUTHORIZED' };
      const { error: rawError } = await supabase.from('health_raw_data').insert({
        user_id: user.id,
        data_type: 'sleep_session_ingress',
        recorded_at: data.recorded_at || new Date().toISOString(),
        source: data.source || 'edge_bridge',
        value: data
      });
      if (rawError) throw handleDatabaseError(rawError);
      
      await supabase.from('profiles').update({ has_app_data: true }).eq('id', user.id);
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  },
  getTelemetryHistory: async (limit = 30) => {
    try {
      const { data, error } = await supabase.from('health_raw_data').select('*').order('recorded_at', { ascending: false }).limit(limit);
      if (error) throw handleDatabaseError(error);
      return (data || []).map(d => ({ id: d.id, recorded_at: d.recorded_at, ...d.value }));
    } catch (err: any) { return []; }
  }
};

export const userDataApi = {
  getProfileStatus: async () => {
    try {
      // Calling RPC without parameters as defined in setup.sql
      const { data: status, error } = await supabase.rpc('get_profile_status');
      if (error) throw handleDatabaseError(error);
      if (!status) return { is_initialized: false, has_app_data: false, is_blocked: false, role: 'user' };
      if (status.is_blocked) throw new Error("BLOCK_ACTIVE");
      return status;
    } catch (e: any) { throw e; }
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { error: dataError } = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    if (dataError) throw handleDatabaseError(dataError);
    const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName.trim(), is_initialized: true }).eq('id', user.id);
    if (profileError) throw handleDatabaseError(profileError);
    return { success: true };
  },
  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle();
    return data;
  },
  updateUserData: async (metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('UNAUTHORIZED') };
    const { error } = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    return { error };
  }
};

export const diaryApi = {
  getEntries: async () => {
    try {
      const { data, error } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false });
      if (error) throw handleDatabaseError(error);
      return data || [];
    } catch (e) { throw handleDatabaseError(e); }
  },
  saveEntry: async (content: string, mood?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('UNAUTHORIZED');
      const { data, error = null } = await supabase.from('diary_entries').insert({ user_id: user.id, content, mood }).select().single();
      if (error) throw handleDatabaseError(error);
      return data;
    } catch (e) { throw handleDatabaseError(e); }
  },
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw handleDatabaseError(error);
  }
};

export const profileApi = {
  getMyProfile: async () => {
    const { data, error } = await supabase.rpc('get_my_profile');
    if (error) throw handleDatabaseError(error);
    return data?.[0] || null;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('UNAUTHORIZED') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    return { error };
  }
};

export const authApi = {
  signUp: (email: string, password: string, metadata?: any) => supabase.auth.signUp({ email, password, options: { data: metadata || {} } }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin, shouldCreateUser: true } }),
  verifyOTP: (email: string, token: string, type: any = 'email') => supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data: status, error } = await supabase.rpc('get_profile_status');
      if (error) return false;
      return (status?.role === 'admin' || status?.role === 'owner');
    } catch (e) { return false; }
  },

  getUsers: async () => {
    const { data, error } = await supabase.rpc('admin_get_all_profiles');
    if (error) throw handleDatabaseError(error);
    return data || [];
  },

  toggleBlock: async (id: string) => {
    const { error } = await supabase.rpc('admin_toggle_block', { target_user_id: id });
    if (error) throw handleDatabaseError(error);
  },

  setRole: async (id: string, role: string) => {
    const { error } = await supabase.rpc('admin_set_role', { target_user_id: id, new_role: role });
    if (error) throw handleDatabaseError(error);
  },

  getAdminClearance: async (userId: string) => {
    try {
      const { data: status } = await supabase.rpc('get_profile_status');
      return { role: status?.role || 'user', is_super_owner: status?.role === 'owner' };
    } catch (e) {
      return { role: 'user', is_super_owner: false };
    }
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getAuditLogs: async () => {
    const { data, error } = await supabase.from('login_attempts').select('*').order('attempt_at', { ascending: false }).limit(100);
    if (error) return [];
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data, error } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },
  getSleepRecords: async () => {
    const { data, error } = await supabase.from('health_raw_data').select('*').order('recorded_at', { ascending: false }).limit(100);
    if (error) return [];
    return data || [];
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id || null;
      const { error } = await supabase.from('feedback').insert({ user_id: userId, email: email.trim(), feedback_type: type, content: content.trim() });
      return { success: !error, error };
    } catch (e) {
      return { success: false, error: e };
    }
  }
};
