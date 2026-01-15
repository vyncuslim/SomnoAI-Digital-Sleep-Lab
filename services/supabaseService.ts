import { supabase } from '../lib/supabaseClient.ts';

// --- Subject Identity Services ---

/**
 * Request an OTP Lab Token.
 * @param email The target identity.
 * @param createIfNotFound If false, prevents automatic registration. Crucial for restricted portals.
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
    // Supabase returns specific errors if shouldCreateUser is false and user doesn't exist
    if (error.message.includes('signups not allowed') || error.message.includes('not found')) {
      throw new Error("Access Denied: Identity not recognized in the Laboratory Registry.");
    }
    throw error;
  }
}

/**
 * Verify the 6-digit neural token.
 */
export async function verifyOtp(email: string, token: string, type: 'email' | 'signup' | 'magiclink' = 'email') {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type
  });
  if (error) throw error;
  return data.session;
}

export async function signInWithPassword(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return data.session;
}

export async function signUpWithPassword(email: string, pass: string) {
  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) throw error;
  return data;
}

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
};

export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// --- Administrative Privilege Services (Restricted) ---

export const adminApi = {
  /**
   * Verification Gate: Checks if a subject has Clearance Level 0 (Admin).
   * This is the source of truth for authorization.
   */
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Clearance Check Error:", error);
        return false;
      }
      return data?.role === 'admin';
    } catch (err) {
      return false;
    }
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getSleepRecords: async () => {
    const { data, error } = await supabase.from('sleep_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getAuditLogs: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
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