import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logAuditLog = async (action: string, details: any) => {
  // Placeholder for audit logging
  // console.log(`Audit Log: ${action}`, details);
};
