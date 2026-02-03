
// @ts-ignore
import { supabase } from '../lib/supabaseClient.ts';
import { notifyAdmin } from './telegramService.ts';
import { emailService } from './emailService.ts';

// Re-export supabase client for use in other components
export { supabase };

/**
 * SOMNO LAB NEURAL AUDIT PROTOCOL
 */
export const logAuditLog = async (action: string, details: string, level: string = 'INFO') => {
  try {
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    // 1. Always record in DB
    const { error } = await supabase.from('audit_logs').insert([{
      action,
      details,
      level,
      user_id: user?.id
    }]);
    
    // 2. Map notification types
    const actionToTypeMap: Record<string, string> = {
      'USER_LOGIN': 'USER_LOGIN',
      'ADMIN_ROLE_UPDATE': 'ADMIN_CONFIG_CHANGE',
      'ADMIN_BLOCK_TOGGLE': 'ADMIN_CONFIG_CHANGE',
      'ADMIN_RECIPIENT_ADDED': 'ADMIN_CONFIG_CHANGE',
      'SECURITY_BREACH': 'SECURITY_BREACH',
      'FEEDBACK_SUBMITTED': 'USER_FEEDBACK',
      'API_SERVICE_FAULT': 'API_SERVICE_FAULT',
      'ASYNC_HANDSHAKE_VOID': 'RUNTIME_ERROR',
      'GA4_SYNC_FAILURE': 'GA4_SYNC_FAILURE',
      'GA4_PERMISSION_DENIED': 'GA4_PERMISSION_DENIED'
    };

    const targetType = actionToTypeMap[action];
    const isPriority = level === 'CRITICAL' || level === 'WARNING' || !!targetType;

    if (isPriority) {
      await notifyAdmin({ 
        type: targetType || 'RUNTIME_ERROR', 
        message: details, 
        source: user?.email || 'GATEWAY_TERMINAL'
      });

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
 * ADMIN_API - Enhanced with Super Owner Protection
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
    // PROTECT SUPER OWNER: Cannot downgrade a super owner
    const { data: target } = await supabase.from('profiles').select('is_super_owner').eq('id', id).single();
    if (target?.is_super_owner) {
      await logAuditLog('SECURITY_BREACH', `UNAUTHORIZED_DOWNGRADE: Admin attempted to alter clearance of Super Owner ${email}. Request denied.`, 'CRITICAL');
      throw new Error("IMMUTABLE_IDENTITY: Super Owner clearance level is fixed.");
    }

    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (!error) await logAuditLog('ADMIN_ROLE_UPDATE', `Action: Role Modification\nTarget: ${email}\nNew Level: ${role}`, 'WARNING');
    return { error };
  },
  
  toggleBlock: async (id: string, email: string, currentlyBlocked: boolean) => {
    // PROTECT SUPER OWNER: Cannot block a super owner
    const { data: target } = await supabase.from('profiles').select('is_super_owner').eq('id', id).single();
    if (target?.is_super_owner) {
      await logAuditLog('SECURITY_BREACH', `INTRUSION_ALERT: Admin attempted to block Super Owner ${email}. Signal intercepted.`, 'CRITICAL');
      throw new Error("ACCESS_DENIED: Super Owner nodes cannot be blocked.");
    }

    const { error } = await supabase.from('profiles').update({ is_blocked: !currentlyBlocked }).eq('id', id);
    if (!error) await logAuditLog('ADMIN_BLOCK_TOGGLE', `Action: Access Management\nTarget: ${email}\nState: ${currentlyBlocked ? 'UNBLOCKED' : 'BLOCKED'}`, 'WARNING');
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
    if (!error) await logAuditLog('ADMIN_RECIPIENT_ADDED', `Action: New Alert Node\nRecipient: ${email}`, 'WARNING');
    return { data, error };
  },
  
  removeNotificationRecipient: async (id: string, email: string) => {
    const { error } = await supabase.from('notification_recipients').delete().eq('id', id);
    if (!error) await logAuditLog('ADMIN_RECIPIENT_REMOVED', `Action: Node De-registration\nRecipient: ${email}`, 'WARNING');
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
    await logAuditLog('USER_SETUP_COMPLETE', `Registry Updated: ${user?.email}`, 'INFO');
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
    await logAuditLog('DIARY_LOG_ENTRY', `Log: ${user.email} committed ${mood}`, 'INFO');
    return data;
  },
  deleteEntry: async (id: string) => {
    return supabase.from('diary_entries').delete().eq('id', id);
  }
};
