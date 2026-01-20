
import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

/**
 * SomnoAI Data Pipeline API
 */
export const healthDataApi = {
  uploadTelemetry: async (metrics: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('NEURAL_LINK_UNAUTHORIZED');

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
      console.warn("[Telemetry] Edge function error:", err.message);
      return { success: false, offline: true };
    }
  },

  getTelemetryHistory: async (limit = 14) => {
    try {
      const { data, error } = await supabase
        .from('health_telemetry')
        .select('id, heart_rate, weight, recorded_at, created_at, payload, source')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error && error.status !== 404) throw error;
      return data || [];
    } catch (err: any) {
      console.debug("[History] Remote logs unreachable:", err.message);
      return []; 
    }
  }
};

export const userDataApi = {
  /**
   * 获取用户数据：通过关联查询同时获取 full_name 和生物指标
   */
  getUserData: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // 使用关联查询 (Join) 获取 profiles 表中的 full_name
      // 这种写法能更有效地触发架构解析
      const { data, error } = await supabase
        .from('user_data')
        .select(`
          id, 
          age, 
          height, 
          weight, 
          gender, 
          setup_completed,
          profiles:id (full_name)
        `)
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        // 如果依然报缓存错误 (PGRST107)，尝试降级到不指定列的查询
        if (error.code === 'PGRST107') {
          console.error("Cache Stale. Attempting fallback query...");
          const { data: fallback } = await supabase
            .from('user_data')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          return fallback;
        }
        return null;
      }

      // 将 profiles.full_name 摊平到返回结果中
      if (data && (data as any).profiles) {
        return {
          ...data,
          full_name: (data as any).profiles.full_name
        };
      }
      return data;
    } catch (e) {
      return null;
    }
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    // 1. 更新 Profiles (姓名)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email, 
        full_name: fullName 
      }, { onConflict: 'id' });
    
    if (profileError) throw profileError;

    // 2. 更新 UserData (生物指标)
    // 强制类型转换，确保发送到数据库的数据是纯净的
    const payload = {
      id: user.id,
      age: parseInt(String(metrics.age)) || 0,
      height: parseFloat(String(metrics.height)) || 0,
      weight: parseFloat(String(metrics.weight)) || 0,
      gender: String(metrics.gender || 'prefer-not-to-say'),
      setup_completed: true,
      updated_at: new Date().toISOString()
    };

    const { data, error: dataError } = await supabase
      .from('user_data')
      .upsert(payload, { onConflict: 'id' });

    if (dataError) {
      console.error("[UserData] Setup error:", dataError);
      throw dataError;
    }
    return data;
  },

  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    
    const sanitized: any = { id: user.id, updated_at: new Date().toISOString() };
    if (updates.age !== undefined) sanitized.age = parseInt(String(updates.age));
    if (updates.height !== undefined) sanitized.height = parseFloat(String(updates.height));
    if (updates.weight !== undefined) sanitized.weight = parseFloat(String(updates.weight));
    if (updates.gender !== undefined) sanitized.gender = String(updates.gender);
    if (updates.setup_completed !== undefined) sanitized.setup_completed = !!updates.setup_completed;

    const { error } = await supabase
      .from('user_data')
      .upsert(sanitized, { onConflict: 'id' });
      
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
    const { data } = await supabase.from('profiles').select('id, email, full_name, role, is_blocked, created_at');
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
    const { data } = await supabase.from('profiles').select('id, email, full_name, role').eq('id', user.id).maybeSingle();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
