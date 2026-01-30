import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const handleDatabaseError = (err: any) => {
  if (import.meta.env.DEV) console.error("[Database Layer Error]:", err);
  // Specifically detect missing RPC functions
  if (err.code === 'PGRST202' || err.message?.includes('not found') || err.message?.includes('function')) {
    return new Error("RPC_NOT_REGISTERED_IN_DB");
  }
  return err;
};

/**
 * Auth API Layer
 */
export const authApi = {
  signInWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
  },
  signIn: async (email: string, password: string, captchaToken?: string) => {
    return await supabase.auth.signInWithPassword({ 
      email, 
      password,
      options: { captchaToken }
    });
  },
  signUp: async (email: string, password: string, options: any, captchaToken?: string) => {
    return await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        ...options,
        captchaToken 
      } 
    });
  },
  sendOTP: async (email: string, captchaToken?: string) => {
    return await supabase.auth.signInWithOtp({ 
      email,
      options: { captchaToken }
    });
  },
  verifyOTP: async (email: string, token: string) => {
    return await supabase.verifyOtp({ email, token, type: 'email' });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  }
};

/**
 * Profile & User Data
 */
export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("USER_NOT_FOUND");
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};

export const userDataApi = {
  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('user_data').select('*').eq('id', user.id).single();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("USER_NOT_FOUND");
    return await supabase.from('user_data').upsert({ user_id: user.id, ...updates });
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("USER_NOT_FOUND");
    
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    await supabase.from('user_data').upsert({ user_id: user.id, ...metrics });
    return { success: true };
  }
};

/**
 * Feedback & Diary
 */
export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { data, error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (error) return { success: false, error, data: null };
    await notifyAdmin(`📩 NEW FEEDBACK\nType: ${type.toUpperCase()}\nFrom: ${email}\nContent: ${content}`);
    return { success: true, data, error: null };
  }
};

export const diaryApi = {
  getEntries: async () => {
    // Fixed join syntax to prevent 400 errors
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    
    if (error) throw handleDatabaseError(error);
    return data;
  },
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('diary_entries').insert([{ content, mood, user_id: user?.id }]).select().single();
    if (error) throw error;
    return data;
  },
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw error;
  }
};

/**
 * Unified Admin API
 */
export const adminApi = {
  getAdminClearance: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_my_detailed_profile');
    if (error) throw handleDatabaseError(error);
    return data?.[0] || null;
  },
  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data } = await supabase.rpc('get_my_detailed_profile');
      if (!data || data.length === 0) return false;
      const p = data[0];
      return ['admin', 'owner'].includes(p.role?.toLowerCase()) || p.is_super_owner === true;
    } catch { return false; }
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
  getDeviceSegmentation: async () => {
    const { data, error } = await supabase
      .from('analytics_device')
      .select('device, users')
      .order('users', { ascending: false })
      .limit(5);
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getRealtimePulse: async () => {
    const { data, error } = await supabase
      .from('analytics_realtime')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);
    if (error) throw handleDatabaseError(error);
    return data || [];
  }
};