import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

export const healthDataApi = {
  uploadTelemetry: async (metrics: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('bright-responder', {
        method: 'POST',
        body: {
          steps: metrics.steps || 0,
          heart_rate: metrics.heart_rate || metrics.heartRate?.average || 0,
          weight: metrics.weight || metrics.payload?.weight || 0,
          recorded_at: metrics.recorded_at || new Date().toISOString(),
          source: metrics.source || 'web_bridge',
          payload: metrics
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'UNAUTHORIZED' };

      try {
        const { error: dbError } = await supabase.from('health_telemetry').insert({
          user_id: user.id,
          heart_rate: metrics.heart_rate || metrics.heartRate?.average || 0,
          recorded_at: metrics.recorded_at || new Date().toISOString(),
          payload: metrics,
          source: metrics.source || 'db_fallback'
        });
        return { success: !dbError, error: dbError?.message };
      } catch (e) {
        return { success: false, error: 'TELEMETRY_STORAGE_FAILED' };
      }
    }
  },

  getTelemetryHistory: async (limit = 14) => {
    try {
      const { data, error } = await supabase
        .from('health_telemetry')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      return []; 
    }
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id,
        email: user?.email || 'anonymous',
        feedback_type: type,
        content: content,
        target_email: 'ongyuze1401@gmail.com',
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error("Feedback transmission failed:", e);
      return { success: false };
    }
  }
};

export const securityApi = {
  logAttempt: async (email: string, status: 'success' | 'failure') => {
    try {
      await supabase.from('login_attempts').insert({
        email: email.toLowerCase().trim(),
        status: status,
        attempt_at: new Date().toISOString()
      });
    } catch (e) {
      console.debug("Audit node bypassed.");
    }
  },

  isBlocked: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_blocked, blocked_until')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      
      if (error || !data) return false;
      
      if (data.is_blocked) {
        // Check if the suspension period has elapsed (Auto-unblock)
        if (data.blocked_until && new Date(data.blocked_until) < new Date()) {
          // Cooldown expired, clear the flag for future attempts
          await supabase.from('profiles').update({ is_blocked: false, blocked_until: null }).eq('email', email.toLowerCase().trim());
          return false;
        }
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  },

  enforceBlock: async (email: string, reason: string) => {
    try {
      const cooldownMinutes = 15;
      const blockedUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000).toISOString();
      
      await supabase.from('profiles').update({ 
        is_blocked: true,
        blocked_until: blockedUntil 
      }).eq('email', email.toLowerCase().trim());
      
      await supabase.from('security_events').insert({
        email: email.toLowerCase().trim(),
        event_type: 'AUTO_BLOCK',
        event_reason: reason,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Security enforcement failed.");
    }
  }
};

export const userDataApi = {
  getUserData: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_data')
        .select('id, age, height, weight, gender, setup_completed, profiles(full_name)')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) return null;
      return data;
    } catch (e) { 
      return null; 
    }
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');

    await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: fullName });

    const payload = {
      id: user.id,
      age: parseInt(String(metrics.age)) || 0,
      height: parseFloat(String(metrics.height)) || 0,
      weight: parseFloat(String(metrics.weight)) || 0,
      gender: String(metrics.gender || 'prefer-not-to-say'),
      setup_completed: true,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('user_data').upsert(payload);
    if (error) throw error;
    return { success: true };
  },

  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');
    return await supabase.from('user_data').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
  }
};

export const authApi = {
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  
  signIn: async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Pre-Handshake Identity Verification
    const blocked = await securityApi.isBlocked(normalizedEmail);
    if (blocked) {
      throw new Error("ACCESS_RESTRICTED");
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    
    // 2. Post-Handshake Audit & Density Check
    if (error) {
      await securityApi.logAttempt(normalizedEmail, 'failure');
      
      // Density Analysis: Check if count >= 10 in the last 60 seconds
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('email', normalizedEmail)
        .eq('status', 'failure')
        .gt('attempt_at', oneMinuteAgo);
      
      if (count && count >= 10) {
        await securityApi.enforceBlock(normalizedEmail, 'Brute force density trigger: 10+ failures/60s');
        throw new Error("ACCESS_RESTRICTED");
      }
      
      throw error;
    }

    await securityApi.logAttempt(normalizedEmail, 'success');
    return { data, error: null };
  },
  
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string, type: any = 'email') => 
    supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      return data?.role === 'admin';
    } catch (e) { return false; }
  },
  getUsers: async () => {
    const { data } = await supabase.from('profiles').select('*');
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false, blocked_until: null }).eq('id', id),
  getSleepRecords: async () => {
    const { data } = await supabase.from('health_telemetry').select('*').limit(100);
    return data || [];
  },
  getFeedback: async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getAuditLogs: async () => {
    const { data } = await supabase.from('login_attempts').select('*').order('attempt_at', { ascending: false }).limit(100);
    return data || [];
  }
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
