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
        
      if (error) {
        // PGRST107: Column missing, 42P01: Table missing
        if (error.code === 'PGRST107' || error.message.includes('column') || error.code === '42P01') {
          console.warn("Schema mismatch or table missing! Attempting status recovery.");
          // Attempt a bare-minimum query to see if the table exists at all
          const { data: minData, error: minError } = await supabase
            .from('user_data')
            .select('id, setup_completed')
            .eq('id', user.id)
            .maybeSingle();
            
          if (minError) return null;
          return minData;
        }
        return null;
      }
      
      if (data && (data as any).profiles) {
        return { ...data, full_name: (data as any).profiles.full_name };
      }
      return data;
    } catch (e) { 
      return null; 
    }
  },
  
  completeSetup: async (fullName: string, metrics: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');

    // 1. Update Profile (Usually core and stable)
    try {
      await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: fullName });
    } catch (e) {
      console.error("Profile sync failed, continuing flow.");
    }

    const payload: any = {
      id: user.id,
      age: parseInt(String(metrics.age)) || 0,
      height: parseFloat(String(metrics.height)) || 0,
      weight: parseFloat(String(metrics.weight)) || 0,
      gender: String(metrics.gender || 'prefer-not-to-say'),
      setup_completed: true,
      updated_at: new Date().toISOString()
    };

    // 2. Update user_data with resilience
    const { error: dataError } = await supabase.from('user_data').upsert(payload);
    
    if (dataError) {
      if (dataError.message.includes('column') || dataError.code === 'PGRST107' || dataError.code === '42P01') {
        console.warn("Schema error detected. Attempting minimal bypass.");
        
        // Try minimal record to avoid blocking the user if they haven't run setup.sql yet
        const { error: retryError } = await supabase.from('user_data').upsert({
           id: user.id,
           setup_completed: true,
           updated_at: new Date().toISOString()
        });

        if (retryError) {
          // Both full and minimal upsert failed - table likely missing
          throw new Error("SCHEMA_UNINITIALIZED: The 'user_data' table or columns are missing. Please run setup.sql in Supabase SQL Editor.");
        }
        return { success: true, partial: true };
      }
      throw dataError;
    }

    return { success: true };
  },

  updateUserData: async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required.');
      const { error } = await supabase.from('user_data').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
      if (error) throw error;
      return { success: true };
    } catch (e) {
      return { success: false, error: 'UPDATE_FAILED' };
    }
  }
};

export const authApi = {
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string, type: 'email' | 'signup' | 'magiclink' | 'recovery' | 'invite' | 'phone_change' | 'email_change' = 'email') => 
    supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
        return p?.role === 'admin';
      }
      return !!data;
    } catch (e) { return false; }
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
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return data;
    } catch (e) { return null; }
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};