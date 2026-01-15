import { supabase } from '../lib/supabaseClient.ts';

// --- 用户身份验证服务 ---

/**
 * 使用邮箱和密码注册新受试者
 * 注册成功后立即在 profiles 表中插入基础记录，确保角色和权限正确初始化
 */
export async function signUpWithPassword(email: string, pass: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { 
      emailRedirectTo: window.location.origin,
    }
  });
  
  if (error) throw error;
  
  // 如果注册成功且有用户数据，执行 Profile 记录插入
  if (data.user) {
    try {
      const { error: insertError } = await supabase.from('profiles').insert([
        { 
          id: data.user.id, 
          email: data.user.email, 
          role: 'user' 
        }
      ]);
      if (insertError) console.warn("Profile insertion notice:", insertError.message);
    } catch (err) {
      console.error("Critical error during profile initialization:", err);
    }
  }
  
  return data;
}

/**
 * 传统的邮箱密码登录
 */
export async function signInWithPassword(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data.session;
}

/**
 * 发送 OTP 验证码。如果邮箱未注册，将根据 shouldCreateUser 自动创建。
 */
export async function signInWithEmailOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      shouldCreateUser: true, // 允许验证码自动注册
    }
  });
  if (error) throw error;
}

/**
 * 校验 6 位 OTP 令牌
 */
export async function verifyOtp(email: string, token: string, type: 'email' | 'signup' | 'magiclink' = 'email') {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type
  });
  if (error) throw error;
  return data.session;
}

/**
 * 第三方 Google 登录集成
 */
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
};

/**
 * 更新当前登录用户的密码
 */
export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
  return data;
}

// --- 管理员特权服务 ---

export const adminApi = {
  checkAdminStatus: async (userId: string) => {
    if (!userId) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) return false;
    return data?.role === 'admin';
  },

  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getSleepRecords: async () => {
    const { data, error } = await supabase
      .from('sleep_records')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getFeedback: async () => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getAuditLogs: async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  deleteRecord: async (table: string, id: string) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  updateUserRole: async (id: string, role: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id);
    if (error) throw error;
  },

  updateSleepRecord: async (id: string, updates: any) => {
    const { error } = await supabase
      .from('sleep_records')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  resolveFeedback: async (id: string) => {
    const { error } = await supabase
      .from('feedback')
      .update({ status: 'resolved' })
      .eq('id', id);
    if (error) throw error;
  }
};