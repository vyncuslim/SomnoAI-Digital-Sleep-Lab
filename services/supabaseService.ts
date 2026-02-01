
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';
import { emailService } from './emailService.ts';

export { supabase };

/**
 * SOMNO LAB AUDIT PROTOCOL v15.1
 * Features: Direct table injection with error suppression and mirrored alerts.
 */
export const logAuditLog = async (action: string, details: string, level: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
  const actionKey = action.toUpperCase();
  
  const sensitiveActions = [
    'ADMIN_ROLE_CHANGE', 'ADMIN_USER_BLOCK', 'SECURITY_BREACH_ATTEMPT', 
    'SYSTEM_EXCEPTION', 'ADMIN_MANUAL_SYNC', 'USER_LOGIN', 'USER_SIGNUP',
    'OTP_VERIFY_SUCCESS', 'RUNTIME_ERROR', 'ASYNC_HANDSHAKE_VOID',
    'PW_UPDATE_SUCCESS', 'PERMISSION_DENIED', 'GA4_SYNC_FAILURE'
  ];
  
  const shouldNotify = level === 'CRITICAL' || level === 'WARNING' || sensitiveActions.includes(actionKey);

  try {
    const { data: { session } } = await (supabase.auth as any).getSession();
    const currentPath = typeof window !== 'undefined' ? 
      (window.location.hash.replace(/^#\/?/, '') || 'home') : 'cloud_logic';

    // 1. 发送 Telegram/邮件通知
    if (shouldNotify) {
      const source = actionKey.startsWith('ADMIN_') || currentPath.includes('admin') 
        ? 'ADMIN_CONSOLE' : 'USER_TERMINAL';

      const alertPayload = {
        source,
        path: currentPath,
        type: actionKey,
        message: details,
        error: level === 'CRITICAL' ? details : undefined
      };

      await Promise.allSettled([
        notifyAdmin(alertPayload),
        emailService.sendAdminAlert(alertPayload)
      ]);
    }

    // 2. 将日志存入数据库
    await supabase.from('audit_logs').insert([{
      action: actionKey,
      details: details,
      level: level,
      user_id: session?.user?.id || null
    }]).select('id');
    
  } catch (e) {
    console.debug("Audit record deferred due to link latency.");
  }
};

/**
 * SECURITY PULSE INGRESS
 */
const logSecurityEvent = async (email: string, type: string, details: string) => {
  try {
    const targetEmail = email.trim().toLowerCase();
    await supabase.from('security_events').insert([{ 
      email: targetEmail, 
      event_type: type, 
      event_reason: details 
    }]);
  } catch (e) {}
};

/**
 * AUTH API
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
    await logSecurityEvent(targetEmail, 'LOGIN_ATTEMPT', 'Handshake initiated');
    
    const res = await (supabase.auth as any).signInWithPassword({ 
      email: targetEmail, 
      password,
      options: { captchaToken }
    });

    if (res.error) {
      await logSecurityEvent(targetEmail, 'LOGIN_FAIL', `Error: ${res.error.message}`);
      await logAuditLog('LOGIN_ATTEMPT_FAIL', `Email: ${targetEmail}, Reason: ${res.error.message}`, 'WARNING');
    }
    return res;
  },
  signUp: async (email: string, password: string, options: any, captchaToken?: string) => {
    const targetEmail = email.trim().toLowerCase();
    const res = await (supabase.auth as any).signUp({ 
      email: targetEmail, 
      password, 
      options: { ...options, captchaToken } 
    });
    if (!res.error) {
      await logAuditLog('USER_SIGNUP', `New subject node: ${targetEmail}`);
    }
    return res;
  },
  sendOTP: async (email: string, captchaToken?: string) => {
    return await (supabase.auth as any).signInWithOtp({ 
      email: email.trim().toLowerCase(),
      options: { captchaToken }
    });
  },
  verifyOTP: async (email: string, token: string) => {
    const res = await (supabase.auth as any).verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' });
    if (!res.error) {
      await logAuditLog('OTP_VERIFY_SUCCESS', `Verified via OTP: ${email}`);
    }
    return res;
  },
  resetPassword: async (email: string) => {
    return await (supabase.auth as any).resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#update-password`
    });
  },
  updatePassword: async (newPassword: string) => {
    const res = await (supabase.auth as any).updateUser({ password: newPassword });
    if (!res.error) {
       const { data: { user } } = await (supabase.auth as any).getUser();
       await logAuditLog('PW_UPDATE_SUCCESS', `Access key rotation: ${user?.email}`);
    }
    return res;
  },
  signOut: async () => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    if (session?.user) {
      await logAuditLog('USER_LOGOUT', `Session terminated: ${session.user.email}`);
    }
    return await (supabase.auth as any).signOut();
  }
};

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
  getTableCount: async (tableName: string) => {
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    return error ? 0 : (count || 0);
  },
  getSecurityEvents: async (limit = 50) => {
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(limit);
    return data || [];
  },
  toggleBlock: async (id: string, email: string, currentlyBlocked: boolean) => {
    const newState = !currentlyBlocked;
    const { error } = await supabase.rpc('admin_toggle_block', { target_user_id: id });
    if (!error) {
      await logAuditLog('ADMIN_USER_BLOCK', `${newState ? 'BLOCKED' : 'UNBLOCKED'} node: ${email}`, newState ? 'WARNING' : 'INFO');
    }
    return { error };
  },
  updateUserRole: async (id: string, email: string, newRole: string) => {
    const { error } = await supabase.rpc('admin_update_user_role', { 
      target_user_id: id, 
      new_role: newRole 
    });
    if (!error) {
      await logAuditLog('ADMIN_ROLE_CHANGE', `Role set to ${newRole.toUpperCase()} for node: ${email}`, 'WARNING');
    }
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

    const isRating = content.includes('[RATING:');
    const alertType = isRating ? 'USER_SESSION_EVALUATION' : `USER_FEEDBACK_${type.toUpperCase()}`;
    
    const alertPayload = {
      source: 'USER_TERMINAL',
      path: 'feedback',
      type: alertType,
      message: `From: ${email}\n${content}`
    };
    
    await Promise.allSettled([
      notifyAdmin(alertPayload),
      emailService.sendAdminAlert(alertPayload)
    ]);

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
    const { data, error = null } = await supabase.from('diary_entries').insert([{ content, mood, user_id: user?.id }]).select().single();
    if (error) throw error;
    return data;
  },
  deleteEntry: async (id: string) => {
    await supabase.from('diary_entries').delete().eq('id', id);
  }
};
