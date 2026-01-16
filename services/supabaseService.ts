import { supabase } from '../lib/supabaseClient.ts';

// --- Subject Identity Services ---

/**
 * Ensures a profile exists in the 'user_data' table.
 */
export async function ensureProfile(userId: string, email: string) {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('user_data')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.warn("[Identity Link] Profile retrieval deferred.", fetchError.message);
      return;
    }

    if (!profile) {
      const { error: insertError } = await supabase.from('user_data').insert([
        { 
          id: userId, 
          email: email, 
          role: 'user', 
          is_blocked: false,
          created_at: new Date().toISOString(),
          extra: {
            units: 'metric',
            coachingStyle: 'clinical'
          }
        }
      ]);
      
      if (insertError) {
        console.error("[Identity Link] Failed to initialize subject:", insertError.message);
      }
    }
  } catch (err) {
    console.debug("[Identity Link] Background sync deferred.");
  }
}

export async function updateProfileMetadata(metadata: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  // Update Auth Metadata (for display name)
  if (metadata.displayName) {
    await supabase.auth.updateUser({
      data: { display_name: metadata.displayName }
    });
  }

  // Update user_data table (for biological data/preferences)
  const { error } = await supabase
    .from('user_data')
    .update({ 
      extra: metadata,
      display_name: metadata.displayName 
    })
    .eq('id', session.user.id);

  if (error) throw error;
}

/**
 * Request an OTP Lab Token.
 */
export async function signInWithEmailOTP(email: string, createIfNotFound = true) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      shouldCreateUser: createIfNotFound, 
    }
  });
  
  if (error) {
    if (error.message.toLowerCase().includes('database error saving new user')) {
      throw new Error("Subject Registry Synchronization Failure.");
    }
    throw error;
  }
}

/**
 * Verify the 6-digit neural token.
 */
export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  
  if (error) throw error;

  if (data.session) {
    ensureProfile(data.session.user.id, data.session.user.email || '').catch(() => {});
  }

  return data.session;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    }
  });
  if (error) throw error;
}

export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// --- Admin Services (Level 0) ---

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data } = await supabase
        .from('user_data')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      return data?.role === 'admin';
    } catch (err) {
      return false;
    }
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('user_data').select('*').order('created_at', { ascending: false });
    return error ? [] : (data || []);
  },

  blockUser: async (id: string) => {
    await supabase.from('user_data').update({ is_blocked: true, blocked_at: new Date().toISOString() }).eq('id', id);
  },

  unblockUser: async (id: string) => {
    await supabase.from('user_data').update({ is_blocked: false, blocked_at: null }).eq('id', id);
  },

  getSleepRecords: async () => {
    const { data, error } = await supabase.from('sleep_records').select('*').order('created_at', { ascending: false });
    return error ? [] : (data || []);
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    return error ? [] : (data || []);
  },

  getAuditLogs: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    return error ? [] : (data || []);
  },

  getSecurityEvents: async () => {
    const { data, error } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
    return error ? [] : (data || []);
  }
};