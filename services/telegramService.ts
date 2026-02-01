
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v30.0
 * Features: True Multi-lingual Payload Translation & Identity Synthesis
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const EVENT_MAP: Record<string, { en: string, es: string, zh: string }> = {
  'USER_LOGIN': { en: '👤 Subject Login', es: '👤 Inicio de Sesión', zh: '👤 用户登录' },
  'RUNTIME_ERROR': { en: '🚨 System Exception', es: '🚨 Excepción del Sistema', zh: '🚨 系统运行异常' },
  'GA4_SYNC_FAILURE': { en: '📊 Telemetry Sync Failure', es: '📊 Fallo de Sincronización', zh: '📊 GA4 同步失败' },
  'PERMISSION_DENIED': { en: '🚫 Access Forbidden', es: '🚫 Acceso Prohibido', zh: '🚫 权限不足' },
  'USER_SESSION_EVALUATION': { en: '⭐ Session Feedback', es: '⭐ Calificación de Sesión', zh: '⭐ 用户离境评价' },
  'USER_LOGOUT': { en: '🔒 Session Terminated', es: '🔒 Sesión Terminada', zh: '🔒 会话退出' }
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

  const msgType = payload.type || 'SYSTEM_SIGNAL';
  const rawDetails = payload.message || payload.error || 'N/A';
  const mytTime = getMYTTime();
  const isoTime = new Date().toISOString();
  const nodeIdentity = 'sleepsomno.com';
  
  const mapping = EVENT_MAP[msgType] || { en: msgType, es: msgType, zh: msgType };
  const icon = (msgType.includes('FAIL') || msgType.includes('ERROR')) ? '🚨' : '🛡️';

  // 构造详细的三语 Telegram 消息
  const finalMessage = `${icon} <b>SOMNO LAB 节点告警</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🇬🇧 <b>[ENGLISH]</b>\n` +
    `<b>Type:</b> <code>${mapping.en}</code>\n` +
    `<b>Node:</b> <code>${nodeIdentity}</code>\n` +
    `<b>Log:</b> <code>${rawDetails}</code>\n` +
    `<b>Time:</b> <code>${isoTime}</code>\n\n` +
    `🇪🇸 <b>[ESPAÑOL]</b>\n` +
    `<b>Tipo:</b> <code>${mapping.es}</code>\n` +
    `<b>Nodo:</b> <code>${nodeIdentity}</code>\n` +
    `<b>Registro:</b> <code>${rawDetails}</code>\n` +
    `<b>Tiempo:</b> <code>${isoTime}</code>\n\n` +
    `🇨🇳 <b>[中文]</b>\n` +
    `<b>类型:</b> <code>${mapping.zh}</code>\n` +
    `<b>节点:</b> <code>${nodeIdentity}</code>\n` +
    `<b>日志:</b> <code>${rawDetails}</code>\n` +
    `<b>时间:</b> <code>${mytTime}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>STATUS:</b> <code>COMMITTED</code>`;

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
