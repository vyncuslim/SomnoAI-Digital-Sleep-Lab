import { supabaseAdmin } from './supabase-admin';

export interface AuditLogParams {
  userId: string | null;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export const writeAuditLog = async (params: AuditLogParams) => {
  const { userId, action, details, ipAddress, userAgent } = params;
  
  const { error } = await supabaseAdmin.rpc('write_audit_log', {
    p_user_id: userId,
    p_action: action,
    p_details: details,
    p_ip_address: ipAddress || null,
    p_user_agent: userAgent || null
  });

  if (error) {
    console.error('Failed to write audit log:', error);
    return { error };
  }
  
  return { error: null };
};
