
import { supabase } from '../lib/supabaseClient.ts';

// --- Subject Identity Services ---

/**
 * Ensures a profile exists in the 'profiles' table for the given user.
 * Improved to be fully non-blocking and silent if the table/schema is missing.
 */
export async function ensureProfile(userId: string, email: string) {
  try {
    // Attempting a shallow check
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.warn("Profile table check failed (likely schema not ready):", fetchError.message);
      return; // Silent fail to allow login to proceed
    }

    if (!profile) {
      // Attempt to create missing identity node, but catch errors silently
      const { error: insertError } = await supabase.from('profiles').insert([
        { id: userId, email: email, role: 'user', is_blocked: false }
      ]);
      if (insertError) console.warn("Auto-profile creation deferred.");
    }
  } catch (err) {
    console.debug("Identity sync deferred (Supabase connection state).");
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
    if (error.message.includes('signups not allowed') || error.message.includes('not found')) {
      throw new Error("Access Denied: Identity not recognized in the Laboratory Registry.");
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
    if (error.message.includes('expired')) throw new Error("Token Expired: Please request a new handshake.");
    if (error.message.includes('invalid')) throw new Error("Token Invalid: Signature mismatch or already consumed.");
    throw error;
  }

  if (data.session) {
    // We initiate ensureProfile but DO NOT await it to avoid blocking the login completion
    ensureProfile(data.session.user.id, data.session.user.email || '').catch(() => {});
    
    // Check if blocked, but handle table missing error gracefully
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('id', data.session.user.id)
        .maybeSingle();

      if (!profileError && profile?.is_blocked) {
        await supabase.auth.signOut();
        throw new Error("Access Restricted: Your identity node has been suspended by system policy.");
      }
    } catch (e) {
      console.debug("Status check bypassed (table missing).");
    }
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

// --- Administrative Privilege Services (Level 0) ---

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_blocked')
        .eq('id', userId)
        .maybeSingle();
      
      if (error || !data || data.is_blocked) return false;
      return data.role === 'admin';
    } catch (err) {
      return false;
    }
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return []; // Fallback for missing table
    return data || [];
  },

  blockUser: async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: true, blocked_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  unblockUser: async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: false, blocked_at: null })
      .eq('id', id);
    if (error) throw error;
  },

  getSleepRecords: async () => {
    const { data, error } = await supabase.from('sleep_records').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  getAuditLogs: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  getSecurityEvents: async () => {
    const { data, error } = await supabase.from('security_events').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  deleteRecord: async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  updateUserRole: async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw error;
  },

  updateSleepRecord: async (id: string, updates: any) => {
    const { error } = await supabase.from('sleep_records').update(updates).eq('id', id);
    if (error) throw error;
  },

  resolveFeedback: async (id: string) => {
    const { error } = await supabase.from('feedback').update({ status: 'resolved' }).eq('id', id);
    if (error) throw error;
  }
};
