
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v32.1
 * Features: Rate Limiting & High-Fidelity Multi-lingual Detailed Payload.
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// 内存节流锁 (Prevent micro-bursts)
let lastSentTime = 0;
const MICRO_COOLDOWN = 10000; // 10 Seconds

const EVENT_MAP: Record<string, { en: string, es: string, zh: string, icon: string }> = {
  'USER_LOGIN': { en: '👤 Subject Access Granted', es: '👤 Inicio de Sesión', zh: '👤 受试者登录授权', icon: '🔐' },
  'RUNTIME_ERROR': { en: '🚨 System Exception', es: '🚨 Excepción del Sistema', zh: '🚨 系统运行异常', icon: '🔴' },
  'USER_SIGNUP': { en: '✨ New Subject Registry', es: '✨ Nuevo Registro', zh: '✨ 新受试者注册', icon: '🟢' },
  'GA4_SYNC_FAILURE': { en: '📊 Telemetry Sync Failure', es: '📊 Fallo de Telemetría', zh: '📊 GA4 同步失败', icon: '🟡' },
  'CONSOLE_ERROR_PROXIED': { en: '📜 Terminal Error Log', es: '📜 Log de Error', zh: '📜 终端异常日志', icon: '🟠' },
  'USER_SESSION_EVALUATION': { en: '⭐ Session Feedback', es: '⭐ Calificación', zh: '⭐ 受试者离境评价', icon: '💎' },
  'DIARY_LOG_ENTRY': { en: '📝 Biological Log Entry', es: '📝 Nuevo Diario', zh: '📝 新生物节律日志', icon: '📗' }
};

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date()) + ' (MYT)';
};

export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const now = Date.now();
  if (now - lastSentTime < MICRO_COOLDOWN) {
    console.debug("[Telegram] Micro-burst suppressed.");
    return false;
  }

  const msgType = payload.type || 'SYSTEM_SIGNAL';
  const path = payload.path || 'Global_Node';
  const rawDetails = payload.message || payload.error || 'N/A';
  const source = payload.source || 'INTERNAL_BRIDGE';
  const mytTime = getMYTTime();
  const isoTime = new Date().toISOString();
  
  const mapping = EVENT_MAP[msgType] || { en: msgType, es: msgType, zh: msgType, icon: '📡' };

  const finalMessage = `${mapping.icon} <b>SOMNO LAB ALERT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🇬🇧 <b>[ENGLISH]</b>\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>Log:</b> <code>${rawDetails.substring(0, 200)}</code>\n\n` +
    `🇨🇳 <b>[中文]</b>\n` +
    `<b>类型:</b> <code>${mapping.zh}</code>\n` +
    `<b>日志:</b> <code>${rawDetails.substring(0, 200)}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>ORIGIN:</b> <code>${source}</code>\n` +
    `🛡️ <b>STATUS:</b> <code>ENCRYPTED</code>`;

  try {
    lastSentTime = now;
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
