
import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

export const authApi = {
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password,
      options: { emailRedirectTo: `${window.location.origin}` }
    }),
  
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    }),

  sendOTP: (email: string) => 
    supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { 
        emailRedirectTo: `${window.location.origin}`,
        shouldCreateUser: false 
      }
    }),

  verifyOTP: async (email: string, token: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return await supabase.auth.verifyOtp({ 
      email: normalizedEmail, 
      token, 
      type: 'email' 
    });
  },

  signInWithGoogle: () => 
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' }
      }
    }),

  resetPassword: (email: string) => 
    supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin + '/#/login'
    }),

  updatePassword: (password: string) => 
    supabase.auth.updateUser({ password }),

  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  /**
   * 增强型管理员状态检测
   * 结合 RPC 调用与直接查询，确保在 RLS 策略生效时能够准确识别身份。
   */
  checkAdminStatus: async (userId: string, retryCount = 0): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // 指数退避重试，处理瞬时连接问题
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 200; 
        await new Promise(res => setTimeout(res, delay));
      }

      // 优先尝试 RPC 调用（最安全，由数据库端处理逻辑）
      // 注意：我们在 SQL 中将函数改名为 is_admin 以保持语义清晰
      const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin');
      
      if (!rpcError && rpcData !== null) {
        return !!rpcData;
      }

      // 如果 RPC 失败（例如函数未找到或旧版本），尝试直接读取个人资料
      // 注意：如果 RLS 递归未修复，此处仍可能报错，但作为 fallback 是必要的
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        // 如果是网络问题且未超过重试次数，进行重试
        if (error.message?.includes('fetch') && retryCount < 2) {
          return adminApi.checkAdminStatus(userId, retryCount + 1);
        }
        return false;
      }

      return (data?.role || '').toLowerCase().trim() === 'admin';
    } catch (err) {
      console.error("[Admin Security] Terminal Identity Audit Failure:", err);
      return false;
    }
  },
  getUsers: async () => (await supabase.from('profiles').select('*')).data || [],
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSecurityEvents: async () => (await supabase.from('security_events').select('*')).data || [],
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('profiles').select('*').eq('id', user.id).single()).data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
