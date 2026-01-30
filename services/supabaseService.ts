
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

// Helper to handle database errors and map them to application-level exceptions
const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  if (err.code === 'PGRST202' || err.message?.includes('not found')) return new Error("RPC_NOT_REGISTERED_IN_DB");
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
        redirectTo: window.location.origin
      }
    });
  },
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signUp: async (email: string, password: string, options: any) => {
    return await supabase.auth.signUp({ email, password, options });
  },
  sendOTP: async (email: string) => {
    return await supabase.auth.signInWithOtp({ email });
  },
  verifyOTP: async (email: string, token: string) => {
    return await supabase.auth.verifyOtp({ email, token, type: 'email' });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  }
};

/**
 * Profile API Layer
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
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    return { data, error };
  }
};

/**
 * User Data API Layer
 */
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
    const { data, error } = await supabase.from('user_data').upsert({ user_id: user.id, ...updates });
    return { data, error };
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("USER_NOT_FOUND");
    
    const { error: pError } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (pError) throw pError;

    const { error: uError } = await supabase.from('user_data').upsert({ user_id: user.id, ...metrics });
    if (uError) throw uError;

    return { success: true };
  }
};

/**
 * Feedback API Layer
 */
export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { data, error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (error) return { success: false, error, data: null };
    
    await notifyAdmin(`📩 NEW FEEDBACK\nType: ${type.toUpperCase()}\nFrom: ${email}\nContent: ${content}`);
    return { success: true, data, error: null };
  }
};

/**
 * Diary API Layer
 */
export const diaryApi = {
  getEntries: async () => {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data;
  },
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('diary_entries')
      .insert([{ content, mood, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw error;
  }
};

/**
 * Admin API Layer
 */
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
      .limit(20);
    if (error) throw handleDatabaseError(error);
    return data || [];
  }
};
