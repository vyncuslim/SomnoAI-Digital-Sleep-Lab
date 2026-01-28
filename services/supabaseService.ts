
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const BRIGHT_RESPONDER_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/bright-responder';

const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  if (err.status === 403 || err.status === 400 || err.status === 500 || ['42P01', '42703', '42P16', 'PGRST204', 'PGRST116'].includes(err.code)) {
    throw new Error("DB_CALIBRATION_REQUIRED");
  }
  return err;
};

export const healthDataApi = {
  checkRemoteIngressStatus: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const response = await fetch(BRIGHT_RESPONDER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'check_data_integrity' })
      });

      if (!response.ok) return false;
      const result = await response.json();
      return !!result.has_data;
    } catch (e) {
      return false;
    }
  },

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
      return (data || []).map(d => ({ id: d.id, recorded_at: d.recorded_at, ...d.value }));
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
        .select('is_initialized, has_app_data, full_name, is_blocked, role')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw handleDatabaseError(error);
      
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email, role: 'user' })
          .select()
          .single();
        if (insertError) throw handleDatabaseError(insertError);
        return newProfile;
      }
      
      if (profile.is_blocked) throw new Error("BLOCK_ACTIVE");
      return profile;
    } catch (e: any) { throw e; }
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    
    const { error: dataError } = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    if (dataError) throw handleDatabaseError(dataError);

    const { error: profileError } = await supabase.from('profiles').update({ 
      full_name: fullName.trim(), 
      is_initialized: true 
    }).eq('id', user.id);
    if (profileError) throw handleDatabaseError(profileError);

    return { success: true };
  },
  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  updateUserData: async (metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('UNAUTHORIZED') };
    const { error } = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    if (error) throw handleDatabaseError(error);
    return { error };
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
    } catch (e: any) { throw e; }
  },
  updateProfile: async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('UNAUTHORIZED') };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw handleDatabaseError(error);
      return { error: null };
    } catch (e: any) { throw e; }
  }
};

export const diaryApi = {
  getEntries: async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw handleDatabaseError(error);
      return data || [];
    } catch (e: any) { throw e; }
  },
  saveEntry: async (content: string, mood: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('UNAUTHORIZED');
      const { data, error = null } = await supabase.from('diary_entries').insert({
        user_id: user.id,
        content,
        mood
      }).select().single();
      if (error) throw handleDatabaseError(error);
      return data;
    } catch (e: any) { throw e; }
  },
  deleteEntry: async (id: string) => {
    try {
      const { error } = await supabase.from('diary_entries').delete().eq('id', id);
      if (error) throw handleDatabaseError(error);
      return { success: true };
    } catch (e: any) { throw e; }
  }
};

export const authApi = {
  signUp: (email: string, password: string, metadata?: any) => supabase.auth.signUp({ email, password, options: { data: metadata || {} } }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ 
    email, 
    options: { 
      shouldCreateUser: true 
    } 
  }),
  verifyOTP: (email: string, token: string, type: any = 'email') => supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      // Check JWT first as it's the source of truth for RLS
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.app_metadata?.role || session?.user?.user_metadata?.role;
      
      if (role === 'admin' || role === 'owner') return true;

      // Fallback to profile table check
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (error) return false;
      return data?.role === 'admin' || data?.role === 'owner';
    } catch (e) { return false; }
  },
  getUsers: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw handleDatabaseError(error);
      return data || [];
    } catch (e) { return []; }
  },
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id).select('email').single(),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id).select('email').single(),
  getSleepRecords: async () => {
    try {
      const { data, error } = await supabase.from('health_raw_data').select('*').order('recorded_at', { ascending: false }).limit(100);
      if (error) throw handleDatabaseError(error);
      return data || [];
    } catch (e) { return []; }
  },
  getFeedback: async () => {
    try {
      const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
      if (error) throw handleDatabaseError(error);
      return data || [];
    } catch (e) { return []; }
  },
  getAuditLogs: async () => {
    try {
      const { data, error } = await supabase.from('login_attempts').select('*').order('attempt_at', { ascending: false }).limit(100);
      if (error) throw handleDatabaseError(error);
      return data || [];
    } catch (e) { return []; }
  },
  getSecurityEvents: async () => {
    try {
      const { data, error } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
      if (error) throw handleDatabaseError(error);
      return data || [];
    } catch (e) { return []; }
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          feedback_type: type,
          content: content.trim(),
          email: email.trim(),
          user_id: session?.user?.id || null
        })
      });

      if (!response.ok) {
        const { error } = await supabase.from('feedback').insert({ 
          user_id: session?.user?.id || null, 
          email: email.trim(), 
          feedback_type: type, 
          content: content.trim() 
        });
        return { success: !error, error };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  }
};
