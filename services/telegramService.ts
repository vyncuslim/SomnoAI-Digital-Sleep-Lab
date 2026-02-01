
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v28.0
 * Features: True Multi-lingual Payload Translation & Identity Synthesis
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const EVENT_MAP: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Verified', es: 'Identidad Verificada', zh: '身份验证成功' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Sync Failure', es: 'Fallo de Sincronización', zh: 'GA4 同步失败' },
  'PERMISSION_DENIED': { en: 'Access Forbidden', es: 'Acceso Prohibido', zh: '访问被拒绝（权限不足）' },
  'USER_SESSION_EVALUATION': { en: 'Session Feedback', es: 'Calificación de Sesión', zh: '用户离境评价' },
  'USER_LOGOUT': { en: 'Session Terminated', es: 'Sesión Terminada', zh: '会话已安全退出' },
  'PW_UPDATE_SUCCESS': { en: 'Access Key Rotated', es: 'Clave Rotada', zh: '访问密钥已重置' }
};

/**
 * 核心翻译引擎：确保三语完全独立
 */
const translateDetails = (text: string, lang: 'en' | 'es' | 'zh'): string => {
  let result = text;
  
  // 模式 1: 登录/身份检测
  if (text.includes('Access verified for:')) {
    const email = text.match(/for: (.*)/)?.[1] || 'Unknown';
    if (lang === 'zh') return `系统已确认访问权限，受试者节点: ${email}`;
    if (lang === 'es') return `Acceso concedido al nodo del sujeto: ${email}`;
    if (lang === 'en') return `System access verified for subject node: ${email}`;
  }

  // 模式 2: 身份标签翻译
  const isStaff = text.includes('STAFF_ADMIN');
  const isSubject = text.includes('SUBJECT_USER');
  
  if (isStaff) {
    if (lang === 'zh') result = result.replace(/\[IDENTITY: STAFF_ADMIN\]/, '【管理员特权】');
    if (lang === 'es') result = result.replace(/\[IDENTITY: STAFF_ADMIN\]/, '【ID: ADMINISTRADOR】');
  } else if (isSubject) {
    if (lang === 'zh') result = result.replace(/\[IDENTITY: SUBJECT_USER\]/, '【受试者身份】');
    if (lang === 'es') result = result.replace(/\[IDENTITY: SUBJECT_USER\]/, '【ID: SUJETO】');
  }

  // 模式 3: GA4 错误专用（包含具体的服务账号指导）
  if (text.includes('PERMISSION_DENIED')) {
    if (lang === 'zh') return `🚨 GA4 访问被拒绝。请将以下账号添加至 GA4 查看权限：somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com`;
    if (lang === 'es') return `🚨 Acceso GA4 denegado. Agregue la cuenta de servicio a la consola de Google Analytics.`;
    if (lang === 'en') return `🚨 GA4 Access Denied. Service account missing "Viewer" role in GA4 property settings.`;
  }

  // 模式 4: 通用关键词本地化
  if (lang === 'zh') {
    result = result.replace(/Reason:/g, '原因:').replace(/Error:/g, '错误:').replace(/Email:/g, '邮箱:');
  } else if (lang === 'es') {
    result = result.replace(/Reason:/g, 'Razón:').replace(/Error:/g, 'Error:').replace(/Email:/g, 'Correo:');
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
  
  // 图标逻辑
  const isSecurity = msgType.includes('FAIL') || msgType.includes('DENIED') || msgType.includes('BREACH');
  const isStaff = rawDetails.includes('STAFF_ADMIN');
  const icon = isSecurity ? '🚨' : isStaff ? '👑' : '🛡️';

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
