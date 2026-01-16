import { supabase } from '../lib/supabaseClient.ts';

// Re-export the supabase client for external access from this service layer
export { supabase };

// --- Subject Identity Services ---

/**
 * Ensures a subject profile exists in the primary user_data registry.
 * Decouples authentication from biometric profile management.
 */
export async function ensureProfile(userId: string, email: string) {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('user_data')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) return;

    if (!profile) {
      await supabase.from('user_data').insert([
        { 
          id: userId, 
          email: email, 
          role: 'user', 
          is_blocked: false,
          created_at: new Date().toISOString(),
          extra: { units: 'metric', coachingStyle: 'clinical' }
        }
      ]);
    }
  } catch (err) {
    console.debug("[Identity Link] Deferred profile initialization.");
  }
}

export async function updateProfileMetadata(metadata: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  if (metadata.displayName) {
    await supabase.auth.updateUser({
      data: { display_name: metadata.displayName }
    });
  }

  const { error } = await supabase
    .from('user_data')
    .update({ 
      extra: metadata,
      display_name: metadata.displayName 
    })
    .eq('id', session.user.id);

  if (error) throw error;
}

export async function signInWithEmailOTP(email: string, createIfNotFound = true) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/',
      shouldCreateUser: createIfNotFound, 
    }
  });
  if (error) throw error;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data.session;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  if (error) throw error;
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/#/?recovery=true',
  });
  if (error) throw error;
}

export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

/**
 * Administrative API: Core restricted operations.
 */
export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("[Security Pulse] Admin query error:", error.message);
        return false;
      }
      
      return data?.role === 'admin';
    } catch (err) {
      console.error("[Security Pulse] Admin check exception:", err);
      return false;
    }
  },
  getUsers: async () => {
    const { data } = await supabase.from('user_data').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  blockUser: async (id: string) => {
    await supabase.from('user_data').update({ is_blocked: true, blocked_at: new Date().toISOString() }).eq('id', id);
  },
  unblockUser: async (id: string) => {
    await supabase.from('user_data').update({ is_blocked: false, blocked_at: null }).eq('id', id);
  },
  getSleepRecords: async () => {
    const { data } = await supabase.from('sleep_records').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getFeedback: async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getAuditLogs: async () => {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getSecurityEvents: async () => {
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
    return data || [];
  }
};