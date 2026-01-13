
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 身份验证服务 (Auth Core)
 * 使用 OTP (验证码) 模式，兼容 Magic Link
 */

// 1. 发送验证码 (Token) 或 登录链接
export async function signInWithEmailOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/admin', // 如果点击链接则跳转
      shouldCreateUser: true,
    }
  });
  if (error) throw error;
}

// 2. 验证 6 位 OTP 令牌
export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data.session;
}

// 3. Google 第三方集成
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
 * 管理后台 API (Admin Control Plane)
 */
export const adminApi = {
  // 前端守卫：核验管理员角色
  checkAdminStatus: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) return false;
      return data?.role === 'admin';
    } catch {
      return false;
    }
  },

  // 获取受试者列表 (受 RLS 保护)
  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // 获取睡眠原始数据
  getSleepRecords: async () => {
    const { data, error } = await supabase
      .from('sleep_records')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // 反馈记录
  getFeedback: async () => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // 审计日志 (只读)
  getAuditLogs: async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  // 删除指令
  deleteRecord: async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  // 角色权限更新
  updateUserRole: async (id: string, role: 'user' | 'admin') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id);
    if (error) throw error;
  },

  // 反馈状态处理
  resolveFeedback: async (id: string) => {
    const { error } = await supabase
      .from('feedback')
      .update({ status: 'resolved' })
      .eq('id', id);
    if (error) throw error;
  },

  // 更新睡眠记录
  updateSleepRecord: async (id: string, updates: any) => {
    const { error } = await supabase
      .from('sleep_records')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  }
};
