
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
   * 获取用户身体数据：显式列名查询，防御架构缓存错误
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
        // PGRST107 = Column not found in cache
        if (error.code === 'PGRST107') {
          console.error("CRITICAL: Supabase Schema Cache is stale. Please run 'NOTIFY pgrst, reload schema' in SQL Editor.");
        }
        if (error.status === 404 || error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (e) {
      console.error("[UserData] Fetch error:", e);
      return null;
    }
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    // 1. 更新 Profiles (存储姓名)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email, 
        full_name: fullName 
      }, { onConflict: 'id' });
    
    if (profileError) throw profileError;

    // 2. 更新 UserData (存储生物指标)
    // 显式构建 payload，不使用解构，确保字段与数据库严格一致
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
      console.error("[UserData] Setup error details:", dataError);
      throw dataError;
    }
    return data;
  },

  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    
    // 严格过滤掉非数据库字段
    const validUpdates: any = { id: user.id, updated_at: new Date().toISOString() };
    if (updates.age !== undefined) validUpdates.age = parseInt(String(updates.age)) || 0;
    if (updates.height !== undefined) validUpdates.height = parseFloat(String(updates.height)) || 0;
    if (updates.weight !== undefined) validUpdates.weight = parseFloat(String(updates.weight)) || 0;
    if (updates.gender !== undefined) validUpdates.gender = updates.gender;
    if (updates.setup_completed !== undefined) validUpdates.setup_completed = updates.setup_completed;

    const { error } = await supabase
      .from('user_data')
      .upsert(validUpdates, { onConflict: 'id' });
      
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
