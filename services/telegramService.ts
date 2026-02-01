
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v11.0
 * Features: Multi-lingual blocks + Type Mapping + Alert Deduplication
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

let lastAlertHash: string | null = null;

const TRANSLATIONS: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Verified', es: 'Identidad Verificada', zh: '用户身份验证成功' },
  'USER_SIGNUP': { en: 'New Subject Node', es: 'Nuevo Nodo de Sujeto', zh: '新受试者注册' },
  'SECURITY_BREACH_ATTEMPT': { en: 'Unauthorized Ingress', es: 'Ingreso no Autorizado', zh: '未经授权的人侵尝试' },
  'PULSE_STABLE': { en: 'Handshake Stable', es: 'Handshake Estable', zh: '系统握手稳定' },
  'PULSE_ANOMALY': { en: 'Grid Anomaly', es: 'Anomalía de Red', zh: '网络连接异常' },
  'DIARY_LOG_ENTRY': { en: 'Biological Log Entry', es: 'Entrada de Registro Bio', zh: '生物日志更新' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Mirror Severed', es: 'Espejo Telemétrico Cortado', zh: '遥测镜像连接中断' },
  'PW_UPDATE_SUCCESS': { en: 'Key Rotation Complete', es: 'Rotación de Llaves Completa', zh: '访问密钥轮换完成' }
};

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
};

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(new Date()).replace(/\//g, '-') + ' (MYT)';
};

const escapeHTML = (str: string): string => {
  if (!str) return 'null';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const msgType = payload.type || (payload.isPulse ? 'NEURAL_PULSE' : 'SYSTEM_SIGNAL');
  const rawContent = payload.message || payload.error || 'Telemetry Void';
  
  const currentHash = getHash(`${msgType}:${rawContent}`);
  if (currentHash === lastAlertHash) return true; 
  lastAlertHash = currentHash;

  const mytTime = getMYTTime();
  const nodeName = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
  const content = escapeHTML(rawContent);
  const mapping = TRANSLATIONS[msgType] || { en: 'Signal Detected', es: 'Señal Detectada', zh: '检测到系统信号' };

  let finalMessage = `🛰️ <b>SOMNO LAB GLOBAL MESH</b>\n`;
  finalMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // English Block
  finalMessage += `🇬🇧 <b>[ENGLISH]</b>\n`;
  finalMessage += `<b>Event:</b> <code>${mapping.en}</code>\n`;
  finalMessage += `<code>${content}</code>\n\n`;

  // Spanish Block
  finalMessage += `🇪🇸 <b>[ESPAÑOL]</b>\n`;
  finalMessage += `<b>Evento:</b> <code>${mapping.es}</code>\n`;
  finalMessage += `<code>${content}</code>\n\n`;

  // Chinese Block
  finalMessage += `🇨🇳 <b>[中文]</b>\n`;
  finalMessage += `<b>事件:</b> <code>${mapping.zh}</code>\n`;
  finalMessage += `<code>${content}</code>\n\n`;

  finalMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
  finalMessage += `<b>NODE:</b> <code>${nodeName}</code>\n`;
  finalMessage += `<b>TIME:</b> <code>${mytTime}</code>`;

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
