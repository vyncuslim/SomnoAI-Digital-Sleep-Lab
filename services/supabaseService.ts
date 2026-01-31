import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

/**
 * 核心系统审计日志
 */
export const logAuditLog = async (action: string, details: string, level: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert([{
      action,
      details,
      level,
      user_id: user?.id,
      timestamp: new Date().toISOString()
    }]);
    
    if (level === 'CRITICAL' || level === 'WARNING') {
      await notifyAdmin(`🚨 SYSTEM_AUDIT [${level}]\nACTION: ${action}\nDETAILS: ${details}\nOP: ${user?.email || 'SYSTEM'}`);
    }
  } catch (e) {
    console.error("Audit log failed:", e);
  }
};

const logSecurityEvent = async (email: string, type: string, details: string) => {
  try {
    await supabase.rpc('log_security_event', { email, event_type: type, details });
    
    if (type === 'LOGIN_FAIL' || type === 'SECURITY_BREACH') {
      await notifyAdmin(`⚠️ SECURITY_ALERT: [${type}] detected for ${email}.\nReason: ${details}`);
    }
  } catch (e) {
    console.warn("Security logger unreachable");
  }
};

/**
 * Auth API Layer
 */
export const authApi = {
  signInWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
  },
  signIn: async (email: string, password: string, captchaToken?: string) => {
    const res = await supabase.auth.signInWithPassword({ 
      email, 
      password,
      options: { captchaToken }
    });
    if (res.error) {
      await logSecurityEvent(email, 'LOGIN_FAIL', res.error.message);
    } else {
      await logSecurityEvent(email, 'LOGIN_SUCCESS', 'Node verified');
      await logAuditLog('USER_LOGIN', `Successful login for ${email}`);
    }
    return res;
  },
  signUp: async (email: string, password: string, options: any, captchaToken?: string) => {
    const res = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { ...options, captchaToken } 
    });
    if (!res.error) {
      await logSecurityEvent(email, 'REGISTRATION', 'New node request');
      await logAuditLog('USER_SIGNUP', `New account created: ${email}`);
    }
    return res;
  },
  sendOTP: async (email: string, captchaToken?: string) => {
    const res = await supabase.auth.signInWithOtp({ 
      email,
      options: { captchaToken }
    });
    if (res.error) await logSecurityEvent(email, 'OTP_FAIL', res.error.message);
    else await logSecurityEvent(email, 'OTP_SENT', 'Handshake token dispatched');
    return res;
  },
  verifyOTP: async (email: string, token: string) => {
    const res = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (res.error) await logSecurityEvent(email, 'OTP_VERIFY_FAIL', res.error.message);
    else {
      await logSecurityEvent(email, 'OTP_VERIFY_SUCCESS', 'Identity confirmed');
      await logAuditLog('OTP_VERIFY', `Identity verified via OTP: ${email}`);
    }
    return res;
  },
  signOut: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await logAuditLog('USER_LOGOUT', `Session terminated: ${user.email}`);
    return await supabase.auth.signOut();
  }
};

/**
 * Unified Admin API
 */
export const adminApi = {
  getAdminClearance: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_my_detailed_profile');
    return data?.[0] || null;
  },
  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data } = await supabase.rpc('get_my_detailed_profile');
      if (!data || data.length === 0) return false;
      const p = data[0];
      return ['admin', 'owner'].includes(p.role?.toLowerCase()) || p.is_super_owner === true;
    } catch { return false; }
  },
  getUsers: async () => {
    const { data } = await supabase.rpc('admin_get_all_profiles');
    return data || [];
  },
  getTableData: async (tableName: string, limit = 100) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) {
      const { data: fallbackData, error: fallbackError } = await supabase.from(tableName).select('*').limit(limit);
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }
    return data;
  },
  getTableCount: async (tableName: string) => {
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },
  getSecurityEvents: async (limit = 50) => {
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(limit);
    return data || [];
  },
  toggleBlock: async (id: string, email: string, currentlyBlocked: boolean) => {
    const newState = !currentlyBlocked;
    const { error } = await supabase.rpc('admin_toggle_block', { target_user_id: id });
    if (!error) {
      await logAuditLog('ADMIN_USER_BLOCK', `${newState ? 'BLOCKED' : 'UNBLOCKED'} user ${email}`, newState ? 'WARNING' : 'INFO');
    }
    return { error };
  },
  updateUserRole: async (id: string, email: string, newRole: string) => {
    const { error } = await supabase.rpc('admin_update_user_role', { target_user_id: id, new_role: newRole });
    if (!error) {
      await logAuditLog('ADMIN_ROLE_CHANGE', `User ${email} clearance updated to ${newRole.toUpperCase()}`, 'CRITICAL');
    }
    return { error };
  },
  getDailyAnalytics: async (days: number = 30) => {
    const { data } = await supabase.from('analytics_daily').select('*').order('date', { ascending: true }).limit(days);
    return data || [];
  },
  getCountryRankings: async () => {
    const { data } = await supabase.from('analytics_country').select('country, users').order('users', { ascending: false }).limit(10);
    return data || [];
  },
  getRealtimePulse: async () => {
    const { data } = await supabase.from('analytics_realtime').select('*').order('timestamp', { ascending: false }).limit(1);
    return data || [];
  }
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};

export const userDataApi = {
  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_data').select('*').eq('id', user.id).single();
    return data;
  },
  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from('user_data').upsert({ user_id: user.id, ...updates });
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user?.id);
    await supabase.from('user_data').upsert({ user_id: user?.id, ...metrics });
    return { success: true };
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { data, error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (error) return { success: false, error };
    await notifyAdmin(`📩 NEW FEEDBACK\nType: ${type.toUpperCase()}\nFrom: ${email}\nContent: ${content}`);
    return { success: true };
  }
};

export const diaryApi = {
  getEntries: async () => {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*, profiles(full_name, email)') 
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data;
  },
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('diary_entries').insert([{ content, mood, user_id: user?.id }]).select().single();
    if (error) throw error;
    return data;
  },
  deleteEntry: async (id: string) => {
    await supabase.from('diary_entries').delete().eq('id', id);
  }
};