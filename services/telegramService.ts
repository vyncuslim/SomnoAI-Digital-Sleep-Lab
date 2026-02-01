
/**
 * SOMNO LAB - UNIFIED TELEGRAM GATEWAY v9.0
 * Prevents redundant messages by consolidating EN, ES, ZH into one transmission.
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(new Date()).replace(/\//g, '-') + ' (MYT)';
};

const I18N_DICTS: Record<string, any> = {
  en: { header: '🛡️ <b>GLOBAL ALERT</b>', node: 'NODE', time: 'TIME', type: 'TYPE' },
  es: { header: '🛡️ <b>ALERTA GLOBAL</b>', node: 'NODO', time: 'TIEMPO', type: 'TIPO' },
  zh: { header: '🛡️ <b>全球告警</b>', node: '节点', time: '时间', type: '类型' }
};

const escapeHTML = (str: string): string => {
  if (!str) return 'null';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const mytTime = getMYTTime();
  const nodeName = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
  const msgType = payload.type || 'SYSTEM_SIGNAL';
  const content = escapeHTML(payload.message || payload.error || 'Telemetry Void');

  let finalMessage = `🛰️ <b>SOMNO LAB GLOBAL MESH</b>\n`;
  finalMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // English Block
  finalMessage += `${I18N_DICTS.en.header}\n`;
  finalMessage += `<b>${I18N_DICTS.en.type}:</b> <code>${msgType}</code>\n`;
  finalMessage += `<code>${content}</code>\n\n`;

  // Spanish Block
  finalMessage += `${I18N_DICTS.es.header}\n`;
  finalMessage += `<b>${I18N_DICTS.es.type}:</b> <code>${msgType}</code>\n`;
  finalMessage += `<code>${content}</code>\n\n`;

  // Chinese Block
  finalMessage += `${I18N_DICTS.zh.header}\n`;
  finalMessage += `<b>${I18N_DICTS.zh.type}:</b> <code>${msgType}</code>\n`;
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
