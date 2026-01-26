import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

export const healthDataApi = {
  /**
   * Health Telemetry Ingress (Fact-based)
   */
  uploadTelemetry: async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'UNAUTHORIZED' };

      // Ingest Raw Fact
      const { error: rawError } = await supabase.from('health_raw_data').insert({
        user_id: user.id,
        data_type: 'sleep_session_ingress',
        recorded_at: data.recorded_at || new Date().toISOString(),
        source: data.source || 'edge_bridge',
        value: data
      });

      if (rawError) throw rawError;

      // Update State: Confirm user has successfully used the App
      await supabase.from('profiles').update({ has_app_data: true }).eq( 'id', user.id);

      return { success: true };
    } catch (err: any) {
      console.error("[Health API] Telemetry Upload Failed:", err);
      return { success: false, error: err.message };
    }
  },

  getTelemetryHistory: async (limit = 30) => {
    try {
      const { data } = await supabase
        .from('health_raw_data')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      
      return (data || []).map(d => ({
        id: d.id,
        recorded_at: d.recorded_at,
        ...d.value
      }));
    } catch (err) { 
      console.error("[Health API] History Fetch Failed:", err);
      return []; 
    }
  }
};

/**
 * Registry for Biological Metadata
 */
export const userDataApi = {
  /**
   * The Laboratory State Handshake (State Machine)
   */
  getProfileStatus: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_initialized, has_app_data, full_name, is_blocked')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profile) return null;

      // Check for blocked status immediately
      if (profile.is_blocked) throw new Error("BLOCK_ACTIVE");

      // FACT CHECK: If flag says false, but data exists in table, sync flag
      if (!profile.has_app_data) {
        const { count } = await supabase
          .from('health_raw_data')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .limit(1);
        
        if (count && count > 0) {
          await supabase.from('profiles').update({ has_app_data: true }).eq('id', user.id);
          return { ...profile, has_app_data: true };
        }
      }

      return profile;
    } catch (e: any) {
      if (e.message === "BLOCK_ACTIVE") throw e;
      console.error("[User Data API] Profile Status Error:", e);
      return null;
    }
  },

  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');

    // 1. Commit metrics
    await supabase.from('user_data').upsert({ id: user.id, ...metrics });

    // 2. Commit profile initialization state
    const { error } = await supabase.from('profiles').update({ 
      full_name: fullName.trim(),
      is_initialized: true 
    }).eq('id', user.id);
    
    return { success: !error };
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

/**
 * Profile Management API
 */
export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('UNAUTHORIZED') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    return { error };
  }
};

export const authApi = {
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signIn: async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (email) {
      await supabase.from('login_attempts').insert({ 
        email, 
        success: !res.error, 
        user_id: res.data?.user?.id 
      });
    }
    return res;
  },
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string, type: any = 'email') => supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ 
    provider: 'google', 
    options: { 
      redirectTo: window.location.origin, // Crucial for multi-env support
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    } 
  }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    return data?.role === 'admin';
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
  submitFeedback: async (type: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id,
      email: user?.email,
      feedback_type: type,
      content: content
    });
    return { success: !error };
  }
};