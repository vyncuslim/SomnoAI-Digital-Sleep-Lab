import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

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

      if (rawError) throw rawError;
      await supabase.from('profiles').update({ has_app_data: true }).eq('id', user.id);
      return { success: true };
    } catch (err: any) {
      console.error("[Health API] Telemetry Upload Failed:", err);
      return { success: false, error: err.message };
    }
  },

  getTelemetryHistory: async (limit = 30) => {
    try {
      const { data, error } = await supabase
        .from('health_raw_data')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        recorded_at: d.recorded_at,
        ...d.value
      }));
    } catch (err: any) { 
      console.error("[Health API] History Fetch Failed:", err);
      if (err.status === 400 || err.status === 500) {
        throw new Error("DB_CALIBRATION_REQUIRED");
      }
      return []; 
    }
  }
};

export const userDataApi = {
  getProfileStatus: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_initialized, has_app_data, full_name, is_blocked')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("[User Data API] Profile Status Error:", error);
        if (error.status === 400 || error.status === 500 || error.code === 'PGRST204' || error.code === '42703') {
          throw new Error("DB_CALIBRATION_REQUIRED");
        }
        return null;
      }

      if (profile?.is_blocked) throw new Error("BLOCK_ACTIVE");
      return profile;
    } catch (e: any) {
      throw e;
    }
  },

  completeSetup: async (fullName: string, metrics: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('UNAUTHORIZED');

      // First try to upsert user_data
      const { error: dataError } = await supabase.from('user_data').upsert({ 
        id: user.id, 
        ...metrics 
      });
      
      if (dataError) {
        console.error("[User Data API] user_data update failed:", dataError);
        if (dataError.status === 400 || dataError.status === 500) throw new Error("DB_CALIBRATION_REQUIRED");
        throw dataError;
      }

      // Then update profile
      const { error: profileError } = await supabase.from('profiles').update({ 
        full_name: fullName.trim(),
        is_initialized: true 
      }).eq('id', user.id);
      
      if (profileError) {
        console.error("[User Data API] profile update failed:", profileError);
        if (profileError.status === 400 || profileError.status === 500) throw new Error("DB_CALIBRATION_REQUIRED");
        throw profileError;
      }
      
      return { success: true };
    } catch (e: any) {
      console.error("[User Data API] completeSetup Exception:", e);
      throw e;
    }
  },

  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle();
    if (error && (error.status === 400 || error.status === 500)) throw new Error("DB_CALIBRATION_REQUIRED");
    return data;
  },

  updateUserData: async (metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('UNAUTHORIZED') };
    const { error } = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    if (error && (error.status === 400 || error.status === 500)) throw new Error("DB_CALIBRATION_REQUIRED");
    return { error };
  }
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error && (error.status === 400 || error.status === 500)) throw new Error("DB_CALIBRATION_REQUIRED");
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('UNAUTHORIZED') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error && (error.status === 400 || error.status === 500)) throw new Error("DB_CALIBRATION_REQUIRED");
    return { error };
  }
};

export const authApi = {
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signIn: async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    return res;
  },
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string, type: any = 'email') => supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ 
    provider: 'google', 
    options: { redirectTo: window.location.origin } 
  }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (error) {
        if (error.status === 500) console.error("[Admin API] Possible RLS recursion detected.");
        return false;
      }
      return data?.role === 'admin';
    } catch (e) {
      return false;
    }
  },
  getUsers: () => supabase.from('profiles').select('*'),
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSleepRecords: () => supabase.from('health_raw_data').select('*').limit(100),
  getFeedback: () => supabase.from('feedback').select('*').order('created_at', { ascending: false }),
  getAuditLogs: () => supabase.from('login_attempts').select('*').order('attempt_at', { ascending: false }).limit(100),
  getSecurityEvents: () => supabase.from('security_events').select('*').order('created_at', { ascending: false })
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id || null,
      email: email.trim(),
      feedback_type: type,
      content: content.trim()
    });
    return { success: !error, error };
  }
};