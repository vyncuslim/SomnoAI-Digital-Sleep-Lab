import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  
  // Critical error patterns that require admin attention
  if (err.status === 400 || err.status === 500 || ['42P01', '42703', '42P16', 'PGRST204', 'PGRST116'].includes(err.code)) {
    notifyAdmin({
      type: 'DATABASE_EXCEPTION',
      error: `Status: ${err.status} | Code: ${err.code} | Msg: ${err.message || 'Registry Calibration Required'}`
    });
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
    } catch (err: any) {
      if (err.message === "DB_CALIBRATION_REQUIRED") throw err;
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
      
      if (error) throw handleDatabaseError(error);
      return (data || []).map(d => ({
        id: d.id,
        recorded_at: d.recorded_at,
        ...d.value
      }));
    } catch (err: any) { 
      if (err.message === "DB_CALIBRATION_REQUIRED") throw err;
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

      if (error) throw handleDatabaseError(error);

      if (!profile) {
        // Fallback profile creation if trigger missed it
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          role: 'user'
        }).select().maybeSingle();
        
        if (insertError) throw handleDatabaseError(insertError);
        return { is_initialized: false, has_app_data: false, is_blocked: false };
      }

      if (profile.is_blocked) throw new Error("BLOCK_ACTIVE");
      return profile;
    } catch (e: any) {
      throw e;
    }
  },

  completeSetup: async (fullName: string, metrics: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('UNAUTHORIZED');

      const { error: dataError } = await supabase.from('user_data').upsert({ 
        id: user.id, 
        ...metrics 
      });
      if (dataError) throw handleDatabaseError(dataError);

      const { error: profileError } = await supabase.from('profiles').update({ 
        full_name: fullName.trim(),
        is_initialized: true 
      }).eq('id', user.id);
      if (profileError) throw handleDatabaseError(profileError);
      
      return { success: true };
    } catch (e: any) {
      throw e;
    }
  },

  getUserData: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle();
      if (error) throw handleDatabaseError(error);
      return data;
    } catch (e) { throw e; }
  },

  updateUserData: async (metrics: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('UNAUTHORIZED') };
      const { error } = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
      if (error) throw handleDatabaseError(error);
      return { error: null };
    } catch (e) { throw e; }
  }
};

export const profileApi = {
  getMyProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) throw handleDatabaseError(error);
      return data;
    } catch (e) { throw e; }
  },
  updateProfile: async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('UNAUTHORIZED') };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw handleDatabaseError(error);
      return { error: null };
    } catch (e) { throw e; }
  }
};

export const authApi = {
  signUp: (email: string, password: string, metadata?: any) => supabase.auth.signUp({ 
    email, 
    password, 
    options: { data: metadata || {} } 
  }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: window.location.origin,
      shouldCreateUser: true
    }
  }),
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
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) return false;
      return data?.role === 'admin';
    } catch (e) {
      return false;
    }
  },
  getUsers: () => supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  blockUser: async (id: string) => {
    const res = await supabase.from('profiles').update({ is_blocked: true }).eq('id', id).select('email').single();
    if (res.data) notifyAdmin(`🚫 USER BLOCKED\nEmail: ${res.data.email}\nID: ${id}`);
    return res;
  },
  unblockUser: async (id: string) => {
    const res = await supabase.from('profiles').update({ is_blocked: false }).eq('id', id).select('email').single();
    if (res.data) notifyAdmin(`✅ USER UNBLOCKED\nEmail: ${res.data.email}`);
    return res;
  },
  getSleepRecords: () => supabase.from('health_raw_data').select('*').order('recorded_at', { ascending: false }).limit(100),
  getFeedback: () => supabase.from('feedback').select('*').order('created_at', { ascending: false }),
  getAuditLogs: () => supabase.from('login_attempts').select('*').order('attempt_at', { ascending: false }).limit(100),
  getSecurityEvents: () => supabase.from('security_events').select('*').order('created_at', { ascending: false })
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id || null;
      
      const { error } = await supabase.from('feedback').insert({
        user_id: userId,
        email: email.trim(),
        feedback_type: type,
        content: content.trim()
      });
      
      if (error) {
        console.error("Feedback Registry Failure:", error);
        return { success: false, error: error };
      }

      // Notify Admin Bot via Edge Function immediately
      await notifyAdmin(`📝 NEW FEEDBACK\nType: ${type}\nFrom: ${email}\n\nContent: ${content}`);

      return { success: true };
    } catch (err: any) {
      console.error("Feedback Logic Error:", err);
      return { success: false, error: err };
    }
  }
};