/**
 * SomnoAI Admin Notification Service
 * Routes system alerts and feedback via Supabase Edge Functions to Telegram.
 */

const EDGE_FUNCTION_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/notify_telegram';

export const notifyAdmin = async (payload: string | { error?: string; message?: string; type?: string }) => {
  if (!EDGE_FUNCTION_URL) {
    console.warn("[Telegram Proxy] Notification skipped: EDGE_FUNCTION_URL is undefined.");
    return false;
  }

  let finalMessage = '';
  if (typeof payload === 'string') {
    finalMessage = `🛡️ SOMNO LAB ALERT\n\n${payload}`;
  } else {
    const type = payload.type || 'SYSTEM_EVENT';
    const content = payload.error || payload.message || 'No additional data';
    finalMessage = `🚨 SOMNO LAB ${type}\n\nLOG: ${content}\nTIME: ${new Date().toLocaleString()}`;
  }

  try {
    console.debug("[Telegram Proxy] Dispatching payload to Edge Function...");
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: finalMessage })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Telegram Proxy] Edge Function Error:", response.status, errorText);
      return false;
    }
    
    console.debug("[Telegram Proxy] Notification sent successfully.");
    return true;
  } catch (err) {
    console.error("[Telegram Proxy] Network exception when calling Edge Function:", err);
    return false;
  }
};
