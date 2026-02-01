
/**
 * SOMNO LAB - DIRECT TELEGRAM GATEWAY v5.1
 * Direct Telegram Bot API integration using HTML parsing for robustness.
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

/**
 * Escapes characters that would break Telegram HTML parsing.
 */
const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const notifyAdmin = async (payload: string | { error?: string; message?: string; type?: string }) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn("TELEGRAM_GATEWAY_VOID: Bot credentials or Chat ID missing.");
    return false;
  }

  let finalMessage = '';
  if (typeof payload === 'string') {
    // Escape the payload content to prevent breaking the HTML structure
    finalMessage = `🛡️ <b>SOMNO LAB NODE ALERT</b>\n\n${escapeHTML(payload)}`;
  } else {
    const type = escapeHTML(payload.type || 'SYSTEM_SIGNAL');
    const content = escapeHTML(payload.error || payload.message || 'Telemetry Null');
    finalMessage = `🚨 <b>SOMNO LAB [${type}]</b>\n\n<b>LOG:</b> <code>${content}</code>\n<b>TIME:</b> <code>${new Date().toISOString()}</code>`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: finalMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: controller.signal,
      // @ts-ignore
      keepalive: true 
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({}));
        // Use console.debug here instead of error to avoid potential loops if index.tsx captures this too
        console.debug(`TELEGRAM_GATEWAY_HTTP_ERR: ${response.status}`, errorDetail);
        return false;
    }
    
    return true;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name !== 'AbortError') {
      console.debug(`TELEGRAM_GATEWAY_HANDSHAKE_VOID: ${err.message}`);
    }
    return false;
  }
};
