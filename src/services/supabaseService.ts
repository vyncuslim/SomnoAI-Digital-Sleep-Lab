/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client
export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) : {
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Supabase not configured' }) }), order: () => ({ data: null, error: 'Supabase not configured' }), select: () => ({ data: null, error: 'Supabase not configured' }) }),
    insert: () => ({ data: null, error: 'Supabase not configured' }),
    upsert: () => ({ data: null, error: 'Supabase not configured' }),
    delete: () => ({ data: null, error: 'Supabase not configured' }),
    update: () => ({ data: null, error: 'Supabase not configured' }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signInWithOtp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    verifyOtp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    resend: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  },
  rpc: () => Promise.resolve({ data: null, error: 'Supabase not configured' })
} as any;

// Error Logging Helper
export const logError = async (userId: string | null, error: any, context: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'CRITICAL') => {
  try {
    const { error: logErr } = await supabase.rpc('log_error', {
      p_user_id: userId,
      p_error_message: error instanceof Error ? error.message : String(error),
      p_error_stack: error instanceof Error ? error.stack : null,
      p_context: context,
      p_severity: severity,
      p_details: typeof error === 'object' ? error : { raw: String(error) }
    });
    return { error: logErr };
  } catch (err) {
    console.warn("Error log failed:", err);
    return { error: err };
  }
};

// Audit Log Helper
export const logAuditLog = async (userId: string | null, action: string, details: string | Record<string, any>) => {
  try {
    const { error } = await supabase.rpc('write_audit_log', {
      p_actor_user_id: userId,
      p_action: action,
      p_message: typeof details === 'string' ? details : JSON.stringify(details),
      p_metadata: typeof details === 'object' ? details : { details },
      p_source: 'web',
      p_level: 'info',
      p_category: 'auth',
      p_status: 'success'
    });
    return { error };
  } catch (err) {
    console.warn("Audit log failed:", err);
    return { error: err };
  }
};

// Security Event Helper
export const logSecurityEvent = async (userId: string | null, type: string, details: string | Record<string, any>) => {
  try {
    const { error } = await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_type: type,
      p_details: typeof details === 'object' ? details : { details },
      p_severity: 'INFO'
    });
    return { error };
  } catch (err) {
    console.warn("Security event log failed:", err);
    return { error: err };
  }
};

// Admin API
export const adminApi = {
  getUsers: async () => supabase.from('profiles').select('*'),
  getFeedback: async () => supabase.from('feedback').select('*'),
  getAuditLogs: async () => supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
  getSecurityEvents: async () => supabase.from('security_events').select('*').order('created_at', { ascending: false }),
  updateUserRole: async (adminId: string, id: string, role: string) => {
    const result = await supabase.from('profiles').update({ role }).eq('id', id);
    if (!result.error) await logAuditLog(adminId, 'UPDATE_USER_ROLE', { target_user_id: id, new_role: role });
    return result;
  },
  getSettings: async () => supabase.from('app_settings').select('*'),
  updateSetting: async (adminId: string, key: string, value: string) => {
    const result = await supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() });
    if (!result.error) await logAuditLog(adminId, 'UPDATE_SETTING', { key, value });
    return result;
  },
  getAuthUsers: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/admin/auth-users', {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    if (!response.ok || (contentType && !contentType.includes('application/json'))) {
      console.warn('Auth users API failed or returned non-JSON.');
      throw new Error('Failed to fetch auth users: Invalid response format.');
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Failed to parse auth users as JSON.');
    }
  },
  getSchemaInfo: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/admin/schema', {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    if (!response.ok || (contentType && !contentType.includes('application/json'))) {
      console.warn('Schema info API failed or returned non-JSON.');
      throw new Error('Failed to fetch schema info: Invalid response format.');
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Failed to parse schema info as JSON.');
    }
  }
};

// Feedback API
export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (!error) await logAuditLog(email, 'SUBMIT_FEEDBACK', { type, content });
    return { success: !error, error };
  }
};

// Diary API
export const diaryApi = {
  getEntries: async (userId: string) => supabase.from('diary_entries').select('*').eq('user_id', userId),
  saveEntry: async (userId: string, entry: Record<string, any>) => {
    const result = await supabase.from('diary_entries').insert([{ ...entry, user_id: userId }]);
    if (!result.error) await logAuditLog(userId, 'SAVE_DIARY_ENTRY', entry);
    return result;
  },
  deleteEntry: async (userId: string, id: string) => {
    const result = await supabase.from('diary_entries').delete().eq('id', id);
    if (!result.error) await logAuditLog(userId, 'DELETE_DIARY_ENTRY', { entry_id: id });
    return result;
  }
};

// Auth API
export const authApi = {
  updatePassword: async (userId: string, password: string) => {
    const result = await supabase.auth.updateUser({ password });
    if (!result.error) await logAuditLog(userId, 'UPDATE_PASSWORD', {});
    return result;
  }
};

// User API
export const userApi = {
  getProfile: async (id: string) => supabase.from('profiles').select('*').eq('id', id).single(),
  updateProfile: async (id: string, updates: Partial<UserProfile>) => {
    const result = await supabase.from('profiles').update(updates).eq('id', id);
    if (!result.error) await logAuditLog(id, 'UPDATE_PROFILE', updates);
    return result;
  }
};

// User Data API
export const userDataApi = {
  saveInitialSetup: async (userId: string, data: Partial<UserProfile>) => {
    const result = await supabase.from('profiles').update({ ...data, setup_completed: true }).eq('id', userId);
    if (!result.error) await logAuditLog(userId, 'SAVE_INITIAL_SETUP', data);
    return result;
  },
  completeSetup: async (userId: string, data: Partial<UserProfile>) => {
    const result = await supabase.from('profiles').update({ ...data, setup_completed: true }).eq('id', userId);
    if (!result.error) await logAuditLog(userId, 'COMPLETE_SETUP', data);
    return result;
  }
};
