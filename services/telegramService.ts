
/**
 * SOMNO LAB - DIRECT TELEGRAM GATEWAY v6.1
 * Multi-language support: English, Chinese, Spanish
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

/**
 * Localization Map for Admin Notifications
 */
const I18N_ALERTS: Record<string, Record<string, string>> = {
  en: {
    header: '🛡️ <b>SOMNO LAB NODE ALERT</b>',
    type: 'TYPE',
    log: 'LOG',
    time: 'TIME',
    node: 'NODE',
    user_login: '👤 USER_LOGIN',
    user_signup: '🆕 USER_SIGNUP',
    critical: '🚨 CRITICAL_EXCEPTION',
    warning: '⚠️ WARNING_SIGNAL',
    admin_role_change: '⚖️ CLEARANCE_SHIFT',
    admin_user_block: '🚫 ACCESS_RESTRICTION',
    admin_manual_sync: '🔄 TELEMETRY_SYNC'
  },
  zh: {
    header: '🛡️ <b>SOMNO LAB 节点告警</b>',
    type: '类型',
    log: '日志',
    time: '时间',
    node: '节点',
    user_login: '👤 用户登录',
    user_signup: '🆕 用户注册',
    critical: '🚨 关键异常',
    warning: '⚠️ 告警信号',
    admin_role_change: '⚖️ 权限变更',
    admin_user_block: '🚫 访问限制',
    admin_manual_sync: '🔄 手动数据同步'
  },
  es: {
    header: '🛡️ <b>ALERTA DE NODO SOMNO LAB</b>',
    type: 'TIPO',
    log: 'REGISTRO',
    time: 'HORA',
    node: 'NODO',
    user_login: '👤 INICIO_SESIÓN',
    user_signup: '🆕 REGISTRO_USUARIO',
    critical: '🚨 EXCEPCIÓN_CRÍTICA',
    warning: '⚠️ SEÑAL_ADVERTENCIA',
    admin_role_change: '⚖️ CAMBIO_DE_PERMISOS',
    admin_user_block: '🚫 RESTRICCIÓN_DE_ACCESO',
    admin_manual_sync: '🔄 SINC_MANUAL'
  }
};

/**
 * Escapes characters that would break Telegram HTML parsing.
 */
const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const notifyAdmin = async (
    payload: string | { error?: string; message?: string; type?: string },
    lang: 'en' | 'zh' | 'es' = 'en'
) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const dictionary = I18N_ALERTS[lang] || I18N_ALERTS.en;
  let finalMessage = '';

  if (typeof payload === 'string') {
    finalMessage = `${dictionary.header}\n\n${escapeHTML(payload)}`;
  } else {
    const rawType = payload.type || 'SYSTEM_SIGNAL';
    const localizedType = dictionary[rawType.toLowerCase()] || rawType;
    const content = escapeHTML(payload.error || payload.message || 'Telemetry Null');
    const nodeName = window.location.hostname;
    
    finalMessage = `${dictionary.header}\n\n<b>${dictionary.type}:</b> <code>${localizedType}</code>\n<b>${dictionary.node}:</b> <code>${nodeName}</code>\n<b>${dictionary.log}:</b> <code>${content}</code>\n<b>${dictionary.time}:</b> <code>${new Date().toISOString()}</code>`;
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
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: controller.signal,
      // @ts-ignore
      keepalive: true 
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    clearTimeout(timeoutId);
    return false;
  }
};
