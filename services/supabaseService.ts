
import { supabase } from '../lib/supabaseClient.ts';
import { HealthTelemetryPayload } from '../types.ts';

export { supabase };

/**
 * SomnoAI 数据管道 API
 * 负责 Android 端与 Web 端的数据握手
 */
export const healthDataApi = {
  /**
   * 推送数据到网站后端
   * @param payload 符合 HealthTelemetryPayload 结构的数据包
   */
  uploadTelemetry: async (payload: HealthTelemetryPayload) => {
    // 1. 获取当前经过身份验证的用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('NEURAL_LINK_UNAUTHORIZED: Session invalid or expired.');
    }

    // 2. 写入遥测表
    // Supabase 会根据 RLS 自动检查权限
    const { data, error } = await supabase
      .from('health_telemetry')
      .insert({
        user_id: user.id,
        sync_id: payload.sync_id, // 幂等性控制
        source: payload.source,
        device_info: payload.device_metadata,
        payload: payload.metrics
      })
      .select()
      .single();

    if (error) {
      // 处理重复同步的情况
      if (error.code === '23505') {
        console.warn("Telemetric packet already archived (SyncID exists).");
        return { success: true, status: 'ALREADY_ARCHIVED' };
      }
      throw error;
    }

    return { success: true, data };
  },

  /**
   * 获取最近同步的生理指标历史
   */
  getTelemetryHistory: async (limit = 10) => {
    return supabase
      .from('health_telemetry')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
  }
};

// 保持现有的 Auth 逻辑
export const authApi = {
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => 
    supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string) => 
    supabase.auth.verifyOtp({ email, token, type: 'email' }),
  signInWithGoogle: () => 
    supabase.auth.signInWithOAuth({ provider: 'google' }),
  signOut: () => supabase.auth.signOut()
};

// Admin & User Data APIs
export const userDataApi = {
  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle()).data;
  },
  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('user_data').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
  }
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('is_admin');
    return !error && !!data;
  },
  getUsers: async () => (await supabase.from('profiles').select('*')).data || [],
  getSecurityEvents: async () => (await supabase.from('security_events').select('*')).data || [],
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()).data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
