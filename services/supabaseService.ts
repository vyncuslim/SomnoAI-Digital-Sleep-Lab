
// @ts-ignore
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';
import { emailService } from './emailService.ts';

// Re-export supabase client for use in other components
export { supabase };

/**
 * SOMNO LAB NOTIFICATION SUPPRESSION PROTOCOL
 * 延长冷却时间以应对前端异常引发的循环告警。
 */
let lastNotificationDispatchTime = 0;
let lastNotificationFingerprint = '';
const GLOBAL_NOTIFICATION_COOLDOWN = 60 * 60 * 1000; // 60 Minutes

/**
 * LOG_AUDIT_LOG
 * 持久化系统日志，并在冷却规则允许的情况下触发管理员通知。
 */
export const logAuditLog = async (action: string, details: string, level: string = 'INFO') => {
  try {
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    // 始终在数据库中记录以供审计
    const { error } = await supabase.from('audit_logs').insert([{
      action,
      details,
      level,
      user_id: user?.id
    }]);
    
    // 1. 优先级判定
    const isPriorityEvent = level === 'CRITICAL' || level === 'WARNING' || ['USER_LOGIN', 'USER_SIGNUP', 'ADMIN_RECIPIENT_ADDED'].includes(action);

    // 2. 指纹抑制检查
    const now = Date.now();
    const currentFingerprint = `${action}:${details.substring(0, 40)}`;
    const isCooldownActive = (now - lastNotificationDispatchTime) < GLOBAL_NOTIFICATION_COOLDOWN;
    const isExactDuplicate = currentFingerprint === lastNotificationFingerprint;

    // 仅在非冷却期或非重复事件时发送通知
    if (isPriorityEvent) {
      if (isCooldownActive && isExactDuplicate) {
        console.debug(`[Suppression] Pulse identical. Dropping redundant notification: ${action}`);
        return !error;
      }

      // 更新冷却指纹
      lastNotificationDispatchTime = now;
      lastNotificationFingerprint = currentFingerprint;
      
      const payload = { 
        type: action, 
        message: details, 
        path: 'Neural_Grid_Edge',
        source: user?.email || 'SYSTEM_NODE'
      };
      
      // 并发分发至所有告警渠道
      await Promise.allSettled([
        notifyAdmin(payload),
        emailService.sendAdminAlert(payload)
      ]);
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
      await logAuditLog('USER_SIGNUP', `New subject node registry: ${email}\nIdentity: ${metadata.full_name || 'Anonymous'}`, 'INFO');
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
    if (!error) await logAuditLog('ADMIN_ROLE_UPDATE', `Node ${email} escalated to ${role}`, 'WARNING');
    return { error };
  },
  
  toggleBlock: async (id: string, email: string, currentlyBlocked: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_blocked: !currentlyBlocked }).eq('id', id);
    if (!error) await logAuditLog('ADMIN_BLOCK_TOGGLE', `${currentlyBlocked ? 'Unblocked' : 'Blocked'} node ${email}`, 'WARNING');
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
    if (!error) await logAuditLog('ADMIN_RECIPIENT_ADDED', `Target link established: ${email}`, 'WARNING');
    return { data, error };
  },
  
  removeNotificationRecipient: async (id: string, email: string) => {
    const { error } = await supabase.from('notification_recipients').delete().eq('id', id);
    if (!error) await logAuditLog('ADMIN_RECIPIENT_REMOVED', `Target link severed: ${email}`, 'WARNING');
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
    
    await logAuditLog('USER_SETUP_COMPLETE', `Subject ${user?.email} initialized metrics hub.`, 'INFO');
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
      await logAuditLog('FEEDBACK_SUBMITTED', `Type: ${type}\nFrom: ${email}\nContent: ${content}`, 'INFO');
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
