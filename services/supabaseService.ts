
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 实验室安全认证协议
 */

// 1. 注册新身份：记录 Email 和 密码，并触发确认邮件
export const signUpWithEmailPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    }
  });
  if (error) throw error;
  return data;
};

// 2. 登录验证：第一步验证密码
export const signInWithEmailPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
};

// 3. 发送二次验证码：验证密码成功后触发
export const sendEmailOTP = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // 必须是已确认的注册用户
      emailRedirectTo: null as any 
    }
  });
  if (error) throw error;
};

// 4. 最终验证动态码
export const verifyEmailOTP = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data.session;
};

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
 * 后台管理 API
 */
export const adminApi = {
  checkAdminStatus: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      if (error) return false;
      return data?.is_admin || false;
    } catch {
      return false;
    }
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      // Throw specific error for AdminView to detect missing schema
      if (error.code === 'PGRST116' || error.message?.includes('relation')) {
        throw new Error('DB_SCHEMA_MISSING');
      }
      throw error;
    }
    return data || [];
  },

  // Added method to fetch sleep records for admin view
  getSleepRecords: async () => {
    const { data, error } = await supabase.from('sleep_records').select('*').order('created_at', { ascending: false });
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation')) {
        throw new Error('DB_SCHEMA_MISSING');
      }
      throw error;
    }
    return data || [];
  },

  // Added method to fetch user feedback for admin view
  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation')) {
        throw new Error('DB_SCHEMA_MISSING');
      }
      throw error;
    }
    return data || [];
  },

  // Added method to fetch audit logs (graceful failure for optional tables)
  getAuditLogs: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  // Added method to delete a generic record by table and ID
  deleteRecord: async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  // Added method to update sleep record data
  updateSleepRecord: async (id: string, updates: any) => {
    const { error } = await supabase.from('sleep_records').update(updates).eq('id', id);
    if (error) throw error;
  },

  // Added method to mark feedback as resolved
  resolveFeedback: async (id: string) => {
    const { error } = await supabase.from('feedback').update({ status: 'resolved' }).eq('id', id);
    if (error) throw error;
  },
  
  updateUserRole: async (id: string, isAdmin: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', id);
    if (error) throw error;
  }
};
