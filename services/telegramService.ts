
/**
 * SOMNO LAB - DIRECT TELEGRAM GATEWAY v7.3
 * Localized for Malaysia Time (GMT+8)
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

/**
 * Returns current time formatted as Malaysia Standard Time (MYT)
 */
export const getMYTTime = () => {
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

export const I18N_ALERTS: Record<string, Record<string, string>> = {
  en: {
    header: '🛡️ <b>SOMNO LAB NODE ALERT</b>',
    pulse_stable: '✅ <b>PULSE STABLE</b>',
    pulse_anomaly: '🚨 <b>PULSE ANOMALY</b>',
    type: 'TYPE',
    log: 'LOG',
    time: 'TIME (MYT)',
    node: 'NODE',
    latency: 'LATENCY',
    status_ok: 'Operational: All systems nominal.',
    status_err: 'Degraded: Immediate inspection required.'
  },
  zh: {
    header: '🛡️ <b>SOMNO LAB 节点告警</b>',
    pulse_stable: '✅ <b>脉搏稳定</b>',
    pulse_anomaly: '🚨 <b>脉搏异常</b>',
    type: '类型',
    log: '日志',
    time: '时间 (马来西亚)',
    node: '节点',
    latency: '延迟',
    status_ok: '运行中：所有系统状态正常。',
    status_err: '降级：需立即检查异常原因。'
  },
  es: {
    header: '🛡️ <b>ALERTA DE NODO SOMNO LAB</b>',
    pulse_stable: '✅ <b>PULSO ESTABLE</b>',
    pulse_anomaly: '🚨 <b>ANOMALÍA DE PULSO</b>',
    type: 'TIPO',
    log: 'REGISTRO',
    time: 'HORA (MYT)',
    node: 'NODO',
    latency: 'LATENCIA',
    status_ok: 'Operativo: Todos los sistemas nominales.',
    status_err: 'Degradado: Inspección inmediata requerida.'
  }
};

const escapeHTML = (str: string): string => {
  if (!str) return 'null';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const notifyAdmin = async (
    payload: string | { error?: string; message?: string; type?: string; isPulse?: boolean; isSuccess?: boolean; latency?: string },
    lang: 'en' | 'zh' | 'es' = 'en'
) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const dict = I18N_ALERTS[lang] || I18N_ALERTS.en;
  const mytTime = getMYTTime();
  let finalMessage = '';

  if (typeof payload === 'string') {
    finalMessage = `${dict.header}\n\n${escapeHTML(payload)}\n\n<b>${dict.time}:</b> <code>${mytTime}</code>`;
  } else if (payload.isPulse) {
    const header = payload.isSuccess ? dict.pulse_stable : dict.pulse_anomaly;
    const body = payload.isSuccess ? dict.status_ok : escapeHTML(payload.message || 'Unknown protocol void');
    const nodeName = window.location.hostname;
    
    finalMessage = `${header}\n\n<b>${dict.node}:</b> <code>${nodeName}</code>\n<b>${dict.latency}:</b> <code>${payload.latency || '--'}ms</code>\n<b>${dict.log}:</b> <code>${body}</code>\n<b>${dict.time}:</b> <code>${mytTime}</code>`;
  } else {
    const rawType = payload.type || 'SYSTEM_SIGNAL';
    const localizedType = dict[rawType.toLowerCase()] || rawType;
    const content = escapeHTML(payload.error || payload.message || 'Telemetry Null');
    const nodeName = window.location.hostname;
    
    finalMessage = `${dict.header}\n\n<b>${dict.type}:</b> <code>${localizedType}</code>\n<b>${dict.node}:</b> <code>${nodeName}</code>\n<b>${dict.log}:</b> <code>${content}</code>\n<b>${dict.time}:</b> <code>${mytTime}</code>`;
  }

  try {
    const response = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: finalMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    return response.ok;
  } catch (err) {
    return false;
  }
};
