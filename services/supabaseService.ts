
import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

/**
 * SomnoAI Data Pipeline API
 * 处理外部遥测数据上报
 */
export const healthDataApi = {
  uploadTelemetry: async (metrics: any) => {
    try {
      // 尝试通过边缘函数上报（支持 Vercel Rewrite 路径）
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
      console.warn("[Telemetry] Direct bridge error, falling back to table insert:", err.message);
      
      // 降级方案：直接写入数据库（如果边缘函数不可用）
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
   * 鲁棒性获取用户数据
   * 解决 "Could not find column in schema cache" (PGRST107) 错误
   */
  getUserData: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // 优先尝试标准关联查询
      const { data, error } = await supabase
        .from('user_data')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('id', user.id)
        .maybeSingle();
        
      // 如果报错 PGRST107，说明架构缓存过时，无法识别关联
      if (error && error.code === 'PGRST107') {
        console.debug("Schema cache stale (PGRST107). Falling back to independent queries.");
        
        // 降级方案：分两次查询，避开 PostgREST 关联解析
        const [userMetrics, userProfile] = await Promise.all([
          supabase.from('user_data').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
        ]);

        if (userMetrics.data) {
          return {
            ...userMetrics.data,
            full_name: userProfile.data?.full_name || ''
          };
        }
        return null;
      }

      if (data && (data as any).profiles) {
        return {
          ...data,
          full_name: (data as any).profiles.full_name
        };
      }
      return data;
    } catch (e) {
      console.error("[UserData] Critical Retrieval Error:", e);
      return null;
    }
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    // 原子化串行更新以确保一致性
    await supabase.from('profiles').upsert({ 
      id: user.id, 
      email: user.email, 
      full_name: fullName 
    });

    const payload = {
      id: user.id,
      age: parseInt(String(metrics.age)) || 0,
      height: parseFloat(String(metrics.height)) || 0,
      weight: parseFloat(String(metrics.weight)) || 0,
      gender: String(metrics.gender || 'prefer-not-to-say'),
      setup_completed: true,
      updated_at: new Date().toISOString()
    };

    return await supabase.from('user_data').upsert(payload);
  },

  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    
    const { error } = await supabase
      .from('user_data')
      .upsert({ 
        id: user.id, 
        ...updates,
        updated_at: new Date().toISOString() 
      });
      
    if (error) throw error;
    return { success: true };
  }
};

export const authApi = {
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: { redirectTo: window.location.origin }
  }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) return false;
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
    if (!user) throw new Error('Auth required');
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
