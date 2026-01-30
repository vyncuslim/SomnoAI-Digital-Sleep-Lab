
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  if (err.code === 'PGRST202' || err.message?.includes('not found')) return new Error("RPC_NOT_REGISTERED_IN_DB");
  return err;
};

export const healthDataApi = {
  getHealthHistory: async () => {
    const { data, error } = await supabase.from('health_data').select('*').order('recorded_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data;
  }
};

export const profileApi = {
  getMyProfile: async () => {
    const { data, error } = await supabase.from('profiles').select('*').single();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  updateProfile: async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    return supabase.from('profiles').update(data).eq('id', user.id);
  }
};

export const userDataApi = {
  getProfileStatus: async () => {
    try {
      const { data: status, error } = await supabase.rpc('get_my_detailed_profile');
      if (error) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: fallback } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          return fallback;
        }
        throw error;
      }
      return status && status.length > 0 ? status[0] : null;
    } catch (e: any) { throw e; }
  },
  getUserData: async () => {
    const { data, error } = await supabase.from('user_data').select('*').single();
    if (error && error.code !== 'PGRST116') throw handleDatabaseError(error);
    return data;
  },
  updateUserData: async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { error } = await supabase.from('user_data').upsert({ user_id: user.id, ...data });
    return { success: !error, error };
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (profileError) throw handleDatabaseError(profileError);
    const { error: metricsError } = await supabase.from('user_data').upsert({ user_id: user.id, ...metrics });
    if (metricsError) throw handleDatabaseError(metricsError);
    return { success: true };
  }
};

export const adminApi = {
  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data: status } = await supabase.rpc('get_my_detailed_profile');
      if (!status || status.length === 0) return false;
      const profile = status[0];
      return ['admin', 'owner'].includes(profile.role?.toLowerCase()) || profile.is_super_owner === true;
    } catch (e) { return false; }
  },
  getAdminClearance: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_my_detailed_profile');
    if (error) throw handleDatabaseError(error);
    return data && data.length > 0 ? data[0] : null;
  },
  getUsers: async () => {
    const { data, error } = await supabase.rpc('admin_get_all_profiles');
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  toggleBlock: async (id: string) => {
    const { error } = await supabase.rpc('admin_toggle_block', { target_user_id: id });
    if (error) throw new Error(error.message);
  },
  updateUserRole: async (id: string, role: string) => {
    const { error } = await supabase.rpc('admin_update_user_role', { target_user_id: id, new_role: role });
    if (error) throw new Error(error.message);
  },
  // --- Analytics Decision Center Methods ---
  getDailyAnalytics: async (days: number = 30) => {
    const { data, error } = await supabase
      .from('analytics_daily')
      .select('*')
      .order('date', { ascending: true })
      .limit(days);
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getCountryRankings: async () => {
    const { data, error } = await supabase
      .from('analytics_country')
      .select('country, users')
      .order('users', { ascending: false })
      .limit(10);
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getRealtimePulse: async () => {
    const { data, error } = await supabase
      .from('analytics_realtime')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
    if (error) throw handleDatabaseError(error);
    return data || [];
  }
};

export const authApi = {
  sendOTP: async (email: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user.email === email) return { data: null, error: null };
    return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  },
  verifyOTP: (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' }),
  signOut: () => supabase.auth.signOut(),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string, options: any) => supabase.auth.signUp({ 
    email, 
    password, 
    options: { data: options } 
  })
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    try {
      const { error } = await supabase.from('feedback').insert({ type, content, email });
      if (error) throw handleDatabaseError(error);
      notifyAdmin(`📥 NEW FEEDBACK\nType: ${type.toUpperCase()}\nFrom: ${email}\n\nContent: ${content}`).catch(e => console.warn("Telegram non-critical delay:", e));
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  }
};

export const diaryApi = {
  getEntries: async () => {
    const { data, error } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data;
  },
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('diary_entries').insert({ user_id: user?.id, content, mood }).select().single();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw handleDatabaseError(error);
  }
};
