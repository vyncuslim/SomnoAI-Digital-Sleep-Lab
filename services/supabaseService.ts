
// @ts-ignore
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';
import { emailService } from './emailService.ts';

// Re-export supabase client for use in other components
export { supabase };

/**
 * SOMNO LAB NEURAL AUDIT PROTOCOL
 * 所有的系统日志都会经过此函数，它是监控的核心分发点。
 */
export const logAuditLog = async (action: string, details: string, level: string = 'INFO') => {
  try {
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    // 1. 始终在数据库中记录
    const { error } = await supabase.from('audit_logs').insert([{
      action,
      details,
      level,
      user_id: user?.id
    }]);
    
    // 2. 映射通知类型
    const actionToTypeMap: Record<string, string> = {
      'USER_LOGIN': 'USER_LOGIN',
      'ADMIN_ROLE_UPDATE': 'ADMIN_CONFIG_CHANGE',
      'ADMIN_BLOCK_TOGGLE': 'ADMIN_CONFIG_CHANGE',
      'ADMIN_RECIPIENT_ADDED': 'ADMIN_CONFIG_CHANGE',
      'SECURITY_BREACH': 'SECURITY_BREACH',
      'FEEDBACK_SUBMITTED': 'USER_FEEDBACK',
      'API_SERVICE_FAULT': 'API_SERVICE_FAULT',
      'ASYNC_HANDSHAKE_VOID': 'RUNTIME_ERROR',
      'GA4_SYNC_FAILURE': 'GA4_SYNC_FAILURE'
    };

    const targetType = actionToTypeMap[action];
    const isPriority = level === 'CRITICAL' || level === 'WARNING' || !!targetType;

    if (isPriority) {
      // 触发 Telegram 发送逻辑（该函数内部含有 60s 去重锁）
      await notifyAdmin({ 
        type: targetType || 'RUNTIME_ERROR', 
        message: details, 
        source: user?.email || 'GATEWAY_TERMINAL'
      });

      // 只有在 CRITICAL 级别时才发送 Email，防止邮箱爆炸
      if (level === 'CRITICAL') {
        await emailService.sendAdminAlert({ type: targetType || 'CRITICAL_FAULT', message: details });
      }
    }
    
    return !error;
  } catch (e) {
    console.error("Audit registry failure:", e);
    return false;
  }
};

/**
 * AUTH_API
 */
export const authApi = {
  signIn: (email: string, password: string, captchaToken?: string) => 
    (supabase.auth as any).signInWithPassword({ email, password, options: { captchaToken } }),
  
  signUp: async (email: string, password: string, metadata: any, captchaToken?: string) => {
    const res = await (supabase.auth as any).signUp({ email, password, options: { data: metadata, captchaToken } });
    if (!res.error) {
      await logAuditLog('USER_SIGNUP', `New Identity: ${metadata.full_name || 'Anonymous'} | Registered Node: ${email}`, 'INFO');
    }
    return res;
  },
  
  signOut: () => (supabase.auth as any).signOut(),
  
  sendOTP: (email: string, captchaToken?: string) => 
    (supabase.auth as any).signInWithOtp({ email, options: { captchaToken } }),
  
  verifyOTP: (email: string, token: string) => 
    (supabase.auth as any).verifyOtp({ email, token, type: 'email' }),
  
  updatePassword: (password: string) => 
    (supabase.auth as any).updateUser({ password }),
  
  signInWithGoogle: () => 
    (supabase.auth as any).signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin } 
    })
};

/**
 * ADMIN_API
 */
export const adminApi = {
  getAdminClearance: async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return data;
  },
  
  getSecurityEvents: async (limit = 100) => {
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(limit);
    return data || [];
  },
  
  getUsers: async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  
  getTableCount: async (table: string) => {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return count || 0;
  },
  
  updateUserRole: async (id: string, email: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (!error) await logAuditLog('ADMIN_ROLE_UPDATE', `Action: Role Escalation\nTarget: ${email}\nNew Rank: ${role}`, 'WARNING');
    return { error };
  },
  
  toggleBlock: async (id: string, email: string, currentlyBlocked: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_blocked: !currentlyBlocked }).eq('id', id);
    if (!error) await logAuditLog('ADMIN_BLOCK_TOGGLE', `Action: Access Management\nTarget: ${email}\nState: ${currentlyBlocked ? 'UNBLOCKED' : 'BLOCKED'}`, 'WARNING');
    return { error };
  },
  
  checkAdminStatus: async () => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return false;
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    return data?.role === 'admin' || data?.role === 'owner';
  },
  
  getNotificationRecipients: async () => {
    const { data, error } = await supabase.from('notification_recipients').select('*').order('created_at', { ascending: true });
    return { data: data || [], error };
  },
  
  addNotificationRecipient: async (email: string, label: string) => {
    const { data, error } = await supabase.from('notification_recipients').insert([{ email: email.toLowerCase().trim(), label }]);
    if (!error) await logAuditLog('ADMIN_RECIPIENT_ADDED', `Action: New Alert Link\nRecipient: ${email}`, 'WARNING');
    return { data, error };
  },
  
  removeNotificationRecipient: async (id: string, email: string) => {
    const { error } = await supabase.from('notification_recipients').delete().eq('id', id);
    if (!error) await logAuditLog('ADMIN_RECIPIENT_REMOVED', `Action: Sever Alert Link\nRecipient: ${email}`, 'WARNING');
    return { error };
  }
};

/**
 * PROFILE_API
 */
export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await (supabase.auth as any).getSession().then(({data}) => ({data: {user: data.session?.user}}));
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },
  
  updateProfile: async (updates: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};

/**
 * USER_DATA_API
 */
export const userDataApi = {
  getUserData: async () => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_data').select('*').eq('id', user.id).single();
    return data;
  },
  
  updateUserData: async (updates: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    return supabase.from('user_data').upsert({ id: user.id, ...updates });
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    const profileRes = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (profileRes.error) throw profileRes.error;
    const dataRes = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    if (dataRes.error) throw dataRes.error;
    
    await logAuditLog('USER_SETUP_COMPLETE', `Identity established for subject: ${user?.email}`, 'INFO');
    return { success: true };
  }
};

/**
 * FEEDBACK_API
 */
export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (!error) {
      await logAuditLog('FEEDBACK_SUBMITTED', `Source: ${email}\nCategory: ${type}\nReport: ${content}`, 'INFO');
    }
    return { success: !error, error };
  }
};

/**
 * DIARY_API
 */
export const diaryApi = {
  getEntries: async () => {
    const { data } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  
  saveEntry: async (content: string, mood: string) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) throw new Error("UNAUTHORIZED");
    const { data, error } = await supabase.from('diary_entries').insert([{ content, mood, user_id: user.id }]).select().single();
    if (error) throw error;
    
    await logAuditLog('DIARY_LOG_ENTRY', `Subject ${user.email} committed mood: ${mood}`, 'INFO');
    return data;
  },
  
  deleteEntry: async (id: string) => {
    return supabase.from('diary_entries').delete().eq('id', id);
  }
};
