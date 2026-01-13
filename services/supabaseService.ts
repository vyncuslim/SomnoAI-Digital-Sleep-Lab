
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * AUTHENTICATION PROTOCOLS
 */

export const sendEmailOTP = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

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
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
};

/**
 * RBAC & COMMAND CENTER API
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
      if (error.code === '42P01') throw new Error("DB_SCHEMA_MISSING: The 'profiles' table does not exist.");
      throw error;
    }
    return data || [];
  },
  
  updateUserRole: async (id: string, isAdmin: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', id);
    if (error) throw error;
  },

  getSleepRecords: async () => {
    const { data, error } = await supabase.from('sleep_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  updateSleepRecord: async (id: string, updates: any) => {
    const { error } = await supabase.from('sleep_records').update(updates).eq('id', id);
    if (error) throw error;
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  resolveFeedback: async (id: string) => {
    const { error } = await supabase.from('feedback').update({ status: 'resolved' }).eq('id', id);
    if (error) throw error;
  },

  getAuditLogs: async () => {
    return [
      { id: '1', action: 'ACCESS_GRANTED', user: 'system', timestamp: new Date().toISOString() },
      { id: '2', action: 'RECORD_PURGED', user: 'admin_primary', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ];
  },

  deleteRecord: async (table: 'profiles' | 'sleep_records' | 'feedback', id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  }
};
