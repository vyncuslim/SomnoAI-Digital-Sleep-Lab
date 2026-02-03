
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v43.0
 */

// @ts-ignore
import { supabase } from '../lib/supabaseClient.ts';

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// In-memory circuit breaker
const memoryCache = new Set<string>();
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

const isRecentlySent = async (action: string, fingerprint: string) => {
  const cacheKey = `${action}:${fingerprint}`;
  
  // 1. Concurrent Lock (Prevent identical calls in the same execution wave)
  if (processingPayloads.has(cacheKey)) return true;
  processingPayloads.add(cacheKey);

  try {
    // 2. Immediate Memory Check (1 minute TTL)
    if (memoryCache.has(cacheKey)) return true;

    // 3. Database Audit Check (Strict 1 minute lookback)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('action', action)
      .ilike('details', `%${fingerprint}%`)
      .gt('created_at', oneMinuteAgo)
      .limit(1);

    if (data && data.length > 0) {
      memoryCache.add(cacheKey);
      setTimeout(() => memoryCache.delete(cacheKey), 60000);
      return true;
    }

    memoryCache.add(cacheKey);
    setTimeout(() => memoryCache.delete(cacheKey), 60000);
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
  
  // Extract specific fingerprint for GA4 errors to avoid storming
  let fingerprint = rawDetails.substring(0, 60).replace(/\s/g, '');
  if (msgType.includes('GA4')) fingerprint = 'GA4_PERMISSION_BLOCK_CLUSTER';

  const duplicated = await isRecentlySent(msgType, fingerprint);
  if (duplicated) return false;

  const mapping = EVENT_MAP[msgType] || { en: msgType, zh: msgType, icon: '📡' };
  const source = payload.source || 'INTERNAL_NODE';

  const finalMessage = `${mapping.icon} <b>SOMNO LAB ALERT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>类型:</b> <code>${mapping.zh}</code>\n\n` +
    `<b>Log:</b> <code>${rawDetails.substring(0, 350)}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>ORIGIN:</b> <code>${source}</code>\n` +
    `🛡️ <b>INTERVAL:</b> <code>60s LOCK ACTIVE</code>`;

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
