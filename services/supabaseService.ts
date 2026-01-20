
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
      console.warn("[Telemetry] Edge function call bypassed or failed:", err.message);
      // Fallback: Continue without backend persistence if function is missing
      return { success: false, offline: true };
    }
  },

  getTelemetryHistory: async (limit = 14) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === 'PGRST116' || error.status === 404) {
          // Table missing, try fallback table
          const { data: fallback, error: fallbackErr } = await supabase
            .from('health_telemetry')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
          if (fallbackErr) throw fallbackErr;
          return fallback;
        }
        throw error;
      }
      return data;
    } catch (err: any) {
      console.debug("[History] Remote logs unreachable. Schema may be incomplete:", err.message);
      return []; // Return empty array to allow UI to render in sandbox mode
    }
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
    let redirectUrl = 'https://sleepsomno.com';
    try {
      const origin = window.location.origin;
      if (origin && origin !== 'null') {
        redirectUrl = origin;
      }
    } catch (e) {
      console.warn("Auth Guard: SecurityError reading origin.");
    }
    
    return supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('user_data').select('*').eq('id', user.id).maybeSingle();
      if (error && error.status !== 404) throw error;
      return data;
    } catch (e) {
      return null;
    }
  },
  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    try {
      return await supabase.from('user_data').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn("User data persistence failed (Schema missing?)");
      return { error: e };
    }
  }
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("RPC_TIMEOUT")), 2500)
      );
      
      const rpcPromise = supabase.rpc('is_admin');
      const result: any = await Promise.race([rpcPromise, timeoutPromise]);
      
      if (result.error) {
        if (result.error.status === 404) {
          console.debug("[Admin] is_admin RPC not found. Falling back to non-admin.");
        }
        return false;
      }
      return !!result.data;
    } catch (e) {
      return false;
    }
  },
  getUsers: async () => {
    try {
      const { data } = await supabase.from('profiles').select('*');
      return data || [];
    } catch (e) { return []; }
  },
  getSecurityEvents: async () => {
    try {
      const { data } = await supabase.from('security_events').select('*');
      return data || [];
    } catch (e) { return []; }
  },
  blockUser: (id: string) => supabase.from('profiles').update({ is_blocked: true }).eq('id', id),
  unblockUser: (id: string) => supabase.from('profiles').update({ is_blocked: false }).eq('id', id),
  getSleepRecords: async () => [],
  getFeedback: async () => [],
  getAuditLogs: async () => []
};

export const profileApi = {
  getMyProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error && error.status !== 404) throw error;
      return data;
    } catch (e) { return null; }
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');
    try {
      return await supabase.from('profiles').update(updates).eq('id', user.id);
    } catch (e) { return { error: e }; }
  }
};
