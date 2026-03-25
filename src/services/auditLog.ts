import { supabaseAdmin } from './supabaseAdmin';
import { sendTelegramMessage } from '../lib/telegram';

type AuditLevel = 'info' | 'warning' | 'error' | 'critical';
type AuditCategory =
  | 'auth'
  | 'system'
  | 'api'
  | 'payment'
  | 'admin'
  | 'security'
  | 'database'
  | 'communication'
  | 'user_action';
type AuditStatus = 'success' | 'failed' | 'denied' | 'pending';

interface AuditLogParams {
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
}

const sanitizeString = (str: string | null | undefined) => {
  if (!str) return str;
  // Remove control characters (including newlines) to prevent log injection
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
};

export async function writeAuditLog(params: AuditLogParams) {
  try {
    const { data, error } = await supabaseAdmin.rpc('write_audit_log', {
      p_source: sanitizeString(params.source) ?? 'system',
      p_level: sanitizeString(params.level) ?? 'info',
      p_category: sanitizeString(params.category) ?? 'system',
      p_action: sanitizeString(params.action)!,
      p_status: sanitizeString(params.status) ?? 'success',
      p_actor_user_id: params.actorUserId ?? null,
      p_target_user_id: params.targetUserId ?? null,
      p_session_id: sanitizeString(params.sessionId) ?? null,
      p_request_id: sanitizeString(params.requestId) ?? null,
      p_ip_address: sanitizeString(params.ipAddress) ?? null,
      p_user_agent: sanitizeString(params.userAgent) ?? null,
      p_path: sanitizeString(params.path) ?? null,
      p_method: sanitizeString(params.method) ?? null,
      p_error_code: sanitizeString(params.errorCode) ?? null,
      p_message: sanitizeString(params.message) ?? null,
      p_metadata: params.metadata ?? {},
    });

    if (error) {
      console.error('writeAuditLog failed:', error);
    }

    // Send Telegram alert for critical or error events
    if (params.level === 'critical' || params.level === 'error') {
      const emoji = params.level === 'critical' ? '🚨' : '⚠️';
      const message = `${emoji} <b>Audit Alert: ${params.action}</b>\nLevel: ${params.level}\nStatus: ${params.status || 'N/A'}\nMessage: ${params.message || 'No message'}\nUser: <code>${params.actorUserId || 'System'}</code>`;
      await sendTelegramMessage(message);
    }

    return { data, error };
  } catch (err) {
    console.error('Unexpected error in writeAuditLog:', err);
    return { data: null, error: err };
  }
}

export const auditLogger = {
  logAuth: (params: Omit<AuditLogParams, 'category'> & { status: AuditStatus }) => 
    writeAuditLog({ ...params, category: 'auth' }),
  logPayment: (params: Omit<AuditLogParams, 'category'> & { status: AuditStatus }) => 
    writeAuditLog({ ...params, category: 'payment' }),
  logAdmin: (params: Omit<AuditLogParams, 'category'> & { status: AuditStatus }) => 
    writeAuditLog({ ...params, category: 'admin' }),
};
