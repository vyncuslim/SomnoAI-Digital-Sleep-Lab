
import { supabase } from '../lib/supabaseClient.ts';

// --- Subject Identity Services ---

/**
 * Ensures a profile exists in the 'profiles' table.
 * Fully decoupled to prevent schema-related errors from blocking the core authentication flow.
 */
export async function ensureProfile(userId: string, email: string) {
  try {
    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    // If table doesn't exist (400) or other DB errors, we log but don't throw.
    // This prevents "Database error saving new user" from hanging the app if the user manages to log in.
    if (fetchError) {
      console.warn("[Identity Link] Profile retrieval deferred. Table may be offline or restricted.", fetchError.message);
      return;
    }

    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert([
        { 
          id: userId, 
          email: email, 
          role: 'user', 
          is_blocked: false,
          created_at: new Date().toISOString()
        }
      ]);
      
      if (insertError) {
        console.error("[Identity Link] Failed to initialize subject in registry:", insertError.message);
      }
    }
  } catch (err) {
    console.debug("[Identity Link] Background sync deferred.");
  }
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
    // Map cryptic Supabase errors to domain-specific messages
    if (error.message.toLowerCase().includes('database error saving new user')) {
      throw new Error("Subject Registry Synchronization Failure: The laboratory database could not create your record. Please contact the administrator.");
    }
    if (error.message.includes('signups not allowed') || error.message.includes('not found')) {
      throw new Error("Access Denied: Subject identity not recognized in the Laboratory Registry.");
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
  
  if (error) {
    if (error.message.includes('expired')) throw new Error("Neural Token Expired.");
    if (error.message.includes('invalid')) throw new Error("Neural Token Invalid or Mismatched.");
    throw error;
  }

  if (data.session) {
    // Async synchronization to prevent UI lag
    ensureProfile(data.session.user.id, data.session.user.email || '').catch(() => {});
  }

  return data.session;
}

/**
 * Google OAuth Handshake.
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: 'select_account',
        access_type: 'offline'
      }
    }
  });
  if (error) throw error;
}

export async function updateProfileMetadata(displayName: string) {
  const { data, error } = await supabase.auth.updateUser({
    data: { display_name: displayName }
  });
  if (error) throw error;
  return data;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error || !data) return false;
      return data.role === 'admin';
    } catch (err) {
      return false;
    }
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return error ? [] : (data || []);
  },

  blockUser: async (id: string) => {
    await supabase.from('profiles').update({ is_blocked: true, blocked_at: new Date().toISOString() }).eq('id', id);
  },

  unblockUser: async (id: string) => {
    await supabase.from('profiles').update({ is_blocked: false, blocked_at: null }).eq('id', id);
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
