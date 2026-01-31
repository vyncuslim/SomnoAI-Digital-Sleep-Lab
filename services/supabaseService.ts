
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';

export { supabase };

/**
 * 高可靠审计协议
 */
export const logAuditLog = async (action: string, details: string, level: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
  const sensitiveActions = ['ADMIN_ROLE_CHANGE', 'SECURITY_BREACH_ATTEMPT', 'SYSTEM_EXCEPTION', 'ROOT_NODE_PROTECTION_TRIGGER', 'ADMIN_MANUAL_SYNC'];
  const shouldNotify = level === 'CRITICAL' || level === 'WARNING' || sensitiveActions.includes(action);

  if (shouldNotify) {
    notifyAdmin(`🚨 [${level}] ${action}\nNODE: ${window.location.hostname}\nDATA: ${details}\nTIME: ${new Date().toISOString()}`);
  }

  try {
    const { data: { session } } = await (supabase.auth as any).getSession();
    // 强制使用 p_ 前缀匹配数据库函数定义，增加捕获处理
    await supabase.rpc('log_audit_entry', {
      p_action: action,
      p_details: details,
      p_level: level,
      p_user_id: session?.user?.id || null
    });
  } catch (e) {
    console.debug("Audit registry link severed.");
  }
};

/**
 * 实时安全事件注入
 */
const logSecurityEvent = async (email: string, type: string, details: string) => {
  try {
    const targetEmail = email.trim().toLowerCase();
    await supabase.rpc('log_security_event', { 
      p_email: targetEmail, 
      p_event_type: type, 
      p_details: details 
    });
  } catch (e) {
    console.debug("Security pulse offline.");
  }
};

/**
 * Auth 强化模块
 */
export const authApi = {
  signInWithGoogle: async () => {
    await logAuditLog('OAUTH_START', 'Redirecting to Google provider');
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
    await logSecurityEvent(targetEmail, 'LOGIN_ATTEMPT', 'Sequence initiated via Password');
    const res = await (supabase.auth as any).signInWithPassword({ 
      email: targetEmail, 
      password,
      options: { captchaToken }
    });
    if (res.error) {
      await logSecurityEvent(targetEmail, 'LOGIN_FAIL', `Error: ${res.error.message}`);
      await logAuditLog('LOGIN_ATTEMPT_FAIL', `Email: ${targetEmail}, Reason: ${res.error.message}`, 'WARNING');
    } else {
      await logSecurityEvent(targetEmail, 'LOGIN_SUCCESS', 'Session handshake complete');
      await logAuditLog('USER_LOGIN', `Identity confirmed: ${targetEmail}`);
    }
    return res;
  },
  signUp: async (email: string, password: string, options: any, captchaToken?: string) => {
    const targetEmail = email.trim().toLowerCase();
    await logSecurityEvent(targetEmail, 'SIGNUP_ATTEMPT', 'New registration initiated');
    const res = await (supabase.auth as any).signUp({ 
      email: targetEmail, 
      password, 
      options: { ...options, captchaToken } 
    });
    if (res.error) {
      await logSecurityEvent(targetEmail, 'SIGNUP_FAIL', res.error.message);
    } else {
      await logSecurityEvent(targetEmail, 'SIGNUP_SUCCESS', 'New user node registered');
      await logAuditLog('USER_SIGNUP', `Registered: ${targetEmail}`);
    }
    return res;
  },
  sendOTP: async (email: string, captchaToken?: string) => {
    const targetEmail = email.trim().toLowerCase();
    const res = await (supabase.auth as any).signInWithOtp({ 
      email: targetEmail,
      options: { captchaToken }
    });
    if (res.error) {
      await logSecurityEvent(targetEmail, 'OTP_FAIL', res.error.message);
    } else {
      await logSecurityEvent(targetEmail, 'OTP_SENT', 'Handshake token dispatched');
    }
    return res;
  },
  verifyOTP: async (email: string, token: string) => {
    const targetEmail = email.trim().toLowerCase();
    const res = await (supabase.auth as any).verifyOtp({ email: targetEmail, token, type: 'email' });
    if (res.error) {
      await logSecurityEvent(targetEmail, 'OTP_VERIFY_FAIL', res.error.message);
    } else {
      await logSecurityEvent(targetEmail, 'OTP_VERIFY_SUCCESS', 'Handshake confirmed via OTP');
      await logAuditLog('OTP_VERIFY_SUCCESS', `Confirmed: ${targetEmail}`);
    }
    return res;
  },
  resetPassword: async (email: string) => {
    const res = await (supabase.auth as any).resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#settings`
    });
    if (!res.error) {
      await logSecurityEvent(email, 'PW_RESET_REQUEST', 'Password recovery sequence triggered');
    }
    return res;
  },
  signOut: async () => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    if (session?.user) {
      await logSecurityEvent(session.user.email || 'unknown', 'LOGOUT', 'Manual termination');
      await logAuditLog('USER_LOGOUT', `Terminated: ${session.user.email}`);
    }
    return await (supabase.auth as any).signOut();
  }
};

/**
 * 管理端核心 API
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
    // 智能探针协议：自动尝试可能存在的时间列，防止 400 错误
    const probes = ['created_at', 'date', 'timestamp', 'recorded_at'];
    
    // 如果是分析相关的表，优先尝试 'date'
    if (tableName.includes('analytics')) probes.unshift('date');

    for (const col of Array.from(new Set(probes))) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order(col, { ascending: false })
          .limit(limit);
        
        if (!error) return data || [];
      } catch (e) { /* 继续探测下一个 */ }
    }

    // 最终兜底：无序查询
    try {
      const { data } = await supabase.from(tableName).select('*').limit(limit);
      return data || [];
    } catch { return []; }
  },
  getTableCount: async (tableName: string) => {
    try {
      const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    } catch { return 0; }
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
