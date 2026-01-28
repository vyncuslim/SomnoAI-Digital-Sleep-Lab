/**
 * SomnoAI Admin Notification Service
 * Routes system alerts and feedback via Supabase Edge Functions to Telegram.
 * Re-engineered for ZERO UI impact.
 */

const EDGE_FUNCTION_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/notify_telegram';

export const notifyAdmin = async (payload: string | { error?: string; message?: string; type?: string }) => {
  if (!EDGE_FUNCTION_URL) return false;

  let finalMessage = '';
  if (typeof payload === 'string') {
    finalMessage = `🛡️ SOMNO LAB ALERT\n\n${payload}`;
  } else {
    const type = payload.type || 'SYSTEM_EVENT';
    const content = payload.error || payload.message || 'No additional data';
    finalMessage = `🚨 SOMNO LAB ${type}\n\nLOG: ${content}\nTIME: ${new Date().toLocaleString()}`;
  }

  // FORCE ASYNC: Do not let the network request block the current execution frame
  return new Promise((resolve) => {
    setTimeout(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: finalMessage }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        resolve(response.ok);
      } catch (err) {
        // Complete silence for the UI thread
        resolve(false);
      }
    }, 0);
  });
};