/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Audit Log Helper
export const logAuditLog = async (userId: string, action: string, details: string | Record<string, any>) => {
  try {
    const { error } = await supabase.from('audit_logs').insert([{
      user_id: userId,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details)
    }]);
    return { error };
  } catch (err) {
    console.error("Audit log failed:", err);
    return { error: err };
  }
};

// Admin API
export const adminApi = {
  getUsers: async () => supabase.from('profiles').select('*'),
  getFeedback: async () => supabase.from('feedback').select('*'),
  getAuditLogs: async () => supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
  getSecurityEvents: async () => supabase.from('security_events').select('*').order('created_at', { ascending: false }),
  updateUserRole: async (id: string, role: string) => supabase.from('profiles').update({ role }).eq('id', id),
  getSettings: async () => supabase.from('app_settings').select('*'),
  updateSetting: async (key: string, value: string) => supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() })
};

// Feedback API
export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert([{ type, content, email }]);
    return { success: !error, error };
  }
};

// Diary API
export const diaryApi = {
  getEntries: async (userId: string) => supabase.from('diary_entries').select('*').eq('user_id', userId),
  saveEntry: async (userId: string, entry: Record<string, any>) => supabase.from('diary_entries').insert([{ ...entry, user_id: userId }]),
  deleteEntry: async (id: string) => supabase.from('diary_entries').delete().eq('id', id)
};

// Auth API
export const authApi = {
  updatePassword: async (password: string) => supabase.auth.updateUser({ password })
};

// User API
export const userApi = {
  getProfile: async (id: string) => supabase.from('profiles').select('*').eq('id', id).single(),
  updateProfile: async (id: string, updates: Partial<UserProfile>) => supabase.from('profiles').update(updates).eq('id', id)
};

// User Data API
export const userDataApi = {
  saveInitialSetup: async (userId: string, data: Partial<UserProfile>) => supabase.from('profiles').update({ ...data, setup_completed: true }).eq('id', userId),
  completeSetup: async (userId: string, data: Partial<UserProfile>) => supabase.from('profiles').update({ ...data, setup_completed: true }).eq('id', userId)
};
