
/**
 * SomnoAI Admin Notification Service
 * Routes system alerts and feedback via Supabase Edge Functions to Telegram.
 * Optimized for resilience: prevents blocking UI or auth flows.
 */

const EDGE_FUNCTION_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/notify_telegram';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const notifyAdmin = async (payload: string | { error?: string; message?: string; type?: string }) => {
  if (!EDGE_FUNCTION_URL || !SUPABASE_ANON_KEY) {
    console.warn("TELEGRAM_UPLINK_OFFLINE: Gateway configuration missing.");
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); 

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ message: finalMessage }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
        console.error(`TELEGRAM_UPLINK_FAILURE: HTTP_${response.status}`);
        return false;
    }
    
    return true;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.debug(`TELEGRAM_PULSE_ERROR: ${err.message || 'GATEWAY_TIMEOUT'}`);
    return false;
  }
};
