
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v22.5
 * Protocol: Mirrored Triple-lingual Dispatch with Precise Origin & Path Tracking
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const TRANSLATIONS: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Runtime Exception', es: 'Excepción de Ejecución', zh: '系统运行时异常' },
  'USER_LOGIN': { en: 'Subject Access Verified', es: 'Acceso de Sujeto Verificado', zh: '受试者身份验证成功' },
  'USER_SIGNUP': { en: 'New Subject Node Linked', es: 'Nuevo Nodo Vinculado', zh: '新受试者注册' },
  'SECURITY_BREACH_ATTEMPT': { en: 'Intrusion Protocol Detected', es: 'Protocolo de Intrusión', zh: '监测到入侵协议' },
  'PULSE_STABLE': { en: 'Neural Grid Stable', es: 'Red Neural Estable', zh: '神经网格运行稳定' },
  'PULSE_ANOMALY': { en: 'Grid Anomaly Detected', es: 'Anomalía Detectada', zh: '检测到网格运行异常' },
  'GA4_SYNC_FAILURE': { en: 'GA4 Telemetry Interrupted', es: 'Telemetría Interrumpida', zh: 'GA4 遥测同步中断' },
  'PW_UPDATE_SUCCESS': { en: 'Access Key Rotated', es: 'Clave de Acceso Rotada', zh: '访问密钥轮换成功' },
  'SYSTEM_SIGNAL': { en: 'Internal System Signal', es: 'Señal del Sistema', zh: '内部系统信号' },
  'ADMIN_MANUAL_SYNC': { en: 'Admin Manual Pulse', es: 'Pulso Manual Admin', zh: '管理员执行手动同步' },
  'ADMIN_ROLE_CHANGE': { en: 'Clearance Elevation', es: 'Elevación de Acceso', zh: '管理员调整权限等级' },
  'ADMIN_USER_BLOCK': { en: 'Node Access Revoked', es: 'Acceso Revocado', zh: '管理员封禁受试者节点' },
  'PERMISSION_DENIED': { en: 'Handshake Forbidden', es: 'Handshake Prohibido', zh: '访问被拒绝（权限不足）' }
};

const SOURCE_MAPPING: Record<string, string> = {
  'ADMIN_CONSOLE': '🖥️ ADMIN_BACKPLANE | 管理端后台',
  'USER_TERMINAL': '🧪 SUBJECT_NODE | 受试者终端',
  'SYSTEM_LOGIC': '⚙️ SYSTEM_CORE | 系统逻辑核心',
  'AI_WEBHOOK': '🤖 NEURAL_ROBOT | 机器人交互'
};

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date()) + ' (MYT)';
};

/**
 * Standardized Dispatcher with Metadata Analysis
 */
export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const msgType = payload.type || 'SYSTEM_SIGNAL';
  const sourceKey = payload.source || (msgType.startsWith('ADMIN_') ? 'ADMIN_CONSOLE' : 'USER_TERMINAL');
  const path = payload.path || 'Root_Handshake';
  
  const mapping = TRANSLATIONS[msgType] || TRANSLATIONS['SYSTEM_SIGNAL'];
  const sourceLabel = SOURCE_MAPPING[sourceKey] || SOURCE_MAPPING['SYSTEM_LOGIC'];
  
  const mytTime = getMYTTime();
  const nodeName = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
  const content = payload.message || payload.error || 'N/A';

  // 1. Header Logic
  const isError = msgType.includes('FAIL') || msgType.includes('ANOMALY') || msgType.includes('ERROR') || msgType.includes('DENIED');
  const icon = isError ? '🚨' : '🛡️';

  const finalMessage = `${icon} <b>LAB DISPATCH | 实验室通讯</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📍 <b>ORIGIN:</b> <code>${sourceLabel}</code>\n` +
    `🔗 <b>PATH:</b> <code>#${path}</code>\n\n` +
    `🇬🇧 <b>[ENGLISH]</b>\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>Log:</b> <code>${content}</code>\n\n` +
    `🇪🇸 <b>[ESPAÑOL]</b>\n` +
    `<b>Evento:</b> <code>${mapping.es}</code>\n` +
    `<b>Log:</b> <code>${content}</code>\n\n` +
    `🇨🇳 <b>[中文]</b>\n` +
    `<b>事件:</b> <code>${mapping.zh}</code>\n` +
    `<b>日志:</b> <code>${content}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>NODE:</b> <code>${nodeName}</code>\n` +
    `<b>TIME:</b> <code>${mytTime}</code>`;

  try {
    const res = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: finalMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};
