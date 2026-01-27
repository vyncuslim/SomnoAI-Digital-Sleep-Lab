/**
 * SomnoAI Admin Notification Service
 * Routes system alerts and feedback via Supabase Edge Functions to Telegram.
 */

const EDGE_FUNCTION_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/notify_telegram';

export const notifyAdmin = async (payload: string | { error?: string; message?: string; type?: string }) => {
  if (!EDGE_FUNCTION_URL) {
    console.debug("[Telegram Proxy] Notification skipped: Edge URL missing.");
    return;
  }

  let finalMessage = '';
  if (typeof payload === 'string') {
    finalMessage = `🛡️ SOMNO LAB ALERT\n\n${payload}`;
  } else {
    const type = payload.type || 'SYSTEM_EVENT';
    const content = payload.error || payload.message || 'No additional data';
    finalMessage = `🚨 SOMNO LAB ${type}\n\nLOG: ${content}`;
  }

  try {
    // Calling the Supabase Edge Function as requested by the user
    // This removes the need to store the BOT_TOKEN on the client side.
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: finalMessage,
        // Optional: also include 'error' key for compatibility with multiple function versions
        error: typeof payload === 'object' ? payload.error : undefined 
      })
    });

    if (!response.ok) {
      console.error("[Telegram Proxy] Error Response:", await response.text());
    } else {
      console.debug("[Telegram Proxy] Dispatch Successful");
    }
  } catch (err) {
    console.error("[Telegram Proxy] Network Exception:", err);
  }
};
