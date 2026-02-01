
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v23.0
 * Features: Bi-directional Source Identity & Triple-lingual Precision
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const TRANSLATIONS: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Verified', es: 'Identidad Verificada', zh: '用户访问成功' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Sync Failed', es: 'Fallo de Sincronización', zh: 'GA4 同步失败' },
  'ADMIN_MANUAL_SYNC': { en: 'Admin Manual Pulse', es: 'Pulso Manual Admin', zh: '管理员手动同步' },
  'PERMISSION_DENIED': { en: 'Handshake Forbidden', es: 'Handshake Prohibido', zh: '访问被拒绝（权限不足）' },
  'SECURITY_ALERT': { en: 'Security Breach Protocol', es: 'Alerta de Seguridad', zh: '安全预警' }
};

const SOURCE_TAGS: Record<string, string> = {
  'ADMIN_CONSOLE': '🖥️ [ADMIN_BACKPLANE] | 管理端后台',
  'USER_TERMINAL': '🧪 [SUBJECT_NODE] | 受试者终端',
  'SYSTEM': '⚙️ [SYSTEM_CORE] | 系统核心'
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
  const path = payload.path || (typeof window !== 'undefined' ? window.location.hash : 'Cloud_Logic');
  
  // 智能来源判定
  let sourceLabel = SOURCE_TAGS['SYSTEM'];
  if (payload.source === 'ADMIN_CONSOLE' || path.includes('admin')) {
    sourceLabel = SOURCE_TAGS['ADMIN_CONSOLE'];
  } else if (payload.source === 'USER_TERMINAL' || path.includes('dashboard')) {
    sourceLabel = SOURCE_TAGS['USER_TERMINAL'];
  }

  const mapping = TRANSLATIONS[msgType] || { en: msgType, es: msgType, zh: msgType };
  const content = payload.message || payload.error || 'N/A';
  const mytTime = getMYTTime();
  const icon = (msgType.includes('FAIL') || msgType.includes('ERROR') || msgType.includes('DENIED')) ? '🚨' : '🛡️';

  const finalMessage = `${icon} <b>LAB DISPATCH | 实验室通讯</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📍 <b>SOURCE:</b> <code>${sourceLabel}</code>\n` +
    `🔗 <b>PATH:</b> <code>${path}</code>\n\n` +
    `🇬🇧 <b>[ENGLISH]</b>\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>Detail:</b> <code>${content}</code>\n\n` +
    `🇪🇸 <b>[ESPAÑOL]</b>\n` +
    `<b>Evento:</b> <code>${mapping.es}</code>\n` +
    `<b>Log:</b> <code>${content}</code>\n\n` +
    `🇨🇳 <b>[中文]</b>\n` +
    `<b>事件:</b> <code>${mapping.zh}</code>\n` +
    `<b>详情:</b> <code>${content}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>NODE:</b> <code>${typeof window !== 'undefined' ? window.location.hostname : 'Vercel_Edge'}</code>\n` +
    `<b>TIME:</b> <code>${mytTime}</code>`;

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
