
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB NEURAL MONITOR v1.0 (Automated Worker)
 * Frequency: 1 Minute
 * Location: Edge Node
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date()).replace(/\//g, '-') + ' (MYT)';
};

const I18N_ALERTS = {
  en: {
    pulse_stable: '✅ <b>PULSE STABLE</b>',
    pulse_anomaly: '🚨 <b>PULSE ANOMALY</b>',
    node: 'NODE',
    latency: 'LATENCY',
    log: 'LOG',
    time: 'TIME (MYT)',
    status_ok: 'Operational: All systems nominal.',
    status_err: 'Degraded: Check infrastructure logs.'
  },
  es: {
    pulse_stable: '✅ <b>PULSO ESTABLE</b>',
    pulse_anomaly: '🚨 <b>ANOMALÍA DE PULSO</b>',
    node: 'NODO',
    latency: 'LATENCIA',
    log: 'REGISTRO',
    time: 'HORA (MYT)',
    status_ok: 'Operativo: Todos los sistemas nominales.',
    status_err: 'Degradado: Verifique registros.'
  },
  zh: {
    pulse_stable: '✅ <b>脉搏稳定</b>',
    pulse_anomaly: '🚨 <b>脉搏异常</b>',
    node: '节点',
    latency: '延迟',
    log: '日志',
    time: '时间 (马来西亚)',
    status_ok: '运行中：所有系统状态正常。',
    status_err: '降级：需立即检查异常。'
  }
};

const sendTelegram = async (text) => {
  try {
    await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (e) {
    console.error("Telegram bridge failed");
  }
};

export default async function handler(req, res) {
  // 1. Auth check for Cron trigger
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.query.key !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "UNAUTHORIZED_MONITOR" });
  }

  const startTime = Date.now();
  let isSuccess = true;
  let errorLog = "";

  try {
    // Check 1: Database Link
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (dbError) {
        isSuccess = false;
        errorLog = `DB_SEVERED: ${dbError.message}`;
    }

    // Check 2: Environment
    if (!process.env.API_KEY && isSuccess) {
        isSuccess = false;
        errorLog = "ENV_KEYS_MISSING: Neural Bridge API unreachable.";
    }

    const latency = Date.now() - startTime;
    const mytTime = getMYTTime();
    const nodeName = "Somno_Edge_Worker";

    // 2. Dispatch Notifications in 3 languages
    const languages = ['en', 'es', 'zh'];
    for (const lang of languages) {
        const dict = I18N_ALERTS[lang];
        const header = isSuccess ? dict.pulse_stable : dict.pulse_anomaly;
        const body = isSuccess ? dict.status_ok : errorLog;
        
        const message = `${header}\n\n<b>${dict.node}:</b> <code>${nodeName}</code>\n<b>${dict.latency}:</b> <code>${latency}ms</code>\n<b>${dict.log}:</b> <code>${body}</code>\n<b>${dict.time}:</b> <code>${mytTime}</code>`;
        
        await sendTelegram(message);
    }

    // 3. Optional: Audit Log Persistence
    if (!isSuccess) {
        await supabase.from('audit_logs').insert([{
            action: 'AUTOMATED_PULSE_ANOMALY',
            details: errorLog,
            level: 'CRITICAL'
        }]);
    }

    return res.status(200).json({ success: isSuccess, latency, time: mytTime });

  } catch (e) {
    const fallbackMsg = `🚨 <b>MONITOR_CRASH</b>\nLog: ${e.message}`;
    await sendTelegram(fallbackMsg);
    return res.status(500).json({ error: e.message });
  }
}
