
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

const handleDatabaseError = (err: any) => {
  console.error("[Database Layer Error]:", err);
  
  // PGRST202: 数据库里没这个函数 (404)
  if (err.code === 'PGRST202' || err.message?.includes('not found')) {
    throw new Error("RPC_MISSING_DEPLOY_SQL");
  }

  // 递归死循环或 500
  if (err.status === 500 || err.code === '42P17' || err.message?.includes('recursion')) {
    throw new Error("DB_CALIBRATION_REQUIRED");
  }
  return err;
};

export const userDataApi = {
  getProfileStatus: async () => {
    try {
      // 设置 8 秒超时，防止无限转圈
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("GATEWAY_TIMEOUT")), 8000));
      
      const rpcCall = supabase.rpc('get_profile_status');
      const { data: status, error } = await Promise.race([rpcCall, timeout]) as any;

      if (error) throw handleDatabaseError(error);
      
      // 如果 RPC 成功但没数据 (未登录状态)
      if (!status) return { is_initialized: false, has_app_data: false, is_blocked: false, role: 'user' };
      
      if (status.is_blocked) throw new Error("BLOCK_ACTIVE");
      return status;
    } catch (e: any) { 
      console.error("Status check failed:", e);
      throw e; 
    }
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
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { error: dataError } = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    if (dataError) throw handleDatabaseError(dataError);
    const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName.trim(), is_initialized: true }).eq('id', user.id);
    if (profileError) throw handleDatabaseError(profileError);
    return { success: true };
  }
};

export const adminApi = {
  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data: status, error } = await supabase.rpc('get_profile_status');
      if (error) return false;
      // 允许 admin, owner, super_owner 进入管理后台
      const adminRoles = ['admin', 'owner', 'super_owner'];
      return adminRoles.includes(status?.role || 'user');
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
  getSleepRecords: async () => {
    const { data, error } = await supabase.from('health_raw_data').select('*').limit(100);
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getAuditLogs: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data, error } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
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
  }
};

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
    if (!user) throw new Error('UNAUTHORIZED');
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert({ type, content, email });
    if (error) return { success: false, error };
    return { success: true };
  }
};

export const diaryApi = {
  getEntries: async () => {
    const { data, error } = await supabase.from('diary').select('*').order('created_at', { ascending: false });
    if (error) throw handleDatabaseError(error);
    return data || [];
  },
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('diary').insert({ user_id: user?.id, content, mood }).select().single();
    if (error) throw handleDatabaseError(error);
    return data;
  },
  deleteEntry: async (id: string) => {
    const { error } = await supabase.from('diary').delete().eq('id', id);
    if (error) throw handleDatabaseError(error);
  }
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

export const authApi = {
  signUp: (email: string, password: string, metadata?: any) => supabase.auth.signUp({ email, password, options: { data: metadata || {} } }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin, shouldCreateUser: true } }),
  verifyOTP: (email: string, token: string, type: any = 'email') => supabase.auth.verifyOtp({ email, token, type }),
  signOut: () => supabase.auth.signOut(),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google' })
};
