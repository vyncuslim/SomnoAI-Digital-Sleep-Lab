
import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

/**
 * SomnoAI Data Pipeline API
 * Connects Frontend Lab subjects with the bright-responder Edge Function.
 */
export const healthDataApi = {
  uploadTelemetry: async (metrics: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('NEURAL_LINK_UNAUTHORIZED: Secure session required.');
    }

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

    if (error) {
      console.error("[Telemetry Upload Error] Operation failed at node:", error);
      throw error;
    }

    return { success: true, data };
  },

  getTelemetryHistory: async (limit = 14) => {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('health_telemetry')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }
    
    return data;
  }
};

export const authApi = {
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => 
    supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string) => 
    supabase.auth.verifyOtp({ email, token, type: 'email' }),
  signInWithGoogle: () => {
    // Determine the most stable redirect URL
    let redirectUrl = 'https://sleepsomno.com';
    try {
      // In sandboxed environments, window.location.origin might be 'null' or throw
      const origin = window.location.origin;
      if (origin && origin !== 'null') {
        redirectUrl = origin;
      }
    } catch (e) {
      console.warn("Auth Guard: SecurityError reading origin. Falling back to default domain.");
    }
    
    return supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        // Using redirect flow instead of popup as it handles "Third-party cookie blocked" better
        skipBrowserRedirect: false, 
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
  },
  signOut: () => supabase.auth.signOut()
};

export const userDataApi = {
  getUserData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle()).data;
  },
  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('user_data').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
  }
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('is_admin');
    return !error && !!data;
  },
  getUsers: async () => (await supabase.from('profiles').select('*')).data || [],
  getSecurityEvents: async () => (await supabase.from('security_events').select('*')).data || [],
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

export const profileApi = {
  getMyProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()).data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    return supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
