
import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

export const healthDataApi = {
  uploadTelemetry: async (metrics: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('bright-responder', {
        method: 'POST',
        body: {
          steps: metrics.steps || 0,
          heart_rate: metrics.heart_rate || metrics.heartRate?.average || 0,
          weight: metrics.weight || metrics.payload?.weight || 0,
          recorded_at: metrics.recorded_at || new Date().toISOString(),
          source: metrics.source || 'web_bridge',
          payload: metrics
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'UNAUTHORIZED' };

      const { error: dbError } = await supabase.from('health_telemetry').insert({
        user_id: user.id,
        heart_rate: metrics.heart_rate || metrics.heartRate?.average || 0,
        recorded_at: metrics.recorded_at || new Date().toISOString(),
        payload: metrics,
        source: metrics.source || 'db_fallback'
      });
      return { success: !dbError, error: dbError?.message };
    }
  },

  getTelemetryHistory: async (limit = 14) => {
    try {
      const { data, error } = await supabase
        .from('health_telemetry')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      return []; 
    }
  }
};

export const userDataApi = {
  /**
   * 鲁棒查询：如果由于架构缓存导致找不到特定列（如 age），
   * 将自动降级为仅查询 setup_completed 状态。
   */
  getUserData: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // 1. 尝试完整查询（逐一列出字段比 * 更稳健）
      const { data, error } = await supabase
        .from('user_data')
        .select('id, age, height, weight, gender, setup_completed, profiles(full_name)')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        // 如果错误提示列不存在（PGRST107）
        if (error.code === 'PGRST107' || error.message.includes('column')) {
          console.warn("Schema mismatch! Falling back to minimalist status query.");
          // 2. 降级：仅查 ID 和状态，绕过报错列
          const { data: minData, error: minError } = await supabase
            .from('user_data')
            .select('id, setup_completed')
            .eq('id', user.id)
            .maybeSingle();
            
          if (minError) return null;
          return minData;
        }
        return null;
      }
      
      if (data && (data as any).profiles) {
        return { ...data, full_name: (data as any).profiles.full_name };
      }
      return data;
    } catch (e) { 
      return null; 
    }
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');

    // 更新 Profile
    await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: fullName });

    // 写入指标
    const payload = {
      id: user.id,
      age: parseInt(String(metrics.age)) || 0,
      height: parseFloat(String(metrics.height)) || 0,
      weight: parseFloat(String(metrics.weight)) || 0,
      gender: String(metrics.gender || 'prefer-not-to-say'),
      setup_completed: true,
      updated_at: new Date().toISOString()
    };

    const { error: dataError } = await supabase.from('user_data').upsert(payload);
    
    if (dataError) {
      if (dataError.message.includes('column') || dataError.code === 'PGRST107') {
        // 如果依然报错找不到列，说明 SQL 编辑器操作被跳过了
        throw new Error("SCHEMA_ERROR: 'age' column missing. Please run the code in setup.sql in your Supabase SQL Editor.");
      }
      throw dataError;
    }

    return { success: true };
  },

  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');
    const { error } = await supabase.from('user_data').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { success: true };
  }
};

export const authApi = {
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
        return p?.role === 'admin';
      }
      return !!data;
    } catch (e) { return false; }
  },
  getUsers: async () => {
    const { data } = await supabase.from('profiles').select('*');
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data } = await supabase.from('security_events').select('*');
    return data || [];
  },
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
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
