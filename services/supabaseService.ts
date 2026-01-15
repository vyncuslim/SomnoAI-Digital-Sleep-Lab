import { supabase } from '../lib/supabaseClient.ts';

// --- Subject Identity Services ---

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
      throw new Error("Access Denied: Identity not recognized in Registry.");
    }
    throw error;
  }
}

/**
 * Verify the 6-digit neural token.
 * Strict 'email' type to prevent Supabase invalid token errors.
 */
export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  
  if (error) {
    if (error.message.includes('expired')) throw new Error("Token Expired: Request a new handshake.");
    if (error.message.includes('invalid')) throw new Error("Token Invalid: Already consumed or incorrect signature.");
    throw error;
  }

  if (data.session) {
    // SECURITY: Immediate post-auth clearance check
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', data.session.user.id)
      .single();

    if (profile?.is_blocked) {
      await supabase.auth.signOut();
      throw new Error("Access Restricted: Your identity node has been suspended.");
    }
  }

  return data.session;
}

export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// --- Administrative Services ---

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_blocked')
        .eq('id', userId)
        .maybeSingle();
      
      if (error || data?.is_blocked) return false;
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

  blockUser: async (id: string) => {
    const { error } = await supabase.from('profiles').update({ is_blocked: true, blocked_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  unblockUser: async (id: string) => {
    const { error } = await supabase.from('profiles').update({ is_blocked: false, blocked_at: null }).eq('id', id);
    if (error) throw error;
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