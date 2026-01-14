
import { supabase } from '../lib/supabaseClient.ts';

// --- Auth Services ---

export async function signUpWithPassword(email: string, pass: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { 
      emailRedirectTo: window.location.origin,
      data: {
        role: 'user' // Default role
      }
    }
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

export async function signInWithEmailOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      shouldCreateUser: true, // Enabled registration via OTP
    }
  });
  if (error) throw error;
}

export async function verifyOtp(email: string, token: string, type: 'email' | 'signup' | 'recovery' = 'email') {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type
  });
  if (error) throw error;
  return data.session;
}

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
};

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: password
  });
  if (error) throw error;
  return data;
}

// --- Admin Services ---

export const adminApi = {
  checkAdminStatus: async (userId: string) => {
    if (!userId) return false;
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) return false;
    return data?.role === 'admin';
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  updateUserRole: async (id: string, role: 'user' | 'admin') => {
    const { error } = await supabase.from('users').update({ role }).eq('id', id);
    if (error) throw error;
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

  updateSleepRecord: async (id: string, updates: any) => {
    const { error } = await supabase.from('sleep_records').update(updates).eq('id', id);
    if (error) throw error;
  },

  resolveFeedback: async (id: string) => {
    const { error } = await supabase.from('feedback').update({ status: 'resolved' }).eq('id', id);
    if (error) throw error;
  }
};
