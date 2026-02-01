
import { getMYTTime } from './telegramService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v11.0
 * Protocol: Multi-lingual Alert Synthesis (EN/ES/ZH)
 */

const ADMIN_EMAIL = 'ongyuze1401@gmail.com';
const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

const EVENT_MAP: Record<string, { en: string, es: string, zh: string }> = {
  'USER_LOGIN': { en: '👤 Subject Login', es: '👤 Inicio de Sesión', zh: '👤 用户登录' },
  'RUNTIME_ERROR': { en: '🚨 System Exception', es: '🚨 Excepción del Sistema', zh: '🚨 系统运行异常' },
  'USER_SIGNUP': { en: '✨ New Subject node', es: '✨ Nuevo Nodo', zh: '✨ 新受试者注册' },
  'GA4_SYNC_FAILURE': { en: '📊 Telemetry Sync Failure', es: '📊 Fallo de Sincronización', zh: '📊 GA4 同步失败' },
  'SECURITY_BREACH_ATTEMPT': { en: '🛡️ Unauthorized Ingress', es: '🛡️ Ingreso no Autorizado', zh: '🛡️ 未经授权的入侵尝试' },
  'SYSTEM_SIGNAL': { en: '📡 System Signal', es: '📡 Señal del Sistema', zh: '📡 系统信号' }
};

const translateMailContent = (text: string, lang: 'en' | 'es' | 'zh'): string => {
  let result = text;
  
  // 处理 Auth Guard 登录日志
  if (text.includes('Identity detected via Auth Guard:')) {
    const email = text.split(':').pop()?.trim() || 'Unknown';
    if (lang === 'zh') return `检测到受试者身份，已通过安全网关: ${email}`;
    if (lang === 'es') return `Identidad detectada vía Auth Guard: ${email}`;
    if (lang === 'en') return `Identity detected via Auth Guard: ${email}`;
  }

  // 基础身份翻译
  result = result.replace(/\[IDENTITY: STAFF_ADMIN\]/g, lang === 'zh' ? '【管理员权限】' : lang === 'es' ? '【ID: ADMINISTRADOR】' : '【ADMIN PRIVILEGE】');
  result = result.replace(/\[IDENTITY: SUBJECT_USER\]/g, lang === 'zh' ? '【普通受试者】' : lang === 'es' ? '【ID: SUJETO】' : '【SUBJECT IDENTITY】');
  
  return result;
};

export const emailService = {
  sendAdminAlert: async (payload: { type: string; message: string; source?: string; error?: string; isPulse?: boolean }) => {
    const mytTime = getMYTTime();
    const isoTime = new Date().toISOString();
    const nodeIdentity = typeof window !== 'undefined' ? window.location.hostname : 'sleepsomno.com';
    const rawDetails = payload.message || payload.error || 'N/A';
    const eventType = payload.type || 'SYSTEM_SIGNAL';
    
    const mapping = EVENT_MAP[eventType] || EVENT_MAP['SYSTEM_SIGNAL'];
    const headerColor = (eventType.includes('FAIL') || eventType.includes('ERROR')) ? '#ef4444' : '#818cf8';

    // 构造三语核心 HTML
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 30px; border-radius: 24px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #ffffff; margin: 0; font-style: italic;">🛡️ SOMNO LAB 节点告警</h2>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 4px; margin-top: 5px;">Node Alert Protocol</p>
        </div>

        <!-- ENGLISH SECTOR -->
        <div style="background: rgba(99, 102, 241, 0.05); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #818cf8; font-weight: 800; text-transform: uppercase;">🇬🇧 [ENGLISH]</p>
          <div style="font-size: 13px; line-height: 1.6;">
            <b>Type:</b> ${mapping.en}<br/>
            <b>Node:</b> ${nodeIdentity}<br/>
            <b>Log:</b> ${translateMailContent(rawDetails, 'en')}<br/>
            <b>Time:</b> ${isoTime}
          </div>
        </div>

        <!-- ESPAÑOL SECTOR -->
        <div style="background: rgba(99, 102, 241, 0.05); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #818cf8; font-weight: 800; text-transform: uppercase;">🇪🇸 [ESPAÑOL]</p>
          <div style="font-size: 13px; line-height: 1.6;">
            <b>Tipo:</b> ${mapping.es}<br/>
            <b>Nodo:</b> ${nodeIdentity}<br/>
            <b>Registro:</b> ${translateMailContent(rawDetails, 'es')}<br/>
            <b>Tiempo:</b> ${isoTime}
          </div>
        </div>

        <!-- CHINESE SECTOR -->
        <div style="background: rgba(99, 102, 241, 0.05); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #818cf8; font-weight: 800; text-transform: uppercase;">🇨🇳 [中文]</p>
          <div style="font-size: 13px; line-height: 1.6;">
            <b>类型:</b> ${mapping.zh}<br/>
            <b>节点:</b> ${nodeIdentity}<br/>
            <b>日志:</b> ${translateMailContent(rawDetails, 'zh')}<br/>
            <b>时间:</b> ${mytTime}
          </div>
        </div>

        <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
          SOMNO LAB DIGITAL SLEEP LAB • SECURE INFRASTRUCTURE v11.0
        </div>
      </div>
    `;

    return await emailService.sendSystemEmail(ADMIN_EMAIL, `🛡️ Lab Alert: ${mapping.en}`, html);
  },

  sendSystemEmail: async (to: string, subject: string, html: string, secret?: string) => {
    const finalSecret = secret || INTERNAL_LAB_KEY;
    try {
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret: finalSecret }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("[Email_Bridge] Server rejected dispatch:", data);
        return { success: false, error: data.error };
      }
      return { success: true };
    } catch (e: any) {
      console.warn(`[Email_Bridge] Gateway timeout or unreachable: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
};
