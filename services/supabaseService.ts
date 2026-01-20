
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
   * 获取用户数据，带详细错误诊断
   */
  getUserData: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_data')
        .select('id, age, height, weight, gender, setup_completed')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("[UserData] Cache Conflict Detected:", error.message, error.code);
        
        // 如果是缓存错误，尝试使用通配符查询作为临时回退
        if (error.code === 'PGRST107') {
          const { data: fallbackData } = await supabase
            .from('user_data')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          return fallbackData;
        }
        
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    // 更新 profiles (姓名)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email, 
        full_name: fullName 
      }, { onConflict: 'id' });
    
    if (profileError) throw profileError;

    // 显式映射字段，确保没有任何脏数据进入 user_data 表
    const payload = {
      id: user.id,
      age: Math.max(0, parseInt(String(metrics.age)) || 0),
      height: Math.max(0, parseFloat(String(metrics.height)) || 0),
      weight: Math.max(0, parseFloat(String(metrics.weight)) || 0),
      gender: String(metrics.gender || 'prefer-not-to-say'),
      setup_completed: true,
      updated_at: new Date().toISOString()
    };

    const { data, error: dataError } = await supabase
      .from('user_data')
      .upsert(payload, { onConflict: 'id' });

    if (dataError) {
      console.error("[UserData] Upsert block:", dataError);
      throw dataError;
    }
    return data;
  },

  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    
    // 严格白名单过滤
    const sanitized: any = { id: user.id, updated_at: new Date().toISOString() };
    const allowed = ['age', 'height', 'weight', 'gender', 'setup_completed'];
    
    allowed.forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'age') sanitized[key] = parseInt(String(updates[key]));
        else if (key === 'height' || key === 'weight') sanitized[key] = parseFloat(String(updates[key]));
        else sanitized[key] = updates[key];
      }
    });

    const { error } = await supabase
      .from('user_data')
      .upsert(sanitized, { onConflict: 'id' });
      
    if (error) {
      console.error("[UserData] Update failed:", error);
      throw error;
    }
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
