
/**
 * SOMNO LAB - DIRECT TELEGRAM GATEWAY v5.0
 * 直接接入 Telegram Bot API 执行全域安全告警与节点监控
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

export const notifyAdmin = async (payload: string | { error?: string; message?: string; type?: string }) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn("TELEGRAM_GATEWAY_VOID: Bot credentials or Chat ID missing.");
    return false;
  }

  let finalMessage = '';
  if (typeof payload === 'string') {
    finalMessage = `🛡️ *SOMNO LAB NODE ALERT*\n\n${payload}`;
  } else {
    const type = payload.type || 'SYSTEM_SIGNAL';
    const content = payload.error || payload.message || 'Telemetry Null';
    finalMessage = `🚨 *SOMNO LAB [${type}]*\n\n*LOG:* \`${content}\`\n*TIME:* \`${new Date().toISOString()}\``;
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
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      }),
      signal: controller.signal,
      // @ts-ignore - Ensure beacon-like delivery on page unloads
      keepalive: true 
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({}));
        console.error(`TELEGRAM_GATEWAY_HTTP_ERR: ${response.status}`, errorDetail);
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
