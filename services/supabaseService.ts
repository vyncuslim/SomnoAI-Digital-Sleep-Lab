
import { supabase } from '../lib/supabaseClient.ts';

export { supabase };

/**
 * SomnoAI Data Pipeline API
 */
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

      const { error: dbError } = await supabase.from('health_telemetry').insert({
        user_id: user.id,
        heart_rate: metrics.heart_rate || metrics.heartRate?.average || 0,
        recorded_at: metrics.recorded_at || new Date().toISOString(),
        payload: metrics,
        source: metrics.source || 'db_fallback'
      });
      return { success: !dbError, error: dbError?.message };
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
        .select('*, profiles(full_name)')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        // Handle PostgREST cache errors by attempting a simpler query
        if (error.code === 'PGRST107' || error.message.includes('column')) {
          const { data: basicData } = await supabase
            .from('user_data')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          return basicData;
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

    // Step 1: Update Profile Name
    const { error: profileError } = await supabase.from('profiles').upsert({ 
      id: user.id, 
      email: user.email, 
      full_name: fullName 
    });

    if (profileError) {
      console.error("Profile update failed:", profileError);
      // Non-blocking fallback
      await supabase.from('profiles').insert({ id: user.id, email: user.email, full_name: fullName }).select().maybeSingle();
    }

    // Step 2: Update User Metrics
    const payload = {
      id: user.id,
      age: parseInt(String(metrics.age)) || 0,
      height: parseFloat(String(metrics.height)) || 0,
      weight: parseFloat(String(metrics.weight)) || 0,
      gender: String(metrics.gender || 'prefer-not-to-say'),
      setup_completed: true,
      updated_at: new Date().toISOString()
    };

    const { error: dataError } = await supabase.from('user_data').upsert(payload);
    
    if (dataError) {
      console.error("User data update failed:", dataError);
      
      // Specific handling for "column not found" error
      if (dataError.message.includes('column') || dataError.code === 'PGRST107') {
        const errorDetail = `Database Schema Error: The 'user_data' table is missing required columns (like 'age'). 
        Please copy the contents of 'setup.sql' and run it in the Supabase SQL Editor.`;
        throw new Error(errorDetail);
      }
      
      throw dataError;
    }

    return { success: true };
  },

  updateUserData: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');
    
    const { error } = await supabase
      .from('user_data')
      .upsert({ 
        id: user.id, 
        ...updates, 
        updated_at: new Date().toISOString() 
      });
      
    if (error) throw error;
    return { success: true };
  }
};

export const authApi = {
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  sendOTP: (email: string) => supabase.auth.signInWithOtp({ email }),
  verifyOTP: (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' }),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
  signOut: () => supabase.auth.signOut()
};

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) return false;
      return !!data;
    } catch (e) { return false; }
  },
  getUsers: async () => {
    const { data } = await supabase.from('profiles').select('*');
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data } = await supabase.from('security_events').select('*');
    return data || [];
  },
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
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required.');
    return await supabase.from('profiles').update(updates).eq('id', user.id);
  }
};
