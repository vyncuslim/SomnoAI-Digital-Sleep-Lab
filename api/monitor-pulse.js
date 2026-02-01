
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB NEURAL MONITOR v1.6 (Dual-Channel State-Aware Dispatch)
 * Frequency: 1 Minute
 * Logic: Merges EN, ES, ZH. Notifies via Telegram + Email on STATUS CHANGE.
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const ADMIN_EMAIL = 'ongyuze1401@gmail.com';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(new Date()) + ' (MYT)';
};

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.query.key !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    let isHealthy = true;
    let errorLog = "";

    // 1. Diagnostics
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (dbError) { isHealthy = false; errorLog = dbError.message; }

    const currentState = isHealthy ? "STABLE" : "ANOMALY";

    // 2. State-Aware Filter
    const { data: lastStateLog } = await supabase
      .from('audit_logs')
      .select('details')
      .eq('action', 'PULSE_STATE_CHECK')
      .order('created_at', { ascending: false })
      .limit(1);

    const prevState = lastStateLog?.[0]?.details || "UNKNOWN";
    const statusChanged = prevState !== currentState;

    // 3. Dual-Channel Dispatch
    if (statusChanged) {
      const mytTime = getMYTTime();
      const nodeName = req.headers.host || 'Cloud_Edge';
      
      const tgMessage = `🛡️ <b>PULSE STATE SHIFT</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
        `<b>[EN]:</b> System is now <b>${currentState}</b>. ${isHealthy ? 'All nominal.' : errorLog}\n\n` +
        `<b>[ES]:</b> El sistema está ahora <b>${isHealthy ? 'ESTABLE' : 'ANOMALÍA'}</b>.\n\n` +
        `<b>[ZH]:</b> 系统当前状态为 <b>${isHealthy ? '稳定' : '异常'}</b>。\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n<b>TIME:</b> <code>${mytTime}</code>`;

      const emailHtml = `
        <div style="font-family:sans-serif;background-color:#020617;color:#f1f5f9;padding:40px;border-radius:20px;">
          <h2 style="color:#818cf8;">🛡️ Pulse State Shift Detected</h2>
          <p>The neural grid has transitioned to: <b>${currentState}</b></p>
          <hr style="border-color:#1e293b;"/>
          <div style="margin:20px 0;">
            <p><b>[EN]</b> System Status: ${currentState}</p>
            <p><b>[ES]</b> Estado del Sistema: ${isHealthy ? 'ESTABLE' : 'ANOMALÍA'}</p>
            <p><b>[ZH]</b> 系统状态: ${isHealthy ? '稳定' : '异常'}</p>
          </div>
          <p style="font-size:10px;color:#475569;">NODE: ${nodeName} | TIME: ${mytTime}</p>
        </div>
      `;

      // Dispatch Telegram
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
      }).catch(e => console.error("TG Fail", e));

      // Dispatch Email Mirror
      await fetch(`https://${nodeName}/api/send-system-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            to: ADMIN_EMAIL, 
            subject: `🛡️ Lab Security Pulse: ${currentState}`, 
            html: emailHtml,
            secret: process.env.CRON_SECRET
        }),
      }).catch(e => console.error("Email Fail", e));
    }

    // 4. Persistence
    await supabase.from('audit_logs').insert([{
      action: 'PULSE_STATE_CHECK',
      details: currentState,
      level: isHealthy ? 'INFO' : 'CRITICAL'
    }]);

    return res.status(200).json({ state: currentState, notified: statusChanged });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
