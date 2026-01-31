
/**
 * SOMNO LAB - TELEGRAM GATEWAY SERVICE v4.2
 * Routes system alerts and audit logs via encrypted Supabase Edge Functions.
 */

const EDGE_FUNCTION_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/notify_telegram';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

export const notifyAdmin = async (payload: string | { error?: string; message?: string; type?: string }) => {
  if (!EDGE_FUNCTION_URL || !SUPABASE_ANON_KEY) {
    console.warn("TELEGRAM_GATEWAY_OFFLINE: Endpoint or credentials void.");
    return false;
  }

  let finalMessage = '';
  if (typeof payload === 'string') {
    finalMessage = `🛡️ SOMNO LAB NODE ALERT\n\n${payload}`;
  } else {
    const type = payload.type || 'SYSTEM_SIGNAL';
    const content = payload.error || payload.message || 'Telemetry Null';
    finalMessage = `🚨 SOMNO LAB [${type}]\n\nLOG: ${content}\nTIME: ${new Date().toISOString()}`;
  }

  // Prevent UI blocking with background transmission and local timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY // Essential for Supabase Edge Functions
      },
      body: JSON.stringify({ message: finalMessage }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
        console.error(`TELEGRAM_GATEWAY_HTTP_ERR: ${response.status}`);
        return false;
    }
    
    return true;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.debug(`TELEGRAM_GATEWAY_HANDSHAKE_VOID: ${err.message || 'ABORTED'}`);
    return false;
  }
};
