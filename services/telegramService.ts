
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v10.5
 * Features: Multi-lingual blocks + Alert Deduplication + Unified Layout
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

let lastAlertHash: string | null = null;

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

  let finalMessage = `🛰️ <b>SOMNO LAB GLOBAL MESH</b>\n`;
  finalMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // English Block
  finalMessage += `🇬🇧 <b>[ENGLISH]</b>\n`;
  finalMessage += `<b>Type:</b> <code>${msgType}</code>\n`;
  finalMessage += `<code>${content}</code>\n\n`;

  // Spanish Block
  finalMessage += `🇪🇸 <b>[ESPAÑOL]</b>\n`;
  finalMessage += `<b>Tipo:</b> <code>${msgType}</code>\n`;
  finalMessage += `<code>${content}</code>\n\n`;

  // Chinese Block
  finalMessage += `🇨🇳 <b>[中文]</b>\n`;
  finalMessage += `<b>类型:</b> <code>${msgType}</code>\n`;
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
