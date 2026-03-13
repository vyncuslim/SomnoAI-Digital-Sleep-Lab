import { supabaseAdmin } from './supabaseAdmin';

type AuditLevel = 'info' | 'warning' | 'error' | 'critical';
type AuditCategory =
  | 'auth'
  | 'system'
  | 'api'
  | 'payment'
  | 'admin'
  | 'security'
  | 'database'
  | 'user_action';
type AuditStatus = 'success' | 'failed' | 'denied' | 'pending';

export async function writeAuditLog(params: {
  source?: string;
  level?: AuditLevel;
  category?: AuditCategory;
  action: string;
  status?: AuditStatus;
  actorUserId?: string | null;
  targetUserId?: string | null;
  sessionId?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  path?: string | null;
  method?: string | null;
  errorCode?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabaseAdmin.rpc('write_audit_log', {
    p_source: params.source ?? 'system',
    p_level: params.level ?? 'info',
    p_category: params.category ?? 'system',
    p_action: params.action,
    p_status: params.status ?? 'success',
    p_actor_user_id: params.actorUserId ?? null,
    p_target_user_id: params.targetUserId ?? null,
    p_session_id: params.sessionId ?? null,
    p_request_id: params.requestId ?? null,
    p_ip_address: params.ipAddress ?? null,
    p_user_agent: params.userAgent ?? null,
    p_path: params.path ?? null,
    p_method: params.method ?? null,
    p_error_code: params.errorCode ?? null,
    p_message: params.message ?? null,
    p_metadata: params.metadata ?? {},
  });

  if (error) {
    console.error('writeAuditLog failed:', error);
  }

  return { data, error };
}
