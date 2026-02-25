import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logAuditLog = async (userId: string, action: string, details: any) => {
  const { error } = await supabase.from('audit_logs').insert([
    { user_id: userId, action, details }
  ]);
  if (error) console.error('Error logging audit log:', error);
};

export const adminApi = {
  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    return { data: data || [], error };
  },
  
  getNotificationRecipients: async () => {
    const { data, error } = await supabase.from('notification_recipients').select('*').order('created_at', { ascending: true });
    return { data: data || [], error };
  },

  getFeedback: async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  
  addNotificationRecipient: async (email: string, label: string) => {
    const { data, error } = await supabase.from('notification_recipients').insert([{ email: email.toLowerCase().trim(), label }]);
    return { data, error };
  },

  removeNotificationRecipient: async (id: string) => {
    const { error } = await supabase.from('notification_recipients').delete().eq('id', id);
    return { error };
  },

  getAdminClearance: async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    return data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    return { error };
  },

  toggleUserBlock: async (userId: string, blocked: boolean) => {
    const { error } = await supabase.from('profiles').update({ blocked }).eq('id', userId);
    return { error };
  }
};

export const feedbackApi = {
  submitFeedback: async (type: string, content: string, email: string) => {
    const { error } = await supabase.from('feedback').insert([{ type, content, email }]);
    if (!error) {
      await logAuditLog(email, 'SUBMIT_FEEDBACK', { type });
    }
    return { success: !error, error };
  }
};

export const userApi = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return { data, error };
  },

  updateProfile: async (userId: string, updates: any) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    return { error };
  }
};
