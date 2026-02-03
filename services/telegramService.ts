/**
 * SOMNO LAB - INTELLIGENT TELEGRAM GATEWAY v35.0
 * 核心功能：基于指纹的 60 秒强力去重，防止消息洪泛。
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// 指纹锁存储：Map<MessageHash, LastTimestamp>
const fingerprintRegistry = new Map<string, number>();
const FINGERPRINT_COOLDOWN = 60000; // 60 Seconds

const EVENT_MAP: Record<string, { en: string, zh: string, icon: string }> = {
  'USER_LOGIN': { en: '👤 Access Granted', zh: '👤 受试者登录授权', icon: '🔐' },
  'SECURITY_BREACH': { en: '⚔️ SECURITY ATTACK', zh: '⚔️ 检测到越权攻击', icon: '💀' },
  'ADMIN_CONFIG_CHANGE': { en: '⚙️ Admin Override', zh: '⚙️ 管理员更改了设置', icon: '🛠️' },
  'API_SERVICE_FAULT': { en: '🔌 API Key Expired/Fail', zh: '🔌 核心 API 链路断开', icon: '❌' },
  'RUNTIME_ERROR': { en: '🚨 System Exception', zh: '🚨 系统运行异常', icon: '🔴' },
  'USER_FEEDBACK': { en: '💬 User Report', zh: '💬 收到用户意见反馈', icon: '📩' },
  'GA4_SYNC_FAILURE': { en: '📊 Telemetry Sync Failure', zh: '📊 数据同步链路异常', icon: '🟡' },
  'CONSOLE_ERROR_PROXIED': { en: '📜 Terminal Error Log', zh: '📜 终端异常日志回传', icon: '🟠' }
};

export const getMYTTime = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date()) + ' (MYT)';
};

/**
 * 计算简易指纹：基于类型和消息前100个字符
 */
const generateFingerprint = (type: string, message: string) => {
  return `${type}:${message.substring(0, 100).replace(/\s/g, '')}`;
};

export const notifyAdmin = async (payload: any) => {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const msgType = payload.type || 'SYSTEM_SIGNAL';
  const rawDetails = payload.message || payload.error || 'N/A';
  
  // 1. 指纹校验逻辑
  const fingerprint = generateFingerprint(msgType, rawDetails);
  const now = Date.now();
  const lastSent = fingerprintRegistry.get(fingerprint);

  if (lastSent && (now - lastSent < FINGERPRINT_COOLDOWN)) {
    console.debug(`[TG_SHIELD] Dropping duplicate message: ${msgType}`);
    return false;
  }

  // 2. 更新指纹注册表
  fingerprintRegistry.set(fingerprint, now);
  // 定期清理注册表防止内存泄漏 (保留100个指纹)
  if (fingerprintRegistry.size > 100) {
    const firstKey = fingerprintRegistry.keys().next().value;
    if (firstKey) fingerprintRegistry.delete(firstKey);
  }

  const source = payload.source || 'INTERNAL_BRIDGE';
  const mapping = EVENT_MAP[msgType] || { en: msgType, zh: msgType, icon: '📡' };

  const finalMessage = `${mapping.icon} <b>SOMNO LAB ALERT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🇬🇧 <b>[ENGLISH]</b>\n` +
    `<b>Event:</b> <code>${mapping.en}</code>\n` +
    `<b>Log:</b> <code>${rawDetails.substring(0, 300)}</code>\n\n` +
    `🇨🇳 <b>[中文]</b>\n` +
    `<b>类型:</b> <code>${mapping.zh}</code>\n` +
    `<b>日志:</b> <code>${rawDetails.substring(0, 300)}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>ORIGIN:</b> <code>${source}</code>\n` +
    `🛡️ <b>STATUS:</b> <code>GATEWAY_FILTERED</code>`;

  try {
    const res = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: finalMessage, parse_mode: 'HTML' })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};
