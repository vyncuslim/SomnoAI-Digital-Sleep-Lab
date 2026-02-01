
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v21.0
 * Protocol: Mirrored Triple-lingual Dispatch with Precise Origin Tracking
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const TRANSLATIONS: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Verified', es: 'Identidad Verificada', zh: '用户登录成功' },
  'USER_SIGNUP': { en: 'New Subject Node', es: 'Nuevo Nodo de Sujeto', zh: '新受试者注册' },
  'SECURITY_BREACH_ATTEMPT': { en: 'Unauthorized Ingress', es: 'Ingreso no Autorizado', zh: '未经授权的入侵尝试' },
  'PULSE_STABLE': { en: 'Neural Handshake Stable', es: 'Handshake Estable', zh: '系统脉搏稳定' },
  'PULSE_ANOMALY': { en: 'Grid Anomaly Detected', es: 'Anomalía de Red Detectada', zh: '检测到网格异常' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Sync Failure', es: 'Fallo de Sincronización', zh: 'GA4 同步失败' },
  'PW_UPDATE_SUCCESS': { en: 'Access Key Rotated', es: 'Clave de Acceso Rotada', zh: '访问密钥已轮换' },
  'SYSTEM_SIGNAL': { en: 'System Signal Detected', es: 'Señal del Sistema Detectada', zh: '监测到系统信号' },
  'DIAGNOSTIC_TEST': { en: 'Diagnostic Test', es: 'Prueba de Diagnóstico', zh: '管理台诊断测试' },
  'USER_FEEDBACK_REPORT': { en: 'Anomaly Report Logged', es: 'Informe de Anomalía', zh: '用户提交反馈' },
  'DIARY_LOG_ENTRY': { en: 'Biological Log Entry', es: 'Entrada de Registro Bio', zh: '用户更新生物日志' },
  'ADMIN_ROLE_CHANGE': { en: 'Clearance Shift', es: 'Cambio de Acceso', zh: '管理员权限变更操作' },
  'ADMIN_USER_BLOCK': { en: 'Access Restricted', es: 'Acceso Restringido', zh: '管理员执行封禁' },
  'ADMIN_MANUAL_SYNC': { en: 'Manual Telemetry Pulse', es: 'Pulso Manual de Telemetría', zh: '管理员执行手动同步' }
};

const SOURCE_MAPPING: Record<string, string> = {
  'ADMIN_CONSOLE': '🖥️ Admin Page | 管理员后台',
  'USER_TERMINAL': '🧪 User Activity | 受试者终端活动',
  'SYSTEM_LOGIC': '⚙️ System Logic | 后端系统逻辑',
  'AI_WEBHOOK': '🤖 AI Webhook | 机器人智能交互'
};

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date()) + ' (MYT)';
};

/**
 * Dispatches a high-priority mirrored notification with Source Origin clarity.
 */
export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const msgType = payload.type || 'SYSTEM_SIGNAL';
  // Default to system logic if source not provided
  const sourceKey = payload.source || (msgType.startsWith('ADMIN_') ? 'ADMIN_CONSOLE' : 'USER_TERMINAL');
  
  const mapping = TRANSLATIONS[msgType] || TRANSLATIONS['SYSTEM_SIGNAL'];
  const sourceLabel = SOURCE_MAPPING[sourceKey] || SOURCE_MAPPING['SYSTEM_LOGIC'];
  
  const mytTime = getMYTTime();
  const nodeName = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
  const content = payload.message || payload.error || 'N/A';

  const finalMessage = `🛡️ <b>LAB DISPATCH | 实验室通知</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📍 <b>SOURCE:</b> <code>${sourceLabel}</code>\n\n` +
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
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};
