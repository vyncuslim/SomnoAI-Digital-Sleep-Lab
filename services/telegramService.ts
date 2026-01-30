/**
 * SomnoAI Admin Notification Service
 * Routes system alerts and feedback via Supabase Edge Functions to Telegram.
 * Updated with robust handling for missing deployments (404 NOT_FOUND).
 */

const EDGE_FUNCTION_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/notify_telegram';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

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

    if (response.status === 404) {
      const data = await response.json().catch(() => ({}));
      if (data.code === 'NOT_FOUND' || data.message?.includes('not found')) {
        console.error("[Telegram Service]: CRITICAL_DEPLOYMENT_ERROR. The edge function 'notify_telegram' is not deployed in this Supabase project.");
        return false;
      }
    }

    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    console.error("[Telegram Service Failure]:", err);
    return false;
  }
};