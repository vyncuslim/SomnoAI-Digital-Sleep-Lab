
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  if (err.status === 403 || err.status === 401 || err.code === '42P01') {
    throw new Error("DB_CALIBRATION_REQUIRED");
  }
  return err;
};

export const healthDataApi = {
  checkRemoteIngressStatus: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      const response = await fetch('https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/bright-responder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': (supabase as any).supabaseKey
        },
        body: JSON.stringify({ action: 'check_integrity' })
      });
      if (!response.ok) return false;
      const result = await response.json();
      return result.has_data === true;
    } catch (e) { return false; }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      // 强制不使用缓存获取最新权限状态
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) throw handleDatabaseError(error);
      if (!profile) return { is_initialized: false, has_app_data: false };
      if (profile.is_blocked) throw new Error("BLOCK_ACTIVE");
      return profile;
    } catch (e: any) { throw e; }
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const metricsPayload = { id: user.id, age: parseInt(metrics.age) || 0, weight: parseFloat(metrics.weight) || 0, height: parseFloat(metrics.height) || 0, gender: metrics.gender || 'prefer-not-to-say' };
    const { error: dataError } = await supabase.from('user_data').upsert(metricsPayload);
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
    } catch (e) { throw e; }
  },
  saveEntry: async (content: string, mood?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('UNAUTHORIZED');
      const { data, error = null } = await supabase.from('diary_entries').insert({ user_id: user.id, content, mood }).select().single();
      if (error) throw handleDatabaseError(error);
      return data;
    } catch (e) { throw e; }
  },
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw handleDatabaseError(error);
  }
};

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
  signUp: (email: string, password: string, metadata?: any) => supabase.auth.signUp({ email, password, options: { data: metadata || {} } }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin, shouldCreateUser: true } }),
  verifyOTP: (email: string, token: string, type: any = 'email') => supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    const { data } = await supabase.from('profiles').select('role, is_super_owner').eq('id', userId).maybeSingle();
    // 显式检查 role 或 super_owner 标志
    return (data?.role === 'admin' || data?.role === 'owner' || data?.is_super_owner === true);
  },
  getAdminClearance: async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role, is_super_owner').eq('id', userId).maybeSingle();
    return data || { role: 'user', is_super_owner: false };
  },
  getUsers: async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getFeedback: async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getAuditLogs: async () => {
    const { data } = await supabase.from('login_attempts').select('*').order('attempt_at', { ascending: false }).limit(100);
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getSleepRecords: async () => {
    const { data } = await supabase.from('health_raw_data').select('*').order('recorded_at', { ascending: false }).limit(100);
    return data || [];
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || null;
    const { error } = await supabase.from('feedback').insert({ user_id: userId, email: email.trim(), feedback_type: type, content: content.trim() });
    return { success: !error, error };
  }
};
