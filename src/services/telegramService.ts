/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v48.0
 * Features: Multi-pass fingerprinting & strict 24h block for permanent authorization errors.
 */

import { supabase } from './supabaseService.ts';

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const memoryCache = new Map<string, number>();
const processingPayloads = new Set<string>();

const EVENT_MAP: Record<string, { en: string, zh: string, icon: string }> = {
  'USER_LOGIN': { en: '👤 Access Granted', zh: '👤 受试者登录授权', icon: '🔐' },
  'SECURITY_BREACH': { en: '⚔️ SECURITY ATTACK', zh: '⚔️ 检测到越权攻击', icon: '💀' },
  'ADMIN_CONFIG_CHANGE': { en: '⚙️ Admin Override', zh: '⚙️ 管理员更改了设置', icon: '🛠️' },
  'API_SERVICE_FAULT': { en: '🔌 API Key Expired/Fail', zh: '🔌 核心 API 链路断开', icon: '❌' },
  'RUNTIME_ERROR': { en: '🚨 System Exception', zh: '🚨 系统运行异常', icon: '🔴' },
  'USER_FEEDBACK': { en: '💬 User Report', zh: '💬 收到用户意见反馈', icon: '📩' },
  'GA4_SYNC_FAILURE': { en: '📊 Telemetry Sync Failure', zh: '📊 数据同步链路异常', icon: '🟡' },
  'GA4_PERMISSION_DENIED': { en: '🛡️ GA4 Access Denied', zh: '🛡️ GA4 权限缺失 (403)', icon: '🚫' }
};

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date());
};

/**
 * 核心逻辑：基于错误指纹的去重抑制
 */
const isRecentlySent = async (action: string, fingerprint: string) => {
  const cacheKey = `${action}:${fingerprint}`;
  const now = Date.now();

  if (processingPayloads.has(cacheKey)) return true;
  processingPayloads.add(cacheKey);

  try {
    // Cooldown: 24h for GA4 errors, 30m for others
    const isPersistentError = action === 'GA4_PERMISSION_DENIED' || action.includes('PERMISSION_DENIED');
    const cooldownPeriod = isPersistentError ? 86400000 : 1800000; 
    
    const lastSentTime = memoryCache.get(cacheKey);
    if (lastSentTime && (now - lastSentTime < cooldownPeriod)) {
      return true;
    }

    const lookbackTime = new Date(now - cooldownPeriod).toISOString();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('action', action)
      .ilike('details', `%${fingerprint}%`)
      .gt('created_at', lookbackTime)
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      // Ignore 404s (table not found or no rows)
    }

    if (data && data.length > 0) {
      memoryCache.set(cacheKey, now);
      return true;
    }

    memoryCache.set(cacheKey, now);
    return false;
  } catch (e) {
    return false;
  } finally {
    setTimeout(() => processingPayloads.delete(cacheKey), 2000);
  }
};

export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const msgType = payload.type || 'SYSTEM_SIGNAL';
  const rawDetails = typeof payload === 'string' ? payload : (payload.message || payload.error || 'N/A');
  
  let fingerprint = 'GENERAL_SIGNAL';
  if (msgType === 'GA4_PERMISSION_DENIED' || rawDetails.includes('PERMISSION_DENIED')) {
    // Use a strict fixed fingerprint for permission errors to ensure ONLY ONE notification per 24h
    fingerprint = 'GA4_AUTH_BLOCK_PROTOCOL_V2';
  } else {
    fingerprint = rawDetails.substring(0, 60).replace(/\s/g, '');
  }

  const duplicated = await isRecentlySent(msgType, fingerprint);
  if (duplicated) {
    return false;
  }

  const mapping = EVENT_MAP[msgType] || { en: msgType, zh: msgType, icon: '📡' };
  const source = payload.source || 'INTERNAL_NODE';

  const isGA4Error = msgType === 'GA4_PERMISSION_DENIED' || msgType === 'GA4_SYNC_FAILURE';

  const finalMessage = `${mapping.icon} <b>SOMNO LAB ALERT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>类型:</b> <code>${mapping.zh}</code>\n\n` +
    `<b>Log:</b> <code>${rawDetails.substring(0, 350)}</code>\n` +
    (isGA4Error ? `\n⚠️ <b>ACTION REQUIRED:</b>\n<i>Verify Property Permissions in GA Console.</i>\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>ORIGIN:</b> <code>${source}</code>\n` +
    `🛡️ <b>STATUS:</b> <code>Suppression Active (24h Lock)</code>`;

  try {
    const res = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: finalMessage, parse_mode: 'HTML' })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};