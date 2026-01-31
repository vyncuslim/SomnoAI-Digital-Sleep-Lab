
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

/**
 * Enhanced Audit Protocol
 * Uses RPC with SECURITY DEFINER to ensure logs are committed even during 
 * sensitive auth transitions where RLS might block direct inserts.
 */
export const logAuditLog = async (action: string, details: string, level: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
  const sensitiveActions = ['ADMIN_ROLE_CHANGE', 'SECURITY_BREACH_ATTEMPT', 'SYSTEM_EXCEPTION', 'ROOT_NODE_PROTECTION_TRIGGER'];
  const shouldNotify = level === 'CRITICAL' || level === 'WARNING' || sensitiveActions.includes(action);

  if (shouldNotify) {
    notifyAdmin(`🚨 [${level}] ${action}\nNODE_ID: ${window.location.hostname}\nLOG: ${details}\nTIMESTAMP: ${new Date().toISOString()}`);
  }

  try {
    const { data: { user } } = await (supabase.auth as any).getUser();
    // Use RPC instead of direct insert to avoid RLS write permission issues
    await supabase.rpc('log_audit_entry', {
      p_action: action,
      p_details: details,
      p_level: level,
      p_user_id: user?.id || null
    });
  } catch (e) {
    console.debug("Audit registry link severed.");
  }
};

/**
 * High-Precision Error Reporting
 */
export const reportError = async (message: string, stack?: string, source: string = 'FRONTEND_RUNTIME') => {
  const noise = [
    'Location.href', 'named property', 'SecurityError', 'cross-origin', 
    'AbortError', 'Extensions', 'Salesmartly', 'Google is not defined'
  ];
  
  if (noise.some(n => message.includes(n))) return;

  const context = `SOURCE: ${source}\nMSG: ${message}\nUA: ${navigator.userAgent}\nLOC: ${window.location.href}${stack ? `\n\nSTACK:\n${stack.slice(0, 400)}` : ''}`;
  await logAuditLog('RUNTIME_EXCEPTION', context, 'CRITICAL');
};

const logSecurityEvent = async (email: string, type: string, details: string) => {
  try {
    await supabase.rpc('log_security_event', { email, event_type: type, details });
    if (['LOGIN_FAIL', 'SECURITY_BREACH', 'OTP_FAIL', 'RATE_LIMIT'].includes(type)) {
      notifyAdmin(`⚠️ SECURITY_SIGNAL: ${type}\nSUBJECT: ${email}\nINFO: ${details}`);
    }
  } catch (e) {
    console.debug("Security pulse offline.");
  }
};

/**
 * Auth API
 */
export const authApi = {
  signInWithGoogle: async () => {
    return await (supabase.auth as any).signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
  },
  signIn: async (email: string, password: string, captchaToken?: string) => {
    const targetEmail = email.trim().toLowerCase();
    const res = await (supabase.auth as any).signInWithPassword({ 
      email, 
      password,
      options: { captchaToken }
    });
    
    if (res.error) {
      await logSecurityEvent(targetEmail, 'LOGIN_FAIL', res.error.message);
      await logAuditLog('LOGIN_ATTEMPT_FAIL', `Node: ${targetEmail}, Reason: ${res.error.message}`, 'WARNING');
    } else {
      await logSecurityEvent(targetEmail, 'LOGIN_SUCCESS', 'Session established via Password');
      await logAuditLog('USER_LOGIN', `Identity established: ${targetEmail}`);
    }
    return res;
  },
  signUp: async (email: string, password: string, options: any, captchaToken?: string) => {
    const targetEmail = email.trim().toLowerCase();
    const res = await (supabase.auth as any).signUp({ 
      email, 
      password, 
      options: { ...options, captchaToken } 
    });
    
    if (res.error) {
      await logSecurityEvent(targetEmail, 'SIGNUP_FAIL', res.error.message);
    } else {
      await logSecurityEvent(targetEmail, 'SIGNUP_SUCCESS', 'New subject node registered');
      await logAuditLog('USER_SIGNUP', `New subject node registered: ${targetEmail}`);
    }
    return res;
  },
  sendOTP: async (email: string, captchaToken?: string) => {
    const targetEmail = email.trim().toLowerCase();
    const res = await (supabase.auth as any).signInWithOtp({ 
      email,
      options: { captchaToken }
    });
    
    if (res.error) {
      await logSecurityEvent(targetEmail, 'OTP_FAIL', res.error.message);
    } else {
      await logSecurityEvent(targetEmail, 'OTP_SENT', 'Protocol token dispatched');
    }
    return res;
  },
  verifyOTP: async (email: string, token: string) => {
    const targetEmail = email.trim().toLowerCase();
    const res = await (supabase.auth as any).verifyOtp({ email, token, type: 'email' });
    
    if (res.error) {
      await logSecurityEvent(targetEmail, 'OTP_VERIFY_FAIL', res.error.message);
    } else {
      await logSecurityEvent(targetEmail, 'OTP_VERIFY_SUCCESS', 'Auth handshake confirmed via OTP');
      await logAuditLog('OTP_VERIFY_SUCCESS', `Auth handshake confirmed: ${targetEmail}`);
    }
    return res;
  },
  resetPassword: async (email: string) => {
    const res = await (supabase.auth as any).resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#settings`
    });
    if (!res.error) {
      await logSecurityEvent(email, 'PW_RESET_REQUEST', 'Password recovery protocol initiated');
      await logAuditLog('AUTH_RESET_REQUEST', `Password recovery protocol initiated for: ${email}`);
    }
    return res;
  },
  signOut: async () => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (user) {
      await logSecurityEvent(user.email || 'unknown', 'LOGOUT', 'Manual session severance');
      await logAuditLog('USER_LOGOUT', `Manual session severance: ${user.email}`);
    }
    return await (supabase.auth as any).signOut();
  }
};

/**
 * Unified Admin Registry
 */
export const adminApi = {
  getAdminClearance: async (userId: string) => {
    const { data } = await supabase.rpc('get_my_detailed_profile');
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
      const { data: fallbackData } = await supabase.from(tableName).select('*').limit(limit);
      return fallbackData || [];
    }
    return data || [];
  },
  getTableCount: async (tableName: string) => {
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },
  getSecurityEvents: async (limit = 50) => {
    const { data } = await supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  },
  toggleBlock: async (id: string, email: string, currentlyBlocked: boolean) => {
    const newState = !currentlyBlocked;
    const { error } = await supabase.rpc('admin_toggle_block', { target_user_id: id });
    if (!error) await logAuditLog('ADMIN_USER_BLOCK', `${newState ? 'BLOCKED' : 'UNBLOCKED'} node ${email}`, newState ? 'WARNING' : 'INFO');
    return { error };
  },
  updateUserRole: async (id: string, email: string, newRole: string) => {
    const { error } = await supabase.rpc('admin_update_user_role', { target_user_id: id, new_role: newRole });
    if (!error) await logAuditLog('ADMIN_ROLE_CHANGE', `Clearance shift: ${email} -> ${newRole.toUpperCase()}`, 'CRITICAL');
    return { error };
  },
  getDailyAnalytics: async (days: number = 30) => {
    const { data } = await supabase.from('analytics_daily').select('*').order('date', { ascending: true }).limit(days);
    return data || [];
  }
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};

export const userDataApi = {
  getUserData: async () => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_data').select('*').eq('id', user.id).single();
    return data;
  },
  updateUserData: async (updates: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    return await supabase.from('user_data').upsert({ user_id: user.id, ...updates });
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user?.id);
    await supabase.from('user_data').upsert({ user_id: user?.id, ...metrics });
    return { success: true };
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (error) return { success: false, error };
    notifyAdmin(`📩 FEEDBACK_SIGNAL\nTYPE: ${type.toUpperCase()}\nFROM: ${email}\nDATA: ${content}`);
    return { success: true };
  }
};

export const diaryApi = {
  getEntries: async () => {
    const { data, error } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return data;
  },
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    const { data, error } = await supabase.from('diary_entries').insert([{ content, mood, user_id: user?.id }]).select().single();
    if (error) throw error;
    return data;
  },
  deleteEntry: async (id: string) => {
    await supabase.from('diary_entries').delete().eq('id', id);
  }
};
