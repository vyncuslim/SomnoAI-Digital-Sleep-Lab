
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v27.0
 * Features: Dynamic Identity Translation & Triple-lingual Precision
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const EVENT_MAP: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Access Verified', es: 'Acceso Verificado', zh: '身份访问验证通过' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Sync Failure', es: 'Fallo de Sincronización', zh: 'GA4 同步失败' },
  'PERMISSION_DENIED': { en: 'Access Forbidden', es: 'Acceso Prohibido', zh: '访问被拒绝（权限不足）' },
  'USER_SESSION_EVALUATION': { en: 'Session Feedback', es: 'Calificación de Sesión', zh: '用户评价反馈' }
};

/**
 * 翻译日志正文，特别针对登录事件进行身份标注
 */
const translateDetails = (text: string, lang: 'en' | 'es' | 'zh'): string => {
  let result = text;
  
  // 识别身份标签并翻译
  const isStaff = text.includes('STAFF_ADMIN');
  const isSubject = text.includes('SUBJECT_USER');
  const emailMatch = text.match(/for: (.*)/) || text.match(/Email: (.*)/);
  const email = emailMatch ? emailMatch[1] : 'Unknown Node';

  if (isStaff) {
    if (lang === 'zh') result = `👑 管理端后台登录: ${email}`;
    if (lang === 'es') result = `👑 Acceso de Administrador: ${email}`;
    if (lang === 'en') result = `👑 Admin Console Login: ${email}`;
  } else if (isSubject) {
    if (lang === 'zh') result = `🧪 受试者终端登录: ${email}`;
    if (lang === 'es') result = `🧪 Acceso de Sujeto: ${email}`;
    if (lang === 'en') result = `🧪 Subject Node Login: ${email}`;
  }

  // GA4 错误专用翻译
  if (text.includes('PERMISSION_DENIED')) {
    if (lang === 'zh') result = `🚨 GA4 访问被拒。请在 Google Analytics 中添加服务账号权限。`;
    if (lang === 'es') result = `🚨 Acceso GA4 denegado. Agregue permisos a la cuenta de servicio.`;
    if (lang === 'en') result = `🚨 GA4 Access Denied. Add service account permissions in GA4 console.`;
  }

  return result;
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
  const path = payload.path || 'Root_Node';
  const rawDetails = payload.message || payload.error || 'N/A';
  const mytTime = getMYTTime();
  
  const mapping = EVENT_MAP[msgType] || { en: msgType, es: msgType, zh: msgType };
  const icon = msgType.includes('FAIL') || msgType.includes('ERROR') ? '🚨' : 
               rawDetails.includes('STAFF_ADMIN') ? '👑' : '🛡️';

  const finalMessage = `${icon} <b>LAB DISPATCH | 实验室通讯</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📍 <b>SOURCE:</b> <code>${path.includes('admin') ? 'ADMIN_BACKPLANE' : 'SUBJECT_NODE'}</code>\n\n` +
    `🇬🇧 <b>[ENGLISH]</b>\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>Detail:</b> <code>${translateDetails(rawDetails, 'en')}</code>\n\n` +
    `🇪🇸 <b>[ESPAÑOL]</b>\n` +
    `<b>Evento:</b> <code>${mapping.es}</code>\n` +
    `<b>Registro:</b> <code>${translateDetails(rawDetails, 'es')}</code>\n\n` +
    `🇨🇳 <b>[中文]</b>\n` +
    `<b>事件:</b> <code>${mapping.zh}</code>\n` +
    `<b>详情:</b> <code>${translateDetails(rawDetails, 'zh')}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>TIME:</b> <code>${mytTime}</code>`;

  try {
    await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: finalMessage, parse_mode: 'HTML' })
    });
    return true;
  } catch (err) {
    return false;
  }
};
