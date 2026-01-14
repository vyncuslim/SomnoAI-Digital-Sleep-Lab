
import { supabase } from '../lib/supabaseClient.ts';

// --- 身份验证增强 (Auth Enhancement) ---

export async function signUpWithPassword(email: string, pass: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data.session;
}

export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
  return data;
}

/**
 * 发送 Magic Link / OTP。
 * 建议在 redirectTo 中始终指向根目录。
 */
export async function signInWithEmailOTP(email: string, isSignUp: boolean = false) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      shouldCreateUser: isSignUp, // 仅在注册模式下创建新用户
    }
  });
  if (error) {
    if (error.message.includes('fetch')) {
      throw new Error("Network Error: Failed to reach identity server.");
    }
    throw error;
  }
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data.session;
}

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // 必须指向根目录处理 Hash
    },
  });
  if (error) throw error;
};

// --- 管理员 API (Admin API) ---

export const adminApi = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  checkAdminStatus: async (userId: string) => {
    if (!userId) return false;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    return data?.role === 'admin';
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getSleepRecords: async () => {
    const { data, error } = await supabase.from('sleep_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getAuditLogs: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  deleteRecord: async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  updateUserRole: async (id: string, role: 'user' | 'admin') => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw error;
  },

  updateSleepRecord: async (id: string, updates: any) => {
    const { error } = await supabase.from('sleep_records').update(updates).eq('id', id);
    if (error) throw error;
  },

  resolveFeedback: async (id: string) => {
    const { error } = await supabase.from('feedback').update({ status: 'resolved' }).eq('id', id);
    if (error) throw error;
  }
};
