
/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v14.0
 * Focus: EN/ZH Bilingual Protocol for High-Fidelity Diagnostics
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const TRANSLATIONS: Record<string, { en: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Verified', zh: '用户身份验证成功' },
  'USER_SIGNUP': { en: 'New Subject Node', zh: '新受试者注册' },
  'SECURITY_BREACH_ATTEMPT': { en: 'Unauthorized Ingress', zh: '未经授权的入侵尝试' },
  'PULSE_STABLE': { en: 'Neural Handshake Stable', zh: '神经握手稳定' },
  'PULSE_ANOMALY': { en: 'Grid Anomaly Detected', zh: '检测到网格异常' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Sync Failure', zh: '遥测同步失败' },
  'PW_UPDATE_SUCCESS': { en: 'Access Key Rotated', zh: '访问密钥已轮换' }
};

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date()) + ' (MYT)';
};

export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const msgType = payload.type || 'SYSTEM_SIGNAL';
  const mapping = TRANSLATIONS[msgType] || { en: msgType, zh: '系统信号' };
  const mytTime = getMYTTime();
  const nodeName = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
  
  const content = payload.message || payload.error || 'N/A';

  const finalMessage = `🛡️ <b>LAB NOTIFICATION | 实验室通知</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🇬🇧 <b>[ENGLISH]</b>\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>Log:</b> <code>${content}</code>\n\n` +
    `🇨🇳 <b>[中文]</b>\n` +
    `<b>事件:</b> <code>${mapping.zh}</code>\n` +
    `<b>日志:</b> <code>${content}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>NODE:</b> <code>${nodeName}</code>\n` +
    `<b>TIME:</b> <code>${mytTime}</code>`;

  try {
    const res = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: finalMessage,
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};
