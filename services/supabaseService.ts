// @ts-ignore
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';
import { emailService } from './emailService.ts';

// Re-export supabase client for use in other components
export { supabase };

/**
 * SOMNO LAB NEURAL AUDIT PROTOCOL
 * Centralized logging and notification hub for administrative oversight.
 */
export const logAuditLog = async (action: string, details: string, level: string = 'INFO') => {
  try {
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    // 1. Record in DB Audit Archive
    const { error } = await supabase.from('audit_logs').insert([{
      action,
      details,
      level,
      user_id: user?.id
    }]);
    
    // 2. Notification Dispatch Logic
    const actionToTypeMap: Record<string, string> = {
      'USER_LOGIN': 'USER_LOGIN',
      'ADMIN_ROLE_UPDATE': 'ADMIN_CONFIG_CHANGE',
      'ADMIN_BLOCK_TOGGLE': 'ADMIN_CONFIG_CHANGE',
      'ADMIN_RECIPIENT_ADDED': 'ADMIN_CONFIG_CHANGE',
      'SECURITY_BREACH': 'SECURITY_BREACH',
      'FEEDBACK_SUBMITTED': 'USER_FEEDBACK',
      'API_SERVICE_FAULT': 'API_SERVICE_FAULT',
      'GA4_SYNC_FAILURE': 'GA4_SYNC_FAILURE',
      'GA4_PERMISSION_DENIED': 'GA4_PERMISSION_DENIED'
    };

    const targetType = actionToTypeMap[action];
    const isPriority = level === 'CRITICAL' || level === 'WARNING' || !!targetType;

    if (isPriority) {
      // Mirrored Alert: Telegram Admin Bot
      await notifyAdmin({ 
        type: targetType || 'SYSTEM_SIGNAL', 
        message: details, 
        source: user?.email || 'GATEWAY_TERMINAL'
      });

      // Mirrored Alert: Email Dispatch
      const shouldEmail = 
        level === 'CRITICAL' || 
        action === 'USER_LOGIN' || 
        action === 'GA4_PERMISSION_DENIED' || 
        action === 'SECURITY_BREACH';

      if (shouldEmail) {
        await emailService.sendAdminAlert({ 
          type: targetType || 'SYSTEM_SIGNAL', 
          message: details 
        });
      }
    }
    
    return !error;
  } catch (e) {
    console.error("Audit registry failure:", e);
    return false;
  }
};

/**
 * ADMIN_API - Clearance and Node Management
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
    const { data: target } = await supabase.from('profiles').select('is_super_owner').eq('id', id).single();
    if (target?.is_super_owner) {
      await logAuditLog('SECURITY_BREACH', `UNAUTHORIZED_UPGRADE_ATTEMPT: Subject ${email} level is fixed.`, 'CRITICAL');
      throw new Error("ACCESS_DENIED: Super Owner identity is immutable.");
    }

    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (!error) await logAuditLog('ADMIN_ROLE_UPDATE', `Action: Role Escalation\nTarget: ${email}\nLevel: ${role}`, 'WARNING');
    return { error };
  },
  
  toggleBlock: async (id: string, email: string, currentlyBlocked: boolean) => {
    const { data: target } = await supabase.from('profiles').select('is_super_owner').eq('id', id).single();
    if (target?.is_super_owner) {
      throw new Error("ACCESS_DENIED: Super Owner nodes cannot be blocked.");
    }

    const { error } = await supabase.from('profiles').update({ is_blocked: !currentlyBlocked }).eq('id', id);
    if (!error) await logAuditLog('ADMIN_BLOCK_TOGGLE', `Action: Traffic Management\nTarget: ${email}\nState: ${currentlyBlocked ? 'UNBLOCKED' : 'BLOCKED'}`, 'WARNING');
    return { error };
  },
  
  checkAdminStatus: async () => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return false;
    const { data } = await supabase.from('profiles').select('role, is_super_owner').eq('id', user.id).single();
    return data?.is_super_owner || data?.role === 'admin' || data?.role === 'owner';
  },
  
  getNotificationRecipients: async () => {
    const { data, error } = await supabase.from('notification_recipients').select('*').order('created_at', { ascending: true });
    return { data: data || [], error };
  },
  
  addNotificationRecipient: async (email: string, label: string) => {
    const { data, error } = await supabase.from('notification_recipients').insert([{ email: email.toLowerCase().trim(), label }]);
    if (!error) await logAuditLog('ADMIN_RECIPIENT_ADDED', `Action: Alert Matrix Expansion\nNode: ${email}`, 'WARNING');
    return { data, error };
  },
  
  removeNotificationRecipient: async (id: string, email: string) => {
    const { error } = await supabase.from('notification_recipients').delete().eq('id', id);
    if (!error) await logAuditLog('ADMIN_RECIPIENT_REMOVED', `Action: Alert Matrix Severed\nNode: ${email}`, 'WARNING');
    return { error };
  }
};

export const authApi = {
  signIn: (email: string, password: string, captchaToken?: string) => 
    (supabase.auth as any).signInWithPassword({ email, password, options: { captchaToken } }),
  signOut: () => (supabase.auth as any).signOut(),
  sendOTP: (email: string, captchaToken?: string) => 
    (supabase.auth as any).signInWithOtp({ email, options: { captchaToken } }),
  verifyOTP: (email: string, token: string) => 
    (supabase.auth as any).verifyOtp({ email, token, type: 'email' }),
  updatePassword: (password: string) => 
    (supabase.auth as any).updateUser({ password }),
  signUp: async (email: string, password: string, metadata: any, captchaToken?: string) => {
    const res = await (supabase.auth as any).signUp({ email, password, options: { data: metadata, captchaToken } });
    if (!res.error) await logAuditLog('USER_SIGNUP', `New Identity: ${metadata.full_name} | Node: ${email}`, 'INFO');
    return res;
  },
  signInWithGoogle: () => (supabase.auth as any).signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await (supabase.auth as any).getSession().then(({data}: any) => ({data: {user: data.session?.user}}));
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    return supabase.from('profiles').update(updates).eq('id', user.id);
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
    return supabase.from('user_data').upsert({ id: user.id, ...updates });
  },
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await (supabase.auth as any).getUser();
    const profileRes = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (profileRes.error) throw profileRes.error;
    const dataRes = await supabase.from('user_data').upsert({ id: user.id, ...metrics });
    if (dataRes.error) throw dataRes.error;
    await logAuditLog('USER_SETUP_COMPLETE', `Initialization: ${user?.email}`, 'INFO');
    return { success: true };
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (!error) await logAuditLog('FEEDBACK_SUBMITTED', `Source: ${email}\nReport: ${content}`, 'INFO');
    return { success: !error, error };
  }
};

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
    await logAuditLog('DIARY_LOG_ENTRY', `Diary Entry: ${user.email} | Mood: ${mood}`, 'INFO');
    return data;
  },
  deleteEntry: async (id: string) => {
    return supabase.from('diary_entries').delete().eq('id', id);
  }
};