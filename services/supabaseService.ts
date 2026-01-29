
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  if (err.code === 'PGRST202' || err.message?.includes('not found')) throw new Error("RPC_MISSING_DEPLOY_SQL");
  if (err.status === 500 || err.code === '42P17' || err.message?.includes('recursion')) throw new Error("DB_CALIBRATION_REQUIRED");
  return err;
};

// Added healthDataApi to resolve import error in App.tsx
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
      const { data: status, error } = await supabase.rpc('get_profile_status');
      if (error) throw handleDatabaseError(error);
      return status;
    } catch (e: any) { throw e; }
  },
  getUserData: async () => {
    const { data, error } = await supabase.from('user_data').select('*').single();
    if (error && error.code !== 'PGRST116') throw handleDatabaseError(error);
    return data;
  },
  updateUserData: async (metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    return supabase.from('user_data').upsert({ id: user.id, ...metrics });
  },
  // Added completeSetup to resolve error in FirstTimeSetup.tsx
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    
    const { error: pError } = await supabase.from('profiles').update({ 
      full_name: fullName, 
      is_initialized: true 
    }).eq('id', user.id);
    if (pError) throw handleDatabaseError(pError);
    
    const { error: dError } = await supabase.from('user_data').upsert({ 
      id: user.id, 
      ...metrics, 
      is_initialized: true 
    });
    if (dError) throw handleDatabaseError(dError);
    
    return { success: true };
  }
};

export const adminApi = {
  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data: status } = await supabase.rpc('get_profile_status');
      return ['admin', 'owner', 'super_owner'].includes(status?.role || 'user');
    } catch (e) { return false; }
  },
  getAdminClearance: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('role, is_super_owner').eq('id', userId).single();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  getUsers: async () => {
    const { data, error } = await supabase.rpc('admin_get_all_profiles');
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data, error } = await supabase.rpc('admin_get_security_logs');
    if (error) {
       const { data: oldData } = await supabase.from('security_events').select('*').order('timestamp', { ascending: false }).limit(50);
       return oldData || [];
    }
    return data.map((d: any) => ({
      id: d.log_id,
      email: d.subject_email,
      event_type: d.event_category,
      timestamp: d.event_time,
      event_reason: d.details
    })) || [];
  },
  getSystemHealth: async () => {
    const { data, error } = await supabase.rpc('owner_get_system_health');
    if (error) throw handleDatabaseError(error);
    return data[0];
  },
  toggleBlock: async (id: string) => {
    const { error } = await supabase.rpc('admin_toggle_block', { target_user_id: id });
    if (error) throw new Error(error.message);
  },
  setRole: async (id: string, role: string) => {
    const { error } = await supabase.rpc('admin_set_role', { target_user_id: id, new_role: role });
    if (error) throw handleDatabaseError(error);
  }
};

export const authApi = {
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } }),
  verifyOTP: (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' }),
  signOut: () => supabase.auth.signOut(),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google' }),
  // Added missing signIn and signUp methods for Auth.tsx
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string, options: any) => supabase.auth.signUp({ 
    email, 
    password, 
    options: { data: options } 
  })
};

// Added feedbackApi to resolve import error in FeedbackView.tsx
export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert({ type, content, email });
    return { success: !error, error };
  }
};

// Updated diaryApi to use 'diary_entries' table
export const diaryApi = {
  getEntries: async () => {
    const { data, error } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data;
  },
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('diary_entries').insert({ 
      user_id: user?.id, 
      content, 
      mood 
    }).select().single();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw handleDatabaseError(error);
  }
};
